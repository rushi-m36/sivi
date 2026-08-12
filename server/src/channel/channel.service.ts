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

    // 1. Check Redis
    try {
      const cachedChannel = await this.redisService.get<TChannel>(cacheKey);

      if (cachedChannel) {
        return cachedChannel;
      }
    } catch (error) {
      this.logger.warn(
        `Redis GET failed for ${cacheKey}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    // 2. Fetch channel from centralized YoutubeService
    const channel = await this.youtubeService.getChannel(channelId);

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

    // 3. Fetch latest videos
    let videos: TVideo[] = [];

    if (uploadsPlaylistId) {
      const videosResponse = await this.youtubeService.getPlaylistItems(
        uploadsPlaylistId,
        50,
      );

      const playlistItems = videosResponse.data.items || [];

      // Extract video IDs
      const videoIds = playlistItems
        .map((item) => item.snippet?.resourceId?.videoId)
        .filter((id): id is string => Boolean(id));

      if (videoIds.length > 0) {
        // Fetch video details including duration and statistics
        const videoDetailsResponse =
          await this.youtubeService.getVideos(videoIds);

        const videoDetails = videoDetailsResponse?.data.items || [];

        // Create lookup map: videoId -> video details
        const videoDetailsMap = new Map(
          videoDetails.map((video) => [
            video.id,
            {
              duration: video.contentDetails?.duration || '',
              viewCount: video.statistics?.viewCount || null,
              likeCount: video.statistics?.likeCount || null,
              commentCount: video.statistics?.commentCount || null,
            },
          ]),
        );

        videos = playlistItems.reduce<TVideo[]>((result, item) => {
          const videoId = item.snippet?.resourceId?.videoId;

          if (!videoId) {
            return result;
          }

          const details = videoDetailsMap.get(videoId);

          result.push({
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

          return result;
        }, []);
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

    // 5. Cache
    try {
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);
    } catch (error) {
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
