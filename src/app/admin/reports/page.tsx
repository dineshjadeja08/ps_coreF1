import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Reports" };

export default function AdminReportsPage() {
  return <AdminSectionPlaceholder title="Reports" description="Operational and finance reporting." missing="Missing backend API: report metrics and CSV exports." />;
}
