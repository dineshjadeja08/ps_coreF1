"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { MouseEvent, ReactNode } from "react";

import { saveIntendedRoute } from "@/features/auth/storage";
import { useAuth } from "@/features/auth/hooks";

type AuthActionLinkProps = {
  href: string;
  serviceSlug?: string;
  className?: string;
  children: ReactNode;
};

export function AuthActionLink({ href, serviceSlug, className, children }: AuthActionLinkProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    if (isLoading || isAuthenticated) return;
    event.preventDefault();
    saveIntendedRoute({ path: href, serviceSlug });
    router.push(`/login?returnTo=${encodeURIComponent(href)}`);
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
