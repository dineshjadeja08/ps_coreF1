import type { ReactNode } from "react";

import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/privacy-policy", "Privacy Policy", "Learn how Purple Squad handles customer information, account data and service booking details.");

export default function PublicLayout({ children }: { children: ReactNode }) {
  return children;
}
