import Link from "next/link";

import { FooterLinkPage } from "@/components/common/footer-link-page";

export default function SupportPage() {
  return (
    <FooterLinkPage
      eyebrow="Purple Squad"
      title="Contact us"
      intro="We're here to help you book services, manage payments, handle rescheduling, and resolve service concerns. Whether you need support or want to learn more about Purple Squad, our team is ready to assist you."
      quote="Purple Squad delivers more than home services - we deliver peace of mind, with care you can trust and quality you can feel."
      details={[
        { title: "Business hours", lines: ["Monday - Sunday: 9 AM - 7 PM"] },
        { title: "Service areas", lines: ["Chennai", "Bangalore", "Coimbatore"] },
      ]}
    >
      <div className="grid gap-3 text-sm font-semibold text-black sm:grid-cols-2">
        <Link href="/bookings" className="border border-black px-4 py-3 text-center hover:bg-black hover:text-white">
          My bookings
        </Link>
        <Link href="/join-as-technician" className="border border-black px-4 py-3 text-center hover:bg-black hover:text-white">
          Join as technician
        </Link>
      </div>
    </FooterLinkPage>
  );
}
