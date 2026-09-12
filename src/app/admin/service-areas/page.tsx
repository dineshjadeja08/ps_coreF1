import type { Metadata } from "next";

import { AdminServiceAreasScreen } from "@/features/admin/components/admin-service-areas-screen";

export const metadata: Metadata = { title: "Admin Service Areas" };

export default function AdminServiceAreasPage() {
  return <AdminServiceAreasScreen />;
}
