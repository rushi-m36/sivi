import { Module } from '@nestjs/common';

import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';
import { CacheModule } from '@/cache/cache.module';
import { YoutubeModule } from '@/youtube/youtube.module';
import { PrismaModule } from '@/prisma/prisma.module';
import { AuthModule } from '@/auth/auth.module';

@Module({
  imports: [CacheModule, AuthModule, YoutubeModule, PrismaModule],
  controllers: [HistoryController],
  providers: [HistoryService],
})
export class HistoryModule {}
