"use client";

import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";

import { THistoryVideo } from "@/types/video.type";
import { FallbackImage } from "../layout/FallbackImage";

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  }

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function parseYouTubeDuration(duration: string | null | undefined): number {
  if (!duration) return 0;

  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) return 0;

  return (
    Number(match[1] ?? 0) * 3600 +
    Number(match[2] ?? 0) * 60 +
    Number(match[3] ?? 0)
  );
}

function getProgressPercentage(item: THistoryVideo): number {
  if (item.completed) return 100;

  const duration =
    item.durationSeconds ?? parseYouTubeDuration(item.video.duration);

  if (duration <= 0 || item.watchedSeconds <= 0) {
    return 0;
  }

  return Math.min(100, Math.max(0, (item.watchedSeconds / duration) * 100));
}

function formatLastWatched(date: string | Date): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const diff = Math.max(0, Date.now() - parsedDate.getTime());

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return parsedDate.toLocaleDateString();
}

type HistoryVideoCardProps = {
  item: THistoryVideo;
  onDelete: (videoId: string) => void;
};

export function HistoryVideoCard({ item, onDelete }: HistoryVideoCardProps) {
  const { video } = item;

  const duration = item.durationSeconds ?? parseYouTubeDuration(video.duration);

  const progress = getProgressPercentage(item);

  const remainingSeconds = Math.max(0, duration - item.watchedSeconds);

  const channelAvatar = video.channel?.channelAvatar || "/default-avatar.png";

  const channelTitle = video.channel?.channelTitle || "Channel";

  return (
    <article className="group min-w-0 border-b border-zinc-800 pb-4">
      <div className="relative aspect-video w-full overflow-hidden bg-zinc-900">
        <Link href={`/watch/${video.id}`} className="absolute inset-0">
          <FallbackImage
            src={video.thumbnailUrl}
            fallback="/default-thumbnail.png"
            alt={video.title}
            className="h-full w-full object-cover"
          />
        </Link>

        {duration > 0 && (
          <span className="pointer-events-none absolute bottom-2 right-2 bg-black/90 px-1.5 py-0.5 text-[11px] font-medium text-white">
            {formatDuration(duration)}
          </span>
        )}

        {progress > 0 && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-1 bg-zinc-700/70">
            <div
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
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
          <div className="flex items-start gap-2">
            <Link href={`/watch/${video.id}`} className="min-w-0 flex-1">
              <h3
                className="line-clamp-2 text-sm font-medium leading-5 text-zinc-100 transition-colors group-hover:text-white"
                dangerouslySetInnerHTML={{
                  __html: video.title,
                }}
              />
            </Link>

            <button
              type="button"
              onClick={() => onDelete(video.id)}
              aria-label={`Remove ${video.title} from history`}
              className="shrink-0 cursor-pointer rounded-md p-1 text-zinc-500 transition hover:bg-zinc-800 hover:text-zinc-100 sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>

          <p className="mt-1 truncate text-xs text-zinc-400">{channelTitle}</p>

          <div className="mt-0.5 flex flex-wrap items-center text-xs text-zinc-500">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />

              <span>
                {item.completed
                  ? "Watched"
                  : `Watched ${formatDuration(item.watchedSeconds)}`}
              </span>
            </div>

            <span className="mx-1.5">•</span>

            <span>{formatLastWatched(item.lastWatchedAt)}</span>
          </div>

          {!item.completed && remainingSeconds > 0 && (
            <p className="mt-0.5 text-xs text-zinc-500">
              {formatDuration(remainingSeconds)} remaining
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
