import { FooterLinkPage } from "@/components/common/footer-link-page";

export default function PartnerSupportPage() {
  return (
    <FooterLinkPage
      eyebrow="Purple Squad"
      title="Partner support"
      intro="For technician onboarding, assignment questions, service standards, customer issue support, or profile help, contact the Purple Squad operations team."
      quote="Good service work needs clear communication, fair process, and support that respects the professional."
      details={[
        { title: "Support hours", lines: ["Monday - Sunday: 9 AM - 7 PM"] },
        { title: "Partner areas", lines: ["Chennai", "Bangalore", "Coimbatore"] },
      ]}
    />
  );
}
