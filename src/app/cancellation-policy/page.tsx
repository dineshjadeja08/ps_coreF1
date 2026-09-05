import { FooterLinkPage } from "@/components/common/footer-link-page";

const policy = [
  ["Before technician assignment", "You may request cancellation or rescheduling from your booking page or by contacting support. Eligibility depends on booking status and operational policy windows."],
  ["After technician assignment", "Cancellation or rescheduling may require support review because the technician has already been allocated for the visit."],
  ["Payments and refunds", "Refund eligibility depends on payment status, service status, payment provider confirmation, and the active cancellation policy at the time of the request."],
  ["Need help?", "Call 76760 76361 or email support@purplesquad.in with your booking ID and registered mobile number."],
];

export default function CancellationPolicyPage() {
  return (
    <FooterLinkPage
      eyebrow="Purple Squad"
      title="Cancellation policy"
      intro="This page explains the current customer-facing cancellation and rescheduling guidance for Purple Squad bookings."
      quote="Good support means helping customers change plans without losing clarity or trust."
      actions={[]}
    >
      <div className="grid gap-5 text-black">
        {policy.map(([title, body]) => (
          <article key={title} className="border-b border-black pb-5">
            <h2 className="text-lg font-bold">{title}</h2>
            <p className="mt-2 text-sm leading-6">{body}</p>
          </article>
        ))}
      </div>
    </FooterLinkPage>
  );
}
