import type { Metadata } from "next";

import { AdminPackagesScreen } from "@/features/admin/components/admin-catalogue-screens";

export const metadata: Metadata = { title: "Admin Packages" };

export default function AdminPackagesPage() {
  return <AdminPackagesScreen />;
}
