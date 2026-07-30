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
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-black">
      <div className="w-full max-w-3xl text-center">
        <h1 className="mb-3 text-6xl font-black tracking-tight text-black dark:text-white">
          Sivi
        </h1>

        <p className="mb-8 text-lg text-slate-600 dark:text-zinc-400">
          Search YouTube without the clutter.
        </p>

        <SearchBar onSearch={handleSearch} />

        <p className="mt-6 text-sm text-slate-500 dark:text-zinc-500">
          No homepage. No Shorts. No recommendations.
          <br />
          Just search what you came here for.
        </p>
      </div>
    </main>
  );
}
