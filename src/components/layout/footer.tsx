import Link from "next/link";

import { Brand } from "@/components/layout/brand";

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
        <div>
          <Brand />
        </div>

        <div className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_1fr]">
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
            <div className="mt-6 grid max-w-36 gap-3">
              <span className="rounded-md bg-black px-3 py-2 text-center text-xs font-bold text-white">iOS app - coming soon</span>
              <span className="rounded-md bg-black px-3 py-2 text-center text-xs font-bold text-white">Android app - coming soon</span>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-[#dedede] pt-8 text-xs leading-6 text-secondary">
          <p>
            <a href="mailto:support@purplesquad.in" className="hover:text-primary">
              support@purplesquad.in
            </a>{" "}
            |{" "}
            <a href="tel:+917676076361" className="hover:text-primary">
              76760 76361
            </a>
          </p>
          <p className="mt-3">© {new Date().getFullYear()} Purple Squad. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
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
