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
    <div className="min-h-screen bg-transparent">
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 rounded-[1.75rem] border border-black/10 bg-white/90 p-4 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-black/80 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-black dark:text-white">
                Search results
              </p>
              <h1 className="text-xl font-semibold text-slate-900 dark:text-white sm:text-2xl">
                {query ? `Results for “${query}”` : "Search videos"}
              </h1>
            </div>
            {!loading && !error && (
              <div className="rounded-full border border-black/10 bg-black/5 px-3 py-1 text-sm text-slate-700 dark:border-white/10 dark:bg-white/10 dark:text-zinc-300">
                {videos.length} {videos.length === 1 ? "video" : "videos"}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black dark:border-white/10 dark:bg-white/10 dark:text-white">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-[1.25rem] border border-slate-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="aspect-video rounded-xl bg-slate-200 dark:bg-zinc-800" />
                <div className="mt-4 h-4 w-3/4 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="mt-2 h-3 w-1/2 rounded bg-slate-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-[1.75rem] border border-dashed border-black/10 bg-white/70 text-center text-lg text-slate-600 shadow-sm dark:border-white/10 dark:bg-black/70 dark:text-zinc-400">
            {query
              ? `No results found for “${query}”.`
              : "Start by searching for a video."}
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen px-4 py-8 text-sm text-slate-500 dark:text-zinc-400" />
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
