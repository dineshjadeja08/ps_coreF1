import Link from "next/link";

import { Brand } from "@/components/layout/brand";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface pb-20 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-3">
          <Brand />
          <p className="max-w-sm text-sm leading-6 text-secondary">Professional home services with clear pricing, trusted technicians, and simple booking.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {siteConfig.footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="text-sm font-medium text-secondary hover:text-primary">
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
