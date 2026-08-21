"use client";

import { AlertCircle, ArrowLeft, CalendarClock, CheckCircle2, Loader2, PenLine, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { useAddresses, useAddressServiceability } from "@/features/addresses/queries";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import { useCreateBooking } from "@/features/bookings/mutations";
import {
  createBookingPayload,
  formatDisplayDate,
  formatMoney,
  getBookingAddressSnapshot,
  getBookingCreationErrorMessage,
  getBookingServiceSnapshot,
  getBookingTimeSlot,
  getSnapshotText,
  isSlotConflictError,
} from "@/features/bookings/utils";
import { useServiceDetail } from "@/features/catalogue/queries";
import { PriceDisplay } from "@/features/catalogue/components/price-display";
import { formatDuration } from "@/features/catalogue/utils";
import { useAvailableSlots } from "@/features/slots/queries";
import { formatSlotTime, isSlotAvailable } from "@/features/slots/utils";

export function BookingReviewShell() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service") ?? "";
  const addressId = searchParams.get("address") ?? "";
  const selectedDate = searchParams.get("date") ?? "";
  const slotId = searchParams.get("slot") ?? "";

  const [problemDescription, setProblemDescription] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [submitError, setSubmitError] = useState("");

  const hasDraft = Boolean(serviceSlug && addressId && selectedDate && slotId);
  const service = useServiceDetail(serviceSlug);
  const addresses = useAddresses();
  const selectedAddress = useMemo(
    () => (addresses.data?.results ?? []).find((address) => address.id === addressId) ?? null,
    [addressId, addresses.data?.results],
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
  const selectedSlot = useMemo(() => (slots.data ?? []).find((slot) => slot.id === slotId && isSlotAvailable(slot)) ?? null, [slotId, slots.data]);
  const createBooking = useCreateBooking();
  const createdBooking = createBooking.data;

  const loadingDraft = service.isLoading || addresses.isLoading || serviceability.isLoading || slots.isLoading || slots.isFetching;
  const staleSlot = Boolean(slotId && slots.data && !selectedSlot);
  const blockedReason = !hasDraft
    ? "missing"
    : service.isError
      ? "service"
      : addresses.isError
        ? "address"
        : serviceability.isError || serviceability.data?.is_supported === false
          ? "serviceability"
          : staleSlot
            ? "slot"
            : null;
  const canSubmit = Boolean(service.data?.id && selectedAddress?.id && selectedSlot?.id && problemDescription.trim() && !createBooking.isPending && !createdBooking && !blockedReason);

  function returnToScheduling(clearSlot = false) {
    const params = new URLSearchParams();
    if (serviceSlug) params.set("service", serviceSlug);
    if (addressId) params.set("address", addressId);
    if (selectedDate) params.set("date", selectedDate);
    if (!clearSlot && slotId) params.set("slot", slotId);
    router.replace(`/book?${params.toString()}`);
  }

  async function submitBooking(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || !service.data || !selectedAddress || !selectedSlot) return;

    setSubmitError("");

    try {
      const booking = await createBooking.mutateAsync(
        createBookingPayload({
          serviceId: service.data.id,
          addressId: selectedAddress.id,
          slotId: selectedSlot.id,
          problemDescription,
          customerNotes,
        }),
      );
      router.replace(routes.bookingPayment(booking.id));
    } catch (error) {
      const message = getBookingCreationErrorMessage(error);
      setSubmitError(message);
      if (isSlotConflictError(error)) {
        await slots.refetch();
        returnToScheduling(true);
      }
    }
  }

  if (!hasDraft) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <EmptyState
          title="Your booking details are incomplete."
          description="Please select your service, address and time again."
          actionLabel="Back to booking"
          actionHref={routes.book}
        />
      </div>
    );
  }

  if (blockedReason === "service") {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState title="This service is unavailable" error={service.error} onRetry={() => service.refetch()} />
      </div>
    );
  }

  if (createdBooking) {
    const serviceSnapshot = getBookingServiceSnapshot(createdBooking);
    const addressSnapshot = getBookingAddressSnapshot(createdBooking);
    const timeSlot = getBookingTimeSlot(createdBooking);

    return (
      <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-border bg-surface p-6">
          <CheckCircle2 className="h-10 w-10 text-success" />
          <h1 className="mt-4 text-3xl font-bold text-foreground">Booking Created</h1>
          <p className="mt-2 text-secondary">Complete your advance payment to confirm the booking.</p>
          <dl className="mt-6 grid gap-4 sm:grid-cols-2">
            <SummaryItem label="Booking ID" value={createdBooking.booking_number || createdBooking.id} />
            <SummaryItem label="Service" value={getSnapshotText(serviceSnapshot, ["name", "title"]) || "Selected service"} />
            <SummaryItem label="Address" value={formatAddressSnapshot(addressSnapshot)} />
            <SummaryItem label="Schedule" value={formatCreatedSlot(createdBooking.service_date, timeSlot)} />
            <SummaryItem label="Service Total" value={formatMoney(createdBooking.total_amount)} />
            <SummaryItem label="Advance Payable Now" value={formatMoney(createdBooking.advance_required)} />
            <SummaryItem label="Balance After Service" value={formatMoney(createdBooking.balance_due)} />
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">Booking</dt>
              <dd className="mt-1">
                <StatusBadge type="booking" status={createdBooking.booking_status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">Payment</dt>
              <dd className="mt-1">
                <StatusBadge type="payment" status={createdBooking.payment_status} />
              </dd>
            </div>
          </dl>
          <Button asChild className="mt-6">
            <Link href={routes.bookingPayment(createdBooking.id)}>Continue to Payment</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <form className="mx-auto max-w-7xl px-4 py-8 pb-28 sm:px-6 lg:px-8" onSubmit={submitBooking}>
      <Button asChild variant="ghost" className="mb-5">
        <Link href={`/book?${searchParams.toString()}`}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to scheduling
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
        <main className="space-y-6">
          <section className="rounded-lg border border-border bg-surface p-5">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Booking Review</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Confirm your service visit</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              We re-check your service, address and selected slot before creating the booking.
            </p>
          </section>

          {loadingDraft ? <div className="h-28 animate-pulse rounded-lg bg-muted" /> : null}

          {blockedReason === "address" ? <ErrorState title="We could not load your address" error={addresses.error} onRetry={() => addresses.refetch()} /> : null}
          {blockedReason === "serviceability" ? (
            <BlockedPanel
              title="This address is not serviceable"
              description="Please choose another saved address before creating this booking."
              onAction={() => returnToScheduling(true)}
            />
          ) : null}
          {blockedReason === "slot" ? (
            <BlockedPanel
              title="That time is no longer available"
              description="Please select another slot. Your service, address and date will be preserved."
              onAction={() => returnToScheduling(true)}
            />
          ) : null}

          {service.data && selectedAddress && selectedSlot ? (
            <section className="grid gap-4 md:grid-cols-3">
              <ReviewCard title="Service" actionHref={routes.services} actionLabel="Change service">
                <h2 className="text-lg font-bold text-foreground">{service.data.name}</h2>
                <p className="mt-1 text-sm text-secondary">{formatDuration(service.data.estimated_duration_minutes)}</p>
                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Current listed price</p>
                  <PriceDisplay service={service.data} compact />
                </div>
              </ReviewCard>
              <ReviewCard title="Address" actionHref={`/book?service=${encodeURIComponent(serviceSlug)}&date=${encodeURIComponent(selectedDate)}`} actionLabel="Change address">
                <h2 className="text-lg font-bold text-foreground">{selectedAddress.label}</h2>
                <p className="mt-1 text-sm leading-6 text-secondary">
                  {selectedAddress.address_line_1}
                  {selectedAddress.address_line_2 ? `, ${selectedAddress.address_line_2}` : ""}
                  {`, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postal_code}`}
                </p>
              </ReviewCard>
              <ReviewCard title="Schedule" actionHref={`/book?service=${encodeURIComponent(serviceSlug)}&address=${encodeURIComponent(addressId)}&date=${encodeURIComponent(selectedDate)}`} actionLabel="Change schedule">
                <h2 className="text-lg font-bold text-foreground">{formatDisplayDate(selectedDate)}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-secondary">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  {formatSlotTime(selectedSlot.start_time)} - {formatSlotTime(selectedSlot.end_time)}
                </p>
              </ReviewCard>
            </section>
          ) : null}

          <section className="rounded-lg border border-border bg-surface p-5">
            <label htmlFor="problem-description" className="text-sm font-semibold text-foreground">
              Problem description
            </label>
            <textarea
              id="problem-description"
              required
              minLength={1}
              value={problemDescription}
              onChange={(event) => setProblemDescription(event.target.value)}
              placeholder="Tell us what needs attention."
              className="mt-2 min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
            <label htmlFor="customer-notes" className="mt-4 block text-sm font-semibold text-foreground">
              Notes for technician
            </label>
            <textarea
              id="customer-notes"
              value={customerNotes}
              onChange={(event) => setCustomerNotes(event.target.value)}
              placeholder="Optional instructions."
              className="mt-2 min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
            />
          </section>
        </main>

        <aside className="rounded-lg border border-border bg-surface p-5 shadow-sm lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-foreground">Booking Summary</h2>
          <div className="mt-5 space-y-4">
            <SummaryItem label="Pricing" value="To be confirmed by backend on booking creation" />
            <SummaryItem label="Current listed price" value={service.data ? formatMoney(service.data.effective_price) : "Loading"} />
          </div>
          <p className="mt-5 flex gap-2 rounded-lg bg-primary-soft p-3 text-sm leading-6 text-primary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Your final amount is calculated securely by Purple Squad before payment.
          </p>
          {submitError ? <p className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p> : null}
          <Button type="submit" className="mt-5 w-full" disabled={!canSubmit} aria-disabled={!canSubmit}>
            {createBooking.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating your booking...
              </>
            ) : (
              "Confirm & Continue to Payment"
            )}
          </Button>
          <p className="mt-3 text-xs leading-5 text-secondary">No payment will be collected in this step.</p>
        </aside>
      </div>
    </form>
  );
}

function ReviewCard({ title, actionHref, actionLabel, children }: { title: string; actionHref: string; actionLabel: string; children: React.ReactNode }) {
  return (
    <article className="rounded-lg border border-border bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{title}</p>
        <Button asChild variant="ghost" size="sm">
          <Link href={actionHref}>
            <PenLine className="mr-1 h-3.5 w-3.5" />
            {actionLabel}
          </Link>
        </Button>
      </div>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
    </div>
  );
}

function BlockedPanel({ title, description, onAction }: { title: string; description: string; onAction: () => void }) {
  return (
    <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
        <div>
          <h2 className="font-semibold text-foreground">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-secondary">{description}</p>
          <Button type="button" variant="outline" size="sm" className="mt-4" onClick={onAction}>
            Select another slot
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatAddressSnapshot(snapshot: ReturnType<typeof getBookingAddressSnapshot>) {
  const parts = [
    snapshot.label,
    snapshot.address_line_1,
    snapshot.address_line_2,
    snapshot.locality,
    snapshot.city,
    snapshot.state,
    snapshot.postal_code,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "Booking address";
}

function formatCreatedSlot(date: string, slot: ReturnType<typeof getBookingTimeSlot>) {
  const start = typeof slot.start_time === "string" ? formatSlotTime(slot.start_time) : "";
  const end = typeof slot.end_time === "string" ? formatSlotTime(slot.end_time) : "";
  return `${formatDisplayDate(date)}${start && end ? `, ${start} - ${end}` : ""}`;
}
