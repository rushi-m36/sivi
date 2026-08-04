import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { GetSubscriptionDto } from './dto/get-subscription.dto';

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
  async getSubscription(dto: GetSubscriptionDto) {
    return this.prisma.subscription.findMany({
      where: {
        userId: dto.userId,
      },
    });
  }

  async createSubscription(dto: CreateSubscriptionDto) {
    return this.prisma.subscription.create({
      data: {
        userId: dto.userId,
        channelId: dto.channelId,
      },
    });
  }
}
