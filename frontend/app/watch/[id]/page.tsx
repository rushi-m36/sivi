import React from 'react';

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;

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
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Video Title Placeholder
            </h1>
            <div className="flex flex-wrap items-center justify-between gap-4 mt-2 py-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-300 dark:bg-slate-700 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-slate-900 dark:text-white text-sm sm:text-base">
                    Channel Title
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    1.2M subscribers
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200">
              <div className="font-semibold mb-2">123,456 views • Released Placeholder</div>
              <p className="whitespace-pre-line leading-relaxed">
                This is a placeholder description for video ID: {id}. Once backend integration is complete, this will fetch details from the YouTube Data API.
              </p>
            </div>
          </div>
        </div>

        {/* Sidebar (Empty for MVP as no recommendations/comments requested) */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-500">
            Sidebar (Recommendations, comments, etc., are excluded from the MVP scope)
          </div>
        </div>
      </div>
    </div>
  );
}
