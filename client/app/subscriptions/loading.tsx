export default function SubscriptionsLoading() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6">
      {/* Header */}
      <header className="border-b border-zinc-800 pb-5">
        <div className="h-7 w-40 animate-pulse bg-zinc-800 rounded" />
        <div className="mt-2 h-4 w-32 animate-pulse bg-zinc-900 rounded" />
      </header>

      {/* Channel list */}
      <div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="flex items-center gap-4 border-b border-zinc-800 py-4"
          >
            {/* Avatar */}
            <div className="h-12 w-12 shrink-0 animate-pulse rounded-full bg-zinc-800" />

            {/* Channel information */}
            <div className="min-w-0 flex-1">
              <div className="h-4 w-40 animate-pulse rounded bg-zinc-800" />
              <div className="mt-2 h-3 w-24 animate-pulse rounded bg-zinc-900" />
            </div>

            {/* Subscribe/action placeholder */}
            <div className="h-8 w-20 animate-pulse rounded bg-zinc-800" />
          </div>
        ))}
      </div>
    </main>
  );
}
