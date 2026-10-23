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
        src="/images/brand/ps360-admin-logo-20261023.png"
        alt="Purple Squad 360"
        width={360}
        height={100}
        priority
        className={cn("h-[56px] w-[202px] shrink-0 rounded-lg object-contain", showDescriptor ? "mb-1" : "")}
      />
      {showDescriptor ? (
        <span className={cn("text-[10px] font-bold uppercase tracking-[0.18em]", dark ? "text-slate-400" : "text-slate-500")}>
          Admin Portal
        </span>
      ) : null}
    </Link>
  );
}
