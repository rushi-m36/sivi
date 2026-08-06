import { fetchFromBackend } from "@/lib/api";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { TChannel } from "@/types/channel.type";

export default async function SubscriptionsPage() {
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
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          All Subscriptions
        </h1>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center text-red-600 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-400">
          <p className="font-medium">{error}</p>
        </div>
      ) : channels.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center dark:border-slate-800">
          <p className="text-lg font-medium text-slate-600 dark:text-slate-400">
            No subscriptions yet
          </p>
          <p className="mt-1 text-sm text-slate-400 dark:text-slate-500">
            Subscribe to channels to see them listed here.
          </p>
        </div>
      ) : (
        <div className="flex flex-col">
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
