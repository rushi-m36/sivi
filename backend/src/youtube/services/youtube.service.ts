import {
  Injectable,
  Logger,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import {
  IYouTubeVideo,
  ISearchResult,
  IYouTubeComment,
} from '../interfaces/video.interface';

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
    this.logger.log(
      `Searching videos for query: "${query}" (limit: ${maxResults})`,
    );

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

      const videos: IYouTubeVideo[] = items
        .map((item) => {
          const videoId = item.id?.videoId;
          if (!videoId) return null;

          const details = videosDetailsMap.get(videoId);
          const snippet = item.snippet;

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
            channelId: snippet?.channelId || details?.snippet?.channelId || '',
            channelTitle:
              snippet?.channelTitle || details?.snippet?.channelTitle || '',
            publishedAt:
              snippet?.publishedAt ||
              details?.snippet?.publishedAt ||
              new Date().toISOString(),
            duration: details?.contentDetails?.duration,
            viewCount: details?.statistics?.viewCount,
            likeCount: details?.statistics?.likeCount,
          };
        })
        .filter((video): video is IYouTubeVideo => video !== null);

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

  async getVideoDetails(id: string): Promise<IYouTubeVideo> {
    this.logger.log(`Fetching details for video: ${id}`);

    try {
      const response = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails', 'statistics'],
        id: [id],
      });

      const item = response.data.items?.[0];
      if (!item) {
        throw new NotFoundException(`Video with ID ${id} not found`);
      }

      return {
        id,
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        thumbnailUrl:
          item.snippet?.thumbnails?.high?.url ||
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          '',
        channelId: item.snippet?.channelId || '',
        channelTitle: item.snippet?.channelTitle || '',
        publishedAt: item.snippet?.publishedAt || new Date().toISOString(),
        duration: item.contentDetails?.duration,
        viewCount: item.statistics?.viewCount,
        likeCount: item.statistics?.likeCount,
        commentCount: item.statistics?.commentCount,
        comments: await this.getVideoComments(id),
      };
    } catch (error: any) {
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

  async getVideoComments(videoId: string): Promise<IYouTubeComment[]> {
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
