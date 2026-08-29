"use client";

import { Loader2, Wrench } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { adminApi } from "@/lib/api/endpoints";

export function AdminTechniciansScreen() {
  const query = useQuery({
    queryKey: ["admin", "technicians"],
    queryFn: () => adminApi.listTechnicians(),
  });

  return (
    <>
      <AdminPageHeader title="Technicians" description="Manage technician readiness, coverage, and assignment eligibility." />
      {query.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
        </div>
      ) : query.isError ? (
        <AdminErrorState message={query.error instanceof Error ? query.error.message : "Technicians unavailable."} onRetry={() => void query.refetch()} />
      ) : (
        <AdminDataTable
          rows={query.data ?? []}
          getRowKey={(technician) => technician.id}
          emptyIcon={Wrench}
          emptyTitle="No technicians found"
          emptyMessage="Create technicians in the backend admin until full write APIs are available."
          columns={[
            { key: "code", header: "ID", render: (technician) => <span className="font-semibold text-slate-950">{technician.employee_code}</span> },
            { key: "name", header: "Name", render: (technician) => technician.display_name },
            { key: "phone", header: "Mobile", render: (technician) => technician.phone },
            { key: "verification", header: "Verification", render: (technician) => <AdminStatusBadge status={technician.background_verification_status ?? "PENDING"} /> },
            { key: "availability", header: "Availability", render: (technician) => <AdminStatusBadge status={technician.availability_status ?? (technician.is_available ? "AVAILABLE" : "OFFLINE")} /> },
            { key: "rating", header: "Rating", render: (technician) => technician.average_rating ?? "0.00" },
          ]}
        />
      )}
    </>
  );
}
