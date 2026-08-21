import Link from "next/link";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({ eyebrow, title, description, href, linkLabel }: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? <p className="text-sm font-semibold uppercase tracking-wide text-primary">{eyebrow}</p> : null}
        <h2 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary sm:text-base">{description}</p> : null}
      </div>
      {href && linkLabel ? (
        <Link href={href} className="text-sm font-semibold text-primary hover:text-primary-hover">
          {linkLabel}
        </Link>
      ) : null}
    </div>
  );
}
