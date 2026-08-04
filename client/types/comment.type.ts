export type TComment = {
  id: React.Key | null | undefined;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  publishedAt: string;
  likeCount: number;
};
