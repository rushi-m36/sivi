"use client";

import { CommentCardProps } from "@/types/comment.type";
import { FallbackImage } from "../layout/FallbackImage";

export function CommentCard({
  author,
  authorAvatar,
  text,
  publishedAt,
  likeCount,
}: CommentCardProps) {
  return (
    <div className="border-b border-zinc-800 py-4">
      <div className="flex items-start gap-3">
        <FallbackImage
          src={authorAvatar || "/default-avatar.png"}
          alt={author}
          fallback="/default-avatar.png"
          className="h-9 w-9 shrink-0 rounded-full"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
            <h3 className="text-sm font-medium text-white">{author}</h3>
            <span className="text-xs text-zinc-500">{publishedAt}</span>
          </div>

          <p
            className="mt-1.5 whitespace-pre-wrap text-sm leading-5 text-zinc-300"
            dangerouslySetInnerHTML={{ __html: text }}
          />

          <div className="mt-2 text-xs text-zinc-500">
            {likeCount} {likeCount === 1 ? "like" : "likes"}
          </div>
        </div>
      </div>
    </div>
  );
}
