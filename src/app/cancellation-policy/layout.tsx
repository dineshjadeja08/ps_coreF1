import type { ReactNode } from "react";

import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/cancellation-policy", "Cancellation and Refund Policy", "Read Purple Squad cancellation, rescheduling and refund policies before booking your home service.");

export default function PublicLayout({ children }: { children: ReactNode }) {
  return children;
}
