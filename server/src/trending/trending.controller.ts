import {
  Controller,
  Get,
  Query,
  Param,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { TrendingService } from './trending.service';

@Controller('trending')
export class TrendingController {
  constructor(private readonly trendingService: TrendingService) {}

  @Get()
  async getTrending(
    @Query('regionCode') regionCode = 'IN',
    @Query('maxResults', new DefaultValuePipe(20), ParseIntPipe)
    maxResults: number = 20,
  ) {
    return this.trendingService.getTrendingVideos(
      regionCode,
      undefined,
      maxResults,
    );
  }

  @Get(':categoryId')
  async getTrendingByCategory(
    @Param('categoryId') categoryId: string,
    @Query('regionCode') regionCode = 'IN',
    @Query('maxResults', new DefaultValuePipe(20), ParseIntPipe)
    maxResults: number = 20,
  ) {
    return this.trendingService.getTrendingVideos(
      regionCode,
      categoryId,
      maxResults,
    );
  }
}
