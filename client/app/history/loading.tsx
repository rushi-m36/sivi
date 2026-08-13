export default function HistoryLoading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b border-zinc-200 pb-5 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />

            <div className="h-6 w-32 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />

            <div className="h-4 w-8 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
          </div>

          <div className="h-4 w-14 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
        </div>

        {/* History Cards */}
        <div className="space-y-5">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-xl border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950 sm:flex-row sm:gap-4 sm:border-0 sm:bg-transparent sm:p-0 dark:sm:bg-transparent"
            >
              {/* Thumbnail */}
              <div className="aspect-video w-full shrink-0 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800 sm:w-48 md:w-56 lg:w-64" />

              {/* Details */}
              <div className="flex min-w-0 flex-1 flex-col justify-between py-1">
                <div className="space-y-3">
                  {/* Title */}
                  <div className="h-4 w-full max-w-xl animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />

                  {/* Second title line */}
                  <div className="h-4 w-2/3 max-w-md animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />

                  {/* Channel */}
                  <div className="h-3 w-28 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Metadata */}
                <div className="mt-5 space-y-2">
                  <div className="h-3 w-40 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />

                  <div className="h-3 w-24 animate-pulse rounded-md bg-zinc-200 dark:bg-zinc-800" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
