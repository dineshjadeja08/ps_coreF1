import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Staff" };

export default function AdminStaffPage() {
  return <AdminSectionPlaceholder title="Staff and Roles" description="Staff accounts and role permissions." missing="Missing backend API: staff list/update/group assignment." />;
}
