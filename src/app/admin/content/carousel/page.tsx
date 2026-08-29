import type { Metadata } from "next";

import { AdminSectionPlaceholder } from "@/components/admin/admin-section-placeholder";

export const metadata: Metadata = { title: "Admin Carousel" };

export default function AdminCarouselPage() {
  return <AdminSectionPlaceholder title="Carousel" description="Homepage carousel slide management." missing="Missing backend API/model: carousel slides." />;
}
