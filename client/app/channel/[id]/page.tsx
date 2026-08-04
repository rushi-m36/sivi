import { notFound } from "next/navigation";
import Image from "next/image";
<<<<<<< HEAD
import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { IChannel } from "@/interfaces/channel.client.interface";
import VideoGrid from "@/components/video/VideoGrid";
import { SubscribeButton } from "@/components/video/SubscribeButton";
=======
import { SubscribeButton } from "@/components/video/SubscribeButton";
import { fetchFromBackend } from "@/lib/api";
import { IChannel } from "@/interfaces/channel.interface";
>>>>>>> 675e5b24ff449a012d8c973d37c2fc8d22feb0c7

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper to format subscriber counts cleanly (e.g., 1.2M, 450K)
<<<<<<< HEAD
function formatSubscribers(count?: number): string {
  if (!count) return "0 subscribers";
=======
function formatSubscribers(count?: string | number): string {
  const numericCount = typeof count === "string" ? Number(count) : count;

  if (numericCount == null || Number.isNaN(numericCount)) {
    return "0 subscribers";
  }

>>>>>>> 675e5b24ff449a012d8c973d37c2fc8d22feb0c7
  return (
    new Intl.NumberFormat("en-US", {
      notation: "compact",
      compactDisplay: "short",
<<<<<<< HEAD
    }).format(count) + " subscribers"
=======
    }).format(numericCount) + " subscribers"
>>>>>>> 675e5b24ff449a012d8c973d37c2fc8d22feb0c7
  );
}

export default async function ChannelPage({ params }: PageProps) {
  const { id } = await params;

  let channel: IChannel;

  try {
    channel = await fetchFromBackend<IChannel>(`/channel/${id}`, {
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
<<<<<<< HEAD
    videos,
=======
>>>>>>> 675e5b24ff449a012d8c973d37c2fc8d22feb0c7
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

<<<<<<< HEAD
          <VideoGrid videos={videos} />
=======
          {/* Videos Grid Placeholder */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Render your <VideoCard /> components here */}
            <div className="p-12 text-center border rounded-lg border-dashed text-muted-foreground col-span-full">
              Channel videos will be rendered here.
            </div>
          </div>
>>>>>>> 675e5b24ff449a012d8c973d37c2fc8d22feb0c7
        </main>
      </div>
    </div>
  );
}
