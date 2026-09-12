import { ArrowRight, PhoneCall } from "lucide-react";
import Image from "next/image";

export function InstantBookingBanner() {
  return (
    <section className="bg-white py-8 sm:py-10" aria-label="Instant booking assistance">
      <div className="page-container">
        <div className="relative isolate min-h-[240px] overflow-hidden rounded-xl bg-[#2f087b] text-white shadow-[0_18px_55px_rgba(47,8,123,0.24)] sm:min-h-[260px]">
          <Image
            src="/images/hero/ac-service.webp"
            alt="Purple Squad professional providing home service"
            fill
            sizes="(min-width: 1280px) 1200px, 100vw"
            className="object-cover object-center sm:object-right"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#260267] via-[#350b7d]/95 to-[#350b7d]/45 sm:via-[#350b7d]/85 sm:to-transparent" />
          <div className="absolute -left-14 -top-16 h-44 w-44 rounded-full border border-white/10" />
          <div className="absolute -bottom-24 left-48 h-56 w-56 rounded-full border border-white/10" />

          <div className="relative z-10 flex min-h-[240px] max-w-2xl flex-col items-start justify-center p-6 sm:min-h-[260px] sm:p-9 lg:p-11">
            <p className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-violet-100 backdrop-blur-sm">
              <PhoneCall className="h-4 w-4" />
              Instant booking support
            </p>
            <h2 className="mt-4 max-w-xl text-2xl font-extrabold leading-tight sm:text-4xl">Need a service right away?</h2>
            <p className="mt-2 max-w-lg text-sm leading-6 text-violet-100 sm:text-base">
              Call our team for quick service selection and availability confirmation.
            </p>
            <a
              href="tel:+917676076361"
              className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-white px-5 py-3 text-base font-extrabold text-[#2f087b] shadow-lg transition hover:bg-violet-50 sm:w-auto"
            >
              <PhoneCall className="h-5 w-5" />
              Call 76760 76361
              <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
