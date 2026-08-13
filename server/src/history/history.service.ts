import { Injectable, NotFoundException, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { YoutubeService } from '../youtube/youtube.service';
import { ConfigService } from '@nestjs/config';
import { UpdateHistoryDto } from './history.dto';
import { THistoryVideo } from './history-video.type';

@Injectable()
export class HistoryService implements OnModuleDestroy {
  private readonly prisma: PrismaClient;

  constructor(
    private readonly youtubeService: YoutubeService,
    private readonly configService: ConfigService,
  ) {
    const connectionString =
      this.configService.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      '';

    this.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async onModuleDestroy() {
    await this.prisma.$disconnect();
  }

  async updateProgress(userId: string, videoId: string, dto: UpdateHistoryDto) {
    const completed =
      dto.completed ??
      (dto.durationSeconds
        ? dto.watchedSeconds >= dto.durationSeconds * 0.95
        : false);

    return this.prisma.watchHistory.upsert({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },

      create: {
        userId,
        videoId,
        watchedSeconds: dto.watchedSeconds,
        durationSeconds: dto.durationSeconds,
        completed,
        lastWatchedAt: new Date(),
      },

      update: {
        watchedSeconds: dto.watchedSeconds,
        durationSeconds: dto.durationSeconds,
        completed,
        lastWatchedAt: new Date(),
      },
    });
  }

  async getProgress(userId: string, videoId: string) {
    return this.prisma.watchHistory.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });
  }

  async getHistory(userId: string): Promise<THistoryVideo[]> {
    const history = await this.prisma.watchHistory.findMany({
      where: {
        userId,
      },
      orderBy: {
        lastWatchedAt: 'desc',
      },
    });

    if (history.length === 0) {
      return [];
    }

    const videoIds = history.map((item) => item.videoId);

    const response = await this.youtubeService.getVideos(videoIds);

    const videos = response?.data.items ?? [];

    const videoMap = new Map(
      videos.map((video) => [
        video.id,
        {
          id: video.id!,
          title: video.snippet?.title ?? '',
          description: video.snippet?.description ?? '',

          thumbnailUrl:
            video.snippet?.thumbnails?.high?.url ??
            video.snippet?.thumbnails?.medium?.url ??
            video.snippet?.thumbnails?.default?.url ??
            '',

          channel: {
            channelId: video.snippet?.channelId ?? '',
            channelTitle: video.snippet?.channelTitle ?? '',
            channelAvatar: '',
            subscriberCount: null,
          },

          publishedAt: video.snippet?.publishedAt ?? '',

          duration: video.contentDetails?.duration ?? null,

          viewCount: video.statistics?.viewCount ?? null,

          likeCount: video.statistics?.likeCount ?? null,

          commentCount: video.statistics?.commentCount
            ? Number(video.statistics.commentCount)
            : undefined,
        },
      ]),
    );

    return history.reduce<THistoryVideo[]>((result, item) => {
      const video = videoMap.get(item.videoId);

      if (!video) {
        return result;
      }

      result.push({
        video,
        watchedSeconds: item.watchedSeconds,
        durationSeconds: item.durationSeconds,
        completed: item.completed,
        lastWatchedAt: item.lastWatchedAt,
      });

      return result;
    }, []);
  }

  async deleteHistory(userId: string, videoId: string) {
    const history = await this.prisma.watchHistory.findUnique({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    if (!history) {
      throw new NotFoundException('Watch history not found');
    }

    await this.prisma.watchHistory.delete({
      where: {
        userId_videoId: {
          userId,
          videoId,
        },
      },
    });

    return {
      message: 'Watch history deleted',
    };
  }

  async clearHistory(userId: string) {
    const result = await this.prisma.watchHistory.deleteMany({
      where: {
        userId,
      },
    });

    return {
      message: 'Watch history cleared',
      deletedCount: result.count,
    };
  }
}
