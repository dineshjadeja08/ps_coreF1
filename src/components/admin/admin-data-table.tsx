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
  if (rows.length === 0) {
    return <AdminEmptyState icon={emptyIcon} title={emptyTitle} message={emptyMessage} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50">
          <tr>
            {columns.map((column) => (
              <th key={column.key} className="whitespace-nowrap px-4 py-3 text-left text-xs font-bold uppercase text-slate-500">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={getRowKey(row)} className="hover:bg-slate-50">
              {columns.map((column) => (
                <td key={column.key} className="whitespace-nowrap px-4 py-3 text-slate-700">
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
