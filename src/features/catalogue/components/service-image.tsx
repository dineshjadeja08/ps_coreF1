"use client";

import { Fan, Gauge, Hammer, PackageCheck, SearchCheck, ShieldCheck, Snowflake, SprayCan, Wrench } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ServiceImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
};

function getFallbackVisual(label: string) {
  const text = label.toLowerCase();
  if (text.includes("deep") || text.includes("clean")) {
    return {
      Icon: SprayCan,
      title: "Deep Clean",
      accent: "Fresh airflow",
      className: "from-[#eef7ff] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  if (text.includes("gas") || text.includes("refill")) {
    return {
      Icon: Gauge,
      title: "Gas Refill",
      accent: "Pressure check",
      className: "from-[#eefcf6] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  if (text.includes("install")) {
    return {
      Icon: PackageCheck,
      title: "Install",
      accent: "Secure setup",
      className: "from-[#fff7ed] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  if (text.includes("uninstall") || text.includes("removal")) {
    return {
      Icon: Hammer,
      title: "Removal",
      accent: "Safe handling",
      className: "from-[#f5f3ff] via-[#f8f5ff] to-[#eef7ff]",
    };
  }
  if (text.includes("inspect") || text.includes("visit")) {
    return {
      Icon: SearchCheck,
      title: "Inspection",
      accent: "Expert diagnosis",
      className: "from-[#f8f5ff] via-[#ffffff] to-[#eef7ff]",
    };
  }
  if (text.includes("cool") || text.includes("repair") || text.includes("leak")) {
    return {
      Icon: Wrench,
      title: "AC Repair",
      accent: "Issue fixing",
      className: "from-[#fff1f2] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  return {
    Icon: Fan,
    title: "AC Service",
    accent: "PS Verified",
    className: "from-[#ffffff] via-[#f1ecff] to-[#eef7ff]",
  };
}

export function ServiceImage({ src, alt, className, priority }: ServiceImageProps) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src) && !failed;
  const localBackendImage = src?.startsWith("http://127.0.0.1:8000/") || src?.startsWith("http://localhost:8000/");
  const fallback = getFallbackVisual(alt);
  const Icon = fallback.Icon;

  return (
    <div className={cn("relative overflow-hidden rounded-2xl bg-primary-subtle", className)}>
      {hasImage ? (
        <Image
          src={src ?? ""}
          alt={alt}
          fill
          priority={priority}
          unoptimized={localBackendImage}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={cn("absolute inset-0 overflow-hidden bg-gradient-to-br", fallback.className)}>
          <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-primary/10" />
          <div className="absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-primary/10" />
          <div className="absolute inset-0 grid place-items-center p-5">
            <div className="w-full max-w-56 rounded-3xl border border-white/80 bg-white/80 p-4 text-center shadow-sm backdrop-blur">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-primary text-primary-foreground shadow-[var(--shadow-soft)]">
                <Icon className="h-8 w-8" />
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">{fallback.title}</p>
              <p className="mt-1 text-xs font-semibold text-secondary">{fallback.accent}</p>
              <div className="mt-3 flex items-center justify-center gap-2 text-primary">
                <Snowflake className="h-4 w-4" />
                <Fan className="h-4 w-4" />
              </div>
            </div>
            <p className="absolute bottom-4 left-4 inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs font-bold text-primary shadow-sm">
              <ShieldCheck className="h-3 w-3" />
              PS Verified
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
