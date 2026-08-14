import { History as HistoryIcon } from "lucide-react";

function HistoryCardSkeleton() {
  return (
    <div className="flex animate-pulse flex-col gap-4 sm:flex-row">
      <div className="aspect-video w-full shrink-0 rounded-lg bg-zinc-200 dark:bg-zinc-800 sm:w-64 lg:w-72" />

      <div className="flex min-w-0 flex-1 flex-col py-1">
        <div className="h-5 w-4/5 rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="mt-3 space-y-2">
          <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-800" />
          <div className="h-3 w-24 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        <div className="mt-auto pt-4">
          <div className="h-3 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div className="flex min-w-0 items-center gap-3">
            <HistoryIcon className="h-5 w-5 shrink-0 text-zinc-300 dark:text-zinc-700" />

            <div className="h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

            <div className="h-4 w-7 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="h-5 w-14 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* History items */}
        <div className="space-y-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <HistoryCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
