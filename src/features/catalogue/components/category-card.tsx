import { Wrench } from "lucide-react";
import Link from "next/link";

import type { ServiceCategory } from "@/features/catalogue/types";

export function CategoryCard({ category }: { category: ServiceCategory }) {
  return (
    <Link
      href={`/services?category=${encodeURIComponent(category.slug)}`}
      className="group rounded-lg border border-border bg-surface p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
          <Wrench className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-foreground group-hover:text-primary">{category.name}</h3>
          {category.description ? (
            <p className="mt-1 line-clamp-2 text-sm leading-5 text-secondary">{category.description}</p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
