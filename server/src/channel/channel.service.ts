import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';

import { RedisService } from '@/cache/redis.service';
import { TVideo } from '@/videos/types/video.type';
import { TChannel } from '@/channel/channel.type';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);

  private readonly youtube: youtube_v3.Youtube;

  // 30 minutes
  private readonly CACHE_TTL = 60 * 30;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    const apiKey = this.configService.get<string>('YOUTUBE_API_KEY');

    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY is not configured');
    }

    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  async getChannel(id: string): Promise<TChannel> {
    const channelId = id.trim();

    if (!channelId) {
      throw new BadRequestException('Channel ID is required');
    }

    const cacheKey = this.getCacheKey(channelId);

    // --------------------------------
    // 1. Check Redis
    // --------------------------------
    try {
      const cachedChannel = await this.redisService.get<TChannel>(cacheKey);

      if (cachedChannel) {
        return cachedChannel;
      }
    } catch (error) {
      // Redis failure should not break the application.
      this.logger.warn(
        `Redis GET failed for ${cacheKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    // --------------------------------
    // 2. Fetch channel from YouTube
    // --------------------------------
    const response = await this.youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [channelId],
    });

    const channel = response.data.items?.[0];

    if (!channel) {
      throw new NotFoundException('Channel not found');
    }

    const snippet = channel.snippet;
    const statistics = channel.statistics;
    const uploadsPlaylistId = channel.contentDetails?.relatedPlaylists?.uploads;

    const channelTitle = snippet?.title || '';

    const channelAvatar =
      snippet?.thumbnails?.high?.url ||
      snippet?.thumbnails?.medium?.url ||
      snippet?.thumbnails?.default?.url ||
      '/default-avatar.png';

    // --------------------------------
    // 3. Fetch latest videos
    // --------------------------------
    let videos: TVideo[] = [];

    if (uploadsPlaylistId) {
      const videosResponse = await this.youtube.playlistItems.list({
        part: ['snippet'],
        playlistId: uploadsPlaylistId,
        maxResults: 5,
      });

      videos =
        videosResponse.data.items?.reduce<TVideo[]>((result, item) => {
          const videoId = item.snippet?.resourceId?.videoId;

          if (!videoId) {
            return result;
          }

          result.push({
            id: videoId,
            title: item.snippet?.title || '',
            thumbnailUrl:
              item.snippet?.thumbnails?.medium?.url ||
              item.snippet?.thumbnails?.high?.url ||
              item.snippet?.thumbnails?.default?.url ||
              '',
            publishedAt: item.snippet?.publishedAt || '',
            channel: {
              channelId,
              channelTitle,
              channelAvatar,
            },
          });

          return result;
        }, []) || [];
    }

    // --------------------------------
    // 4. Build final response
    // --------------------------------
    const result: TChannel = {
      channelId,
      channelTitle,
      channelAvatar,
      subscriberCount: statistics?.subscriberCount || '',
      videos,
    };

    // --------------------------------
    // 5. Store in Redis
    // --------------------------------
    try {
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);
    } catch (error) {
      // Don't fail the request if Redis SET fails.
      this.logger.warn(
        `Redis SET failed for ${cacheKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return result;
  }

  private getCacheKey(channelId: string): string {
    return `channel:${channelId}`;
  }
}
