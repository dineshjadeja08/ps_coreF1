"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ClipboardList, Loader2 } from "lucide-react";
import { useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminDetailPanel } from "@/components/admin/admin-detail-panel";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { AdminTechnicianEditor } from "@/features/admin/components/admin-technician-editor";
import { adminApi } from "@/lib/api/endpoints";
import type { TechnicianWriteRequest } from "@/types/api";

export function AdminTechnicianDrawer({ technicianId, onClose, onCreated, onOpenBooking }: { technicianId: string; onClose: () => void; onCreated: (id: string) => void; onOpenBooking: (id: string) => void }) {
  const client = useQueryClient();
  const [tab, setTab] = useState("profile");
  const [editing, setEditing] = useState(!technicianId);
  const [saving, setSaving] = useState(false);
  const [activeJobs, setActiveJobs] = useState(true);
  const [page, setPage] = useState(1);
  const profile = useQuery({ queryKey: ["admin", "technicians", "detail", technicianId], queryFn: () => adminApi.getTechnician(technicianId), enabled: Boolean(technicianId) });
  const jobs = useQuery({ queryKey: ["admin", "technicians", "jobs", technicianId, activeJobs, page], queryFn: () => adminApi.listTechnicianJobs(technicianId, { active: activeJobs, page, page_size: 10 }), enabled: Boolean(technicianId) && tab === "jobs" });
  const activities = useQuery({ queryKey: ["admin", "technicians", "activities", technicianId], queryFn: () => adminApi.listTechnicianActivities(technicianId), enabled: Boolean(technicianId) && tab === "activity" });
  const update = useMutation({
    mutationFn: (body: Partial<TechnicianWriteRequest>) => adminApi.updateTechnician(technicianId, body),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin", "technicians"] }),
  });
  const data = profile.data;
  return (
    <AdminDetailPanel title={technicianId ? data?.display_name || "Technician details" : "Add technician"} onClose={() => { if (!saving && !update.isPending) onClose(); }}>
      {technicianId && profile.isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : null}
      {profile.isError ? <AdminErrorState message={profile.error.message} onRetry={() => void profile.refetch()} /> : null}
      {editing && (!technicianId || data) ? <AdminTechnicianEditor profile={data} onPendingChange={setSaving} onCancel={() => { if (technicianId) setEditing(false); else onClose(); }} onSaved={(saved) => { setEditing(false); if (!technicianId) onCreated(saved.id); }} /> : data ? (
        <>
          <nav aria-label="Technician sections" className="mb-5 flex flex-wrap gap-2">{["profile", "jobs", "activity"].map((name) => <Button key={name} type="button" variant={tab === name ? "default" : "outline"} aria-pressed={tab === name} onClick={() => setTab(name)}>{name === "profile" ? "Profile" : name === "jobs" ? "Assigned jobs" : "Activity timeline"}</Button>)}</nav>
          {tab === "profile" ? <div className="grid gap-5">
            <div className="flex flex-wrap items-center gap-2"><AdminStatusBadge status={data.is_active ? "ACTIVE" : "INACTIVE"} /><AdminStatusBadge status={data.background_verification_status ?? "PENDING"} /><Button type="button" variant="outline" disabled={update.isPending} onClick={() => { update.reset(); setEditing(true); }}>Edit profile</Button><Button type="button" variant="outline" disabled={update.isPending || (!data.is_active && (data.employment_status !== "ACTIVE" || data.background_verification_status === "SUSPENDED" || data.availability_status === "SUSPENDED"))} onClick={() => { if (window.confirm(data.is_active ? "Deactivate this technician? Existing jobs and history will be kept." : "Reactivate this technician?")) update.mutate({ is_active: !data.is_active }); }}>{data.is_active ? "Deactivate" : "Reactivate"}</Button></div>
            <dl className="grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2">{[
              ["Employee code", data.employee_code], ["Phone", data.phone], ["Alternate phone", data.alternate_phone], ["Email", data.email], ["Employment", data.employment_status], ["City / home pincode", [data.city, data.pincode].filter(Boolean).join(" · ")], ["Experience", `${data.experience_years ?? "0"} years`], ["Address", data.address],
            ].map(([label, value]) => <div key={label} className="min-w-0"><dt className="text-xs font-semibold text-slate-500">{label}</dt><dd className="mt-1 break-words text-sm">{value || "—"}</dd></div>)}</dl>
            <label className="grid gap-2 text-sm font-semibold">Availability<select className="h-11 rounded-lg border border-slate-200 bg-white px-3" value={data.availability_status ?? "OFFLINE"} disabled={update.isPending} onChange={(event) => update.mutate({ availability_status: event.target.value as TechnicianWriteRequest["availability_status"] })}>{["AVAILABLE", "BUSY", "ON_LEAVE", "OFFLINE", "SUSPENDED"].map((status) => <option key={status} value={status} disabled={status === "SUSPENDED" && data.is_active}>{status.replaceAll("_", " ")}</option>)}</select><span className="text-xs font-normal text-slate-500">Availability controls new assignments; it does not change existing job status.</span></label>
            <section><h3 className="font-semibold">Skills and coverage</h3><p className="mt-2 text-sm">{data.skills.map((skill) => skill.name).join(", ") || "No skills recorded"}</p><p className="mt-2 text-sm">Services: {data.supported_services?.map((service) => service.name).join(", ") || "All services (unrestricted)"}</p><p className="mt-2 text-sm">Areas: {data.service_areas.map((area) => `${area.name} (${area.postal_code})`).join(", ") || data.pincode || "All areas (unrestricted)"}</p></section>
            <section><h3 className="font-semibold">Performance</h3><div className="mt-3 grid gap-3 sm:grid-cols-2">{[["Active jobs", data.active_job_count ?? 0], ["Completed jobs", data.completed_jobs ?? 0], ["Cancelled bookings", data.cancelled_jobs ?? 0], ["Approved rating", data.approved_rating ? `${data.approved_rating}/5 (${data.approved_review_count ?? 0} reviews)` : "No approved reviews"]].map(([label, value]) => <div key={label} className="rounded-lg border border-slate-200 p-3"><p className="text-xs text-slate-500">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}</div><p className="mt-2 text-xs text-slate-500">Counts reflect bookings currently attributed to this technician. Cancelled bookings do not necessarily mean technician fault.</p></section>
            <section><h3 className="font-semibold">Admin notes</h3><p className="mt-2 whitespace-pre-wrap text-sm">{data.internal_notes || "No notes recorded."}</p></section>
          </div> : null}
          {tab === "jobs" ? <section><label className="mb-4 flex items-center gap-2 text-sm"><input type="checkbox" checked={activeJobs} onChange={(event) => { setActiveJobs(event.target.checked); setPage(1); }} />Show active jobs only</label>{jobs.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}{jobs.isError ? <AdminErrorState message={jobs.error.message} onRetry={() => void jobs.refetch()} /> : null}{jobs.data ? <><AdminDataTable rows={jobs.data.results} getRowKey={(booking) => booking.id} onRowClick={(booking) => onOpenBooking(booking.id)} emptyIcon={ClipboardList} emptyTitle="No assigned jobs" emptyMessage="Assign a confirmed booking from Bookings or Assignments." columns={[
            { key: "booking", header: "Booking", render: (booking) => booking.booking_number },
            { key: "customer", header: "Customer", render: (booking) => booking.customer_name || booking.customer_phone || "Customer" },
            { key: "service", header: "Service", render: (booking) => String(booking.service.name || "Service") },
            { key: "schedule", header: "Schedule", render: (booking) => `${booking.service_date} · ${String(booking.time_slot.start_time || "")}–${String(booking.time_slot.end_time || "")}` },
            { key: "status", header: "Status", render: (booking) => <AdminStatusBadge status={booking.booking_status} /> },
          ]} /><AdminPagination count={jobs.data.count} page={page} pageSize={10} hasNext={Boolean(jobs.data.next)} hasPrevious={Boolean(jobs.data.previous)} onPageChange={setPage} /></> : null}</section> : null}
          {tab === "activity" ? <section><p className="mb-3 text-xs text-slate-500">Latest 100 recorded events</p>{activities.isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}{activities.isError ? <AdminErrorState message={activities.error.message} onRetry={() => void activities.refetch()} /> : null}<ol className="grid gap-3">{activities.data?.map((activity) => <li key={activity.id} className="rounded-lg border border-slate-200 p-3"><p className="font-semibold">{activity.title}</p><p className="mt-1 break-words text-sm">{activity.description}</p><p className="mt-2 text-xs text-slate-500">{activity.actor} · {new Date(activity.created_at).toLocaleString("en-IN")}</p></li>)}</ol></section> : null}
          {update.isError ? <p role="alert" className="mt-3 text-sm text-red-600">{update.error.message}</p> : null}
        </>
      ) : null}
    </AdminDetailPanel>
  );
}
