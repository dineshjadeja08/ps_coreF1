import { Badge } from "@/components/ui/badge";

const toneByStatus: Record<string, string> = {
  PENDING_PAYMENT: "bg-amber-100 text-amber-800",
  PAYMENT_FAILED: "bg-red-100 text-red-800",
  CONFIRMED: "bg-blue-100 text-blue-800",
  TECHNICIAN_ASSIGNED: "bg-indigo-100 text-indigo-800",
  TECHNICIAN_EN_ROUTE: "bg-cyan-100 text-cyan-800",
  IN_PROGRESS: "bg-violet-100 text-violet-800",
  COMPLETED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-slate-200 text-slate-700",
  PAID: "bg-emerald-100 text-emerald-800",
  UNPAID: "bg-amber-100 text-amber-800",
  PARTIALLY_PAID: "bg-blue-100 text-blue-800",
  FAILED: "bg-red-100 text-red-800",
  AVAILABLE: "bg-emerald-100 text-emerald-800",
  VERIFIED: "bg-emerald-100 text-emerald-800",
  PENDING: "bg-amber-100 text-amber-800",
  SUSPENDED: "bg-red-100 text-red-800",
};

export function AdminStatusBadge({ status }: { status: string }) {
  return <Badge className={toneByStatus[status] ?? "bg-slate-100 text-slate-700"}>{status.replaceAll("_", " ")}</Badge>;
}
