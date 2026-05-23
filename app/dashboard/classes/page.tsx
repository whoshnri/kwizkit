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
  addStudentToClass,
  deleteClassList,
  fetchClassLists,
  removeStudentFromClass,
  saveClassList,
} from "@/app/actions/schoolOps";
import { useSchoolResource } from "../hooks/useSchoolResource";
import { labelize, levelOptions } from "../lib/schoolOptions";
import { DashboardSelect } from "../components/DashboardDropdown";
import { PenNibIcon } from "@phosphor-icons/react";

const emptyClass = {
  name: "",
  description: "",
  level: "ss1",
  session: "",
  isActive: true,
};

export default function ClassesPage() {
  const page = useSchoolResource({
    fetcher: fetchClassLists,
    saver: saveClassList,
    deleter: deleteClassList,
    emptyForm: emptyClass,
  });
  const [manageClass, setManageClass] = useState<any | null>(null);
  const [studentId, setStudentId] = useState("");
  const classes = page.data.classLists ?? [];
  const students = page.data.students ?? [];

  async function addStudent() {
    if (!page.session?.id || !manageClass || !studentId) return;
    const response = await addStudentToClass(
      page.session.id,
      manageClass.id,
      studentId,
    );
    if ("error" in response) toast.error(response.error);
    else {
      toast.success(response.message);
      setStudentId("");
      await page.reload();
      setManageClass(null);
    }
  }

  async function removeStudent(targetStudentId: string) {
    if (!page.session?.id || !manageClass) return;
    const response = await removeStudentFromClass(
      page.session.id,
      manageClass.id,
      targetStudentId,
    );
    if ("error" in response) toast.error(response.error);
    else {
      toast.success(response.message);
      await page.reload();
      setManageClass(null);
    }
  }

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Class",
        cell: ({ row }) => (
          <span className="font-semibold text-[var(--rubric-black)]">
            {row.original.name}
          </span>
        ),
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => labelize(row.original.level),
      },
      {
        accessorKey: "session",
        header: "Session",
        cell: ({ row }) => row.original.session || "Not set",
      },
      {
        id: "students",
        header: "Students",
        cell: ({ row }) => row.original.students?.length ?? 0,
      },
      {
        id: "subjects",
        header: "Subjects",
        cell: ({ row }) => row.original.subjects?.length ?? 0,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => setManageClass(row.original)}
              className="rounded-full border border-[var(--border)] p-2"
            >
              <PiUserPlus  size={20}/>
            </button>
            <button
              onClick={() =>
                page.openEdit(row.original.id, toClassForm(row.original))
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
        
        <DashboardButton onClick={page.openCreate}>
          <PiPlus className="h-5 w-5" /> New class
        </DashboardButton>
      </header>
      <DashboardDataTable
        data={classes}
        columns={columns}
        searchPlaceholder="Search classes..."
      />

      {page.sheetOpen && (
        <ResponsiveSheet
          title={page.editingId ? "Edit class" : "Create class"}
          onClose={() => page.setSheetOpen(false)}
          footer={
            <DashboardButton
              onClick={page.save}
              disabled={page.saving}
              className="w-full"
            >
              Save class
            </DashboardButton>
          }
        >
          <ClassForm form={page.form} setForm={page.setForm} />
        </ResponsiveSheet>
      )}

      {manageClass && (
        <ResponsiveSheet
          title={`Students in ${manageClass.name}`}
          onClose={() => setManageClass(null)}
          footer={
            <DashboardButton onClick={addStudent} className="w-full">
              Append student
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
            {manageClass.students?.length ? (
              manageClass.students.map((item: any) => (
                <div
                  key={item.studentId}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-3"
                >
                  <span className="text-sm font-semibold">
                    {item.student.firstName} {item.student.lastName}
                  </span>
                  <button
                    onClick={() => removeStudent(item.studentId)}
                    className="text-[var(--rubric-danger)]"
                  >
                    <PiX />
                  </button>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--rubric-muted)]">
                No students in this class yet.
              </p>
            )}
          </div>
        </ResponsiveSheet>
      )}

      {page.deleteId && (
        <ConfirmationDialog
          title="Delete class"
          description="This removes the class and its student assignments."
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

function ClassForm({
  form,
  setForm,
}: {
  form: any;
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
      <DashboardField label="Session">
        <input
          value={form.session ?? ""}
          onChange={(event) => set("session", event.target.value)}
          className={fieldClass}
        />
      </DashboardField>
      <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[#FAF8F3] px-4 py-3 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => set("isActive", event.target.checked)}
          className="h-5 w-5 accent-[var(--rubric-black)]"
        />{" "}
        Active class
      </label>
    </div>
  );
}

function toClassForm(item: any) {
  return { ...emptyClass, ...item };
}
