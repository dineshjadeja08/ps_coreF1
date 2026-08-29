import type { Metadata } from "next";

import { AdminCategoriesScreen } from "@/features/admin/components/admin-catalogue-screens";

export const metadata: Metadata = {
  title: "Admin Categories",
};

export default function AdminCategoriesPage() {
  return <AdminCategoriesScreen />;
}
