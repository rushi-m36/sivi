import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google, youtube_v3 } from 'googleapis';

@Injectable()
export class YoutubeService {
  private readonly youtube: youtube_v3.Youtube;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';

    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  async searchVideos(query: string, maxResults = 10) {
    return this.youtube.search.list({
      part: ['snippet'],
      q: query,
      type: ['video'],
      maxResults,
    });
  }

  async getVideos(videoIds: string[]) {
    if (videoIds.length === 0) {
      return null;
    }

    return this.youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: videoIds,
    });
  }

  async getVideo(videoId: string) {
    const response = await this.youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      id: [videoId],
    });

    return response.data.items?.[0] ?? null;
  }

  async getChannels(channelIds: string[]) {
    if (channelIds.length === 0) {
      return null;
    }

    return this.youtube.channels.list({
      part: ['snippet', 'statistics'],
      id: channelIds,
    });
  }

  async getChannel(channelId: string) {
    const response = await this.youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [channelId],
    });

    return response.data.items?.[0] ?? null;
  }

  async getComments(videoId: string, maxResults) {
    return this.youtube.commentThreads.list({
      part: ['snippet'],
      videoId,
      maxResults,
    });
  }

  async getTrendingVideos(
    regionCode = 'IN',
    categoryId?: string,
    maxResults = 20,
  ) {
    return this.youtube.videos.list({
      part: ['snippet', 'contentDetails', 'statistics'],
      chart: 'mostPopular',
      regionCode,
      maxResults,
      ...(categoryId ? { videoCategoryId: categoryId } : {}),
    });
  }

  async getPlaylistItems(playlistId: string, maxResults) {
    return this.youtube.playlistItems.list({
      part: ['snippet'],
      playlistId,
      maxResults,
    });
  }
}
