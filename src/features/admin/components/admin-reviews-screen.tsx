"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Save, Star } from "lucide-react";
import { useDeferredValue, useState } from "react";

import { AdminDataTable } from "@/components/admin/admin-data-table";
import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";
import type { AdminReview, AdminReviewRequest, AdminService } from "@/types/api";

type ReviewForm = AdminReviewRequest & { id?: string; isBookingReview?: boolean };
const pageSize = 25;
const selectClass = "h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm";

async function listReviewServices() {
  const services: AdminService[] = [];
  let page = 1;
  while (true) {
    const response = await adminApi.listServices({ page, page_size: 100 });
    services.push(...response.results);
    if (!response.next) return services;
    page += 1;
  }
}

export function AdminReviewsScreen() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const [service, setService] = useState("");
  const [visibility, setVisibility] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<ReviewForm | null>(null);
  const [selected, setSelected] = useState<AdminReview | null>(null);
  const services = useQuery({ queryKey: ["admin", "review-services"], queryFn: listReviewServices, staleTime: 2 * 60_000 });
  const query = useQuery({
    queryKey: ["admin", "reviews", deferredSearch, service, visibility, page],
    queryFn: () => adminApi.listReviews({ page, page_size: pageSize, search: deferredSearch || undefined, service: service || undefined, is_visible: visibility === "" ? undefined : visibility === "true" }),
  });
  async function refreshReviews() {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["admin", "reviews"] }),
      queryClient.invalidateQueries({ queryKey: ["catalogue"] }),
    ]);
  }
  const save = useMutation({
    mutationFn: (payload: ReviewForm) => {
      const body: AdminReviewRequest = { service: payload.service, reviewer_name: payload.reviewer_name.trim(), rating: Number(payload.rating), comment: payload.comment.trim(), is_visible: payload.is_visible };
      return payload.id ? adminApi.updateReview(payload.id, body) : adminApi.createReview(body);
    },
    onSuccess: async () => { setForm(null); setSelected(null); await refreshReviews(); },
  });
  const moderate = useMutation({
    mutationFn: (review: AdminReview) => adminApi.updateReview(review.id, { is_visible: !review.is_visible }),
    onSuccess: async () => { setSelected(null); await refreshReviews(); },
  });
  const remove = useMutation({
    mutationFn: adminApi.removeReview,
    onSuccess: async () => { setSelected(null); setPage(1); await refreshReviews(); },
  });
  function edit(review: AdminReview) {
    save.reset();
    setSelected(null);
    setForm({ id: review.id, service: review.service, reviewer_name: review.reviewer_name || (typeof review.customer.name === "string" ? review.customer.name : ""), rating: review.rating, comment: review.comment, is_visible: review.is_visible, isBookingReview: Boolean(review.booking) });
  }
  return (
    <>
      <AdminPageHeader title="Reviews" description="Add customer feedback to individual services and manage published reviews." action={<Button type="button" onClick={() => { save.reset(); setSelected(null); setForm({ service, reviewer_name: "", rating: 5, comment: "", is_visible: true }); }}><Plus className="h-4 w-4" />New review</Button>} />
      <div className="mb-5 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_220px_180px_auto]">
        <Input aria-label="Search reviews" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search name, service or review" />
        <select aria-label="Filter by service" className={selectClass} value={service} onChange={(event) => { setService(event.target.value); setPage(1); }}><option value="">All services</option>{services.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <select aria-label="Filter by visibility" className={selectClass} value={visibility} onChange={(event) => { setVisibility(event.target.value); setPage(1); }}><option value="">All reviews</option><option value="true">Visible</option><option value="false">Hidden</option></select>
        <Button type="button" variant="outline" onClick={() => { setSearch(""); setService(""); setVisibility(""); setPage(1); }}>Clear</Button>
      </div>
      {services.isError ? <AdminErrorState message="Could not load services. Retry before adding a review." onRetry={() => void services.refetch()} /> : null}
      {form ? (
        <section className="mb-5 rounded-lg border border-violet-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-bold text-slate-950">{form.id ? "Edit review" : "New review"}</h2><Button type="button" variant="ghost" disabled={save.isPending} onClick={() => setForm(null)}>Close</Button></div>
          <form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => { event.preventDefault(); save.mutate(form); }}>
            <label className="grid gap-2 text-sm font-semibold">Service<select className={selectClass} value={form.service} disabled={form.isBookingReview || services.isLoading || save.isPending} required onChange={(event) => setForm({ ...form, service: event.target.value })}><option value="">Select service</option>{services.data?.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="grid gap-2 text-sm font-semibold">Reviewer name<Input value={form.reviewer_name} maxLength={150} required={!form.isBookingReview} disabled={save.isPending} onChange={(event) => setForm({ ...form, reviewer_name: event.target.value })} placeholder="Customer name" /></label>
            <label className="grid gap-2 text-sm font-semibold">Rating<select className={selectClass} value={form.rating} disabled={save.isPending} onChange={(event) => setForm({ ...form, rating: Number(event.target.value) })}>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} / 5</option>)}</select></label>
            <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={form.is_visible} disabled={save.isPending} onChange={(event) => setForm({ ...form, is_visible: event.target.checked })} />Visible on service page</label>
            <label className="grid gap-2 text-sm font-semibold md:col-span-2">Review<textarea className="min-h-28 rounded-lg border border-slate-200 p-3 text-sm font-normal" value={form.comment} required disabled={save.isPending} onChange={(event) => setForm({ ...form, comment: event.target.value })} /></label>
            <div className="md:col-span-2"><Button type="submit" disabled={save.isPending || !form.service || services.isError}><Save className="h-4 w-4" />{save.isPending ? "Saving…" : "Save review"}</Button>{save.isError ? <p role="alert" className="mt-2 text-sm text-red-600">{save.error.message}</p> : null}</div>
          </form>
        </section>
      ) : null}
      {selected ? <section className="mb-5 rounded-lg border border-violet-200 bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-bold">{selected.service_name} · {selected.rating}/5</h2><Button type="button" variant="ghost" onClick={() => setSelected(null)}>Close</Button></div><p className="mt-3 whitespace-pre-wrap text-sm leading-6">{selected.comment}</p></section> : null}
      {moderate.isError || remove.isError ? <p role="alert" className="mb-4 text-sm text-red-600">{moderate.error?.message || remove.error?.message}</p> : null}
      {query.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div> : query.isError ? <AdminErrorState message={query.error.message} onRetry={() => void query.refetch()} /> : (
        <>
          <AdminDataTable rows={query.data?.results ?? []} getRowKey={(review) => review.id} emptyIcon={Star} emptyTitle="No reviews" emptyMessage="Add a review for a service, or view customer booking reviews." columns={[
            { key: "service", header: "Service", render: (review) => review.service_name },
            { key: "customer", header: "Reviewer", render: (review) => review.reviewer_name || (typeof review.customer.name === "string" && review.customer.name) || "Customer" },
            { key: "booking", header: "Source", render: (review) => review.booking_number || "Added by admin" },
            { key: "rating", header: "Rating", render: (review) => `${review.rating}/5` },
            { key: "comment", header: "Review", render: (review) => <button type="button" className="inline-block max-w-xs truncate text-left text-violet-700 hover:underline" onClick={() => { setForm(null); setSelected(review); }}>{review.comment}</button> },
            { key: "status", header: "Status", render: (review) => <AdminStatusBadge status={review.is_visible ? "VISIBLE" : "HIDDEN"} /> },
            { key: "actions", header: "Actions", render: (review) => <div className="flex gap-2"><Button type="button" variant="outline" size="sm" onClick={() => edit(review)}>Edit</Button><Button type="button" variant="outline" size="sm" disabled={moderate.isPending} onClick={() => moderate.mutate(review)}>{review.is_visible ? "Hide" : "Show"}</Button><Button type="button" variant="ghost" size="sm" disabled={remove.isPending} onClick={() => { if (window.confirm("Delete this review permanently?")) remove.mutate(review.id); }}>Delete</Button></div> },
          ]} />
          <AdminPagination count={query.data?.count ?? 0} page={page} pageSize={pageSize} hasNext={Boolean(query.data?.next)} hasPrevious={Boolean(query.data?.previous)} onPageChange={setPage} />
        </>
      )}
    </>
  );
}
