"use client";

import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export function SearchBar({ onSearch, initialValue = "" }: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-5.2-5.2m1.7-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
          />
        </svg>

        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos..."
          autoComplete="off"
          className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/70 px-4 text-sm text-slate-900 placeholder-slate-400 backdrop-blur-md transition-all duration-200 focus:border-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 dark:border-zinc-800/80 dark:bg-zinc-900/70 dark:text-zinc-100 dark:placeholder-zinc-500 dark:focus:border-white dark:focus:bg-zinc-900 dark:focus:ring-white/20"
        />

        <button
          type="submit"
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-zinc-800 dark:hover:text-white"
          aria-label="Search"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-5.2-5.2m1.7-5a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
