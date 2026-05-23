"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  PiCertificate,
  PiPlus,
  PiTrash,
  PiX,
} from "react-icons/pi";
import {
  ConfirmationDialog,
  DashboardButton,
  DashboardField,
  DashboardPanel,
  ResponsiveSheet,
  fieldClass,
} from "../components/primitives";
import {
  assignCertificate,
  deleteCertificate,
  fetchCertificates,
  removeCertificateAssignment,
  saveCertificate,
} from "@/app/actions/schoolOps";
import { useSchoolResource } from "../hooks/useSchoolResource";
import { formatDate } from "../lib/schoolOptions";
import { DashboardSelect } from "../components/DashboardDropdown";
import { useSession } from "@/app/SessionContext";
import { PenNibIcon, SealCheckIcon, UserPlusIcon } from "@phosphor-icons/react";

const emptyCertificate = {
  name: "",
  description: "",
  issuedBy: "",
  issuedAt: "",
};

export default function CertificatesPage() {
  const page = useSchoolResource({
    fetcher: fetchCertificates,
    saver: saveCertificate,
    deleter: deleteCertificate,
    emptyForm: emptyCertificate,
  });
  const certificates = page.data.certificates ?? [];
  const students = page.data.students ?? [];
  const [manageCertificate, setManageCertificate] = useState<any | null>(null);
  const [studentId, setStudentId] = useState("");
  const [certificateRef, setCertificateRef] = useState("");
  const { session } = useSession();

  async function assign() {
    if (!page.session?.id || !manageCertificate || !studentId) return;
    const response = await assignCertificate(
      page.session.id,
      manageCertificate.id,
      studentId,
      certificateRef,
    );
    if ("error" in response) toast.error(response.error);
    else {
      toast.success(response.message);
      setStudentId("");
      setCertificateRef("");
      setManageCertificate(null);
      await page.reload();
    }
  }

  async function remove(studentIdToRemove: string) {
    if (!page.session?.id || !manageCertificate) return;
    const response = await removeCertificateAssignment(
      page.session.id,
      manageCertificate.id,
      studentIdToRemove,
    );
    if ("error" in response) toast.error(response.error);
    else {
      toast.success(response.message);
      setManageCertificate(null);
      await page.reload();
    }
  }

  if (page.loading) return <DashboardPanel className="h-96 animate-pulse" />;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardButton onClick={page.openCreate}>
          <PiPlus className="h-5 w-5" /> New certificate
        </DashboardButton>
      </header>

      {certificates.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {certificates.map((certificate: any) => (
            <CertificateCard
              key={certificate.id}
              certificate={certificate}
              onAssign={() => setManageCertificate(certificate)}
              onEdit={() => page.openEdit(certificate.id, toCertificateForm(certificate))}
              onDelete={() => page.setDeleteId(certificate.id)}
            />
          ))}
        </div>
      ) : (
        <DashboardPanel className="flex min-h-[320px] flex-col items-center justify-center p-8 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#FAF8F3] text-[var(--rubric-black)]">
            <SealCheckIcon size={28} />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-[-0.02em] text-[var(--rubric-black)]">
            No certificates yet
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--rubric-slate)]">
            Create certificate records and assign them to students after
            completion, mastery, or institutional review.
          </p>
        </DashboardPanel>
      )}

      {page.sheetOpen && (
        <ResponsiveSheet
          title={page.editingId ? "Edit certificate" : "Create certificate"}
          onClose={() => page.setSheetOpen(false)}
          footer={
            <DashboardButton
              onClick={page.save}
              disabled={page.saving}
              className="w-full"
            >
              Save certificate
            </DashboardButton>
          }
        >
          <CertificateForm form={page.form} issuedBy={session?.firstName + " " + session?.lastName} setForm={page.setForm} />
        </ResponsiveSheet>
      )}

      {manageCertificate && (
        <ResponsiveSheet
          title={`Assign ${manageCertificate.name}`}
          onClose={() => setManageCertificate(null)}
          footer={
            <DashboardButton onClick={assign} className="w-full">
              Assign certificate
            </DashboardButton>
          }
        >
          <div className="space-y-4">
            <DashboardField label="Student">
              <DashboardSelect
                value={studentId}
                onValueChange={setStudentId}
                placeholder="Select student"
                options={students.map((student: any) => ({
                  value: student.id,
                  label: `${student.firstName} ${student.lastName}`,
                }))}
              />
            </DashboardField>
            <DashboardField label="Certificate reference">
              <input
                value={certificateRef}
                onChange={(event) => setCertificateRef(event.target.value)}
                className={fieldClass}
              />
            </DashboardField>
            <div className="space-y-2">
              {manageCertificate.students?.length ? (
                manageCertificate.students.map((item: any) => (
                  <div
                    key={item.studentId}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-3"
                  >
                    <span className="text-sm font-semibold">
                      {item.student.firstName} {item.student.lastName}
                    </span>
                    <button
                      onClick={() => remove(item.studentId)}
                      className="text-[var(--rubric-danger)]"
                    >
                      <PiX />
                    </button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[var(--rubric-muted)]">
                  No students assigned yet.
                </p>
              )}
            </div>
          </div>
        </ResponsiveSheet>
      )}

      {page.deleteId && (
        <ConfirmationDialog
          title="Delete certificate"
          description="This removes the certificate and its assignments."
          onClose={() => page.setDeleteId(null)}
          footer={
            <>
              <DashboardButton
                variant="secondary"
                onClick={() => page.setDeleteId(null)}
                className="flex-1"
              >
                Cancel
              </DashboardButton>
              <DashboardButton
                variant="danger"
                onClick={page.remove}
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

function CertificateCard({
  certificate,
  onAssign,
  onEdit,
  onDelete,
}: {
  certificate: any;
  onAssign: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const assignedCount = certificate.students?.length ?? 0;

  return (
    <DashboardPanel className="relative flex min-h-[288px] flex-col overflow-hidden p-5">
      <div className="pointer-events-none absolute right-[-38px] top-[-38px] h-32 w-32 rounded-full border border-[var(--border)] bg-[#FAF8F3]" />
      <div className="relative flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[var(--rubric-black)] text-white">
            <PiCertificate className="h-6 w-6" />
          </div>
          <div className="min-w-0">
          
            <h2 className="mt-2 line-clamp-2 text-xl font-semibold tracking-[-0.02em] text-[var(--rubric-black)]">
              {certificate.name}
            </h2>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            onClick={onAssign}
            className="rounded-full border border-[var(--border)] bg-white p-2 text-[var(--rubric-black)] transition hover:bg-[#FAF8F3]"
            aria-label={`Assign ${certificate.name}`}
          >
            <UserPlusIcon size={18} />
          </button>
          <button
            onClick={onEdit}
            className="rounded-full border border-[var(--border)] bg-white p-2 text-[var(--rubric-black)] transition hover:bg-[#FAF8F3]"
            aria-label={`Edit ${certificate.name}`}
          >
            <PenNibIcon size={18} />
          </button>
          <button
            onClick={onDelete}
            className="rounded-full border border-[rgba(180,35,24,0.22)] bg-white p-2 text-[var(--rubric-danger)] transition hover:bg-[rgba(180,35,24,0.08)]"
            aria-label={`Delete ${certificate.name}`}
          >
            <PiTrash size={18} />
          </button>
        </div>
      </div>

      {certificate.description && (
        <p className="relative mt-4 line-clamp-2 text-sm leading-6 text-[var(--rubric-slate)]">
          {certificate.description}
        </p>
      )}

      <div className="relative mt-5 grid grid-cols-2 gap-2">
        <CertificateInfo label="Issued by" value={certificate.issuedBy || "Not set"} />
        <CertificateInfo label="Issue date" value={formatDate(certificate.issuedAt)} />
      </div>

      <div className="relative mt-4 rounded-2xl border border-[var(--border)] bg-[#FAF8F3] p-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--rubric-muted)]">
              Assigned students
            </p>
            <p className="mt-1 text-2xl font-semibold text-[var(--rubric-black)]">
              {assignedCount}
            </p>
          </div>
          <SealCheckIcon size={28} className="text-[var(--rubric-muted)]" />
        </div>
      </div>
    </DashboardPanel>
  );
}

function CertificateInfo({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3">
      <p className="text-[11px] font-bold uppercase text-[var(--rubric-muted)]">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-semibold text-[var(--rubric-black)]">
        {value}
      </p>
    </div>
  );
}

function CertificateForm({
  form,
  issuedBy,
  setForm,
}: {
  form: any;
  issuedBy: string;
  setForm: (fn: any) => void;
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
      <DashboardField label="Description">
        <input
          value={form.description ?? ""}
          onChange={(event) => set("description", event.target.value)}
          className={fieldClass}
        />
      </DashboardField>
      <DashboardField label="Issued by">
        <input
          value={issuedBy ?? form.issuedBy}
          disabled
          onChange={(event) => set("issuedBy", event.target.value)}
          className={fieldClass}
        />
      </DashboardField>
      <DashboardField label="Issue date">
        <input
          type="date"
          value={form.issuedAt ?? ""}
          onChange={(event) => set("issuedAt", event.target.value)}
          className={fieldClass}
        />
      </DashboardField>
    </div>
  );
}

function toCertificateForm(item: any) {
  return {
    ...emptyCertificate,
    ...item,
    issuedAt: item.issuedAt
      ? new Date(item.issuedAt).toISOString().slice(0, 10)
      : "",
  };
}
