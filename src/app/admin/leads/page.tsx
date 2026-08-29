import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Leads" };

export default function AdminLeadsPage() {
  return <AdminSectionPlaceholder title="Leads" description="Lead intake, follow-up, and conversion." missing="Missing backend API: leads list/create/update/detail/convert." />;
}
