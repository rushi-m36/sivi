"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import VideoGrid from "../../components/video/VideoGrid";
import { TVideo } from "@/types/video.type";
import { fetchFromBackend } from "@/lib/api";

interface YoutubeSearchResponse {
  videos: TVideo[];
}

function SearchPageContent() {
  const router = useRouter();
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

  const handleSearch = (newQuery: string) => {
    if (!newQuery.trim()) return;

    router.push(`/search?q=${encodeURIComponent(newQuery.trim())}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-6">
        {error && (
          <div className="mb-6 rounded-lg border border-gray-300 bg-gray-100 px-4 py-3 text-sm text-black dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-xl border border-gray-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="aspect-video rounded-lg bg-gray-200 dark:bg-zinc-800" />
                <div className="mt-4 h-4 w-3/4 rounded bg-gray-200 dark:bg-zinc-800" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : videos.length > 0 ? (
          <VideoGrid videos={videos} />
        ) : (
          <div className="flex h-64 items-center justify-center text-lg text-slate-500 dark:text-zinc-400">
            Videos not found for "{query}"
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
        <div className="min-h-screen bg-white px-4 py-8 text-sm text-slate-500 dark:bg-black dark:text-zinc-400" />
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
