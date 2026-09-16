import type { Metadata } from "next";

import { AdminSchedulingScreen } from "@/features/admin/components/admin-scheduling-screen";

export const metadata: Metadata = { title: "Admin Scheduling" };

export default function AdminSchedulingPage() {
  return <AdminSchedulingScreen />;
}
