import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { YoutubeController } from './controllers/youtube.controller';
import { YoutubeService } from './services/youtube.service';

@Module({
  imports: [ConfigModule],
  controllers: [YoutubeController],
  providers: [YoutubeService],
  exports: [YoutubeService],
})
export class YoutubeModule {}
