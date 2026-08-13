"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3, History as HistoryIcon, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { THistoryVideo } from "@/types/video.type";
import { fetchFromBackend } from "@/lib/api";

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

// Updated to accept both string ISO dates and native Date instances
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

const History = () => {
  const [history, setHistory] = useState<THistoryVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await fetchFromBackend<THistoryVideo[]>("/history");

        setHistory(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load watch history"
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const handleDelete = async (videoId: string) => {
    try {
      await fetchFromBackend(`/history/${videoId}`, {
        method: "DELETE",
      });

      setHistory((current) =>
        current.filter((item) => item.video.id !== videoId)
      );
    } catch (error) {
      console.error("Failed to delete history:", error);
    }
  };

  const handleClearHistory = async () => {
    try {
      await fetchFromBackend("/history", {
        method: "DELETE",
      });

      setHistory([]);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="mb-6 h-7 w-32 animate-pulse rounded bg-muted" />

        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="flex gap-4">
              <div className="aspect-video w-48 shrink-0 animate-pulse rounded-lg bg-muted" />

              <div className="flex-1 space-y-3 py-1">
                <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto w-full max-w-7xl px-4 py-6">
        <div className="rounded-lg border border-destructive/30 p-6 text-sm text-destructive">
          {error}
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <HistoryIcon className="h-5 w-5" />

          <h1 className="text-xl font-semibold">Watch History</h1>

          {history.length > 0 && (
            <span className="text-sm text-muted-foreground">
              {history.length}
            </span>
          )}
        </div>

        {history.length > 0 && (
          <button
            type="button"
            onClick={handleClearHistory}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Clear history
          </button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="flex min-h-100 flex-col items-center justify-center text-center">
          <HistoryIcon className="mb-4 h-10 w-10 text-muted-foreground" />

          <h2 className="text-lg font-medium">No watch history</h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Videos you watch will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {history.map((item) => {
            const { video } = item;
            const progress = getProgressPercentage(item);

            const duration =
              item.durationSeconds ?? parseYouTubeDuration(video.duration);

            return (
              <article key={video.id} className="group flex gap-4">
                <Link
                  href={`/watch/${video.id}`}
                  className="relative block w-48 shrink-0 overflow-hidden rounded-lg sm:w-56 md:w-64"
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

                  {item.completed && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-green-600" />
                  )}
                </Link>

                <div className="min-w-0 flex-1">
                  <Link href={`/watch/${video.id}`}>
                    <h2 className="line-clamp-2 text-base font-medium leading-6 transition-colors group-hover:text-primary">
                      {video.title}
                    </h2>
                  </Link>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {/* Safe optional chaining fix */}
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
                      {formatDuration(
                        Math.max(0, duration - item.watchedSeconds)
                      )}{" "}
                      remaining
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(video.id)}
                  aria-label={`Remove ${video.title} from history`}
                  className="self-start rounded-md p-2 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default History;
