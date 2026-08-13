"use client";

import { useEffect, useRef } from "react";
import { fetchFromBackend } from "@/lib/api";

interface VideoPlayerProps {
  videoId: string;
  title: string;
  initialPosition: number;
}

declare global {
  interface Window {
    YT?: {
      Player: new (
        element: HTMLElement,
        options: {
          videoId: string;
          playerVars?: Record<string, number>;
          events?: {
            onReady?: (event: YTPlayerEvent) => void;
            onStateChange?: (event: YTPlayerStateEvent) => void;
          };
        }
      ) => YTPlayer;

      PlayerState: {
        ENDED: number;
        PLAYING: number;
        PAUSED: number;
      };
    };

    onYouTubeIframeAPIReady?: () => void;
  }
}

interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead?: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  destroy(): void;
}

interface YTPlayerEvent {
  target: YTPlayer;
}

interface YTPlayerStateEvent {
  data: number;
  target: YTPlayer;
}

let youtubeApiPromise: Promise<void> | null = null;

function loadYouTubeAPI(): Promise<void> {
  if (window.YT?.Player) {
    return Promise.resolve();
  }

  if (youtubeApiPromise) {
    return youtubeApiPromise;
  }

  youtubeApiPromise = new Promise((resolve) => {
    window.onYouTubeIframeAPIReady = () => {
      resolve();
    };

    const script = document.createElement("script");

    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;

    document.body.appendChild(script);
  });

  return youtubeApiPromise;
}

export function VideoPlayer({
  videoId,
  title,
  initialPosition,
}: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const lastSavedPositionRef = useRef(0);

  const saveProgress = async (force = false) => {
    const player = playerRef.current;

    if (!player) {
      return;
    }

    const currentTime = Math.floor(player.getCurrentTime());

    if (!force && Math.abs(currentTime - lastSavedPositionRef.current) < 5) {
      return;
    }

    lastSavedPositionRef.current = currentTime;

    const duration = Math.floor(player.getDuration());

    try {
      await fetchFromBackend(`/history/${videoId}`, {
        method: "PUT",
        body: JSON.stringify({
          watchedSeconds: currentTime,
          durationSeconds: duration || undefined,
          completed: duration > 0 && currentTime >= duration * 0.95,
        }),
      });
    } catch (error) {
      console.error("Failed to save watch progress:", error);
    }
  };

  useEffect(() => {
    let destroyed = false;

    const initializePlayer = async () => {
      await loadYouTubeAPI();

      if (destroyed || !containerRef.current || !window.YT) {
        return;
      }

      playerRef.current = new window.YT.Player(containerRef.current, {
        videoId,

        playerVars: {
          autoplay: 1,
          playsinline: 1,
          rel: 0,
          enablejsapi: 1,
        },

        events: {
          onReady: (event) => {
            if (initialPosition > 0) {
              event.target.seekTo(initialPosition, true);
            }

            event.target.playVideo();
          },

          onStateChange: (event) => {
            if (
              event.data === window.YT?.PlayerState.PAUSED ||
              event.data === window.YT?.PlayerState.ENDED
            ) {
              void saveProgress(true);
            }
          },
        },
      });
    };

    void initializePlayer();

    const interval = setInterval(() => {
      void saveProgress();
    }, 10000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        void saveProgress(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      destroyed = true;

      clearInterval(interval);

      void saveProgress(true);

      playerRef.current?.destroy();
      playerRef.current = null;

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [videoId, initialPosition]);

  return (
    <div className="w-full overflow-hidden bg-black">
      <div className="aspect-16/10 w-full sm:aspect-video">
        <div ref={containerRef} className="block h-full w-full" title={title} />
      </div>
    </div>
  );
}
