import type { LucideIcon } from "lucide-react";

export function AdminEmptyState({ icon: Icon, title, message }: { icon: LucideIcon; title: string; message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <Icon className="mx-auto h-8 w-8 text-slate-400" />
      <h3 className="mt-3 text-sm font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}
