"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ServiceImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
};

type FallbackVisual = {
  title: string;
  accent: string;
  image: string;
};

const fallbackPhotos: Record<string, FallbackVisual> = {
  washer: {
    title: "Washing Machine",
    accent: "Repair and service",
    image: "https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?auto=format&fit=crop&w=960&q=80",
  },
  fridge: {
    title: "Refrigerator",
    accent: "Cooling repair",
    image: "https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=960&q=80",
  },
  tv: {
    title: "TV Repair",
    accent: "Display and sound",
    image: "https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=960&q=80",
  },
  geyser: {
    title: "Geyser Service",
    accent: "Heating check",
    image: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=960&q=80",
  },
  purifier: {
    title: "Water Purifier",
    accent: "RO and UV service",
    image: "https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=960&q=80",
  },
  microwave: {
    title: "Microwave Oven",
    accent: "Heating repair",
    image: "https://images.unsplash.com/photo-1585659722983-3a681dabfc3d?auto=format&fit=crop&w=960&q=80",
  },
  dishwasher: {
    title: "Dishwasher",
    accent: "Wash and drain care",
    image: "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=960&q=80",
  },
  "wall-mount": {
    title: "TV Wall Mount",
    accent: "Secure fitting",
    image: "https://images.unsplash.com/photo-1601944179066-29786cb9d32a?auto=format&fit=crop&w=960&q=80",
  },
  cctv: {
    title: "CCTV Camera",
    accent: "Repair and setup",
    image: "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=960&q=80",
  },
  chimney: {
    title: "Chimney Cleaning",
    accent: "Grease removal",
    image: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=960&q=80",
  },
  "house-cleaning": {
    title: "Full House Cleaning",
    accent: "Deep home clean",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=960&q=80",
  },
  bathroom: {
    title: "Bathroom Cleaning",
    accent: "Tiles and fixtures",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=960&q=80",
  },
  "water-tank": {
    title: "Water Tank Cleaning",
    accent: "Sediment removal",
    image: "https://images.unsplash.com/photo-1521207418485-99c705420785?auto=format&fit=crop&w=960&q=80",
  },
  ac: {
    title: "AC Service",
    accent: "Cooling care",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=960&q=80",
  },
  repair: {
    title: "Appliance Repair",
    accent: "Expert technician",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=960&q=80",
  },
};

function getFallbackVisual(label: string): FallbackVisual {
  const text = label.toLowerCase();
  if (text.includes("washing")) return fallbackPhotos.washer;
  if (text.includes("refrigerator")) return fallbackPhotos.fridge;
  if (text.includes("wall mount")) return fallbackPhotos["wall-mount"];
  if (text.includes("tv")) return fallbackPhotos.tv;
  if (text.includes("geyser")) return fallbackPhotos.geyser;
  if (text.includes("purifier")) return fallbackPhotos.purifier;
  if (text.includes("microwave")) return fallbackPhotos.microwave;
  if (text.includes("dishwasher")) return fallbackPhotos.dishwasher;
  if (text.includes("cctv")) return fallbackPhotos.cctv;
  if (text.includes("chimney")) return fallbackPhotos.chimney;
  if (text.includes("full house")) return fallbackPhotos["house-cleaning"];
  if (text.includes("bathroom")) return fallbackPhotos.bathroom;
  if (text.includes("water tank")) return fallbackPhotos["water-tank"];
  if (text.includes("ac")) return fallbackPhotos.ac;
  return fallbackPhotos.repair;
}

function isLocalBackendImage(src?: string | null) {
  return Boolean(src?.startsWith("http://127.0.0.1:8000/") || src?.startsWith("http://localhost:8000/"));
}

export function ServiceImage({ src, alt, className, priority }: ServiceImageProps) {
  const [failed, setFailed] = useState(false);
  const hasUploadedImage = Boolean(src) && !failed;
  const fallback = getFallbackVisual(alt);
  const imageSrc = hasUploadedImage ? src ?? "" : fallback.image;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-primary-subtle", className)}>
      <Image
        src={imageSrc}
        alt={hasUploadedImage ? alt : fallback.title}
        fill
        priority={priority}
        unoptimized={isLocalBackendImage(imageSrc)}
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
        onError={() => setFailed(true)}
      />
      {!hasUploadedImage ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent">
          <div className="absolute bottom-3 left-3 right-3">
            <p className="inline-flex items-center gap-1 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
              <ShieldCheck className="h-3 w-3" />
              PS Verified
            </p>
            <p className="mt-2 text-sm font-bold text-white drop-shadow">{fallback.title}</p>
            <p className="text-xs font-semibold text-white/85">{fallback.accent}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
