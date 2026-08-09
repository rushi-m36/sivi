export default function WatchLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Video section */}
        <div className="min-w-0 lg:col-span-2">
          <div className="lg:sticky lg:top-4">
            {/* Video player skeleton */}
            <div className="aspect-video w-full animate-pulse bg-zinc-900" />

            <div className="border-b border-zinc-800 py-4">
              {/* Title skeleton */}
              <div className="space-y-2">
                <div className="h-5 w-4/5 animate-pulse bg-zinc-800 sm:h-6" />
                <div className="h-5 w-2/5 animate-pulse bg-zinc-800 sm:h-6" />
              </div>

              {/* Channel skeleton */}
              <div className="mt-4 flex items-center gap-3">
                <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-zinc-800" />

                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse bg-zinc-800" />
                  <div className="h-3 w-24 animate-pulse bg-zinc-800" />
                </div>
              </div>

              {/* Description skeleton */}
              <div className="mt-4 border border-zinc-800 bg-zinc-900 p-3">
                <div className="h-4 w-40 animate-pulse bg-zinc-800" />

                <div className="mt-3 space-y-2">
                  <div className="h-3 w-full animate-pulse bg-zinc-800" />
                  <div className="h-3 w-11/12 animate-pulse bg-zinc-800" />
                  <div className="h-3 w-3/4 animate-pulse bg-zinc-800" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comments section */}
        <div className="min-w-0">
          <div className="border-b border-zinc-800 pb-4">
            <div className="h-5 w-28 animate-pulse bg-zinc-800" />
          </div>

          <div>
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="border-b border-zinc-800 py-4">
                <div className="flex gap-3">
                  <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-zinc-800" />

                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="h-3 w-32 animate-pulse bg-zinc-800" />
                    <div className="h-3 w-full animate-pulse bg-zinc-800" />
                    <div className="h-3 w-4/5 animate-pulse bg-zinc-800" />
                    <div className="h-3 w-16 animate-pulse bg-zinc-800" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
