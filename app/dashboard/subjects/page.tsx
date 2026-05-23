"use client";

import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
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
  deleteSubject,
  enrollStudentInSubject,
  fetchSubjects,
  removeStudentFromSubject,
  saveSubject,
} from "@/app/actions/schoolOps";
import { useSchoolResource } from "../hooks/useSchoolResource";
import { labelize, levelOptions } from "../lib/schoolOptions";
import { DashboardSelect } from "../components/DashboardDropdown";
import { PenNibIcon } from "@phosphor-icons/react";

const emptySubject = {
  name: "",
  code: "",
  description: "",
  level: "ss1",
  unit: 1,
  classListId: "",
};

export default function SubjectsPage() {
  const page = useSchoolResource({
    fetcher: fetchSubjects,
    saver: saveSubject,
    deleter: deleteSubject,
    emptyForm: emptySubject,
  });
  const subjects = page.data.subjects ?? [];
  const classLists = page.data.classLists ?? [];
  const students = page.data.students ?? [];
  const [manageSubject, setManageSubject] = useState<any | null>(null);
  const [studentId, setStudentId] = useState("");

  async function enroll() {
    if (!page.session?.id || !manageSubject || !studentId) return;
    const response = await enrollStudentInSubject(
      page.session.id,
      manageSubject.id,
      studentId,
    );
    if ("error" in response) toast.error(response.error);
    else {
      toast.success(response.message);
      setStudentId("");
      setManageSubject(null);
      await page.reload();
    }
  }

  async function remove(studentIdToRemove: string) {
    if (!page.session?.id || !manageSubject) return;
    const response = await removeStudentFromSubject(
      page.session.id,
      manageSubject.id,
      studentIdToRemove,
    );
    if ("error" in response) toast.error(response.error);
    else {
      toast.success(response.message);
      setManageSubject(null);
      await page.reload();
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Subject",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--rubric-black)]">
            {row.original.name}
          </span>
        ),
      },
      { accessorKey: "code", header: "Code" },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => labelize(row.original.level),
      },
      {
        accessorKey: "classList.name",
        header: "Class",
        cell: ({ row }) => row.original.classList?.name ?? "Not set",
      },
      {
        id: "students",
        header: "Students",
        cell: ({ row }) => row.original.enrollments?.length ?? 0,
      },
      {
        id: "materials",
        header: "Materials",
        cell: ({ row }) => row.original.materials?.length ?? 0,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => setManageSubject(row.original)}
              className="rounded-full border border-[var(--border)] p-2"
            >
              <PiUserPlus size={20} />
            </button>
            <button
              onClick={() =>
                page.openEdit(row.original.id, toSubjectForm(row.original))
              }
              className="rounded-full border border-[var(--border)] p-2"
            >
              <PenNibIcon size={20} />
            </button>
            <button
              onClick={() => page.setDeleteId(row.original.id)}
              className="rounded-full border border-[rgba(180,35,24,0.22)] p-2 text-[var(--rubric-danger)]"
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
        <div className="flex gap-3">
          <Link href="/dashboard/materials" className="rubric-button-secondary">
            Manage Materials
          </Link>
          <DashboardButton onClick={page.openCreate}>
            <PiPlus className="h-5 w-5" /> New subject
          </DashboardButton>
        </div>
      </header>

      <DashboardDataTable
        data={subjects}
        columns={columns}
        searchPlaceholder="Search subjects..."
      />

      {page.sheetOpen && (
        <ResponsiveSheet
          title={page.editingId ? "Edit subject" : "Create subject"}
          onClose={() => page.setSheetOpen(false)}
          footer={
            <DashboardButton
              onClick={page.save}
              disabled={page.saving}
              className="w-full"
            >
              Save subject
            </DashboardButton>
          }
        >
          <SubjectForm
            form={page.form}
            setForm={page.setForm}
            classLists={classLists}
          />
        </ResponsiveSheet>
      )}

      {manageSubject && (
        <ResponsiveSheet
          title={`Students in ${manageSubject.name}`}
          onClose={() => setManageSubject(null)}
          footer={
            <DashboardButton onClick={enroll} className="w-full">
              Enroll student
            </DashboardButton>
          }
        >
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
          <div className="mt-5 space-y-2">
            {manageSubject.enrollments?.length ? (
              manageSubject.enrollments.map((item: any) => (
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
                No students enrolled yet.
              </p>
            )}
          </div>
        </ResponsiveSheet>
      )}

      {page.deleteId && (
        <ConfirmationDialog
          title="Delete subject"
          description="This removes the subject and related enrollments/materials."
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

function SubjectForm({
  form,
  setForm,
  classLists,
}: {
  form: any;
  setForm: (fn: any) => void;
  classLists: any[];
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
      <DashboardField label="Code">
        <input
          value={form.code}
          onChange={(event) => set("code", event.target.value)}
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
      <DashboardField label="Class">
        <DashboardSelect
          value={form.classListId}
          onValueChange={(value) => set("classListId", value)}
          placeholder="Select class"
          options={classLists.map((item) => ({
            value: item.id,
            label: item.name,
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
      <DashboardField label="Unit">
        <input
          type="number"
          min={1}
          value={form.unit}
          onChange={(event) => set("unit", Number(event.target.value))}
          className={fieldClass}
        />
      </DashboardField>
    </div>
  );
}

function toSubjectForm(item: any) {
  return { ...emptySubject, ...item };
}
