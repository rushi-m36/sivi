"use client";

import Link from "next/link";
import { Clock, Trash2 } from "lucide-react";

import { THistoryVideo } from "@/types/video.type";
import { FallbackImage } from "../layout/FallbackImage";

// --- HELPERS ---

function formatDuration(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) return "0:00";

  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  const pad = (num: number) => String(num).padStart(2, "0");

  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

function parseISO8601Duration(duration?: string | null): number {
  if (!duration) return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const [, h, m, s] = match;
  return Number(h ?? 0) * 3600 + Number(m ?? 0) * 60 + Number(s ?? 0);
}

function getProgressPercentage(item: THistoryVideo, duration: number): number {
  if (item.completed) return 100;
  if (duration <= 0 || item.watchedSeconds <= 0) return 0;
  return Math.min(100, Math.max(0, (item.watchedSeconds / duration) * 100));
}

function formatLastWatched(date: string | Date): string {
  const parsedDate = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(parsedDate.getTime())) return "";

  const diffMs = Date.now() - parsedDate.getTime();
  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return parsedDate.toLocaleDateString();
}

// --- MAIN COMPONENT ---

type HistoryVideoCardProps = {
  item: THistoryVideo;
  onDelete: (videoId: string) => void;
};

export function HistoryVideoCard({ item, onDelete }: HistoryVideoCardProps) {
  const { video } = item;

  const duration = item.durationSeconds ?? parseISO8601Duration(video.duration);
  const progress = getProgressPercentage(item, duration);
  const remainingSeconds = Math.max(0, duration - item.watchedSeconds);

  const channelAvatar = video.channel?.channelAvatar || "/default-avatar.png";
  const channelTitle = video.channel?.channelTitle || "Channel";

  return (
    <article className="group relative flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:gap-4">
      {/* 1. Thumbnail Container */}
      <Link
        href={`/watch/${video.id}`}
        className="relative aspect-video w-full shrink-0 overflow-hidden rounded-md bg-zinc-900 sm:w-48 md:w-56 lg:w-64"
      >
        <FallbackImage
          src={video.thumbnailUrl}
          fallback="/default-thumbnail.png"
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
        />

        {/* Video Duration Badge */}
        {duration > 0 && (
          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/80 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-xs">
            {formatDuration(duration)}
          </span>
        )}

        {/* Progress Bar */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-700/80">
            <div
              className="h-full bg-red-600 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </Link>

      {/* 2. Video Info & Actions */}
      <div className="flex flex-1 items-start justify-between gap-2 min-w-0">
        <div className="flex flex-1 gap-3 min-w-0">
          {/* Channel Avatar (Mobile / Small Screens) */}
          <FallbackImage
            src={channelAvatar}
            alt={channelTitle}
            fallback="/default-avatar.png"
            className="h-9 w-9 shrink-0 rounded-full object-cover sm:hidden"
          />

          <div className="min-w-0 flex-1">
            {/* Title */}
            <Link href={`/watch/${video.id}`} className="block">
              <h3 className="line-clamp-2 text-sm font-medium leading-snug text-zinc-100 transition group-hover:text-white md:text-base">
                {video.title}
              </h3>
            </Link>

            {/* Channel Title */}
            <p className="mt-1 truncate text-xs text-zinc-400 md:text-sm">
              {channelTitle}
            </p>

            {/* Metadata (Watch state & time) */}
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-zinc-400">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 shrink-0" />
                <span>
                  {item.completed
                    ? "Watched"
                    : `Watched ${formatDuration(item.watchedSeconds)}`}
                </span>
              </div>

              <span>•</span>
              <span>{formatLastWatched(item.lastWatchedAt)}</span>

              {!item.completed && remainingSeconds > 0 && (
                <>
                  <span>•</span>
                  <span className="text-zinc-500">
                    {formatDuration(remainingSeconds)} remaining
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete Action Button */}
        <button
          type="button"
          onClick={() => onDelete(video.id)}
          aria-label={`Remove ${video.title} from history`}
          className="shrink-0 rounded-full p-2 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 focus-visible:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
