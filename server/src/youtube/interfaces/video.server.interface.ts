import { IChannel } from '../../channel/channel.server.interface';
import { IComment } from './comment.server.interface';

export interface IVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId?: string;
  channelTitle?: string;
  channelAvatar?: string;
  commentCount?: number;
  comments?: IComment[];
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
}

export interface ISearchResult {
  videos: IVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}
