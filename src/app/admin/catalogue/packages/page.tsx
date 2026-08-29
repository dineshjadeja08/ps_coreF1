import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Packages" };

export default function AdminPackagesPage() {
  return <AdminSectionPlaceholder title="Packages" description="Package configuration for service bundles." missing="Missing backend model/API: packages are currently represented by services only." />;
}
