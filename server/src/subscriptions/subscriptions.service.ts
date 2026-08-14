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

  /**
   * YouTube uploads playlist used to retrieve
   * the latest uploaded video.
   */
  uploadsPlaylistId?: string;

  mostRecentVideo?: {
    id: string;
  };
}

interface CachedLatestVideo {
  videoId: string | null;
}

@Injectable()
export class SubscriptionsService {
  /**
   * Complete response cache.
   *
   * This is intentionally kept at 120 seconds to preserve
   * your current behavior.
   */
  private readonly SUBSCRIPTIONS_TTL = 120;

  /**
   * Subscription status changes independently from the
   * complete subscriptions response.
   */
  private readonly STATUS_TTL = 60;

  /**
   * Channel metadata changes relatively slowly.
   */
  private readonly CHANNEL_TTL = 600;

  /**
   * Latest uploaded video is cached separately.
   *
   * This prevents every subscriptions-cache miss from having
   * to call playlistItems.list for every channel.
   */
  private readonly LATEST_VIDEO_TTL = 120;

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

    // ---------------------------------------------------------
    // 1. Complete response cache
    // ---------------------------------------------------------

    const cached = await this.redisService.get<{
      channels: YouTubeChannel[];
      recentVideos: TVideo[];
    }>(cacheKey);

    if (cached) {
      return cached;
    }

    // ---------------------------------------------------------
    // 2. PostgreSQL
    // ---------------------------------------------------------

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

    // ---------------------------------------------------------
    // 3. Channel information
    // ---------------------------------------------------------

    const channels = await this.getChannelDetails(channelIds);

    // ---------------------------------------------------------
    // 4. Latest video ID for each channel
    // ---------------------------------------------------------

    const latestVideoIds = await this.getLatestVideoIds(channels);

    if (latestVideoIds.length === 0) {
      const response = {
        channels,
        recentVideos: [],
      };

      await this.redisService.set(cacheKey, response, this.SUBSCRIPTIONS_TTL);

      return response;
    }

    // ---------------------------------------------------------
    // 5. Get complete video data in ONE batched request
    // ---------------------------------------------------------

    const videosResponse = await this.youtubeService.getVideos(latestVideoIds);

    const videos = videosResponse?.data.items ?? [];

    // ---------------------------------------------------------
    // 6. Build application response
    // ---------------------------------------------------------

    const channelMap = new Map(
      channels.map((channel) => [channel.channelId, channel]),
    );

    const recentVideos: TVideo[] = videos
      .map((video) => {
        const channelId = video.snippet?.channelId ?? '';

        const channel = channelMap.get(channelId);

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
            channelId,
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

    // ---------------------------------------------------------
    // 7. Cache final response
    // ---------------------------------------------------------

    await this.redisService.set(cacheKey, response, this.SUBSCRIPTIONS_TTL);

    return response;
  }

  async checkSubscriptionStatus(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const cacheKey = `subscription:status:${userId}:${channelId}`;

    // Redis
    const cached = await this.redisService.get<boolean>(cacheKey);

    if (cached !== null) {
      return cached;
    }

    // PostgreSQL
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

    // Cache
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

    // Invalidate both affected caches.
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

    // Invalidate both affected caches.
    await Promise.all([
      this.redisService.delete(`subscriptions:user:${userId}`),

      this.redisService.delete(`subscription:status:${userId}:${channelId}`),
    ]);

    return deletedSubscription;
  }

  /**
   * Gets channel information from Redis first.
   *
   * Uses one MGET instead of one GET per channel.
   */
  private async getChannelDetails(
    channelIds: string[],
  ): Promise<YouTubeChannel[]> {
    const uniqueChannelIds = [...new Set(channelIds)];

    if (uniqueChannelIds.length === 0) {
      return [];
    }

    // ---------------------------------------------------------
    // Redis MGET
    // ---------------------------------------------------------

    const cacheKeys = uniqueChannelIds.map(
      (channelId) => `youtube:channel:${channelId}`,
    );

    const cachedResults =
      await this.redisService.getMany<YouTubeChannel>(cacheKeys);

    const cachedChannels: YouTubeChannel[] = [];
    const missingChannelIds: string[] = [];

    uniqueChannelIds.forEach((channelId, index) => {
      const cached = cachedResults[index];

      if (cached) {
        cachedChannels.push(cached);
      } else {
        missingChannelIds.push(channelId);
      }
    });

    // Everything is already cached.
    if (missingChannelIds.length === 0) {
      return this.orderChannels(uniqueChannelIds, cachedChannels);
    }

    // ---------------------------------------------------------
    // YouTube batch request
    // ---------------------------------------------------------

    const chunks = this.chunkArray(missingChannelIds, 50);

    const freshChannels = (
      await Promise.all(chunks.map((chunk) => this.fetchYouTubeChannels(chunk)))
    ).flat();

    // ---------------------------------------------------------
    // Cache newly fetched channels
    // ---------------------------------------------------------

    await this.redisService.setMany(
      freshChannels.map((channel) => ({
        key: `youtube:channel:${channel.channelId}`,
        value: channel,
        ttlSeconds: this.CHANNEL_TTL,
      })),
    );

    const allChannels = [...cachedChannels, ...freshChannels];

    return this.orderChannels(uniqueChannelIds, allChannels);
  }

  /**
   * Gets the latest video for each subscribed channel.
   *
   * Latest video IDs are cached independently from the complete
   * subscriptions response.
   */
  private async getLatestVideoIds(
    channels: YouTubeChannel[],
  ): Promise<string[]> {
    if (channels.length === 0) {
      return [];
    }

    const cacheKeys = channels.map(
      (channel) => `youtube:latest-video:${channel.channelId}`,
    );

    const cachedResults =
      await this.redisService.getMany<CachedLatestVideo>(cacheKeys);

    const latestVideoIds: string[] = [];
    const missingChannels: YouTubeChannel[] = [];

    channels.forEach((channel, index) => {
      const cached = cachedResults[index];

      if (cached?.videoId) {
        latestVideoIds.push(cached.videoId);
      } else {
        missingChannels.push(channel);
      }
    });

    if (missingChannels.length === 0) {
      return [...new Set(latestVideoIds)];
    }

    const freshResults = await Promise.all(
      missingChannels.map(async (channel) => {
        if (!channel.uploadsPlaylistId) {
          return {
            channelId: channel.channelId,
            videoId: null,
          };
        }

        const playlistResponse = await this.youtubeService.getPlaylistItems(
          channel.uploadsPlaylistId,
          1,
        );

        return {
          channelId: channel.channelId,
          videoId:
            playlistResponse.data.items?.[0]?.contentDetails?.videoId ?? null,
        };
      }),
    );

    await this.redisService.setMany(
      freshResults.map((result) => ({
        key: `youtube:latest-video:${result.channelId}`,
        value: {
          videoId: result.videoId,
        },
        ttlSeconds: this.LATEST_VIDEO_TTL,
      })),
    );

    for (const result of freshResults) {
      if (result.videoId) {
        latestVideoIds.push(result.videoId);
      }
    }

    return [...new Set(latestVideoIds)];
  }
  /**
   * Gets the uploads playlist ID.
   *
   * This uses the channel cache populated by getChannelDetails().
   *
   * The current YouTubeChannel application type doesn't expose
   * uploadsPlaylistId, so we make a single channel request only
   * when it is required.
   *
   * This method is intentionally isolated so it can later be
   * removed when uploadsPlaylistId is added to the channel cache.
   */
  private async getUploadsPlaylistId(
    channelId: string,
  ): Promise<string | null> {
    const channelData = await this.youtubeService.getChannel(channelId);

    return channelData?.contentDetails?.relatedPlaylists?.uploads ?? null;
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

        uploadsPlaylistId: item.contentDetails?.relatedPlaylists?.uploads,

        mostRecentVideo: undefined,
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
