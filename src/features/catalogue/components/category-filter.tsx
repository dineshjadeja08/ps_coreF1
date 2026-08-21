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
          "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold",
          !activeCategory ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-secondary",
        )}
      >
        All
      </Link>
      {categories.map((category) => (
        <Link
          key={category.id}
          href={`/services?category=${encodeURIComponent(category.slug)}${queryPart}`}
          className={cn(
            "whitespace-nowrap rounded-full border px-4 py-2 text-sm font-semibold",
            activeCategory === category.slug ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-secondary",
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  );
}
