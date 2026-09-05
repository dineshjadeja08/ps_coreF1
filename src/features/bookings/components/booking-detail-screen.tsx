"use client";

import { ArrowLeft, CalendarClock, CheckCircle2, Loader2, MapPin } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { BookingActionsPanel } from "@/features/bookings/components/booking-actions-panel";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import { useBooking } from "@/features/bookings/queries";
import {
  formatDisplayDateTime,
  formatMoney,
  getBookingAddressLine,
  getBookingSchedule,
  getBookingServiceName,
  getBookingStatusLabel,
  getBookingTimeline,
} from "@/features/bookings/utils";
import { getBookingPayability } from "@/features/payments/utils";
import { BookingReviewForm } from "@/features/reviews/components/booking-review-form";
import { canReviewBooking } from "@/features/reviews/utils";

export function BookingDetailScreen({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId);

  if (booking.isLoading) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading booking...
        </p>
      </section>
    );
  }

  if (booking.isError) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState title="We could not load this booking" error={booking.error} onRetry={() => booking.refetch()} />
      </section>
    );
  }

  if (!booking.data) return null;

  const item = booking.data;
  const timeline = getBookingTimeline(item);
  const payability = getBookingPayability(item);

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Button asChild variant="ghost" className="mb-5">
        <Link href={routes.bookings}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to bookings
        </Link>
      </Button>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <main className="space-y-6">
          <section className="rounded-md border border-border bg-surface p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-primary">Booking {item.booking_number}</p>
                <h1 className="mt-2 text-3xl font-bold text-foreground">{getBookingServiceName(item)}</h1>
                <p className="mt-2 flex items-center gap-2 text-sm text-secondary">
                  <CalendarClock className="h-4 w-4 text-primary" />
                  {getBookingSchedule(item)}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <StatusBadge type="booking" status={item.booking_status} />
                <StatusBadge type="payment" status={item.payment_status} />
              </div>
            </div>
          </section>

          <section className="rounded-md border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Visit details</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <Panel label="Address" value={getBookingAddressLine(item)} icon={<MapPin className="h-4 w-4 text-primary" />} />
              <Panel label="Problem description" value={item.problem_description || "Not provided"} />
              <Panel label="Customer notes" value={item.customer_notes || "No notes"} />
              <Panel label="Created" value={formatDisplayDateTime(item.created_at)} />
            </div>
          </section>

          <section className="rounded-md border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-xl font-bold text-foreground">Status timeline</h2>
            {timeline.length ? (
              <ol className="mt-5 space-y-4">
                {timeline.map((entry) => (
                  <li key={entry.id} className="flex gap-3">
                    <span className="mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-sm bg-primary-soft text-primary">
                      <CheckCircle2 className="h-4 w-4" />
                    </span>
                    <div>
                      <p className="font-semibold text-foreground">{getBookingStatusLabel(entry.to_status)}</p>
                      <p className="mt-1 text-sm text-secondary">{formatDisplayDateTime(entry.created_at)}</p>
                      {entry.notes ? <p className="mt-1 text-sm leading-6 text-secondary">{entry.notes}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-secondary">No status history is available yet.</p>
            )}
          </section>
        </main>

        <aside className="rounded-md border border-border bg-surface p-5 shadow-[var(--shadow-card)] lg:sticky lg:top-28">
          <h2 className="text-xl font-bold text-foreground">Payment summary</h2>
          <dl className="mt-5 space-y-4">
            <SummaryItem label="Total" value={formatMoney(item.total_amount)} />
            <SummaryItem label="Advance required" value={formatMoney(item.advance_required)} />
            <SummaryItem label="Advance paid" value={formatMoney(item.advance_paid)} />
            <SummaryItem label="Balance due" value={formatMoney(item.balance_due)} />
            <SummaryItem label="Balance collected" value={formatMoney(item.balance_collected)} />
          </dl>

          {payability.canPay ? (
            <Button asChild className="mt-6 w-full">
              <Link href={routes.bookingPayment(item.id)}>Complete payment</Link>
            </Button>
          ) : null}

          {payability.alreadyPaid ? (
            <Button asChild className="mt-6 w-full" variant="secondary">
              <Link href={routes.bookingSuccess(item.id)}>View confirmation</Link>
            </Button>
          ) : null}
        </aside>
      </div>

      <div className="mt-8 max-w-3xl">
        <BookingActionsPanel booking={item} />
      </div>

      {canReviewBooking(item) ? (
        <div className="mt-8 max-w-3xl">
          <BookingReviewForm bookingId={item.id} />
        </div>
      ) : null}
    </section>
  );
}

function Panel({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-secondary">
        {icon}
        {label}
      </p>
      <p className="mt-2 text-sm font-semibold leading-6 text-foreground">{value}</p>
    </div>
  );
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-3 last:border-0 last:pb-0">
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className="text-sm font-bold text-foreground">{value}</dd>
    </div>
  );
}
