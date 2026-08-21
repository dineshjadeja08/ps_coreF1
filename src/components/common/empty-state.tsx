import { SearchX } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

type EmptyStateProps = {
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
};

export function EmptyState({ title, description, actionLabel = "View all services", actionHref = routes.services }: EmptyStateProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-surface p-8 text-center">
      <SearchX className="mx-auto h-10 w-10 text-primary" />
      <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-secondary">{description}</p>
      <Button asChild variant="secondary" className="mt-5">
        <Link href={actionHref}>{actionLabel}</Link>
      </Button>
    </div>
  );
}
