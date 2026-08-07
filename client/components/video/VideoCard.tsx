import Link from "next/link";
import { TVideo } from "../../types/video.type";
import {
  formatVideoDuration,
  formatViewCount,
  formatPublishedAt,
} from "../../lib/youtube";
import { FallbackImage } from "../layout/FallbackImage";

interface VideoCardProps {
  video: TVideo;
}

export function VideoCard({ video }: VideoCardProps) {
  const duration = video.duration ? formatVideoDuration(video.duration) : "";
  const views = video.viewCount ? formatViewCount(video.viewCount) : "";
  const published = formatPublishedAt(video.publishedAt);

  const channelAvatar = video.channel?.channelAvatar || "/default-avatar.png";
  const channelTitle = video.channel?.channelTitle || "Channel";

  return (
    <Link
      href={`/watch/${video.id}`}
      className="group flex flex-col gap-2 rounded-[1.25rem] border border-slate-200/80 bg-white/80 p-2 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg dark:border-zinc-800 dark:bg-zinc-900/70 dark:hover:border-red-500/40"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
        <FallbackImage
          src={video.thumbnailUrl}
          fallback="/default-thumbnail.png"
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

        {duration && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
            {duration}
          </span>
        )}
      </div>

      <div className="flex gap-3 px-1 pb-1">
        <FallbackImage
          src={channelAvatar}
          alt={channelTitle}
          fallback="/default-thumbnail.png"
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />

        <div className="flex-1 min-w-0">
          <h3
            className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors duration-200 group-hover:text-red-600 dark:text-zinc-50 dark:group-hover:text-red-400"
            dangerouslySetInnerHTML={{ __html: video.title }}
          />

          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {channelTitle}
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
