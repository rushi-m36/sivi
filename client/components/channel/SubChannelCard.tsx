// components/channel/ChannelCard.tsx

import Link from "next/link";
import { FallbackImage } from "@/components/layout/FallbackImage";
import { TChannel } from "@/types/channel.type";
import { formatSubscribers } from "@/lib/youtube";

export function SubChannelCard({
  channelId,
  channelTitle,
  channelAvatar,
  subscriberCount,
}: TChannel) {
  return (
    <Link
      href={`/channel/${channelId}`}
      className="group flex items-center gap-4 rounded-xl px-4 py-3 transition-colors hover:bg-zinc-900/70 sm:px-5"
    >
      <FallbackImage
        src={channelAvatar || "/default-avatar.png"}
        fallback="/default-avatar.png"
        alt={channelTitle || "Channel"}
        className="h-14 w-14 shrink-0 rounded-full object-cover sm:h-16 sm:w-16"
      />

      <div className="min-w-0">
        <h3 className="truncate text-sm font-semibold text-white sm:text-base">
          {channelTitle || "Unknown"}
        </h3>

        <p className="mt-1 text-xs text-zinc-500 sm:text-sm">
          {formatSubscribers(subscriberCount)}
        </p>
      </div>
    </Link>
  );
}
