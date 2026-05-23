"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { PiCaretDown, PiCaretUp, PiMagnifyingGlass } from "react-icons/pi";
import { DashboardButton, DashboardPanel, fieldClass } from "./primitives";

type DashboardDataTableProps<TData> = {
  data: TData[];
  columns: ColumnDef<TData, any>[];
  searchPlaceholder?: string;
  emptyLabel?: string;
};

export default function DashboardDataTable<TData>({
  data,
  columns,
  searchPlaceholder = "Search...",
  emptyLabel = "No records found.",
}: DashboardDataTableProps<TData>) {
  const [globalFilter, setGlobalFilter] = useState("");
  const memoColumns = useMemo(() => columns, [columns]);
  const memoData = useMemo(() => data, [data]);
  const table = useReactTable({
    data: memoData,
    columns: memoColumns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <DashboardPanel className="overflow-hidden">
      <div className="border-b border-[var(--border)] p-4">
        <div className="relative max-w-md">
          <PiMagnifyingGlass className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--rubric-muted)]" />
          <input
            value={globalFilter}
            onChange={(event) => setGlobalFilter(event.target.value)}
            placeholder={searchPlaceholder}
            className={`${fieldClass} pl-12`}
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-[var(--surface-muted)] text-xs uppercase text-[var(--rubric-muted)]">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 font-bold">
                    {header.isPlaceholder ? null : (
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="inline-flex items-center gap-1"
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                        {{
                          asc: <PiCaretUp className="h-3 w-3" />,
                          desc: <PiCaretDown className="h-3 w-3" />,
                        }[header.column.getIsSorted() as string] ?? null}
                      </button>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[var(--border)] bg-[var(--surface-strong)]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-4 py-4 align-middle text-[var(--rubric-slate)]"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-14 text-center text-[var(--rubric-muted)]"
                >
                  {emptyLabel}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex flex-col gap-3 border-t border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-[var(--rubric-muted)]">
          Page {table.getState().pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </p>
        <div className="flex gap-2">
          <DashboardButton
            variant="secondary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </DashboardButton>
          <DashboardButton
            variant="secondary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </DashboardButton>
        </div>
      </div>
    </DashboardPanel>
  );
}
