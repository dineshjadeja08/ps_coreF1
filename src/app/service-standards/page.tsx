import { FooterLinkPage } from "@/components/common/footer-link-page";

const standards = [
  "Arrive within the confirmed service window or inform support if delayed",
  "Wear clean, professional clothing and carry required tools",
  "Explain inspection findings and pricing clearly before extra work",
  "Protect customer property and clean the work area after service",
  "Close the booking only after the customer confirms service completion",
];

export default function ServiceStandardsPage() {
  return (
    <FooterLinkPage
      eyebrow="Purple Squad"
      title="Service standards"
      intro="Purple Squad professionals are expected to keep every visit professional, transparent, and safe for customers."
      quote="The best service experience is calm, clear, punctual, and respectful inside the customer's home."
      actions={[]}
      details={[{ title: "Need clarification?", lines: ["support@purplesquad.in", "76760 76361"] }]}
    >
      <div className="grid gap-2 text-sm leading-6 text-black">
        {standards.map((standard, index) => (
          <p key={standard} className="border border-black px-4 py-3">
            {index + 1}. {standard}
          </p>
        ))}
      </div>
    </FooterLinkPage>
  );
}
