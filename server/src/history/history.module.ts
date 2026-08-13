import { Module } from '@nestjs/common';

import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

import { YoutubeService } from '../youtube/youtube.service';

@Module({
  controllers: [HistoryController],
  providers: [HistoryService, YoutubeService],
})
export class HistoryModule {}
