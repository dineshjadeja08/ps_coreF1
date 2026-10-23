"use client";

import Image from "next/image";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, FileText, Loader2, ShieldCheck, X, XCircle } from "lucide-react";
import { useState } from "react";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminApi } from "@/lib/api/endpoints";
import type { TechnicianKycDocument, TechnicianProfile } from "@/types/api";

const docLabels: Record<TechnicianKycDocument["doc_type"], string> = {
  AADHAAR_FRONT: "Aadhaar · front",
  AADHAAR_BACK: "Aadhaar · back",
  PAN: "PAN card",
  PHOTO: "Profile photo",
  CERTIFICATE: "Certificate",
};

function servicesSummary(profile: TechnicianProfile) {
  return profile.supported_services?.map((service) => service.name).join(", ") || profile.skills?.map((skill) => skill.name).join(", ") || "Not specified";
}

function isPdf(url: string) {
  try { return new URL(url).pathname.toLowerCase().endsWith(".pdf"); } catch { return url.toLowerCase().split("?")[0].endsWith(".pdf"); }
}

export function AdminPartnerKycScreen() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [note, setNote] = useState("");
  const [enlarged, setEnlarged] = useState<TechnicianKycDocument | null>(null);
  const list = useQuery({
    queryKey: ["admin", "technicians", "kyc", "UNDER_REVIEW"],
    queryFn: () => adminApi.listTechniciansForKyc("UNDER_REVIEW"),
    refetchInterval: 30_000,
  });
  const detail = useQuery({
    queryKey: ["admin", "technicians", "kyc", selectedId],
    queryFn: () => adminApi.getTechnicianKyc(selectedId!),
    enabled: Boolean(selectedId),
  });
  const decision = useMutation({
    mutationFn: (choice: "APPROVE" | "REJECT") => adminApi.decideTechnicianKyc(selectedId!, { decision: choice, ...(choice === "REJECT" ? { note: note.trim() } : {}) }),
    onSuccess: async () => {
      setSelectedId(null);
      setNote("");
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["admin", "technicians", "kyc"] }),
        queryClient.invalidateQueries({ queryKey: ["admin", "technicians"] }),
      ]);
    },
  });

  return <>
    <AdminPageHeader title="Partner KYC" description="Review submitted partner identity documents before approving field access." action={<span className="rounded-full bg-violet-100 px-3 py-1.5 text-sm font-bold text-violet-800">{list.data?.length ?? 0} pending</span>} />
    {list.isLoading ? <div className="grid min-h-48 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div> : list.isError ? <AdminErrorState message={list.error.message || "KYC queue unavailable."} onRetry={() => void list.refetch()} /> : (
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-4 py-3"><h2 className="font-bold">Under review</h2><p className="text-xs text-slate-500">{list.data?.length ?? 0} partner{list.data?.length === 1 ? "" : "s"} waiting for a decision</p></div>
          <div className="divide-y divide-slate-100">
            {(list.data ?? []).map((profile) => <button type="button" key={profile.id} onClick={() => { setSelectedId(profile.id); setNote(""); }} className={`block w-full px-4 py-4 text-left transition hover:bg-violet-50 ${selectedId === profile.id ? "bg-violet-50" : ""}`}>
              <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-bold text-slate-950">{profile.display_name}</p><p className="mt-0.5 text-sm text-slate-600">{profile.phone}</p><p className="mt-1 text-xs text-slate-500">{profile.city || "City not provided"} · {servicesSummary(profile)}</p></div><AdminStatusBadge status="UNDER_REVIEW" /></div>
              <p className="mt-2 text-xs text-slate-500">Submitted {profile.kyc_submitted_at ? new Date(profile.kyc_submitted_at).toLocaleString("en-IN") : "time unavailable"}</p>
            </button>)}
            {!list.data?.length ? <div className="p-8 text-center"><ShieldCheck className="mx-auto h-8 w-8 text-emerald-600" /><p className="mt-2 font-semibold">KYC queue is clear</p><p className="text-sm text-slate-500">New partner submissions will appear here.</p></div> : null}
          </div>
        </section>

        <section className="min-h-72 rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
          {!selectedId ? <div className="grid min-h-64 place-items-center text-center text-slate-500"><div><FileText className="mx-auto h-8 w-8" /><p className="mt-2 text-sm">Select a partner to inspect their profile and documents.</p></div></div> : detail.isLoading ? <div className="grid min-h-64 place-items-center"><Loader2 className="h-6 w-6 animate-spin text-violet-700" /></div> : detail.isError || !detail.data ? <AdminErrorState message={detail.error?.message || "Could not load KYC details."} onRetry={() => void detail.refetch()} /> : <>
            <div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{detail.data.profile.display_name}</h2><p className="text-sm text-slate-600">{detail.data.profile.phone} · {detail.data.profile.city || "City not provided"}</p></div><AdminStatusBadge status={detail.data.profile.background_verification_status || "UNDER_REVIEW"} /></div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm"><div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Services</dt><dd className="mt-1 font-medium">{servicesSummary(detail.data.profile)}</dd></div><div className="rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Submitted</dt><dd className="mt-1 font-medium">{detail.data.profile.kyc_submitted_at ? new Date(detail.data.profile.kyc_submitted_at).toLocaleString("en-IN") : "—"}</dd></div>{detail.data.profile.address ? <div className="col-span-2 rounded-lg bg-slate-50 p-3"><dt className="text-xs text-slate-500">Address</dt><dd className="mt-1 font-medium">{detail.data.profile.address}</dd></div> : null}</dl>
            <h3 className="mt-5 font-bold">Submitted documents ({detail.data.documents.length})</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">{detail.data.documents.map((doc) => <article key={doc.id} className="overflow-hidden rounded-lg border border-slate-200"><div className="flex items-center justify-between gap-2 bg-slate-50 px-3 py-2"><p className="text-sm font-semibold">{docLabels[doc.doc_type] ?? doc.doc_type.replaceAll("_", " ")}</p><span className="text-[11px] text-slate-500">{new Date(doc.created_at).toLocaleDateString("en-IN")}</span></div>{isPdf(doc.url) ? <a href={doc.url} target="_blank" rel="noreferrer" className="flex min-h-36 items-center justify-center gap-2 p-4 text-sm font-semibold text-violet-700"><FileText className="h-5 w-5" />Open PDF document</a> : <button type="button" onClick={() => setEnlarged(doc)} className="relative block h-48 w-full cursor-zoom-in bg-slate-100" aria-label={`Enlarge ${docLabels[doc.doc_type]}`}><Image src={doc.url} alt={docLabels[doc.doc_type]} fill unoptimized sizes="(max-width: 640px) 100vw, 400px" className="object-contain" /></button>}</article>)}</div>
            {detail.data.documents.length === 0 ? <p className="mt-3 text-sm text-slate-500">No documents were attached.</p> : null}
            {detail.data.profile.verification_note ? <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Previous note: {detail.data.profile.verification_note}</p> : null}
            {decision.isError ? <p role="alert" className="mt-3 text-sm text-red-700">{decision.error.message}</p> : null}
            <div className="mt-5 border-t border-slate-100 pt-4"><label htmlFor="kyc-rejection-note" className="text-sm font-semibold">Review note <span className="font-normal text-slate-500">(required for rejection)</span></label><Input id="kyc-rejection-note" className="mt-2" value={note} onChange={(event) => setNote(event.target.value)} placeholder="Explain what needs correction" /><div className="mt-3 flex flex-wrap gap-2"><Button type="button" disabled={decision.isPending} onClick={() => decision.mutate("APPROVE")}><CheckCircle2 className="h-4 w-4" />{decision.isPending ? "Saving…" : "Approve partner"}</Button><Button type="button" variant="outline" className="border-red-200 text-red-700 hover:bg-red-50" disabled={decision.isPending || !note.trim()} onClick={() => decision.mutate("REJECT")}><XCircle className="h-4 w-4" />Reject with note</Button></div></div>
          </>}
        </section>
      </div>
    )}
    {enlarged ? <div role="dialog" aria-modal="true" aria-label={docLabels[enlarged.doc_type]} className="fixed inset-0 z-[70] grid place-items-center bg-black/80 p-4" onClick={() => setEnlarged(null)}><button type="button" aria-label="Close enlarged document" className="absolute right-5 top-5 rounded-full bg-white p-2 text-slate-900"><X className="h-5 w-5" /></button><div className="relative h-[90vh] w-full max-w-5xl" onClick={(event) => event.stopPropagation()}><Image src={enlarged.url} alt={docLabels[enlarged.doc_type]} fill unoptimized sizes="90vw" className="object-contain" /></div></div> : null}
  </>;
}
