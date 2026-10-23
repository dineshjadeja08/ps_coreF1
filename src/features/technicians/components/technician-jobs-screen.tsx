import { ArrowUpRight, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";

export function TechnicianJobsScreen() {
  return (
    <main className="mx-auto grid min-h-[70vh] max-w-2xl place-items-center px-4 py-12">
      <section className="w-full rounded-2xl border border-violet-100 bg-white p-8 text-center shadow-sm sm:p-12">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-violet-100 text-violet-700"><Smartphone className="h-8 w-8" /></span>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.16em] text-violet-700">PurplePartner</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">Manage your jobs in the PurplePartner app</h1>
        <p className="mx-auto mt-3 max-w-lg leading-7 text-slate-600">The technician web portal is no longer used for job updates. Please use the PurplePartner mobile app to accept assignments, update your arrival, verify the customer’s start OTP, and complete jobs.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button type="button" disabled aria-disabled="true" title="Store link will be added when the app listing is published">Google Play · link coming soon <ArrowUpRight className="h-4 w-4" /></Button>
          <Button type="button" variant="outline" disabled aria-disabled="true" title="Store link will be added when the app listing is published">App Store · link coming soon <ArrowUpRight className="h-4 w-4" /></Button>
        </div>
        <p className="mt-5 text-xs text-slate-500">Need help accessing the app? Contact your Purple Squad coordinator.</p>
      </section>
    </main>
  );
}
