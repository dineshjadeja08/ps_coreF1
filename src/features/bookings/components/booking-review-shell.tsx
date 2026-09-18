"use client";

import { AlertCircle, ArrowLeft, CalendarClock, CheckCircle2, Loader2, Minus, PenLine, Phone, Plus, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/use-cart";
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
import { ServiceImage } from "@/features/catalogue/components/service-image";
import { formatDuration } from "@/features/catalogue/utils";
import { useAvailableSlots } from "@/features/slots/queries";
import { formatSlotTime, isSlotAvailable } from "@/features/slots/utils";

export function BookingReviewShell() {
  const cart = useCart();
  const router = useRouter();
  const searchParams = useSearchParams();
  const serviceSlug = searchParams.get("service") ?? "";
  const addressId = searchParams.get("address") ?? "";
  const selectedDate = searchParams.get("date") ?? "";
  const slotId = searchParams.get("slot") ?? "";

  const [problemDescription, setProblemDescription] = useState("");
  const [customerNotes, setCustomerNotes] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    let active = true;
    try {
      const raw = window.sessionStorage.getItem("purple-squad-booking-notes");
      if (!raw) return;
      const draft = JSON.parse(raw) as { problemDescription?: string; customerNotes?: string };
      queueMicrotask(() => {
        if (!active) return;
        setProblemDescription(draft.problemDescription || "");
        setCustomerNotes(draft.customerNotes || "");
      });
    } catch { /* The review form remains editable if saved draft data is unavailable. */ }
    return () => { active = false; };
  }, []);

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
  const cartItem = cart.items.find((item) => item.slug === serviceSlug);
  const quantity = cartItem?.quantity ?? 1;
  const effectiveUnitPrice = Number(service.data?.effective_price ?? 0);
  const baseUnitPrice = Number(service.data?.base_price ?? effectiveUnitPrice);
  const trainingFee = service.data
    ? Number(service.data.training_fee ?? 0) * (service.data.training_fee_per_unit ? quantity : 1)
    : 0;
  const serviceTotal = effectiveUnitPrice * quantity;
  const originalTotal = baseUnitPrice * quantity;
  const total = serviceTotal + trainingFee;
  const advanceValue = Number(service.data?.advance_payment_value ?? service.data?.advance_amount ?? 0);
  const advance = service.data?.advance_payment_type === "PERCENTAGE"
    ? Math.min(total, total * advanceValue / 100)
    : Math.min(total, advanceValue);
  const remaining = Math.max(0, total - advance);

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
  const canSubmit = Boolean(service.data?.id && selectedAddress?.id && selectedSlot?.id && problemDescription.trim() && !createBooking.isPending && cart.ready && !createdBooking && !blockedReason);

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
      const bookService = cart.items.some((item) => item.slug === serviceSlug) ? cart.checkout : createBooking.mutateAsync;
      const booking = await bookService(
        createBookingPayload({
          serviceId: service.data.id,
          addressId: selectedAddress.id,
          slotId: selectedSlot.id,
          problemDescription,
          customerNotes,
          contactPhone: contactPhone || selectedAddress.phone,
          quantity,
        }),
      );
      window.sessionStorage.removeItem("purple-squad-booking-notes");
      cart.markBooked();
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
        <div className="rounded-md border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
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

      <div className="grid min-w-0 grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <main className="space-y-6">
          <section className="rounded-md border border-border bg-surface p-5 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">Booking Review</p>
            <h1 className="mt-2 text-3xl font-bold text-foreground">Confirm your service visit</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-secondary">
              We re-check your service, address and selected slot before creating the booking.
            </p>
          </section>
          <section className="hidden items-center justify-between gap-5 rounded-md border border-border bg-surface p-5 shadow-sm lg:flex">
            <div><h2 className="text-xl font-bold text-foreground">Confirm & Book Now</h2><p className="mt-1 text-sm text-secondary">Review the payment summary, then securely pay the advance.</p></div>
            <Button type="submit" size="lg" disabled={!canSubmit} className="min-w-52">{createBooking.isPending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating booking...</> : `Pay ${formatMoney(advance)} Now`}</Button>
          </section>

          {loadingDraft ? <div className="h-28 animate-pulse rounded-md bg-muted" /> : null}

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
            <section className="grid gap-4">
              <ReviewCard title="Send booking details to" actionHref={`/account?tab=addresses`} actionLabel="Edit phone">
                <div className="relative"><Phone className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-primary" /><input aria-label="Booking contact phone" inputMode="tel" value={contactPhone || selectedAddress.phone} onChange={(event) => setContactPhone(event.target.value)} className="h-11 w-full rounded-md border border-border bg-background pl-10 pr-3 text-sm font-bold outline-none focus:border-primary" /></div>
                <p className="mt-1 text-sm text-secondary">Confirmation and technician updates will be sent to this number.</p>
              </ReviewCard>
              <ReviewCard title="Service address" actionHref={`/book?service=${encodeURIComponent(serviceSlug)}&date=${encodeURIComponent(selectedDate)}`} actionLabel="Edit">
                <h2 className="text-lg font-bold text-foreground">{selectedAddress.label}</h2>
                <p className="mt-1 text-sm leading-6 text-secondary">
                  {selectedAddress.address_line_1}
                  {selectedAddress.address_line_2 ? `, ${selectedAddress.address_line_2}` : ""}
                  {`, ${selectedAddress.city}, ${selectedAddress.state} ${selectedAddress.postal_code}`}
                </p>
              </ReviewCard>
              <ReviewCard title="Service slot" actionHref={`/book?service=${encodeURIComponent(serviceSlug)}&address=${encodeURIComponent(addressId)}&date=${encodeURIComponent(selectedDate)}`} actionLabel="Edit">
                <h2 className="text-lg font-bold text-foreground">{formatDisplayDate(selectedDate)}</h2>
                <p className="mt-1 flex items-center gap-2 text-sm text-secondary">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  {formatSlotTime(selectedSlot.start_time)} - {formatSlotTime(selectedSlot.end_time)}
                </p>
              </ReviewCard>
            </section>
          ) : null}

          <section className="rounded-md border border-border bg-surface p-5 shadow-sm">
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
              className="mt-2 min-h-28 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
            <label htmlFor="customer-notes" className="mt-4 block text-sm font-semibold text-foreground">
              Notes for technician
            </label>
            <textarea
              id="customer-notes"
              value={customerNotes}
              onChange={(event) => setCustomerNotes(event.target.value)}
              placeholder="Optional instructions."
              className="mt-2 min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-primary focus:ring-3 focus:ring-primary/15"
            />
          </section>
        </main>

        <aside className="rounded-md border border-border bg-surface p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-foreground">Payment summary</h2>
          {service.data ? <div className="mt-5 flex gap-3 border-b border-border pb-5">
            <ServiceImage src={service.data.cover_image} alt={service.data.name} className="h-20 w-20 shrink-0 rounded-md border border-border bg-white" imageClassName="object-cover" />
            <div className="min-w-0 flex-1"><p className="font-bold text-foreground">{service.data.name}</p><p className="mt-1 text-sm text-secondary">{formatDuration(service.data.estimated_duration_minutes)}</p>
              <div className="mt-3 inline-flex items-center rounded-md border border-border">
                <button type="button" className="grid h-8 w-8 place-items-center" aria-label="Decrease quantity" disabled={quantity <= 1 || !cartItem} onClick={() => cartItem && cart.updateQuantity(cartItem.id, quantity - 1)}><Minus className="h-3.5 w-3.5" /></button>
                <span className="min-w-8 text-center text-sm font-bold">{quantity}</span>
                <button type="button" className="grid h-8 w-8 place-items-center" aria-label="Increase quantity" disabled={quantity >= 20 || !cartItem} onClick={() => cartItem && cart.updateQuantity(cartItem.id, quantity + 1)}><Plus className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          </div> : null}
          <dl className="mt-5 space-y-3 text-sm">
            <PriceRow label={`Service price × ${quantity}`} value={formatMoney(serviceTotal)} />
            {originalTotal > serviceTotal ? <PriceRow label="Offer discount" value={`-${formatMoney(originalTotal - serviceTotal)}`} tone="success" /> : null}
            {trainingFee > 0 ? <PriceRow label="Training fee" value={formatMoney(trainingFee)} /> : <PriceRow label="Training fee" value="Waived" tone="success" />}
            <div className="border-t border-border pt-3"><PriceRow label="Total" value={formatMoney(total)} strong /></div>
            <PriceRow label="Pay now (advance)" value={formatMoney(advance)} strong />
            <PriceRow label="Remaining after service" value={formatMoney(remaining)} />
          </dl>
          <div className="mt-5 rounded-md bg-primary-soft p-4 text-sm text-primary"><p className="flex items-center gap-2 font-bold"><Sparkles className="h-4 w-4" />Please note</p><ul className="mt-2 list-disc space-y-1 pl-5 leading-6"><li>The provided cost is an approximate estimate.</li><li>Final estimation will be provided after inspection.</li></ul></div>
          <p className="mt-5 flex gap-2 rounded-md bg-primary-soft p-3 text-sm leading-6 text-primary">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Your final amount is calculated securely by Purple Squad before payment.
          </p>
          {submitError ? <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">{submitError}</p> : null}
          <Button type="submit" className="mt-5 w-full lg:hidden" disabled={!canSubmit} aria-disabled={!canSubmit}>
            {createBooking.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating your booking...
              </>
            ) : (
              `Pay ${formatMoney(advance)} Now`
            )}
          </Button>
          <p className="mt-3 text-xs leading-5 text-secondary">The remaining amount is payable after the service is completed.</p>
        </aside>
      </div>
    </form>
  );
}

function PriceRow({ label, value, strong, tone }: { label: string; value: string; strong?: boolean; tone?: "success" }) {
  return <div className={`flex items-center justify-between gap-4 ${strong ? "text-base font-bold" : ""}`}><dt className="text-secondary">{label}</dt><dd className={tone === "success" ? "font-semibold text-success" : "font-semibold text-foreground"}>{value}</dd></div>;
}

function ReviewCard({ title, actionHref, actionLabel, children }: { title: string; actionHref: string; actionLabel: string; children: React.ReactNode }) {
  return (
    <article className="rounded-md border border-border bg-surface p-5 shadow-sm">
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
    <div className="rounded-md border border-destructive/30 bg-destructive/10 p-5">
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
