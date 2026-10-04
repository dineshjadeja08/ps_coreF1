import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { getSeoLandingPageForSeo, getSeoLandingPagesForSeo } from "@/features/catalogue/server";
import { formatPrice, getCurrentPrice } from "@/features/catalogue/utils";
import { breadcrumbJsonLd, canonicalFor, faqJsonLd, localBusinessJsonLd, servicesJsonLd } from "@/lib/seo";

type SeoLandingPageProps = {
  params: Promise<{ serviceSlug: string; areaSlug?: string[] }>;
};

function pageSlug(serviceSlug: string, areaSlug?: string[]) {
  if (areaSlug && areaSlug.length > 1) return null;
  return [serviceSlug, areaSlug?.[0]].filter(Boolean).join("/");
}

export async function generateStaticParams() {
  const pages = await getSeoLandingPagesForSeo();
  return pages.map((page) => {
    const [serviceSlug, area] = page.page_slug.split("/");
    return { serviceSlug, areaSlug: area ? [area] : [] };
  });
}

export async function generateMetadata({ params }: SeoLandingPageProps): Promise<Metadata> {
  const values = await params;
  const slug = pageSlug(values.serviceSlug, values.areaSlug);
  const page = slug ? await getSeoLandingPageForSeo(slug) : null;
  if (!page) return { title: "Page not found", robots: { index: false, follow: false } };

  return {
    title: page.meta_title.replace(/\s*\|\s*Purple Squad$/i, ""),
    description: page.meta_description,
    alternates: { canonical: page.canonical_override || canonicalFor(page.path) },
    robots: { index: page.is_indexable, follow: true },
    openGraph: {
      type: "website",
      title: page.meta_title,
      description: page.meta_description,
      url: canonicalFor(page.path),
    },
    twitter: {
      card: "summary_large_image",
      title: page.meta_title,
      description: page.meta_description,
    },
  };
}

export default async function SeoLandingPage({ params }: SeoLandingPageProps) {
  const values = await params;
  const slug = pageSlug(values.serviceSlug, values.areaSlug);
  const page = slug ? await getSeoLandingPageForSeo(slug) : null;
  if (!page || page.page_slug !== slug) notFound();

  const parentName = `${page.service_name} in ${page.city}`;
  const currentName = page.area ? `${page.service_name} in ${page.area}` : parentName;
  const breadcrumbs = [
    { name: "Home", path: "/" },
    ...(page.area && page.parent_page ? [{ name: parentName, path: page.parent_page.path }] : []),
    { name: currentName, path: page.path },
  ];
  const bookingHref = page.services.length === 1
    ? `/services/${page.services[0].slug}`
    : `/services?category=${page.category_slug}`;

  return (
    <>
      <JsonLd
        data={[
          localBusinessJsonLd(),
          breadcrumbJsonLd(breadcrumbs),
          servicesJsonLd(page.services, page.path),
          ...(page.faqs.length ? [faqJsonLd(page.faqs)] : []),
        ]}
      />

      <main className="bg-background pb-16">
        <section className="border-b border-border bg-gradient-to-br from-primary-subtle via-white to-white">
          <div className="page-container py-10 sm:py-14 lg:py-16">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-secondary">
              {breadcrumbs.map((item, index) => (
                <span key={item.path} className="flex items-center gap-2">
                  {index ? <span aria-hidden="true">/</span> : null}
                  {index === breadcrumbs.length - 1 ? (
                    <span aria-current="page" className="font-semibold text-foreground">{item.name}</span>
                  ) : (
                    <Link href={item.path} className="hover:text-primary">{item.name}</Link>
                  )}
                </span>
              ))}
            </nav>

            <div className="mt-7 max-w-3xl">
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">Doorstep home service</p>
              <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">{page.h1}</h1>
              <p className="mt-5 text-base leading-8 text-secondary sm:text-lg">{page.intro_content}</p>
              {page.postal_code ? <p className="mt-3 text-sm font-semibold text-secondary">Service PIN code: {page.postal_code}</p> : null}
              <Link href={bookingHref} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-lg bg-primary px-6 py-3 font-bold text-primary-foreground shadow-sm transition hover:opacity-90">
                Book {page.service_name}
              </Link>
            </div>
          </div>
        </section>

        <div className="page-container space-y-14 py-12">
          <section aria-labelledby="available-services">
            <div className="max-w-3xl">
              <h2 id="available-services" className="text-2xl font-bold text-foreground">{page.service_name} options {page.area ? `in ${page.area}` : `across ${page.city}`}</h2>
              <p className="mt-3 leading-7 text-secondary">{page.pricing_intro}</p>
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {page.services.map((service) => (
                <article key={service.id} className="rounded-xl border border-border bg-surface p-5 shadow-sm">
                  <h3 className="text-lg font-bold text-foreground">{service.name}</h3>
                  <p className="mt-2 min-h-12 text-sm leading-6 text-secondary">{service.short_description || service.category.name}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="font-bold text-primary">{formatPrice(getCurrentPrice(service)) ?? "Request price"}</span>
                    <Link href={`/services/${service.slug}`} className="font-semibold text-primary hover:underline">View service</Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="grid gap-5 lg:grid-cols-3" aria-labelledby="how-it-works">
            <div className="lg:col-span-3"><h2 id="how-it-works" className="text-2xl font-bold text-foreground">How the service works</h2></div>
            {[
              ["1", "Choose a service", "Select the option that best matches the work required and review the current price."],
              ["2", "Confirm your address", "Use address search or location detection so availability is checked for the correct pincode."],
              ["3", "Schedule the visit", "Choose an available slot. Any additional approved work is explained before it begins."],
            ].map(([number, title, description]) => (
              <article key={number} className="rounded-xl border border-border bg-surface p-5">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-bold text-white">{number}</span>
                <h3 className="mt-4 font-bold text-foreground">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-secondary">{description}</p>
              </article>
            ))}
          </section>

          {page.coverage_areas.length ? (
            <section aria-labelledby="coverage">
              <h2 id="coverage" className="text-2xl font-bold text-foreground">Service coverage around {page.area}</h2>
              <p className="mt-3 text-secondary">Availability is confirmed against the exact address and active service pincode during booking.</p>
              <ul className="mt-5 flex flex-wrap gap-3">
                {page.coverage_areas.map((area) => <li key={area} className="rounded-full border border-primary/20 bg-primary-subtle px-4 py-2 text-sm font-semibold text-foreground">{area}</li>)}
              </ul>
            </section>
          ) : null}

          <section className="grid gap-5 rounded-xl bg-foreground p-6 text-white sm:p-8 lg:grid-cols-3" aria-labelledby="why-purple-squad">
            <div className="lg:col-span-3"><h2 id="why-purple-squad" className="text-2xl font-bold">Why choose Purple Squad</h2></div>
            <div><h3 className="font-bold">Clear catalogue pricing</h3><p className="mt-2 text-sm leading-6 text-white/75">Review the listed service price before continuing to booking.</p></div>
            <div><h3 className="font-bold">Address-based availability</h3><p className="mt-2 text-sm leading-6 text-white/75">Serviceability is checked against active Purple Squad pincodes.</p></div>
            <div><h3 className="font-bold">Approval before extra work</h3><p className="mt-2 text-sm leading-6 text-white/75">Additional repair or material costs are explained before work proceeds.</p></div>
          </section>

          <section className="rounded-xl border border-border bg-surface p-6 sm:p-8" aria-labelledby="service-policy">
            <h2 id="service-policy" className="text-2xl font-bold text-foreground">Service and warranty policy</h2>
            <p className="mt-3 max-w-4xl leading-7 text-secondary">The applicable scope, exclusions and any service-specific warranty are shown with the selected catalogue service. Additional repair or material work proceeds only after the customer reviews and approves the estimate.</p>
            <Link href="/service-standards" className="mt-4 inline-flex font-semibold text-primary hover:underline">Read Purple Squad service standards</Link>
          </section>

          {page.faqs.length ? (
            <section className="max-w-4xl" aria-labelledby="local-faqs">
              <h2 id="local-faqs" className="text-2xl font-bold text-foreground">Frequently asked questions</h2>
              <div className="mt-5 divide-y divide-border rounded-xl border border-border bg-surface px-5">
                {page.faqs.map((faq) => (
                  <details key={faq.question} className="group py-4">
                    <summary className="cursor-pointer list-none pr-6 font-semibold text-foreground">{faq.question}</summary>
                    <p className="mt-3 pb-1 text-sm leading-6 text-secondary">{faq.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}

          <SeoLinks title={page.area ? "Related services" : `Areas served for ${page.service_name}`} links={page.area ? page.related_pages : page.area_pages} />
          <SeoLinks title="Nearby service areas" links={page.nearby_pages} />

          <section className="rounded-xl border border-primary/20 bg-primary-subtle p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-foreground">Ready to book {page.service_name.toLowerCase()}?</h2>
            <p className="mt-3 text-secondary">Choose the service, confirm your exact address and select a convenient appointment slot.</p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link href={bookingHref} className="inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-2 font-bold text-white">Book now</Link>
              <Link href="/service-standards" className="inline-flex min-h-11 items-center rounded-lg border border-border bg-white px-5 py-2 font-semibold text-foreground">Service policy</Link>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

function SeoLinks({ title, links }: { title: string; links: Array<{ name: string; path: string; area: string; postal_code: string }> }) {
  if (!links.length) return null;
  return (
    <section aria-label={title}>
      <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      <div className="mt-4 flex flex-wrap gap-3">
        {links.map((link) => (
          <Link key={link.path} href={link.path} className="rounded-lg border border-border bg-surface px-4 py-3 text-sm font-semibold text-foreground transition hover:border-primary/40 hover:text-primary">
            <span>{link.name}</span>
            {link.postal_code ? <span className="ml-2 text-xs font-medium text-secondary">{link.postal_code}</span> : null}
          </Link>
        ))}
      </div>
    </section>
  );
}
