import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { DeleteSubscriptionDto } from './dto/delete-subscription.dto';
import { RedisService } from '../cache/redis.service';

interface YouTubeChannel {
  channelId: string;
  channelTitle: string;
  channelAvatar?: string;
  subscriberCount: number;
}

interface YouTubeChannelApiItem {
  id: string;
  snippet: {
    title: string;
    thumbnails?: {
      default?: {
        url: string;
      };
      medium?: {
        url: string;
      };
    };
  };
  statistics?: {
    subscriberCount?: string;
  };
}

@Injectable()
export class SubscriptionsService {
  private readonly prisma: PrismaClient;

  private readonly SUBSCRIPTIONS_TTL = 120; // 2 minutes
  private readonly STATUS_TTL = 60; // 1 minute
  private readonly CHANNEL_TTL = 600; // 10 minutes

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      '';

    this.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async getSubscription(userId: string): Promise<YouTubeChannel[]> {
    const subscriptionsCacheKey = `subscriptions:user:${userId}`;

    // 1. Check user's complete subscription response
    const cachedSubscriptions = await this.getCache<YouTubeChannel[]>(
      subscriptionsCacheKey,
    );

    if (cachedSubscriptions) {
      return cachedSubscriptions;
    }

    // 2. Get subscribed channel IDs from PostgreSQL
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      select: {
        channelId: true,
      },
    });

    if (subscriptions.length === 0) {
      await this.setCache(subscriptionsCacheKey, [], this.SUBSCRIPTIONS_TTL);

      return [];
    }

    const channelIds = subscriptions.map(
      (subscription) => subscription.channelId,
    );

    // 3. Get channel information from Redis / YouTube
    const channels = await this.getChannelDetails(channelIds);

    // 4. Cache final user response
    await this.setCache(
      subscriptionsCacheKey,
      channels,
      this.SUBSCRIPTIONS_TTL,
    );

    return channels;
  }

  async checkSubscriptionStatus(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const cacheKey = `subscription:status:${userId}:${channelId}`;

    // 1. Check Redis
    const cachedStatus = await this.getCache<boolean>(cacheKey);

    if (cachedStatus !== null) {
      return cachedStatus;
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

    // 3. Cache result
    await this.setCache(cacheKey, isSubscribed, this.STATUS_TTL);

    return isSubscribed;
  }

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const { channelId } = dto;

    // Check whether subscription already exists
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

    // Invalidate caches affected by the new subscription
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

    // Invalidate caches affected by the deletion
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

    // Check Redis for every channel
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

    // Everything was already cached
    if (missingChannelIds.length === 0) {
      return this.orderChannels(uniqueChannelIds, cachedChannels);
    }

    // YouTube allows up to 50 channel IDs per request.
    const chunks = this.chunkArray(missingChannelIds, 50);

    const freshChannels = (
      await Promise.all(chunks.map((chunk) => this.fetchYouTubeChannels(chunk)))
    ).flat();

    // Cache every channel individually
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

    // Keep the same order as the user's subscriptions
    return this.orderChannels(uniqueChannelIds, allChannels);
  }

  /**
   * Fetch missing channel details from YouTube.
   */
  private async fetchYouTubeChannels(
    channelIds: string[],
  ): Promise<YouTubeChannel[]> {
    const apiKey =
      this.configService.get<string>('YOUTUBE_API_KEY') ||
      process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY is not configured');
    }

    const params = new URLSearchParams({
      part: 'snippet,statistics',
      id: channelIds.join(','),
      key: apiKey,
    });

    const url = `https://www.googleapis.com/youtube/v3/channels?${params.toString()}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`YouTube API request failed: ${response.status}`);
    }

    const data: {
      items?: YouTubeChannelApiItem[];
    } = await response.json();

    return (data.items ?? []).map((item) => ({
      channelId: item.id,
      channelTitle: item.snippet.title,
      channelAvatar:
        item.snippet.thumbnails?.medium?.url ||
        item.snippet.thumbnails?.default?.url,
      subscriberCount: Number(item.statistics?.subscriberCount) || 0,
    }));
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
   *
   * If Redis goes down, the application continues
   * using PostgreSQL / YouTube.
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
