import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

import { TVideo, TSearchResult } from './types/video.type';
import { TComment } from './types/comment.type';
import { RedisService } from '../cache/redis.service';
import { YoutubeService } from '../youtube/youtube.service';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly youtubeService: YoutubeService,
  ) {}

  async searchVideos(query: string, maxResults): Promise<TSearchResult> {
    try {
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        return {
          videos: [],
          totalResults: 0,
        };
      }

      const cacheKey = `youtube:search:${normalizedQuery}:${maxResults}`;

      const cached = await this.redisService.get<TSearchResult>(cacheKey);

      if (cached) {
        return cached;
      }

      const searchResponse = await this.youtubeService.searchVideos(
        normalizedQuery,
        maxResults,
      );

      const items = searchResponse.data.items || [];

      const videoIds = items
        .map((item) => item.id?.videoId)
        .filter((id): id is string => Boolean(id));

      const channelIds = Array.from(
        new Set(
          items
            .map((item) => item.snippet?.channelId)
            .filter((id): id is string => Boolean(id)),
        ),
      );

      const [detailsResponse, channelResponse] = await Promise.all([
        this.youtubeService.getVideos(videoIds),
        this.youtubeService.getChannels(channelIds),
      ]);

      const videosDetailsMap = new Map<string, any>();

      detailsResponse?.data.items?.forEach((item) => {
        if (item.id) {
          videosDetailsMap.set(item.id, item);
        }
      });

      const channelAvatarMap = new Map<string, string>();

      channelResponse?.data.items?.forEach((channel) => {
        if (channel.id) {
          channelAvatarMap.set(
            channel.id,
            channel.snippet?.thumbnails?.default?.url ||
              channel.snippet?.thumbnails?.medium?.url ||
              channel.snippet?.thumbnails?.high?.url ||
              '/default-avatar.png',
          );
        }
      });

      const videos: TVideo[] = items
        .map((item): TVideo | null => {
          const videoId = item.id?.videoId;

          if (!videoId) {
            return null;
          }

          const details = videosDetailsMap.get(videoId);
          const snippet = item.snippet;

          const channelId =
            snippet?.channelId || details?.snippet?.channelId || '';

          return {
            id: videoId,

            title: snippet?.title || details?.snippet?.title || '',

            description:
              snippet?.description || details?.snippet?.description || '',

            thumbnailUrl:
              snippet?.thumbnails?.high?.url ||
              snippet?.thumbnails?.medium?.url ||
              snippet?.thumbnails?.default?.url ||
              details?.snippet?.thumbnails?.high?.url ||
              '',

            channel: {
              channelId,

              channelTitle:
                snippet?.channelTitle || details?.snippet?.channelTitle || '',

              channelAvatar:
                channelAvatarMap.get(channelId) || '/default-avatar.png',
            },

            publishedAt:
              snippet?.publishedAt || details?.snippet?.publishedAt || '',

            duration: details?.contentDetails?.duration,

            viewCount: details?.statistics?.viewCount,

            likeCount: details?.statistics?.likeCount,
          };
        })
        .filter((video): video is TVideo => video !== null);

      const result: TSearchResult = {
        videos,
        totalResults: searchResponse.data.pageInfo?.totalResults || 0,
      };

      await this.redisService.set(cacheKey, result, 60 * 10);

      return result;
    } catch (error: any) {
      this.logger.error(
        `Error searching YouTube videos: ${error?.message || error}`,
        error?.stack,
      );

      const details =
        error?.response?.data?.error?.message ||
        error?.message ||
        String(error);

      throw new InternalServerErrorException(`YouTube API Error: ${details}`);
    }
  }

  async getVideoDetails(id: string): Promise<TVideo> {
    try {
      const cacheKey = `youtube:video:${id}`;

      const cached = await this.redisService.get<TVideo>(cacheKey);

      if (cached) {
        return cached;
      }

      const item = await this.youtubeService.getVideo(id);

      if (!item) {
        throw new NotFoundException(`Video with ID ${id} not found`);
      }

      const channelId = item.snippet?.channelId;

      const [channel, comments] = await Promise.all([
        channelId
          ? this.youtubeService.getChannel(channelId)
          : Promise.resolve(null),

        this.getVideoComments(id),
      ]);

      const result: TVideo = {
        id,

        title: item.snippet?.title || '',

        description: item.snippet?.description || '',

        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          '',

        channel: {
          channelId: channelId || '',

          channelTitle: item.snippet?.channelTitle || '',

          channelAvatar:
            channel?.snippet?.thumbnails?.default?.url ||
            channel?.snippet?.thumbnails?.medium?.url ||
            channel?.snippet?.thumbnails?.high?.url ||
            '/default-avatar.png',

          subscriberCount: channel?.statistics?.subscriberCount,
        },

        publishedAt: item.snippet?.publishedAt || '',

        duration: item.contentDetails?.duration,

        viewCount: item.statistics?.viewCount,

        likeCount: item.statistics?.likeCount,

        commentCount: item.statistics?.commentCount
          ? Number(item.statistics.commentCount)
          : undefined,

        comments,
      };

      await this.redisService.set(cacheKey, result, 60 * 30);

      return result;
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

      this.logger.error(
        `Error fetching YouTube video details: ${error?.message || error}`,
        error?.stack,
      );

      const details =
        error?.response?.data?.error?.message ||
        error?.message ||
        String(error);

      throw new InternalServerErrorException(`YouTube API Error: ${details}`);
    }
  }

  async getVideoComments(videoId: string): Promise<TComment[]> {
    try {
      const cacheKey = `youtube:comments:${videoId}`;

      const cached = await this.redisService.get<TComment[]>(cacheKey);

      if (cached) {
        return cached;
      }

      const commentsResponse = await this.youtubeService.getComments(
        videoId,
        10,
      );

      const comments: TComment[] =
        commentsResponse.data.items?.map((item) => {
          const comment = item.snippet?.topLevelComment?.snippet;

          return {
            id: item.id ?? '',
            author: comment?.authorDisplayName ?? '',
            authorAvatar: comment?.authorProfileImageUrl ?? '',
            text: comment?.textDisplay ?? '',
            publishedAt: comment?.publishedAt ?? '',
            likeCount: comment?.likeCount ?? 0,
          };
        }) ?? [];

      await this.redisService.set(cacheKey, comments, 60 * 5);

      return comments;
    } catch (error: any) {
      this.logger.error(
        `Error fetching comments for video ${videoId}: ${
          error?.message || error
        }`,
        error?.stack,
      );

      return [];
    }
  }
}
