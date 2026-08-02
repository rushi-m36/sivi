"use client";

import { useState } from "react";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

type Tab = "search" | "subscriptions";

interface SearchSubscriptionsTabsProps {
  defaultTab?: Tab;
  onChange?: (tab: Tab) => void;
}

export default function HomeNavbar({
  defaultTab = "search",
  onChange,
}: SearchSubscriptionsTabsProps) {
  const [activeTab, setActiveTab] = useState<Tab>(defaultTab);

  const handleChange = (tab: Tab) => {
    setActiveTab(tab);
    onChange?.(tab);
  };

  return (
    <div className="w-fit rounded-2xl border border-white">
      <div className="flex">
        <button
          onClick={() => handleChange("search")}
          className="w-40 py-1.5 text-sm font-medium text-white"
        >
          <span
            className={`border-b-2 pb-0.5 transition-all ${
              activeTab === "search" ? "border-white" : "border-transparent"
            }`}
          >
            Search
          </span>
        </button>

        <button
          onClick={() => handleChange("subscriptions")}
          className="w-40 py-1.5 text-sm font-medium text-white"
        >
          <span
            className={`border-b-2 pb-0.5 transition-all ${
              activeTab === "subscriptions"
                ? "border-white"
                : "border-transparent"
            }`}
          >
            Subscriptions
          </span>
        </button>
        <div>
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
      </div>
    </div>
  );
}
