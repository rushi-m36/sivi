import React from 'react';
import VideoCard from './VideoCard';
import { YouTubeVideo } from '../../types';

interface VideoGridProps {
  videos: YouTubeVideo[];
}

export default function VideoGrid({ videos }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 dark:text-zinc-400">
        No videos found. Try a different search.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
