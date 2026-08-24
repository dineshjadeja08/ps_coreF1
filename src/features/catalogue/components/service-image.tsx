"use client";

import { ShieldCheck, Wrench } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ServiceImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  priority?: boolean;
};

export function ServiceImage({ src, alt, className, priority }: ServiceImageProps) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src) && !failed;
  const localBackendImage = src?.startsWith("http://127.0.0.1:8000/") || src?.startsWith("http://localhost:8000/");

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
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_30%_20%,#ffffff_0,#f1ecff_42%,#f8f5ff_100%)]">
          <div className="text-center">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-surface text-primary shadow-sm">
              <Wrench className="h-8 w-8" />
            </div>
            <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-surface px-3 py-1 text-xs font-bold text-primary shadow-sm">
              <ShieldCheck className="h-3 w-3" />
              PS Verified
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
