"use client";

import { ShieldCheck } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { resolveServiceImage } from "@/lib/service-images";

type ServiceImageProps = {
  fit?: "cover" | "contain";
  src?: string | null;
  alt: string;
  fallbackLabel?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
};

function isLocalBackendImage(src?: string | null) {
  return Boolean(src?.startsWith("http://127.0.0.1:8000/") || src?.startsWith("http://localhost:8000/"));
}

export function ServiceImage({ src, alt, fallbackLabel = alt, className, imageClassName, priority, sizes = "(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw", fit = "cover" }: ServiceImageProps) {
  const [failed, setFailed] = useState(false);
  const { src: imageSrc, isFallback, fallback } = resolveServiceImage(failed ? null : src, fallbackLabel);
  const hasServiceImage = !isFallback;

  return (
    <div className={cn("relative overflow-hidden rounded-md bg-primary-subtle", className)}>
      <Image
        src={imageSrc}
        alt={alt}
        fill
        priority={priority}
        unoptimized={isLocalBackendImage(imageSrc)}
        sizes={sizes}
        className={cn(fit === "contain" ? "object-contain" : "object-cover", imageClassName)}
        onError={() => setFailed(true)}
      />
      {!hasServiceImage ? (
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent">
          <div className="absolute bottom-3 left-3 right-3">
            <p className="inline-flex items-center gap-1 rounded-sm bg-white/95 px-2.5 py-1 text-xs font-bold text-primary shadow-sm">
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
