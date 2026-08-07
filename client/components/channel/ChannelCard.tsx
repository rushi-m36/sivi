import { FallbackImage } from "@/components/layout/FallbackImage";
import { TChannel } from "@/types/channel.type";
import { SubscribeButton } from "./SubscribeButton";
import { formatSubscribers } from "@/lib/youtube";
import Link from "next/link";

export function ChannelCard({
  channelId,
  channelTitle,
  channelAvatar,
  subscriberCount,
}: TChannel) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-[1.25rem] border border-black/10 bg-white/90 p-4 shadow-sm transition hover:border-black/20 hover:shadow-md dark:border-white/10 dark:bg-black/80 dark:hover:border-white/20">
      <Link
        href={`/channel/${channelId}`}
        className="flex min-w-0 items-center gap-3"
      >
        <FallbackImage
          src={channelAvatar || "/default-avatar.png"}
          fallback="/default-avatar.png"
          alt={channelTitle}
          className="h-12 w-12 rounded-full object-cover"
        />

        <div className="min-w-0">
          <h3 className="truncate font-semibold text-slate-900 dark:text-white">
            {channelTitle || "Unknown"}
          </h3>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatSubscribers(subscriberCount)}
          </p>
        </div>
      </Link>
      <SubscribeButton channelId={channelId} />
    </div>
  );
}
