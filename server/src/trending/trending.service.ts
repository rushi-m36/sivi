import { Injectable } from '@nestjs/common';
import { RedisService } from '../cache/redis.service';
import { YoutubeService } from '../youtube/youtube.service';

@Injectable()
export class TrendingService {
  private readonly CACHE_TTL = 300; // 5 minutes

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

    const response = await this.youtubeService.getTrendingVideos(
      regionCode,
      categoryId,
      maxResults,
    );

    const videos = response.data.items ?? [];

    if (videos.length === 0) {
      return [];
    }

    const channelIds = [
      ...new Set(
        videos
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

    const result = videos.map((video) => {
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
