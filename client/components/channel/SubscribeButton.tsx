"use client";

import { fetchFromBackend } from "@/lib/api";
import { useEffect, useState } from "react";

interface SubscribeButtonProps {
  channelId: string | undefined;
}

export function SubscribeButton({ channelId }: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(channelId));
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    // If channelId isn't loaded yet, keep loading state in check
    if (!channelId) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function checkStatus() {
      try {
        setIsLoading(true);
        const status: boolean = await fetchFromBackend(
          `/subscriptions/status/${channelId}`
        );
        if (isMounted) {
          setIsSubscribed(Boolean(status));
        }
      } catch (error) {
        console.error("Failed to fetch subscription status:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [channelId]);

  async function handleToggleSubscribe() {
    if (!channelId || isPending) return;

    const previousState = isSubscribed;

    // Optimistic UI update
    setIsSubscribed(!previousState);
    setIsPending(true);

    try {
      await fetchFromBackend("/subscriptions", {
        method: previousState ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ channelId }),
      });
    } catch (error) {
      console.error("Failed to update subscription:", error);
      // Revert optimistic update on failure
      setIsSubscribed(previousState);
    } finally {
      setIsPending(false);
    }
  }

  if (isLoading) {
    return (
      <button
        disabled
        aria-busy="true"
        className="rounded-full bg-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500 cursor-not-allowed"
      >
        Loading...
      </button>
    );
  }

  return (
    <button
      disabled={!channelId || isPending}
      onClick={handleToggleSubscribe}
      className={`cursor-pointer rounded-full px-6 py-2.5 text-sm font-semibold transition disabled:opacity-50 ${
        isSubscribed
          ? "bg-zinc-200 text-black hover:bg-zinc-300 dark:bg-zinc-800 dark:text-white dark:hover:bg-zinc-700"
          : "bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      }`}
    >
      {isSubscribed ? "Subscribed" : "Subscribe"}
    </button>
  );
}
