import Link from "next/link";
import { maintenanceGuides } from "@/features/catalogue/maintenance-guides";
import { publicPageMetadata } from "@/lib/page-metadata";

export const metadata = publicPageMetadata("/guides", "Appliance care guides", "Practical appliance maintenance guides from Purple Squad. Understand symptoms, prepare for inspection and compare service packages in Chennai.");

export default function GuidesPage() {
  return <section className="page-container py-12"><h1 className="text-3xl font-bold">Appliance care guides</h1><p className="mt-3 text-secondary">Practical information to help you care for appliances and prepare for a service visit.</p><div className="mt-8 grid gap-5 sm:grid-cols-2">{Object.entries(maintenanceGuides).map(([slug, guide]) => <article key={slug} className="rounded-xl border border-border bg-white p-6"><h2 className="text-xl font-semibold"><Link href={`/guides/${slug}`} className="text-primary underline">{guide.title}</Link></h2><p className="mt-3 leading-7 text-secondary">{guide.description}</p></article>)}</div></section>;
}
