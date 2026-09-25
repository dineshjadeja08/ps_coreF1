"use client";

import { Button } from "@/components/ui/button";

export function AdminPagination({
  count,
  page,
  pageSize,
  hasNext,
  hasPrevious,
  onPageChange,
}: {
  count: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
  onPageChange: (page: number) => void;
}) {
  if (count <= pageSize) return null;
  const pages = Math.max(1, Math.ceil(count / pageSize));
  return (
    <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
      <span className="text-slate-600">Page {page} of {pages} · {count} records</span>
      <div className="flex gap-2">
        <Button type="button" variant="outline" size="sm" disabled={!hasPrevious} onClick={() => onPageChange(page - 1)}>Previous</Button>
        <Button type="button" variant="outline" size="sm" disabled={!hasNext} onClick={() => onPageChange(page + 1)}>Next</Button>
      </div>
    </div>
  );
}
