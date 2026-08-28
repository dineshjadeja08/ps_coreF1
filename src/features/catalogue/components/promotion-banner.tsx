import type { LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

export function PromotionBanner({
  title,
  text,
  cta,
  href,
  icon: Icon,
}: {
  title: string;
  text: string;
  cta: string;
  href: string;
  icon: LucideIcon;
}) {
  return (
    <article className="min-w-[280px] overflow-hidden rounded-2xl border border-border bg-surface p-5 shadow-sm sm:min-w-[360px]">
      <div className="grid h-20 w-20 place-items-center rounded-2xl bg-primary-subtle text-primary">
        <Icon className="h-9 w-9" />
      </div>
      <h3 className="mt-5 text-lg font-bold text-foreground">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-secondary">{text}</p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={href}>{cta}</Link>
      </Button>
    </article>
  );
}
