"use client";

import { Wrench } from "lucide-react";
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
    <div className={cn("relative overflow-hidden rounded-lg bg-primary-subtle", className)}>
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
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-16 w-16 place-items-center rounded-lg bg-surface text-primary shadow-sm">
            <Wrench className="h-8 w-8" />
          </div>
        </div>
      )}
    </div>
  );
}
