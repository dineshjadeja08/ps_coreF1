"use client";

import { ArrowLeft, CalendarClock, CheckCircle2, Download, Loader2, MapPin } from "lucide-react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { BookingActionsPanel } from "@/features/bookings/components/booking-actions-panel";
import { JobProgressTracker } from "@/features/bookings/components/job-progress-tracker";
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
import { apiPaths, bookingApi } from "@/lib/api/endpoints";
import { downloadAuthenticatedFile } from "@/lib/api/client";

export function BookingDetailScreen({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId);
  const startOtp = useQuery({
    queryKey: ["bookings", bookingId, "start-otp"],
    queryFn: () => bookingApi.getStartOtp(bookingId),
    enabled: Boolean(booking.data?.technician || booking.data?.assigned_technician),
    refetchInterval: (query) => query.state.data?.verified || booking.data?.start_otp_verified ? false : 30_000,
  });

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

  if (booking.isError && !booking.data) {
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
      <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-secondary">
        <span>{booking.dataUpdatedAt ? `Last checked: ${formatDisplayDateTime(new Date(booking.dataUpdatedAt).toISOString())}` : "Checking updates…"} · Active bookings refresh every 15 seconds.</span>
        <Button type="button" variant="outline" size="sm" disabled={booking.isFetching} onClick={() => void booking.refetch()}>{booking.isFetching ? "Refreshing…" : "Refresh"}</Button>
        {booking.isError ? <p role="alert" className="text-red-600">Could not refresh. Showing the last received status; please retry.</p> : null}
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <main className="space-y-6">
          {item.technician || item.assigned_technician ? <section className="grid gap-4 sm:grid-cols-2">
            {item.technician ? <article className="rounded-md border border-border bg-surface p-5 shadow-sm"><h2 className="text-sm font-bold uppercase tracking-wide text-secondary">Your technician</h2><div className="mt-4 flex items-center gap-4"><div className="relative grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-primary-soft text-lg font-bold text-primary">{item.technician.photo_url ? <Image src={item.technician.photo_url} alt={item.technician.name} fill unoptimized sizes="64px" className="object-cover" /> : item.technician.name.slice(0, 1).toUpperCase()}</div><div className="min-w-0"><p className="font-bold text-foreground">{item.technician.name}</p><p className="mt-1 text-sm text-secondary">★ {item.technician.average_rating ?? "New"} rating · {item.technician.completed_job_count} completed jobs</p><p className="mt-1 text-xs text-secondary">{item.technician.is_verified ? "Verified Purple Squad professional" : "Purple Squad professional"}</p></div></div><a href={`tel:${item.technician.phone}`} className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-md bg-primary px-4 text-sm font-bold text-white hover:opacity-90">Call technician</a></article> : item.assigned_technician ? <article className="rounded-md border border-border bg-surface p-5"><h2 className="font-bold">Your technician</h2><p className="mt-2 font-semibold">{item.assigned_technician.name}</p><a className="mt-2 inline-flex text-sm font-bold text-primary" href={`tel:${item.assigned_technician.phone}`}>Call technician</a></article> : null}
            <article className="rounded-md border border-violet-200 bg-violet-50 p-5"><h2 className="font-bold text-violet-950">Service start OTP</h2><p className="mt-1 text-sm text-violet-800">Share this code with your technician only when they are ready to begin the service.</p>{item.start_otp_verified || startOtp.data?.verified ? <p className="mt-4 rounded-lg bg-white p-3 text-sm font-bold text-emerald-700">OTP verified · Service start confirmed</p> : startOtp.isLoading ? <p className="mt-4 text-sm text-violet-700">Loading your secure OTP…</p> : startOtp.data?.otp ? <p className="mt-4 rounded-lg bg-white px-4 py-3 text-center font-mono text-3xl font-extrabold tracking-[0.35em] text-violet-900">{startOtp.data.otp}</p> : <p className="mt-4 text-sm text-violet-700">Your OTP will appear here when it is available.</p>}</article>
          </section> : null}
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

          <JobProgressTracker booking={item} />

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

          {item.payment_status === "PAID" || item.booking_status === "COMPLETED" ? (
            <Button
              type="button"
              className="mt-3 w-full"
              variant="outline"
              onClick={() => void downloadAuthenticatedFile(apiPaths.bookingInvoice(item.id), `invoice-${item.booking_number}.pdf`)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download invoice
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
