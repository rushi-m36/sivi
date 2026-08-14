"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

import { categories } from "@/lib/trending-categories";

export function Categories() {
  const [expanded, setExpanded] = useState(false);

  return (
    <section className="py-8 sm:py-10">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-white">
            Categories
          </h2>

          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Explore videos by topic
          </p>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1 rounded-lg px-2 py-1.5 text-sm font-medium text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-white cursor-pointer"
        >
          {expanded ? "Hide" : "View all"}

          <ChevronDown
            size={16}
            className={`transition-transform ${expanded ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <div
        className={`grid grid-cols-2 gap-3 overflow-hidden transition-all duration-300 sm:grid-cols-3 md:grid-cols-4 ${
          expanded ? "max-h-250" : "max-h-15"
        }`}
      >
        {categories.map((category) => {
          const Icon = category.icon;

          return (
            <Link
              key={category.id}
              href={`/${category.slug}`}
              className="group flex min-h-13 items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-3 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600 dark:hover:bg-zinc-900"
            >
              <Icon
                size={18}
                strokeWidth={1.8}
                className="shrink-0 text-zinc-500 transition group-hover:text-zinc-900 dark:text-zinc-400 dark:group-hover:text-white"
              />

              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {category.name}
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
