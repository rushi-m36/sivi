export default function Loading() {
  return (
    <main className="min-h-screen bg-white text-black dark:bg-black dark:text-white">
      <div className="mx-auto w-full max-w-[1600px] px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* Header skeleton */}
        <header className="mb-6 border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div className="mb-2 h-3 w-14 animate-pulse bg-zinc-200 dark:bg-zinc-800" />

          <div className="flex items-center justify-between gap-4">
            <div className="h-7 w-56 animate-pulse bg-zinc-200 dark:bg-zinc-800 sm:h-8" />

            <div className="h-4 w-16 animate-pulse bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </header>

        {/* Video grid skeleton */}
        <div className="grid grid-cols-1 gap-x-4 gap-y-7 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              {/* Thumbnail */}
              <div className="aspect-video w-full bg-zinc-200 dark:bg-zinc-800" />

              {/* Title */}
              <div className="mt-3 h-4 w-4/5 bg-zinc-200 dark:bg-zinc-800" />

              {/* Metadata */}
              <div className="mt-2 h-3 w-2/5 bg-zinc-200 dark:bg-zinc-800" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
