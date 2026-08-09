// components/channel/ChannelCard.tsx

import Link from "next/link";
import { FallbackImage } from "@/components/layout/FallbackImage";
import { TChannel } from "@/types/channel.type";
import { SubscribeButton } from "./SubscribeButton";
import { formatSubscribers } from "@/lib/youtube";

export function ChannelCard({
  channelId,
  channelTitle,
  channelAvatar,
  subscriberCount,
}: TChannel) {
  return (
    <div className="flex min-h-20 items-center gap-3 border-b border-zinc-800 py-4 sm:gap-5">
      <Link
        href={`/channel/${channelId}`}
        className="flex min-w-0 flex-1 items-center gap-3 sm:gap-5"
      >
        <FallbackImage
          src={channelAvatar || "/default-avatar.png"}
          fallback="/default-avatar.png"
          alt={channelTitle}
          className="h-12 w-12 shrink-0 rounded-full object-cover sm:h-14 sm:w-14"
        />

        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-white sm:text-base">
            {channelTitle || "Unknown"}
          </h3>

          <p className="mt-0.5 text-xs text-zinc-500 sm:text-sm">
            {formatSubscribers(subscriberCount)}
          </p>
        </div>
      </Link>

      <SubscribeButton channelId={channelId} />
    </div>
  );
}
