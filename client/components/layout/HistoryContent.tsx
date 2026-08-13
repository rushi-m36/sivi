"use client";

import { History as HistoryIcon } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useState } from "react";

import { THistoryVideo } from "@/types/video.type";
import { fetchFromBackend } from "@/lib/api";
import { HistoryVideoCard } from "@/components/video/HistoryVideoCard";

interface HistoryContentProps {
  initialHistory: THistoryVideo[];
}

export function HistoryContent({ initialHistory }: HistoryContentProps) {
  const { getToken } = useAuth();

  const [history, setHistory] = useState<THistoryVideo[]>(initialHistory);

  const handleDelete = async (videoId: string) => {
    const previousHistory = history;

    setHistory((current) =>
      current.filter((item) => item.video.id !== videoId)
    );

    try {
      const token = await getToken();

      if (!token) {
        throw new Error("Unauthorized");
      }

      await fetchFromBackend(`/history/${videoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to delete history item:", error);

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
      const token = await getToken();

      if (!token) {
        throw new Error("Unauthorized");
      }

      await fetchFromBackend("/history", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error("Failed to clear history:", error);

      setHistory(previousHistory);
    }
  };

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
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
              className="shrink-0 cursor-pointer text-sm text-zinc-500 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
            >
              Clear all
            </button>
          )}
        </div>

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
