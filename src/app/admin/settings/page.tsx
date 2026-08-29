import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Settings" };

export default function AdminSettingsPage() {
  return <AdminSectionPlaceholder title="Settings" description="Operational configuration." missing="Missing backend API: configurable business settings." />;
}
