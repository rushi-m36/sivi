export default function Loading() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        {/* Categories */}
        <section className="py-8 sm:py-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="h-6 w-28 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              <div className="mt-2 h-4 w-44 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
            </div>

            <div className="h-8 w-20 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Collapsed category row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="flex min-h-13 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950"
              >
                <div className="h-4.5 w-4.5 shrink-0 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

                <div className="h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        </section>

        {/* Subscriptions */}
        <section className="border-t border-zinc-200 py-8 dark:border-zinc-800 sm:py-10">
          <div className="mb-5">
            <div className="h-6 w-36 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

            <div className="mt-2 h-4 w-56 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Channel skeletons */}
          <div className="mb-8 flex gap-6 overflow-hidden">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="flex w-25 shrink-0 flex-col items-center"
              >
                <div className="h-20 w-20 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />

                <div className="mt-3 h-4 w-20 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
              </div>
            ))}
          </div>

          {/* Videos */}
          <div>
            <div className="mb-5 h-6 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

            <div className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="min-w-0">
                  <div className="aspect-video w-full animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800" />

                  <div className="mt-3 flex gap-3">
                    <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800" />

                    <div className="min-w-0 flex-1">
                      <div className="h-4 w-full animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="mt-2 h-4 w-3/4 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
