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
}

export interface ISearchResult {
  videos: IYouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}
