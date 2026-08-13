import { auth } from "@clerk/nextjs/server";
import { History as HistoryIcon } from "lucide-react";

import { fetchFromBackend } from "@/lib/api";
import { THistoryVideo } from "@/types/video.type";
import { HistoryContent } from "@/components/layout/HistoryContent";

export default async function HistoryPage() {
  const { userId, getToken } = await auth();

  if (!userId) {
    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="rounded-xl border border-zinc-200 py-10 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              You must be signed in to view your watch history.
            </p>
          </div>
        </div>
      </main>
    );
  }

  try {
    const token = await getToken();

    if (!token) {
      throw new Error("Unauthorized");
    }

    const history = await fetchFromBackend<THistoryVideo[]>("/history", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    return <HistoryContent initialHistory={history} />;
  } catch (error) {
    console.error("Failed to load watch history:", error);

    return (
      <main className="min-h-screen">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
          <div className="rounded-xl border border-zinc-200 py-10 text-center dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Failed to load watch history.
            </p>
          </div>
        </div>
      </main>
    );
  }
}
