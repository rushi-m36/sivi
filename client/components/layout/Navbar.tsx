"use client";

import { usePathname, useRouter } from "next/navigation";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";

import { SearchBar } from "../search/SearchBar";

type Tab = {
  id: string;
  label: string;
  href: string;
};

const tabs: Tab[] = [
  { id: "search", label: "Search", href: "/" },
  { id: "subscriptions", label: "Subscriptions", href: "/subscriptions" },
];

interface NavbarProps {
  query?: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ query = "", onSearch }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <header className="sticky top-4 z-50 mx-auto w-[95%] max-w-7xl rounded-full border border-black/10 bg-white/70 p-1.5 shadow-lg backdrop-blur-md transition-all dark:border-white/10 dark:bg-zinc-950/70 dark:shadow-black/40">
      <div className="flex h-10 items-center justify-between gap-2 px-2 sm:gap-4 sm:px-6">
        {/* Brand / Logo */}
        <button
          onClick={() => router.push("/")}
          className="shrink-0 text-xl font-black tracking-tight text-zinc-900 transition-opacity hover:opacity-80 active:scale-95 dark:text-white"
        >
          Sivi
        </button>

        {/* Navigation Tabs */}
        <nav className="hidden shrink-0 items-center gap-1 md:flex">
          {tabs.map((tab) => {
            const isActive =
              tab.href === "/"
                ? pathname === "/"
                : pathname.startsWith(tab.href);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => router.push(tab.href)}
                aria-current={isActive ? "page" : undefined}
                className={`relative px-3 py-1 text-sm font-medium transition-colors duration-200 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:scale-x-0 after:bg-zinc-900 after:transition-transform after:duration-200 after:content-[''] dark:after:bg-white ${
                  isActive
                    ? "text-zinc-900 after:scale-x-100 dark:text-white"
                    : "text-zinc-600 hover:text-zinc-900 hover:after:scale-x-100 dark:text-zinc-400 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Search Bar */}
        <div className="min-w-0 max-w-80 flex-1 sm:max-w-2xl">
          <SearchBar onSearch={handleSearch} initialValue={query} />
        </div>

        {/* Authentication Controls */}
        <div className="flex shrink-0 items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="hidden rounded-full px-3 py-1 text-sm font-medium text-zinc-700 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 sm:inline-flex"
              >
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="rounded-full bg-zinc-900 px-3 py-1 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 active:scale-95 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
              >
                Sign Up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-7 w-7",
                },
              }}
            />
          </Show>
        </div>
      </div>

      {/* Mobile nav tabs */}
      <nav className="mt-1 flex items-center gap-3 px-4 pb-1 md:hidden">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(tab.href)}
              className={`relative px-1 py-0.5 text-xs font-medium after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:origin-center after:transition-transform after:content-[''] ${
                isActive
                  ? "text-zinc-900 after:scale-x-100 after:bg-zinc-900 dark:text-white dark:after:bg-white"
                  : "text-zinc-600 after:scale-x-0 dark:text-zinc-400"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
