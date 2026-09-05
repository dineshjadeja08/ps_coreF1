import { FooterLinkPage } from "@/components/common/footer-link-page";

const faqs = [
  ["How do I book a service?", "Choose a category, select a service package, confirm your address, pick a slot, and complete the payment step."],
  ["Where is Purple Squad available?", "Purple Squad currently focuses on Chennai, Bangalore, and Coimbatore."],
  ["Can I reschedule a booking?", "Eligible bookings can be rescheduled based on slot availability and policy windows."],
  ["How do I contact support?", "Call 76760 76361 or email support@purplesquad.in."],
  ["How do I join as a technician?", "Open the Register as Professional page and contact support with your city, service skill, and experience."],
];

export default function FaqPage() {
  return (
    <FooterLinkPage
      eyebrow="Purple Squad"
      title="FAQs"
      intro="Find quick answers about booking, service areas, rescheduling, support, and technician onboarding."
      quote="Clear answers make booking easier, and easier booking makes better service possible."
      actions={[]}
    >
      <div className="grid gap-5 text-black">
        {faqs.map(([question, answer]) => (
          <article key={question} className="border-b border-black pb-5">
            <h2 className="text-lg font-bold">{question}</h2>
            <p className="mt-2 text-sm leading-6">{answer}</p>
          </article>
        ))}
      </div>
    </FooterLinkPage>
  );
}
