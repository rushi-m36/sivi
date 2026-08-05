"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import { SearchBar } from "../search/SearchBar";

type Tab = "search" | "subscriptions";

const tabs: { id: Tab; label: string }[] = [
  { id: "search", label: "Search" },
  { id: "subscriptions", label: "Subscriptions" },
];

interface NavbarProps {
  query?: string;
  onSearch?: (query: string) => void;
}

export default function Navbar({ query = "", onSearch }: NavbarProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("search");

  const handleTab = (tab: Tab) => {
    setActiveTab(tab);

    if (tab === "search") {
      router.push("/");
    } else {
      router.push("/subscriptions");
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    if (onSearch) {
      onSearch(searchQuery);
      return;
    }

    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-4 z-50 mx-auto w-[96%] max-w-[1700px] rounded-full border border-zinc-300 bg-white/85 shadow-[0_10px_35px_rgba(0,0,0,0.08)] backdrop-blur-2xl dark:border-gray-500 dark:bg-black/85">
      <div className="flex h-14 items-center gap-8 px-8">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="text-3xl font-black tracking-tight text-black transition-opacity hover:opacity-70 dark:text-white"
        >
          Sivi
        </button>

        {/* Navigation */}
        <nav className="flex items-center gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTab(tab.id)}
              className={`relative pb-1 text-[15px] font-medium transition-colors duration-200 ${
                activeTab === tab.id
                  ? "text-black dark:text-white"
                  : "text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              {tab.label}

              <span
                className={`absolute -bottom-1 left-0 h-0.5 rounded-full bg-black transition-all duration-300 dark:bg-white ${
                  activeTab === tab.id ? "w-full opacity-100" : "w-0 opacity-0"
                }`}
              />
            </button>
          ))}
        </nav>

        {/* Search */}
        <div className="min-w-0 flex-1">
          <SearchBar onSearch={handleSearch} initialValue={query} />
        </div>

        {/* Auth */}
        <ClerkProvider>
          <Show when="signed-out">
            <div className="flex items-center gap-3">
              <SignInButton>
                <button className="rounded-full border border-zinc-300 px-5 py-2 text-sm font-medium transition hover:border-black hover:bg-zinc-100 dark:border-zinc-700 dark:text-white dark:hover:border-white dark:hover:bg-zinc-900">
                  Sign In
                </button>
              </SignInButton>

              <SignUpButton>
                <button className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200">
                  Sign Up
                </button>
              </SignUpButton>
            </div>
          </Show>

          <Show when="signed-in">
            <div className="rounded-full border border-zinc-300 p-1 transition hover:border-black dark:border-zinc-700 dark:hover:border-white">
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "h-9 w-9",
                  },
                }}
              />
              +
            </div>
          </Show>
        </ClerkProvider>
      </div>
    </header>
  );
}
