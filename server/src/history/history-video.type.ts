import { TVideo } from '@/videos/types/video.type';

export type THistoryVideo = {
  video: TVideo;
  watchedSeconds: number;
  durationSeconds: number | null;
  completed: boolean;
  lastWatchedAt: Date;
};
