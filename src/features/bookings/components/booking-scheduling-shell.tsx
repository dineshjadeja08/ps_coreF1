"use client";

import { AlertCircle, CheckCircle2, Clock, Loader2, MapPin, ShieldCheck } from "lucide-react";
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
import { useCreateBooking } from "@/features/bookings/mutations";
import { createBookingPayload, getBookingCreationErrorMessage, isSlotConflictError } from "@/features/bookings/utils";
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
  const [problemDescription, setProblemDescription] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitError, setSubmitError] = useState("");

  const service = useServiceDetail(serviceSlug);
  const addresses = useAddresses();
  const createBooking = useCreateBooking();
  const defaultAddressId = useMemo(() => {
    const items = addresses.data?.results ?? [];
    return items.find((address) => address.is_default)?.id ?? items[0]?.id ?? "";
  }, [addresses.data?.results]);
  const effectiveAddressId = selectedAddressId || defaultAddressId;
  const selectedAddress = useMemo(
    () => (addresses.data?.results ?? []).find((address) => address.id === effectiveAddressId) ?? null,
    [addresses.data?.results, effectiveAddressId],
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
    () => {
      const availableSlots = (slots.data ?? []).filter((slot) => isSlotAvailable(slot));
      return availableSlots.find((slot) => slot.id === selectedSlotId) ?? availableSlots[0] ?? null;
    },
    [selectedSlotId, slots.data],
  );
  const slotConflict =
    selectedSlotId && slots.data && !selectedSlot ? "That time is no longer available. Please choose another slot." : "";
  const defaultProblemDescription = service.data ? `${service.data.name} service requested.` : "Service requested.";

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

  async function createFastBooking() {
    if (!service.data || !selectedAddress || !selectedSlot || createBooking.isPending) return;

    setSubmitError("");

    try {
      const booking = await createBooking.mutateAsync(
        createBookingPayload({
          serviceId: service.data.id,
          addressId: selectedAddress.id,
          slotId: selectedSlot.id,
          problemDescription: problemDescription.trim() || defaultProblemDescription,
          customerNotes,
        }),
      );
      router.push(routes.bookingPayment(booking.id));
    } catch (error) {
      setSubmitError(getBookingCreationErrorMessage(error));
      if (isSlotConflictError(error)) {
        setSelectedSlotId("");
        await slots.refetch();
        updateUrl({ slot: null });
      }
    }
  }

  const canContinue = Boolean(service.data && selectedAddress && serviceability.data?.is_supported && selectedDate && selectedSlot);
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
      <BookingStepIndicator currentStep={0} />
      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Quick booking</p>
            <h1 className="mt-2 text-2xl font-bold text-foreground">Book your visit</h1>
            <p className="mt-2 text-sm leading-6 text-secondary">Default address and earliest slot are selected automatically. You can change them before payment.</p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {["Choose address", "Pick slot", "Pay advance"].map((item, index) => (
                <div key={item} className="rounded-lg bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700">
                  {index + 1}. {item}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-foreground">1. Visit address</h2>
              <p className="mt-1 text-sm text-secondary">Your default saved address is selected automatically.</p>
            </div>

            {addresses.isLoading ? <div className="mt-4 h-32 animate-pulse rounded-lg bg-muted" /> : null}
            {addresses.isError ? <ErrorState title="We could not load your addresses" error={addresses.error} onRetry={() => addresses.refetch()} /> : null}
            {addresses.data?.results?.length ? (
              <div className="mt-4 grid gap-3">
                {addresses.data.results.map((address) => {
                  const selected = effectiveAddressId === address.id;
                  return (
                    <button
                      key={address.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectAddress(address)}
                      className={cn(
                        "rounded-lg border bg-surface p-4 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        selected ? "border-slate-950 bg-slate-50 ring-2 ring-slate-950/10" : "border-border hover:border-primary/30 hover:bg-primary-subtle",
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
              <div className="mt-4 rounded-lg border border-border bg-slate-50 p-4" aria-live="polite">
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

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-foreground">2. Date and time</h2>
              <p className="mt-1 text-sm text-secondary">All standard slots are available daily for supported areas.</p>
            </div>
            <div className="mt-4">
              <DateSelector selectedDate={selectedDate} onSelectDate={selectDate} />
            </div>
            <div className="mt-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Time slot</h3>
                <p className="mt-1 text-sm text-secondary">Earliest available slot is selected automatically when possible.</p>
              </div>
            </div>
            {slotConflict ? <p className="mt-3 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{slotConflict}</p> : null}
            {!selectedAddress ? (
              <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-secondary">Select a saved address to load available slots.</p>
            ) : serviceability.data?.is_supported === false ? (
              <p className="mt-3 rounded-lg border border-border bg-surface p-4 text-sm text-destructive">Slots are blocked because this address is not serviceable.</p>
            ) : (
              <div className="mt-3">
                <SlotPicker
                  slots={slots.data ?? []}
                  selectedSlotId={selectedSlot?.id ?? selectedSlotId}
                  loading={slots.isLoading || slots.isFetching}
                  error={slots.isError ? slots.error : undefined}
                  onRetry={() => slots.refetch()}
                  onSelectSlot={selectSlot}
                  onClearDate={() => selectDate(getUpcomingDates(1)[0].value)}
                />
              </div>
            )}
          </section>

          <section className="rounded-lg border border-border bg-surface p-5 shadow-sm">
            <label htmlFor="problem-description" className="text-sm font-semibold text-foreground">
              3. Service note
            </label>
            <textarea
              id="problem-description"
              value={problemDescription}
              onChange={(event) => setProblemDescription(event.target.value)}
              placeholder={defaultProblemDescription}
              className="mt-2 min-h-24 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
            <label htmlFor="customer-notes" className="mt-4 block text-sm font-semibold text-foreground">
              Technician instructions
            </label>
            <textarea
              id="customer-notes"
              value={customerNotes}
              onChange={(event) => setCustomerNotes(event.target.value)}
              placeholder="Flat number, landmark, preferred call time, or other instructions."
              className="mt-2 min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </section>
        </div>

        <aside className="rounded-lg border border-border bg-surface p-4 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
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
              <p className="mt-4 rounded-lg bg-primary-soft p-3 text-sm font-semibold text-primary">
                  Selected: {formatSlotTime(selectedSlot.start_time)} - {formatSlotTime(selectedSlot.end_time)}
                </p>
              ) : null}
              {submitError ? <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p> : null}
              <p className="mt-4 flex gap-2 rounded-lg bg-primary-soft p-3 text-sm leading-6 text-primary">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
                You will review the payment amount before Razorpay opens.
              </p>
              <Button
                type="button"
                className="mt-5 w-full"
                disabled={!canContinue || createBooking.isPending}
                onClick={() => void createFastBooking()}
              >
                {createBooking.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Creating booking...
                  </>
                ) : (
                  "Confirm booking"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="mt-2 w-full"
                disabled={!canContinue}
                onClick={() => {
                  if (!service.data || !selectedAddress || !selectedSlot) return;
                  router.push(
                    `/book/review?service=${encodeURIComponent(service.data.slug)}&address=${encodeURIComponent(selectedAddress.id)}&date=${encodeURIComponent(selectedDate)}&slot=${encodeURIComponent(selectedSlot.id)}`,
                  );
                }}
              >
                Review details first
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
            disabled={!canContinue || createBooking.isPending}
            onClick={() => void createFastBooking()}
          >
            {createBooking.isPending ? "Booking..." : "Book"}
          </Button>
        </div>
      </div>
    </section>
  );
}
