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
  {
    id: "search",
    label: "Search",
    href: "/",
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    href: "/subscriptions",
  },
];

interface NavbarProps {
  query?: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ query = "", onSearch }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleSearch = (searchQuery: string) => {
    const trimmed = searchQuery.trim();

    if (!trimmed) return;

    if (onSearch) {
      onSearch(trimmed);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  const isActiveTab = (tab: Tab) =>
    tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

  const navigate = (href: string) => {
    router.push(href);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Navbar */}
      <header className="fixed inset-x-0 top-0 z-40 border-b border-zinc-800 bg-black">
        <div className="mx-auto flex h-14 w-full items-center gap-3 px-3 sm:px-5">
          {/* Menu button */}
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isSidebarOpen}
            className="flex h-9 w-9 shrink-0 items-center justify-center text-zinc-400 transition hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>

          {/* Logo */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="shrink-0 text-lg font-semibold tracking-tight text-white"
          >
            Sivi
          </button>

          {/* Search */}
          <div className="min-w-0 flex-1 md:mx-auto md:max-w-xl">
            <SearchBar onSearch={handleSearch} initialValue={query} />
          </div>
        </div>
      </header>

      {/* Backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/60"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-dvh w-72 max-w-[85vw] flex-col border-r border-zinc-800 bg-zinc-950 transition-transform duration-200 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar header */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-800 px-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-lg font-semibold tracking-tight text-white"
          >
            Sivi
          </button>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
            className="flex h-9 w-9 items-center justify-center text-zinc-500 transition hover:text-white"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M6 6l12 12M18 6L6 18"
              />
            </svg>
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-2 py-3">
          <p className="px-3 pb-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
            Navigation
          </p>

          {tabs.map((tab) => {
            const active = isActiveTab(tab);

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.href)}
                className={`mb-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900/70 hover:text-white"
                }`}
              >
                {tab.id === "search" ? (
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="6.5" strokeWidth="1.7" />
                    <path
                      strokeLinecap="round"
                      strokeWidth="1.7"
                      d="m16 16 4 4"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.7"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}

                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Account */}
        <div className="border-t border-zinc-800 p-3">
          <p className="px-2 pb-2 text-xs font-medium uppercase tracking-wider text-zinc-600">
            Account
          </p>

          {/* Signed out */}
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                type="button"
                className="flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                Sign in
              </button>
            </SignInButton>

            <SignUpButton mode="modal">
              <button
                type="button"
                className="mt-1 flex w-full items-center rounded-lg px-3 py-2.5 text-left text-sm text-zinc-400 transition hover:bg-zinc-900 hover:text-white"
              >
                Sign up
              </button>
            </SignUpButton>
          </Show>

          {/* Signed in */}
          <Show when="signed-in">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-8 w-8",
                  },
                }}
              />

              <span className="text-sm text-zinc-300">Account</span>
            </div>
          </Show>
        </div>
      </aside>
    </>
  );
}
