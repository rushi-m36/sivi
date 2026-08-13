import Link from "next/link";
import { auth } from "@clerk/nextjs/server";

import { categories } from "@/lib/trending-categories";
import { fetchFromBackend } from "@/lib/api";
import { TChannel } from "@/types/channel.type";
import { TVideo } from "@/types/video.type";
import VideoGrid from "@/components/video/VideoGrid";
import { SubChannelCard } from "@/components/channel/SubChannelCard";

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
        {/* Categories */}
        <section className="py-8 sm:py-10">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
              Categories
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Explore videos by topic
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <Link
                  key={category.id}
                  href={`/${category.slug}`}
                  className="group flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
                >
                  <Icon
                    size={18}
                    strokeWidth={1.8}
                    className="text-zinc-500 transition group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
                  />

                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {category.name}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Subscriptions */}
        <section className="border-t border-zinc-200 py-8 dark:border-zinc-800 sm:py-10">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
                Subscriptions
              </h2>

              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                Latest from channels you follow
              </p>
            </div>
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
              {/* Channels */}
              <div className="mb-8 flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
                {channels.slice(0, 10).map((channel) => {
                  const channelId = channel.channelId || (channel as any).id;

                  return <SubChannelCard key={channelId} {...channel} />;
                })}
              </div>

              {/* Videos */}
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
