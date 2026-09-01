"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, FileClock, Loader2, Save, Settings, Shield, Star, TrendingUp } from "lucide-react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/endpoints";
import type { AdminStaff } from "@/types/api";

function money(value: string | number | null | undefined) {
  return new Intl.NumberFormat("en-IN", { currency: "INR", style: "currency", maximumFractionDigits: 0 }).format(Number(value ?? 0));
}

function Loading() {
  return (
    <div className="grid min-h-64 place-items-center rounded-lg border border-slate-200 bg-white">
      <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
    </div>
  );
}

function Flag({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4">
      <p className="text-sm font-bold text-slate-950">{label}</p>
      <AdminStatusBadge status={active ? "CONFIGURED" : "MISSING"} />
    </div>
  );
}

export function AdminReportsScreen() {
  const query = useQuery({ queryKey: ["admin", "reports"], queryFn: () => adminApi.getReportsSummary() });
  return (
    <>
      <AdminPageHeader title="Reports" description="Bookings, collections, pending payments, and quality snapshot." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <AdminMetricCard icon={TrendingUp} label="Revenue collected" value={money(query.data?.revenue_collected)} />
          <AdminMetricCard icon={Activity} label="Bookings" value={query.data?.daily_bookings ?? 0} />
          <AdminMetricCard icon={Activity} label="Completed" value={query.data?.completed_services ?? 0} />
          <AdminMetricCard icon={Activity} label="Cancelled" value={query.data?.cancelled_bookings ?? 0} />
          <AdminMetricCard icon={TrendingUp} label="Advance payments" value={money(query.data?.advance_payments)} />
          <AdminMetricCard icon={TrendingUp} label="Balance payments" value={money(query.data?.balance_payments)} />
          <AdminMetricCard icon={Activity} label="Payment pending" value={query.data?.payment_pending_bookings ?? 0} />
          <AdminMetricCard icon={Activity} label="Average rating" value={(query.data?.average_rating ?? 0).toFixed(1)} />
        </div>
      )}
    </>
  );
}

export function AdminStaffScreen() {
  const queryClient = useQueryClient();
  const staff = useQuery({ queryKey: ["admin", "staff"], queryFn: () => adminApi.listStaff({ page_size: 50 }) });
  const save = useMutation({
    mutationFn: (user: AdminStaff) =>
      adminApi.updateStaff(user.id, {
        is_active: !user.is_active,
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "staff"] }),
  });
  return (
    <>
      <AdminPageHeader title="Staff and Roles" description="Control admin and technician access from the operations portal." />
      {staff.isLoading ? <Loading /> : staff.isError ? <AdminErrorState message={staff.error.message} onRetry={() => void staff.refetch()} /> : (
        <AdminDataTable
          rows={staff.data?.results ?? []}
          getRowKey={(user) => user.id}
          emptyIcon={Shield}
          emptyTitle="No staff"
          emptyMessage="Staff users will appear here after admin or technician accounts are created."
          columns={[
            { key: "phone", header: "Mobile", render: (user) => <span className="font-semibold text-slate-950">{user.phone_number}</span> },
            { key: "name", header: "Name", render: (user) => [user.first_name, user.last_name].filter(Boolean).join(" ") || "-" },
            { key: "role", header: "Role", render: (user) => user.role.replace("_", " ") },
            { key: "groups", header: "Groups", render: (user) => user.groups.map((group) => group.name).join(", ") || "-" },
            { key: "status", header: "Status", render: (user) => <AdminStatusBadge status={user.is_active ? "ACTIVE" : "INACTIVE"} /> },
            {
              key: "actions",
              header: "Actions",
              render: (user) => (
                <Button type="button" variant="outline" size="sm" disabled={save.isPending} onClick={() => save.mutate(user)}>
                  <Save className="h-4 w-4" />
                  {user.is_active ? "Disable" : "Enable"}
                </Button>
              ),
            },
          ]}
        />
      )}
    </>
  );
}

export function AdminAuditLogsScreen() {
  const query = useQuery({ queryKey: ["admin", "audit-logs"], queryFn: () => adminApi.listAuditLogs({ page_size: 50 }) });
  return (
    <>
      <AdminPageHeader title="Audit Logs" description="Trace admin actions across catalogue, bookings, payments, leads, and staff." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(log) => log.id}
          emptyIcon={FileClock}
          emptyTitle="No audit entries"
          emptyMessage="Operational actions will be recorded here."
          columns={[
            { key: "date", header: "Time", render: (log) => new Date(log.created_at).toLocaleString("en-IN") },
            { key: "actor", header: "Actor", render: (log) => log.actor_phone || "-" },
            { key: "action", header: "Action", render: (log) => <span className="font-semibold text-slate-950">{log.action.replaceAll("_", " ")}</span> },
            { key: "resource", header: "Resource", render: (log) => `${log.resource_type} ${log.resource_id || ""}` },
          ]}
        />
      )}
    </>
  );
}

export function AdminSettingsScreen() {
  const query = useQuery({ queryKey: ["admin", "settings"], queryFn: adminApi.getSettings });
  return (
    <>
      <AdminPageHeader title="Settings" description="Safe production configuration visibility. Secret values are never shown here." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Flag label="Razorpay" active={Boolean(query.data?.razorpay_configured)} />
            <Flag label="MSG91" active={Boolean(query.data?.msg91_configured)} />
            <Flag label="Firebase Admin" active={Boolean(query.data?.firebase_configured)} />
            <Flag label="Cloudinary media" active={Boolean(query.data?.cloudinary_media_enabled && query.data?.cloudinary_media_configured)} />
            <Flag label="Balance before completion" active={Boolean(query.data?.booking_require_balance_before_completion)} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <section className="rounded-lg border border-slate-200 bg-white p-5">
              <Settings className="h-5 w-5 text-violet-700" />
              <h2 className="mt-3 text-sm font-bold text-slate-950">Runtime</h2>
              <p className="mt-2 text-sm text-slate-600">DEBUG: {String(query.data?.debug)}</p>
              <p className="text-sm text-slate-600">OTP: {query.data?.otp_provider}</p>
              <p className="text-sm text-slate-600">Notifications: {query.data?.notification_provider}</p>
              <p className="text-sm text-slate-600">Cloudinary media: {query.data?.cloudinary_media_enabled ? "Enabled" : "Disabled"}</p>
            </section>
            {[
              ["Allowed hosts", query.data?.allowed_hosts],
              ["CORS origins", query.data?.cors_allowed_origins],
              ["CSRF origins", query.data?.csrf_trusted_origins],
            ].map(([title, items]) => (
              <section key={String(title)} className="rounded-lg border border-slate-200 bg-white p-5">
                <h2 className="text-sm font-bold text-slate-950">{String(title)}</h2>
                <div className="mt-3 space-y-2">
                  {(items as string[] | undefined)?.length ? (items as string[]).map((item) => <p key={item} className="break-all rounded bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">{item}</p>) : <p className="text-sm text-slate-500">Not configured</p>}
                </div>
              </section>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

export function AdminReviewsScreen() {
  const queryClient = useQueryClient();
  const query = useQuery({ queryKey: ["admin", "reviews"], queryFn: () => adminApi.listReviews({ page_size: 50 }) });
  const save = useMutation({
    mutationFn: ({ id, is_visible }: { id: string; is_visible: boolean }) => adminApi.updateReview(id, { is_visible }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
  return (
    <>
      <AdminPageHeader title="Reviews" description="Moderate customer reviews and control public visibility." />
      {query.isLoading ? <Loading /> : query.isError ? <AdminErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(review) => review.id}
          emptyIcon={Star}
          emptyTitle="No reviews"
          emptyMessage="Completed booking reviews will appear here."
          columns={[
            { key: "booking", header: "Booking", render: (review) => <span className="font-semibold text-slate-950">{review.booking_number}</span> },
            { key: "service", header: "Service", render: (review) => review.service_name || "-" },
            { key: "rating", header: "Rating", render: (review) => `${review.rating}/5` },
            { key: "comment", header: "Comment", render: (review) => <span className="inline-block max-w-sm truncate">{review.comment}</span> },
            { key: "status", header: "Status", render: (review) => <AdminStatusBadge status={review.is_visible ? "VISIBLE" : "HIDDEN"} /> },
            {
              key: "actions",
              header: "Actions",
              render: (review) => (
                <Button type="button" variant="outline" size="sm" disabled={save.isPending} onClick={() => save.mutate({ id: review.id, is_visible: !review.is_visible })}>
                  {review.is_visible ? "Hide" : "Show"}
                </Button>
              ),
            },
          ]}
        />
      )}
    </>
  );
}
