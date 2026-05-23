"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { PiFileText, PiPlus, PiTrash } from "react-icons/pi";
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
import { PenNibIcon, StackIcon } from "@phosphor-icons/react";

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

      {(data.materials ?? []).length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {(data.materials ?? []).map((material: any) => (
            <MaterialCard
              key={material.id}
              material={material}
              onEdit={() => {
                setEditingId(material.id);
                setForm(toMaterialForm(material));
                setSheetOpen(true);
              }}
              onDelete={() => setDeleteId(material.id)}
            />
          ))}
        </div>
      ) : (
        <DashboardPanel className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F3] text-[var(--rubric-black)]">
            <StackIcon size={26} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-[var(--rubric-black)]">
            No materials yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--rubric-slate)]">
            Add lesson notes, documents, videos, or reference files and attach
            them to the subject they support.
          </p>
        </DashboardPanel>
      )}

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

function MaterialCard({
  material,
  onEdit,
  onDelete,
}: {
  material: any;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const files = parseFiles(material.files);

  return (
    <DashboardPanel className="flex min-h-[260px] flex-col overflow-hidden p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#FAF8F3] text-[var(--rubric-black)]">
            <PiFileText className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--rubric-muted)]">
              {labelize(material.type)}
            </p>
            <h2 className="mt-2 line-clamp-2 text-xl font-semibold tracking-[-0.02em] text-[var(--rubric-black)]">
              {material.name}
            </h2>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onEdit}
            className="rounded-full border border-[var(--border)] bg-white p-2 text-[var(--rubric-black)] transition hover:bg-[#FAF8F3]"
            aria-label={`Edit ${material.name}`}
          >
            <PenNibIcon size={18} />
          </button>
          <button
            onClick={onDelete}
            className="rounded-full border border-[rgba(180,35,24,0.22)] bg-white p-2 text-[var(--rubric-danger)] transition hover:bg-[rgba(180,35,24,0.08)]"
            aria-label={`Delete ${material.name}`}
          >
            <PiTrash size={18} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2">
        <InfoPill label="Subject" value={material.subject?.name ?? "Not set"} />
        <InfoPill label="Level" value={labelize(material.level)} />
      </div>

      <div className="mt-4 rounded-2xl border border-[var(--border)] bg-[#FAF8F3] p-3">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--rubric-muted)]">
          Files
        </p>
        <p className="mt-2 text-sm font-semibold text-[var(--rubric-black)]">
          {files.length ? `${files.length} uploaded file${files.length === 1 ? "" : "s"}` : "No file attached"}
        </p>
      </div>

      <div className="mt-auto pt-5 text-xs font-medium text-[var(--rubric-muted)]">
        Created {formatDate(material.createdAt)}
      </div>
    </DashboardPanel>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--rubric-muted)]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--rubric-black)]">
        {value}
      </p>
    </div>
  );
}

function parseFiles(files: unknown) {
  if (Array.isArray(files)) return files;
  if (typeof files !== "string") return [];
  try {
    const parsed = JSON.parse(files);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
