"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "../search/SearchBar";

interface NavbarProps {
  query?: string;
  onSearch: (query: string) => void;
}

export function Navbar({ query = "", onSearch }: NavbarProps) {
  const router = useRouter();

  return (
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
          <SearchBar onSearch={onSearch} initialValue={query} />
        </div>

        {/* Donate */}
        <button className="rounded-lg border border-black bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-white hover:text-black dark:border-white dark:bg-white dark:text-black dark:hover:bg-black dark:hover:text-white">
          Donate
        </button>
      </div>
    </header>
  );
}
