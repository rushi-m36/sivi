import Link from "next/link";
import { YouTubeVideo } from "../../interfaces/video.interface";
import {
  formatVideoDuration,
  formatViewCount,
  formatPublishedAt,
} from "../../lib/youtube";
import { FallbackImage } from "../layout/FallbackImage";

interface VideoCardProps {
  video: YouTubeVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  const duration = video.duration ? formatVideoDuration(video.duration) : "";
  const views = video.viewCount ? formatViewCount(video.viewCount) : "";
  const published = formatPublishedAt(video.publishedAt);

  return (
    <Link href={`/watch/${video.id}`} className="group flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}

        <FallbackImage
          src={video.thumbnailUrl}
          fallback="/default-thumbnail.png"
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        )}
      </div>

      <div className="flex gap-3 px-1">
        {/* Channel Avatar */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <FallbackImage
          src={video.channelAvatar || "/default-avatar.png"}
          alt={video.channelTitle}
          fallback="/default-thumbnail.png"
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />

        <div className="flex-1">
          <h3
            className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-zinc-50 group-hover:text-red-600 dark:group-hover:text-red-400"
            dangerouslySetInnerHTML={{ __html: video.title }}
          />

          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {video.channelTitle}
          </p>

          <div className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
            {views && <span>{views}</span>}
            {views && published && <span className="mx-1.5">•</span>}
            {published && <span>{published}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
