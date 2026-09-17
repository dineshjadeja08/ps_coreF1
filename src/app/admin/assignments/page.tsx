import type { Metadata } from "next";

import { AdminAssignmentsScreen } from "@/features/admin/components/admin-assignments-screen";

export const metadata: Metadata = {
  title: "Admin Assignments",
};

export default function AdminAssignmentsPage() {
  return <AdminAssignmentsScreen />;
}
