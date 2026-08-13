import { Injectable } from '@nestjs/common';
import { youtube_v3 } from 'googleapis';

import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../cache/redis.service';
import { YoutubeService } from '../youtube/youtube.service';

import { TVideo } from '@/videos/types/video.type';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { DeleteSubscriptionDto } from './dto/delete-subscription.dto';

export interface YouTubeChannel {
  id: string;
  channelId: string;
  channelTitle: string;
  channelAvatar?: string;
  subscriberCount: number;
  mostRecentVideo?: {
    id: string;
  };
}

@Injectable()
export class SubscriptionsService {
  private readonly SUBSCRIPTIONS_TTL = 120;
  private readonly STATUS_TTL = 60;
  private readonly CHANNEL_TTL = 600;

  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
    private readonly youtubeService: YoutubeService,
  ) {}

  async getSubscription(userId: string): Promise<{
    channels: YouTubeChannel[];
    recentVideos: TVideo[];
  }> {
    const cacheKey = `subscriptions:user:${userId}`;

    // 1. Check Redis
    const cached = await this.redisService.get<{
      channels: YouTubeChannel[];
      recentVideos: TVideo[];
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // 2. Get subscriptions from PostgreSQL
    const subscriptions = await this.prisma.subscription.findMany({
      where: {
        userId,
      },
      select: {
        channelId: true,
      },
    });

    if (subscriptions.length === 0) {
      const emptyResponse = {
        channels: [],
        recentVideos: [],
      };

      await this.redisService.set(
        cacheKey,
        emptyResponse,
        this.SUBSCRIPTIONS_TTL,
      );

      return emptyResponse;
    }

    const channelIds = subscriptions.map(
      (subscription) => subscription.channelId,
    );

    // 3. Get channel details
    const channels = await this.getChannelDetails(channelIds);

    // 4. Get latest video from each channel
    const latestVideoIds = (
      await Promise.all(
        channels.map(async (channel) => {
          const channelData = await this.youtubeService.getChannel(
            channel.channelId,
          );

          const uploadsPlaylistId =
            channelData?.contentDetails?.relatedPlaylists?.uploads;

          if (!uploadsPlaylistId) {
            return null;
          }

          const playlistResponse = await this.youtubeService.getPlaylistItems(
            uploadsPlaylistId,
            1,
          );

          return (
            playlistResponse.data.items?.[0]?.contentDetails?.videoId ?? null
          );
        }),
      )
    ).filter((videoId): videoId is string => videoId !== null);

    // 5. Get complete video data
    const videos = (
      await Promise.all(
        latestVideoIds.map((videoId) => this.youtubeService.getVideo(videoId)),
      )
    ).filter((video): video is youtube_v3.Schema$Video => video !== null);

    // 6. Convert YouTube response to application type
    const recentVideos: TVideo[] = videos
      .map((video) => {
        const channel = channels.find(
          (channel) => channel.channelId === video.snippet?.channelId,
        );

        return {
          id: video.id ?? '',
          title: video.snippet?.title ?? '',
          description: video.snippet?.description ?? '',

          thumbnailUrl:
            video.snippet?.thumbnails?.high?.url ||
            video.snippet?.thumbnails?.medium?.url ||
            video.snippet?.thumbnails?.default?.url ||
            '',

          channel: {
            channelId: video.snippet?.channelId ?? '',
            channelTitle: video.snippet?.channelTitle ?? '',
            channelAvatar: channel?.channelAvatar ?? '',
            subscriberCount: channel?.subscriberCount ?? null,
          },

          publishedAt: video.snippet?.publishedAt ?? '',

          duration: video.contentDetails?.duration ?? null,

          viewCount: video.statistics?.viewCount ?? null,

          likeCount: video.statistics?.likeCount ?? null,

          commentCount: video.statistics?.commentCount
            ? Number(video.statistics.commentCount)
            : undefined,
        };
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );

    const response = {
      channels,
      recentVideos,
    };

    // 7. Cache final response
    await this.redisService.set(cacheKey, response, this.SUBSCRIPTIONS_TTL);

    return response;
  }

  async checkSubscriptionStatus(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const cacheKey = `subscription:status:${userId}:${channelId}`;

    // 1. Check Redis
    const cached = await this.redisService.get<boolean>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    // 2. Check PostgreSQL
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        channelId,
      },
      select: {
        id: true,
      },
    });

    const isSubscribed = !!subscription;

    // 3. Cache status
    await this.redisService.set(cacheKey, isSubscribed, this.STATUS_TTL);

    return isSubscribed;
  }

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const { channelId } = dto;

    const alreadyExists = await this.prisma.subscription.findFirst({
      where: {
        userId,
        channelId,
      },
      select: {
        id: true,
      },
    });

    if (alreadyExists) {
      return {
        message: 'Already Subscribed',
      };
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        channelId,
      },
    });

    // Invalidate affected caches
    await Promise.all([
      this.redisService.delete(`subscriptions:user:${userId}`),
      this.redisService.delete(`subscription:status:${userId}:${channelId}`),
    ]);

    return subscription;
  }

  async deleteSubscription(userId: string, dto: DeleteSubscriptionDto) {
    const { channelId } = dto;

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        channelId,
      },
      select: {
        id: true,
      },
    });

    if (!subscription) {
      return {
        message: 'Subscription already removed',
      };
    }

    const deletedSubscription = await this.prisma.subscription.delete({
      where: {
        id: subscription.id,
      },
    });

    // Invalidate affected caches
    await Promise.all([
      this.redisService.delete(`subscriptions:user:${userId}`),
      this.redisService.delete(`subscription:status:${userId}:${channelId}`),
    ]);

    return deletedSubscription;
  }

  private async getChannelDetails(
    channelIds: string[],
  ): Promise<YouTubeChannel[]> {
    const uniqueChannelIds = [...new Set(channelIds)];

    const cachedChannels: YouTubeChannel[] = [];
    const missingChannelIds: string[] = [];

    // Check Redis for every channel
    const cachedResults = await Promise.all(
      uniqueChannelIds.map(async (channelId) => {
        const cacheKey = `youtube:channel:${channelId}`;

        const cached = await this.redisService.get<YouTubeChannel>(cacheKey);

        return {
          channelId,
          cached,
        };
      }),
    );

    // Separate cache hits and misses
    for (const result of cachedResults) {
      if (result.cached) {
        cachedChannels.push(result.cached);
      } else {
        missingChannelIds.push(result.channelId);
      }
    }

    // Everything was cached
    if (missingChannelIds.length === 0) {
      return this.orderChannels(uniqueChannelIds, cachedChannels);
    }

    // YouTube supports up to 50 channel IDs
    // per channels.list request
    const chunks = this.chunkArray(missingChannelIds, 50);

    const freshChannels = (
      await Promise.all(chunks.map((chunk) => this.fetchYouTubeChannels(chunk)))
    ).flat();

    // Cache newly fetched channels
    await Promise.all(
      freshChannels.map((channel) =>
        this.redisService.set(
          `youtube:channel:${channel.channelId}`,
          channel,
          this.CHANNEL_TTL,
        ),
      ),
    );

    const allChannels = [...cachedChannels, ...freshChannels];

    return this.orderChannels(uniqueChannelIds, allChannels);
  }

  private async fetchYouTubeChannels(
    channelIds: string[],
  ): Promise<YouTubeChannel[]> {
    if (channelIds.length === 0) {
      return [];
    }

    const response = await this.youtubeService.getChannels(channelIds);

    return (
      response?.data.items?.map((item) => ({
        id: item.id ?? '',
        channelId: item.id ?? '',
        channelTitle: item.snippet?.title ?? '',
        channelAvatar:
          item.snippet?.thumbnails?.medium?.url ||
          item.snippet?.thumbnails?.default?.url ||
          '/default-avatar.png',
        subscriberCount: Number(item.statistics?.subscriberCount) || 0,
      })) ?? []
    );
  }

  private orderChannels(
    channelIds: string[],
    channels: YouTubeChannel[],
  ): YouTubeChannel[] {
    const channelMap = new Map(
      channels.map((channel) => [channel.channelId, channel]),
    );

    return channelIds
      .map((channelId) => channelMap.get(channelId))
      .filter((channel): channel is YouTubeChannel => channel !== undefined);
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  }
}
