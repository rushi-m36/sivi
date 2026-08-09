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
      className="group block min-w-0 border-b border-zinc-800 pb-4"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <FallbackImage
          src={video.thumbnailUrl}
          fallback="/default-thumbnail.png"
          alt={video.title}
          className="h-full w-full object-cover"
        />

        {duration && (
          <span className="absolute bottom-2 right-2 bg-black/90 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {duration}
          </span>
        )}
      </div>

      <div className="mt-3 flex gap-3">
        <FallbackImage
          src={channelAvatar}
          alt={channelTitle}
          fallback="/default-avatar.png"
          className="h-9 w-9 shrink-0 rounded-full object-cover"
        />

        <div className="min-w-0 flex-1">
          <h3
            className="line-clamp-2 text-sm font-medium leading-5 text-zinc-100"
            dangerouslySetInnerHTML={{ __html: video.title }}
          />

          <p className="mt-1 truncate text-xs text-zinc-400">{channelTitle}</p>

          <div className="mt-0.5 flex items-center text-xs text-zinc-500">
            {views && <span>{views}</span>}
            {views && published && <span className="mx-1.5">•</span>}
            {published && <span>{published}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}
