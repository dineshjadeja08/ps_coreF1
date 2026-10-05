"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useQuery } from "@tanstack/react-query";
import { Download, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { AdminBookingOperations } from "@/features/admin/components/admin-booking-operations";
import { downloadAuthenticatedFile } from "@/lib/api/client";
import { adminApi, apiPaths } from "@/lib/api/endpoints";

function value(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value) : "";
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="min-w-0 rounded-lg bg-slate-50 p-3"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm text-slate-950">{children || "—"}</dd></div>;
}

export function AdminBookingDrawer({ bookingId, onClose }: { bookingId: string; onClose: () => void }) {
  const [tab, setTab] = useState("overview");
  const [invoiceError, setInvoiceError] = useState("");
  const [downloading, setDownloading] = useState(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const booking = useQuery({ queryKey: ["admin", "bookings", "detail", bookingId], queryFn: () => adminApi.getBooking(bookingId), refetchInterval: 15_000 });
  const activities = useQuery({ queryKey: ["admin", "bookings", "activities", bookingId], queryFn: () => adminApi.listBookingActivities(bookingId), enabled: tab === "activity", refetchInterval: 15_000 });
  const data = booking.data;
  const address = data?.address_snapshot && typeof data.address_snapshot === "object" ? data.address_snapshot as Record<string, unknown> : {};
  const formattedAddress = value(address.formatted_address) || ["address_line_1", "address_line_2", "area", "city", "state", "postal_code"].map((key) => value(address[key])).filter(Boolean).join(", ");
  async function downloadInvoice() {
    if (!data) return;
    setInvoiceError(""); setDownloading(true);
    try { await downloadAuthenticatedFile(apiPaths.adminBookingInvoice(bookingId), `invoice-${data.booking_number}.pdf`); }
    catch (error) { setInvoiceError(error instanceof Error ? error.message : "Could not download invoice."); }
    finally { setDownloading(false); }
  }
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40" />
        <Dialog.Content onOpenAutoFocus={() => { returnFocus.current = document.activeElement instanceof HTMLElement ? document.activeElement : null; }} onCloseAutoFocus={(event) => { event.preventDefault(); returnFocus.current?.focus(); }} className="fixed inset-y-0 right-0 z-50 flex w-full max-w-2xl flex-col bg-white shadow-2xl focus:outline-none">
          <div className="shrink-0 border-b border-slate-200 p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3"><div className="min-w-0"><Dialog.Title className="break-words text-xl font-bold">{data?.booking_number || "Booking details"}</Dialog.Title><Dialog.Description className="mt-1 text-sm text-slate-500">Customer details, management actions, and recent activity.</Dialog.Description></div><Dialog.Close className="grid h-10 w-10 shrink-0 place-items-center rounded-lg hover:bg-slate-100" aria-label="Close booking details"><X className="h-5 w-5" /></Dialog.Close></div>
            <div role="tablist" aria-label="Booking sections" className="mt-4 flex gap-2" onKeyDown={(event) => {
              const tabs = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[role=tab]"));
              const index = tabs.indexOf(document.activeElement as HTMLButtonElement);
              const next = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
              if (next >= 0) { event.preventDefault(); tabs[next].focus(); tabs[next].click(); }
            }}>{["overview", "manage", "activity"].map((name) => <button type="button" key={name} role="tab" tabIndex={tab === name ? 0 : -1} id={`booking-tab-${name}`} aria-selected={tab === name} aria-controls={`booking-panel-${name}`} onClick={() => setTab(name)} className={`rounded-lg px-3 py-2 text-sm font-semibold capitalize ${tab === name ? "bg-violet-100 text-violet-800" : "text-slate-600 hover:bg-slate-50"}`}>{name}</button>)}</div>
            {booking.isRefetchError ? <p role="status" className="mt-2 text-xs text-amber-700">Update failed. Showing the last loaded booking.</p> : null}
          </div>
          <div role="tabpanel" id={`booking-panel-${tab}`} aria-labelledby={`booking-tab-${tab}`} className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
            {booking.isLoading ? <Loader2 className="mx-auto h-6 w-6 animate-spin" /> : !data ? <AdminErrorState message={booking.error?.message || "Booking unavailable."} onRetry={() => void booking.refetch()} /> : tab === "overview" ? (
              <>
                <div className="mb-4 flex flex-wrap gap-2"><AdminStatusBadge status={data.booking_status} /><AdminStatusBadge status={data.payment_status} /></div>
                <dl className="grid gap-3 sm:grid-cols-2">
                  <Detail label="Customer">{data.customer_name}</Detail><Detail label="Phone">{data.customer_phone ? <a className="text-violet-700" href={`tel:${data.customer_phone}`}>{data.customer_phone}</a> : null}</Detail>
                  <Detail label="Service">{value(data.service.name)}</Detail><Detail label="Scheduled">{data.service_date} · {value(data.time_slot.start_time)}–{value(data.time_slot.end_time)}</Detail>
                  <Detail label="Address">{formattedAddress}</Detail><Detail label="Technician">{data.assigned_technician?.name || "Unassigned"}</Detail>
                  <Detail label="Total">₹{data.total_amount}</Detail><Detail label="Balance due">₹{data.balance_due}</Detail>
                  <Detail label="Problem">{data.problem_description}</Detail><Detail label="Customer notes">{data.customer_notes}</Detail>
                  <Detail label="Admin notes">{data.admin_notes}</Detail>
                </dl>
                {data.payment_status === "PAID" || data.booking_status === "COMPLETED" ? <Button type="button" variant="outline" className="mt-4" disabled={downloading} onClick={() => void downloadInvoice()}><Download className="h-4 w-4" />{downloading ? "Downloading…" : "Download invoice"}</Button> : null}
                {invoiceError ? <p role="alert" className="mt-2 text-sm text-red-600">{invoiceError}</p> : null}
              </>
            ) : tab === "manage" ? <AdminBookingOperations booking={data} showHistory={false} /> : (
              <>
                <p className="mb-4 text-xs text-slate-500">Latest 100 recorded events, newest first.</p>
                {activities.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : activities.isError && !activities.data ? <AdminErrorState message={activities.error.message} onRetry={() => void activities.refetch()} /> : <ol className="space-y-4 border-l-2 border-violet-100 pl-4">{activities.data?.map((event) => <li key={event.id} className="relative rounded-lg border border-slate-200 p-3"><span className="absolute -left-[23px] top-4 h-3 w-3 rounded-full bg-violet-600" /><p className="text-sm font-semibold">{event.title}</p>{event.description ? <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-600">{event.description}</p> : null}<p className="mt-2 text-xs text-slate-500">{event.actor} · {new Date(event.created_at).toLocaleString("en-IN")}</p></li>)}</ol>}
                {activities.isRefetchError ? <p className="mt-3 text-xs text-amber-700">Activity refresh failed. Showing the last loaded events.</p> : null}
              </>
            )}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
