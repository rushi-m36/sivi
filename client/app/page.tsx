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
      <div className="w-full max-w-2xl text-center">
        <div className="mb-8 border-b border-zinc-800 pb-6 sm:mb-10 sm:pb-8">
          <h1 className="text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Sivi
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
