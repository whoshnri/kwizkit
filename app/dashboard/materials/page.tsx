"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { PiPencilSimple, PiPlus, PiTrash } from "react-icons/pi";
import DashboardDataTable from "../components/DashboardDataTable";
import {
  ConfirmationDialog,
  DashboardButton,
  DashboardField,
  DashboardPanel,
  ResponsiveSheet,
  fieldClass,
} from "../components/primitives";
import {
  deleteMaterial,
  fetchMaterials,
  saveMaterial,
} from "@/app/actions/schoolOps";
import { useSession } from "@/app/SessionContext";
import {
  formatDate,
  labelize,
  levelOptions,
  materialTypeOptions,
} from "../lib/schoolOptions";
import { DashboardSelect } from "../components/DashboardDropdown";
import { PenNibIcon } from "@phosphor-icons/react";

const emptyMaterial = {
  name: "",
  level: "ss1",
  type: "document",
  subjectId: "",
};

export default function MaterialsPage() {
  const { session } = useSession();
  const [data, setData] = useState<any>({ materials: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | undefined>();
  const [form, setForm] = useState<any>(emptyMaterial);
  const [file, setFile] = useState<File | null>(null);

  const load = useCallback(async () => {
    if (!session?.id) return;
    setLoading(true);
    const response = await fetchMaterials(session.id);
    if ("error" in response) toast.error(response.error);
    else setData(response);
    setLoading(false);
  }, [session?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (!session?.id) return;
    setSaving(true);
    const response = await saveMaterial(session.id, form, file, editingId);
    setSaving(false);
    if ("error" in response) {
      toast.error(response.error);
      return;
    }
    toast.success(response.message);
    setSheetOpen(false);
    setFile(null);
    await load();
  }

  async function remove() {
    if (!session?.id || !deleteId) return;
    const response = await deleteMaterial(session.id, deleteId);
    if ("error" in response) toast.error(response.error);
    else {
      toast.success(response.message);
      setDeleteId(null);
      await load();
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Material",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--rubric-black)]">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "subject.name",
        header: "Subject",
        cell: ({ row }) => row.original.subject?.name ?? "Not set",
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => labelize(row.original.type),
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => labelize(row.original.level),
      },
      {
        accessorKey: "createdAt",
        header: "Created",
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => {
                setEditingId(row.original.id);
                setForm(toMaterialForm(row.original));
                setSheetOpen(true);
              }}
              className="rounded-full border border-[var(--border)] p-2"
            >
              <PenNibIcon size={20} />
            </button>
            <button
              onClick={() => setDeleteId(row.original.id)}
              className="rounded-full border border-[rgba(180,35,24,0.22)] p-2 text-[var(--rubric-danger)]"
            >
              <PiTrash size={20} />
            </button>
          </div>
        ),
      },
    ],
    [],
  );

  if (loading) return <DashboardPanel className="h-96 animate-pulse" />;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardButton
          onClick={() => {
            setEditingId(undefined);
            setForm(emptyMaterial);
            setFile(null);
            setSheetOpen(true);
          }}
        >
          <PiPlus className="h-5 w-5" /> New material
        </DashboardButton>
      </header>
      <DashboardDataTable
        data={data.materials ?? []}
        columns={columns}
        searchPlaceholder="Search materials..."
      />

      {sheetOpen && (
        <ResponsiveSheet
          title={editingId ? "Edit material" : "Create material"}
          onClose={() => setSheetOpen(false)}
          footer={
            <DashboardButton
              onClick={save}
              disabled={saving}
              className="w-full"
            >
              Save material
            </DashboardButton>
          }
        >
          <MaterialForm
            form={form}
            setForm={setForm}
            subjects={data.subjects ?? []}
            setFile={setFile}
          />
        </ResponsiveSheet>
      )}
      {deleteId && (
        <ConfirmationDialog
          title="Delete material"
          description="This removes the material metadata. Uploaded dummy files are left on disk for now."
          onClose={() => setDeleteId(null)}
          footer={
            <>
              <DashboardButton
                variant="secondary"
                onClick={() => setDeleteId(null)}
                className="flex-1"
              >
                Cancel
              </DashboardButton>
              <DashboardButton
                variant="danger"
                onClick={remove}
                className="flex-1"
              >
                Delete
              </DashboardButton>
            </>
          }
        />
      )}
    </div>
  );
}

function MaterialForm({
  form,
  setForm,
  subjects,
  setFile,
}: {
  form: any;
  setForm: (fn: any) => void;
  subjects: any[];
  setFile: (file: File | null) => void;
}) {
  const set = (key: string, value: any) =>
    setForm((current: any) => ({ ...current, [key]: value }));
  return (
    <div className="space-y-4">
      <DashboardField label="Name">
        <input
          value={form.name}
          onChange={(event) => set("name", event.target.value)}
          className={fieldClass}
        />
      </DashboardField>
      <DashboardField label="Subject">
        <DashboardSelect
          value={form.subjectId}
          onValueChange={(value) => set("subjectId", value)}
          placeholder="Select subject"
          options={subjects.map((subject) => ({
            value: subject.id,
            label: subject.name,
          }))}
        />
      </DashboardField>
      <DashboardField label="Level">
        <DashboardSelect
          value={form.level}
          onValueChange={(value) => set("level", value)}
          options={levelOptions.map((option) => ({
            value: option,
            label: labelize(option),
          }))}
        />
      </DashboardField>
      <DashboardField label="Type">
        <DashboardSelect
          value={form.type}
          onValueChange={(value) => set("type", value)}
          options={materialTypeOptions.map((option) => ({
            value: option,
            label: labelize(option),
          }))}
        />
      </DashboardField>
      <DashboardField label="File">
        <input
          type="file"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          className={`${fieldClass} pt-3`}
        />
      </DashboardField>
    </div>
  );
}

function toMaterialForm(item: any) {
  return { ...emptyMaterial, ...item, subjectId: item.subjectId };
}
