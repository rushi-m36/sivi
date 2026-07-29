"use client";

import React, { useState } from "react";

interface SearchBarProps {
  onSearch: (query: string) => void;
  initialValue?: string;
}

export default function SearchBar({
  onSearch,
  initialValue = "",
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full items-center gap-2">
      <div className="relative flex-1">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos..."
          className="w-full h-10 rounded-full border border-slate-300 bg-slate-50 px-4 pr-10 text-sm focus:border-red-500 focus:bg-black focus:outline-none dark:border-zinc-700 dark:bg-zinc-800 dark:text-white dark:focus:border-red-500"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </form>
  );
}
