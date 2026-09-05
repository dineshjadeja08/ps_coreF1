const sections = [
  {
    title: "1. About Purple Squad",
    body: "Purple Squad respects your privacy and is committed to protecting the personal information entrusted to us. This Privacy Policy explains how we collect, use, disclose, store, protect, and otherwise process information when you visit our website, use our app, create an account, request or book a service, communicate with us, or otherwise interact with Purple Squad.",
  },
  {
    title: "2. Information We Collect",
    body: "We may collect your name, mobile number, email address, service address, city or locality, service requirements, booking details, login information, payment and transaction information, customer support communications, reviews, ratings, feedback, complaints, suggestions, and files or photographs you voluntarily submit.",
  },
  {
    title: "3. Booking and Usage Information",
    body: "When you request or book a service, we may collect the requested service, date and time, service location, booking status, assigned vendor, service instructions, booking history, payment status, cancellation or rescheduling details, refund information, and service completion information. We may also collect device, browser, approximate location, session, crash, diagnostic, page view, click, and interaction information.",
  },
  {
    title: "4. How We Use Information",
    body: "We use information to create and manage accounts, process service requests, facilitate bookings, provide requested services, share necessary booking details with assigned vendors, process payments and refunds, send confirmations and updates, provide support, verify accounts and transactions, prevent fraud, maintain security, improve customer experience, conduct analytics, send permitted promotional communications, comply with legal requirements, and protect legal rights.",
  },
  {
    title: "5. Communications",
    body: "We may contact you through phone calls, SMS, email, WhatsApp or similar messaging platforms, push notifications, and in-app notifications for booking confirmations, vendor assignment, reminders, scheduling updates, payment confirmations, cancellation or refund updates, support responses, account notices, and security notifications. You may opt out of promotional communications where permitted by law.",
  },
  {
    title: "6. Sharing of Personal Information",
    body: "We do not sell your personal information for monetary consideration. We may share relevant information with service professionals, vendors, payment processors, cloud and hosting providers, customer support providers, communication providers, analytics providers, security and fraud-prevention providers, marketing measurement providers, and other authorized providers where reasonably necessary to operate the platform or provide requested services.",
  },
  {
    title: "7. Cookies, Payments, and Security",
    body: "Purple Squad may use cookies and similar technologies to keep users signed in, remember preferences, understand platform usage, improve performance, measure campaigns, detect security issues, and prevent fraud. Payments may be processed by authorized third-party providers. We take reasonable technical, organizational, and administrative measures to protect personal information, but no internet-based system can guarantee absolute security.",
  },
  {
    title: "8. Data Retention and Your Rights",
    body: "We retain personal information only for as long as reasonably necessary for the purposes described in this policy, unless a longer period is required or permitted by law. Subject to applicable law, you may request access, correction, deletion, withdrawal of consent, opt out of promotional communications, raise privacy complaints, and exercise other available rights. We may need to verify your identity before processing some requests.",
  },
  {
    title: "9. Account Deletion",
    body: "You may request deletion of your account or personal information by contacting us. Deleting your account may result in loss of access to bookings, service history, saved preferences, and other platform features. Certain information may continue to be retained where required or permitted by law, including financial records, tax records, fraud prevention, disputes, legal claims, or regulatory requirements.",
  },
  {
    title: "10. Third-Party Services and Changes",
    body: "The platform may contain links, integrations, payment services, communication tools, advertisements, or other features operated by third parties. Those services may have their own privacy policies and terms. Purple Squad may update this policy to reflect new services, business operations, technology, data-processing practices, applicable laws, or security requirements.",
  },
  {
    title: "11. Grievances and Privacy Requests",
    body: "For questions, concerns, requests, or complaints regarding this Privacy Policy or the handling of your personal information, contact Purple Squad using the details below.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-white text-black">
      <section className="page-container grid gap-12 py-16 lg:grid-cols-[minmax(0,0.92fr)_minmax(360px,0.78fr)] lg:items-start lg:py-20">
        <div>
          <p className="text-sm font-semibold text-black">Purple Squad</p>
          <h1 className="mt-6 max-w-xl text-5xl font-normal leading-[1.08] tracking-normal text-black sm:text-6xl">Privacy Policy</h1>
          <p className="mt-8 max-w-lg text-lg font-normal leading-8 text-black">Last updated: 5 September 2026</p>

          <div className="mt-12 space-y-7">
          {sections.map((section) => (
            <article key={section.title} className="border-b border-black pb-7">
              <h2 className="text-xl font-bold text-black">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-black">{section.body}</p>
            </article>
          ))}
          </div>
        </div>

        <aside className="hidden text-center lg:block lg:sticky lg:top-28">
          <p className="text-5xl font-bold leading-none text-gray-200">{"\""}</p>
          <blockquote className="mx-auto mt-8 max-w-lg text-2xl italic leading-[1.65] text-black">
            Protecting customer trust is part of delivering a dependable home-service experience.
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
            <p>Chennai, Bangalore, and Coimbatore.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
