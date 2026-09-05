const terms = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing or using Purple Squad, you agree to these Terms and Conditions. If you do not agree, please do not use the platform or book a service through Purple Squad.",
  },
  {
    title: "2. Services",
    body: "Purple Squad helps customers discover and book home services such as appliance repair, cleaning, installation, and related support services. Service availability, pricing, slot availability, and technician assignment may vary by city, locality, service type, and operational capacity.",
  },
  {
    title: "3. Customer Responsibilities",
    body: "Customers must provide accurate contact details, address information, service requirements, and access instructions. Customers are responsible for ensuring that an adult is available at the service location and that the technician can safely access the area where service is required.",
  },
  {
    title: "4. Booking, Rescheduling, and Cancellation",
    body: "Bookings are subject to serviceability checks, technician availability, and confirmation by Purple Squad. Rescheduling and cancellation may be restricted by policy windows, operational constraints, or payment status. Any applicable refund or cancellation handling will follow Purple Squad's active policy at the time of the request.",
  },
  {
    title: "5. Pricing and Payments",
    body: "Prices shown on the platform may include starting prices, package prices, inspection charges, advance amounts, or estimated charges. Final pricing may depend on service scope, spare parts, customer approval, and technician inspection. Payments may be processed through authorized payment providers, payment links, or approved offline methods where enabled.",
  },
  {
    title: "6. Technician and Vendor Services",
    body: "Service professionals are expected to follow Purple Squad service standards. Customers should avoid sharing unnecessary sensitive information with technicians and should report any issue to Purple Squad support promptly.",
  },
  {
    title: "7. User Content and Reviews",
    body: "Customers may submit ratings, reviews, comments, photos, or feedback. You agree not to submit unlawful, abusive, misleading, defamatory, confidential, or irrelevant content. Purple Squad may moderate or remove content that violates platform standards or applicable law.",
  },
  {
    title: "8. Platform Availability",
    body: "Purple Squad may update, modify, suspend, or discontinue platform features, service categories, pricing, areas, or workflows from time to time. We aim to keep the platform reliable, but uninterrupted access is not guaranteed.",
  },
  {
    title: "9. Limitation of Liability",
    body: "To the extent permitted by applicable law, Purple Squad is not liable for indirect, incidental, special, consequential, or punitive damages arising from platform use, service delay, third-party provider actions, payment provider downtime, or circumstances beyond reasonable control.",
  },
  {
    title: "10. Contact",
    body: "For service issues, account support, booking help, cancellation questions, or legal queries, contact Purple Squad using the support details below.",
  },
];

export default function TermsPage() {
  return (
    <main className="bg-white text-black">
      <section className="page-container grid gap-12 py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)] lg:items-start lg:py-20">
        <div>
          <p className="text-sm font-semibold text-black">Purple Squad</p>
          <h1 className="mt-6 max-w-xl text-5xl font-normal leading-[1.08] tracking-normal text-black sm:text-6xl">Terms & Conditions</h1>
          <p className="mt-8 max-w-lg text-lg font-normal leading-8 text-black">
            These terms explain how customers may use Purple Squad and book services through the platform.
          </p>

          <div className="mt-12 space-y-7">
          {terms.map((term) => (
            <article key={term.title} className="border-b border-black pb-7">
              <h2 className="text-xl font-bold text-black">{term.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black">{term.body}</p>
            </article>
          ))}
          </div>
        </div>

        <aside className="hidden text-center lg:block lg:sticky lg:top-28">
          <p className="text-5xl font-bold leading-none text-gray-200">{"\""}</p>
          <blockquote className="mx-auto mt-8 max-w-lg text-2xl italic leading-[1.65] text-black">
            Transparent terms make every service booking clearer for customers and professionals.
          </blockquote>
          <p className="mt-8 text-5xl font-bold leading-none text-gray-200">{"\""}</p>
          <div className="mx-auto mt-8 h-0.5 w-16 bg-black" />
          <div className="mt-10 space-y-3 text-sm leading-6 text-black">
            <p>
              <a className="font-semibold" href="mailto:support@purplesquad.in">
                support@purplesquad.in
              </a>
            </p>
            <p>
              <a className="font-semibold" href="tel:+917676076361">
                76760 76361
              </a>
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
