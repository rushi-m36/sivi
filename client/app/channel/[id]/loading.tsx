export default function ChannelLoading() {
  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {/* Channel header */}
        <header className="border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              {/* Avatar */}
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800 sm:h-20 sm:w-20" />

              <div className="min-w-0">
                {/* Channel name */}
                <div className="h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 sm:h-7 sm:w-48" />

                {/* Subscribers */}
                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            </div>

            {/* Subscribe button */}
            <div className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </header>

        <main className="pt-6 sm:pt-8">
          {/* Videos heading */}
          <div className="mb-4 h-6 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800 sm:mb-5" />

          {/* Video grid */}
          <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                {/* Thumbnail */}
                <div className="aspect-video w-full rounded-lg bg-zinc-200 dark:bg-zinc-800" />

                {/* Title */}
                <div className="mt-3 space-y-2">
                  <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                  <div className="h-4 w-2/3 rounded bg-zinc-200 dark:bg-zinc-800" />
                </div>

                {/* Metadata */}
                <div className="mt-2 h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
