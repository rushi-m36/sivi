import { Injectable, Logger, NotFoundException } from '@nestjs/common';

import { YoutubeService } from '../youtube/youtube.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../cache/redis.service';

import { UpdateHistoryDto } from './history.dto';
import { THistoryVideo } from './history-video.type';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  private readonly HISTORY_CACHE_TTL = 60;

  /**
   * Prevents multiple simultaneous requests for the same user's history
   * from hitting PostgreSQL and YouTube at the same time.
   */
  private readonly pendingHistoryRequests = new Map<
    string,
    Promise<THistoryVideo[]>
  >();

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly youtubeService: YoutubeService,
  ) {}

  private getHistoryCacheKey(userId: string): string {
    return `history:user:${userId}`;
  }

  private getProgressCacheKey(userId: string, videoId: string): string {
    return `history:user:${userId}:video:${videoId}`;
  }

  async updateProgress(userId: string, videoId: string, dto: UpdateHistoryDto) {
    const completed =
      dto.completed ??
      (dto.durationSeconds
        ? dto.watchedSeconds >= dto.durationSeconds * 0.95
        : false);

    const history = await this.prisma.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },

      create: {
        userId,
        videoId,
        watchedSeconds: dto.watchedSeconds,
        durationSeconds: dto.durationSeconds,
        completed,
        lastWatchedAt: new Date(),
      },

      update: {
        watchedSeconds: dto.watchedSeconds,
        durationSeconds: dto.durationSeconds,
        completed,
        lastWatchedAt: new Date(),
      },
    });

    await this.invalidateHistoryCaches(userId, videoId);

    return history;
  }

  async getProgress(userId: string, videoId: string) {
    const cacheKey = this.getProgressCacheKey(userId, videoId);

    try {
      const cached = await this.redis.get(cacheKey);

      if (cached) {
        return cached;
      }
    } catch (error) {
      this.logRedisError('GET', cacheKey, error);
    }

    const history = await this.prisma.watchHistory.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (history) {
      try {
        await this.redis.set(cacheKey, history, this.HISTORY_CACHE_TTL);
      } catch (error) {
        this.logRedisError('SET', cacheKey, error);
      }
    }

    return history;
  }

  async getHistory(userId: string): Promise<THistoryVideo[]> {
    const cacheKey = this.getHistoryCacheKey(userId);

    const pendingRequest = this.pendingHistoryRequests.get(userId);

    if (pendingRequest) {
      return pendingRequest;
    }

    const request = this.fetchHistory(userId, cacheKey);

    this.pendingHistoryRequests.set(userId, request);

    try {
      return await request;
    } finally {
      this.pendingHistoryRequests.delete(userId);
    }
  }

  private async fetchHistory(
    userId: string,
    cacheKey: string,
  ): Promise<THistoryVideo[]> {
    // 1. Redis cache
    try {
      const cached = await this.redis.get<THistoryVideo[]>(cacheKey);

      if (cached) {
        return cached;
      }
    } catch (error) {
      this.logRedisError('GET', cacheKey, error);
    }

    // 2. PostgreSQL
    const history = await this.prisma.watchHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        lastWatchedAt: 'desc',
      },
    });

    if (history.length === 0) {
      return [];
    }

    // 3. Extract video IDs
    const videoIds = history.map((item) => item.videoId);

    // 4. Fetch video information
    const response = await this.youtubeService.getVideos(videoIds);

    const videos = response?.data.items ?? [];

    if (videos.length === 0) {
      return [];
    }

    // 5. Extract unique channel IDs
    const channelIds = [
      ...new Set(
        videos
          .map((video) => video.snippet?.channelId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    // 6. Fetch channels only when there are channels to fetch
    const channels =
      channelIds.length > 0
        ? ((await this.youtubeService.getChannels(channelIds))?.data.items ??
          [])
        : [];

    // 7. Create channel lookup map
    const channelMap = new Map<
      string,
      {
        channelAvatar: string;
        subscriberCount: number | null;
      }
    >();

    for (const channel of channels) {
      if (!channel.id) {
        continue;
      }

      channelMap.set(channel.id, {
        channelAvatar:
          channel.snippet?.thumbnails?.high?.url ??
          channel.snippet?.thumbnails?.medium?.url ??
          channel.snippet?.thumbnails?.default?.url ??
          '',

        subscriberCount: channel.statistics?.subscriberCount
          ? Number(channel.statistics.subscriberCount)
          : null,
      });
    }

    // 8. Create video lookup map
    const videoMap = new Map<string, THistoryVideo['video']>();

    for (const video of videos) {
      if (!video.id) {
        continue;
      }

      const channelId = video.snippet?.channelId ?? '';
      const channel = channelMap.get(channelId);

      videoMap.set(video.id, {
        id: video.id,

        title: video.snippet?.title ?? '',

        description: video.snippet?.description ?? '',

        thumbnailUrl:
          video.snippet?.thumbnails?.high?.url ??
          video.snippet?.thumbnails?.medium?.url ??
          video.snippet?.thumbnails?.default?.url ??
          '',

        channel: {
          channelId,

          channelTitle: video.snippet?.channelTitle ?? '',

          channelAvatar: channel?.channelAvatar ?? '',

          subscriberCount: channel?.subscriberCount ?? null,
        },

        publishedAt: video.snippet?.publishedAt ?? '',

        duration: video.contentDetails?.duration ?? null,

        viewCount: video.statistics?.viewCount ?? null,

        likeCount: video.statistics?.likeCount ?? null,

        commentCount: video.statistics?.commentCount
          ? Number(video.statistics.commentCount)
          : undefined,
      });
    }

    // 9. Combine PostgreSQL history with YouTube data
    const result: THistoryVideo[] = [];

    for (const item of history) {
      const video = videoMap.get(item.videoId);

      if (!video) {
        continue;
      }

      result.push({
        video,

        watchedSeconds: item.watchedSeconds,

        durationSeconds: item.durationSeconds,

        completed: item.completed,

        lastWatchedAt: item.lastWatchedAt,
      });
    }

    // 10. Cache final response
    try {
      await this.redis.set(cacheKey, result, this.HISTORY_CACHE_TTL);
    } catch (error) {
      this.logRedisError('SET', cacheKey, error);
    }

    return result;
  }

  async deleteHistory(userId: string, videoId: string) {
    const history = await this.prisma.watchHistory.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (!history) {
      throw new NotFoundException('Watch history not found');
    }

    await this.prisma.watchHistory.delete({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    await this.invalidateHistoryCaches(userId, videoId);

    return {
      message: 'Watch history deleted',
    };
  }

  async clearHistory(userId: string) {
    const result = await this.prisma.watchHistory.deleteMany({
      where: {
        userId,
      },
    });

    await this.deleteCache(this.getHistoryCacheKey(userId));

    return {
      message: 'Watch history cleared',
      deletedCount: result.count,
    };
  }

  private async invalidateHistoryCaches(
    userId: string,
    videoId: string,
  ): Promise<void> {
    await Promise.all([
      this.deleteCache(this.getHistoryCacheKey(userId)),
      this.deleteCache(this.getProgressCacheKey(userId, videoId)),
    ]);
  }

  private async deleteCache(key: string): Promise<void> {
    try {
      await this.redis.delete(key);
    } catch (error) {
      this.logRedisError('DELETE', key, error);
    }
  }

  private logRedisError(operation: string, key: string, error: unknown): void {
    this.logger.warn(
      `Redis ${operation} failed for ${key}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
