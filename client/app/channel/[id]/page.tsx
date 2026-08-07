import { notFound } from "next/navigation";
import { fetchFromBackend } from "@/lib/api";
import { TChannel } from "@/types/channel.type";
import VideoGrid from "@/components/video/VideoGrid";
import { SubscribeButton } from "@/components/channel/SubscribeButton";
import { FallbackImage } from "@/components/layout/FallbackImage";
import { formatSubscribers } from "@/lib/youtube";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChannelPage({ params }: PageProps) {
  const { id } = await params;

  let channel: TChannel;

  try {
    channel = await fetchFromBackend<TChannel>(`/channel/${id}`, {
      next: {
        revalidate: 60,
        tags: [`channel-${id}`],
      },
    });
  } catch (error) {
    notFound();
  }

  const {
    channelId,
    channelTitle = "Channel",
    channelAvatar,
    subscriberCount,
    videos,
  } = channel;

  return (
    <div className="min-h-screen bg-transparent">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/70 bg-white/80 p-5 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="relative shrink-0">
                <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100 shadow-sm sm:h-24 sm:w-24">
                  {channelAvatar ? (
                    <FallbackImage
                      src={channelAvatar}
                      alt={channelTitle}
                      fallback="default-avatar.png"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-700 text-xl font-bold text-white">
                      {channelTitle.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
                  {channelTitle}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {formatSubscribers(subscriberCount)}
                </p>
              </div>
            </div>

            <SubscribeButton channelId={channelId} />
          </div>
        </div>

        <main className="py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Videos
            </h2>
          </div>

          <VideoGrid videos={videos} />
        </main>
      </div>
    </div>
  );
}
