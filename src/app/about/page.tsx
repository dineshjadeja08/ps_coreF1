import { FooterLinkPage } from "@/components/common/footer-link-page";

const values = ["Clear pricing before booking", "Verified service professionals", "Simple booking flow", "Support through the service journey"];

export default function AboutPage() {
  return (
    <FooterLinkPage
      eyebrow="Purple Squad"
      title="About Purple Squad"
      intro="Purple Squad is a home-services platform for appliance repair, cleaning, installation, and maintenance. We help customers book trusted service professionals with clear packages, service support, and a simple digital booking flow."
      quote="Reliable home service should feel simple, transparent, and cared for from the first click to final completion."
      details={[
        { title: "Currently serving", lines: ["Chennai", "Bangalore", "Coimbatore"] },
        { title: "Support", lines: ["support@purplesquad.in", "76760 76361"] },
      ]}
    >
      <div className="grid gap-2 text-sm font-semibold text-black sm:grid-cols-2">
        {values.map((value) => (
          <p key={value} className="border border-black px-4 py-3">
            {value}
          </p>
        ))}
      </div>
    </FooterLinkPage>
  );
}
