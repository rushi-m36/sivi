import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';

import { TVideo, TSearchResult } from './types/video.type';
import { TComment } from './types/comment.type';
import { RedisService } from '../cache/redis.service';

@Injectable()
export class VideoService {
  private readonly logger = new Logger(VideoService.name);
  private readonly youtube: youtube_v3.Youtube;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    const apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';

    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  async searchVideos(query: string, maxResults = 10): Promise<TSearchResult> {
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

      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: normalizedQuery,
        type: ['video'],
        maxResults,
      });

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

      // Run both requests simultaneously
      const [detailsResponse, channelResponse] = await Promise.all([
        videoIds.length > 0
          ? this.youtube.videos.list({
              part: ['snippet', 'contentDetails', 'statistics'],
              id: videoIds,
            })
          : Promise.resolve(null),

        channelIds.length > 0
          ? this.youtube.channels.list({
              part: ['snippet'],
              id: channelIds,
            })
          : Promise.resolve(null),
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

      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [id],
      });

      const item = response.data.items?.[0];

      if (!item) {
        throw new NotFoundException(`Video with ID ${id} not found`);
      }

      const channelId = item.snippet?.channelId;

      const [channelResponse, comments] = await Promise.all([
        channelId
          ? this.youtube.channels.list({
              part: ['snippet', 'statistics'],
              id: [channelId],
            })
          : Promise.resolve(null),

        this.getVideoComments(id),
      ]);

      const channel = channelResponse?.data?.items?.[0];

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

      const commentsResponse = await this.youtube.commentThreads.list({
        part: ['snippet'],
        videoId,
        maxResults: 20,
      });

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
