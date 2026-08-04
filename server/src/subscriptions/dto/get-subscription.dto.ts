import { IsString } from 'class-validator';

export class GetSubscriptionDto {
  @IsString()
  userId!: string;
}
