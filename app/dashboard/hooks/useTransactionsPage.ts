"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchTransactions, topUpWallet } from "@/app/actions/accountOps";
import { useSession } from "@/app/SessionContext";

export function useTransactionsPage() {
  const { session } = useSession();
  const [data, setData] = useState<any>({ transactions: [], wallet: null });
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [amount, setAmount] = useState(5000);
  const [saving, setSaving] = useState(false);
  const userId = session?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const response = await fetchTransactions(userId);
    if ("error" in response) {
      toast.error(response.error);
    } else {
      setData(response);
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  async function submitTopUp() {
    if (!userId) return;
    setSaving(true);
    const response = await topUpWallet(userId, amount);
    setSaving(false);
    if ("error" in response) {
      toast.error(response.error);
      return;
    }
    toast.success(response.message);
    setSheetOpen(false);
    await load();
  }

  return { data, loading, sheetOpen, setSheetOpen, amount, setAmount, saving, submitTopUp };
}
