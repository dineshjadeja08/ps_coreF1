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
    <section className="mx-auto max-w-6xl px-4 py-5 pb-28 sm:px-6 lg:px-8">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Book service</p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-foreground">Confirm your visit</h1>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={routes.services}>Change service</Link>
        </Button>
      </div>

      {service.data ? (
        <section className="mb-4 grid overflow-hidden rounded-lg border border-border bg-surface shadow-sm md:grid-cols-[120px_1fr_auto] md:items-center">
          <ServiceImage src={service.data.cover_image} alt={service.data.name} className="aspect-[16/9] rounded-none md:aspect-square" />
          <div className="p-3">
            <p className="text-xs font-bold uppercase text-primary">{service.data.category.name}</p>
            <h2 className="mt-1 text-lg font-bold text-foreground">{service.data.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-secondary">
              {duration ? (
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4 text-primary" />
                  {duration}
                </span>
              ) : null}
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Verified technician
              </span>
            </div>
          </div>
          <div className="border-t border-border p-3 md:border-l md:border-t-0">
            <PriceDisplay service={service.data} compact />
          </div>
        </section>
      ) : service.isLoading ? (
        <div className="mb-5 h-40 animate-pulse rounded-lg bg-muted" />
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <div className="space-y-4">
          <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-foreground">Address</h2>
              </div>
              {serviceability.data?.is_supported ? (
                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-bold text-green-700">Serviceable</span>
              ) : null}
            </div>

            {addresses.isLoading ? <div className="mt-4 h-24 animate-pulse rounded-lg bg-muted" /> : null}
            {addresses.isError ? <ErrorState title="We could not load your addresses" error={addresses.error} onRetry={() => addresses.refetch()} /> : null}
            {addresses.data?.results?.length ? (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {addresses.data.results.slice(0, 2).map((address) => {
                  const selected = effectiveAddressId === address.id;
                  return (
                    <button
                      key={address.id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => selectAddress(address)}
                      className={cn(
                        "min-h-20 rounded-lg border bg-surface p-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        selected ? "border-slate-950 bg-slate-50 ring-2 ring-slate-950/10" : "border-border hover:border-primary/30 hover:bg-slate-50",
                      )}
                    >
                      <span className="flex items-center gap-2 font-semibold text-foreground">
                        {selected ? <CheckCircle2 className="h-4 w-4 text-success" /> : <MapPin className="h-4 w-4 text-primary" />}
                        {address.label}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-sm leading-5 text-secondary">
                        {address.address_line_1}, {address.city}, {address.state} {address.postal_code}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}
            {addresses.data && addresses.data.results.length === 0 ? <AddressManager compact /> : null}

            {selectedAddress ? (
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2" aria-live="polite">
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

          <section className="rounded-lg border border-border bg-surface p-4 shadow-sm">
            <div>
              <h2 className="text-lg font-bold text-foreground">Date and time</h2>
            </div>
            <div className="mt-3">
              <DateSelector selectedDate={selectedDate} onSelectDate={selectDate} />
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
        </div>

        <aside className="rounded-lg border border-border bg-surface p-5 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-lg font-bold text-foreground">Booking summary</h2>
          <div className="mt-4 space-y-4 text-sm">
            <SummaryLine label="Address" value={selectedAddress ? `${selectedAddress.label}, ${selectedAddress.postal_code}` : "Select address"} />
            <SummaryLine label="Date" value={selectedDate ? new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", weekday: "short" }) : "Select date"} />
            <SummaryLine
              label="Time"
              value={selectedSlot ? `${formatSlotTime(selectedSlot.start_time)} - ${formatSlotTime(selectedSlot.end_time)}` : "Select slot"}
            />
          </div>
          <label htmlFor="customer-notes" className="mt-4 block text-sm font-semibold text-foreground">
            Note
          </label>
          <textarea
            id="customer-notes"
            value={customerNotes}
            onChange={(event) => {
              setCustomerNotes(event.target.value);
              setProblemDescription(event.target.value);
            }}
            placeholder="Optional instructions"
            className="mt-2 min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
          />
          {submitError ? <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p> : null}
          <p className="mt-4 flex gap-2 rounded-lg bg-primary-soft p-3 text-sm leading-6 text-primary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Final amount is confirmed before Razorpay opens.
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
              "Continue to payment"
            )}
          </Button>
        </aside>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-border bg-surface p-3 shadow-lg md:hidden">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <p className="min-w-0 text-sm font-semibold text-foreground">
            {selectedSlot ? `${formatSlotTime(selectedSlot.start_time)} selected` : "Choose a time slot"}
          </p>
          <Button
            type="button"
            disabled={!canContinue || createBooking.isPending}
            onClick={() => void createFastBooking()}
          >
            {createBooking.isPending ? "Booking..." : "Pay"}
          </Button>
        </div>
      </div>
    </section>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3 last:border-b-0 last:pb-0">
      <span className="text-secondary">{label}</span>
      <span className="max-w-44 text-right font-semibold text-foreground">{value}</span>
    </div>
  );
}
