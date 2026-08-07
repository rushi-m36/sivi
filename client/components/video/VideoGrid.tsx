import { VideoCard } from "./VideoCard";
import { TVideo } from "@/types/video.type";

interface VideoGridProps {
  videos: TVideo[] | undefined;
}

export default function VideoGrid({ videos }: VideoGridProps) {
  if (!videos || videos.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="text-lg font-medium text-slate-700 dark:text-zinc-200">
          Search something to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
      {videos.map((video) => (
        <VideoCard key={video.id} video={video} />
      ))}
    </div>
  );
}
