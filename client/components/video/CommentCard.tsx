"use client";

import { CommentCardProps } from "@/interfaces/commentInterface";
import { FallbackImage } from "../layout/FallbackImage";

export default function CommentCard({
  author,
  authorAvatar,
  text,
  publishedAt,
  likeCount,
}: CommentCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-start gap-3">
        <FallbackImage
          src={authorAvatar || "/default-avatar.png"}
          alt={author}
          fallback="/default-avatar.png"
          className="h-10 w-10 rounded-full"
        />

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">{author}</h3>
            <span className="text-xs text-slate-500 dark:text-zinc-500">
              {publishedAt}
            </span>
          </div>

          <p
            className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-zinc-300"
            dangerouslySetInnerHTML={{ __html: text }}
          />

          <div className="mt-3 text-xs text-slate-500 dark:text-zinc-500">
            👍 {likeCount}
          </div>
        </div>
      </div>
    </div>
  );
}
