import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { TVideo } from '@/videos/types/video.type';
import { TChannel } from '@/channel/channel.type';

@Injectable()
export class ChannelService {
  private readonly logger = new Logger(ChannelService.name);
  private readonly youtube;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('YOUTUBE_API_KEY') || '';
    this.youtube = google.youtube({
      version: 'v3',
      auth: apiKey,
    });
  }

  async getChannel(id: string): Promise<TChannel> {
    const response = await this.youtube.channels.list({
      part: ['snippet', 'statistics', 'contentDetails'],
      id: [id],
    });

    const channel = response?.data?.items?.[0];
    const uploadsPlaylistId =
      channel?.contentDetails?.relatedPlaylists?.uploads;

    // 1. Properly type 'videos' as an array of TVideo
    let videos: TVideo[] = [];

    if (uploadsPlaylistId) {
      const videosResponse = await this.youtube.playlistItems.list({
        part: ['snippet'],
        playlistId: uploadsPlaylistId,
        maxResults: 5,
      });

      videos =
        videosResponse?.data?.items?.map((item): TVideo => {
          const snippet = item.snippet;
          return {
            id: snippet?.resourceId?.videoId || '',
            title: snippet?.title || '',
            thumbnailUrl:
              snippet?.thumbnails?.medium?.url ||
              snippet?.thumbnails?.high?.url ||
              snippet?.thumbnails?.default?.url ||
              '',
            publishedAt: snippet?.publishedAt || '',
            channel: {
              channelId: id,
              channelTitle: channel?.snippet?.title || '',
              channelAvatar:
                channel?.snippet?.thumbnails?.default?.url ||
                channel?.snippet?.thumbnails?.medium?.url ||
                channel?.snippet?.thumbnails?.high?.url ||
                '/default-avatar.png',
            },
          };
        }) || [];
    }

    // 2. Return combined response matching TChannel
    return {
      channelId: id,
      channelTitle: channel?.snippet?.title || '',
      channelAvatar:
        channel?.snippet?.thumbnails?.default?.url ||
        channel?.snippet?.thumbnails?.medium?.url ||
        channel?.snippet?.thumbnails?.high?.url ||
        '/default-avatar.png',
      subscriberCount: channel?.statistics?.subscriberCount || '',
      videos,
    };
  }
}
