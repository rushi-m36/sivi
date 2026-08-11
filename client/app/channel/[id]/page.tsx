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
    console.log(channel);
  } catch {
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
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:pb-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3 sm:gap-5">
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800 sm:h-20 sm:w-20">
                {channelAvatar ? (
                  <FallbackImage
                    src={channelAvatar}
                    alt={channelTitle}
                    fallback="default-avatar.png"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-700 text-lg font-semibold text-white sm:text-2xl">
                    {channelTitle.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-2xl">
                  {channelTitle}
                </h1>

                <p className="mt-0.5 text-sm text-zinc-500 dark:text-zinc-400">
                  {formatSubscribers(subscriberCount)}
                </p>
              </div>
            </div>

            <div className="shrink-0">
              <SubscribeButton channelId={channelId} />
            </div>
          </div>
        </header>

        <main className="pt-6 sm:pt-8">
          <h2 className="mb-4 text-lg font-semibold tracking-tight text-zinc-950 dark:text-white sm:mb-5">
            Videos
          </h2>

          <VideoGrid videos={videos} />
        </main>
      </div>
    </div>
  );
}
