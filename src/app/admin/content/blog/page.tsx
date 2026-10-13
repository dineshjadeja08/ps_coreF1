import type { Metadata } from "next";

import { AdminBlogScreen } from "@/features/admin/components/admin-blog-screen";

export const metadata: Metadata = { title: "Home Care Guides | Admin" };

export default function AdminBlogPage() {
  return <AdminBlogScreen />;
}
