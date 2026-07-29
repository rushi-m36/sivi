import React from 'react';
import Link from 'next/link';

interface VideoCardProps {
  video: {
    id: string;
    title: string;
    thumbnail: string;
    channelTitle: string;
    views: string;
    publishedAt: string;
    duration: string;
  };
}

export default function VideoCard({ video }: VideoCardProps) {
  return (
    <Link href={`/watch/${video.id}`} className="group flex flex-col gap-2">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={video.thumbnail}
          alt={video.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <span className="absolute bottom-2 right-2 rounded bg-black/80 px-1.5 py-0.5 text-xs font-medium text-white">
          {video.duration}
        </span>
      </div>
      <div className="flex gap-3 px-1">
        <div className="flex-1">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 dark:text-zinc-50 group-hover:text-red-600 dark:group-hover:text-red-400">
            {video.title}
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
            {video.channelTitle}
          </p>
          <div className="mt-0.5 text-xs text-slate-400 dark:text-zinc-500">
            <span>{video.views}</span>
            <span className="mx-1.5">•</span>
            <span>{video.publishedAt}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
