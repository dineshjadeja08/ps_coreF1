import type { ReactNode } from "react";

import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/partner-support", "Technician Partner Support", "Contact Purple Squad for technician onboarding, service assignments and partner assistance.");

export default function PublicLayout({ children }: { children: ReactNode }) {
  return children;
}
