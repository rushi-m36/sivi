"use client";

import { History as HistoryIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { THistoryVideo } from "@/types/video.type";
import { fetchFromBackend } from "@/lib/api";
import { HistoryVideoCard } from "@/components/video/HistoryVideoCard";

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
            className="text-sm text-muted-foreground transition-colors hover:text-foreground cursor-pointer"
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
          {history.map((item) => (
            <HistoryVideoCard
              key={item.video.id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default History;
