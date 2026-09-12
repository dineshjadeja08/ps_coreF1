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
  { match: ["washing", "washer"], src: "/images/service-icons/washing-machine.png" },
  { match: ["refrigerator", "fridge"], src: "/images/service-icons/refrigerator.png" },
  { match: ["dishwasher"], src: "/images/service-icons/dishwasher.png" },
  { match: ["microwave"], src: "/images/service-icons/microwave.png" },
  { match: ["geyser"], src: "/images/service-icons/geyser.png" },
  { match: ["purifier", "ro", "uv"], src: "/images/service-icons/water-purifier.png" },
  { match: ["water tank", "tank cleaning"], src: "/images/service-icons/water-tank.png" },
  { match: ["mosquito"], src: "/images/service-icons/mosquito-net.png" },
  { match: ["sofa"], src: "/images/service-icons/sofa-repair.png" },
  { match: ["cctv", "security camera"], src: "/images/service-icons/cctv.png" },
  { match: ["tv", "television"], src: "/images/service-icons/tv.png" },
  { match: ["ac", "air conditioner", "air conditioning", "appliance"], src: "/images/service-icons/ac.png" },
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
