"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { routes } from "@/constants/routes";
import type { ServiceListItem } from "@/features/catalogue/types";
import { formatPrice, getCurrentPrice } from "@/features/catalogue/utils";
import { cn } from "@/lib/utils";

type ServiceSearchProps = {
  services: ServiceListItem[];
  initialValue?: string;
  className?: string;
  compact?: boolean;
  inputId?: string;
  placeholder?: string;
};

export function ServiceSearch({
  services,
  initialValue = "",
  className,
  compact = false,
  inputId = "service-search",
  placeholder = "Search for AC repair, cleaning, installation...",
}: ServiceSearchProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialValue);
  const [focused, setFocused] = useState(false);
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  const rotatingPlaceholders = useMemo(() => {
    const names = services
      .map((service) => service.name)
      .filter(Boolean)
      .slice(0, 6);

    const fallback = ["AC service", "Washing machine repair", "Refrigerator repair", "Bathroom cleaning", "Water purifier service", "TV repair"];
    return (names.length ? names : fallback).map((name) => `Search for ${name}`);
  }, [services]);

  const suggestions = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return [];

    return services
      .filter((service) => {
        return (
          service.name.toLowerCase().includes(term) ||
          service.short_description.toLowerCase().includes(term) ||
          service.category.name.toLowerCase().includes(term)
        );
      })
      .slice(0, 5);
  }, [query, services]);

  useEffect(() => {
    if (query.trim() || rotatingPlaceholders.length <= 1) return;

    const timer = window.setInterval(() => {
      setPlaceholderIndex((current) => (current + 1) % rotatingPlaceholders.length);
    }, 2200);

    return () => window.clearInterval(timer);
  }, [query, rotatingPlaceholders.length]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(trimmed ? `${routes.search}?q=${encodeURIComponent(trimmed)}` : routes.search);
  }

  return (
    <form onSubmit={handleSubmit} className={cn("relative", className)}>
      <label className="sr-only" htmlFor={inputId}>
        Search services
      </label>
      <Search className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id={inputId}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => window.setTimeout(() => setFocused(false), 120)}
        placeholder={query ? placeholder : rotatingPlaceholders[placeholderIndex] ?? placeholder}
        className={cn("rounded-lg pl-9", compact ? "h-10" : "h-12 text-base")}
        autoComplete="off"
      />
      {focused && suggestions.length > 0 ? (
        <div className="absolute left-0 right-0 top-full z-30 mt-2 overflow-hidden rounded-md border border-border bg-surface shadow-[var(--shadow-card)]">
          {suggestions.map((service) => (
            <Link
              key={service.id}
              href={routes.serviceDetail(service.slug)}
              className="block border-b border-border px-4 py-3 last:border-b-0 hover:bg-primary-subtle"
            >
              <span className="block text-sm font-semibold text-foreground">{service.name}</span>
              <span className="mt-1 flex items-center justify-between gap-3 text-xs text-secondary">
                <span>{service.category.name}</span>
                <span>{formatPrice(getCurrentPrice(service))}</span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </form>
  );
}
