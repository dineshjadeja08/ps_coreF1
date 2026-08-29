import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Audit Logs" };

export default function AdminAuditLogsPage() {
  return <AdminSectionPlaceholder title="Audit Logs" description="Immutable operations audit history." missing="Missing backend API: audit log list/detail/export." />;
}
