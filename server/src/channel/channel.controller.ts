import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ChannelService } from './channel.service';
import { IChannel } from './channel.type';

@Controller('channel')
export class ChannelController {
  constructor(private readonly ChannelService: ChannelService) {}

  @Get(':id')
  async getChannel(@Param('id') id: string): Promise<IChannel> {
    console.log(`request hit /channel/${id}`);
    return this.ChannelService.getChannel(id);
  }
}
