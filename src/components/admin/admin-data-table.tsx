"use client";

import { useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { AdminEmptyState } from "@/components/admin/admin-empty-state";

export type AdminColumn<T> = {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
};

export function AdminDataTable<T>({
  columns,
  rows,
  getRowKey,
  emptyIcon,
  emptyTitle,
  emptyMessage,
}: {
  columns: AdminColumn<T>[];
  rows: T[];
  getRowKey: (row: T) => string;
  emptyIcon: Parameters<typeof AdminEmptyState>[0]["icon"];
  emptyTitle: string;
  emptyMessage: string;
}) {
  const topRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const top = topRef.current;
    const table = tableRef.current;
    if (!top || !table) return;
    let syncing = false;
    const fromTop = () => { if (!syncing) { syncing = true; table.scrollLeft = top.scrollLeft; syncing = false; } };
    const fromTable = () => { if (!syncing) { syncing = true; top.scrollLeft = table.scrollLeft; syncing = false; } };
    top.addEventListener("scroll", fromTop); table.addEventListener("scroll", fromTable);
    return () => { top.removeEventListener("scroll", fromTop); table.removeEventListener("scroll", fromTable); };
  }, [rows]);
  if (rows.length === 0) {
    return <AdminEmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <>
      <div className="grid gap-3 md:hidden">
        {rows.map((row) => (
          <article key={getRowKey(row)} className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <dl className="grid min-w-0 gap-3">
              {columns.map((column) => (
                <div key={column.key} className="grid min-w-0 grid-cols-[92px_minmax(0,1fr)] items-start gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                  <dt className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{column.header}</dt>
                  <dd className="min-w-0 break-words text-sm text-slate-700 [overflow-wrap:anywhere]">{column.render(row)}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>

      <div ref={topRef} className="hidden max-w-full overflow-x-auto md:block"><div className="h-1" style={{ width: "max(100%, 1100px)" }} /></div>
      <div ref={tableRef} className="hidden max-w-full overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th key={column.key} className="whitespace-nowrap px-4 py-3 text-left text-[11px] font-bold uppercase text-slate-500">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row) => (
              <tr key={getRowKey(row)} className="hover:bg-slate-50">
                {columns.map((column) => (
                  <td key={column.key} className="whitespace-nowrap px-4 py-3 align-middle text-slate-700">
                    {column.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
