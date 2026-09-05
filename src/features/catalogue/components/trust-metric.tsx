import type { LucideIcon } from "lucide-react";

export function TrustMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="min-w-[150px] rounded-md border border-border bg-surface p-4 shadow-sm">
      <Icon className="h-5 w-5 text-primary" />
      <p className="mt-3 text-xl font-bold text-foreground">{value}</p>
      <p className="mt-1 text-sm leading-5 text-secondary">{label}</p>
    </div>
  );
}
