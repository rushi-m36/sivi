import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';

export class SearchQueryDto {
  @IsString()
  q;

  @IsOptional()
  @IsString()
  pageToken?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxResults?: number;
}
