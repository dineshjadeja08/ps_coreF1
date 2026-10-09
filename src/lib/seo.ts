import { siteConfig } from "@/config/site";
import type { Review, ServiceDetail, ServiceListItem } from "@/features/catalogue/types";
import { getCurrentPrice } from "@/features/catalogue/utils";

// Secondary-city schema claims require operational confirmation.
export const serviceAreas = ["Chennai"];
export const defaultOgImagePath = "/images/hero/purple-squad-home-services-og.webp";

export function absoluteUrl(path = "/") {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalizedPath}`;
}

export function canonicalFor(path = "/") {
  const url = new URL(path, siteConfig.url);
  return `${siteConfig.url}${url.pathname === "/" ? "/" : url.pathname.replace(/\/$/, "")}`;
}

export function compactDescription(value?: string | null, fallback = siteConfig.description) {
  const text = value?.replace(/\s+/g, " ").trim() || fallback;
  return text.length > 158 ? `${text.slice(0, 155).trim()}...` : text;
}

export function localBusinessJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${siteConfig.url}/#localbusiness`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/purple-squad-favicon.png"),
    image: absoluteUrl(defaultOgImagePath),
    telephone: "+917676076361",
    email: "support@purplesquad.in",
    areaServed: serviceAreas.map((name) => ({
      "@type": "City",
      name,
    })),
    sameAs: [
      "https://www.linkedin.com/company/purplesquad",
      "https://www.instagram.com/purplesquad.in/",
      "https://www.facebook.com/profile.php?id=61593384331661",
      "https://www.youtube.com/@PurpleSquadOfficial",
    ],
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: canonicalFor(item.path),
    })),
  };
}

export function faqJsonLd(faqs: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
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

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteConfig.url}/#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    logo: absoluteUrl("/purple-squad-favicon.png"),
    telephone: "+917676076361",
    email: "support@purplesquad.in",
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
  // Admin-supplied testimonials are displayed, but aren't verified booking ratings.
  const visibleReviews = reviews?.slice(0, 5).filter((review) => review.is_visible && review.is_booking_review && Number.isFinite(review.rating) && review.rating >= 1 && review.rating <= 5) ?? [];
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${canonicalFor(path)}#service-${service.slug}`,
    name: service.name,
    description: compactDescription(("description" in service && service.description) || service.short_description || service.category.name),
    provider: {
      "@type": "Organization",
      "@id": `${siteConfig.url}/#localbusiness`,
      name: siteConfig.name,
      url: siteConfig.url,
    },
    areaServed: serviceAreas.map((name) => ({
      "@type": "City",
      name,
    })),
    category: service.category.name,
    url: canonicalFor(`/services/${service.slug}`),
    image: absoluteUrl(service.cover_image || defaultOgImagePath),
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: currentPrice !== null && currentPrice !== undefined && Number.isFinite(Number(currentPrice)) && Number(currentPrice) >= 0 ? String(currentPrice) : undefined,
      url: canonicalFor(`/services/${service.slug}`),
      availability: "https://schema.org/InStock",
    },
  };

  if (visibleReviews.length && visibleReviews.length === reviews?.slice(0, 5).filter((review) => review.is_visible).length) {
    const ratingValue = visibleReviews.reduce((total, review) => total + review.rating, 0) / visibleReviews.length;
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(ratingValue.toFixed(1)),
      reviewCount: visibleReviews.length,
    };
  }

  return schema;
}
