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

type VisualKind =
  | "ac"
  | "washer"
  | "fridge"
  | "tv"
  | "geyser"
  | "purifier"
  | "microwave"
  | "dishwasher"
  | "wall-mount"
  | "cctv"
  | "chimney"
  | "house-cleaning"
  | "bathroom"
  | "water-tank"
  | "repair";

function getFallbackVisual(label: string): { kind: VisualKind; title: string; accent: string; className: string } {
  const text = label.toLowerCase();
  if (text.includes("washing")) {
    return {
      kind: "washer",
      title: "Washing Machine",
      accent: "Repair & service",
      className: "from-[#eef7ff] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  if (text.includes("refrigerator")) {
    return {
      kind: "fridge",
      title: "Refrigerator",
      accent: "Cooling care",
      className: "from-[#eefcf6] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  if (text.includes("wall mount")) {
    return {
      kind: "wall-mount",
      title: "TV Wall Mount",
      accent: "Secure fitting",
      className: "from-[#fff7ed] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  if (text.includes("tv")) {
    return {
      kind: "tv",
      title: "TV Repair",
      accent: "Display & sound",
      className: "from-[#f5f3ff] via-[#f8f5ff] to-[#eef7ff]",
    };
  }
  if (text.includes("geyser")) {
    return {
      kind: "geyser",
      title: "Geyser",
      accent: "Heating check",
      className: "from-[#fff7ed] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  if (text.includes("purifier")) {
    return {
      kind: "purifier",
      title: "Water Purifier",
      accent: "RO/UV service",
      className: "from-[#eff6ff] via-[#ffffff] to-[#f1ecff]",
    };
  }
  if (text.includes("microwave")) {
    return {
      kind: "microwave",
      title: "Microwave Oven",
      accent: "Heating repair",
      className: "from-[#fff7ed] via-[#ffffff] to-[#f1ecff]",
    };
  }
  if (text.includes("dishwasher")) {
    return {
      kind: "dishwasher",
      title: "Dishwasher",
      accent: "Drain & wash care",
      className: "from-[#eefcf6] via-[#ffffff] to-[#f1ecff]",
    };
  }
  if (text.includes("cctv")) {
    return {
      kind: "cctv",
      title: "CCTV",
      accent: "Camera setup",
      className: "from-[#f5f3ff] via-[#ffffff] to-[#eef7ff]",
    };
  }
  if (text.includes("chimney")) {
    return {
      kind: "chimney",
      title: "Chimney",
      accent: "Grease cleaning",
      className: "from-[#fff7ed] via-[#ffffff] to-[#f1ecff]",
    };
  }
  if (text.includes("full house")) {
    return {
      kind: "house-cleaning",
      title: "Full House",
      accent: "Complete cleaning",
      className: "from-[#eefcf6] via-[#ffffff] to-[#f1ecff]",
    };
  }
  if (text.includes("bathroom")) {
    return {
      kind: "bathroom",
      title: "Bathroom",
      accent: "Tile & fixture clean",
      className: "from-[#eff6ff] via-[#ffffff] to-[#f1ecff]",
    };
  }
  if (text.includes("water tank")) {
    return {
      kind: "water-tank",
      title: "Water Tank",
      accent: "Sediment cleaning",
      className: "from-[#eff6ff] via-[#ffffff] to-[#eefcf6]",
    };
  }
  if (text.includes("ac")) {
    return {
      kind: "ac",
      title: "AC Service",
      accent: text.includes("repair") ? "Cooling repair" : "Cooling care",
      className: "from-[#eef7ff] via-[#f8f5ff] to-[#f1ecff]",
    };
  }
  return {
    kind: "repair",
    title: "Home Appliance",
    accent: "Repair & service",
    className: "from-[#ffffff] via-[#f1ecff] to-[#eef7ff]",
  };
}

function ApplianceIllustration({ kind }: { kind: VisualKind }) {
  return (
    <svg viewBox="0 0 240 160" className="h-full w-full" role="img" aria-hidden="true">
      <defs>
        <linearGradient id={`ps-${kind}`} x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stopColor="#6C3BFF" />
          <stop offset="1" stopColor="#4220A8" />
        </linearGradient>
      </defs>
      <rect x="16" y="118" width="208" height="12" rx="6" fill="#E8E8EE" />
      {kind === "ac" ? (
        <>
          <rect x="38" y="38" width="164" height="44" rx="14" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M62 72h116" stroke="#6C3BFF" strokeWidth="5" strokeLinecap="round" />
          <path d="M78 92c16 18 32 18 48 0M132 92c14 16 28 16 42 0" stroke="#8A8A94" strokeWidth="5" strokeLinecap="round" fill="none" />
          <circle cx="180" cy="58" r="7" fill="#16A34A" />
        </>
      ) : null}
      {kind === "washer" ? (
        <>
          <rect x="72" y="26" width="96" height="106" rx="18" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <circle cx="120" cy="83" r="30" fill="#F1ECFF" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M100 86c12-12 28 12 40 0" stroke="#4220A8" strokeWidth="5" fill="none" strokeLinecap="round" />
          <circle cx="94" cy="44" r="5" fill="#16A34A" />
          <rect x="111" y="40" width="30" height="8" rx="4" fill="#E8E8EE" />
        </>
      ) : null}
      {kind === "fridge" ? (
        <>
          <rect x="78" y="18" width="84" height="118" rx="16" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M78 66h84" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M145 40v12M145 86v22" stroke="#4220A8" strokeWidth="5" strokeLinecap="round" />
          <path d="M58 46l-8 8 8 8M182 46l8 8-8 8" stroke="#8A8A94" strokeWidth="4" fill="none" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "tv" || kind === "wall-mount" ? (
        <>
          <rect x="42" y="30" width="156" height="86" rx="12" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <rect x="58" y="46" width="124" height="54" rx="8" fill="#F1ECFF" />
          <path d="M98 128h44M120 116v12" stroke="#4220A8" strokeWidth="6" strokeLinecap="round" />
          {kind === "wall-mount" ? <path d="M188 46h20v54h-20" stroke="#16A34A" strokeWidth="5" fill="none" strokeLinecap="round" /> : null}
        </>
      ) : null}
      {kind === "geyser" ? (
        <>
          <rect x="76" y="26" width="88" height="82" rx="22" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <circle cx="120" cy="70" r="17" fill="#F1ECFF" stroke="#4220A8" strokeWidth="5" />
          <path d="M94 108v18M146 108v18M103 42h34" stroke="#8A8A94" strokeWidth="5" strokeLinecap="round" />
          <path d="M112 70h16" stroke="#E53935" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "purifier" ? (
        <>
          <rect x="78" y="22" width="84" height="112" rx="18" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M96 54h48M96 74h48M96 94h48" stroke="#E8E8EE" strokeWidth="6" strokeLinecap="round" />
          <path d="M120 112c-14-14 14-30 0-44 18 16 20 34 0 44Z" fill="#6C3BFF" opacity=".9" />
        </>
      ) : null}
      {kind === "microwave" || kind === "dishwasher" ? (
        <>
          <rect x="42" y="44" width="156" height="76" rx="16" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <rect x="58" y="58" width="86" height="48" rx="10" fill="#F1ECFF" />
          <circle cx="168" cy="70" r="8" fill="#16A34A" />
          <circle cx="168" cy="94" r="8" fill="#E8E8EE" />
          {kind === "dishwasher" ? <path d="M70 86c18-14 36 14 54 0" stroke="#4220A8" strokeWidth="5" fill="none" strokeLinecap="round" /> : null}
        </>
      ) : null}
      {kind === "cctv" ? (
        <>
          <path d="M78 70h72l28 20-24 24-32-26H78z" fill="white" stroke="#6C3BFF" strokeWidth="5" strokeLinejoin="round" />
          <circle cx="144" cy="86" r="12" fill="#4220A8" />
          <path d="M84 70V48h74M158 48v18" stroke="#8A8A94" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "chimney" ? (
        <>
          <path d="M82 30h76l-10 48H92z" fill="white" stroke="#6C3BFF" strokeWidth="5" strokeLinejoin="round" />
          <path d="M62 78h116l-22 42H84z" fill="#F1ECFF" stroke="#4220A8" strokeWidth="5" strokeLinejoin="round" />
          <path d="M94 132c10-10 22-10 32 0M132 132c8-8 18-8 26 0" stroke="#8A8A94" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "house-cleaning" ? (
        <>
          <path d="M54 80l66-52 66 52v52H54z" fill="white" stroke="#6C3BFF" strokeWidth="5" strokeLinejoin="round" />
          <rect x="102" y="92" width="36" height="40" rx="8" fill="#F1ECFF" />
          <path d="M178 42l18 18M196 42l-18 18" stroke="#16A34A" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "bathroom" ? (
        <>
          <path d="M60 80h120v20c0 22-18 40-40 40H100c-22 0-40-18-40-40z" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M78 80V52c0-18 14-30 32-30h6" stroke="#4220A8" strokeWidth="5" fill="none" strokeLinecap="round" />
          <path d="M116 36h34M114 52h42" stroke="#8A8A94" strokeWidth="5" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "water-tank" ? (
        <>
          <ellipse cx="120" cy="38" rx="52" ry="18" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M68 38v72c0 10 23 20 52 20s52-10 52-20V38" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M92 88c18-14 38 14 56 0" stroke="#4220A8" strokeWidth="5" fill="none" strokeLinecap="round" />
        </>
      ) : null}
      {kind === "repair" ? (
        <>
          <circle cx="120" cy="76" r="46" fill="white" stroke="#6C3BFF" strokeWidth="5" />
          <path d="M99 96l48-48M94 54l22 22M124 84l22 22" stroke="#4220A8" strokeWidth="7" strokeLinecap="round" />
        </>
      ) : null}
    </svg>
  );
}

export function ServiceImage({ src, alt, className, priority }: ServiceImageProps) {
  const [failed, setFailed] = useState(false);
  const hasImage = Boolean(src) && !failed;
  const localBackendImage = src?.startsWith("http://127.0.0.1:8000/") || src?.startsWith("http://localhost:8000/");
  const fallback = getFallbackVisual(alt);

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
            <div className="w-full max-w-64 rounded-3xl border border-white/80 bg-white/80 p-3 text-center shadow-sm backdrop-blur">
              <div className="h-32">
                <ApplianceIllustration kind={fallback.kind} />
              </div>
              <p className="mt-3 text-sm font-bold text-foreground">{fallback.title}</p>
              <p className="mt-1 text-xs font-semibold text-secondary">{fallback.accent}</p>
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
