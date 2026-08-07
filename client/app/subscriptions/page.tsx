import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { fetchFromBackend } from "@/lib/api";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { TChannel } from "@/types/channel.type";

export default async function SubscriptionsPage() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-8 text-center shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Subscriptions
          </h1>
          <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
            Please sign in to view your subscriptions.
          </p>
          <div className="mt-6 flex justify-center">
            <SignInButton mode="modal">
              <button className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200">
                Sign in
              </button>
            </SignInButton>
          </div>
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
    <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-6">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          All subscriptions
        </h1>
      </div>

      {error ? (
        <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <p className="font-medium">{error}</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="rounded-[1.75rem] border border-dashed border-slate-300 bg-white/60 py-16 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-900/60">
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            No subscriptions yet
          </p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Subscribe to channels to see them listed here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
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
