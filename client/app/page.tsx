import Link from "next/link";
import { fetchFromBackend } from "@/lib/api";
import { TVideo } from "@/types/video.type";
import VideoGrid from "@/components/video/VideoGrid";
import { categories } from "@/lib/trending-categories";

export default async function Home() {
  let trendingVideos: TVideo[] = [];

  try {
    trendingVideos = await fetchFromBackend<TVideo[]>(
      "/trending?regionCode=IN&maxResults=20",
      {
        next: {
          revalidate: 300,
        },
      }
    );
  } catch {
    trendingVideos = [];
  }

  return (
    <main className="min-h-screen px-0">
      <div className="mx-auto w-full max-w-6xl">
        <section className="py-10">
          <h2 className="mb-5 text-xl font-semibold text-zinc-900 dark:text-white">
            Categories
          </h2>

          <div className="flex flex-wrap gap-3">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/${category.slug}`}
                className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 transition hover:bg-black hover:text-white dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-white dark:hover:text-black"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </section>

        <section className="border-t border-zinc-200 py-10 dark:border-zinc-800">
          <h2 className="mb-5 text-xl font-semibold text-zinc-900 dark:text-white">
            Trending
          </h2>

          <VideoGrid videos={trendingVideos} />
        </section>
      </div>
    </main>
  );
}
