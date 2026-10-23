import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { routes } from "@/constants/routes";

export const popularCategories = [
  { name: "Water Tank Cleaning", slug: "water-tank-cleaning", image: "/images/service-icons/water-tank.png" },
  { name: "Sofa Repair", slug: "sofa-repair-inspection-charge", image: "/images/service-icons/sofa-repair.png" },
  { name: "Mosquito Net", slug: "mosquito-net-inspection-charge", image: "/images/service-icons/mosquito-net.png" },
  { name: "AC Service", slug: "ac-services", image: "/images/service-icons/ac.png" },
  { name: "Washing Machine", slug: "washing-machine-repair-service", image: "/images/service-icons/washing-machine.png" },
  { name: "Refrigerator", slug: "refrigerator-repair-services", image: "/images/service-icons/refrigerator.png" },
  { name: "Water Purifier", slug: "water-purifier-repair-services", image: "/images/service-icons/water-purifier.png" },
  { name: "TV Repair", slug: "tv-repair-services", image: "/images/service-icons/tv.png" },
  { name: "Geyser", slug: "geyser-repair-services", image: "/images/service-icons/geyser.png" },
  { name: "Microwave", slug: "microwave-oven-repair-services", image: "/images/service-icons/microwave.png" },
  { name: "Dishwasher", slug: "dishwasher-repair-service", image: "/images/service-icons/dishwasher.png" },
  { name: "Chimney", slug: "chimney-cleaning-services", image: "/images/service-icons/chimney.jpg" },
] as const;

export function PopularServiceCategories({ areaSlug, city }: { areaSlug: string; city: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-xl font-bold sm:text-2xl">Popular service categories</h2>
        <Link href={routes.services} className="flex min-h-9 shrink-0 items-center gap-1 rounded-full border border-primary/30 px-3 text-xs font-bold text-primary transition hover:bg-primary-soft sm:text-sm">
          See all <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 sm:gap-3 lg:grid-cols-6">
        {popularCategories.map((item) => (
          <Link key={item.name} href={routes.localizedServiceCategory(item.slug, areaSlug, city)} className="group flex aspect-square min-w-0 flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white p-2 text-center shadow-[0_2px_8px_rgba(24,24,27,0.04)] transition hover:border-primary/40 hover:bg-primary-soft sm:p-4">
            <Image src={item.image} alt="" width={88} height={88} className="h-12 w-12 object-contain transition group-hover:scale-105 sm:h-16 sm:w-16" />
            <h3 className="line-clamp-2 text-xs font-semibold leading-4 group-hover:text-primary sm:text-sm">{item.name}</h3>
          </Link>
        ))}
      </div>
    </section>
  );
}
