export interface IYouTubeComment {
  id: string;
  author: string;
  authorProfileImage: string;
  text: string;
  publishedAt: string;
  likeCount: string;
}

export interface IYouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
  commentCount?: string;
  comments?: IYouTubeComment[];
}

export interface ISearchResult {
  videos: IYouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}
