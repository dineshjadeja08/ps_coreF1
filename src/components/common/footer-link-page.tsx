import { Mail, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

type ContactAction = {
  label: string;
  href: string;
  icon: "mail" | "phone";
  variant?: "dark" | "light";
};

type DetailBlock = {
  title: string;
  lines: string[];
};

type FooterLinkPageProps = {
  eyebrow?: string;
  title: string;
  intro: string;
  quote: string;
  actions?: ContactAction[];
  details?: DetailBlock[];
  children?: ReactNode;
};

const defaultActions: ContactAction[] = [
  { label: "support@purplesquad.in", href: "mailto:support@purplesquad.in", icon: "mail", variant: "dark" },
  { label: "76760 76361", href: "tel:+917676076361", icon: "phone", variant: "light" },
];

export function FooterLinkPage({ eyebrow = "Purple Squad", title, intro, quote, actions = defaultActions, details = [], children }: FooterLinkPageProps) {
  return (
    <main className="bg-white text-black">
      <section className="page-container grid min-h-[calc(100vh-5.5rem)] gap-12 py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)] lg:items-center lg:py-20">
        <div>
          <p className="text-sm font-semibold text-black">{eyebrow}</p>
          <h1 className="mt-6 max-w-xl text-5xl font-normal leading-[1.08] tracking-normal text-black sm:text-6xl">{title}</h1>
          <p className="mt-8 max-w-lg text-lg font-normal leading-8 text-black">{intro}</p>

          {actions.length ? (
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {actions.map((action) => (
                <Link
                  key={`${action.label}-${action.href}`}
                  href={action.href}
                  className={
                    action.variant === "light"
                      ? "inline-flex min-h-14 items-center justify-center gap-3 rounded-md border-2 border-black bg-white px-8 text-sm font-bold text-black"
                      : "inline-flex min-h-14 items-center justify-center gap-3 rounded-md border-2 border-black bg-black px-8 text-sm font-bold text-white"
                  }
                >
                  {action.icon === "mail" ? <Mail className="h-5 w-5" /> : <Phone className="h-5 w-5" />}
                  {action.label}
                </Link>
              ))}
            </div>
          ) : null}

          {details.length ? (
            <div className="mt-12 grid gap-8 text-sm leading-7 text-black sm:grid-cols-2">
              {details.map((detail) => (
                <div key={detail.title}>
                  <h2 className="font-bold">{detail.title}</h2>
                  <div className="mt-3">
                    {detail.lines.map((line) => (
                      <p key={line}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {children ? <div className="mt-12">{children}</div> : null}
        </div>

        <aside className="hidden text-center lg:block">
          <p className="text-5xl font-bold leading-none text-gray-200">{"\""}</p>
          <blockquote className="mx-auto mt-8 max-w-lg text-2xl italic leading-[1.65] text-black">{quote}</blockquote>
          <p className="mt-8 text-5xl font-bold leading-none text-gray-200">{"\""}</p>
          <div className="mx-auto mt-8 h-0.5 w-16 bg-black" />
        </aside>
      </section>
    </main>
  );
}
