import { notFound } from "next/navigation";
import { fetchFromBackend } from "@/lib/api";
import { IChannel } from "@/interfaces/channel.interface";
import { ChannelCard } from "@/components/video/ChannelCard";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ChannelPage({ params }: PageProps) {
  // 1. Await the route params (required in Next.js 15+)
  const { id } = await params;

  let channel: IChannel;

  try {
    // 2. Fetch data with Next.js caching/revalidation features
    channel = await fetchFromBackend<IChannel>(`/channels/${id}`, {
      next: {
        revalidate: 60, // Cache for 60 seconds (ISG)
        tags: [`channel-${id}`], // Allows tag-based cache invalidation
      },
    });
  } catch (error) {
    // Render 404 page if API fails or channel isn't found
    notFound();
  }

  return (
    <main className="p-6">
      <ChannelCard
        channelId={channel.channelId}
        channelTitle={channel?.channelTitle || "Channel"}
        channelAvatar={channel?.channelAvatar}
        subscriberCount={channel?.subscriberCount}
      />
    </main>
  );
}
