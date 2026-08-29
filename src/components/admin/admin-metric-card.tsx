import type { LucideIcon } from "lucide-react";

export function AdminMetricCard({
  icon: Icon,
  label,
  value,
  href,
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  href?: string;
}) {
  const content = (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-violet-200">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
        <Icon className="h-4 w-4 text-violet-700" />
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-950">{value}</p>
    </div>
  );

  if (!href) return content;
  return <a href={href}>{content}</a>;
}
