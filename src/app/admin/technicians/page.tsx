import type { Metadata } from "next";

import { AdminTechniciansScreen } from "@/features/admin/components/admin-technicians-screen";

export const metadata: Metadata = {
  title: "Admin Technicians",
};

export default function AdminTechniciansPage() {
  return <AdminTechniciansScreen />;
}
