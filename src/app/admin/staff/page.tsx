import type { Metadata } from "next";

import { AdminStaffScreen } from "@/features/admin/components/admin-system-screens";

export const metadata: Metadata = { title: "Admin Staff" };

export default function AdminStaffPage() {
  return <AdminStaffScreen />;
}
