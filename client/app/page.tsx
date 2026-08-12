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
    <main className="relative flex min-h-screen items-center justify-center px-0">
      <div className="w-full max-w-2xl text-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
            SIVI
          </h1>

          <p className="mt-2 text-sm text-zinc-500 sm:text-base">
            YouTube Client for Learners.
          </p>
        </div>

        <SearchBar onSearch={handleSearch} />
      </div>
    </main>
  );
}
