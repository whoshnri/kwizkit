"use client";

import { ColumnDef } from "@tanstack/react-table";
import { PiPlus } from "react-icons/pi";
import DashboardDataTable from "../components/DashboardDataTable";
import { DashboardButton, DashboardField, DashboardPanel, ResponsiveSheet, fieldClass } from "../components/primitives";
import { useTransactionsPage } from "../hooks/useTransactionsPage";
import { formatDate, formatMoney } from "../lib/schoolOptions";

export default function TransactionsPage() {
  const page = useTransactionsPage();

  const columns: ColumnDef<any>[] = [
    { accessorKey: "type", header: "Type", cell: ({ row }) => (row.original.type === "cr" ? "Credit" : "Debit") },
    { accessorKey: "amount", header: "Amount", cell: ({ row }) => formatMoney(row.original.amount) },
    { accessorKey: "createdAt", header: "Date", cell: ({ row }) => formatDate(row.original.createdAt) },
    { accessorKey: "id", header: "Reference", cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  ];

  if (page.loading) return <DashboardPanel className="h-96 animate-pulse" />;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="mt-2 text-3xl font-semibold">Wallet balance: <span className="font-semibold text-[var(--rubric-black)]">{formatMoney(page.data.wallet?.balance)}</span></h1>
         
        </div>
        <DashboardButton onClick={() => page.setSheetOpen(true)}>
          <PiPlus className="h-5 w-5" />
          Top up
        </DashboardButton>
      </header>

      <DashboardDataTable data={page.data.transactions ?? []} columns={columns} searchPlaceholder="Search transactions..." />

      {page.sheetOpen && (
        <ResponsiveSheet
          title="Top up wallet"
          onClose={() => page.setSheetOpen(false)}
          footer={<DashboardButton onClick={page.submitTopUp} disabled={page.saving} className="w-full">Top up wallet</DashboardButton>}
        >
          <DashboardField label="Amount">
            <input
              type="number"
              min={1}
              value={page.amount}
              onChange={(event) => page.setAmount(Number(event.target.value))}
              className={fieldClass}
            />
          </DashboardField>
        </ResponsiveSheet>
      )}
    </div>
  );
}
