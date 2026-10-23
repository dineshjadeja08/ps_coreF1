import Link from "next/link";
import { notFound } from "next/navigation";
import { JsonLd } from "@/components/seo/json-ld";
import { getMaintenanceGuide, maintenanceGuides } from "@/features/catalogue/maintenance-guides";
import { publicPageMetadata } from "@/lib/page-metadata";
import { breadcrumbJsonLd } from "@/lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(maintenanceGuides).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getMaintenanceGuide(slug);
  if (!guide) notFound();
  return publicPageMetadata(`/guides/${slug}`, guide.title, guide.description);
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = getMaintenanceGuide(slug);
  if (!guide) notFound();
  return <article className="page-container max-w-4xl py-12">
    <JsonLd data={breadcrumbJsonLd([{ name: "Home", path: "/" }, { name: "Appliance care guides", path: "/guides" }, { name: guide.title, path: `/guides/${slug}` }])} />
    <nav aria-label="Breadcrumb" className="mb-6 text-sm"><Link href="/guides" className="text-primary underline">Appliance care guides</Link></nav>
    <h1 className="text-3xl font-bold leading-tight">{guide.title}</h1><p className="mt-4 leading-7 text-secondary">{guide.description}</p>
    {guide.sections.map((section) => <section key={section.title} className="mt-8"><h2 className="text-xl font-semibold">{section.title}</h2><p className="mt-3 leading-7 text-secondary">{section.body}</p></section>)}
    <Link href={guide.servicePath} className="mt-8 inline-flex min-h-11 items-center rounded-lg bg-primary px-5 py-3 font-semibold text-white">{guide.serviceLabel}</Link>
  </article>;
}
