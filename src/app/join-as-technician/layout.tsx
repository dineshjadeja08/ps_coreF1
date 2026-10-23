import type { ReactNode } from "react";

import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/join-as-technician", "Join Purple Squad as a Technician", "Apply to work with Purple Squad. Share your appliance repair skills, experience and service city with our team.");

export default function PublicLayout({ children }: { children: ReactNode }) {
  return children;
}
