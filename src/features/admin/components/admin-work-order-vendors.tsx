"use client";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { Button } from "@/components/ui/button";
import { adminApi } from "@/lib/api/endpoints";
import type { Booking, UUID } from "@/types/api";

export function AdminWorkOrderVendors({ booking, onChanged }: { booking: Booking; onChanged: () => void }) {
  const queryClient = useQueryClient();
  const serviceId = String(booking.service.id ?? "") as UUID;
  const canAssign = ["CONFIRMED", "TECHNICIAN_ASSIGNED"].includes(booking.booking_status);
  const vendors = useQuery({
    queryKey: ["admin", "work-order-vendors", booking.id, serviceId],
    queryFn: () => adminApi.listTechnicians({
      booking_id: booking.id,
      service_id: serviceId,
      availability_status: "AVAILABLE",
      is_active: true,
      verification: "VERIFIED",
    }),
    enabled: canAssign && Boolean(serviceId),
  });
  const assign = useMutation({
    mutationFn: (technicianId: UUID) => adminApi.assignTechnician(booking.id, {
      technician_id: technicianId,
      notes: "Assigned from work-order vendor list.",
    }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "work-orders"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "technicians"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] }),
      ]);
      onChanged();
    },
  });

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-950">Available vendors for this job</h2>
          <p className="mt-1 text-sm text-slate-600">Only verified vendors available for this service, service area, and scheduled slot are listed.</p>
        </div>
        {booking.assigned_technician ? <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">Assigned: {booking.assigned_technician.name}</span> : null}
      </div>

      {!canAssign ? <p className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-600">Vendor assignment is available before the job starts. This work order is currently {booking.booking_status.replaceAll("_", " ").toLowerCase()}.</p> : null}
      {canAssign && vendors.isLoading ? <div className="flex items-center gap-2 py-6 text-sm text-slate-500"><Loader2 className="h-4 w-4 animate-spin" />Checking vendor service area and slot availability…</div> : null}
      {canAssign && vendors.isError ? <div className="mt-4"><AdminErrorState message={vendors.error.message || "Could not load available vendors."} onRetry={() => void vendors.refetch()} /></div> : null}
      {canAssign && vendors.data && vendors.data.length === 0 ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">No verified vendor is currently available for this service and scheduled slot. Try another time slot or update vendor availability and coverage.</p> : null}

      {canAssign && vendors.data?.length ? <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full min-w-[760px] divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50"><tr>
            {["Name", "Mobile number", "Location", "Monthly jobs", "Assign"].map((heading) => <th key={heading} className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wide text-slate-500">{heading}</th>)}
          </tr></thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {vendors.data.map((vendor) => {
              const isAssigned = booking.assigned_technician?.id === vendor.id;
              return <tr key={vendor.id} className="hover:bg-slate-50">
                <td className="px-4 py-3"><p className="font-semibold text-slate-950">{vendor.display_name}</p><p className="mt-1 text-xs text-emerald-700">Available · Verified</p><p className="mt-1 text-xs text-slate-500">{vendor.active_job_count ?? 0} active {vendor.active_job_count === 1 ? "job" : "jobs"}</p></td>
                <td className="px-4 py-3"><a href={`tel:${vendor.phone}`} className="text-violet-700 hover:underline">{vendor.phone}</a></td>
                <td className="px-4 py-3 text-slate-600">{vendor.city || "Location not listed"}</td>
                <td className="px-4 py-3 font-medium text-slate-700">{vendor.monthly_job_count ?? 0}</td>
                <td className="px-4 py-3"><Button type="button" size="sm" variant={isAssigned ? "outline" : "default"} disabled={assign.isPending || isAssigned} onClick={() => { if (window.confirm(`Assign ${vendor.display_name} to work order ${booking.booking_number}?`)) assign.mutate(vendor.id); }}>
                  {assign.isPending && !isAssigned ? <Loader2 className="h-4 w-4 animate-spin" /> : isAssigned ? <CheckCircle2 className="h-4 w-4" /> : null}
                  {isAssigned ? "Assigned" : "Assign"}
                </Button></td>
              </tr>;
            })}
          </tbody>
        </table>
      </div> : null}
      {assign.isError ? <p role="alert" className="mt-3 text-sm font-medium text-red-700">{assign.error.message}</p> : null}
    </section>
  );
}
