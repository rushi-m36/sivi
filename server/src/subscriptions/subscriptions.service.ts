import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { NotFoundException } from '@nestjs/common';
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
    return this.prisma.subscription.findMany({
      where: {
        userId,
      },
    });
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
    return this.prisma.subscription.create({
      data: {
        userId,
        channelId: dto.channelId,
      },
    });
  }

  async deleteSubscription(userId: string, dto: DeleteSubscriptionDto) {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        channelId: dto.channelId,
      },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.delete({
      where: {
        id: subscription.id,
      },
    });
  }
}
