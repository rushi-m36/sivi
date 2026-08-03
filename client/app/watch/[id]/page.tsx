import { formatViewCount, formatPublishedAt } from "../../../lib/youtube";
import { CommentCard } from "@/components/video/CommentCard";
import { ChannelCard } from "@/components/video/ChannelCard";
import { IVideo } from "../../../interfaces/video.client.interface";
import { fetchFromBackend } from "@/lib/api";
import { IComment } from "@/interfaces/comment.client.interface";

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
    videoData = await fetchFromBackend<IVideo>(`/youtube/video/${id}`, {
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
            <h1
              className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white"
              dangerouslySetInnerHTML={{
                __html: videoData?.title || "Watch Video",
              }}
            ></h1>

            <ChannelCard
              channelId={videoData?.channel.channelId}
              channelTitle={videoData?.channel?.channelTitle || "Channel"}
              channelAvatar={videoData?.channel?.channelAvatar}
              subscriberCount={videoData?.channel?.subscriberCount}
            />

            {errorMsg && (
              <div className="mt-4 p-4 rounded-xl bg-red-50 text-red-600 text-sm dark:bg-red-950/20 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            <div className="mt-4 p-4 rounded-xl bg-slate-100 dark:bg-slate-900 text-sm text-slate-800 dark:text-slate-200">
              <div className="font-semibold mb-2">
                {views} {published && `• ${published}`}
              </div>
              <p className="whitespace-pre-line leading-relaxed wrap-break-word">
                {videoData?.description || "No description available."}
              </p>
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">
            {videoData?.commentCount ?? 0} Comments
          </h2>

          {videoData?.comments?.length ? (
            videoData.comments.map((comment: IComment) => (
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
            <div className="rounded-xl border border-dashed border-slate-300 py-8 text-center text-slate-500 dark:border-zinc-800 dark:text-zinc-400">
              No comments available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
