import { IVideo } from "./video.client.interface";

export interface IChannel {
  channelId: string | undefined;
  channelTitle: string;
  channelAvatar?: string;
  subscriberCount?: number | undefined;
  videos?: IVideo[];
}
