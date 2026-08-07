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
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl rounded-4xl border border-black/10 bg-white/90 p-8 text-center shadow-[0_20px_70px_-25px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-black/80 sm:p-10">
        <h1 className="mb-3 text-4xl font-black tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
          Sivi
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-base text-slate-600 dark:text-zinc-400 sm:text-lg">
          YouTube Client for Learners.
        </p>

        <SearchBar onSearch={handleSearch} />
      </div>
    </main>
  );
}
