"use client";

import Link from "next/link";

import type { ServiceCategory } from "@/features/catalogue/types";
import { cn } from "@/lib/utils";

export function CategoryFilter({ categories, activeCategory, query }: { categories: ServiceCategory[]; activeCategory?: string | null; query?: string | null }) {
  const queryPart = query ? `&q=${encodeURIComponent(query)}` : "";

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      <Link
        href={query ? `/services?q=${encodeURIComponent(query)}` : "/services"}
        className={cn(
          "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition",
          !activeCategory ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "border-border bg-surface text-secondary hover:border-primary/30 hover:text-primary",
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/services?category=${encodeURIComponent(category.slug)}${queryPart}`}
          className={cn(
            "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold transition",
            activeCategory === category.slug ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-soft)]" : "border-border bg-surface text-secondary hover:border-primary/30 hover:text-primary",
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
