import { Injectable } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';
import { YoutubeService } from '../youtube/youtube.service';
import { TChannelSummary, TVideo } from '@/videos/types/video.type';

@Injectable()
export class TrendingService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly MIN_DURATION_SECONDS = 120;
  private readonly YOUTUBE_MAX_RESULTS = 50;

  private readonly inFlightRequests = new Map<string, Promise<TVideo[]>>();

  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly redisService: RedisService,
  ) {}

  async getTrendingVideos(
    regionCode = 'IN',
    categoryId?: string,
    maxResults = 20,
  ): Promise<TVideo[]> {
    const normalizedRegion = regionCode.toUpperCase();

    const cacheKey = this.buildCacheKey(
      normalizedRegion,
      categoryId,
      maxResults,
    );

    const cached = (await this.redisService.get(cacheKey)) as TVideo[] | null;

    if (cached && cached.length > 0) {
      return cached;
    }

    const existingRequest = this.inFlightRequests.get(cacheKey);

    if (existingRequest) {
      return existingRequest;
    }

    const request = this.fetchAndCacheTrendingVideos(
      normalizedRegion,
      categoryId,
      maxResults,
      cacheKey,
    );

    this.inFlightRequests.set(cacheKey, request);

    try {
      return await request;
    } finally {
      this.inFlightRequests.delete(cacheKey);
    }
  }

  private async fetchAndCacheTrendingVideos(
    regionCode: string,
    categoryId: string | undefined,
    maxResults: number,
    cacheKey: string,
  ): Promise<TVideo[]> {
    const videos: any[] = [];
    let pageToken: string | undefined;

    while (videos.length < maxResults) {
      const response = await this.youtubeService.getTrendingVideos(
        regionCode,
        categoryId,
        this.YOUTUBE_MAX_RESULTS,
        pageToken,
      );

      const items = response.data.items ?? [];

      if (items.length === 0) {
        break;
      }

      for (const video of items) {
        const duration = this.parseDuration(video.contentDetails?.duration);

        if (duration > this.MIN_DURATION_SECONDS) {
          videos.push(video);

          if (videos.length >= maxResults) {
            break;
          }
        }
      }

      pageToken = response.data.nextPageToken ?? undefined;

      if (!pageToken) {
        break;
      }
    }

    const finalVideos = videos.slice(0, maxResults);

    if (finalVideos.length === 0) {
      return [];
    }

    const channelIds = [
      ...new Set(
        finalVideos
          .map((video) => video.snippet?.channelId)
          .filter((id): id is string => Boolean(id)),
      ),
    ];

    const channelMap = new Map<string, TChannelSummary>();

    if (channelIds.length > 0) {
      const channelResponse = await this.youtubeService.getChannels(channelIds);

      const channels = channelResponse?.data.items ?? [];

      for (const channel of channels) {
        if (!channel.id) {
          continue;
        }

        channelMap.set(channel.id, {
          channelId: channel.id,
          channelTitle: channel.snippet?.title ?? '',
          channelAvatar:
            channel.snippet?.thumbnails?.high?.url ??
            channel.snippet?.thumbnails?.medium?.url ??
            channel.snippet?.thumbnails?.default?.url ??
            '',
          subscriberCount: channel.statistics?.subscriberCount ?? null,
        });
      }
    }

    const result: TVideo[] = finalVideos.map((video) => {
      const channelId = video.snippet?.channelId ?? '';

      return {
        id: video.id ?? '',
        title: video.snippet?.title ?? '',
        description: video.snippet?.description ?? '',
        thumbnailUrl:
          video.snippet?.thumbnails?.high?.url ??
          video.snippet?.thumbnails?.medium?.url ??
          video.snippet?.thumbnails?.default?.url ??
          '',
        channel: channelMap.get(channelId) ?? {
          channelId,
          channelTitle: video.snippet?.channelTitle ?? '',
          channelAvatar: '',
          subscriberCount: null,
        },
        publishedAt: video.snippet?.publishedAt ?? '',
        duration: video.contentDetails?.duration ?? null,
        viewCount: video.statistics?.viewCount ?? null,
        likeCount: video.statistics?.likeCount ?? null,
      };
    });

    await this.redisService.set(cacheKey, result, this.CACHE_TTL);

    return result;
  }

  private parseDuration(duration?: string | null): number {
    if (!duration) {
      return 0;
    }

    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

    if (!match) {
      return 0;
    }

    const hours = Number(match[1] ?? 0);
    const minutes = Number(match[2] ?? 0);
    const seconds = Number(match[3] ?? 0);

    return hours * 3600 + minutes * 60 + seconds;
  }

  private buildCacheKey(
    regionCode: string,
    categoryId?: string,
    maxResults = 20,
  ): string {
    return [
      'trending',
      regionCode.toUpperCase(),
      categoryId ?? 'all',
      maxResults,
    ].join(':');
  }
}
