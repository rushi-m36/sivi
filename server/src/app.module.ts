import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { VideoModule } from './videos/video.module';
import { ChannelModule } from './channel/channel.module';
import { AuthModule } from './auth/auth.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { CacheModule } from './cache/cache.module';
import { YoutubeModule } from './youtube/youtube.module';
import { HealthModule } from './health/health.module';
import { TrendingModule } from './trending/trending.module';
import { HistoryModule } from './history/history.module';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    VideoModule,
    ChannelModule,
    AuthModule,
    SubscriptionsModule,
    CacheModule,
    YoutubeModule,
    HealthModule,
    TrendingModule,
    HistoryModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
