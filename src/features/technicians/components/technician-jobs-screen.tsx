"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarDays, Loader2, MapPin, Phone } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/features/auth/hooks";
import { getTechnicianNextAction } from "@/features/bookings/job-progress";
import { formatDisplayDateTime, getBookingAddressLine, getBookingSchedule, getBookingStatusLabel } from "@/features/bookings/utils";
import { technicianApi } from "@/lib/api/endpoints";
import type { Booking } from "@/types/api";

function serviceName(booking: Booking) {
  return typeof booking.service.name === "string" ? booking.service.name : "Service";
}

const operations = { "en-route": technicianApi.markEnRoute, arrived: technicianApi.markArrived, start: technicianApi.startJob, complete: technicianApi.completeJob };

export function TechnicianJobsScreen() {
  const { user, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [jobStatus, setJobStatus] = useState<"active" | "history">("active");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const jobs = useQuery({
    queryKey: ["technician", "jobs", jobStatus, page],
    queryFn: () => technicianApi.listJobs({ page, job_status: jobStatus }),
    enabled: user?.role === "TECHNICIAN",
    refetchInterval: 15_000,
    refetchOnWindowFocus: "always",
  });
  const update = useMutation({
    mutationFn: ({ booking, operation }: { booking: Booking; operation: keyof typeof operations }) => operations[operation](booking.id),
    onSuccess: async (booking) => {
      setMessage(`${booking.booking_number}: ${getBookingStatusLabel(booking.booking_status)} saved.`);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["technician", "jobs"] }),
        queryClient.invalidateQueries({ queryKey: ["bookings"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "bookings"] }),
      ]);
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ["technician", "jobs"] }),
  });

  if (isLoading) return <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!user || user.role !== "TECHNICIAN") {
    return <div className="mx-auto max-w-xl rounded-xl border border-border bg-white p-8 text-center"><h1 className="text-2xl font-bold">Technician access only</h1><p className="mt-2 text-secondary">Login with an active technician account to view assigned jobs.</p></div>;
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6">
      <h1 className="text-3xl font-bold text-foreground">My assigned jobs</h1>
      <p className="mt-2 text-secondary">Contact the customer and update each job as work progresses.</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button variant={jobStatus === "active" ? "default" : "outline"} onClick={() => { setJobStatus("active"); setPage(1); }}>Active jobs</Button>
        <Button variant={jobStatus === "history" ? "default" : "outline"} onClick={() => { setJobStatus("history"); setPage(1); }}>Job history</Button>
        <Button variant="outline" disabled={jobs.isFetching} onClick={() => void jobs.refetch()}>{jobs.isFetching ? "Refreshing…" : "Refresh"}</Button>
        <span className="text-xs text-secondary">Refreshes every 15 seconds.{jobs.dataUpdatedAt ? ` Last checked: ${formatDisplayDateTime(new Date(jobs.dataUpdatedAt).toISOString())}` : ""}</span>
      </div>
      {message ? <p className="mt-4 text-sm font-semibold text-success" role="status">{message}</p> : null}
      {update.isError ? <p className="mt-4 rounded-lg bg-red-50 p-4 text-sm text-red-700" role="alert">{update.error.message}</p> : null}
      {jobs.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div> : null}
      {jobs.isError ? <p className="mt-6 rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">{jobs.error.message}</p> : null}
      <div className="mt-6 grid gap-4">
        {jobs.data?.results.map((booking) => {
          const action = getTechnicianNextAction(booking.booking_status);
          const pending = update.isPending && update.variables?.booking.id === booking.id;
          return (
            <article key={booking.id} className="rounded-xl border border-border bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-primary">{booking.booking_number}</p>
                  <h2 className="mt-1 text-xl font-bold">{serviceName(booking)}</h2>
                  <p className="mt-1 text-sm font-semibold text-secondary">{booking.customer_name || "Customer"}</p>
                </div>
                <span className="w-fit rounded-full bg-primary-soft px-3 py-1 text-xs font-bold text-primary">{getBookingStatusLabel(booking.booking_status)}</span>
              </div>
              <div className="mt-5 grid gap-3 text-sm text-secondary sm:grid-cols-3">
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-primary" />{getBookingSchedule(booking)}</span>
                {booking.customer_phone ? <a className="flex items-center gap-2 font-semibold text-primary" href={`tel:${booking.customer_phone}`}><Phone className="h-4 w-4" />{booking.customer_phone}</a> : null}
                <span className="flex items-start gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{getBookingAddressLine(booking)}</span>
              </div>
              {action ? <Button className="mt-5" disabled={update.isPending || jobs.isError || jobs.isFetching} onClick={() => {
                if (action.operation === "complete" && !window.confirm("Mark this service as completed? Confirm the work is finished before continuing.")) return;
                setMessage("");
                update.mutate({ booking, operation: action.operation });
              }}>{pending ? "Updating…" : action.label}</Button> : null}
              <p className="mt-3 text-xs text-secondary">Last job update: {formatDisplayDateTime(booking.updated_at)}</p>
            </article>
          );
        })}
        {!jobs.isLoading && !jobs.isError && !jobs.data?.results.length ? <div className="rounded-xl border border-dashed border-border p-10 text-center text-secondary">{jobStatus === "active" ? "No active jobs are currently assigned to you." : "No job history yet."}</div> : null}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3">
        <Button variant="outline" disabled={page === 1 || jobs.isFetching} onClick={() => setPage(page - 1)}>Previous</Button>
        <span className="text-sm text-secondary">Page {page} · {jobs.data?.count ?? 0} jobs</span>
        <Button variant="outline" disabled={!jobs.data?.next || jobs.isFetching} onClick={() => setPage(page + 1)}>Next</Button>
      </div>
    </main>
  );
}
