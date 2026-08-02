"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "../components/search/SearchBar";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="flex flex-col items-center px-4 pt-10">
      <div className="w-full max-w-3xl text-center">
        <h1 className="mb-3 text-6xl font-black tracking-tight text-black dark:text-white">
          Sivi
        </h1>

        <p className="mb-8 text-lg text-slate-600 dark:text-zinc-400">
          Search YouTube without the clutter.
        </p>

        <SearchBar onSearch={handleSearch} />

        <p className="mt-6 text-sm text-slate-500 dark:text-zinc-500">
          No Feed. No Shorts.
        </p>
      </div>
    </main>
  );
}
