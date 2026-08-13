import { Injectable, NotFoundException } from '@nestjs/common';

import { YoutubeService } from '../youtube/youtube.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../cache/redis.service';

import { UpdateHistoryDto } from './history.dto';
import { THistoryVideo } from './history-video.type';

@Injectable()
export class HistoryService {
  private readonly HISTORY_CACHE_TTL = 60;

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

    // Invalidate both caches.
    await Promise.all([
      this.redis.delete(this.getHistoryCacheKey(userId)),
      this.redis.delete(this.getProgressCacheKey(userId, videoId)),
    ]);

    return history;
  }

  async getProgress(userId: string, videoId: string) {
    const cacheKey = this.getProgressCacheKey(userId, videoId);

    const cached = await this.redis.get(cacheKey);

    if (cached) {
      return cached;
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
      await this.redis.set(cacheKey, history, this.HISTORY_CACHE_TTL);
    }

    return history;
  }

  async getHistory(userId: string): Promise<THistoryVideo[]> {
    const cacheKey = this.getHistoryCacheKey(userId);

    // 1. Check Redis.
    const cached = await this.redis.get<THistoryVideo[]>(cacheKey);

    if (cached) {
      return cached;
    }

    // 2. Get history from PostgreSQL.
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

    // 3. Get YouTube video IDs.
    const videoIds = history.map((item) => item.videoId);

    // 4. Get video information from YouTube.
    const response = await this.youtubeService.getVideos(videoIds);

    const videos = response?.data.items ?? [];

    const videoMap = new Map(
      videos.map((video) => [
        video.id,
        {
          id: video.id!,
          title: video.snippet?.title ?? '',

          description: video.snippet?.description ?? '',

          thumbnailUrl:
            video.snippet?.thumbnails?.high?.url ??
            video.snippet?.thumbnails?.medium?.url ??
            video.snippet?.thumbnails?.default?.url ??
            '',

          channel: {
            channelId: video.snippet?.channelId ?? '',

            channelTitle: video.snippet?.channelTitle ?? '',

            channelAvatar: '',
            subscriberCount: null,
          },

          publishedAt: video.snippet?.publishedAt ?? '',

          duration: video.contentDetails?.duration ?? null,

          viewCount: video.statistics?.viewCount ?? null,

          likeCount: video.statistics?.likeCount ?? null,

          commentCount: video.statistics?.commentCount
            ? Number(video.statistics.commentCount)
            : undefined,
        },
      ]),
    );

    // 5. Combine PostgreSQL history + YouTube data.
    const result = history.reduce<THistoryVideo[]>((result, item) => {
      const video = videoMap.get(item.videoId);

      if (!video) {
        return result;
      }

      result.push({
        video,

        watchedSeconds: item.watchedSeconds,

        durationSeconds: item.durationSeconds,

        completed: item.completed,

        lastWatchedAt: item.lastWatchedAt,
      });

      return result;
    }, []);

    // 6. Cache final response.
    await this.redis.set(cacheKey, result, this.HISTORY_CACHE_TTL);

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

    // Invalidate caches.
    await Promise.all([
      this.redis.delete(this.getHistoryCacheKey(userId)),

      this.redis.delete(this.getProgressCacheKey(userId, videoId)),
    ]);

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

    // Clear user's history cache.
    await this.redis.delete(this.getHistoryCacheKey(userId));

    return {
      message: 'Watch history cleared',
      deletedCount: result.count,
    };
  }
}
