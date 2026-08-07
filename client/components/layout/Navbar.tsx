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
    <header className="sticky top-3 z-50 mx-auto w-full rounded-[28px] border border-slate-200/80 bg-white/75 p-2 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex flex-wrap items-center justify-between gap-2 px-2 sm:gap-3 sm:px-3">
        <button
          onClick={() => router.push("/")}
          className="flex shrink-0 items-center gap-2 rounded-full px-2 py-1 text-xl font-black tracking-tight text-slate-900 transition hover:bg-slate-100 active:scale-95 dark:text-white dark:hover:bg-slate-800"
        >
          <span>Sivi</span>
        </button>

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
                className={`relative rounded-full px-3 py-1.5 text-sm font-medium transition-colors duration-200 ${
                  isActive
                    ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 basis-full sm:basis-auto sm:max-w-2xl">
          <SearchBar onSearch={handleSearch} initialValue={query} />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 sm:inline-flex"
              >
                Sign In
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="rounded-full bg-slate-900 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
              >
                Sign Up
              </button>
            </SignUpButton>
          </Show>

          <Show when="signed-in">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8",
                },
              }}
            />
          </Show>
        </div>
      </div>

      <nav className="mt-2 flex items-center gap-3 px-2 pb-1 md:hidden">
        {tabs.map((tab) => {
          const isActive =
            tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => router.push(tab.href)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
                isActive
                  ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                  : "text-slate-600 dark:text-slate-400"
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
