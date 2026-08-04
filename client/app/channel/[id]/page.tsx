import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { TChannel } from "@/types/channel.type";
import VideoGrid from "@/components/video/VideoGrid";
import { SubscribeButton } from "@/components/video/SubscribeButton";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper to format subscriber counts cleanly (e.g., 1.2M, 450K)
function formatSubscribers(count?: string | number): string {
  const numericCount = typeof count === "string" ? Number(count) : count;

  if (numericCount == null || Number.isNaN(numericCount)) {
    return "0 subscribers";
  }

  return (
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
    }).format(numericCount) + " subscribers"
  );
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
    <div className="min-h-screen bg-background text-foreground">
      {/* Header / Channel Info Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-border">
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full overflow-hidden bg-muted relative">
                {channelAvatar ? (
                  <Image
                    src={channelAvatar}
                    alt={channelTitle}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-zinc-700 text-xl font-bold text-white">
                    {channelTitle.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="space-y-1">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                {channelTitle}
              </h1>
              <p className="text-sm text-muted-foreground">
                {formatSubscribers(subscriberCount)}
              </p>
            </div>
          </div>

          {/* Action Button */}
          <SubscribeButton />
        </div>

        {/* Videos Section */}
        <main className="py-8">
          <h2 className="text-lg font-semibold mb-6">Videos</h2>

          <VideoGrid videos={videos} />
        </main>
      </div>
    </div>
  );
}
