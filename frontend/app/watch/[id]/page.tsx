import React from 'react';
import { formatViewCount, formatPublishedAt } from '../../../lib/youtube';

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;
  
  let videoData = null;
  let errorMsg = null;
  
  try {
    const res = await fetch(`http://localhost:3001/api/youtube/video/${id}`, {
      next: { revalidate: 60 } // optional: cache for 60 seconds
    });
    if (res.ok) {
      videoData = await res.json();
    } else {
      errorMsg = `Failed to load video details (Status ${res.status})`;
    }
  } catch (err: any) {
    console.error("Error fetching video details:", err);
    errorMsg = "Connection error to server";
  }

  const views = videoData?.viewCount ? formatViewCount(videoData.viewCount) : '0 views';
  const published = videoData?.publishedAt ? formatPublishedAt(videoData.publishedAt) : '';

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Video Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-lg">
            <iframe
              className="w-full h-full border-0"
              src={`https://www.youtube.com/embed/${id}`}
              title="YouTube video player"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white" dangerouslySetInnerHTML={{ __html: videoData?.title || 'Watch Video' }}>
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center font-bold text-white uppercase">
                  {(videoData?.channelTitle || 'C').charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                    {videoData?.channelTitle || 'Channel Title'}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    YouTube Creator
                  </p>
                </div>
              </div>
            </div>
            
            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm dark:bg-red-950/20 dark:text-red-400">
                {errorMsg}
              </div>
            )}
            
            <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200">
              <div className="font-semibold mb-2">
                {views} {published && `• ${published}`}
              </div>
              <p className="whitespace-pre-line leading-relaxed break-words">
                {videoData?.description || 'No description available.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-500">
            Sidebar (Recommendations, comments, etc., are excluded from the MVP scope)
          </div>
        </div>
      </div>
    </div>
  );
}
