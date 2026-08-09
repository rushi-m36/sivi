// app/subscriptions/page.tsx

import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { fetchFromBackend } from "@/lib/api";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { TChannel } from "@/types/channel.type";

export default async function SubscriptionsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
        <div className="border-b border-zinc-800 pb-6">
          <h1 className="text-2xl font-semibold text-white">Subscriptions</h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in to view your subscriptions.
          </p>

          <SignInButton mode="modal">
            <button className="mt-5 bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-zinc-200">
              Sign in
            </button>
          </SignInButton>
        </div>
      </main>
    );
  }

  let channels: TChannel[] = [];
  let error: string | null = null;

  try {
    channels = await fetchFromBackend<TChannel[]>("/subscriptions", {
      cache: "no-store",
    });
  } catch (err: any) {
    console.error("Failed to load subscriptions:", err);
    error = err?.message || "Failed to load subscriptions. Please try again.";
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-7 sm:px-6">
      <header className="border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Subscriptions
        </h1>

        {!error && (
          <p className="mt-1 text-sm text-zinc-500">
            {channels.length} subscribed channel
            {channels.length !== 1 ? "s" : ""}
          </p>
        )}
      </header>

      {error ? (
        <div className="border-b border-red-900/60 py-5 text-sm text-red-400">
          {error}
        </div>
      ) : channels.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-base font-medium text-zinc-300">
            No subscriptions yet
          </p>
          <p className="mt-1 text-sm text-zinc-500">
            Subscribe to channels to see them here.
          </p>
        </div>
      ) : (
        <div>
          {channels.map((channel, index) => (
            <ChannelCard
              key={channel.channelId || (channel as any).id || index}
              {...channel}
            />
          ))}
        </div>
      )}
    </main>
  );
}
