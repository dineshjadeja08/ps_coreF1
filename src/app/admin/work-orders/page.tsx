import type { Metadata } from "next";

import { AdminWorkOrdersScreen } from "@/features/admin/components/admin-work-orders-screen";

export const metadata: Metadata = { title: "Admin Work Orders" };

export default function AdminWorkOrdersPage() {
  return <AdminWorkOrdersScreen />;
}
