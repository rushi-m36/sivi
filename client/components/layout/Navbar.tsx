"use client";

import { useRouter } from "next/navigation";
import { SearchBar } from "../search/SearchBar";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

interface NavbarProps {
  query?: string;
  onSearch: (query: string) => void;
}

export function Navbar({ query = "", onSearch }: NavbarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-black/90">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
        {/* Logo */}
        <button
          onClick={() => router.push("/")}
          className="text-2xl font-black tracking-tight text-black dark:text-white"
        >
          Sivi
        </button>

        {/* Search */}
        <div className="mx-6 flex max-w-xl flex-1">
          <SearchBar onSearch={onSearch} initialValue={query} />
        </div>

        <ClerkProvider>
          <header className="flex justify-end items-center p-4 gap-4 h-16">
            <Show when="signed-out">
              <SignInButton />
              <SignUpButton>
                <button className="bg-purple-700 text-white rounded-full font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 cursor-pointer">
                  Sign Up
                </button>
              </SignUpButton>
            </Show>
            <Show when="signed-in">
              <UserButton />
            </Show>
          </header>
        </ClerkProvider>
      </div>
    </header>
  );
}
