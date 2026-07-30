import { VideoCard } from "./VideoCard";
import { YouTubeVideo } from "../../types";

interface VideoGridProps {
  videos: YouTubeVideo[];
}

export default function VideoGrid({ videos }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-slate-700 dark:text-zinc-200">
          Search for what you came here to find.
        </p>
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
