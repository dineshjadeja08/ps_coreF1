"use client";

import { BookOpen, Loader2, Package } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { adminApi } from "@/lib/api/endpoints";

export function AdminCategoriesScreen() {
  const query = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: adminApi.listCategories,
  });

  return (
    <>
      <AdminPageHeader title="Categories" description="Service category catalogue from the backend admin API." />
      {query.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
        </div>
      ) : query.isError ? (
        <AdminErrorState message={query.error instanceof Error ? query.error.message : "Categories unavailable."} onRetry={() => void query.refetch()} />
      ) : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(category) => category.id}
          emptyIcon={BookOpen}
          emptyTitle="No categories"
          emptyMessage="Catalogue categories will appear here."
          columns={[
            { key: "name", header: "Name", render: (category) => <span className="font-semibold text-slate-950">{category.name}</span> },
            { key: "slug", header: "Slug", render: (category) => category.slug },
            { key: "order", header: "Order", render: (category) => category.display_order ?? 0 },
            { key: "status", header: "Status", render: (category) => <AdminStatusBadge status={category.is_active ? "ACTIVE" : "INACTIVE"} /> },
          ]}
        />
      )}
    </>
  );
}

export function AdminServicesScreen() {
  const query = useQuery({
    queryKey: ["admin", "services"],
    queryFn: () => adminApi.listServices({ page_size: 25 }),
  });

  return (
    <>
      <AdminPageHeader title="Services" description="Manage service catalogue content, pricing, and media." />
      {query.isLoading ? (
        <div className="grid min-h-64 place-items-center">
          <Loader2 className="h-6 w-6 animate-spin text-violet-700" />
        </div>
      ) : query.isError ? (
        <AdminErrorState message={query.error instanceof Error ? query.error.message : "Services unavailable."} onRetry={() => void query.refetch()} />
      ) : (
        <AdminDataTable
          rows={query.data?.results ?? []}
          getRowKey={(service) => service.id}
          emptyIcon={Package}
          emptyTitle="No services"
          emptyMessage="Services will appear here once added."
          columns={[
            { key: "name", header: "Name", render: (service) => <span className="font-semibold text-slate-950">{service.name}</span> },
            { key: "category", header: "Category", render: (service) => service.category_detail.name },
            { key: "price", header: "Price", render: (service) => service.effective_price },
            { key: "advance", header: "Advance", render: (service) => service.advance_amount },
            { key: "status", header: "Status", render: (service) => <AdminStatusBadge status={service.is_active ? "ACTIVE" : "INACTIVE"} /> },
          ]}
        />
      )}
    </>
  );
}
