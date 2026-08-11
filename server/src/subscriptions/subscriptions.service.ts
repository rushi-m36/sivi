import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { TVideo } from '@/videos/types/video.type';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { DeleteSubscriptionDto } from './dto/delete-subscription.dto';
import { RedisService } from '../cache/redis.service';
import { YoutubeService } from '../youtube/youtube.service';
import { youtube_v3 } from 'googleapis';

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
  private readonly prisma: PrismaClient;

  private readonly SUBSCRIPTIONS_TTL = 120;
  private readonly STATUS_TTL = 60;
  private readonly CHANNEL_TTL = 600;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly youtubeService: YoutubeService,
  ) {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      '';

    this.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async getSubscription(userId: string): Promise<{
    channels: YouTubeChannel[];
    recentVideos: TVideo[];
  }> {
    const subscriptionsCacheKey = `subscriptions:user:${userId}`;

    const cachedSubscriptions = await this.getCache<{
      channels: YouTubeChannel[];
      recentVideos: TVideo[];
    }>(subscriptionsCacheKey);

    if (cachedSubscriptions) {
      return cachedSubscriptions;
    }

    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      select: {
        channelId: true,
      },
    });

    if (subscriptions.length === 0) {
      const emptyResponse = {
        channels: [],
        recentVideos: [],
      };

      await this.setCache(
        subscriptionsCacheKey,
        emptyResponse,
        this.SUBSCRIPTIONS_TTL,
      );

      return emptyResponse;
    }

    const channelIds = subscriptions.map(
      (subscription) => subscription.channelId,
    );

    // Original subscribed channels
    const channels = await this.getChannelDetails(channelIds);

    // Get latest video ID from each subscribed channel
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

    // Get complete video data
    const videos = (
      await Promise.all(
        latestVideoIds.map((videoId) => this.youtubeService.getVideo(videoId)),
      )
    ).filter((video): video is youtube_v3.Schema$Video => video !== null);

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

    await this.setCache(
      subscriptionsCacheKey,
      response,
      this.SUBSCRIPTIONS_TTL,
    );

    return response;
  }

  async checkSubscriptionStatus(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const cacheKey = `subscription:status:${userId}:${channelId}`;

    const cachedStatus = await this.getCache<boolean>(cacheKey);

    if (cachedStatus !== null) {
      return cachedStatus;
    }

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

    await this.setCache(cacheKey, isSubscribed, this.STATUS_TTL);

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
      return { message: 'Already Subscribed' };
    }

    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        channelId,
      },
    });

    await Promise.all([
      this.deleteCache(`subscriptions:user:${userId}`),
      this.deleteCache(`subscription:status:${userId}:${channelId}`),
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
      return { message: 'Subscription already removed' };
    }

    const deletedSubscription = await this.prisma.subscription.delete({
      where: {
        id: subscription.id,
      },
    });

    await Promise.all([
      this.deleteCache(`subscriptions:user:${userId}`),
      this.deleteCache(`subscription:status:${userId}:${channelId}`),
    ]);

    return deletedSubscription;
  }

  /**
   * Gets YouTube channel details.
   *
   * First checks Redis for each channel.
   * Only missing channels are requested from YouTube.
   */
  private async getChannelDetails(
    channelIds: string[],
  ): Promise<YouTubeChannel[]> {
    const uniqueChannelIds = [...new Set(channelIds)];

    const cachedChannels: YouTubeChannel[] = [];
    const missingChannelIds: string[] = [];

    const cachedResults = await Promise.all(
      uniqueChannelIds.map(async (channelId) => {
        const cacheKey = `youtube:channel:${channelId}`;

        const cached = await this.getCache<YouTubeChannel>(cacheKey);

        return {
          channelId,
          cached,
        };
      }),
    );

    for (const result of cachedResults) {
      if (result.cached) {
        cachedChannels.push(result.cached);
      } else {
        missingChannelIds.push(result.channelId);
      }
    }

    if (missingChannelIds.length === 0) {
      return this.orderChannels(uniqueChannelIds, cachedChannels);
    }

    // YouTube allows up to 50 channel IDs per request.
    const chunks = this.chunkArray(missingChannelIds, 50);

    const freshChannels = (
      await Promise.all(chunks.map((chunk) => this.fetchYouTubeChannels(chunk)))
    ).flat();

    await Promise.all(
      freshChannels.map((channel) =>
        this.setCache(
          `youtube:channel:${channel.channelId}`,
          channel,
          this.CHANNEL_TTL,
        ),
      ),
    );

    const allChannels = [...cachedChannels, ...freshChannels];

    return this.orderChannels(uniqueChannelIds, allChannels);
  }

  /**
   * Fetch missing channel details through the centralized
   * YoutubeService.
   */
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

  /**
   * Preserve the order of the user's subscriptions.
   */
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

  /**
   * Split an array into chunks.
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  }

  /**
   * Redis GET with graceful fallback.
   */
  private async getCache<T>(key: string): Promise<T | null> {
    try {
      return await this.redisService.get<T>(key);
    } catch (error) {
      console.error(`Redis GET failed for ${key}:`, error);

      return null;
    }
  }

  /**
   * Redis SET with graceful fallback.
   */
  private async setCache<T>(key: string, value: T, ttl: number): Promise<void> {
    try {
      await this.redisService.set(key, value, ttl);
    } catch (error) {
      console.error(`Redis SET failed for ${key}:`, error);
    }
  }

  /**
   * Redis DELETE with graceful fallback.
   */
  private async deleteCache(key: string): Promise<void> {
    try {
      await this.redisService.delete(key);
    } catch (error) {
      console.error(`Redis DELETE failed for ${key}:`, error);
    }
  }
}
