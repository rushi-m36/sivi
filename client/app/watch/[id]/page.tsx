import { formatViewCount, formatPublishedAt } from "../../../lib/youtube";
import { CommentCard } from "@/components/video/CommentCard";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { TVideo } from "../../../types/video.type";
import { fetchFromBackend } from "@/lib/api";
import { TComment } from "@/types/comment.type";

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
    videoData = await fetchFromBackend<TVideo>(`/videos/${id}`, {
      next: { revalidate: 60 },
    });
  } catch (err: any) {
    console.error("Error fetching video details:", err);
    errorMsg = err.message || "Connection error to server";
  }

  const views = videoData?.viewCount
    ? formatViewCount(videoData.viewCount)
    : "0 views";
  const published = videoData?.publishedAt
    ? formatPublishedAt(videoData.publishedAt)
    : "";

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-black shadow-lg dark:border-zinc-800">
            <div className="aspect-video w-full">
              <iframe
                className="h-full w-full border-0"
                src={`https://www.youtube.com/embed/${id}`}
                title="YouTube video player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70 sm:p-5">
            <h1
              className="text-xl font-bold text-slate-900 dark:text-white sm:text-2xl"
              dangerouslySetInnerHTML={{
                __html: videoData?.title || "Watch Video",
              }}
            ></h1>

            <div className="mt-4">
              <ChannelCard
                channelId={videoData?.channel?.channelId}
                channelTitle={videoData?.channel?.channelTitle || "Channel"}
                channelAvatar={videoData?.channel?.channelAvatar}
                subscriberCount={videoData?.channel?.subscriberCount}
              />
            </div>

            {errorMsg && (
              <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="mt-4 rounded-2xl bg-slate-100 p-4 text-sm text-slate-800 dark:bg-slate-950 dark:text-slate-200">
              <div className="mb-2 font-semibold">
                {views} {published && `• ${published}`}
              </div>
              <p className="whitespace-pre-line leading-relaxed break-words">
                {videoData?.description || "No description available."}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.5rem] border border-white/70 bg-white/80 p-4 shadow-sm backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-900/70">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              {videoData?.commentCount ?? 0} Comments
            </h2>
          </div>

          {videoData?.comments?.length ? (
            videoData.comments.map((comment: TComment) => (
              <CommentCard
                key={comment.id}
                author={comment.authorDisplayName}
                authorAvatar={comment.authorProfileImageUrl}
                text={comment.textDisplay}
                publishedAt={comment.publishedAt}
                likeCount={comment.likeCount}
              />
            ))
          ) : (
            <div className="rounded-[1.5rem] border border-dashed border-slate-300 py-8 text-center text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
              No comments available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
