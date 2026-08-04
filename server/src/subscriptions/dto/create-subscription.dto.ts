import { IsString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsString()
  channelId!: string;
}
