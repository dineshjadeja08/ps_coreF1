"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Download, Eye, FileText, MapPin, Plus, Search, Star, Trash2, Upload, UserRound, UsersRound, Wrench, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { AdminErrorState } from "@/components/admin/admin-error-state";
import { AdminPagination } from "@/components/admin/admin-pagination";
import { AdminStatusBadge } from "@/components/admin/admin-status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AdminTechnicianEditor } from "@/features/admin/components/admin-technician-editor";
import { adminApi } from "@/lib/api/endpoints";
import { downloadAuthenticatedFile, getAuthenticatedFileBlob } from "@/lib/api/client";
import type { AdminReview, TechnicianDocument, TechnicianCompanyUser, UUID } from "@/types/api";

const tabs = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "services", label: "Services", icon: Wrench },
  { id: "locations", label: "Locations", icon: MapPin },
  { id: "users", label: "Users", icon: UsersRound },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "documents", label: "Documents", icon: FileText },
] as const;
type WorkspaceTab = typeof tabs[number]["id"];
const pageSize = 10;
const inputClass = "h-10 rounded-md border-slate-200 bg-white text-[13px] shadow-none focus-visible:ring-violet-300";

export function AdminTechnicianWorkspace({ technicianId }: { technicianId: string }) {
  const id = technicianId as UUID;
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<WorkspaceTab>("profile");
  const [editing, setEditing] = useState(false);
  const [serviceModal, setServiceModal] = useState(false);
  const [locationModal, setLocationModal] = useState(false);
  const [recommendedMode, setRecommendedMode] = useState(false);
  const [serviceSearch, setServiceSearch] = useState("");
  const [serviceCategory, setServiceCategory] = useState("");
  const [areaSearch, setAreaSearch] = useState("");
  const [areaCity, setAreaCity] = useState("");
  const [reviewSearch, setReviewSearch] = useState("");
  const [reviewRating, setReviewRating] = useState("");
  const [reviewVisibility, setReviewVisibility] = useState("");
  const [reviewPage, setReviewPage] = useState(1);
  const [serviceIds, setServiceIds] = useState<UUID[] | null>(null);
  const [areaIds, setAreaIds] = useState<UUID[] | null>(null);
  const [pendingServiceIds, setPendingServiceIds] = useState<UUID[]>([]);
  const [pendingAreaIds, setPendingAreaIds] = useState<UUID[]>([]);
  const [notice, setNotice] = useState("");
  const photoInput = useRef<HTMLInputElement>(null);
  const documentInput = useRef<HTMLInputElement>(null);
  const [documentType, setDocumentType] = useState<TechnicianDocument["document_type"]>("IDENTITY");
  const [companyPhone, setCompanyPhone] = useState("");
  const [companyRole, setCompanyRole] = useState<TechnicianCompanyUser["role"]>("STAFF");

  const profile = useQuery({ queryKey: ["admin", "technicians", "detail", id], queryFn: () => adminApi.getTechnician(id) });
  const options = useQuery({ queryKey: ["admin", "technicians", "options"], queryFn: adminApi.getTechnicianOptions, staleTime: 60_000 });
  const data = profile.data;
  useEffect(() => {
    const readHash = () => {
      const requestedTab = window.location.hash.slice(1) as WorkspaceTab;
      if (tabs.some((item) => item.id === requestedTab)) setTab(requestedTab);
    };
    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, []);

  const selectedServiceIds = serviceIds ?? data?.supported_services?.map((service) => service.id) ?? [];
  const selectedAreaIds = areaIds ?? data?.service_areas.map((area) => area.id) ?? [];
  const reviews = useQuery({
    queryKey: ["admin", "technician-reviews", id, reviewSearch, reviewRating, reviewVisibility, reviewPage],
    queryFn: () => adminApi.listReviews({ technician: id, page: reviewPage, page_size: pageSize, search: reviewSearch || undefined, rating: reviewRating ? Number(reviewRating) : undefined, is_visible: reviewVisibility ? reviewVisibility === "true" : undefined }),
    enabled: tab === "reviews",
  });
  const documents = useQuery({ queryKey: ["admin", "technicians", id, "documents"], queryFn: () => adminApi.listTechnicianDocuments(id), enabled: tab === "documents" });
  const companyUsers = useQuery({ queryKey: ["admin", "technicians", id, "company-users"], queryFn: () => adminApi.listTechnicianCompanyUsers(id), enabled: tab === "users" });
  const saveServices = useMutation({
    mutationFn: (nextIds: UUID[]) => adminApi.updateTechnician(id, { supported_service_ids: nextIds }),
    onSuccess: async () => { setNotice("Services updated."); setServiceIds(null); setPendingServiceIds([]); setServiceModal(false); await refresh(); },
  });
  const saveAreas = useMutation({
    mutationFn: (nextIds: UUID[]) => adminApi.updateTechnician(id, { service_area_ids: nextIds }),
    onSuccess: async () => { setNotice("Locations updated."); setAreaIds(null); setPendingAreaIds([]); setLocationModal(false); await refresh(); },
  });
  const uploadPhoto = useMutation({
    mutationFn: (file: File) => adminApi.uploadTechnicianPhoto(id, file),
    onSuccess: async () => { setNotice("Vendor logo or profile image updated."); await refresh(); },
  });
  const uploadDocument = useMutation({
    mutationFn: (file: File) => adminApi.uploadTechnicianDocument(id, documentType, file),
    onSuccess: async () => { setNotice("Document uploaded. It is pending verification."); await queryClient.invalidateQueries({ queryKey: ["admin", "technicians", id, "documents"] }); },
  });
  const verifyDocument = useMutation({
    mutationFn: ({ documentId, verification_status, verification_note }: { documentId: UUID; verification_status: "VERIFIED" | "REJECTED"; verification_note?: string }) => adminApi.verifyTechnicianDocument(id, documentId, { verification_status, verification_note }),
    onSuccess: async () => { setNotice("Document verification updated."); await queryClient.invalidateQueries({ queryKey: ["admin", "technicians", id, "documents"] }); },
  });
  const removeDocument = useMutation({ mutationFn: (documentId: UUID) => adminApi.deleteTechnicianDocument(id, documentId), onSuccess: async () => { setNotice("Document removed."); await queryClient.invalidateQueries({ queryKey: ["admin", "technicians", id, "documents"] }); } });
  const addCompanyUser = useMutation({
    mutationFn: () => adminApi.addTechnicianCompanyUser(id, { phone_number: companyPhone, role: companyRole }),
    onSuccess: async () => { setCompanyPhone(""); setNotice("Partner app access enabled. The user can sign in with this phone number and OTP."); await queryClient.invalidateQueries({ queryKey: ["admin", "technicians", id, "company-users"] }); },
  });
  const updateCompanyUser = useMutation({
    mutationFn: ({ userId, role, is_active }: { userId: UUID; role?: TechnicianCompanyUser["role"]; is_active?: boolean }) => adminApi.updateTechnicianCompanyUser(id, userId, { role, is_active }),
    onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: ["admin", "technicians", id, "company-users"] }); },
  });
  const removeCompanyUser = useMutation({ mutationFn: (userId: UUID) => adminApi.removeTechnicianCompanyUser(id, userId), onSuccess: async () => { setNotice("Company user removed."); await queryClient.invalidateQueries({ queryKey: ["admin", "technicians", id, "company-users"] }); } });
  async function refresh() {
    await Promise.all([profile.refetch(), queryClient.invalidateQueries({ queryKey: ["admin", "technicians"] })]);
  }

  const categories = useMemo(() => [...new Set((options.data?.services ?? []).map((service) => service.category_name).filter((value): value is string => Boolean(value)))].sort(), [options.data]);
  const cities = useMemo(() => [...new Set((options.data?.areas ?? []).map((area) => area.city).filter(Boolean))].sort(), [options.data]);
  const matchingServices = (options.data?.services ?? []).filter((service) => service.is_active && service.name.toLowerCase().includes(serviceSearch.toLowerCase()) && (!serviceCategory || service.category_name === serviceCategory));
  const matchingAreas = (options.data?.areas ?? []).filter((area) => area.is_active && area.name.toLowerCase().includes(areaSearch.toLowerCase()) && (!areaCity || area.city === areaCity));
  const assignedServices = (options.data?.services ?? []).filter((service) => selectedServiceIds.includes(service.id));
  const assignedAreas = (options.data?.areas ?? []).filter((area) => selectedAreaIds.includes(area.id));
  const recommendedAreas = matchingAreas.filter((area) => area.city.toLowerCase() === (data?.city ?? "").toLowerCase() && !selectedAreaIds.includes(area.id));

  if (profile.isLoading) return <div className="grid min-h-[60vh] place-items-center bg-[#f3f4f6] text-sm text-slate-500">Loading technician workspace…</div>;
  if (profile.isError || !data) return <div className="min-h-[60vh] bg-[#f3f4f6] p-8"><AdminErrorState message={profile.error?.message ?? "Technician profile unavailable."} onRetry={() => void profile.refetch()} /></div>;

  const tabNav = <nav aria-label="Technician workspace sections" className="grid">{tabs.map(({ id: tabId, label, icon: Icon }) => <a key={tabId} href={`#${tabId}`} onClick={() => setTab(tabId)} aria-current={tab === tabId ? "page" : undefined} className={`flex h-[58px] items-center gap-3 border-t border-slate-200 px-6 text-[13px] font-medium transition-colors ${tab === tabId ? "bg-violet-50 text-violet-700" : "text-slate-700 hover:bg-slate-50"}`}><Icon className="h-[18px] w-[18px]" />{label}</a>)}</nav>;
  const title = ({ profile: "Technician Profile", services: "Service List", locations: "Company Locations", users: "Company Users", reviews: "Reviews", documents: "Document List" } satisfies Record<WorkspaceTab, string>)[tab];

  return <div className="bg-[#f3f4f6] text-[#111827] lg:h-[calc(100vh-11rem)] lg:min-h-0">
    <div className="grid lg:h-full lg:min-h-0 lg:grid-cols-[205px_minmax(0,1fr)] lg:overflow-hidden">
      <aside className="border-b border-slate-200 bg-white lg:h-full lg:overflow-y-auto lg:border-b-0 lg:border-r">
        <div className="flex h-[100px] items-center justify-center border-b border-slate-200 px-4"><div className="grid h-[88px] w-[88px] place-items-center overflow-hidden rounded-full bg-violet-100 text-violet-700">{data.profile_photo_url ? <Image src={data.profile_photo_url} alt={`${data.display_name} profile`} width={88} height={88} unoptimized className="h-full w-full object-cover" /> : <UserRound className="h-9 w-9" />}</div></div>
        {tabNav}
      </aside>

      <main className="min-w-0 px-4 py-5 sm:px-7 sm:py-7 lg:h-full lg:overflow-y-auto lg:px-10 lg:py-8"><div className="mx-auto max-w-[1180px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-[20px] font-bold tracking-tight text-slate-900">{title}</h1>{tab === "profile" ? <p className="mt-1 text-[13px] text-slate-500">{data.display_name} · {data.employee_code}</p> : null}</div>{tab === "profile" ? <div className="flex gap-2"><AdminStatusBadge status={data.is_active ? "ACTIVE" : "INACTIVE"} /><AdminStatusBadge status={data.background_verification_status ?? "PENDING"} /></div> : null}</div>
        {notice ? <p role="status" className="mb-4 rounded-md bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{notice}</p> : null}

        {tab === "profile" ? editing ? <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><AdminTechnicianEditor profile={data} onPendingChange={() => undefined} onCancel={() => setEditing(false)} onSaved={async () => { setEditing(false); await refresh(); }} /></div> : <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-[17px] font-bold text-slate-900">{data.display_name}</h2><p className="mt-1 text-sm text-slate-500">Technician ID · {data.employee_code}</p></div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="h-9 rounded-full px-4 text-xs" onClick={() => setEditing(true)}>Edit</Button><input ref={photoInput} className="sr-only" type="file" accept="image/png,image/jpeg,image/webp" aria-label="Choose vendor logo or profile image" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ""; if (!file) return; if (file.size > 5 * 1024 * 1024) { setNotice("Choose an image smaller than 5 MB."); return; } setNotice(""); uploadPhoto.mutate(file); }} /><Button type="button" className="h-9 rounded-full px-4 text-xs" disabled={uploadPhoto.isPending} onClick={() => photoInput.current?.click()}><Upload className="h-4 w-4" />{uploadPhoto.isPending ? "Uploading…" : "Upload logo"}</Button></div></div>
            {uploadPhoto.isError ? <p role="alert" className="mb-3 text-sm text-red-700">{uploadPhoto.error.message}</p> : null}
            <dl className="grid min-w-0 gap-x-8 sm:grid-cols-2">{[["Mobile Number", data.phone], ["Virtual Mobile Number", data.virtual_mobile_number], ["City", data.city], ["Address", data.address], ["Service Group", data.service_group], ["Profile Type", data.profile_type], ["Lead Per Day", String(data.lead_per_day ?? 0)], ["Job Per Day", String(data.job_per_day ?? 0)], ["No of Teams", String(data.no_of_teams ?? 1)], ["Sales Person Assigned", data.sales_person_assigned_name], ["CRM Owner ID", data.crm_owner_id], ["Aadhaar Number", data.id_proof_number ? `•••• •••• ${data.id_proof_number.slice(-4)}` : "—"], ["Alternate Mobile", data.alternate_phone], ["Email", data.email], ["Pincode", data.pincode], ["Technician Type", data.technician_type], ["Primary Service Category", data.supported_services?.[0]?.category], ["Experience", data.experience_years ? `${data.experience_years} years` : "—"], ["Date Joined", data.joined_at], ["Languages", data.languages?.join(", ")]].map(([label, value]) => <div key={label} className="grid min-w-0 grid-cols-[minmax(108px,0.7fr)_minmax(0,1.3fr)] gap-3 border-b border-slate-100 py-2 text-[13px] last:border-0"><dt className="font-medium text-slate-800">{label}</dt><dd className="min-w-0 whitespace-normal break-words text-slate-600 [overflow-wrap:anywhere]">{value || "—"}</dd></div>)}</dl>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-4 text-[16px] font-bold text-slate-900">Status</h2><dl className="divide-y divide-slate-200 text-[13px]">{[["Technician Status", data.is_active ? "ACTIVE" : "INACTIVE"], ["KYC Verification", data.background_verification_status ?? "PENDING"], ["Available for Bookings", data.is_active && data.is_available ? "Yes" : "No"], ["Vendor App Account", "Linked technician account"], ["Suspended", data.background_verification_status === "SUSPENDED" || data.availability_status === "SUSPENDED" ? "Yes" : "No"], ["Assigned Services Count", String(data.supported_services?.length ?? 0)], ["Assigned Locations Count", String(data.service_areas.length)]].map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] gap-4 border-b border-slate-200 py-1.5 last:border-0"><dt className="text-slate-700">{label}</dt><dd className="font-medium text-slate-800">{value}</dd></div>)}</dl></div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"><h2 className="mb-4 text-[16px] font-bold text-slate-900">Performance</h2><dl className="divide-y divide-slate-200 text-[13px]">{[["Completed Jobs", String(data.completed_jobs ?? data.completed_job_count ?? 0)], ["Cancelled Jobs", String(data.cancelled_jobs ?? data.cancellation_count ?? 0)], ["Average Rating", data.approved_rating ? `${data.approved_rating} / 5` : "—"], ["Total Reviews", String(data.approved_review_count ?? 0)]].map(([label, value]) => <div key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)] gap-4 border-b border-slate-200 py-1.5 last:border-0"><dt className="text-slate-700">{label}</dt><dd className="font-medium text-slate-800">{value}</dd></div>)}</dl></div>
        </section> : null}

        {tab === "services" ? <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4"><h2 className="text-[16px] font-bold text-slate-900">Service List</h2><Button type="button" className="h-9 rounded-full px-4 text-xs" onClick={() => { setServiceSearch(""); setServiceCategory(""); setPendingServiceIds([]); setServiceModal(true); }}><Plus className="h-4 w-4" />Add</Button></div>
          {options.isError ? <div className="p-5"><AdminErrorState message={options.error.message} onRetry={() => void options.refetch()} /></div> : assignedServices.length ? <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-[13px]"><thead className="bg-slate-50 text-left text-[11px] font-semibold text-slate-500"><tr><th className="px-5 py-3">Service</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-200">{assignedServices.map((service) => <tr key={service.id}><td className="px-5 py-4 font-medium text-slate-800">{service.name}<span className="mt-1 block text-[11px] text-slate-500">{service.category_name || "—"}</span></td><td className="px-5 py-4"><AdminStatusBadge status={service.is_active ? "ACTIVE" : "INACTIVE"} /></td><td className="px-5 py-4"><button type="button" aria-label={`Remove ${service.name}`} disabled={saveServices.isPending} onClick={() => { if (window.confirm(`Remove ${service.name} from this technician?`)) saveServices.mutate(selectedServiceIds.filter((serviceId) => serviceId !== service.id)); }} className="rounded p-2 text-slate-600 hover:bg-red-50 hover:text-red-700"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div> : <p className="px-5 py-16 text-center text-[15px] font-semibold text-slate-700">There are no services assigned to this technician</p>}
          {saveServices.isError ? <p role="alert" className="border-t border-red-100 px-5 py-3 text-sm text-red-700">{saveServices.error.message}</p> : null}
        </section> : null}

        {tab === "locations" ? <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4"><h2 className="text-[16px] font-bold text-slate-900">Company Locations</h2><div className="flex flex-wrap gap-2"><Button type="button" className="h-9 rounded-full px-3 text-xs" onClick={() => { setRecommendedMode(false); setPendingAreaIds([]); setAreaSearch(""); setAreaCity(""); setLocationModal(true); }}><Plus className="h-4 w-4" />Add Location</Button><Button type="button" variant="outline" className="h-9 rounded-full px-3 text-xs" onClick={() => { setRecommendedMode(true); setPendingAreaIds([]); setAreaSearch(""); setAreaCity(data.city ?? ""); setLocationModal(true); }}><MapPin className="h-4 w-4" />Add Recommended Location</Button></div></div>
          {options.isError ? <div className="p-5"><AdminErrorState message={options.error.message} onRetry={() => void options.refetch()} /></div> : assignedAreas.length ? <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-[13px]"><thead className="bg-slate-50 text-left text-[11px] font-semibold text-slate-500"><tr><th className="px-5 py-3">Location</th><th className="px-5 py-3">City</th><th className="px-5 py-3">Pincode</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-200">{assignedAreas.map((area) => <tr key={area.id}><td className="px-5 py-4 font-medium">{area.name}</td><td className="px-5 py-4">{area.city}</td><td className="px-5 py-4">{area.postal_code || "—"}</td><td className="px-5 py-4"><AdminStatusBadge status={area.is_active ? "ACTIVE" : "INACTIVE"} /></td><td className="px-5 py-4"><button type="button" aria-label={`Remove ${area.name}`} disabled={saveAreas.isPending} onClick={() => { if (window.confirm(`Remove ${area.name} from this technician?`)) saveAreas.mutate(selectedAreaIds.filter((areaId) => areaId !== area.id)); }} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div> : <p className="px-5 py-16 text-center text-[15px] font-semibold text-slate-700">There are no locations assigned to this technician</p>}
          {saveAreas.isError ? <p role="alert" className="border-t border-red-100 px-5 py-3 text-sm text-red-700">{saveAreas.error.message}</p> : null}
        </section> : null}

        {tab === "reviews" ? <section className="rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-[16px] font-bold text-slate-900">Reviews</h2><p className="mt-1 text-xs text-slate-500">Only genuine customer feedback associated with this technician.</p></div><div className="grid gap-2 border-b border-slate-200 p-4 sm:grid-cols-[minmax(0,1fr)_150px_160px]"><Input className={inputClass} value={reviewSearch} onChange={(event) => { setReviewSearch(event.target.value); setReviewPage(1); }} placeholder="Search reviews" /><select className={inputClass} value={reviewRating} onChange={(event) => { setReviewRating(event.target.value); setReviewPage(1); }}><option value="">All ratings</option>{[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} stars</option>)}</select><select className={inputClass} value={reviewVisibility} onChange={(event) => { setReviewVisibility(event.target.value); setReviewPage(1); }}><option value="">All statuses</option><option value="true">Published</option><option value="false">Hidden</option></select></div>{reviews.isLoading ? <p className="p-10 text-center text-sm text-slate-500">Loading reviews…</p> : reviews.isError ? <div className="p-5"><AdminErrorState message={reviews.error.message} onRetry={() => void reviews.refetch()} /></div> : <ReviewsTable rows={reviews.data?.results ?? []} />}{reviews.data ? <div className="px-4 pb-3"><AdminPagination count={reviews.data.count} page={reviewPage} pageSize={pageSize} hasNext={Boolean(reviews.data.next)} hasPrevious={Boolean(reviews.data.previous)} onPageChange={setReviewPage} /></div> : null}</section> : null}

        {tab === "users" ? <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-[16px] font-bold text-slate-900">Add partner app user</h2><p className="mt-1 text-xs leading-5 text-slate-500">Add their mobile number to this company. They can sign in to PurplePartner with that number and OTP; removing or deactivating them revokes access.</p><div className="mt-4 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px_auto]"><Input className={inputClass} inputMode="tel" value={companyPhone} onChange={(event) => setCompanyPhone(event.target.value)} placeholder="Mobile number" aria-label="Company user mobile number" /><select className={inputClass} value={companyRole} onChange={(event) => setCompanyRole(event.target.value as TechnicianCompanyUser["role"])}><option value="OWNER">Owner</option><option value="MANAGER">Manager</option><option value="STAFF">Staff</option></select><Button type="button" disabled={!companyPhone.trim() || addCompanyUser.isPending} onClick={() => addCompanyUser.mutate()}><Plus className="h-4 w-4" />{addCompanyUser.isPending ? "Adding…" : "Enable app access"}</Button></div>{addCompanyUser.isError ? <p role="alert" className="mt-3 text-sm text-red-700">{addCompanyUser.error.message}</p> : null}</div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-[16px] font-bold text-slate-900">Company Users</h2></div>{companyUsers.isLoading ? <p className="p-8 text-center text-sm text-slate-500">Loading company users…</p> : companyUsers.isError ? <div className="p-5"><AdminErrorState message={companyUsers.error.message} onRetry={() => void companyUsers.refetch()} /></div> : companyUsers.data?.length ? <div className="overflow-x-auto"><table className="w-full min-w-[640px] text-[13px]"><thead className="bg-slate-50 text-left text-[11px] font-semibold text-slate-500"><tr><th className="px-5 py-3">Name</th><th className="px-5 py-3">Mobile</th><th className="px-5 py-3">Role</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Action</th></tr></thead><tbody className="divide-y divide-slate-200">{companyUsers.data.map((member) => <tr key={member.id}><td className="px-5 py-4 font-medium">{member.name}</td><td className="px-5 py-4">{member.phone_number}</td><td className="px-5 py-4"><select className="h-9 rounded-md border border-slate-200 bg-white px-2" value={member.role} onChange={(event) => updateCompanyUser.mutate({ userId: member.id, role: event.target.value as TechnicianCompanyUser["role"] })}><option value="OWNER">Owner</option><option value="MANAGER">Manager</option><option value="STAFF">Staff</option></select></td><td className="px-5 py-4"><button type="button" disabled={updateCompanyUser.isPending} onClick={() => updateCompanyUser.mutate({ userId: member.id, is_active: !member.is_active })}><AdminStatusBadge status={member.is_active ? "ACTIVE" : "INACTIVE"} /></button></td><td className="px-5 py-4"><button type="button" aria-label={`Remove ${member.name}`} disabled={removeCompanyUser.isPending} onClick={() => { if (window.confirm(`Remove ${member.name} from this company roster?`)) removeCompanyUser.mutate(member.id); }} className="rounded p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></td></tr>)}</tbody></table></div> : <p className="px-5 py-16 text-center text-sm text-slate-500">No company users have been added.</p>}{updateCompanyUser.isError || removeCompanyUser.isError ? <p role="alert" className="border-t border-red-100 px-5 py-3 text-sm text-red-700">{updateCompanyUser.error?.message ?? removeCompanyUser.error?.message}</p> : null}</div>
        </section> : null}
        {tab === "documents" ? <section className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"><h2 className="text-[16px] font-bold text-slate-900">Upload technician document</h2><p className="mt-1 text-xs leading-5 text-slate-500">PDF, JPG, PNG or WebP up to 10 MB. Files are stored privately and only served after admin authorization. Re-uploading a type replaces the current document and resets verification.</p><div className="mt-4 grid gap-3 sm:grid-cols-[190px_minmax(0,1fr)_auto]"><select className={inputClass} value={documentType} onChange={(event) => setDocumentType(event.target.value as TechnicianDocument["document_type"])}><option value="IDENTITY">Identity Proof</option><option value="ADDRESS">Address Proof</option><option value="CERTIFICATE">Certificate</option><option value="OTHER">Other</option></select><input ref={documentInput} className="h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm" type="file" accept="application/pdf,image/jpeg,image/png,image/webp" aria-label="Choose technician document" /><Button type="button" disabled={uploadDocument.isPending} onClick={() => { const file = documentInput.current?.files?.[0]; if (file) uploadDocument.mutate(file); }}><Upload className="h-4 w-4" />{uploadDocument.isPending ? "Uploading…" : "Upload / Replace"}</Button></div>{uploadDocument.isError ? <p role="alert" className="mt-3 text-sm text-red-700">{uploadDocument.error.message}</p> : null}</div>
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-200 px-5 py-4"><h2 className="text-[16px] font-bold text-slate-900">Document List</h2></div>{documents.isLoading ? <p className="p-8 text-center text-sm text-slate-500">Loading documents…</p> : documents.isError ? <div className="p-5"><AdminErrorState message={documents.error.message} onRetry={() => void documents.refetch()} /></div> : documents.data?.length ? <div className="divide-y divide-slate-200">{documents.data.map((document) => <DocumentRow key={document.id} document={document} onVerify={(verification_status, verification_note) => verifyDocument.mutate({ documentId: document.id, verification_status, verification_note })} onRemove={() => { if (window.confirm(`Remove ${document.original_name}?`)) removeDocument.mutate(document.id); }} />)}</div> : <p className="px-5 py-12 text-center text-sm text-slate-500">No private documents uploaded yet.</p>}{verifyDocument.isError || removeDocument.isError ? <p role="alert" className="border-t border-red-100 px-5 py-3 text-sm text-red-700">{verifyDocument.error?.message ?? removeDocument.error?.message}</p> : null}</div>
          {data.id_document_available || data.address_document_available ? <p className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-900">Legacy document files are present on the profile but aren’t part of the private document store. Upload them here to replace them with securely managed copies.</p> : null}
        </section> : null}
      </div></main>
    </div>

    <Dialog.Root open={serviceModal} onOpenChange={(open) => { if (!open && !saveServices.isPending) setServiceModal(false); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(700px,calc(100vh-2rem))] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-xl focus:outline-none"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><Dialog.Title className="text-base font-bold text-slate-900">Add Services</Dialog.Title><Dialog.Description className="mt-1 text-xs text-slate-500">Select services from the existing catalogue.</Dialog.Description></div><Dialog.Close className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-4 w-4" /></Dialog.Close></div><div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_190px]"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className={`${inputClass} pl-9`} placeholder="Search services" value={serviceSearch} onChange={(event) => setServiceSearch(event.target.value)} /></label><select className={inputClass} value={serviceCategory} onChange={(event) => setServiceCategory(event.target.value)}><option value="">All categories</option>{categories.map((category) => <option key={category}>{category}</option>)}</select></div><div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">{matchingServices.filter((service) => !selectedServiceIds.includes(service.id)).map((service) => <label key={service.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-2 py-3 text-[13px] hover:bg-slate-50"><input type="checkbox" checked={pendingServiceIds.includes(service.id)} onChange={() => setPendingServiceIds((items) => items.includes(service.id) ? items.filter((item) => item !== service.id) : [...items, service.id])} className="accent-violet-700" /><span className="min-w-0 flex-1"><span className="block font-medium text-slate-800">{service.name}</span><span className="text-[11px] text-slate-500">{service.category_name || "Uncategorized"}</span></span></label>)}{matchingServices.filter((service) => !selectedServiceIds.includes(service.id)).length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No available services match your search.</p> : null}</div><div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4"><Dialog.Close className="h-9 rounded-md border border-slate-200 px-4 text-xs font-semibold text-slate-700">Cancel</Dialog.Close><Button type="button" disabled={!pendingServiceIds.length || saveServices.isPending} className="h-9 rounded-md px-4 text-xs" onClick={() => saveServices.mutate([...selectedServiceIds, ...pendingServiceIds])}>{saveServices.isPending ? "Saving…" : `Save Selected${pendingServiceIds.length ? ` (${pendingServiceIds.length})` : ""}`}</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>

    <Dialog.Root open={locationModal} onOpenChange={(open) => { if (!open && !saveAreas.isPending) setLocationModal(false); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/35" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[min(700px,calc(100vh-2rem))] w-[min(620px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-xl focus:outline-none"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><Dialog.Title className="text-base font-bold text-slate-900">{recommendedMode ? "Recommended Locations" : "Add Locations"}</Dialog.Title><Dialog.Description className="mt-1 text-xs text-slate-500">{recommendedMode ? `Same-city service areas for ${data.city || "this technician"}; no distance estimate is available.` : "Choose from existing serviceable localities."}</Dialog.Description></div><Dialog.Close className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close"><X className="h-4 w-4" /></Dialog.Close></div><div className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_190px]"><label className="relative"><Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" /><Input className={`${inputClass} pl-9`} placeholder="Search locations" value={areaSearch} onChange={(event) => setAreaSearch(event.target.value)} /></label><select className={inputClass} value={areaCity} onChange={(event) => setAreaCity(event.target.value)}><option value="">All cities</option>{cities.map((city) => <option key={city}>{city}</option>)}</select></div><div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">{(recommendedMode ? recommendedAreas : matchingAreas.filter((area) => !selectedAreaIds.includes(area.id))).map((area) => <label key={area.id} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-2 py-3 text-[13px] hover:bg-slate-50"><input type="checkbox" checked={pendingAreaIds.includes(area.id)} onChange={() => setPendingAreaIds((items) => items.includes(area.id) ? items.filter((item) => item !== area.id) : [...items, area.id])} className="h-4 w-4 appearance-none rounded-full border border-slate-300 checked:border-violet-700 checked:bg-violet-700 focus-visible:outline-2 focus-visible:outline-violet-500" /><span className="min-w-0 flex-1 font-medium text-slate-800">{area.name}<span className="ml-2 text-[11px] font-normal text-slate-500">{area.city} · {area.postal_code}</span></span></label>)}{(recommendedMode ? recommendedAreas : matchingAreas.filter((area) => !selectedAreaIds.includes(area.id))).length === 0 ? <p className="py-10 text-center text-sm text-slate-500">No matching serviceable locations.</p> : null}</div><div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4"><Dialog.Close className="h-9 rounded-md border border-slate-200 px-4 text-xs font-semibold text-slate-700">Cancel</Dialog.Close><Button type="button" disabled={!pendingAreaIds.length || saveAreas.isPending} className="h-9 rounded-md px-4 text-xs" onClick={() => saveAreas.mutate([...selectedAreaIds, ...pendingAreaIds])}>{saveAreas.isPending ? "Saving…" : `Save Selected${pendingAreaIds.length ? ` (${pendingAreaIds.length})` : ""}`}</Button></div></Dialog.Content></Dialog.Portal></Dialog.Root>
  </div>;
}

function DocumentRow({ document, onVerify, onRemove }: { document: TechnicianDocument; onVerify: (status: "VERIFIED" | "REJECTED", note?: string) => void; onRemove: () => void }) {
  const [previewUrl, setPreviewUrl] = useState("");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);
  async function previewDocument() {
    setLoadingPreview(true);
    setError("");
    try {
      const blob = await getAuthenticatedFileBlob(document.content_url);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not load document.");
    } finally {
      setLoadingPreview(false);
    }
  }
  function rejectDocument() {
    const note = window.prompt("Reason for rejecting this document:");
    if (note?.trim()) onVerify("REJECTED", note.trim());
  }
  const typeLabel = { IDENTITY: "Identity Proof", ADDRESS: "Address Proof", CERTIFICATE: "Certificate", OTHER: "Other" }[document.document_type];
  // eslint-disable-next-line @next/next/no-img-element
  return <article className="grid gap-3 px-5 py-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="text-sm font-semibold text-slate-900">{typeLabel}</h3><AdminStatusBadge status={document.verification_status} /></div><p className="mt-1 truncate text-xs text-slate-600">{document.original_name} · {(document.file_size / 1024 / 1024).toFixed(2)} MB</p><p className="mt-1 text-[11px] text-slate-500">Uploaded {new Date(document.created_at).toLocaleString("en-IN")}{document.uploaded_by_name ? ` by ${document.uploaded_by_name}` : ""}</p>{document.verification_note ? <p className="mt-2 text-xs text-amber-800">Note: {document.verification_note}</p> : null}{error ? <p role="alert" className="mt-2 text-xs text-red-700">{error}</p> : null}</div><div className="flex flex-wrap gap-2"><Button type="button" variant="outline" className="h-9 px-3 text-xs" disabled={loadingPreview} onClick={() => void previewDocument()}><Eye className="h-4 w-4" />{loadingPreview ? "Loading…" : "Preview"}</Button><Button type="button" variant="outline" className="h-9 px-3 text-xs" onClick={() => void downloadAuthenticatedFile(`${document.content_url}?download=true`, document.original_name)}><Download className="h-4 w-4" />Download</Button>{document.verification_status !== "VERIFIED" ? <Button type="button" className="h-9 px-3 text-xs" onClick={() => onVerify("VERIFIED")}><Check className="h-4 w-4" />Verify</Button> : null}{document.verification_status !== "REJECTED" ? <Button type="button" variant="outline" className="h-9 px-3 text-xs text-red-700" onClick={rejectDocument}>Reject</Button> : null}<Button type="button" variant="outline" className="h-9 px-3 text-xs text-red-700" onClick={onRemove}><Trash2 className="h-4 w-4" />Remove</Button></div><Dialog.Root open={Boolean(previewUrl)} onOpenChange={(open) => { if (!open) setPreviewUrl(""); }}><Dialog.Portal><Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" /><Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex h-[min(90vh,900px)] w-[min(1000px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white shadow-xl focus:outline-none"><div className="flex items-center justify-between border-b border-slate-200 px-5 py-4"><div><Dialog.Title className="text-sm font-bold">{typeLabel}</Dialog.Title><Dialog.Description className="text-xs text-slate-500">{document.original_name}</Dialog.Description></div><Dialog.Close className="rounded-full p-2 text-slate-500 hover:bg-slate-100" aria-label="Close preview"><X className="h-4 w-4" /></Dialog.Close></div><div className="min-h-0 flex-1 bg-slate-100 p-3">{previewUrl ? document.content_type === "application/pdf" ? <iframe title={document.original_name} src={previewUrl} className="h-full w-full rounded bg-white" /> : <img src={previewUrl} alt={document.original_name} className="h-full w-full object-contain" /> : null}</div></Dialog.Content></Dialog.Portal></Dialog.Root></article>;
}

function ReviewsTable({ rows }: { rows: AdminReview[] }) {
  if (!rows.length) return <p className="px-5 py-16 text-center text-sm text-slate-500">No reviews are associated with this technician.</p>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-[13px]"><thead className="bg-slate-50 text-left text-[11px] font-semibold text-slate-500"><tr>{["Created On", "Review ID", "Booking ID", "Reviewed By", "Rating", "Comment"].map((heading) => <th key={heading} className="px-4 py-3">{heading}</th>)}</tr></thead><tbody className="divide-y divide-slate-200">{rows.map((review) => <tr key={review.id}><td className="px-4 py-4">{new Date(review.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</td><td className="px-4 py-4 text-slate-500">{review.id.slice(0, 8)}</td><td className="px-4 py-4 text-slate-500">{review.booking_number || "—"}</td><td className="px-4 py-4 font-medium">{review.reviewer_name || "Customer"}</td><td className="px-4 py-4 font-semibold">{review.rating} ★</td><td className="max-w-md px-4 py-4 leading-5 text-slate-700">{review.comment || "—"}</td></tr>)}</tbody></table></div>;
}

