import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchFromBackend } from "@/lib/api";
import { TVideo } from "@/types/video.type";
import VideoGrid from "@/components/video/VideoGrid";
import { categories } from "@/lib/trending-categories";

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category: slug } = await params;

  const category = categories.find((item) => item.slug === slug);

  if (!category) {
    notFound();
  }

  let videos: TVideo[] = [];

  try {
    videos = await fetchFromBackend<TVideo[]>(
      `/trending/${category.id}?regionCode=IN&maxResults=20`,
      {
        next: {
          revalidate: 300,
        },
      }
    );
  } catch {
    videos = [];
  }

  return (
    <main className="min-h-screen px-4">
      <div className="mx-auto w-full max-w-6xl">
        <section className="py-8">
          <Link
            href="/"
            className="mb-6 inline-block text-sm text-zinc-500 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
          >
            ← Back
          </Link>

          <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">
            {category.name}
          </h1>
        </section>

        <section className="border-t border-zinc-200 py-10 dark:border-zinc-800">
          <VideoGrid videos={videos} />
        </section>
      </div>
    </main>
  );
}
