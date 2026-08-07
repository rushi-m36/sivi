"use client";

import { useState } from "react";
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="sticky top-3 z-50 mx-auto w-full max-w-7xl px-2 sm:px-4">
      <div className="rounded-3xl border border-slate-200/80 bg-white/80 p-2 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/75 sm:rounded-[28px] sm:p-2.5">
        {/* Main Header Row */}
        <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between md:gap-4">
          {/* Top Bar: Logo, Desktop Tabs, and Mobile Controls */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 lg:gap-4">
              <button
                onClick={() => router.push("/")}
                className="flex shrink-0 items-center gap-2 rounded-full px-2.5 py-1 text-lg font-black tracking-tight text-slate-900 transition hover:bg-slate-100 active:scale-95 dark:text-white dark:hover:bg-slate-800 sm:text-xl"
              >
                <span>Sivi</span>
              </button>

              {/* Desktop Nav Tabs */}
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
                      className={`relative rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors duration-200 ${
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
            </div>

            {/* Mobile Actions: User Avatar / Sign In & Hamburger Toggle */}
            <div className="flex shrink-0 items-center gap-1.5 md:hidden">
              <Show when="signed-out">
                <SignUpButton mode="modal">
                  <button
                    type="button"
                    className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 sm:text-sm"
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

              <button
                type="button"
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                aria-label="Toggle Navigation Menu"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {isMobileMenuOpen ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Search Bar Row (Full width on mobile, centered/flexible on desktop) */}
          <div className="w-full flex-1 md:max-w-md lg:max-w-xl">
            <SearchBar onSearch={handleSearch} initialValue={query} />
          </div>

          {/* Desktop Right Auth Controls */}
          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="rounded-full px-3.5 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="rounded-full bg-slate-900 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-700 active:scale-95 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Sign Up
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
            </Show>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="mt-2.5 flex flex-col gap-2 rounded-2xl border border-slate-100 bg-slate-50/80 p-2 dark:border-white/5 dark:bg-slate-900/50 md:hidden">
            <nav className="flex flex-col gap-1">
              {tabs.map((tab) => {
                const isActive =
                  tab.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(tab.href);

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      router.push(tab.href);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                        : "text-slate-600 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800"
                    }`}
                  >
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>

            <Show when="signed-out">
              <div className="mt-1 flex flex-col gap-1 border-t border-slate-200/60 pt-2 dark:border-white/10">
                <SignInButton mode="modal">
                  <button
                    type="button"
                    className="w-full rounded-xl px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-200/60 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    Sign In
                  </button>
                </SignInButton>
              </div>
            </Show>
          </div>
        )}
      </div>
    </header>
  );
}
