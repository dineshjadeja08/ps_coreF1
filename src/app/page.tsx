import type { Metadata } from "next";

import { HomeDiscovery } from "@/features/catalogue/components/home-discovery";

export const metadata: Metadata = {
  title: "Expert Home Services",
  description: "Discover Purple Squad home services, check service availability, search the catalogue, and compare pricing.",
};

export default function Home() {
  return <HomeDiscovery />;
}
