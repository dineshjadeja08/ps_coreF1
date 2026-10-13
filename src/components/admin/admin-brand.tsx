import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

type AdminBrandProps = {
  className?: string;
  dark?: boolean;
  showDescriptor?: boolean;
};

export function AdminBrand({ className, dark = false, showDescriptor = true }: AdminBrandProps) {
  return (
    <Link
      href="/admin/dashboard"
      aria-label="PurpleSquad360 admin dashboard"
      className={cn("inline-flex min-w-0 flex-col items-start gap-1", className)}
    >
      <Image
        src="/images/brand/ps360-admin-logo.png"
        alt="Purple Squad 360"
        width={1280}
        height={1280}
        priority
        className={cn("w-[164px] shrink-0 rounded-lg object-cover", showDescriptor ? "h-[72px]" : "h-14")}
      />
      {showDescriptor ? (
        <span className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", dark ? "text-slate-400" : "text-slate-500")}>
          Admin Portal
        </span>
      ) : null}
    </Link>
  );
}
