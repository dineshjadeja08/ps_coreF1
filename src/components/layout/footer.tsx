import Image from "next/image";
import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { routes } from "@/constants/routes";

export function Footer() {
  const groups = [
    {
      title: "Company",
      links: [
        { href: "/about", label: "About us" },
        { href: "/support", label: "Contact us" },
        { href: "/terms", label: "Terms & conditions" },
        { href: "/privacy-policy", label: "Privacy policy" },
        { href: "/cancellation-policy", label: "Cancellation policy" },
      ],
    },
    {
      title: "For customers",
      links: [
        { href: "/bookings", label: "Bookings" },
        { href: "/services", label: "Categories near you" },
        { href: "/faq", label: "FAQs" },
        { href: "/support", label: "Help centre" },
      ],
    },
    {
      title: "For professionals",
      links: [
        { href: "/join-as-technician", label: "Register as a professional" },
        { href: "/partner-support", label: "Partner support" },
        { href: "/service-standards", label: "Service standards" },
      ],
    },
  ];
  const socialLinks = [
    { label: "LinkedIn", href: "https://www.linkedin.com/company/purplesquad", icon: <LinkedinIcon /> },
    { label: "Instagram", href: "https://www.instagram.com/purplesquad.in/", icon: <InstagramIcon /> },
    { label: "Facebook", href: "https://www.facebook.com/profile.php?id=61593384331661", icon: <FacebookIcon /> },
    { label: "YouTube", href: "https://www.youtube.com/@PurpleSquadOfficial", icon: <YoutubeIcon /> },
  ];

  return (
    <footer className="border-t border-border bg-[#f4f4f4] pb-24 md:pb-0">
      <div className="page-container py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.45fr_1fr_1fr_1fr_1.2fr] lg:gap-8">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href={routes.home} className="inline-block" aria-label="Purple Squad home">
              <Image
                src="/images/brand/purple-squad-logo-tagline.jpg"
                alt="Purple Squad — Service You Can Trust"
                width={1600}
                height={900}
                sizes="(min-width: 1024px) 208px, 192px"
                className="h-auto w-44 object-contain mix-blend-multiply sm:w-48 lg:w-52"
              />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-6 text-secondary">
              Trusted home services delivered by verified professionals, with clear pricing and support from booking to completion.
            </p>
            <div className="mt-5 grid gap-2">
              <a href="tel:+917676076361" className="flex w-fit items-center gap-2 text-base font-bold text-foreground transition hover:text-primary">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-white"><Phone className="h-4 w-4" /></span>
                76760 76361
              </a>
              <a href="mailto:support@purplesquad.in" className="flex w-fit items-center gap-2 text-sm font-semibold text-foreground transition hover:text-primary">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-white text-primary shadow-sm"><Mail className="h-4 w-4" /></span>
                support@purplesquad.in
              </a>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xl font-bold text-foreground">{group.title}</h2>
              <div className="mt-5 grid gap-3">
                {group.links.map((link) => (
                  <Link key={`${link.label}-${link.href}`} href={link.href} className="text-sm font-medium text-secondary hover:text-primary">
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
          ))}

          <div>
            <h2 className="text-xl font-bold text-foreground">Social links</h2>
            <div className="mt-5 flex gap-3">
              {socialLinks.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-label={item.label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid h-10 w-10 place-items-center rounded-md border border-border bg-white text-sm font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
                >
                  {item.icon}
                </Link>
              ))}
            </div>
            <div className="mt-6 grid max-w-48 gap-3">
              <AppBadge platform="App Store" eyebrow="Coming soon on the" icon={<AppleIcon />} />
              <AppBadge platform="Google Play" eyebrow="Coming soon on" icon={<PlayStoreIcon />} />
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#dedede] pt-6 text-xs leading-6 text-secondary">
          <p>© {new Date().getFullYear()} Purple Squad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function AppBadge({ platform, eyebrow, icon }: { platform: string; eyebrow: string; icon: ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-300 bg-white px-3 py-2.5 shadow-sm" aria-label={`${platform} app coming soon`}>
      <span className="shrink-0 text-foreground">{icon}</span>
      <span className="leading-none">
        <span className="block text-[10px] font-semibold uppercase tracking-wide text-secondary">{eyebrow}</span>
        <span className="mt-1 block text-base font-bold text-foreground">{platform}</span>
      </span>
    </div>
  );
}

function AppleIcon() {
  return <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 12.54c.03-2.3 1.88-3.41 1.97-3.46a4.22 4.22 0 0 0-3.32-1.79c-1.4-.15-2.76.84-3.47.84-.72 0-1.81-.82-2.98-.79a4.4 4.4 0 0 0-3.7 2.25c-1.61 2.79-.41 6.89 1.13 9.15.77 1.1 1.67 2.34 2.84 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.98.71 1.23-.02 2.01-1.11 2.75-2.22a9.1 9.1 0 0 0 1.26-2.57 3.96 3.96 0 0 1-2.43-3.68ZM14.79 5.81a4.03 4.03 0 0 0 .92-2.9 4.11 4.11 0 0 0-2.66 1.38 3.84 3.84 0 0 0-.95 2.8 3.4 3.4 0 0 0 2.69-1.28Z" /></svg>;
}

function PlayStoreIcon() {
  return <svg aria-hidden="true" className="h-7 w-7" viewBox="0 0 24 24"><path fill="#34A853" d="M3.4 2.6A2 2 0 0 0 3 3.8v16.4c0 .46.15.86.4 1.18L13 12 3.4 2.6Z"/><path fill="#4285F4" d="m16.2 8.9-11-6.3c-.55-.31-1.08-.27-1.46 0L13 12l3.2-3.1Z"/><path fill="#FBBC04" d="M3.74 21.4c.38.27.91.31 1.46 0l11.02-6.28L13 12l-9.26 9.4Z"/><path fill="#EA4335" d="m20.1 11.12-3.88-2.22L13 12l3.22 3.12 3.88-2.2c1.2-.69 1.2-1.12 0-1.8Z"/></svg>;
}

function LinkedinIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M6.94 8.98H3.75V20h3.19V8.98ZM5.35 4a1.85 1.85 0 1 0 0 3.7 1.85 1.85 0 0 0 0-3.7ZM20.25 13.68c0-2.96-1.58-4.34-3.69-4.34a3.18 3.18 0 0 0-2.88 1.58h-.04V8.98h-3.05V20h3.18v-5.45c0-1.44.27-2.84 2.06-2.84 1.76 0 1.79 1.65 1.79 2.93V20h3.18v-6.32h-.55Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M17.5 6.8h.01" />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M14.1 8.3V6.9c0-.68.45-.84.77-.84h1.95V3.1L14.13 3c-2.99 0-3.67 2.24-3.67 3.67V8.3H8.1v3.04h2.36V21h3.64v-9.66h2.45l.32-3.04H14.1Z" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
      <path d="M21.58 7.19a2.64 2.64 0 0 0-1.86-1.87C18.08 4.88 12 4.88 12 4.88s-6.08 0-7.72.44a2.64 2.64 0 0 0-1.86 1.87A27.5 27.5 0 0 0 2 12a27.5 27.5 0 0 0 .42 4.81 2.64 2.64 0 0 0 1.86 1.87c1.64.44 7.72.44 7.72.44s6.08 0 7.72-.44a2.64 2.64 0 0 0 1.86-1.87A27.5 27.5 0 0 0 22 12a27.5 27.5 0 0 0-.42-4.81ZM10 15.1V8.9l5.2 3.1L10 15.1Z" />
    </svg>
  );
}
