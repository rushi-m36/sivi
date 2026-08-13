"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";

import { THistoryVideo } from "@/types/video.type";

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

  return (
    <article className="group flex min-w-0 flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 transition hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700 sm:flex-row sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0 dark:sm:bg-transparent">
      {/* Thumbnail */}
      <Link
        href={`/watch/${video.id}`}
        className="relative block w-full shrink-0 overflow-hidden rounded-lg bg-zinc-100 dark:bg-zinc-900 sm:w-48 md:w-56 lg:w-64"
      >
        <div className="relative aspect-video w-full">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="
              (max-width: 639px) 100vw,
              (max-width: 767px) 192px,
              (max-width: 1023px) 224px,
              256px
            "
            className="object-cover transition duration-300"
          />
        </div>

        {duration > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/90 px-1.5 py-0.5 font-mono text-[10px] text-white sm:text-xs">
            {formatDuration(duration)}
          </span>
        )}

        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700/70">
            <div
              className="h-full bg-white"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </Link>

      {/* Details */}
      <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
        <div className="flex min-w-0 items-start justify-between gap-3">
          <Link href={`/watch/${video.id}`} className="min-w-0 flex-1">
            <h2 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-900 transition-colors group-hover:text-zinc-700 dark:text-zinc-100 dark:group-hover:text-white sm:text-base">
              {video.title}
            </h2>
          </Link>

          <button
            type="button"
            onClick={() => onDelete(video.id)}
            aria-label={`Remove ${video.title} from history`}
            className="shrink-0 cursor-pointer rounded-lg p-1.5 text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-white sm:opacity-0 sm:group-hover:opacity-100 focus-visible:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div>
          <p className="mt-1 truncate text-xs text-zinc-500 dark:text-zinc-400 sm:text-sm">
            {video.channel?.channelTitle ?? "Unknown Channel"}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-xs">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 sm:h-3.5 sm:w-3.5" />

              <span>
                {item.completed
                  ? "Watched"
                  : `Watched ${formatDuration(item.watchedSeconds)}`}
              </span>
            </div>

            <span>•</span>

            <span>{formatLastWatched(item.lastWatchedAt)}</span>
          </div>

          {!item.completed && remainingSeconds > 0 && (
            <p className="mt-1 text-[11px] text-zinc-500 dark:text-zinc-400 sm:text-xs">
              {formatDuration(remainingSeconds)} remaining
            </p>
          )}
        </div>
      </div>
    </article>
  );
}
