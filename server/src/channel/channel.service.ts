import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

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

  async getChannel(id: string) {
    const response = await this.youtube.channels.list({
      part: ['snippet', 'statistics'],
      id: [id],
    });

    const channel = response?.data?.items?.[0];

    return {
      channelId: id,
      channelTitle: channel?.snippet?.title || '',
      channelAvatar:
        channel?.snippet?.thumbnails?.default?.url ||
        channel?.snippet?.thumbnails?.medium?.url ||
        channel?.snippet?.thumbnails?.high?.url ||
        '/default-avatar.png',
      subscriberCount: channel?.statistics?.subscriberCount,
    };
  }
}
