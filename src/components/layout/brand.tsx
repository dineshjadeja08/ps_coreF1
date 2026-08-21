import Link from "next/link";

import { routes } from "@/constants/routes";

export function Brand() {
  return (
    <Link href={routes.home} className="flex items-center gap-2" aria-label="Purple Squad home">
      <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-sm font-black text-primary-foreground">
        PS
      </span>
      <span className="text-base font-bold text-foreground">Purple Squad</span>
    </Link>
  );
}
