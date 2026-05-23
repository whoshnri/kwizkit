"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/app/SessionContext";
import {
  AccountUpdateInput,
  fetchAccountOverview,
  topUpWallet,
  updateAccount,
} from "@/app/actions/accountOps";
import { updateUserPlan } from "@/app/actions/planOps";
import { Plan } from "@/lib/generated/prisma/client";
import { PLAN_CONFIG } from "@/lib/plans";

export function useAccountPage() {
  const { session, refreshSession } = useSession();
  const [overview, setOverview] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(5000);
  const [form, setForm] = useState<AccountUpdateInput>({});

  const userId = session?.id;

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const response = await fetchAccountOverview(userId);
    if ("error" in response) {
      toast.error(response.error);
      setOverview(null);
    } else {
      setOverview(response);
      setForm({
        firstName: response.account.firstName,
        lastName: response.account.lastName,
        email: response.account.email,
        uniqueId: response.account.uniqueId,
        image: response.account.image,
        gender: response.account.gender,
        phone: response.account.phone,
        city: response.account.city,
      });
    }
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const usageCards = useMemo(() => {
    const usage = overview?.usage ?? {};
    return [
      ["Tests", usage.tests ?? 0],
      ["Students", usage.students ?? 0],
      ["Classes", usage.classes ?? 0],
      ["Subjects", usage.subjects ?? 0],
      ["Materials", usage.materials ?? 0],
      ["Certificates", usage.certificates ?? 0],
      ["Attempts", usage.liveAttempts ?? 0],
      ["Scores", usage.testScores ?? 0],
    ];
  }, [overview]);

  async function saveAccount() {
    if (!userId) return;
    setSaving(true);
    const response = await updateAccount(userId, form);
    setSaving(false);
    if ("error" in response) {
      toast.error(response.error);
      return;
    }
    toast.success(response.message);
    setEditOpen(false);
    await refreshSession();
    await load();
  }

  async function submitTopUp() {
    if (!userId) return;
    setSaving(true);
    const response = await topUpWallet(userId, topUpAmount);
    setSaving(false);
    if ("error" in response) {
      toast.error(response.error);
      return;
    }
    toast.success(response.message);
    setTopUpOpen(false);
    await load();
  }

  async function changePlan(plan: Plan) {
    if (!userId) return;
    setSaving(true);
    const response = await updateUserPlan(userId, plan);
    setSaving(false);
    if ("error" in response) {
      toast.error(response.error);
      return;
    }
    toast.success("Plan updated successfully");
    setPlanOpen(false);
    await refreshSession();
    await load();
  }

  const currentPlanLimits = useMemo(() => {
    if (!overview?.account?.plan) return null;
    return PLAN_CONFIG[overview.account.plan as Plan];
  }, [overview]);

  return {
    session,
    overview,
    loading,
    saving,
    form,
    setForm,
    editOpen,
    setEditOpen,
    topUpOpen,
    setTopUpOpen,
    planOpen,
    setPlanOpen,
    topUpAmount,
    setTopUpAmount,
    usageCards,
    saveAccount,
    submitTopUp,
    changePlan,
    currentPlanLimits,
  };
}
