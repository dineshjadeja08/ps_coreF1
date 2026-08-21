"use client";

import { CalendarClock, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { StatusBadge } from "@/features/bookings/components/status-badge";
import { useBookings } from "@/features/bookings/queries";
import { formatMoney, getBookingAddressLine, getBookingSchedule, getBookingServiceName } from "@/features/bookings/utils";

export function BookingsListScreen() {
  const bookings = useBookings({ page_size: 20 });
  const items = bookings.data?.results ?? [];

  if (bookings.isLoading) {
    return (
      <section className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-secondary">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          Loading bookings...
        </p>
      </section>
    );
  }

  if (bookings.isError) {
    return (
      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <ErrorState title="We could not load your bookings" error={bookings.error} onRetry={() => bookings.refetch()} />
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Bookings</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">My bookings</h1>
          <p className="mt-2 text-sm leading-6 text-secondary">Track service visits, payment state, and booking progress from the backend record.</p>
        </div>
        <Button asChild>
          <Link href={routes.services}>Book a service</Link>
        </Button>
      </div>

      {!items.length ? (
        <div className="mt-8">
          <EmptyState title="No bookings yet" description="Choose a service and create your first Purple Squad booking." actionLabel="Browse services" actionHref={routes.services} />
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {items.map((booking) => (
            <Link
              key={booking.id}
              href={routes.bookingDetail(booking.id)}
              className="rounded-lg border border-border bg-surface p-5 transition hover:border-primary/40 hover:bg-muted/40"
            >
              <article className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-bold text-foreground">{getBookingServiceName(booking)}</h2>
                    <span className="text-sm font-semibold text-secondary">{booking.booking_number}</span>
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-sm text-secondary">
                    <CalendarClock className="h-4 w-4 text-primary" />
                    {getBookingSchedule(booking)}
                  </p>
                  <p className="mt-1 line-clamp-1 text-sm text-secondary">{getBookingAddressLine(booking)}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <StatusBadge type="booking" status={booking.booking_status} />
                    <StatusBadge type="payment" status={booking.payment_status} />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 lg:min-w-52">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-secondary">Total</p>
                    <p className="mt-1 text-lg font-bold text-foreground">{formatMoney(booking.total_amount)}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-secondary" />
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
