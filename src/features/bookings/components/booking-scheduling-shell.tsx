"use client";

import { AlertCircle, CheckCircle2, Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { AddressManager } from "@/features/addresses/components/address-manager";
import { useAddresses, useAddressServiceability } from "@/features/addresses/queries";
import type { Address } from "@/features/addresses/types";
import { BookingStepIndicator } from "@/features/bookings/components/booking-step-indicator";
import { DateSelector } from "@/features/bookings/components/date-selector";
import { SlotPicker } from "@/features/bookings/components/slot-picker";
import { useServiceDetail } from "@/features/catalogue/queries";
import { PriceDisplay } from "@/features/catalogue/components/price-display";
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { formatDuration } from "@/features/catalogue/utils";
import { useAvailableSlots } from "@/features/slots/queries";
import type { TimeSlot } from "@/features/slots/types";
import { formatSlotTime, getUpcomingDates, isSlotAvailable } from "@/features/slots/utils";
import { cn } from "@/lib/utils";

export function BookingSchedulingShell() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const serviceSlug = searchParams.get("service") ?? "";
  const initialAddressId = searchParams.get("address") ?? "";
  const initialDate = searchParams.get("date") ?? getUpcomingDates(1)[0].value;
  const initialSlotId = searchParams.get("slot") ?? "";

  const [selectedAddressId, setSelectedAddressId] = useState(initialAddressId);
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedSlotId, setSelectedSlotId] = useState(initialSlotId);

  const service = useServiceDetail(serviceSlug);
  const addresses = useAddresses();
  const selectedAddress = useMemo(
    () => (addresses.data?.results ?? []).find((address) => address.id === selectedAddressId) ?? null,
    [addresses.data?.results, selectedAddressId],
  );
  const serviceability = useAddressServiceability(selectedAddress?.postal_code ?? "", Boolean(selectedAddress?.postal_code));
  const slots = useAvailableSlots(
    service.data && selectedAddress && serviceability.data?.is_supported
      ? {
          serviceId: service.data.id,
          postalCode: selectedAddress.postal_code,
          date: selectedDate,
        }
      : null,
  );

  const selectedSlot = useMemo(
    () => (slots.data ?? []).find((slot) => slot.id === selectedSlotId && isSlotAvailable(slot)) ?? null,
    [selectedSlotId, slots.data],
  );
  const slotConflict =
    selectedSlotId && slots.data && !selectedSlot ? "That time is no longer available. Please choose another slot." : "";

  function updateUrl(next: { address?: string; date?: string; slot?: string | null }) {
    const params = new URLSearchParams(searchParams.toString());
    if (next.address !== undefined) params.set("address", next.address);
    if (next.date !== undefined) params.set("date", next.date);
    if (next.slot === null) params.delete("slot");
    if (next.slot) params.set("slot", next.slot);
    router.replace(`/book?${params.toString()}`, { scroll: false });
  }

  function selectAddress(address: Address) {
    setSelectedAddressId(address.id);
    setSelectedSlotId("");
    updateUrl({ address: address.id, slot: null });
  }

  function selectDate(date: string) {
    setSelectedDate(date);
    setSelectedSlotId("");
    updateUrl({ date, slot: null });
  }

  function selectSlot(slot: TimeSlot) {
    setSelectedSlotId(slot.id);
    updateUrl({ slot: slot.id });
  }

  const canContinue = Boolean(service.data && selectedAddress && serviceability.data?.is_supported && selectedDate && selectedSlot);
  const currentStep = selectedSlot ? 3 : selectedAddress && serviceability.data?.is_supported ? 2 : selectedAddressId ? 1 : 0;
  const duration = service.data ? formatDuration(service.data.estimated_duration_minutes) : null;

  if (!serviceSlug) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState title="Choose a service first" description="Start from the service catalogue so we know what you want to book." actionHref={routes.services} />
      </div>
    );
  }

  if (service.isError) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState title="We could not load this service" error={service.error} onRetry={() => service.refetch()} />
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8">
      <BookingStepIndicator currentStep={currentStep} />
      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <div className="space-y-8">
          <section className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
            <h1 className="text-2xl font-bold text-foreground">Book Service</h1>
            <p className="mt-2 text-sm leading-6 text-secondary">Select your serviceable address, preferred date, and available technician slot.</p>
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">1. Select address</h2>
              <p className="mt-1 text-sm text-secondary">Choose where the technician should visit.</p>
            </div>

            {addresses.isLoading ? <div className="h-32 animate-pulse rounded-2xl bg-muted" /> : null}
            {addresses.isError ? <ErrorState title="We could not load your addresses" error={addresses.error} onRetry={() => addresses.refetch()} /> : null}
            {addresses.data?.results?.length ? (
              <div className="grid gap-3">
                {addresses.data.results.map((address) => {
                  const selected = selectedAddressId === address.id;
                  return (
                    <button
                      key={address.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectAddress(address)}
                      className={cn(
                        "rounded-2xl border bg-surface p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        selected ? "border-primary bg-primary-subtle ring-2 ring-primary/15" : "border-border hover:border-primary/30 hover:bg-primary-subtle",
                      )}
                    >
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        {selected ? <CheckCircle2 className="h-4 w-4 text-success" /> : <MapPin className="h-4 w-4 text-primary" />}
                        {address.label}
                      </span>
                      <span className="mt-2 block text-sm leading-6 text-secondary">
                        {address.address_line_1}, {address.city}, {address.state} {address.postal_code}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            {addresses.data && addresses.data.results.length === 0 ? <AddressManager compact /> : null}

            {selectedAddress ? (
              <div className="rounded-2xl border border-border bg-surface p-4" aria-live="polite">
                {serviceability.isFetching ? (
                  <p className="text-sm text-secondary">Checking serviceability...</p>
                ) : serviceability.data?.is_supported ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" />
                    Service is available at this address.
                  </p>
                ) : serviceability.data ? (
                  <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    Service is not currently available at this address. Please select another address.
                  </p>
                ) : serviceability.isError ? (
                  <p className="text-sm text-destructive">We could not verify this address. Please try another address or retry.</p>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">2. Pick a date</h2>
              <p className="mt-1 text-sm text-secondary">No business-day assumptions are made here. If the backend has no slots, we show that date as empty.</p>
            </div>
            <DateSelector selectedDate={selectedDate} onSelectDate={selectDate} />
          </section>

          <section className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">3. Select time slot</h2>
              <p className="mt-1 text-sm text-secondary">Your time will be confirmed when the booking is created in the next phase.</p>
            </div>
            {slotConflict ? <p className="rounded-2xl bg-destructive/10 p-3 text-sm text-destructive">{slotConflict}</p> : null}
            {!selectedAddress ? (
              <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-secondary">Select a saved address to load available slots.</p>
            ) : serviceability.data?.is_supported === false ? (
              <p className="rounded-2xl border border-border bg-surface p-4 text-sm text-destructive">Slots are blocked because this address is not serviceable.</p>
            ) : (
              <SlotPicker
                slots={slots.data ?? []}
                selectedSlotId={selectedSlotId}
                loading={slots.isLoading || slots.isFetching}
                error={slots.isError ? slots.error : undefined}
                onRetry={() => slots.refetch()}
                onSelectSlot={selectSlot}
                onClearDate={() => selectDate(getUpcomingDates(1)[0].value)}
              />
            )}
          </section>
        </div>

        <aside className="rounded-3xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
          {service.isLoading ? (
            <div className="h-72 animate-pulse rounded-2xl bg-muted" />
          ) : service.data ? (
            <div>
              <ServiceImage src={service.data.cover_image} alt={service.data.name} className="aspect-[4/3]" />
              <h2 className="mt-4 text-xl font-bold text-foreground">{service.data.name}</h2>
              <p className="mt-1 text-sm text-secondary">{service.data.category.name}</p>
              {service.data.short_description ? <p className="mt-3 text-sm leading-6 text-secondary">{service.data.short_description}</p> : null}
              <div className="mt-4">
                <PriceDisplay service={service.data} compact />
              </div>
              {duration ? (
                <p className="mt-3 flex items-center gap-2 text-sm text-secondary">
                  <Clock className="h-4 w-4 text-primary" />
                  {duration}
                </p>
              ) : null}
              {selectedSlot ? (
                <p className="mt-4 rounded-2xl bg-primary-soft p-3 text-sm font-semibold text-primary">
                  Selected: {formatSlotTime(selectedSlot.start_time)} - {formatSlotTime(selectedSlot.end_time)}
                </p>
              ) : null}
              <Button
                type="button"
                className="mt-5 w-full"
                disabled={!canContinue}
                onClick={() => {
                  if (!service.data || !selectedAddress || !selectedSlot) return;
                  router.push(
                    `/book/review?service=${encodeURIComponent(service.data.slug)}&address=${encodeURIComponent(selectedAddress.id)}&date=${encodeURIComponent(selectedDate)}&slot=${encodeURIComponent(selectedSlot.id)}`,
                  );
                }}
              >
                Continue
              </Button>
              <Button asChild variant="ghost" className="mt-2 w-full">
                <Link href={routes.services}>Change service</Link>
              </Button>
            </div>
          ) : null}
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface p-3 shadow-lg md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <p className="min-w-0 text-sm font-semibold text-foreground">
            {selectedSlot ? `Selected: ${formatSlotTime(selectedSlot.start_time)}` : "Choose a time slot"}
          </p>
          <Button
            type="button"
            disabled={!canContinue}
            onClick={() => {
              if (!service.data || !selectedAddress || !selectedSlot) return;
              router.push(
                `/book/review?service=${encodeURIComponent(service.data.slug)}&address=${encodeURIComponent(selectedAddress.id)}&date=${encodeURIComponent(selectedDate)}&slot=${encodeURIComponent(selectedSlot.id)}`,
              );
            }}
          >
            Continue
          </Button>
        </div>
      </div>
    </section>
  );
}
