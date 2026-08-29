import { Construction } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/admin-page-header";

export function AdminSectionPlaceholder({
  title,
  description,
  missing,
}: {
  title: string;
  description: string;
  missing?: string;
}) {
  return (
    <>
      <AdminPageHeader title={title} description={description} />
      <div className="rounded-lg border border-slate-200 bg-white p-8">
        <Construction className="h-8 w-8 text-violet-700" />
        <h2 className="mt-4 text-lg font-bold text-slate-950">Admin screen scaffold is ready</h2>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
          Navigation, protection, and layout are wired. This section needs the matching backend API before it can become fully editable without mock data.
        </p>
        {missing ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm font-semibold text-amber-800">{missing}</p> : null}
      </div>
    </>
  );
}
