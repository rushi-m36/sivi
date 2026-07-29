"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "../components/search/SearchBar";
import VideoGrid from "../components/video/VideoGrid";
import { YouTubeVideo } from "../types";

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchVideos = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_BACKEND_URL
        }/youtube/search?q=${encodeURIComponent(query)}&maxResults=10`
      );
      if (!response.ok) {
        let errorMsg = "Failed to fetch videos from the backend";
        try {
          const errData = await response.json();
          if (errData && errData.message) {
            errorMsg = errData.message;
          }
        } catch (_) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An error occurred while fetching videos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (searchQuery !== "" || null) {
      fetchVideos(searchQuery);
    }
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchVideos(query);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          {/* Logo */}
          <h1 className="text-2xl font-black tracking-tight text-black dark:text-white">
            Sivi
          </h1>

          {/* Search */}
          <div className="mx-6 flex max-w-xl flex-1">
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
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
        ) : (
          <VideoGrid videos={videos} />
        )}
      </main>
    </div>
  );
}
