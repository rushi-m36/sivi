import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YoutubeController } from './video.controller';
import { VideoService } from './video.service';

@Module({
  imports: [ConfigModule],
  controllers: [YoutubeController],
  providers: [VideoService],
  exports: [VideoService],
})
export class VideoModule {}
