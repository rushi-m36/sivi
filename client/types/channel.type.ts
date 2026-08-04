import { TVideo } from "./video.type";

export type TChannel = {
  channelId: string | undefined;
  channelTitle: string;
  channelAvatar?: string;
  subscriberCount?: number | string;
  videos?: TVideo[];
};
