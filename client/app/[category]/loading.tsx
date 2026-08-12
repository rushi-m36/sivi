export default function Loading() {
  return (
    <main className="min-h-screen px-4 py-0">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <section className="py-8">
          <div className="mb-6 h-4 w-12 animate-pulse rounded bg-zinc-800" />

          <div className="h-8 w-48 animate-pulse rounded bg-zinc-800" />
        </section>

        {/* Trending */}
        <section className="border-t border-zinc-800 py-10">
          <div className="mb-5 h-7 w-28 animate-pulse rounded bg-zinc-800" />

          <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse border-b border-zinc-800 pb-4"
              >
                {/* Thumbnail */}
                <div className="aspect-video w-full bg-zinc-800" />

                {/* Channel + details */}
                <div className="mt-3 flex gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-zinc-800" />

                  <div className="min-w-0 flex-1">
                    <div className="h-4 w-full rounded bg-zinc-800" />
                    <div className="mt-2 h-4 w-3/4 rounded bg-zinc-800" />

                    <div className="mt-2 h-3 w-1/2 rounded bg-zinc-800" />
                    <div className="mt-1 h-3 w-2/5 rounded bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
