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
          className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500"
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
          className="h-10 w-full border rounded-lg border-zinc-800 bg-black pl-10 pr-11 text-sm text-white placeholder-zinc-600 outline-none transition-colors focus:border-zinc-500"
        />

        <button
          type="submit"
          className="cursor-pointer absolute right-0 top-0 flex h-10 w-10 items-center justify-center border-l border-zinc-800 text-zinc-500 transition-colors hover:bg-zinc-900 hover:text-white"
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
