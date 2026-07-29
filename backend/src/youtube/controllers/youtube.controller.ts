import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  Query as QueryDecorator,
} from '@nestjs/common';
import { YoutubeService } from '../services/youtube.service';
import { SearchQueryDto } from '../dto/search-query.dto';
import { ISearchResult, IYouTubeVideo } from '../interfaces/video.interface';

@Controller('youtube')
export class YoutubeController {
  constructor(private readonly youtubeService: YoutubeService) {}

  @Get('search')
  async search(@Query() queryDto: SearchQueryDto): Promise<ISearchResult> {
    console.log('Controller hit');
    console.log(queryDto);
    return this.youtubeService.searchVideos(
      queryDto.q,
      queryDto.pageToken,
      queryDto.maxResults ? Number(queryDto.maxResults) : 10,
    );
  }

  @Get('video/:id')
  async getVideoDetails(@Param('id') id: string): Promise<IYouTubeVideo> {
    return this.youtubeService.getVideoDetails(id);
  }
}
