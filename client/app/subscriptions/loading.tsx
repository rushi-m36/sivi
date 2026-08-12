export default function SubscriptionsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-7 sm:px-6">
      {/* Header */}
      <header className="mb-6 border-b border-zinc-800 pb-5">
        <div className="h-7 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="mt-2 h-4 w-32 animate-pulse rounded bg-zinc-900" />
      </header>

      {/* Channels */}
      <section className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded bg-zinc-800" />
        </div>

        <div className="flex gap-4 overflow-hidden pb-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="flex w-52 shrink-0 items-center gap-4 rounded-xl px-4 py-3"
            >
              {/* Avatar */}
              <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-zinc-800" />

              <div className="min-w-0 flex-1">
                {/* Channel name */}
                <div className="h-4 w-24 animate-pulse rounded bg-zinc-800" />

                {/* Subscriber count */}
                <div className="mt-2 h-3 w-16 animate-pulse rounded bg-zinc-900" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Videos */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div className="h-6 w-52 animate-pulse rounded bg-zinc-800" />
          <div className="h-4 w-14 animate-pulse rounded bg-zinc-900" />
        </div>

        <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index}>
              {/* Thumbnail */}
              <div className="aspect-video w-full animate-pulse rounded bg-zinc-800" />

              {/* Video info */}
              <div className="mt-3 flex gap-3">
                {/* Channel avatar */}
                <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-zinc-800" />

                <div className="min-w-0 flex-1">
                  {/* Title */}
                  <div className="h-4 w-full animate-pulse rounded bg-zinc-800" />
                  <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-zinc-800" />

                  {/* Metadata */}
                  <div className="mt-2 h-3 w-1/2 animate-pulse rounded bg-zinc-900" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
