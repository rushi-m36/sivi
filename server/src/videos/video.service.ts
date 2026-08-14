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

  private readonly SEARCH_CACHE_TTL = 60 * 10; // 10 minutes
  private readonly VIDEO_CACHE_TTL = 60 * 30; // 30 minutes
  private readonly COMMENTS_CACHE_TTL = 60 * 5; // 5 minutes

  // Prevent duplicate concurrent requests for the same resource.
  private readonly inFlightSearches = new Map<string, Promise<TSearchResult>>();

  private readonly inFlightVideos = new Map<string, Promise<TVideo>>();

  private readonly inFlightComments = new Map<string, Promise<TComment[]>>();

  constructor(
    private readonly redisService: RedisService,
    private readonly youtubeService: YoutubeService,
  ) {}

  async searchVideos(
    query: string,
    maxResults: number,
  ): Promise<TSearchResult> {
    try {
      const normalizedQuery = query.trim().toLowerCase();

      if (!normalizedQuery) {
        return {
          videos: [],
          totalResults: 0,
        };
      }

      const cacheKey = this.buildSearchCacheKey(normalizedQuery, maxResults);

      // 1. Redis cache
      const cached = await this.redisService.get<TSearchResult>(cacheKey);

      if (cached) {
        return cached;
      }

      // 2. Reuse an already-running identical request
      const existingRequest = this.inFlightSearches.get(cacheKey);

      if (existingRequest) {
        return existingRequest;
      }

      const request = this.fetchAndCacheSearchResults(
        normalizedQuery,
        maxResults,
        cacheKey,
      );

      this.inFlightSearches.set(cacheKey, request);

      try {
        return await request;
      } finally {
        this.inFlightSearches.delete(cacheKey);
      }
    } catch (error: any) {
      if (error instanceof HttpException) {
        throw error;
      }

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

  private async fetchAndCacheSearchResults(
    normalizedQuery: string,
    maxResults: number,
    cacheKey: string,
  ): Promise<TSearchResult> {
    const searchResponse = await this.youtubeService.searchVideos(
      normalizedQuery,
      maxResults,
    );

    const items = searchResponse.data.items ?? [];

    if (items.length === 0) {
      const emptyResult: TSearchResult = {
        videos: [],
        totalResults: searchResponse.data.pageInfo?.totalResults ?? 0,
      };

      await this.redisService.set(cacheKey, emptyResult, this.SEARCH_CACHE_TTL);

      return emptyResult;
    }

    const videoIds = items
      .map((item) => item.id?.videoId)
      .filter((id): id is string => Boolean(id));

    const channelIds = [
      ...new Set(
        items
          .map((item) => item.snippet?.channelId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    /*
     * Only make the API requests that are actually needed.
     */
    const [detailsResponse, channelResponse] = await Promise.all([
      videoIds.length > 0
        ? this.youtubeService.getVideos(videoIds)
        : Promise.resolve(null),

      channelIds.length > 0
        ? this.youtubeService.getChannels(channelIds)
        : Promise.resolve(null),
    ]);

    const videosDetailsMap = new Map(
      (detailsResponse?.data.items ?? [])
        .filter((item) => Boolean(item.id))
        .map((item) => [item.id!, item] as const),
    );

    const channelAvatarMap = new Map<string, string>();

    for (const channel of channelResponse?.data.items ?? []) {
      if (!channel.id) {
        continue;
      }

      channelAvatarMap.set(
        channel.id,
        channel.snippet?.thumbnails?.default?.url ||
          channel.snippet?.thumbnails?.medium?.url ||
          channel.snippet?.thumbnails?.high?.url ||
          '/default-avatar.png',
      );
    }

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
      totalResults: searchResponse.data.pageInfo?.totalResults ?? 0,
    };

    await this.redisService.set(cacheKey, result, this.SEARCH_CACHE_TTL);

    return result;
  }

  async getVideoDetails(id: string): Promise<TVideo> {
    try {
      const normalizedId = id.trim();

      if (!normalizedId) {
        throw new NotFoundException('Video ID is required');
      }

      const cacheKey = this.buildVideoCacheKey(normalizedId);

      // 1. Redis cache
      const cached = await this.redisService.get<TVideo>(cacheKey);

      if (cached) {
        return cached;
      }

      // 2. Reuse an already-running request
      const existingRequest = this.inFlightVideos.get(normalizedId);

      if (existingRequest) {
        return existingRequest;
      }

      const request = this.fetchAndCacheVideo(normalizedId, cacheKey);

      this.inFlightVideos.set(normalizedId, request);

      try {
        return await request;
      } finally {
        this.inFlightVideos.delete(normalizedId);
      }
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

  private async fetchAndCacheVideo(
    id: string,
    cacheKey: string,
  ): Promise<TVideo> {
    const item = await this.youtubeService.getVideo(id);

    if (!item) {
      throw new NotFoundException(`Video with ID ${id} not found`);
    }

    const channelId = item.snippet?.channelId;

    /*
     * Channel and comments are independent.
     * Fetch them concurrently.
     */
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

    await this.redisService.set(cacheKey, result, this.VIDEO_CACHE_TTL);

    return result;
  }

  async getVideoComments(videoId: string): Promise<TComment[]> {
    try {
      const normalizedVideoId = videoId.trim();

      if (!normalizedVideoId) {
        return [];
      }

      const cacheKey = this.buildCommentsCacheKey(normalizedVideoId);

      // 1. Redis cache
      const cached = await this.redisService.get<TComment[]>(cacheKey);

      if (cached) {
        return cached;
      }

      // 2. Reuse an already-running request
      const existingRequest = this.inFlightComments.get(normalizedVideoId);

      if (existingRequest) {
        return existingRequest;
      }

      const request = this.fetchAndCacheComments(normalizedVideoId, cacheKey);

      this.inFlightComments.set(normalizedVideoId, request);

      try {
        return await request;
      } finally {
        this.inFlightComments.delete(normalizedVideoId);
      }
    } catch (error: any) {
      this.logger.error(
        `Error fetching comments for video ${videoId}: ${
          error?.message || error
        }`,
        error?.stack,
      );

      // Existing behavior: comments failing should not break video details.
      return [];
    }
  }

  private async fetchAndCacheComments(
    videoId: string,
    cacheKey: string,
  ): Promise<TComment[]> {
    const commentsResponse = await this.youtubeService.getComments(videoId, 10);

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

    await this.redisService.set(cacheKey, comments, this.COMMENTS_CACHE_TTL);

    return comments;
  }

  private buildSearchCacheKey(query: string, maxResults: number): string {
    return `youtube:search:${query}:${maxResults}`;
  }

  private buildVideoCacheKey(id: string): string {
    return `youtube:video:${id}`;
  }

  private buildCommentsCacheKey(videoId: string): string {
    return `youtube:comments:${videoId}`;
  }
}
