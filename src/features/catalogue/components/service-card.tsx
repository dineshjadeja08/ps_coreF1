import { Clock, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { routes } from "@/constants/routes";
import { AuthActionLink } from "@/features/auth/components/auth-action-link";
import type { ServiceListItem } from "@/features/catalogue/types";
import { formatDuration } from "@/features/catalogue/utils";

import { PriceDisplay } from "./price-display";
import { ServiceImage } from "./service-image";

export function ServiceCard({ service }: { service: ServiceListItem }) {
  const duration = formatDuration(service.estimated_duration_minutes);

  return (
    <article className="group overflow-hidden rounded-md border border-border bg-surface shadow-sm transition hover:-translate-y-1 hover:border-primary/30 hover:shadow-[var(--shadow-card)]">
      <Link href={routes.serviceDetail(service.slug)} aria-label={`View ${service.name}`}>
        <ServiceImage src={service.cover_image} alt={service.name} className="aspect-[4/3] rounded-none" />
      </Link>
      <div className="space-y-3 p-4">
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            <Badge>
              <ShieldCheck className="h-3 w-3" />
              PS Verified
            </Badge>
            {service.is_featured || service.is_popular ? (
              <Badge className="bg-warning/10 text-warning">
                <Sparkles className="h-3 w-3" />
                Featured
              </Badge>
            ) : null}
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            <Link href={routes.serviceDetail(service.slug)} className="hover:text-primary">
              {service.name}
            </Link>
          </h3>
          <p className="line-clamp-1 text-sm leading-5 text-secondary">{service.short_description || service.category.name}</p>
        </div>
        {duration ? (
          <div className="flex items-center gap-2 text-sm text-secondary">
            <Clock className="h-4 w-4 text-primary" />
            {duration}
          </div>
        ) : null}
        <div className="flex items-end justify-between gap-3">
          <PriceDisplay service={service} compact />
          <Button asChild size="sm">
            <AuthActionLink href={`/book?service=${encodeURIComponent(service.slug)}`} serviceSlug={service.slug}>
              Book Now
            </AuthActionLink>
          </Button>
        </div>
      </div>
    </article>
  );
}
