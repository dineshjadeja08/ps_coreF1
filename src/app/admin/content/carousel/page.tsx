import type { Metadata } from "next";

import { AdminBannersScreen } from "@/features/admin/components/admin-catalogue-screens";

export const metadata: Metadata = { title: "Admin Carousel" };

export default function AdminCarouselPage() {
  return <AdminBannersScreen placement="PROMOTIONAL_CAROUSEL" title="Carousel" />;
}
