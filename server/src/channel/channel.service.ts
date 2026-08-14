import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';

import { RedisService } from '@/cache/redis.service';
import { YoutubeService } from '@/youtube/youtube.service';
import { TVideo } from '@/videos/types/video.type';
import { TChannel } from '@/channel/channel.type';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  private readonly CACHE_TTL = 60 * 30;

  /**
   * Prevents multiple identical requests from simultaneously
   * hitting Redis/YouTube when the cache is cold.
   */
  private readonly pendingRequests = new Map<string, Promise<TChannel>>();

  constructor(
    private readonly redisService: RedisService,
    private readonly youtubeService: YoutubeService,
  ) {}

  async getChannel(id: string): Promise<TChannel> {
    const channelId = id.trim();

    if (!channelId) {
      throw new BadRequestException('Channel ID is required');
    }

    const cacheKey = this.getCacheKey(channelId);

    // Prevent duplicate concurrent requests for the same channel.
    const pendingRequest = this.pendingRequests.get(cacheKey);

    if (pendingRequest) {
      return pendingRequest;
    }

    const request = this.fetchChannel(channelId, cacheKey);

    this.pendingRequests.set(cacheKey, request);

    try {
      return await request;
    } finally {
      this.pendingRequests.delete(cacheKey);
    }
  }

  private async fetchChannel(
    channelId: string,
    cacheKey: string,
  ): Promise<TChannel> {
    // 1. Redis cache
    try {
      const cachedChannel = await this.redisService.get<TChannel>(cacheKey);

      if (cachedChannel) {
        return cachedChannel;
      }
    } catch (error) {
      this.logger.warn(
        `Redis GET failed for ${cacheKey}: ${this.getErrorMessage(error)}`,
      );
    }

    // 2. Fetch channel metadata
    const channel = await this.youtubeService.getChannel(channelId);

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const snippet = channel.snippet;
    const statistics = channel.statistics;

    const channelTitle = snippet?.title || '';

    const channelAvatar =
      snippet?.thumbnails?.high?.url ||
      snippet?.thumbnails?.medium?.url ||
      snippet?.thumbnails?.default?.url ||
      '/default-avatar.png';

    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

    let videos: TVideo[] = [];

    // 3. Fetch latest videos
    if (uploadsPlaylistId) {
      const videosResponse = await this.youtubeService.getPlaylistItems(
        uploadsPlaylistId,
        50,
      );

      const playlistItems = videosResponse.data.items || [];

      if (playlistItems.length > 0) {
        const videoIds: string[] = [];

        for (const item of playlistItems) {
          const videoId = item.snippet?.resourceId?.videoId;

          if (videoId) {
            videoIds.push(videoId);
          }
        }

        if (videoIds.length > 0) {
          const videoDetailsResponse =
            await this.youtubeService.getVideos(videoIds);

          const videoDetails = videoDetailsResponse?.data.items || [];

          const videoDetailsMap = new Map<
            string,
            {
              duration: string;
              viewCount: string | null;
              likeCount: string | null;
              commentCount: string | null;
            }
          >();

          for (const video of videoDetails) {
            if (!video.id) {
              continue;
            }

            videoDetailsMap.set(video.id, {
              duration: video.contentDetails?.duration || '',
              viewCount: video.statistics?.viewCount || null,
              likeCount: video.statistics?.likeCount || null,
              commentCount: video.statistics?.commentCount || null,
            });
          }

          videos = [];

          for (const item of playlistItems) {
            const videoId = item.snippet?.resourceId?.videoId;

            if (!videoId) {
              continue;
            }

            const details = videoDetailsMap.get(videoId);

            videos.push({
              id: videoId,
              title: item.snippet?.title || '',
              thumbnailUrl:
                item.snippet?.thumbnails?.high?.url ||
                item.snippet?.thumbnails?.medium?.url ||
                item.snippet?.thumbnails?.default?.url ||
                '',
              publishedAt: item.snippet?.publishedAt || '',
              duration: details?.duration || '',
              viewCount: details?.viewCount || null,
              likeCount: details?.likeCount || null,
              channel: {
                channelId,
                channelTitle,
                channelAvatar,
              },
            });
          }
        }
      }
    }

    // 4. Build response
    const result: TChannel = {
      channelId,
      channelTitle,
      channelAvatar,
      subscriberCount: statistics?.subscriberCount || '',
      videos,
    };

    // 5. Cache complete channel response
    try {
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);
    } catch (error) {
      this.logger.warn(
        `Redis SET failed for ${cacheKey}: ${this.getErrorMessage(error)}`,
      );
    }

    return result;
  }

  private getCacheKey(channelId: string): string {
    return `channel:${channelId}`;
  }

  private getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : String(error);
  }
}
