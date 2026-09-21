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
      className={cn("inline-flex min-w-0 items-center gap-3", className)}
    >
      <span
        aria-hidden="true"
        className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-xl bg-gradient-to-br from-violet-500 via-violet-700 to-indigo-950 text-white shadow-[0_8px_24px_rgba(109,40,217,0.28)]"
      >
        <span className="text-base font-black italic tracking-[-0.16em]">PS</span>
        <span className="absolute bottom-1 right-1 rounded-full bg-white px-1 text-[7px] font-black leading-3 text-violet-800">
          360
        </span>
      </span>
      <span className="min-w-0 leading-none">
        <span className={cn("block truncate text-[17px] font-black tracking-[-0.04em]", dark ? "text-white" : "text-slate-950")}>
          PurpleSquad<span className="text-violet-600">360</span>
        </span>
        {showDescriptor ? (
          <span className={cn("mt-1.5 block text-[10px] font-bold uppercase tracking-[0.18em]", dark ? "text-slate-400" : "text-slate-500")}>
            Admin Portal
          </span>
        ) : null}
      </span>
    </Link>
  );
}
