import { Module } from '@nestjs/common';
import { TrendingController } from './trending.controller';
import { TrendingService } from './trending.service';
import { YoutubeModule } from '../youtube/youtube.module';
import { CacheModule } from '@/cache/cache.module';

@Module({
  imports: [YoutubeModule, CacheModule],
  controllers: [TrendingController],
  providers: [TrendingService],
})
export class TrendingModule {}
