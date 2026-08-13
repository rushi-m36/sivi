"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3, Trash2 } from "lucide-react";
import { THistoryVideo } from "@/types/video.type";

function formatDuration(seconds: number): string {
  if (!seconds || seconds < 0) return "0:00";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

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

  const hours = Number(match[1] || 0);
  const minutes = Number(match[2] || 0);
  const seconds = Number(match[3] || 0);

  return hours * 3600 + minutes * 60 + seconds;
}

function getProgressPercentage(item: THistoryVideo): number {
  if (item.completed) return 100;

  const duration =
    item.durationSeconds ?? parseYouTubeDuration(item.video.duration);

  if (!duration || duration <= 0) return 0;

  return Math.min(100, Math.max(0, (item.watchedSeconds / duration) * 100));
}

function formatLastWatched(date: string | Date): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;

  const diff = Date.now() - parsedDate.getTime();

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

  const progress = getProgressPercentage(item);

  const duration = item.durationSeconds ?? parseYouTubeDuration(video.duration);

  return (
    <article className="group flex gap-4">
      {/* Thumbnail */}
      <Link
        href={`/watch/${video.id}`}
        className="relative block w-48 shrink-0 cursor-pointer overflow-hidden rounded-lg sm:w-56 md:w-64"
      >
        <div className="relative aspect-video">
          <Image
            src={video.thumbnailUrl}
            alt={video.title}
            fill
            sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, 256px"
            className="object-cover"
          />
        </div>

        {duration > 0 && (
          <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs text-white">
            {formatDuration(duration)}
          </span>
        )}

        {/* Watch progress */}
        {progress > 0 && !item.completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/40">
            <div
              className="h-full bg-red-600"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>
        )}

        {/* Completed indicator */}
        {item.completed && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600" />
        )}
      </Link>

      {/* Video information */}
      <div className="min-w-0 flex-1">
        <Link href={`/watch/${video.id}`} className="cursor-pointer">
          <h2 className="line-clamp-2 text-base font-medium leading-6 transition-colors group-hover:text-primary">
            {video.title}
          </h2>
        </Link>

        <p className="mt-1 text-sm text-muted-foreground">
          {video.channel?.channelTitle ?? "Unknown Channel"}
        </p>

        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
          <Clock3 className="h-3.5 w-3.5" />

          <span>
            {item.completed
              ? "Watched"
              : `Watched ${formatDuration(item.watchedSeconds)}`}
          </span>

          <span>•</span>

          <span>{formatLastWatched(item.lastWatchedAt)}</span>
        </div>

        {!item.completed && duration > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {formatDuration(Math.max(0, duration - item.watchedSeconds))}{" "}
            remaining
          </p>
        )}
      </div>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onDelete(video.id)}
        aria-label={`Remove ${video.title} from history`}
        className="cursor-pointer self-start rounded-md p-2 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </article>
  );
}
