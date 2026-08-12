"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SearchBar } from "../components/search/SearchBar";

export default function Home() {
  const router = useRouter();
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem("sivi-disclaimer-dismissed");

    if (dismissed !== "true") {
      setShowDisclaimer(true);
    }
  }, []);

  const handleSearch = (query: string) => {
    if (!query.trim()) return;

    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const closeDisclaimer = () => {
    setShowDisclaimer(false);
  };

  const dontShowAgain = () => {
    localStorage.setItem("sivi-disclaimer-dismissed", "true");
    setShowDisclaimer(false);
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center px-0">
           {" "}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm">
                   {" "}
          <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950">
                       {" "}
            <button
              onClick={closeDisclaimer}
              aria-label="Close disclaimer"
              className="absolute right-4 top-4 text-xl text-zinc-400 transition hover:text-zinc-900 dark:hover:text-white"
            >
                            ×            {" "}
            </button>
                       {" "}
            <div className="pr-6">
                           {" "}
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                                A quick note about SIVI              {" "}
              </h2>
                           {" "}
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                SIVI is currently deployed on a free-tier server
                that may                 temporarily stop when there is no
                activity. Because of this, the                 first load may
                take a few seconds while the server starts again.              
                  After that, SIVI should load normally and quickly.            
                 {" "}
              </p>
                           {" "}
              <p className="mt-3 text-sm leading-6 text-zinc-600 dark:text-zinc-400">
                                We plan to move to a paid server soon for a
                faster and more                 consistent experience. Until
                then, please be patient with the                 initial load.  
                           {" "}
              </p>
                         {" "}
            </div>
                       {" "}
            <div className="mt-5 flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
                           {" "}
              <button
                onClick={dontShowAgain}
                className="text-sm text-zinc-500 transition hover:text-zinc-900 dark:hover:text-white"
              >
                                Don&apos;t show again              {" "}
              </button>
                           {" "}
              <button
                onClick={closeDisclaimer}
                className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                                Continue              {" "}
              </button>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
      )}
           {" "}
      <div className="w-full max-w-2xl text-center">
               {" "}
        <div>
                   {" "}
          <h1 className="text-4xl font-bold tracking-tight text-zinc-900 dark:text-white">
                        SIVI          {" "}
          </h1>
                   {" "}
          <p className="mt-2 text-sm text-zinc-500 sm:text-base">
                        YouTube Client for Learners.          {" "}
          </p>
                 {" "}
        </div>
                <SearchBar onSearch={handleSearch} />     {" "}
      </div>
         {" "}
    </main>
  );
}
