import Link from "next/link";
import Image from "next/image";

import { routes } from "@/constants/routes";

export function Brand() {
  return (
    <Link href={routes.home} className="flex items-center gap-2" aria-label="Purple Squad home">
      <Image
        src="/images/brand/purple-squad-logo-horizontal.png"
        alt="Purple Squad"
        width={762}
        height={327}
        priority
        className="h-10 w-auto object-contain"
      />
    </Link>
  );
}
