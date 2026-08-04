import { TChannel } from '@/channel/channel.type';
import { TComment } from './comment.type';

export type TChannelSummary = {
  channelId: string;
  channelTitle: string;
  channelAvatar: string;
  subscriberCount?: number | string;
};

export type TVideo = {
  id: string;
  title: string;
  description?: string;
  thumbnailUrl: string;
  channel: TChannelSummary;
  commentCount?: number;
  comments?: TComment[];
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
};

export type TSearchResult = {
  videos: TVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
};
