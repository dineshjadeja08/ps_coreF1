"use client";

import { Loader2, Plus, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useDeferredValue, useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminBookingDrawer } from "@/features/admin/components/admin-booking-drawer";
import { AdminTechnicianDrawer } from "@/features/admin/components/admin-technician-drawer";
import { adminApi } from "@/lib/api/endpoints";
import { technicianCoverageSummary, technicianSkillsSummary } from "@/features/admin/technician-summary";

const selectClass = "h-11 min-w-0 rounded-lg border border-slate-200 bg-white px-3 text-sm";
const pageSize = 25;

export function AdminTechniciansScreen() {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [service, setService] = useState("");
  const [area, setArea] = useState("");
  const [availability, setAvailability] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const options = useQuery({ queryKey: ["admin", "technicians", "options"], queryFn: adminApi.getTechnicianOptions });
  const query = useQuery({
    queryKey: ["admin", "technicians", "list", deferredSearch, service, area, availability, active],
    queryFn: () => adminApi.listTechnicians({ include_inactive: true, search: deferredSearch || undefined, service_id: service || undefined, area_id: area || undefined, availability_status: availability || undefined, is_active: active === "" ? undefined : active === "true" }),
  });
  const count = query.data?.length ?? 0;
  const currentPage = Math.min(page, Math.max(1, Math.ceil(count / pageSize)));

  return (
    <>
      <AdminPageHeader title="Technicians" description="Manage profiles, service coverage, availability, and assigned jobs. Click a technician to manage them." action={<Button type="button" onClick={() => setSelected("")}><Plus className="h-4 w-4" />Add technician</Button>} />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 sm:grid-cols-2 xl:grid-cols-3">
        <Input aria-label="Search technicians" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Name, phone, or employee code" />
        <select aria-label="Filter by service" className={selectClass} value={service} onChange={(event) => { setService(event.target.value); setPage(1); }}><option value="">All services</option>{options.data?.services.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select aria-label="Filter by service area" className={selectClass} value={area} onChange={(event) => { setArea(event.target.value); setPage(1); }}><option value="">All service areas</option>{options.data?.areas.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.postal_code}</option>)}</select>
        <select aria-label="Filter by availability" className={selectClass} value={availability} onChange={(event) => { setAvailability(event.target.value); setPage(1); }}><option value="">All availability</option>{["AVAILABLE", "BUSY", "ON_LEAVE", "OFFLINE", "SUSPENDED"].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select>
        <select aria-label="Filter by active status" className={selectClass} value={active} onChange={(event) => { setActive(event.target.value); setPage(1); }}><option value="">Active and inactive</option><option value="true">Active only</option><option value="false">Inactive only</option></select>
        <Button type="button" variant="outline" onClick={() => { setSearch(""); setService(""); setArea(""); setAvailability(""); setActive(""); setPage(1); }}>Clear filters</Button>
      </div>
      {options.isError ? <AdminErrorState message="Could not load service and area filters." onRetry={() => void options.refetch()} /> : null}
      {query.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
        </div>
      ) : query.isError && !query.data ? (
        <AdminErrorState message={query.error instanceof Error ? query.error.message : "Technicians unavailable."} onRetry={() => void query.refetch()} />
      ) : (
        <><AdminDataTable
          rows={(query.data ?? []).slice((currentPage - 1) * pageSize, currentPage * pageSize)}
          getRowKey={(technician) => technician.id}
          onRowClick={(technician) => setSelected(technician.id)}
          emptyIcon={Wrench}
          emptyTitle="No technicians found"
          emptyMessage="Add a technician or adjust the filters."
          columns={[
            { key: "name", header: "Technician", render: (technician) => <div><p className="font-semibold">{technician.display_name}</p><p className="text-xs text-slate-500">{technician.employee_code}</p><a className="text-sm text-violet-700" href={`tel:${technician.phone}`}>{technician.phone}</a></div> },
            { key: "skills", header: "Skills", render: technicianSkillsSummary },
            { key: "areas", header: "Service area", render: technicianCoverageSummary },
            { key: "availability", header: "Availability / Jobs", render: (technician) => <div><AdminStatusBadge status={technician.availability_status ?? "OFFLINE"} /><p className="mt-2 text-sm">{technician.active_job_count ?? 0} active jobs</p></div> },
            { key: "status", header: "Status", render: (technician) => <div className="flex flex-wrap gap-2"><AdminStatusBadge status={technician.is_active ? "ACTIVE" : "INACTIVE"} /><AdminStatusBadge status={technician.background_verification_status ?? "PENDING"} /></div> },
          ]}
        /><AdminPagination count={count} page={currentPage} pageSize={pageSize} hasNext={currentPage * pageSize < count} hasPrevious={currentPage > 1} onPageChange={setPage} /></>
      )}
      {selected !== null ? <AdminTechnicianDrawer key={selected || "new"} technicianId={selected} onClose={() => setSelected(null)} onCreated={setSelected} onOpenBooking={(id) => { setSelected(null); setBookingId(id); }} /> : null}
      {bookingId ? <AdminBookingDrawer key={bookingId} bookingId={bookingId} onClose={() => setBookingId(null)} /> : null}
    </>
  );
}
