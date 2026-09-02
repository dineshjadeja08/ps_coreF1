import Link from "next/link";

import { Brand } from "@/components/layout/brand";
import { env } from "@/config/env";

export function Footer() {
  const groups = [
    {
      title: "Company",
      links: [
        { href: "/support", label: "Contact" },
        { href: "/terms", label: "Terms and Conditions" },
        { href: "/privacy-policy", label: "Privacy Policy" },
      ],
    },
    {
      title: "For customers",
      links: [
        { href: "/bookings", label: "My bookings" },
        { href: "/support", label: "Help centre" },
        { href: "/cancellation-policy", label: "Cancellation policy" },
        { href: "/faq", label: "Safety information" },
      ],
    },
    {
      title: "For professionals",
      links: [
        { href: "/support", label: "Join as a technician" },
        { href: "/support", label: "Partner support" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-primary-subtle pb-20 md:pb-0">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_2fr] lg:px-8">
        <div className="space-y-3">
          <Brand />
          <p className="max-w-sm text-sm leading-6 text-secondary">Purple Squad Care for clear pricing, trusted technicians, and simple home-service booking.</p>
          {env.supportEmail || env.supportPhone ? (
            <p className="text-sm leading-6 text-secondary">
              {env.supportEmail ? env.supportEmail : null}
              {env.supportEmail && env.supportPhone ? " · " : null}
              {env.supportPhone ? env.supportPhone : null}
            </p>
          ) : null}
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-sm font-bold text-foreground">{group.title}</h2>
              <div className="mt-3 grid gap-2">
                {group.links.map((link) => (
                  <Link key={`${link.label}-${link.href}`} href={link.href} className="text-sm font-medium text-secondary hover:text-primary">
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
