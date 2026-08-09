import { VideoCard } from "./VideoCard";
import { TVideo } from "@/types/video.type";

interface VideoGridProps {
  videos: TVideo[] | undefined;
}

export default function VideoGrid({ videos }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="flex min-h-40 items-center justify-center border-y border-zinc-800 px-6 py-12 text-center">
        <p className="text-sm text-zinc-500 sm:text-base">
          Search something to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
