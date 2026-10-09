import type { ReactNode } from "react";

import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/support", "Contact Purple Squad", "Contact Purple Squad for service booking, payments, rescheduling and appliance repair support in Chennai.");

export default function PublicLayout({ children }: { children: ReactNode }) {
  return children;
}
