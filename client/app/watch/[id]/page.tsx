import { formatViewCount, formatPublishedAt } from "../../../lib/youtube";
import { CommentCard } from "@/components/video/CommentCard";
import { ChannelCard } from "@/components/channel/ChannelCard";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { TVideo } from "../../../types/video.type";
import { fetchFromBackend } from "@/lib/api";
import { TComment } from "@/types/comment.type";

interface WatchPageProps {
  params: Promise<{
    id: string;
  }>;
}

interface WatchHistoryProgress {
  watchedSeconds: number;
  durationSeconds: number | null;
  completed: boolean;
}

export default async function WatchPage({ params }: WatchPageProps) {
  const { id } = await params;

  let videoData: TVideo | null = null;
  let watchHistory: WatchHistoryProgress | null = null;
  let errorMsg: string | null = null;

  try {
    videoData = await fetchFromBackend<TVideo>(`/videos/${id}`, {
      next: {
        revalidate: 60,
      },
    });

    try {
      watchHistory = await fetchFromBackend<WatchHistoryProgress | null>(
        `/history/${id}`
      );
    } catch (error) {
      // History should never prevent the video from loading.
      console.error("Error fetching watch history:", error);
    }
  } catch (err: unknown) {
    console.error("Error fetching video details:", err);

    errorMsg =
      err instanceof Error ? err.message : "Connection error to server";
  }

  const views = videoData?.viewCount
    ? formatViewCount(videoData.viewCount)
    : "0 views";

  const published = videoData?.publishedAt
    ? formatPublishedAt(videoData.publishedAt)
    : "";

  return (
    <main className="mx-auto w-full max-w-7xl">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:px-6">
        {/* VIDEO + DETAILS */}
        <section className="min-w-0 lg:col-span-2">
          {/* Video */}
          <VideoPlayer
            videoId={id}
            title={videoData?.title || "YouTube video player"}
            initialPosition={
              watchHistory?.completed ? 0 : watchHistory?.watchedSeconds ?? 0
            }
          />

          {/* Details */}
          <div className="px-4 sm:px-6 lg:px-0">
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
                    {views}
                    {published && ` • ${published}`}
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
        </section>

        {/* COMMENTS */}
        <aside className="min-w-0 px-4 pb-10 sm:px-6 lg:px-0">
          <div className="border-b border-zinc-800 pb-4">
            <h2 className="text-base font-semibold text-white">Comments</h2>
          </div>

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
            <div className="py-8 text-center text-sm text-zinc-500">
              No comments available.
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
