import Link from "next/link";

import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";

type RoutePlaceholderProps = {
  title: string;
  eyebrow?: string;
};

export function RoutePlaceholder({ title, eyebrow }: RoutePlaceholderProps) {
  return (
    <section className="mx-auto flex min-h-[55vh] w-full max-w-5xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="max-w-xl space-y-5">
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
        <h1 className="text-3xl font-bold text-foreground sm:text-4xl">{title}</h1>
        <p className="text-base leading-7 text-secondary">
          This page is being prepared for the next release step. You can return home and keep browsing from there.
        </p>
        <Button asChild>
          <Link href={routes.home}>Back home</Link>
        </Button>
      </div>
    </section>
  );
}
