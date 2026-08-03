import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { IComment } from './interfaces/comment.server.interface';
import { IVideo, ISearchResult } from './interfaces/video.server.interface';

@Injectable()
export class YoutubeService {
  private readonly logger = new Logger(YoutubeService.name);
  private readonly youtube;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  async searchVideos(
    query: string,
    pageToken?: string,
    maxResults = 10,
  ): Promise<ISearchResult> {
    try {
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        q: query,
        type: ['video'],
        maxResults,
        pageToken,
      });

      const items = searchResponse.data.items || [];
      const videoIds = items
        .map((item) => item.id?.videoId)
        .filter((id): id is string => !!id);

      const videosDetailsMap = new Map<string, any>();
      if (videoIds.length > 0) {
        const detailsResponse = await this.youtube.videos.list({
          part: ['snippet', 'contentDetails', 'statistics'],
          id: videoIds,
        });
        detailsResponse.data.items?.forEach((item) => {
          if (item.id) {
            videosDetailsMap.set(item.id, item);
          }
        });
      }

      const channelIds = Array.from(
        new Set(
          items
            .map((item) => item.snippet?.channelId)
            .filter((id): id is string => !!id),
        ),
      );

      const channelAvatarMap = new Map<string, string>();
      if (channelIds.length > 0) {
        const channelResponse = await this.youtube.channels.list({
          part: ['snippet'],
          id: channelIds,
        });

        channelResponse.data.items?.forEach((channel) => {
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
      }
      const videos: IVideo[] = items
        .map((item) => {
          const videoId = item.id?.videoId;
          if (!videoId) return null;

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
              channelAvatar: channelAvatarMap.get(
                channelId || '/default-avatar.png',
              ),
            },
            publishedAt:
              snippet?.publishedAt ||
              details?.snippet?.publishedAt ||
              new Date().toISOString(),
            duration: details?.contentDetails?.duration,
            viewCount: details?.statistics?.viewCount,
            likeCount: details?.statistics?.likeCount,
          };
        })
        .filter((video): video is IVideo => video !== null);

      return {
        videos,
        nextPageToken: searchResponse.data.nextPageToken || undefined,
        prevPageToken: searchResponse.data.prevPageToken || undefined,
        totalResults: searchResponse.data.pageInfo?.totalResults || 0,
      };
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

  async getVideoDetails(id: string): Promise<IVideo> {
    try {
      // 1. Fetch Video Details
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [id],
      });

      const item = response.data.items?.[0];
      if (!item) {
        throw new NotFoundException(`Video with ID ${id} not found`);
      }

      const channelId = item.snippet?.channelId;

      // 2. Fetch Channel + Comments Safely in Parallel
      const [channelResponse, comments] = await Promise.all([
        // Only fetch channel if channelId is valid (same check as searchVideos)
        channelId
          ? this.youtube.channels.list({
              part: ['snippet', 'statistics'],
              id: [channelId],
            })
          : Promise.resolve(null),

        // Gracefully handle comment errors (disabled comments, etc.)
        this.getVideoComments(id).catch((err) => {
          this.logger.warn(
            `Could not load comments for video ${id}: ${err?.message}`,
          );
          return [];
        }),
      ]);

      const channel = channelResponse?.data?.items?.[0];

      // 3. Return formatted video object
      return {
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

        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
        duration: item.contentDetails?.duration,
        viewCount: item.statistics?.viewCount,
        likeCount: item.statistics?.likeCount,
        commentCount: item.statistics?.commentCount,

        comments,
      };
    } catch (error: any) {
      // Pass NestJS HTTP Exceptions (like 404) through directly
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

  async getVideoComments(videoId: string): Promise<IComment[]> {
    try {
      const commentsResponse = await this.youtube.commentThreads.list({
        part: ['snippet'],
        videoId,
        maxResults: 20,
      });

      return (
        commentsResponse.data.items?.map((item) => {
          const comment = item.snippet?.topLevelComment?.snippet;

          return {
            id: item.id ?? '',
            authorDisplayName: comment?.authorDisplayName ?? '',
            authorProfileImageUrl: comment?.authorProfileImageUrl ?? '',
            textDisplay: comment?.textDisplay ?? '',
            publishedAt: comment?.publishedAt ?? '',
            likeCount: comment?.likeCount ?? 0,
          };
        }) ?? []
      );
    } catch (error: any) {
      this.logger.error(
        `Error fetching comments for video ${videoId}: ${error.message}`,
        error.stack,
      );

      return [];
    }
  }
}
