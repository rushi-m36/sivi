import { TChannel } from '@/channel/channel.type';
import { TComment } from './comment.type';

export type TVideo = {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channel: IChannel;
  commentCount?: number;
  comments?: IComment[];
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
