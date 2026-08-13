import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class UpdateHistoryDto {
  @IsInt()
  @Min(0)
  watchedSeconds!: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  durationSeconds?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
