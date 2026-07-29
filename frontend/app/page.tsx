"use client";

import React, { useState, useEffect } from "react";
import SearchBar from "../components/search/SearchBar";
import VideoGrid from "../components/video/VideoGrid";
import { YouTubeVideo } from "../types";

export default function Home() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("web development");

  const fetchVideos = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`the query: ${encodeURIComponent(query)}`);
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
    fetchVideos(searchQuery);
  }, []);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    fetchVideos(query);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-red-600">
              Sivi
            </span>
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
              MVP
            </span>
          </div>

          <div className="flex flex-1 max-w-md mx-8">
            <SearchBar onSearch={handleSearch} initialValue={searchQuery} />
          </div>

          <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-sm text-slate-700 dark:text-slate-300">
            U
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Trending Videos"}
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Showing results from YouTube API.
          </p>
        </div>

        {error && (
          <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/30 dark:text-red-400 mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 animate-pulse">
                <div className="aspect-video w-full rounded-xl bg-slate-200 dark:bg-zinc-800" />
                <div className="h-4 w-3/4 rounded bg-slate-200 dark:bg-zinc-800" />
                <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-zinc-800" />
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
