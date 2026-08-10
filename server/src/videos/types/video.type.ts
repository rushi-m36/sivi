import { TComment } from './comment.type';

export type TChannelSummary = {
  channelId: string;
  channelTitle: string;
  channelAvatar: string;
  subscriberCount?: string | null;
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
  duration?: string | null;
  viewCount?: string | null;
  likeCount?: string | null;
};

export type TSearchResult = {
  videos: TVideo[];
  totalResults: number;
};
