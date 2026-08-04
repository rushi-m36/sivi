import { TVideo } from '@/youtube/types/video.type';

export type TChannel = {
  channelId: string;
  channelTitle: string;
  channelAvatar: string;
  subscriberCount?: string;
  videos?: TVideo[];
};
