"use client";

import Link from "next/link";
import { PiPencilSimple, PiPlus, PiWallet } from "react-icons/pi";
import { DashboardButton, DashboardField, DashboardPanel, ResponsiveSheet, StatusBadge, fieldClass } from "../../components/primitives";
import { useAccountPage } from "../../hooks/useAccountPage";
import { formatDate, formatMoney, genderOptions, labelize } from "../../lib/schoolOptions";
import { DashboardSelect } from "../../components/DashboardDropdown";
import { Plan } from "@/lib/generated/prisma/client";
import { PiCaretRight, PiCheck, PiSpinnerGap } from "react-icons/pi";

export default function AccountPageClient() {
  const account = useAccountPage();

  if (account.loading) {
    return <DashboardPanel className="h-96 animate-pulse" />;
  }

  const details = account.overview?.account;
  const wallet = account.overview?.wallet;
  const transactions = wallet?.transactions ?? [];

  return (
    <div className="space-y-6 pb-8">
      <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <DashboardPanel className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[var(--rubric-muted)]">Account profile</p>
              <h1 className="mt-2 text-3xl font-semibold">
                {[details?.firstName, details?.lastName].filter(Boolean).join(" ") || "Rubric user"}
              </h1>
              <p className="mt-2 text-sm text-[var(--rubric-slate)]">{details?.email}</p>
            </div>
            <DashboardButton onClick={() => account.setEditOpen(true)}>
              <PiPencilSimple className="h-5 w-5" />
              Edit account
            </DashboardButton>
          </div>

          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {[
              ["Unique ID", details?.uniqueId],
              ["Phone", details?.phone],
              ["City", details?.city],
              ["Gender", details?.gender ? labelize(details.gender) : null],
              ["Created", formatDate(details?.createdAt)],
              ["Plan", details?.plan ? labelize(details.plan) : "None"],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4">
                <p className="text-xs font-bold uppercase text-[var(--rubric-muted)]">{label}</p>
                <p className="mt-2 text-sm font-semibold text-[var(--rubric-black)]">{value || "Not set"}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <div className="space-y-5">
          <DashboardPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--rubric-muted)]">Wallet</p>
                <p className="mt-2 text-4xl font-semibold">{formatMoney(wallet?.balance)}</p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--rubric-black)] text-white">
                <PiWallet className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-6 grid gap-3">
              <DashboardButton onClick={() => account.setTopUpOpen(true)}>
                <PiPlus className="h-5 w-5" />
                Top up
              </DashboardButton>
              <Link href="/dashboard/transactions" className="rubric-button-secondary justify-center">
                View transactions
              </Link>
            </div>
          </DashboardPanel>

          <DashboardPanel className="p-6">
            <p className="text-sm font-semibold text-[var(--rubric-muted)]">Subscription</p>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="font-semibold text-[var(--rubric-black)]">{labelize(details?.plan ?? "solo_paygo")}</p>
                <p className="text-xs text-[var(--rubric-muted)]">Expires: {details?.planExpiresAt ? formatDate(details.planExpiresAt) : "Never"}</p>
              </div>
              <StatusBadge tone="success">Active</StatusBadge>
            </div>
            <DashboardButton variant="secondary" onClick={() => account.setPlanOpen(true)} className="mt-6 w-full justify-center">
              Change plan
            </DashboardButton>
          </DashboardPanel>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1fr_420px]">
...
      {account.planOpen && (
        <ResponsiveSheet
          title="Change subscription plan"
          onClose={() => account.setPlanOpen(false)}
          className="md:max-w-2xl"
        >
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                { id: "solo_paygo", name: "Pay As You Go", price: "₦0", desc: "No commitment, pay as you use" },
                { id: "solo_starter", name: "Solo Starter", price: "₦5,000", desc: "Up to 50 students, 10 tests" },
                { id: "solo_growth", name: "Solo Growth", price: "₦12,000", desc: "200 students, unlimited tests" },
                { id: "inst_starter", name: "Institution Starter", price: "₦50,000", desc: "200 students, 5 staff" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => account.changePlan(p.id as Plan)}
                  disabled={account.saving || details?.plan === p.id}
                  className={`flex flex-col p-5 rounded-2xl border-2 text-left transition-all relative ${
                    details?.plan === p.id 
                      ? "border-[var(--rubric-black)] bg-[#FAF8F3]" 
                      : "border-[var(--border)] hover:border-[var(--rubric-muted)]"
                  }`}
                >
                  {details?.plan === p.id && (
                    <span className="absolute top-4 right-4 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--rubric-black)] text-white">
                      <PiCheck className="h-3.5 w-3.5" />
                    </span>
                  )}
                  <p className="font-bold text-lg">{p.name}</p>
                  <p className="text-2xl font-bold mt-1">{p.price}<span className="text-xs font-normal text-[var(--rubric-muted)]">{p.id === 'solo_paygo' ? '' : '/mo'}</span></p>
                  <p className="text-sm text-[var(--rubric-muted)] mt-3 leading-relaxed">{p.desc}</p>
                  
                  <div className="mt-auto pt-6 flex items-center gap-1.5 text-xs font-bold text-[var(--rubric-black)] uppercase tracking-wider">
                    {details?.plan === p.id ? "Current Plan" : account.saving ? "Updating..." : "Select Plan"}
                    <PiCaretRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
            
            <div className="p-6 rounded-2xl bg-[#FAF8F3] border border-[var(--border)]">
              <h4 className="font-semibold">Institution Plans</h4>
              <p className="text-sm text-[var(--rubric-muted)] mt-1">For schools and larger organizations requiring bulk access and SLA support.</p>
              <DashboardButton variant="secondary" className="mt-4">
                View all institution tiers
              </DashboardButton>
            </div>
          </div>
        </ResponsiveSheet>
      )}
        <DashboardPanel className="p-6">
          <p className="mb-5 text-sm font-semibold text-[var(--rubric-muted)]">Related models</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {account.usageCards.map(([label, value]) => (
              <div key={label} className="rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4">
                <p className="text-xs font-bold uppercase text-[var(--rubric-muted)]">{label}</p>
                <p className="mt-3 text-3xl font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </DashboardPanel>

        <DashboardPanel className="p-6">
          <p className="mb-5 text-sm font-semibold text-[var(--rubric-muted)]">Recent transactions</p>
          <div className="space-y-3">
            {transactions.length ? (
              transactions.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-3">
                  <div>
                    <p className="text-sm font-semibold">{transaction.type === "cr" ? "Credit" : "Debit"}</p>
                    <p className="text-xs text-[var(--rubric-muted)]">{formatDate(transaction.createdAt)}</p>
                  </div>
                  <p className="font-semibold">{formatMoney(transaction.amount)}</p>
                </div>
              ))
            ) : (
              <p className="rounded-lg border border-dashed border-[var(--border)] p-5 text-sm text-[var(--rubric-muted)]">
                No transactions yet.
              </p>
            )}
          </div>
        </DashboardPanel>
      </section>

      {account.editOpen && (
        <ResponsiveSheet
          title="Edit account"
          onClose={() => account.setEditOpen(false)}
          footer={
            <DashboardButton onClick={account.saveAccount} disabled={account.saving} className="w-full">
              Save account
            </DashboardButton>
          }
        >
          <AccountForm account={account} />
        </ResponsiveSheet>
      )}

      {account.topUpOpen && (
        <ResponsiveSheet
          title="Top up wallet"
          onClose={() => account.setTopUpOpen(false)}
          footer={
            <DashboardButton onClick={account.submitTopUp} disabled={account.saving} className="w-full">
              Top up wallet
            </DashboardButton>
          }
        >
          <DashboardField label="Amount">
            <input
              type="number"
              min={1}
              value={account.topUpAmount}
              onChange={(event) => account.setTopUpAmount(Number(event.target.value))}
              className={fieldClass}
            />
          </DashboardField>
          <p className="mt-4 rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4 text-sm text-[var(--rubric-slate)]">
            This is a dummy top-up for now. It creates a local credit transaction and increments the wallet balance.
          </p>
        </ResponsiveSheet>
      )}
    </div>
  );
}

function AccountForm({ account }: { account: ReturnType<typeof useAccountPage> }) {
  const form = account.form;
  const set = (key: keyof typeof form, value: any) => account.setForm((current) => ({ ...current, [key]: value }));

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <DashboardField label="First name">
        <input value={form.firstName ?? ""} onChange={(event) => set("firstName", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Last name">
        <input value={form.lastName ?? ""} onChange={(event) => set("lastName", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Email">
        <input type="email" value={form.email ?? ""} onChange={(event) => set("email", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Unique ID">
        <input value={form.uniqueId ?? ""} onChange={(event) => set("uniqueId", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Phone">
        <input value={form.phone ?? ""} onChange={(event) => set("phone", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="City">
        <input value={form.city ?? ""} onChange={(event) => set("city", event.target.value)} className={fieldClass} />
      </DashboardField>
      <DashboardField label="Gender">
        <DashboardSelect
          value={form.gender ?? "male"}
          onValueChange={(value) => set("gender", value)}
          options={genderOptions.map((option) => ({ value: option, label: labelize(option) }))}
        />
      </DashboardField>
      <DashboardField label="Image URL">
        <input value={form.image ?? ""} onChange={(event) => set("image", event.target.value)} className={fieldClass} />
      </DashboardField>
    </div>
  );
}
