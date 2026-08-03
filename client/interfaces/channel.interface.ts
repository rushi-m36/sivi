export interface IChannel {
  channelId: string | undefined;
  channelTitle: string;
  channelAvatar?: string;
  subscriberCount?: number | string;
}
