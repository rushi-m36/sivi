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

  const isActiveTab = (tab: Tab) =>
    tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);

  const navigate = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="border-b border-zinc-800 bg-black text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-14 items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="shrink-0 text-lg font-semibold tracking-tight text-white"
          >
            Sivi
          </button>

          <nav className="hidden h-full items-center gap-6 md:flex">
            {tabs.map((tab) => {
              const active = isActiveTab(tab);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(tab.href)}
                  className={`relative flex h-full items-center text-sm font-medium ${
                    active ? "text-white" : "text-zinc-500 hover:text-zinc-200"
                  }`}
                >
                  {tab.label}

                  {active && (
                    <span className="absolute inset-x-0 bottom-0 h-px bg-white" />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="mx-auto hidden w-full max-w-xl md:block">
            <SearchBar onSearch={handleSearch} initialValue={query} />
          </div>

          <div className="hidden shrink-0 items-center md:flex">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium text-zinc-400 hover:text-white"
                >
                  Sign in
                </button>
              </SignInButton>

              <SignUpButton mode="modal">
                <button
                  type="button"
                  className="ml-1 border border-zinc-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-900"
                >
                  Sign up
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

          <div className="ml-auto flex items-center gap-1 md:hidden">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <button
                  type="button"
                  className="px-2 py-2 text-sm font-medium text-zinc-300"
                >
                  Sign in
                </button>
              </SignInButton>
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
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
              className="flex h-9 w-9 items-center justify-center text-zinc-400 hover:text-white"
            >
              {isMobileMenuOpen ? (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={1.5}
                    d="M6 6l12 12M18 6L6 18"
                  />
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="square"
                    strokeLinejoin="miter"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        <div className="pb-3 md:hidden">
          <SearchBar onSearch={handleSearch} initialValue={query} />
        </div>

        {isMobileMenuOpen && (
          <nav className="border-t border-zinc-800 py-1 md:hidden">
            {tabs.map((tab) => {
              const active = isActiveTab(tab);

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => navigate(tab.href)}
                  className={`block w-full border-l-2 px-3 py-3 text-left text-sm font-medium ${
                    active
                      ? "border-white text-white"
                      : "border-transparent text-zinc-500 hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}
