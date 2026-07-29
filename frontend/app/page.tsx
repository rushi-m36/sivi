"use client";

import { useRouter } from "next/navigation";
import SearchBar from "../components/search/SearchBar";

export default function Home() {
  const router = useRouter();

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white px-4 dark:bg-black">
      <div className="mb-3 flex flex-col items-center justify-center">
        <h1 className="mb-2 text-6xl font-black tracking-tight text-black dark:text-white">
          Sivi
        </h1>
        <p className="mb-2 text-center text-lg text-slate-600 dark:text-zinc-400">
          Cutting The Noise.
        </p>
      </div>

      <div className="w-full max-w-2xl">
        <SearchBar onSearch={handleSearch} />
      </div>
    </main>
  );
}
