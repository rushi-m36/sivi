import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { DeleteSubscriptionDto } from './dto/delete-subscription.dto';

@Injectable()
export class SubscriptionsService {
  private readonly prisma: PrismaClient;

  constructor(configService: ConfigService) {
    const connectionString =
      configService.get<string>('DATABASE_URL') ||
      process.env.DATABASE_URL ||
      '';

    this.prisma = new PrismaClient({
      adapter: new PrismaPg({ connectionString }),
    });
  }

  async getSubscription(userId: string) {
    // 1. Get channel IDs from database
    const subscriptions = await this.prisma.subscription.findMany({
      where: { userId },
      select: { channelId: true },
    });

    if (subscriptions.length === 0) return [];

    const channelIds = subscriptions.map((s) => s.channelId).join(',');
    const apiKey = process.env.YOUTUBE_API_KEY;

    // 2. Fetch details from YouTube Data API v3
    const url = `https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=${channelIds}&key=${apiKey}`;
    const response = await fetch(url);
    const data = await response.json();

    // 3. Map and return required attributes
    return data.items.map((item: any) => ({
      channelId: item.id,
      channelTitle: item.snippet.title,
      channelAvatar:
        item.snippet.thumbnails?.default?.url ||
        item.snippet.thumbnails?.medium?.url,
      subscriberCount: Number(item.statistics.subscriberCount) || 0,
    }));
  }

  async checkSubscriptionStatus(
    userId: string,
    channelId: string,
  ): Promise<boolean> {
    const status = await this.prisma.subscription.findFirst({
      where: {
        userId,
        channelId,
      },
    });

    return !!status;
  }

  async createSubscription(userId: string, dto: CreateSubscriptionDto) {
    const alreadyExists = await this.prisma.subscription.findFirst({
      where: {
        userId,
        channelId: dto.channelId,
      },
    });

    if (alreadyExists) {
      return { message: 'Already Subscribed' };
    } else {
      return this.prisma.subscription.create({
        data: {
          userId,
          channelId: dto.channelId,
        },
      });
    }
  }

  async deleteSubscription(userId: string, dto: DeleteSubscriptionDto) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        channelId: dto.channelId,
      },
    });

    if (!subscription) {
      return { message: 'Subscription already removed' };
    }

    return this.prisma.subscription.delete({
      where: {
        id: subscription.id,
      },
    });
  }
}
