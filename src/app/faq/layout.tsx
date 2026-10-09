import type { ReactNode } from "react";

import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/faq", "Frequently Asked Questions", "Answers about Purple Squad service booking, availability, payments, rescheduling and technician onboarding.");

export default function PublicLayout({ children }: { children: ReactNode }) {
  return children;
}
