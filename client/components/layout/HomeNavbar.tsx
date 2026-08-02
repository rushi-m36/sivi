"use client";

import { useState } from "react";

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
      </div>
    </div>
  );
}
