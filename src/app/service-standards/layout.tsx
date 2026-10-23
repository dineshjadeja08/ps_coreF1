import type { ReactNode } from "react";

import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/service-standards", "Service Standards", "Learn about Purple Squad service standards, technician responsibilities, package pricing and customer support.");

export default function PublicLayout({ children }: { children: ReactNode }) {
  return children;
}
