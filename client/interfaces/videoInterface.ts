import { IComment } from "./commentInterface";
import { IChannel } from "./channelInterface";

export interface IVideo {
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
}

export interface SearchResult {
  videos: IVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}
