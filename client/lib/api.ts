const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api"
).replace(/\/$/, "");

export interface FetchOptions extends RequestInit {
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
}

declare global {
  interface Window {
    Clerk?: {
      session?: {
        getToken: () => Promise<string | null>;
      };
    };
  }
}

/**
 * Helper to retrieve the Clerk JWT token dynamically
 * works in both Client Components and Server Components/Actions.
 */
async function getClerkToken(): Promise<string | null> {
  // 1. Server-side environment
  if (typeof window === "undefined") {
    try {
      const { auth } = await import("@clerk/nextjs/server");
      const { getToken } = await auth();
      return await getToken();
    } catch {
      return null;
    }
  }

  // 2. Client-side environment
  if (window.Clerk?.session) {
    return await window.Clerk.session.getToken();
  }

  return null;
}

export async function fetchFromBackend<T>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const formattedEndpoint = endpoint.startsWith("/")
    ? endpoint
    : `/${endpoint}`;
  const url = `${API_BASE_URL}${formattedEndpoint}`;

  const headers = new Headers(options.headers);

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Automatically attach the Authorization header if not manually provided
  if (!headers.has("Authorization")) {
    const token = await getClerkToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Failed to load details (Status ${response.status})`;
    try {
      const errorData = await response.json();
      if (errorData?.message) {
        errorMessage = Array.isArray(errorData.message)
          ? errorData.message.join(", ")
          : errorData.message;
      }
    } catch {
      // Keep default status error if not JSON
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
