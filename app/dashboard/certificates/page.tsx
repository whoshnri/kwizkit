"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  PiPencilSimple,
  PiPlus,
  PiTrash,
  PiUserPlus,
  PiX,
} from "react-icons/pi";
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
import { PenNibIcon, UserPlusIcon } from "@phosphor-icons/react";

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

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Certificate",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--rubric-black)]">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "issuedBy",
        header: "Issued by",
        cell: ({ row }) => row.original.issuedBy || "Not set",
      },
      {
        accessorKey: "issuedAt",
        header: "Issue date",
        cell: ({ row }) => formatDate(row.original.issuedAt),
      },
      {
        id: "students",
        header: "Students",
        cell: ({ row }) => row.original.students?.length ?? 0,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => setManageCertificate(row.original)}
              className="rounded-full text-base border border-[var(--border)] p-2"
            >
              <UserPlusIcon size={20}/>
            </button>
            <button
              onClick={() =>
                page.openEdit(row.original.id, toCertificateForm(row.original))
              }
              className="rounded-full text-base border border-[var(--border)] p-2"
            >
              <PenNibIcon size={20} />
            </button>
            <button
              onClick={() => page.setDeleteId(row.original.id)}
              className="rounded-full text-base border border-[rgba(180,35,24,0.22)] p-2 text-[var(--rubric-danger)]"
            >
              <PiTrash size={20} />
            </button>
          </div>
        ),
      },
    ],
    [page],
  );

  if (page.loading) return <DashboardPanel className="h-96 animate-pulse" />;

  return (
    <div className="space-y-6 pb-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <DashboardButton onClick={page.openCreate}>
          <PiPlus className="h-5 w-5" /> New certificate
        </DashboardButton>
      </header>
      <DashboardDataTable
        data={certificates}
        columns={columns}
        searchPlaceholder="Search certificates..."
      />

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
