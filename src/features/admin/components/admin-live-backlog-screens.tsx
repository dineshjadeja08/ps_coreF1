"use client";

import { Bell, CalendarClock, CreditCard, IndianRupee, Loader2, MessageSquareText, Phone, Search, Users } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";
import type { Lead } from "@/types/api";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

export function AdminLeadsScreen() {
  const [search, setSearch] = useState("");
  const [funnelStatus, setFunnelStatus] = useState("");
  const query = useQuery({
    queryKey: ["admin", "leads", search, funnelStatus],
    queryFn: () => adminApi.listLeads({ page_size: 25, search, funnel_status: funnelStatus, ordering: "-last_activity_at" }),
  });
  const summary = useQuery({ queryKey: ["admin", "leads", "summary"], queryFn: adminApi.getLeadSummary });

  return (
    <>
      <AdminPageHeader title="Leads" description="Service interest, unpaid bookings, phone-call follow-up, and payment-link operations." />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard icon={Users} label="All leads" value={summary.data?.all_leads ?? "-"} />
        <AdminMetricCard icon={Search} label="Visited" value={summary.data?.visited ?? "-"} />
        <AdminMetricCard icon={IndianRupee} label="Unpaid" value={summary.data?.unpaid ?? "-"} />
        <AdminMetricCard icon={CalendarClock} label="Follow-ups due" value={summary.data?.follow_ups_due_today ?? "-"} />
      </div>
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_220px_auto]">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, mobile, lead ID, booking number, service"
            className="border-slate-200"
          />
          <select
            value={funnelStatus}
            onChange={(event) => setFunnelStatus(event.target.value)}
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-600"
          >
            <option value="">All funnel statuses</option>
            <option value="VISITED">Visited</option>
            <option value="CART_ADDED">Cart added</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PAID">Paid</option>
            <option value="BOOKED">Booked</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="LOST">Lost</option>
          </select>
          <Button type="button" variant="outline" onClick={() => { setSearch(""); setFunnelStatus(""); }}>
            Clear filters
          </Button>
        </div>
      </div>
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={String(query.error.message)} onRetry={() => void query.refetch()} /> : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(lead) => lead.id}
          emptyIcon={Users}
          emptyTitle="No leads"
          emptyMessage="Manual and website leads will appear here."
          columns={[
            { key: "id", header: "Lead", render: (lead) => <span className="font-mono text-xs text-slate-600">{lead.id.slice(0, 8)}</span> },
            { key: "name", header: "Customer", render: (lead) => <span className="font-semibold text-slate-950">{lead.customer_name}</span> },
            { key: "mobile", header: "Mobile", render: (lead) => lead.primary_mobile },
            { key: "service", header: "Service", render: (lead) => lead.service_name || "-" },
            { key: "source", header: "Source", render: (lead) => lead.source },
            { key: "funnel", header: "Funnel", render: (lead) => <AdminStatusBadge status={lead.funnel_status || lead.status} /> },
            { key: "payment", header: "Payment", render: (lead) => <AdminStatusBadge status={lead.payment_status} /> },
            { key: "amount", header: "Amount", render: (lead) => money(lead.quoted_amount) },
            { key: "followup", header: "Follow-up", render: (lead) => lead.follow_up_at ? new Date(lead.follow_up_at).toLocaleDateString("en-IN") : "-" },
            { key: "staff", header: "Staff", render: (lead) => lead.assigned_staff_phone || "-" },
            { key: "actions", header: "Actions", render: (lead) => <LeadRowActions lead={lead} onChanged={() => void query.refetch()} /> },
          ]}
        />
      )}
    </>
  );
}

function LeadRowActions({ lead, onChanged }: { lead: Lead; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);

  async function sendPaymentLink() {
    setBusy(true);
    try {
      await adminApi.sendLeadPaymentLink(lead.id, { channel: "SMS" });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  const canSendPaymentLink = lead.payment_status !== "PAID" && Number(lead.advance_amount ?? 0) > 0;

  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="outline" size="sm">
        <Link href={`/admin/leads/${lead.id}`}>View</Link>
      </Button>
      <Button asChild variant="outline" size="icon">
        <a href={`tel:${lead.primary_mobile}`} aria-label={`Call ${lead.primary_mobile}`}>
          <Phone className="h-4 w-4" />
        </a>
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={sendPaymentLink} disabled={!canSendPaymentLink || busy}>
        {busy ? "Sending" : "Pay link"}
      </Button>
    </div>
  );
}

export function AdminCustomersScreen() {
  const query = useQuery({ queryKey: ["admin", "customers"], queryFn: () => adminApi.listCustomers({ page_size: 25 }) });
  return (
    <>
      <AdminPageHeader title="Customers" description="Customer profiles with booking and spend summary." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={String(query.error.message)} onRetry={() => void query.refetch()} /> : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(customer) => customer.id}
          emptyIcon={Users}
          emptyTitle="No customers"
          emptyMessage="Customer accounts will appear here after login or booking."
          columns={[
            { key: "phone", header: "Mobile", render: (customer) => <span className="font-semibold text-slate-950">{customer.phone_number}</span> },
            { key: "name", header: "Name", render: (customer) => [customer.first_name, customer.last_name].filter(Boolean).join(" ") || customer.customer_profile?.display_name || "-" },
            { key: "bookings", header: "Bookings", render: (customer) => customer.total_bookings },
            { key: "spent", header: "Spent", render: (customer) => money(customer.total_amount_spent) },
            { key: "status", header: "Status", render: (customer) => <AdminStatusBadge status={customer.is_active ? "ACTIVE" : "INACTIVE"} /> },
          ]}
        />
      )}
    </>
  );
}

export function AdminLeadDetailScreen({ leadId }: { leadId: string }) {
  const queryClient = useQueryClient();
  const lead = useQuery({ queryKey: ["admin", "lead", leadId], queryFn: () => adminApi.getLead(leadId) });
  const activities = useQuery({ queryKey: ["admin", "lead", leadId, "activities"], queryFn: () => adminApi.listLeadActivities(leadId) });
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [funnelStatus, setFunnelStatus] = useState("");

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "lead", leadId] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "lead", leadId, "activities"] });
    void queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
  };
  const contact = useMutation({
    mutationFn: () => adminApi.recordLeadContact(leadId, { note, next_follow_up_at: followUp || undefined }),
    onSuccess: () => {
      setNote("");
      refresh();
    },
  });
  const save = useMutation({
    mutationFn: () => adminApi.updateLead(leadId, { admin_notes: adminNotes, funnel_status: funnelStatus }),
    onSuccess: refresh,
  });
  const paymentLink = useMutation({
    mutationFn: () => adminApi.sendLeadPaymentLink(leadId, { channel: "SMS" }),
    onSuccess: refresh,
  });

  if (lead.isLoading) return <Loading />;
  if (lead.isError) return <AdminErrorState message={lead.error.message} onRetry={() => void lead.refetch()} />;
  if (!lead.data) return null;

  const item = lead.data;
  const currentAdminNotes = adminNotes || item.admin_notes;
  const currentFunnelStatus = funnelStatus || item.funnel_status;

  return (
    <>
      <AdminPageHeader title={`Lead ${item.id.slice(0, 8)}`} description="Customer interest, payment follow-up, notes, and activity timeline." />
      <div className="grid gap-4 xl:grid-cols-[1fr_360px]">
        <section className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <Detail label="Customer" value={item.customer_name} />
              <Detail label="Mobile" value={item.primary_mobile} />
              <Detail label="Service" value={item.service_name || "-"} />
              <Detail label="Booking" value={item.booking_number || "-"} />
              <Detail label="Source" value={item.source} />
              <Detail label="Payment" value={item.payment_status} />
              <Detail label="Quoted amount" value={money(item.quoted_amount)} />
              <Detail label="Advance" value={money(item.advance_amount)} />
              <Detail label="Address" value={[item.address, item.city, item.pincode].filter(Boolean).join(", ") || "-"} />
              <Detail label="Preferred slot" value={[item.preferred_date, item.preferred_slot].filter(Boolean).join(" ") || "-"} />
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Edit lead</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-[220px_1fr_auto]">
              <select
                value={currentFunnelStatus}
                onChange={(event) => setFunnelStatus(event.target.value)}
                className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-600"
              >
                {["VISITED", "CART_ADDED", "UNPAID", "PAID", "BOOKED", "CANCELLED", "LOST"].map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
              <Input value={currentAdminNotes} onChange={(event) => setAdminNotes(event.target.value)} placeholder="Admin notes" />
              <Button type="button" onClick={() => save.mutate()} disabled={save.isPending}>
                {save.isPending ? "Saving" : "Save"}
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Activity timeline</h2>
            {activities.isLoading ? <Loading /> : null}
            <div className="mt-4 space-y-3">
              {(activities.data ?? item.activities ?? []).map((activity) => (
                <div key={activity.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-sm font-bold text-slate-950">{activity.action}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    {new Date(activity.created_at).toLocaleString("en-IN")}
                    {activity.performed_by_phone ? ` by ${activity.performed_by_phone}` : ""}
                  </p>
                  {activity.note ? <p className="mt-2 text-sm text-slate-700">{activity.note}</p> : null}
                </div>
              ))}
              {!activities.isLoading && (activities.data ?? item.activities ?? []).length === 0 ? (
                <p className="text-sm text-slate-500">No activity recorded yet.</p>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-base font-bold text-slate-950">
              <MessageSquareText className="h-4 w-4 text-violet-700" />
              Follow up
            </h2>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Write call note"
              className="mt-3 min-h-28 w-full rounded-md border border-slate-200 p-3 text-sm outline-none focus:border-violet-600"
            />
            <Input
              type="datetime-local"
              value={followUp}
              onChange={(event) => setFollowUp(event.target.value)}
              className="mt-3 border-slate-200"
            />
            <Button type="button" className="mt-3 w-full" onClick={() => contact.mutate()} disabled={!note.trim() || contact.isPending}>
              {contact.isPending ? "Recording" : "Record contact"}
            </Button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Payment link</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Sends the existing booking payment URL through the configured notification provider. This does not mark payment as paid.
            </p>
            {item.payment_link_url ? (
              <a href={item.payment_link_url} target="_blank" className="mt-3 block break-all text-sm font-semibold text-violet-700" rel="noreferrer">
                {item.payment_link_url}
              </a>
            ) : null}
            <Button
              type="button"
              className="mt-3 w-full"
              onClick={() => paymentLink.mutate()}
              disabled={paymentLink.isPending || item.payment_status === "PAID" || Number(item.advance_amount ?? 0) <= 0}
            >
              {paymentLink.isPending ? "Sending" : "Send payment link"}
            </Button>
          </div>
        </aside>
      </div>
    </>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value}</p>
    </div>
  );
}

export function AdminPaymentsScreen() {
  const query = useQuery({ queryKey: ["admin", "payments"], queryFn: () => adminApi.listPayments({ page_size: 25 }) });
  return (
    <>
      <AdminPageHeader title="Payments" description="Payment records and provider status." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={String(query.error.message)} onRetry={() => void query.refetch()} /> : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(payment) => payment.id}
          emptyIcon={CreditCard}
          emptyTitle="No payments"
          emptyMessage="Payment records will appear here after orders or collections."
          columns={[
            { key: "booking", header: "Booking", render: (payment) => <span className="font-semibold text-slate-950">{payment.booking_number}</span> },
            { key: "type", header: "Type", render: (payment) => payment.payment_type },
            { key: "amount", header: "Amount", render: (payment) => money(payment.amount) },
            { key: "provider", header: "Provider", render: (payment) => payment.provider },
            { key: "status", header: "Status", render: (payment) => <AdminStatusBadge status={payment.status} /> },
          ]}
        />
      )}
    </>
  );
}

export function AdminNotificationsScreen() {
  const query = useQuery({ queryKey: ["admin", "notifications"], queryFn: () => adminApi.listNotifications({ page_size: 25 }) });
  return (
    <>
      <AdminPageHeader title="Notifications" description="Delivery events, statuses, and retry controls." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={String(query.error.message)} onRetry={() => void query.refetch()} /> : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(notification) => notification.id}
          emptyIcon={Bell}
          emptyTitle="No notifications"
          emptyMessage="Booking and payment notifications will appear here."
          columns={[
            { key: "title", header: "Title", render: (notification) => <span className="font-semibold text-slate-950">{notification.title}</span> },
            { key: "event", header: "Event", render: (notification) => notification.event },
            { key: "channel", header: "Channel", render: (notification) => notification.channel },
            { key: "attempts", header: "Attempts", render: (notification) => notification.send_attempts },
            { key: "status", header: "Status", render: (notification) => <AdminStatusBadge status={notification.status} /> },
            {
              key: "actions",
              header: "Actions",
              render: (notification) => (
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => void adminApi.retryNotification(notification.id).then(() => query.refetch())} disabled={notification.status !== "FAILED"}>
                    Retry
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void adminApi.cancelNotification(notification.id, "Cancelled from portal").then(() => query.refetch())} disabled={notification.status !== "QUEUED"}>
                    Cancel
                  </Button>
                </div>
              ),
            },
          ]}
        />
      )}
    </>
  );
}

function Loading() {
  return (
    <div className="grid min-h-64 place-items-center">
      <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
    </div>
  );
}
