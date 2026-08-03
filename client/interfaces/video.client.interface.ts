import { IComment } from "./comment.client.interface";

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

export interface SearchResult {
  videos: IVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}
