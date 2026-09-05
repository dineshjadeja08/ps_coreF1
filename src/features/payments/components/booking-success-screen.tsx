"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";

import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import { useBooking } from "@/features/bookings/queries";
import { buildPaymentSummary, getBookingPayability } from "@/features/payments/utils";

export function BookingSuccessScreen({ bookingId }: { bookingId: string }) {
  const booking = useBooking(bookingId);

  if (booking.isLoading) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-4xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading booking...
        </p>
      </section>
    );
  }

  if (booking.isError) {
    return (
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState title="We could not load this booking" error={booking.error} onRetry={() => booking.refetch()} />
      </section>
    );
  }

  if (!booking.data) return null;

  const summary = buildPaymentSummary(booking.data);
  const payability = getBookingPayability(booking.data);

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-md border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        <CheckCircle2 className={payability.alreadyPaid ? "h-12 w-12 text-success" : "h-12 w-12 text-primary"} />
        <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-primary">Booking status</p>
        <h1 className="mt-2 text-3xl font-bold text-foreground">{payability.alreadyPaid ? "Booking Confirmed" : "Booking Payment Pending"}</h1>
        <p className="mt-2 text-secondary">
          {payability.alreadyPaid
            ? `Your ${summary.serviceName} service is booked.`
            : "Your booking is still waiting for advance payment confirmation."}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Panel label="Booking ID" value={summary.bookingReference} />
          <Panel label="Service" value={summary.serviceName} />
          <Panel label="Date & Time" value={summary.schedule} />
          <Panel label="Address" value={summary.address} />
          <Panel label="Advance Paid" value={summary.advancePaid} />
          <Panel label="Balance Due" value={summary.balanceDue} />
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <StatusBadge type="booking" status={summary.bookingStatus} />
          <StatusBadge type="payment" status={summary.paymentStatus} />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {!payability.alreadyPaid ? (
            <Button asChild>
              <Link href={routes.bookingPayment(booking.data.id)}>Complete Payment</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline">
            <Link href={routes.bookingDetail(booking.data.id)}>View Booking</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href={routes.home}>Back to Home</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Panel({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-background p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-secondary">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
