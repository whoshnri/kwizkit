"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useSession } from "@/app/SessionContext";

type SaveResult = { error?: string; message?: string };

export function useSchoolResource<TPayload>({
  fetcher,
  saver,
  deleter,
  emptyForm,
}: {
  fetcher: (userId: string) => Promise<any>;
  saver: (userId: string, input: any, id?: string) => Promise<SaveResult>;
  deleter: (userId: string, id: string) => Promise<SaveResult>;
  emptyForm: TPayload;
}) {
  const { session } = useSession();
  const userId = session?.id;
  const [data, setData] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<TPayload>(emptyForm);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const response = await fetcher(userId);
    if ("error" in response) {
      toast.error(response.error);
    } else {
      setData(response);
    }
    setLoading(false);
  }, [fetcher, userId]);

  useEffect(() => {
    void load();
  }, [load]);

  function openCreate() {
    setEditingId(undefined);
    setForm(emptyForm);
    setSheetOpen(true);
  }

  function openEdit(id: string, nextForm: TPayload) {
    setEditingId(id);
    setForm(nextForm);
    setSheetOpen(true);
  }

  async function save() {
    if (!userId) return;
    setSaving(true);
    const response = await saver(userId, form, editingId);
    setSaving(false);
    if (response.error) {
      toast.error(response.error);
      return;
    }
    toast.success(response.message ?? "Saved");
    setSheetOpen(false);
    await load();
  }

  async function remove() {
    if (!userId || !deleteId) return;
    setSaving(true);
    const response = await deleter(userId, deleteId);
    setSaving(false);
    if (response.error) {
      toast.error(response.error);
      return;
    }
    toast.success(response.message ?? "Deleted");
    setDeleteId(null);
    await load();
  }

  return {
    session,
    data,
    loading,
    saving,
    sheetOpen,
    setSheetOpen,
    deleteId,
    setDeleteId,
    editingId,
    form,
    setForm,
    openCreate,
    openEdit,
    save,
    remove,
    reload: load,
  };
}
