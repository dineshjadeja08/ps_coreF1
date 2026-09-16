"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, MapPin, Phone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks";
import { technicianApi } from "@/lib/api/endpoints";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

function nextAction(booking: Booking) {
  if (booking.booking_status === "TECHNICIAN_ASSIGNED") return { label: "Start travelling", action: technicianApi.markEnRoute };
  if (booking.booking_status === "TECHNICIAN_EN_ROUTE") return { label: "Start service", action: technicianApi.startJob };
  if (booking.booking_status === "IN_PROGRESS") return { label: "Complete service", action: technicianApi.completeJob };
  return null;
}

export function TechnicianJobsScreen() {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const jobs = useQuery({
    queryKey: ["technician", "jobs"],
    queryFn: technicianApi.listJobs,
    enabled: user?.role === "TECHNICIAN",
  });
  const update = useMutation({
    mutationFn: ({ booking, action }: { booking: Booking; action: (id: string) => Promise<Booking> }) => action(booking.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["technician", "jobs"] }),
  });

  if (isLoading) return <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user || user.role !== "TECHNICIAN") {
    return <div className="mx-auto max-w-xl rounded-xl border border-border bg-white p-8 text-center"><h1 className="text-2xl font-bold">Technician access only</h1><p className="mt-2 text-secondary">Login with an active technician account to view assigned jobs.</p></div>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">My assigned jobs</h1>
      <p className="mt-2 text-secondary">Contact the customer and update each job as work progresses.</p>
      {jobs.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : null}
      {jobs.isError ? <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{jobs.error.message}</p> : null}
      <div className="mt-6 grid gap-4">
        {jobs.data?.results.map((booking) => {
          const action = nextAction(booking);
          const address = booking.address_snapshot as Record<string, unknown>;
          return (
            <article key={booking.id} className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">{booking.booking_number}</p>
                  <h2 className="mt-1 text-xl font-bold">{serviceName(booking)}</h2>
                  <p className="mt-1 text-sm font-semibold text-secondary">{booking.customer_name || "Customer"}</p>
                </div>
                <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{booking.booking_status.replaceAll("_", " ")}</span>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-secondary sm:grid-cols-3">
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 text-primary" />{booking.service_date}</span>
                {booking.customer_phone ? <a className="flex items-center gap-2 font-semibold text-primary" href={`tel:${booking.customer_phone}`}><Phone className="h-4 w-4" />{booking.customer_phone}</a> : null}
                <span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{String(address.address_line_1 || address.city || "Address available in booking")}</span>
              </div>
              {action ? <Button className="mt-5" disabled={update.isPending} onClick={() => update.mutate({ booking, action: action.action })}>{update.isPending ? "Updating…" : action.label}</Button> : null}
            </article>
          );
        })}
        {!jobs.isLoading && !jobs.data?.results.length ? <div className="rounded-xl border border-dashed border-border p-10 text-center text-secondary">No jobs are currently assigned to you.</div> : null}
      </div>
    </main>
  );
}
