import { SignInButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { fetchFromBackend } from "@/lib/api";
import { TChannel } from "@/types/channel.type";
import { TVideo } from "@/types/video.type";
import { SubChannelCard } from "../../components/channel/SubChannelCard";
import VideoGrid from "@/components/video/VideoGrid";
import Link from "next/link";

interface SubscriptionsResponse {
  channels: TChannel[];
  recentVideos: TVideo[];
}

interface ChannelVideosResponse {
  channel: TChannel;
  videos: TVideo[];
}

interface SubscriptionsPageProps {
  searchParams: Promise<{
    channel?: string;
  }>;
}

export default async function SubscriptionsPage({
  searchParams,
}: SubscriptionsPageProps) {
  const { userId } = await auth();

  if (!userId) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6">
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

  const { channel: selectedChannelId } = await searchParams;

  let subscriptions: SubscriptionsResponse | null = null;
  let selectedVideos: TVideo[] = [];
  let error: string | null = null;

  try {
    subscriptions = await fetchFromBackend<SubscriptionsResponse>(
      "/subscriptions",
      {
        cache: "no-store",
      }
    );

    if (selectedChannelId) {
      const channelData = await fetchFromBackend<ChannelVideosResponse>(
        `/channel/${selectedChannelId}`,
        {
          cache: "no-store",
        }
      );

      selectedVideos = channelData.videos.slice(0, 5);
    }
  } catch (err: any) {
    console.error("Failed to load subscriptions:", err);

    error = err?.message || "Failed to load subscriptions. Please try again.";
  }

  if (!subscriptions) {
    return (
      <main className="mx-auto w-full max-w-6xl px-4 py-7 sm:px-6">
        <p className="text-sm text-red-400">{error}</p>
      </main>
    );
  }

  const { channels, recentVideos } = subscriptions;

  const videos = selectedChannelId ? selectedVideos : recentVideos;

  return (
    <main className="mx-auto w-full max-w-7xl px-0 py-7 sm:px-0">
      <header className="mb-6 border-b border-zinc-800 pb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Subscriptions
        </h1>
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
        <>
          {/* Channels */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">Channels</h2>

              {selectedChannelId && (
                <Link
                  href="/subscriptions"
                  className="text-sm text-zinc-500 hover:text-white"
                >
                  Show all
                </Link>
              )}
            </div>

            <div className="flex gap-6 overflow-x-auto pb-3 scrollbar-hide">
              {channels.map((channel, index) => {
                const channelId = channel.channelId || (channel as any).id;

                const isSelected = selectedChannelId === channelId;

                return <SubChannelCard key={channelId} {...channel} />;
              })}
            </div>
          </section>

          {/* Videos */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-medium text-white">
                {selectedChannelId
                  ? "Latest videos"
                  : "Latest from your subscriptions"}
              </h2>
            </div>

            <VideoGrid videos={videos} />
          </section>
        </>
      )}
    </main>
  );
}
