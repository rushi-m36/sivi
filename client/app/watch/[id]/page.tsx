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
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="min-w-0 lg:col-span-2">
          <div className="lg:sticky lg:top-4">
            <div className="overflow-hidden bg-black">
              <div className="aspect-video w-full">
                <iframe
                  className="h-full w-full border-0"
                  src={`https://www.youtube.com/embed/${id}`}
                  title="YouTube video player"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>

            <div className="border-b border-zinc-800 py-4">
              <h1
                className="text-lg font-semibold leading-6 text-white sm:text-xl"
                dangerouslySetInnerHTML={{
                  __html: videoData?.title || "Watch Video",
                }}
              />

              <div className="mt-4">
                <ChannelCard
                  channelId={videoData?.channel?.channelId}
                  channelTitle={videoData?.channel?.channelTitle || "Channel"}
                  channelAvatar={videoData?.channel?.channelAvatar}
                  subscriberCount={videoData?.channel?.subscriberCount}
                />
              </div>

              {errorMsg && (
                <div className="mt-4 border border-red-900 bg-red-950/30 p-3 text-sm text-red-400">
                  {errorMsg}
                </div>
              )}

              <details className="group mt-4 border border-zinc-800 bg-zinc-900">
                <summary className="cursor-pointer list-none p-3 text-sm text-zinc-300 [&::-webkit-details-marker]:hidden">
                  <div className="mb-2 font-medium text-white">
                    {views} {published && `• ${published}`}
                  </div>

                  <div className="line-clamp-3 whitespace-pre-line wrap-break-word leading-6 text-zinc-400 group-open:line-clamp-none">
                    {videoData?.description || "No description available."}
                  </div>

                  <span className="mt-2 block font-medium text-white group-open:hidden">
                    Read more
                  </span>

                  <span className="mt-2 hidden font-medium text-white group-open:block">
                    Show less
                  </span>
                </summary>
              </details>
            </div>
          </div>
        </div>

        <div className="min-w-0">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-semibold text-white">
              {videoData?.commentCount ?? 0} Comments
            </h2>
          </div>

          <div>
            {videoData?.comments?.length ? (
              videoData.comments.map((comment: TComment) => (
                <CommentCard
                  key={comment.id}
                  id={comment.id}
                  author={comment.author}
                  authorAvatar={comment.authorAvatar}
                  text={comment.text}
                  publishedAt={comment.publishedAt}
                  likeCount={comment.likeCount}
                />
              ))
            ) : (
              <div className="border-b border-zinc-800 py-8 text-center text-sm text-zinc-500">
                No comments available.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
