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
        {/* Search Icon */}
        <svg
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-400"
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
          className="
            h-10
            w-full
            rounded-full
            border
            border-zinc-200
            bg-zinc-100/80
            pl-12
            pr-12
            text-[15px]
            text-zinc-900
            placeholder:text-zinc-500
            outline-none
            transition-all
            duration-200
            focus:border-zinc-400
            focus:bg-white
            focus:shadow-md
            dark:border-zinc-800
            dark:bg-zinc-900
            dark:text-white
            dark:placeholder:text-zinc-500
            dark:focus:border-zinc-600
            dark:focus:bg-zinc-950
          "
        />

        <button
          type="submit"
          className="
            absolute
            right-2
            top-1/2
            flex
            h-8
            w-8
            -translate-y-1/2
            items-center
            justify-center
            rounded-full
            text-zinc-500
            transition
            hover:bg-zinc-200
            hover:text-black
            dark:hover:bg-zinc-800
            dark:hover:text-white
          "
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
