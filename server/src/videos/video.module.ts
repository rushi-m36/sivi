import { Module } from '@nestjs/common';
import { CacheModule } from '@/cache/cache.module';
import { YoutubeModule } from '@/youtube/youtube.module';
import { YoutubeController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [CacheModule, YoutubeModule],
  controllers: [YoutubeController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
