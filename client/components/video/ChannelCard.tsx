import { FallbackImage } from "@/components/layout/FallbackImage";
import { IChannel } from "@/interfaces/channel.client.interface";
import { SubscribeButton } from "./SubscribeButton";
import Link from "next/link";

export function ChannelCard({
  channelId,
  channelTitle,
  channelAvatar,
  subscriberCount,
}: IChannel) {
  return (
    <Link href={`/channel/${channelId}`}>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 py-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <FallbackImage
            src={channelAvatar || "/default-avatar.png"}
            fallback="/default-avatar.png"
            alt={channelTitle}
            className="h-12 w-12 rounded-full object-cover"
          />

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {channelTitle || "Unknown"}
            </h3>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {subscriberCount
                ? `${Number(subscriberCount).toLocaleString()} subscribers`
                : "No subscriber data"}
            </p>
          </div>
        </div>

        <SubscribeButton />
      </div>
    </Link>
  );
}
