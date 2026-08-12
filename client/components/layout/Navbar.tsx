"use client";

import { Home, Library } from "lucide-react";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SignInButton, SignUpButton, Show, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { SearchBar } from "../search/SearchBar";

type Tab = {
  id: string;
  label: string;
  href: string;
  icon: React.ElementType;
};

const tabs: Tab[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    icon: Home,
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    href: "/subscriptions",
    icon: Library,
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
            className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center text-zinc-400 transition hover:text-white"
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
          <Link href="/" className="shrink-0">
            <span className="text-lg font-semibold tracking-tight text-white">
              Sivi
            </span>
          </Link>

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
          <Link href="/" onClick={() => setIsSidebarOpen(false)}>
            <span className="text-lg font-semibold tracking-tight text-white">
              Sivi
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            aria-label="Close navigation"
            className="flex h-9 w-9 cursor-pointer items-center justify-center text-zinc-500 transition hover:text-white"
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
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => navigate(tab.href)}
                className={`mb-1 flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  active
                    ? "bg-zinc-900 text-white"
                    : "text-zinc-400 hover:bg-zinc-900/70 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.7} />

                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Project links */}
        <div className="flex items-center gap-3 border-b border-zinc-800 px-4 py-3">
          <a
            href="https://github.com/rushi-m36/sivi"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M12 .5a12 12 0 0 0-3.79 23.39c.6.11.82-.26.82-.58v-2.02c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76-1.09-.75.08-.74.08-.74 1.2.08 1.84 1.23 1.84 1.23 1.07 1.83 2.8 1.3 3.49.99.11-.77.42-1.3.76-1.6-2.67-.3-5.47-1.34-5.47-5.95 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 6-.01c2.3-1.55 3.3-1.23 3.3-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.62-2.81 5.64-5.49 5.94.43.37.81 1.1.81 2.22v3.29c0 .32.22.69.83.57A12 12 0 0 0 12 .5Z" />
            </svg>

            <span>GitHub</span>
          </a>

          <span className="h-4 w-px bg-zinc-700" aria-hidden="true" />

          <a
            href="https://buymeacoffee.com/rushi36"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.7}
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 8h11v6a4 4 0 0 1-4 4h-3a4 4 0 0 1-4-4V8Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17 10h1.5a2.5 2.5 0 0 1 0 5H17M8 21h8M9 18v3"
              />
            </svg>

            <span>Buy me a coffee</span>
          </a>
        </div>

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
