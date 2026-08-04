import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Query as QueryDecorator,
} from '@nestjs/common';
import { YoutubeService } from './youtube.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { TSearchResult, TVideo } from './types/video.type';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('search')
  async search(@Query() queryDto: SearchQueryDto): Promise<TSearchResult> {
    return this.youtubeService.searchVideos(
      queryDto.q,
      queryDto.pageToken,
      queryDto.maxResults ? Number(queryDto.maxResults) : 10,
    );
  }

  @Get('video/:id')
  async getVideoDetails(@Param('id') id: string): Promise<TVideo> {
    return this.youtubeService.getVideoDetails(id);
  }
}
