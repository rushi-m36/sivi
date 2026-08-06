import { IsString } from 'class-validator';

export class DeleteSubscriptionDto {
  @IsString()
  channelId!: string;
}
