import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';
import { HistoryService } from './history.service';
import { UpdateHistoryDto } from './history.dto';

@Controller('history')
@UseGuards(ClerkAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Put(':videoId')
  async updateProgress(
    @CurrentUser() userId: string,
    @Param('videoId') videoId: string,
    @Body() dto: UpdateHistoryDto,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.historyService.updateProgress(userId, videoId, dto);
  }

  @Get()
  async getHistory(@CurrentUser() userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.historyService.getHistory(userId);
  }

  @Get(':videoId')
  async getProgress(
    @CurrentUser() userId: string,
    @Param('videoId') videoId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.historyService.getProgress(userId, videoId);
  }

  @Delete(':videoId')
  async deleteHistory(
    @CurrentUser() userId: string,
    @Param('videoId') videoId: string,
  ) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.historyService.deleteHistory(userId, videoId);
  }

  @Delete()
  async clearHistory(@CurrentUser() userId: string) {
    if (!userId) {
      throw new UnauthorizedException('Authentication required');
    }

    return this.historyService.clearHistory(userId);
  }
}
