"use client";

import { useSearchParams } from "next/navigation";

import { AddressManager } from "@/features/addresses/components/address-manager";

export function BookingAddressHandoff() {
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service");

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Booking</p>
      <h1 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">Choose a service address</h1>
      <p className="mt-3 max-w-xl text-base leading-7 text-secondary">
        {serviceSlug
          ? `You're signed in and ready to continue with ${serviceSlug}. Slot selection starts in the next phase.`
          : "You're signed in. Slot selection starts in the next phase."}
      </p>
      <div className="mt-8">
        <AddressManager compact />
      </div>
    </section>
  );
}
