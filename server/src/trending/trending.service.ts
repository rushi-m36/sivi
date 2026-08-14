import { Injectable } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';
import { YoutubeService } from '../youtube/youtube.service';

@Injectable()
export class TrendingService {
  private readonly CACHE_TTL = 300; // 5 minutes
  private readonly MIN_DURATION_SECONDS = 60;

  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly redisService: RedisService,
  ) {}

  async getTrendingVideos(
    regionCode = 'IN',
    categoryId?: string,
    maxResults = 20,
  ) {
    const cacheKey = this.buildCacheKey(regionCode, categoryId, maxResults);

    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return cached;
    }

    const videos: any[] = [];
    let pageToken: string | undefined;

    while (videos.length < maxResults) {
      const remaining = maxResults - videos.length;

      // YouTube API allows a maximum of 50 per request.
      const fetchCount = Math.min(remaining + 10, 50);

      const response = await this.youtubeService.getTrendingVideos(
        regionCode,
        categoryId,
        fetchCount,
        pageToken,
      );

      const items = response.data.items ?? [];

      if (items.length === 0) {
        break;
      }

      const filteredVideos = items.filter((video) => {
        const duration = this.parseDuration(video.contentDetails?.duration);

        return duration > this.MIN_DURATION_SECONDS;
      });

      videos.push(...filteredVideos);

      // No more pages available.
      pageToken = response.data.nextPageToken ?? undefined;

      if (!pageToken) {
        break;
      }
    }

    // Ensure we never return more than requested.
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

    const channelResponse = await this.youtubeService.getChannels(channelIds);

    const channels = channelResponse?.data.items ?? [];

    const channelMap = new Map(
      channels.map((channel) => [
        channel.id,
        {
          channelId: channel.id ?? '',
          channelTitle: channel.snippet?.title ?? '',
          channelAvatar:
            channel.snippet?.thumbnails?.high?.url ??
            channel.snippet?.thumbnails?.medium?.url ??
            channel.snippet?.thumbnails?.default?.url ??
            '',
          subscriberCount: channel.statistics?.subscriberCount ?? null,
        },
      ]),
    );

    const result = finalVideos.map((video) => {
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
