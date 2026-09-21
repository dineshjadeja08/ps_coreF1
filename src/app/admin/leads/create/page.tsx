import type { Metadata } from "next";

import { AdminLeadCreateScreen } from "@/features/admin/components/admin-lead-create-screen";

export const metadata: Metadata = { title: "Create Lead" };

export default function AdminCreateLeadPage() {
  return <AdminLeadCreateScreen />;
}
