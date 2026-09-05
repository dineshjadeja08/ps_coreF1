import { Wrench } from "lucide-react";
import Link from "next/link";

import type { ServiceCategory } from "@/features/catalogue/types";

export function CategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <Link
      href={`/services?category=${encodeURIComponent(category.slug)}`}
      className="group rounded-md border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="grid gap-3">
        <div className="grid aspect-[4/3] place-items-center rounded-md bg-primary-subtle text-primary">
          <div className="grid h-14 w-14 place-items-center rounded-md bg-surface shadow-sm">
            <Wrench className="h-7 w-7" />
          </div>
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-foreground group-hover:text-primary">{category.name}</h3>
          {category.description ? (
            <p className="mt-1 line-clamp-1 text-xs leading-5 text-secondary">{category.description}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
