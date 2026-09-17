"use client";

import { Bell, CalendarClock, CreditCard, IndianRupee, Loader2, MessageSquareText, Phone, Plus, Search, Users } from "lucide-react";
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
import type { Lead, Payment } from "@/types/api";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

export function AdminLeadsScreen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", funnel_status: "", payment_status: "", source: "", assigned_to: "", service: "", created_from: "", created_to: "", follow_up_date: "", ordering: "-last_activity_at" });
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState({ customer_name: "", primary_mobile: "", required_service: "", source: "MANUAL", quoted_amount: "", advance_amount: "", city: "", pincode: "" });
  const services = useQuery({ queryKey: ["admin", "services", "lead-options"], queryFn: () => adminApi.listServices({ page_size: 100 }) });
  const staff = useQuery({ queryKey: ["admin", "staff", "lead-options"], queryFn: () => adminApi.listStaff({ page_size: 100 }) });
  const query = useQuery({
    queryKey: ["admin", "leads", search, filters],
    queryFn: () => adminApi.listLeads({
      page_size: 25,
      search: search || undefined,
      status: filters.status || undefined,
      funnel_status: filters.funnel_status || undefined,
      payment_status: filters.payment_status || undefined,
      source: filters.source || undefined,
      assigned_to: filters.assigned_to || undefined,
      service: filters.service || undefined,
      created_from: filters.created_from || undefined,
      created_to: filters.created_to || undefined,
      follow_up_date: filters.follow_up_date || undefined,
      ordering: filters.ordering,
    }),
  });
  const summary = useQuery({ queryKey: ["admin", "leads", "summary"], queryFn: adminApi.getLeadSummary });
  const create = useMutation({
    mutationFn: () => adminApi.createLead({
      customer_name: createForm.customer_name,
      primary_mobile: createForm.primary_mobile,
      required_service: createForm.required_service || null,
      source: createForm.source,
      status: "NEW",
      funnel_status: "VISITED",
      payment_status: "NOT_REQUIRED",
      quoted_amount: createForm.quoted_amount || null,
      advance_amount: createForm.advance_amount || null,
      city: createForm.city,
      pincode: createForm.pincode,
    }),
    onSuccess: async () => {
      setShowCreate(false);
      setCreateForm({ customer_name: "", primary_mobile: "", required_service: "", source: "MANUAL", quoted_amount: "", advance_amount: "", city: "", pincode: "" });
      await queryClient.invalidateQueries({ queryKey: ["admin", "leads"] });
    },
  });
  const clearFilters = () => {
    setSearch("");
    setFilters({ status: "", funnel_status: "", payment_status: "", source: "", assigned_to: "", service: "", created_from: "", created_to: "", follow_up_date: "", ordering: "-last_activity_at" });
  };

  return (
    <>
      <AdminPageHeader title="Leads" description="Service interest, unpaid bookings, phone-call follow-up, and payment-link operations." action={<Button type="button" onClick={() => setShowCreate((value) => !value)}><Plus className="h-4 w-4" />Create lead</Button>} />
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <AdminMetricCard icon={Users} label="All leads" value={summary.data?.all_leads ?? "-"} />
        <AdminMetricCard icon={Search} label="Visited" value={summary.data?.visited ?? "-"} />
        <AdminMetricCard icon={Users} label="Cart added" value={summary.data?.cart_added ?? "-"} />
        <AdminMetricCard icon={IndianRupee} label="Unpaid" value={summary.data?.unpaid ?? "-"} />
        <AdminMetricCard icon={IndianRupee} label="Paid" value={summary.data?.paid ?? "-"} />
        <AdminMetricCard icon={Users} label="Booked" value={summary.data?.booked ?? "-"} />
        <AdminMetricCard icon={CalendarClock} label="Follow-ups due" value={summary.data?.follow_ups_due_today ?? "-"} />
      </div>
      {showCreate ? (
        <section className="mt-4 rounded-lg border border-violet-200 bg-white p-5 shadow-sm">
          <h2 className="font-bold text-slate-950">Create manual lead</h2>
          <form className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}>
            <Input value={createForm.customer_name} onChange={(event) => setCreateForm({ ...createForm, customer_name: event.target.value })} placeholder="Customer name" required />
            <Input value={createForm.primary_mobile} onChange={(event) => setCreateForm({ ...createForm, primary_mobile: event.target.value })} placeholder="Mobile number" required />
            <select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={createForm.required_service} onChange={(event) => setCreateForm({ ...createForm, required_service: event.target.value })}><option value="">No service selected</option>{services.data?.results.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
            <select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={createForm.source} onChange={(event) => setCreateForm({ ...createForm, source: event.target.value })}>{["MANUAL", "PHONE", "WHATSAPP", "WEBSITE", "CALLBACK_REQUEST", "CAMPAIGN", "OTHER"].map((source) => <option key={source}>{source}</option>)}</select>
            <Input inputMode="decimal" value={createForm.quoted_amount} onChange={(event) => setCreateForm({ ...createForm, quoted_amount: event.target.value })} placeholder="Quoted amount" />
            <Input inputMode="decimal" value={createForm.advance_amount} onChange={(event) => setCreateForm({ ...createForm, advance_amount: event.target.value })} placeholder="Advance amount" />
            <Input value={createForm.city} onChange={(event) => setCreateForm({ ...createForm, city: event.target.value })} placeholder="City" />
            <Input value={createForm.pincode} onChange={(event) => setCreateForm({ ...createForm, pincode: event.target.value })} placeholder="Pincode" />
            <div className="flex gap-2 xl:col-span-4"><Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating" : "Create lead"}</Button><Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button></div>
            {create.isError ? <p className="text-sm text-red-600 xl:col-span-4">{create.error.message}</p> : null}
          </form>
        </section>
      ) : null}
      <div className="mt-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search name, mobile, lead ID, booking number, service"
            className="border-slate-200"
          />
          <select
            value={filters.status}
            onChange={(event) => setFilters({ ...filters, status: event.target.value })}
            className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-violet-600"
          >
            <option value="">All lead statuses</option>{["NEW", "CONTACTED", "QUALIFIED", "CONVERTED", "LOST", "CLOSED"].map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={filters.funnel_status} onChange={(event) => setFilters({ ...filters, funnel_status: event.target.value })} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700">
            <option value="">All funnel statuses</option>
            {["VISITED", "CART_ADDED", "UNPAID", "PAID", "BOOKED", "CANCELLED", "LOST"].map((value) => <option key={value}>{value}</option>)}
          </select>
          <select value={filters.payment_status} onChange={(event) => setFilters({ ...filters, payment_status: event.target.value })} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">All payment states</option>{["NOT_REQUIRED", "PENDING", "LINK_SENT", "FAILED", "PAID", "REFUNDED"].map((value) => <option key={value}>{value}</option>)}</select>
          <select value={filters.source} onChange={(event) => setFilters({ ...filters, source: event.target.value })} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">All sources</option>{["SERVICE_VIEW", "CART", "CHECKOUT", "ADMIN", "PHONE", "WHATSAPP", "WEBSITE", "CALLBACK_REQUEST", "CAMPAIGN", "MANUAL", "OTHER"].map((value) => <option key={value}>{value}</option>)}</select>
          <select value={filters.assigned_to} onChange={(event) => setFilters({ ...filters, assigned_to: event.target.value })} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">All staff</option>{staff.data?.results.map((user) => <option key={user.id} value={user.id}>{user.phone_number}</option>)}</select>
          <select value={filters.service} onChange={(event) => setFilters({ ...filters, service: event.target.value })} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="">All services</option>{services.data?.results.map((service) => <option key={service.id} value={service.id}>{service.name}</option>)}</select>
          <Input type="date" value={filters.created_from} onChange={(event) => setFilters({ ...filters, created_from: event.target.value })} aria-label="Created from" />
          <Input type="date" value={filters.created_to} onChange={(event) => setFilters({ ...filters, created_to: event.target.value })} aria-label="Created to" />
          <Input type="date" value={filters.follow_up_date} onChange={(event) => setFilters({ ...filters, follow_up_date: event.target.value })} aria-label="Follow-up date" />
          <select value={filters.ordering} onChange={(event) => setFilters({ ...filters, ordering: event.target.value })} className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm"><option value="-last_activity_at">Recent activity</option><option value="follow_up_at">Follow-up first</option><option value="-created_at">Newest created</option><option value="customer_name">Customer name</option></select>
          <Button type="button" variant="outline" onClick={clearFilters}>Clear filters</Button>
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
      await adminApi.sendLeadPaymentLink(lead.id, { channel: "WHATSAPP" });
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
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [supportNote, setSupportNote] = useState("");
  const query = useQuery({ queryKey: ["admin", "customers", search], queryFn: () => adminApi.listCustomers({ page_size: 25, search: search || undefined }) });
  const detail = useQuery({ queryKey: ["admin", "customer", selectedId], queryFn: () => adminApi.getCustomer(selectedId), enabled: Boolean(selectedId) });
  const addNote = useMutation({
    mutationFn: () => adminApi.addCustomerSupportNote(selectedId, { note: supportNote }),
    onSuccess: async () => {
      setSupportNote("");
      await queryClient.invalidateQueries({ queryKey: ["admin", "customer", selectedId] });
    },
  });
  return (
    <>
      <AdminPageHeader title="Customers" description="Customer profiles with booking and spend summary." />
      <div className="mb-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search customer name or mobile" /></div>
      {selectedId ? (
        <section className="mb-5 rounded-xl border border-violet-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5"><div><h2 className="font-bold text-slate-950">Customer history</h2><p className="text-sm text-slate-500">{detail.data?.phone_number}</p></div><Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId("")}>Close</Button></div>
          {detail.isLoading ? <Loading /> : detail.isError ? <AdminErrorState message={detail.error.message} onRetry={() => void detail.refetch()} /> : detail.data ? (
            <div className="grid gap-5 p-5 xl:grid-cols-2">
              <CustomerHistorySection title="Addresses" items={detail.data.addresses?.map((item) => `${item.label}: ${item.recipient_name}, ${item.city} ${item.postal_code}`) ?? []} />
              <CustomerHistorySection title="Leads" items={detail.data.leads?.map((item) => `${item.status} · ${item.source} · ${new Date(item.created_at).toLocaleDateString("en-IN")}`) ?? []} />
              <CustomerHistorySection title="Bookings" items={detail.data.bookings?.map((item) => `${item.booking_number} · ${item.booking_status} · ${money(item.total_amount)}`) ?? []} />
              <CustomerHistorySection title="Payments" items={detail.data.payments?.map((item) => `${item.payment_type} · ${item.status} · ${money(item.amount)}`) ?? []} />
              <CustomerHistorySection title="Notifications" items={detail.data.notifications?.map((item) => `${item.event} · ${item.channel} · ${item.status}`) ?? []} />
              <CustomerHistorySection title="Reviews" items={detail.data.reviews?.map((item) => `${item.rating}/5 · ${item.is_visible ? "Visible" : "Hidden"}`) ?? []} />
              <section className="rounded-lg border border-slate-200 p-4 xl:col-span-2">
                <h3 className="font-bold text-slate-950">Support notes</h3>
                <div className="mt-3 space-y-2">{detail.data.support_notes?.map((item) => <div key={item.id} className="rounded bg-slate-50 p-3 text-sm"><p>{item.note}</p><p className="mt-1 text-xs text-slate-500">{item.created_by_phone || "Staff"} · {new Date(item.created_at).toLocaleString("en-IN")}</p></div>)}{!detail.data.support_notes?.length ? <p className="text-sm text-slate-500">No support notes.</p> : null}</div>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input value={supportNote} onChange={(event) => setSupportNote(event.target.value)} placeholder="Add customer support note" /><Button type="button" disabled={!supportNote.trim() || addNote.isPending} onClick={() => addNote.mutate()}>{addNote.isPending ? "Adding" : "Add note"}</Button></div>
                {addNote.isError ? <p className="mt-2 text-xs text-red-600">{addNote.error.message}</p> : null}
              </section>
            </div>
          ) : null}
        </section>
      ) : null}
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
            { key: "action", header: "Action", render: (customer) => <Button type="button" variant="outline" size="sm" onClick={() => setSelectedId(customer.id)}>View history</Button> },
          ]}
        />
      )}
    </>
  );
}

function CustomerHistorySection({ title, items }: { title: string; items: string[] }) {
  return <section className="rounded-lg border border-slate-200 p-4"><h3 className="font-bold text-slate-950">{title}</h3><div className="mt-3 space-y-2">{items.map((item, index) => <p key={`${title}-${index}`} className="rounded bg-slate-50 p-3 text-sm text-slate-700">{item}</p>)}{!items.length ? <p className="text-sm text-slate-500">No records.</p> : null}</div></section>;
}

export function AdminLeadDetailScreen({ leadId }: { leadId: string }) {
  const queryClient = useQueryClient();
  const lead = useQuery({ queryKey: ["admin", "lead", leadId], queryFn: () => adminApi.getLead(leadId) });
  const activities = useQuery({ queryKey: ["admin", "lead", leadId, "activities"], queryFn: () => adminApi.listLeadActivities(leadId) });
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [funnelStatus, setFunnelStatus] = useState("");
  const [paymentChannel, setPaymentChannel] = useState<"SMS" | "WHATSAPP">("WHATSAPP");
  const [bookingId, setBookingId] = useState("");
  const [conversionNotes, setConversionNotes] = useState("");
  const [manualPayment, setManualPayment] = useState({ amount: "", method: "MANUAL_CASH" as "MANUAL_CASH" | "MANUAL_UPI" | "MANUAL_CARD" | "MANUAL_BANK_TRANSFER", reference: "", payment_date: new Date().toISOString().slice(0, 10), note: "", confirm: false });
  const bookings = useQuery({ queryKey: ["admin", "bookings", "lead-conversion", leadId], queryFn: () => adminApi.listBookings({ page_size: 100 }) });

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
    mutationFn: () => adminApi.sendLeadPaymentLink(leadId, { channel: paymentChannel }),
    onSuccess: refresh,
  });
  const convert = useMutation({
    mutationFn: () => adminApi.convertLead(leadId, { booking_id: bookingId, notes: conversionNotes }),
    onSuccess: refresh,
  });
  const recordManualPayment = useMutation({
    mutationFn: () => adminApi.recordLeadManualPayment(leadId, manualPayment),
    onSuccess: () => {
      setManualPayment({ amount: "", method: "MANUAL_CASH", reference: "", payment_date: new Date().toISOString().slice(0, 10), note: "", confirm: false });
      refresh();
    },
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
            <select className="mt-3 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={paymentChannel} onChange={(event) => setPaymentChannel(event.target.value as typeof paymentChannel)}>
              <option value="WHATSAPP">WhatsApp</option>
              <option value="SMS">SMS</option>
            </select>
            <Button
              type="button"
              className="mt-3 w-full"
              onClick={() => paymentLink.mutate()}
              disabled={paymentLink.isPending || item.payment_status === "PAID" || Number(item.advance_amount ?? 0) <= 0}
            >
              {paymentLink.isPending ? "Sending" : "Send payment link"}
            </Button>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Convert to booking</h2>
            <select className="mt-3 h-11 w-full rounded-md border border-slate-200 bg-white px-3 text-sm" value={bookingId} onChange={(event) => setBookingId(event.target.value)}>
              <option value="">Select existing booking</option>
              {bookings.data?.results.map((booking) => <option key={booking.id} value={booking.id}>{booking.booking_number} · {booking.customer_phone}</option>)}
            </select>
            <Input className="mt-3" value={conversionNotes} onChange={(event) => setConversionNotes(event.target.value)} placeholder="Conversion notes" />
            <Button type="button" className="mt-3 w-full" disabled={!bookingId || convert.isPending || item.status === "CONVERTED"} onClick={() => convert.mutate()}>{convert.isPending ? "Converting" : "Convert lead"}</Button>
            {convert.isError ? <p className="mt-2 text-xs text-red-600">{convert.error.message}</p> : null}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-bold text-slate-950">Record manual payment</h2>
            <div className="mt-3 grid gap-3">
              <Input inputMode="decimal" value={manualPayment.amount} onChange={(event) => setManualPayment({ ...manualPayment, amount: event.target.value })} placeholder="Amount" />
              <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" value={manualPayment.method} onChange={(event) => setManualPayment({ ...manualPayment, method: event.target.value as typeof manualPayment.method })}>
                <option value="MANUAL_CASH">Cash</option><option value="MANUAL_UPI">UPI</option><option value="MANUAL_CARD">Card</option><option value="MANUAL_BANK_TRANSFER">Bank transfer</option>
              </select>
              <Input value={manualPayment.reference} onChange={(event) => setManualPayment({ ...manualPayment, reference: event.target.value })} placeholder="Payment reference" />
              <Input type="date" value={manualPayment.payment_date} onChange={(event) => setManualPayment({ ...manualPayment, payment_date: event.target.value })} />
              <Input value={manualPayment.note} onChange={(event) => setManualPayment({ ...manualPayment, note: event.target.value })} placeholder="Payment note" />
              <label className="flex items-start gap-2 text-xs font-semibold text-slate-700"><input className="mt-0.5" type="checkbox" checked={manualPayment.confirm} onChange={(event) => setManualPayment({ ...manualPayment, confirm: event.target.checked })} />I confirm this payment was received and verified.</label>
              <Button type="button" disabled={!manualPayment.confirm || Number(manualPayment.amount) <= 0 || recordManualPayment.isPending} onClick={() => recordManualPayment.mutate()}>{recordManualPayment.isPending ? "Recording" : "Record payment"}</Button>
              {recordManualPayment.isError ? <p className="text-xs text-red-600">{recordManualPayment.error.message}</p> : null}
            </div>
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
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", status: "", payment_type: "" });
  const [selected, setSelected] = useState<Payment | null>(null);
  const query = useQuery({ queryKey: ["admin", "payments", filters], queryFn: () => adminApi.listPayments({ page_size: 25, search: filters.search || undefined, status: filters.status || undefined, payment_type: filters.payment_type || undefined }) });
  return (
    <>
      <AdminPageHeader title="Payments" description="Payment records and provider status." />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px_auto]">
        <Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search booking, mobile or provider ID" />
        <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option>{["CREATED", "PENDING", "SUCCESS", "FAILED", "REFUNDED"].map((value) => <option key={value}>{value}</option>)}</select>
        <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" value={filters.payment_type} onChange={(event) => setFilters({ ...filters, payment_type: event.target.value })}><option value="">All payment types</option>{["ADVANCE", "BALANCE", "REFUND"].map((value) => <option key={value}>{value}</option>)}</select>
        <Button type="button" variant="outline" onClick={() => setFilters({ search: "", status: "", payment_type: "" })}>Clear</Button>
      </div>
      {selected ? <section className="mb-5 rounded-lg border border-violet-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-950">Payment details</h2><Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button></div><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4"><Detail label="Customer" value={selected.customer_phone} /><Detail label="Provider order" value={selected.provider_order_id || "-"} /><Detail label="Provider payment" value={selected.provider_payment_id || "-"} /><Detail label="Provider refund" value={selected.provider_refund_id || "-"} /><Detail label="Signature" value={selected.signature_verified ? "Verified" : "Not verified"} /><Detail label="Paid at" value={selected.paid_at ? new Date(selected.paid_at).toLocaleString("en-IN") : "-"} /><Detail label="Refunded at" value={selected.refunded_at ? new Date(selected.refunded_at).toLocaleString("en-IN") : "-"} /><Detail label="Updated" value={new Date(selected.updated_at).toLocaleString("en-IN")} /></div></section> : null}
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
            { key: "actions", header: "Actions", render: (payment) => <div className="flex items-start gap-2"><Button type="button" size="sm" variant="outline" onClick={() => setSelected(payment)}>Details</Button><PaymentRowActions payment={payment} onChanged={() => void queryClient.invalidateQueries({ queryKey: ["admin", "payments"] })} /></div> },
          ]}
        />
      )}
    </>
  );
}

function PaymentRowActions({ payment, onChanged }: { payment: Payment; onChanged: () => void }) {
  const [amount, setAmount] = useState(payment.amount);
  const [reason, setReason] = useState("");
  const refund = useMutation({
    mutationFn: () => adminApi.refundPayment(payment.id, { amount, reason }),
    onSuccess: onChanged,
  });
  const reconcile = useMutation({
    mutationFn: () => adminApi.reconcileRefund(payment.id),
    onSuccess: onChanged,
  });
  const canRefund = payment.payment_type !== "REFUND" && payment.status === "SUCCESS" && Boolean(payment.provider_payment_id);

  if (payment.payment_type === "REFUND") {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => reconcile.mutate()} disabled={reconcile.isPending}>
        {reconcile.isPending ? "Checking" : "Reconcile"}
      </Button>
    );
  }
  if (!canRefund) return <span className="text-xs text-slate-400">Not refundable</span>;

  return (
    <details className="min-w-52">
      <summary className="cursor-pointer text-sm font-semibold text-violet-700">Create refund</summary>
      <div className="mt-2 space-y-2 rounded-md border border-slate-200 bg-white p-3 shadow-lg">
        <Input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" aria-label="Refund amount" />
        <Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Refund reason" aria-label="Refund reason" />
        <Button type="button" size="sm" className="w-full" onClick={() => refund.mutate()} disabled={refund.isPending || Number(amount) <= 0}>
          {refund.isPending ? "Submitting" : `Refund ${money(amount)}`}
        </Button>
        {refund.isError ? <p className="text-xs text-red-600">{refund.error.message}</p> : null}
      </div>
    </details>
  );
}

export function AdminNotificationsScreen() {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState({ search: "", status: "", event: "", channel: "" });
  const [selectedId, setSelectedId] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ recipient: "", booking: "", event: "BOOKING_CONFIRMED", channel: "WHATSAPP", title: "", message: "" });
  const query = useQuery({ queryKey: ["admin", "notifications", filters], queryFn: () => adminApi.listNotifications({ page_size: 25, search: filters.search || undefined, status: filters.status || undefined, event: filters.event || undefined, channel: filters.channel || undefined }) });
  const detail = useQuery({ queryKey: ["admin", "notification", selectedId], queryFn: () => adminApi.getNotification(selectedId), enabled: Boolean(selectedId) });
  const create = useMutation({
    mutationFn: () => adminApi.createNotification({ recipient: form.recipient || null, booking: form.booking || null, event: form.event, channel: form.channel, status: "QUEUED", title: form.title, message: form.message }),
    onSuccess: async () => { setShowCreate(false); setForm({ recipient: "", booking: "", event: "BOOKING_CONFIRMED", channel: "WHATSAPP", title: "", message: "" }); await queryClient.invalidateQueries({ queryKey: ["admin", "notifications"] }); },
  });
  return (
    <>
      <AdminPageHeader title="Notifications" description="Delivery events, statuses, and retry controls." action={<Button type="button" onClick={() => setShowCreate((value) => !value)}><Plus className="h-4 w-4" />Manual notification</Button>} />
      {showCreate ? <section className="mb-5 rounded-lg border border-violet-200 bg-white p-5 shadow-sm"><form className="grid gap-3 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); create.mutate(); }}><Input value={form.recipient} onChange={(event) => setForm({ ...form, recipient: event.target.value })} placeholder="Recipient user UUID" required /><Input value={form.booking} onChange={(event) => setForm({ ...form, booking: event.target.value })} placeholder="Booking UUID (optional)" /><select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={form.event} onChange={(event) => setForm({ ...form, event: event.target.value })}>{["BOOKING_RECEIVED", "PAYMENT_PENDING", "PAYMENT_SUCCESSFUL", "PAYMENT_FAILED", "BOOKING_CONFIRMED", "BOOKING_RESCHEDULED", "TECHNICIAN_ASSIGNED", "BOOKING_CANCELLED", "REFUND_INITIATED", "REFUND_COMPLETED"].map((value) => <option key={value}>{value}</option>)}</select><select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={form.channel} onChange={(event) => setForm({ ...form, channel: event.target.value })}><option value="WHATSAPP">WhatsApp</option><option value="SMS">SMS</option><option value="EMAIL">Email</option></select><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Title" required /><Input value={form.message} onChange={(event) => setForm({ ...form, message: event.target.value })} placeholder="Message" required /><div className="md:col-span-2"><Button type="submit" disabled={create.isPending}>{create.isPending ? "Creating" : "Create queued notification"}</Button>{create.isError ? <p className="mt-2 text-xs text-red-600">{create.error.message}</p> : null}</div></form></section> : null}
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-2 xl:grid-cols-5"><Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search title, message or booking" /><select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}><option value="">All statuses</option>{["QUEUED", "SENT", "DELIVERED", "READ", "FAILED", "CANCELLED"].map((value) => <option key={value}>{value}</option>)}</select><Input value={filters.event} onChange={(event) => setFilters({ ...filters, event: event.target.value })} placeholder="Event code" /><select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={filters.channel} onChange={(event) => setFilters({ ...filters, channel: event.target.value })}><option value="">All channels</option><option value="WHATSAPP">WhatsApp</option><option value="SMS">SMS</option><option value="EMAIL">Email</option></select><Button type="button" variant="outline" onClick={() => setFilters({ search: "", status: "", event: "", channel: "" })}>Clear</Button></div>
      {selectedId && detail.data ? <section className="mb-5 rounded-lg border border-violet-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-950">{detail.data.title}</h2><Button type="button" variant="ghost" size="sm" onClick={() => setSelectedId("")}>Close</Button></div><p className="mt-3 text-sm text-slate-700">{detail.data.message}</p><div className="mt-4 grid gap-3 md:grid-cols-3"><Detail label="Recipient" value={detail.data.recipient_phone || "-"} /><Detail label="Booking" value={detail.data.booking_number || "-"} /><Detail label="Provider ID" value={detail.data.provider_message_id || "-"} /><Detail label="Sent" value={detail.data.sent_at ? new Date(detail.data.sent_at).toLocaleString("en-IN") : "-"} /><Detail label="Error" value={detail.data.error_message || "-"} /></div></section> : null}
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
                  <Button type="button" variant="outline" size="sm" onClick={() => setSelectedId(notification.id)}>Details</Button>
                  <Button type="button" variant="outline" size="sm" onClick={() => void adminApi.sendNotification(notification.id).then(() => query.refetch())} disabled={!(["QUEUED", "FAILED"].includes(notification.status))}>Send</Button>
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
