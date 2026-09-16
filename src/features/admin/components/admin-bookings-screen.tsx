"use client";

import { CalendarCheck, Check, Copy, Download, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { routes } from "@/constants/routes";
import { adminApi } from "@/lib/api/endpoints";
import { apiPaths } from "@/lib/api/endpoints";
import { downloadAuthenticatedFile } from "@/lib/api/client";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

export function AdminBookingsScreen() {
  const [copiedBookingId, setCopiedBookingId] = useState("");
  const query = useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: () => adminApi.listBookings({ page_size: 25 }),
  });

  async function copyPaymentLink(booking: Booking) {
    const paymentUrl = new URL(routes.bookingPayment(booking.id), env.appUrl).toString();
    await navigator.clipboard.writeText(paymentUrl);
    setCopiedBookingId(booking.id);
    window.setTimeout(() => setCopiedBookingId((current) => (current === booking.id ? "" : current)), 2500);
  }

  return (
    <>
      <AdminPageHeader title="Bookings" description="See who booked, their contact number, service, payment, and operational status." />
      {query.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
        </div>
      ) : query.isError ? (
        <AdminErrorState message={query.error instanceof Error ? query.error.message : "Bookings unavailable."} onRetry={() => void query.refetch()} />
      ) : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(booking) => booking.id}
          emptyIcon={CalendarCheck}
          emptyTitle="No bookings found"
          emptyMessage="Customer bookings will appear here."
          columns={[
            { key: "booking", header: "Booking", render: (booking) => <span className="font-semibold text-slate-950">{booking.booking_number}</span> },
            {
              key: "customer",
              header: "Customer",
              render: (booking) => (
                <div className="grid gap-0.5">
                  <span className="font-semibold text-slate-950">{booking.customer_name || "Customer"}</span>
                  {booking.customer_phone ? (
                    <a className="text-xs font-semibold text-violet-700 hover:underline" href={`tel:${booking.customer_phone}`}>
                      {booking.customer_phone}
                    </a>
                  ) : (
                    <span className="text-xs text-slate-500">No phone available</span>
                  )}
                </div>
              ),
            },
            { key: "service", header: "Service", render: serviceName },
            { key: "date", header: "Date", render: (booking) => booking.service_date },
            { key: "booking_status", header: "Booking status", render: (booking) => <AdminStatusBadge status={booking.booking_status} /> },
            { key: "payment_status", header: "Payment", render: (booking) => <AdminStatusBadge status={booking.payment_status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (booking) => {
                const canSharePaymentLink = booking.booking_status === "PENDING_PAYMENT" && booking.payment_status === "UNPAID";
                const canDownloadInvoice = booking.payment_status === "PAID" || booking.booking_status === "COMPLETED";
                return (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={!canSharePaymentLink}
                      onClick={() => void copyPaymentLink(booking)}
                    >
                      {copiedBookingId === booking.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copiedBookingId === booking.id ? "Copied" : "Copy pay link"}
                    </Button>
                    {canDownloadInvoice ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => void downloadAuthenticatedFile(apiPaths.adminBookingInvoice(booking.id), `invoice-${booking.booking_number}.pdf`)}
                      >
                        <Download className="h-4 w-4" />
                        Invoice
                      </Button>
                    ) : null}
                  </div>
                );
              },
            },
          ]}
        />
      )}
    </>
  );
}
