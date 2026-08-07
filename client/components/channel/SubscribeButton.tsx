"use client";

import { SignInButton, useAuth } from "@clerk/nextjs";
import { fetchFromBackend } from "@/lib/api";
import { useEffect, useState } from "react";

interface SubscribeButtonProps {
  channelId: string | undefined;
}

export function SubscribeButton({ channelId }: SubscribeButtonProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(channelId));
  const [isPending, setIsPending] = useState<boolean>(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      setIsLoading(false);
      return;
    }

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
  }, [channelId, isLoaded, isSignedIn]);

  async function handleToggleSubscribe() {
    if (!channelId || isPending || !isSignedIn) return;

    const previousState = isSubscribed;

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
      setIsSubscribed(previousState);
    } finally {
      setIsPending(false);
    }
  }

  if (!isLoaded) {
    return (
      <button
        disabled
        aria-busy="true"
        className="cursor-not-allowed rounded-full bg-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
      >
        Loading...
      </button>
    );
  }

  if (!isSignedIn) {
    return (
      <SignInButton mode="modal">
        <button className="rounded-full bg-black px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
          Sign in to subscribe
        </button>
      </SignInButton>
    );
  }

  if (isLoading) {
    return (
      <button
        disabled
        aria-busy="true"
        className="cursor-not-allowed rounded-full bg-zinc-200 px-6 py-2.5 text-sm font-semibold text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
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
