import React from 'react';
import SearchBar from '../components/search/SearchBar';
import VideoGrid from '../components/video/VideoGrid';

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-zinc-800 dark:bg-zinc-900/95">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tight text-red-600">Sivi</span>
            <span className="rounded bg-red-100 px-1.5 py-0.5 text-xs font-bold text-red-600 dark:bg-red-950/50 dark:text-red-400">
              MVP
            </span>
          </div>
          
          <div className="flex flex-1 max-w-md mx-8">
            <SearchBar />
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
            Search Results
          </h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            Type in the search bar above to fetch videos.
          </p>
        </div>

        {/* Video Grid Placeholder */}
        <VideoGrid />
      </main>
    </div>
  );
}
