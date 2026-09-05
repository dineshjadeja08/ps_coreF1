import { FooterLinkPage } from "@/components/common/footer-link-page";

const requirements = [
  "Experience in appliance repair, cleaning, installation, or home maintenance",
  "Valid identity and address documents for verification",
  "Own tools or readiness to follow Purple Squad service standards",
  "Ability to serve customers professionally in assigned city areas",
];

export default function JoinAsTechnicianPage() {
  return (
    <FooterLinkPage
      eyebrow="Purple Squad"
      title="Register as Professional"
      intro="Join our network of trusted professionals and grow your service business with Purple Squad. We connect you with customers who value quality service and reliability."
      quote="Join a platform where your expertise meets opportunity, and quality service is always rewarded."
      details={[
        {
          title: "Office address",
          lines: ["Purple Squad Support", "Chennai, Bangalore, and Coimbatore operations"],
        },
        {
          title: "Business hours",
          lines: ["Monday - Sunday: 9 AM - 7 PM"],
        },
      ]}
    >
      <div>
        <h2 className="text-base font-bold text-black">Requirements</h2>
        <div className="mt-4 grid gap-2 text-sm leading-6 text-black">
          {requirements.map((item) => (
            <p key={item} className="border border-black px-4 py-3">
              {item}
            </p>
          ))}
        </div>
      </div>
    </FooterLinkPage>
  );
}
