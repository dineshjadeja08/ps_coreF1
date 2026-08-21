import { Badge } from "@/components/ui/badge";
import type { ServiceListItem } from "@/features/catalogue/types";
import { formatPrice, getCurrentPrice, hasOfferPrice } from "@/features/catalogue/utils";

export function PriceDisplay({ service, compact = false }: { service: ServiceListItem; compact?: boolean }) {
  const current = formatPrice(getCurrentPrice(service));
  const base = formatPrice(service.base_price);
  const showBase = hasOfferPrice(service) && base && base !== current;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className={compact ? "text-lg font-bold text-foreground" : "text-2xl font-bold text-foreground"}>
        {current ?? "Price unavailable"}
      </span>
      {showBase ? <span className="text-sm text-muted-foreground line-through">{base}</span> : null}
      {showBase ? <Badge className="bg-destructive/10 text-destructive">Offer</Badge> : null}
    </div>
  );
}
