"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, FileClock, Loader2, Save, Settings, Shield, Star, TrendingUp } from "lucide-react";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminMetricCard } from "@/components/admin/admin-metric-card";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [dates, setDates] = useState({ date_from: "", date_to: "" });
  const query = useQuery({ queryKey: ["admin", "reports", dates], queryFn: () => adminApi.getReportsSummary({ date_from: dates.date_from || undefined, date_to: dates.date_to || undefined }) });
  return (
    <>
      <AdminPageHeader title="Reports" description="Bookings, collections, pending payments, and quality snapshot." />
      <div className="mb-5 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center"><Input type="date" value={dates.date_from} onChange={(event) => setDates({ ...dates, date_from: event.target.value })} aria-label="Report start date" /><Input type="date" value={dates.date_to} onChange={(event) => setDates({ ...dates, date_to: event.target.value })} aria-label="Report end date" /><Button type="button" variant="outline" onClick={() => setDates({ date_from: "", date_to: "" })}>Clear dates</Button></div>
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
          <AdminMetricCard icon={TrendingUp} label="Refunds" value={money(query.data?.refunds)} />
          <AdminMetricCard icon={Activity} label="Unassigned" value={query.data?.unassigned_bookings ?? 0} />
        </div>
      )}
    </>
  );
}

type StaffForm = {
  phone_number: string;
  password: string;
  first_name: string;
  last_name: string;
  email: string;
  role: AdminStaff["role"];
  is_verified: boolean;
  is_active: boolean;
  is_staff: boolean;
  group_ids: number[];
};

const emptyStaffForm: StaffForm = {
  phone_number: "",
  password: "",
  first_name: "",
  last_name: "",
  email: "",
  role: "ADMIN",
  is_verified: true,
  is_active: true,
  is_staff: true,
  group_ids: [],
};

export function AdminStaffScreen() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<AdminStaff | null>(null);
  const [editorMode, setEditorMode] = useState<"create" | "edit" | null>(null);
  const [form, setForm] = useState<StaffForm>(emptyStaffForm);
  const staff = useQuery({ queryKey: ["admin", "staff"], queryFn: () => adminApi.listStaff({ page_size: 50 }) });
  const groups = useQuery({ queryKey: ["admin", "staff-groups"], queryFn: adminApi.listStaffGroups });
  const save = useMutation({
    mutationFn: () => {
      if (editorMode === "create") {
        return adminApi.createStaff({
          phone_number: form.phone_number,
          password: form.password,
          first_name: form.first_name,
          last_name: form.last_name,
          email: form.email,
          role: form.role === "SUPER_ADMIN" ? "SUPER_ADMIN" : "ADMIN",
          group_ids: form.group_ids,
        });
      }
      if (!selected) throw new Error("Select a staff member to edit.");
      return adminApi.updateStaff(selected.id, {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        role: form.role,
        is_verified: form.is_verified,
        is_active: form.is_active,
        is_staff: form.is_staff,
        group_ids: form.group_ids,
      });
    },
    onSuccess: async () => {
      closeEditor();
      await queryClient.invalidateQueries({ queryKey: ["admin", "staff"] });
    },
  });
  function closeEditor() {
    setSelected(null);
    setEditorMode(null);
    setForm(emptyStaffForm);
    save.reset();
  }
  function create() {
    setSelected(null);
    setEditorMode("create");
    setForm(emptyStaffForm);
    save.reset();
  }
  function edit(user: AdminStaff) {
    setSelected(user);
    setEditorMode("edit");
    setForm({ phone_number: user.phone_number, password: "", first_name: user.first_name, last_name: user.last_name, email: user.email ?? "", role: user.role, is_verified: user.is_verified, is_active: user.is_active, is_staff: user.is_staff, group_ids: user.groups.map((group) => group.id) });
    save.reset();
  }
  function toggleGroup(id: number) {
    setForm({ ...form, group_ids: form.group_ids.includes(id) ? form.group_ids.filter((value) => value !== id) : [...form.group_ids, id] });
  }
  const canSave = editorMode === "edit" || Boolean(form.phone_number.trim() && form.password.length >= 8);
  return (
    <>
      <AdminPageHeader
        title="Staff and Roles"
        description="Control admin and technician access from the operations portal. Only super administrators can manage staff accounts."
        action={<Button type="button" onClick={create}>Add administrator</Button>}
      />
      {editorMode ? (
        <section className="mb-5 rounded-xl border border-violet-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between"><div><h2 className="font-bold text-slate-950">{editorMode === "create" ? "Add administrator" : "Edit staff member"}</h2><p className="text-sm text-slate-500">{editorMode === "create" ? "Create secure credentials for a new admin staff member." : selected?.phone_number}</p></div><Button type="button" variant="ghost" size="sm" onClick={closeEditor}>Close</Button></div>
          <form className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4" onSubmit={(event) => { event.preventDefault(); if (canSave) save.mutate(); }}>
            {editorMode === "create" ? <Input inputMode="tel" value={form.phone_number} onChange={(event) => setForm({ ...form, phone_number: event.target.value })} placeholder="Phone in +91 format" required /> : null}
            {editorMode === "create" ? <Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} placeholder="Temporary password (8+ characters)" minLength={8} required /> : null}
            <Input value={form.first_name} onChange={(event) => setForm({ ...form, first_name: event.target.value })} placeholder="First name" />
            <Input value={form.last_name} onChange={(event) => setForm({ ...form, last_name: event.target.value })} placeholder="Last name" />
            <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" />
            <select className="h-11 rounded-md border border-slate-200 bg-white px-3 text-sm" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value as AdminStaff["role"] })}>{editorMode === "edit" ? <option value="TECHNICIAN">Technician</option> : null}<option value="ADMIN">Admin</option><option value="SUPER_ADMIN">Super admin</option></select>
            {editorMode === "edit" ? <div className="flex flex-wrap gap-4 md:col-span-2 xl:col-span-4">
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_verified} onChange={(event) => setForm({ ...form, is_verified: event.target.checked })} />Verified</label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} />Active</label>
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_staff} onChange={(event) => setForm({ ...form, is_staff: event.target.checked })} />Staff access</label>
            </div> : null}
            <div className="md:col-span-2 xl:col-span-4"><p className="text-xs font-bold uppercase text-slate-500">Permission groups</p><div className="mt-2 flex flex-wrap gap-2">{groups.data?.map((group) => <label key={group.id} className="flex items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm"><input type="checkbox" checked={form.group_ids.includes(group.id)} onChange={() => toggleGroup(group.id)} />{group.name}</label>)}</div></div>
            <div className="md:col-span-2 xl:col-span-4"><Button type="submit" disabled={!canSave || save.isPending}><Save className="h-4 w-4" />{save.isPending ? "Saving" : editorMode === "create" ? "Create administrator" : "Save staff"}</Button>{save.isError ? <p className="mt-2 text-sm text-red-600">{save.error.message}</p> : null}</div>
          </form>
        </section>
      ) : null}
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
                <Button type="button" variant="outline" size="sm" onClick={() => edit(user)}>Edit</Button>
              ),
            },
          ]}
        />
      )}
    </>
  );
}

export function AdminAuditLogsScreen() {
  const [filters, setFilters] = useState({ search: "", action: "", resource_type: "" });
  const [selected, setSelected] = useState<import("@/types/api").AuditLog | null>(null);
  const query = useQuery({ queryKey: ["admin", "audit-logs", filters], queryFn: () => adminApi.listAuditLogs({ page_size: 50, search: filters.search || undefined, action: filters.action || undefined, resource_type: filters.resource_type || undefined }) });
  return (
    <>
      <AdminPageHeader title="Audit Logs" description="Trace admin actions across catalogue, bookings, payments, leads, and staff." />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_220px_auto]"><Input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} placeholder="Search audit logs" /><Input value={filters.action} onChange={(event) => setFilters({ ...filters, action: event.target.value })} placeholder="Action code" /><Input value={filters.resource_type} onChange={(event) => setFilters({ ...filters, resource_type: event.target.value })} placeholder="Resource type" /><Button type="button" variant="outline" onClick={() => setFilters({ search: "", action: "", resource_type: "" })}>Clear</Button></div>
      {selected ? <section className="mb-5 rounded-lg border border-violet-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-950">Audit event details</h2><Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button></div><div className="mt-4 grid gap-3 md:grid-cols-2"><p className="text-sm"><strong>IP:</strong> {selected.ip_address || "-"}</p><p className="break-all text-sm"><strong>User agent:</strong> {selected.user_agent || "-"}</p><pre className="overflow-auto rounded bg-slate-950 p-4 text-xs text-slate-100 md:col-span-2">{JSON.stringify(selected.metadata, null, 2)}</pre></div></section> : null}
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
            { key: "details", header: "Details", render: (log) => <Button type="button" variant="outline" size="sm" onClick={() => setSelected(log)}>View</Button> },
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
  const [search, setSearch] = useState("");
  const [visibility, setVisibility] = useState("");
  const [selected, setSelected] = useState<import("@/types/api").AdminReview | null>(null);
  const query = useQuery({ queryKey: ["admin", "reviews", search, visibility], queryFn: () => adminApi.listReviews({ page_size: 50, search: search || undefined, is_visible: visibility === "" ? undefined : visibility === "true" }) });
  const save = useMutation({
    mutationFn: ({ id, is_visible }: { id: string; is_visible: boolean }) => adminApi.updateReview(id, { is_visible }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
  });
  return (
    <>
      <AdminPageHeader title="Reviews" description="Moderate customer reviews and control public visibility." />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-[1fr_220px_auto]"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search booking, service or review" /><select className="h-11 rounded-md border border-slate-200 px-3 text-sm" value={visibility} onChange={(event) => setVisibility(event.target.value)}><option value="">All reviews</option><option value="true">Visible</option><option value="false">Hidden</option></select><Button type="button" variant="outline" onClick={() => { setSearch(""); setVisibility(""); }}>Clear</Button></div>
      {selected ? <section className="mb-5 rounded-lg border border-violet-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h2 className="font-bold text-slate-950">Review for {selected.booking_number}</h2><Button type="button" variant="ghost" size="sm" onClick={() => setSelected(null)}>Close</Button></div><p className="mt-3 text-sm font-semibold">{selected.service_name} · {selected.rating}/5</p><p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{selected.comment || "No written comment."}</p></section> : null}
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
            { key: "comment", header: "Comment", render: (review) => <button type="button" className="inline-block max-w-sm truncate text-left text-violet-700 hover:underline" onClick={() => setSelected(review)}>{review.comment || "View"}</button> },
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
