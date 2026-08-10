import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CacheModule } from '@/cache/cache.module';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';

@Module({
  imports: [ConfigModule, CacheModule],
  controllers: [ChannelController],
  providers: [ChannelService],
  exports: [ChannelService],
})
export class ChannelModule {}
