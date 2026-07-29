"use client";
/* @jsxImportSource react */

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SearchBar from "../../components/search/SearchBar";
import VideoGrid from "../../components/video/VideoGrid";
import { YouTubeVideo } from "../../types";

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") || "";

  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
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
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/youtube/search?q=${encodeURIComponent(searchQuery)}&maxResults=10`
      );

      if (!response.ok) {
        let errorMsg = "Failed to fetch videos";

        try {
          const errData = await response.json();
          errorMsg = errData.message || errorMsg;
        } catch {}

        throw new Error(errorMsg);
      }

      const data = await response.json();
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
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <button
            onClick={() => router.push("/")}
            className="text-2xl font-black tracking-tight text-black dark:text-white"
          >
            Sivi
          </button>

          {/* Search */}
          <div className="mx-6 flex max-w-xl flex-1">
            <SearchBar onSearch={handleSearch} initialValue={query} />
          </div>

          {/* Donate */}
          <button className="rounded-lg border border-black bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white">
            Donate
          </button>
        </div>
      </header>

      {/* Main */}
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
            Search only what you came here for.
          </div>
        )}
      </main>
    </div>
  );
}
