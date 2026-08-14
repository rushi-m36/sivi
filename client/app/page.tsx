import { auth } from "@clerk/nextjs/server";

import { fetchFromBackend } from "@/lib/api";
import { TChannel } from "@/types/channel.type";
import { TVideo } from "@/types/video.type";
import VideoGrid from "@/components/video/VideoGrid";
import { SubChannelCard } from "@/components/channel/SubChannelCard";
import { Categories } from "@/components/layout/Categories";

interface SubscriptionsResponse {
  channels: TChannel[];
  recentVideos: TVideo[];
}

export default async function Home() {
  const { userId } = await auth();

  let subscriptions: SubscriptionsResponse = {
    channels: [],
    recentVideos: [],
  };

  if (userId) {
    try {
      subscriptions = await fetchFromBackend<SubscriptionsResponse>(
        "/subscriptions",
        {
          cache: "no-store",
        }
      );
    } catch (error) {
      console.error("Failed to load subscriptions:", error);
    }
  }

  const { channels, recentVideos } = subscriptions;

  return (
    <main className="min-h-screen">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
        <Categories />

        <section className="border-t border-zinc-200 py-8 dark:border-zinc-800 sm:py-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Subscriptions
            </h2>

            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Latest from channels you follow
            </p>
          </div>

          {!userId ? (
            <div className="rounded-xl border border-zinc-200 py-10 text-center dark:border-zinc-800">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Sign in to see your subscriptions.
              </p>
            </div>
          ) : channels.length === 0 ? (
            <div className="rounded-xl border border-zinc-200 py-10 text-center dark:border-zinc-800">
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                No subscriptions yet
              </p>

              <p className="mt-1 text-sm text-zinc-500">
                Subscribe to channels to see their videos here.
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8 flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
                {channels.slice(0, 10).map((channel) => {
                  const channelId = channel.channelId || (channel as any).id;

                  return <SubChannelCard key={channelId} {...channel} />;
                })}
              </div>

              {recentVideos.length > 0 && (
                <div>
                  <h3 className="mb-5 text-lg font-medium text-zinc-900 dark:text-white">
                    Latest videos
                  </h3>

                  <VideoGrid videos={recentVideos.slice(0, 12)} />
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
