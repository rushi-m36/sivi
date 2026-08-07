import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Query as QueryDecorator,
} from '@nestjs/common';
import { VideoService } from './video.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { TSearchResult, TVideo } from './types/video.type';

@Controller('videos')
export class YoutubeController {
  constructor(private readonly videoService: VideoService) {}

  @Get('search')
  async search(@Query() queryDto: SearchQueryDto): Promise<TSearchResult> {
    return this.videoService.searchVideos(
      queryDto.q,
      queryDto.pageToken,
      queryDto.maxResults ? Number(queryDto.maxResults) : 10,
    );
  }

  @Get(':id')
  async getVideoDetails(@Param('id') id: string): Promise<TVideo> {
    return this.videoService.getVideoDetails(id);
  }
}
