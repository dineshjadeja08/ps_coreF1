import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Customers" };

export default function AdminCustomersPage() {
  return <AdminSectionPlaceholder title="Customers" description="Unified customer history and support notes." missing="Missing backend API: customers list/detail/history/support notes." />;
}
