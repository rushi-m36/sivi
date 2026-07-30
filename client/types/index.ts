export interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  channelId: string;
  channelTitle: string;
  channelAvatar: string;
  publishedAt: string;
  duration?: string;
  viewCount?: string;
  likeCount?: string;
}

export interface SearchResult {
  videos: YouTubeVideo[];
  nextPageToken?: string;
  prevPageToken?: string;
  totalResults: number;
}
