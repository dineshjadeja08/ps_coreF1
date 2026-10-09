import type { ReactNode } from "react";

import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/terms", "Terms and Conditions", "Read the terms for Purple Squad service bookings, customer responsibilities, pricing and payments.");

export default function PublicLayout({ children }: { children: ReactNode }) {
  return children;
}
