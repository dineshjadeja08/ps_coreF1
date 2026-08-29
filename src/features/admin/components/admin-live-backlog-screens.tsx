"use client";

import { Bell, CreditCard, Loader2, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/endpoints";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

export function AdminLeadsScreen() {
  const query = useQuery({ queryKey: ["admin", "leads"], queryFn: () => adminApi.listLeads({ page_size: 25 }) });
  return (
    <>
      <AdminPageHeader title="Leads" description="Lead intake, follow-up status, and conversion tracking." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={String(query.error.message)} onRetry={() => void query.refetch()} /> : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(lead) => lead.id}
          emptyIcon={Users}
          emptyTitle="No leads"
          emptyMessage="Manual and website leads will appear here."
          columns={[
            { key: "name", header: "Customer", render: (lead) => <span className="font-semibold text-slate-950">{lead.customer_name}</span> },
            { key: "mobile", header: "Mobile", render: (lead) => lead.primary_mobile },
            { key: "city", header: "City", render: (lead) => lead.city || "-" },
            { key: "source", header: "Source", render: (lead) => lead.source },
            { key: "status", header: "Status", render: (lead) => <AdminStatusBadge status={lead.status} /> },
          ]}
        />
      )}
    </>
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
