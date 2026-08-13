"use client";

import { History as HistoryIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useEffect, useState } from "react";

import { THistoryVideo } from "@/types/video.type";
import { fetchFromBackend } from "@/lib/api";
import { HistoryVideoCard } from "@/components/video/HistoryVideoCard";

export default function HistoryPage() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  const [history, setHistory] = useState<THistoryVideo[]>([]);
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
    const token = await getToken();

    if (!token) {
      throw new Error("Unauthorized");
    }

    return {
      Authorization: `Bearer ${token}`,
    };
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    let cancelled = false;

    if (!isSignedIn) {
      setError("You must be signed in to view your watch history.");
      return;
    }

    const loadHistory = async () => {
      try {
        setError(null);

        const headers = await getAuthHeaders();

        const data = await fetchFromBackend<THistoryVideo[]>("/history", {
          headers,
        });

        if (!cancelled) {
          setHistory(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error ? err.message : "Failed to load watch history"
          );
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [isLoaded, isSignedIn, getAuthHeaders]);

  const handleDelete = async (videoId: string) => {
    const previousHistory = history;

    setHistory((current) =>
      current.filter((item) => item.video.id !== videoId)
    );

    try {
      const headers = await getAuthHeaders();

      await fetchFromBackend(`/history/${videoId}`, {
        method: "DELETE",
        headers,
      });
    } catch (err) {
      console.error("Failed to delete history item:", err);
      setHistory(previousHistory);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your watch history?")) {
      return;
    }

    const previousHistory = history;

    setHistory([]);

    try {
      const headers = await getAuthHeaders();

      await fetchFromBackend("/history", {
        method: "DELETE",
        headers,
      });
    } catch (err) {
      console.error("Failed to clear history:", err);
      setHistory(previousHistory);
    }
  };

  if (!isLoaded) {
    return null;
  }

  if (!isSignedIn) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="rounded-xl border border-zinc-200 py-10 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              You must be signed in to view your watch history.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="rounded-xl border border-zinc-200 py-10 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-3">
            <HistoryIcon className="h-5 w-5 shrink-0 text-zinc-500 dark:text-zinc-400" />

            <h1 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Watch History
            </h1>

            {history.length > 0 && (
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                ({history.length})
              </span>
            )}
          </div>

          {history.length > 0 && (
            <button
              type="button"
              onClick={handleClearHistory}
              className="cursor-pointer shrink-0 text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Content */}
        {history.length === 0 ? (
          <div className="flex min-h-[50vh] flex-col items-center justify-center text-center">
            <HistoryIcon className="mb-4 h-10 w-10 text-zinc-400 dark:text-zinc-600" />

            <h2 className="text-lg font-medium text-zinc-800 dark:text-zinc-200">
              No watch history
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
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
      </div>
    </main>
  );
}
