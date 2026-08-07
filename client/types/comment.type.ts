export interface CommentCardProps {
  author: string;
  authorAvatar?: string;
  text: string;
  publishedAt: string;
  likeCount: number;
}

export type TComment = {
  id: React.Key | null | undefined;
  authorDisplayName: string;
  authorProfileImageUrl: string;
  textDisplay: string;
  publishedAt: string;
  likeCount: number;
};
