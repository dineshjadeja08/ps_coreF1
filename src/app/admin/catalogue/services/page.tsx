import type { Metadata } from "next";

import { AdminServicesScreen } from "@/features/admin/components/admin-catalogue-screens";

export const metadata: Metadata = {
  title: "Admin Services",
};

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; edit?: string; new?: string }>;
}) {
  const query = await searchParams;
  return (
    <AdminServicesScreen
      initialCategoryId={query.category}
      initialServiceId={query.edit}
      openNew={query.new === "1"}
    />
  );
}
