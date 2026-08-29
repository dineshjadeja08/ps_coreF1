import type { Metadata } from "next";

import { AdminServicesScreen } from "@/features/admin/components/admin-catalogue-screens";

export const metadata: Metadata = {
  title: "Admin Services",
};

export default function AdminServicesPage() {
  return <AdminServicesScreen />;
}
