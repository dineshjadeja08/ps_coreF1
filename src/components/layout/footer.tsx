import Link from "next/link";

import { Brand } from "@/components/layout/brand";
import { siteConfig } from "@/config/site";

export function Footer() {
  const groups = [
    { title: "Services", links: [{ href: "/services", label: "Services" }] },
    { title: "Support", links: [{ href: "/support", label: "Help" }, { href: "/faq", label: "FAQ" }] },
    { title: "Legal", links: siteConfig.footerLinks.filter((link) => ["Privacy Policy", "Terms", "Cancellation Policy"].includes(link.label)) },
  ];

  return (
    <footer className="border-t border-border bg-primary-subtle pb-20 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-3">
          <Brand />
          <p className="max-w-sm text-sm leading-6 text-secondary">Purple Squad Care for clear pricing, trusted technicians, and simple home-service booking.</p>
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Chennai · Bangalore · Coimbatore · Build 2026.08.24.1
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold text-foreground">{group.title}</h2>
              <div className="mt-3 grid gap-2">
                {group.links.map((link) => (
                  <Link key={link.href} href={link.href} className="text-sm font-medium text-secondary hover:text-primary">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
