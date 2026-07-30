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
    onSearch(query);
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search videos..."
          className="
        h-11
        w-full
        rounded-full
        border
        border-gray-300
        bg-white
        px-5
        pr-12
        text-sm
        text-black
        placeholder:text-gray-500
        outline-none
        transition-all
        duration-200
        focus:border-black
        dark:border-zinc-700
        dark:bg-black
        dark:text-white
        dark:placeholder:text-zinc-500
        dark:focus:border-white
      "
        />

        <button
          type="submit"
          className="
        absolute
        right-4
        top-1/2
        -translate-y-1/2
        text-gray-500
        transition-colors
        hover:text-black
        dark:text-zinc-400
        dark:hover:text-white
      "
          aria-label="Search"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
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
