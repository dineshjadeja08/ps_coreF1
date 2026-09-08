import { siteConfig } from "@/config/site";
import type { Review, ServiceDetail, ServiceListItem } from "@/features/catalogue/types";
import { formatPrice, getCurrentPrice } from "@/features/catalogue/utils";

export const serviceAreas = ["Chennai", "Bangalore", "Coimbatore"];
export const defaultOgImagePath = "/images/hero/purple-squad-home-services-hero.png";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

export function canonicalFor(path = "/") {
  return absoluteUrl(path);
}

export function compactDescription(value?: string | null, fallback = siteConfig.description) {
  const text = value?.replace(/\s+/g, " ").trim() || fallback;
  return text.length > 158 ? `${text.slice(0, 155).trim()}...` : text;
}

export function localBusinessJsonLd(path = "/") {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    url: canonicalFor(path),
    image: absoluteUrl(defaultOgImagePath),
    telephone: "+917676076361",
    email: "support@purplesquad.in",
    areaServed: serviceAreas.map((name) => ({
      "@type": "City",
      name,
    })),
    priceRange: "₹₹",
    sameAs: [
      "https://www.linkedin.com/company/purplesquad",
      "https://www.instagram.com/purplesquad.in/",
      "https://www.facebook.com/profile.php?id=61593384331661",
      "https://www.youtube.com/@PurpleSquadOfficial",
    ],
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    url: siteConfig.url,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteConfig.url}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function servicesJsonLd(services: Array<ServiceListItem | ServiceDetail>, path: string, reviews?: Review[]) {
  return {
    "@context": "https://schema.org",
    "@graph": services.map((service) => serviceJsonLd(service, path, reviews)),
  };
}

export function serviceJsonLd(service: ServiceListItem | ServiceDetail, path: string, reviews?: Review[]) {
  const currentPrice = getCurrentPrice(service);
  const visibleReviews = reviews?.filter((review) => review.is_visible && Number.isFinite(review.rating)) ?? [];
  const schema: Record<string, unknown> = {
    "@type": "Service",
    "@id": `${canonicalFor(path)}#service-${service.slug}`,
    name: service.name,
    description: compactDescription(("description" in service && service.description) || service.short_description || service.category.name),
    provider: {
      "@id": `${siteConfig.url}/#localbusiness`,
    },
    areaServed: serviceAreas.map((name) => ({
      "@type": "City",
      name,
    })),
    category: service.category.name,
    url: canonicalFor(`/services/${service.slug}`),
    image: service.cover_image || absoluteUrl(defaultOgImagePath),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: currentPrice ? String(currentPrice) : undefined,
      url: canonicalFor(`/services/${service.slug}`),
      availability: "https://schema.org/InStock",
    },
    priceRange: formatPrice(currentPrice) ?? undefined,
  };

  if (visibleReviews.length) {
    const ratingValue = visibleReviews.reduce((total, review) => total + review.rating, 0) / visibleReviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount: visibleReviews.length,
    };
  }

  return schema;
}
