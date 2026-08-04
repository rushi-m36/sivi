import { TVideo } from '@/youtube/types/video.type';
import { TChannelSummary } from '@/youtube/types/video.type';

export type TChannel = TChannelSummary & {
  videos?: TVideo[];
};
