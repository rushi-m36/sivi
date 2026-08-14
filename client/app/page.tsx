import { Suspense } from "react";

import { Categories } from "@/components/layout/Categories";
import Subscriptions from "@/components/layout/Subscriptions";

function SubscriptionsSkeleton() {
  return (
    <section className="border-t border-zinc-200 py-8 dark:border-zinc-800 sm:py-10">
      <div className="mb-5">
        <div className="h-6 w-40 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
        <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="flex gap-6 overflow-hidden pb-2">
        {Array.from({ length: 6 }).map((_, index) => (
          <div
            key={index}
            className="h-24 w-24 shrink-0 animate-pulse rounded-full bg-zinc-200 dark:bg-zinc-800"
          />
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-5 h-5 w-32 animate-pulse rounded bg-zinc-200 dark:bg-zinc-800" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="h-52 animate-pulse rounded-xl bg-zinc-200 dark:bg-zinc-800"
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-1 sm:px-0">
        <Categories />

        <Suspense fallback={<SubscriptionsSkeleton />}>
          <Subscriptions />
        </Suspense>
      </div>
    </main>
  );
}
