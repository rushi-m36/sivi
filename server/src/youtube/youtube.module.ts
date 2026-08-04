import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';

@Module({
  imports: [ConfigModule],
  controllers: [YoutubeController],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}
