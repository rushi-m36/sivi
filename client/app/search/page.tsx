"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import VideoGrid from "../../components/video/VideoGrid";
import { TVideo } from "@/types/video.type";
import { fetchFromBackend } from "@/lib/api";

interface YoutubeSearchResponse {
  videos: TVideo[];
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [videos, setVideos] = useState<TVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setVideos([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchFromBackend<YoutubeSearchResponse>(
        `/videos/search?q=${encodeURIComponent(searchQuery)}&maxResults=10`
      );

      setVideos(data.videos || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(query);
  }, [query]);

  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Header */}
        <header className="mb-6 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Search
          </p>

          <div className="flex items-center justify-between gap-4">
            <h1 className="min-w-0 truncate text-xl font-semibold tracking-tight sm:text-2xl">
              {query ? `Results for “${query}”` : "Search videos"}
            </h1>

            {!loading && !error && videos.length > 0 && (
              <span className="shrink-0 text-sm text-zinc-500 dark:text-zinc-400">
                {videos.length} {videos.length === 1 ? "video" : "videos"}
              </span>
            )}
          </div>
        </header>

        {/* Error */}
        {error && (
          <div className="mb-6 border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-700 dark:border-zinc-800 dark:bg-zinc-950 dark:text-zinc-300">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />

                <div className="mt-3 h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800" />

                <div className="mt-2 h-3 w-2/5 bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <div className="flex min-h-70 items-center justify-center border border-zinc-200 dark:border-zinc-800">
            <p className="px-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
              {query
                ? `No results found for “${query}”.`
                : "Start by searching for a video."}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-white dark:bg-black">
          <div className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8">
            <div className="h-6 w-40 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </main>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
