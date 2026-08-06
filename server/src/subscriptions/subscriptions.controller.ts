import { Body, Controller, Get, Post, UseGuards, Param } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { SubscriptionsService } from './subscriptions.service';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';

@Controller('subscriptions')
@UseGuards(ClerkAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get()
  async getSubscription(@CurrentUser() userId: string) {
    return this.subscriptionsService.getSubscription(userId);
  }

  @Get('status/:channelId')
  async checkSubscriptionStatus(
    @CurrentUser() userId: string,
    @Param('channelId') channelId: string,
  ) {
    return this.subscriptionsService.checkSubscriptionStatus(userId, channelId);
  }

  @Post()
  async createSubscription(
    @CurrentUser() userId: string,
    @Body() dto: CreateSubscriptionDto,
  ) {
    return this.subscriptionsService.createSubscription(userId, dto);
  }
}
