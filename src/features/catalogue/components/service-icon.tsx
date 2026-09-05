"use client";

import { Wrench } from "lucide-react";
import Image from "next/image";

import { cn } from "@/lib/utils";

type ServiceIconProps = {
  label: string;
  className?: string;
  imageClassName?: string;
};

const iconMap = [
  { match: ["washing", "washer"], src: "/images/service-icons/washing-machine.webp" },
  { match: ["refrigerator", "fridge"], src: "/images/service-icons/refrigerator.webp" },
  { match: ["dishwasher"], src: "/images/service-icons/dishwasher.webp" },
  { match: ["microwave"], src: "/images/service-icons/microwave.webp" },
  { match: ["geyser"], src: "/images/service-icons/geyser.webp" },
  { match: ["purifier", "ro", "uv"], src: "/images/service-icons/water-purifier.webp" },
  { match: ["water tank", "tank cleaning"], src: "/images/service-icons/water-tank.webp" },
  { match: ["mosquito"], src: "/images/service-icons/mosquito-net.webp" },
  { match: ["sofa"], src: "/images/service-icons/sofa-repair.webp" },
  { match: ["tv", "television"], src: "/images/service-icons/tv.webp" },
  { match: ["ac", "air conditioner", "air conditioning", "appliance"], src: "/images/service-icons/ac.webp" },
];

export function getServiceIconSrc(label: string) {
  const normalized = label.toLowerCase();
  return iconMap.find((item) => item.match.some((keyword) => normalized.includes(keyword)))?.src ?? null;
}

export function ServiceIcon({ label, className, imageClassName }: ServiceIconProps) {
  const src = getServiceIconSrc(label);

  return (
    <span className={cn("relative grid h-16 w-16 place-items-center overflow-hidden rounded-sm bg-[#f5f5f5] text-primary", className)}>
      {src ? (
        <Image src={src} alt="" fill sizes="80px" className={cn("object-contain p-2", imageClassName)} />
      ) : (
        <Wrench className="h-7 w-7" aria-hidden="true" />
      )}
    </span>
  );
}
