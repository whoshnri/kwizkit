"use client";

import { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { PiEye, PiPencilSimple, PiPlus, PiTrash } from "react-icons/pi";
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
  deleteStudent,
  fetchStudents,
  saveStudent,
} from "@/app/actions/schoolOps";
import { useSchoolResource } from "../hooks/useSchoolResource";
import {
  formatDate,
  genderOptions,
  labelize,
  levelOptions,
} from "../lib/schoolOptions";
import { DashboardSelect } from "../components/DashboardDropdown";
import { PenNibIcon } from "@phosphor-icons/react";

const emptyStudent = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  gender: "male",
  image: "",
  level: "ss1",
  studentId: "",
  dateOfBirth: "",
  address: "",
  guardianName: "",
  guardianPhone: "",
  isActive: true,
};

export default function StudentsPage() {
  const page = useSchoolResource({
    fetcher: fetchStudents,
    saver: saveStudent,
    deleter: deleteStudent,
    emptyForm: emptyStudent,
  });
  const [detail, setDetail] = useState<any | null>(null);
  const students = page.data.students ?? [];

  const columns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: "lastName",
        header: "Student",
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-base text-[var(--rubric-black)]">
              {row.original.firstName} {row.original.lastName}
            </p>
            <p className="text-sm text-[var(--rubric-muted)]">
              {row.original.email}
            </p>
          </div>
        ),
      },
      {
        accessorKey: "studentId",
        header: "Student ID",
        cell: ({ row }) => row.original.studentId || "Not set",
      },
      {
        accessorKey: "level",
        header: "Level",
        cell: ({ row }) => labelize(row.original.level),
      },
      {
        accessorKey: "phone",
        header: "Phone",
        cell: ({ row }) => row.original.phone || "Not set",
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }) => (row.original.isActive ? "Active" : "Inactive"),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            <button
              onClick={() => setDetail(row.original)}
              className="rounded-full border border-[var(--border)] p-2"
            >
              <PiEye size={20} />
            </button>
            <button
              onClick={() =>
                page.openEdit(row.original.id, toStudentForm(row.original))
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
        <div>
          <p className="text-sm font-semibold text-[var(--rubric-muted)]">
            Records
          </p>
          <h1 className="mt-2 text-3xl font-semibold">Students</h1>
        </div>
        <DashboardButton onClick={page.openCreate}>
          <PiPlus className="h-5 w-5" /> Add student
        </DashboardButton>
      </header>

      <DashboardDataTable
        data={students}
        columns={columns}
        searchPlaceholder="Search students..."
      />

      {page.sheetOpen && (
        <ResponsiveSheet
          title={page.editingId ? "Edit student" : "Add student"}
          onClose={() => page.setSheetOpen(false)}
          className="md:max-w-3xl"
          footer={
            <DashboardButton
              onClick={page.save}
              disabled={page.saving}
              className="w-full"
            >
              Save student
            </DashboardButton>
          }
        >
          <StudentForm form={page.form} setForm={page.setForm} />
        </ResponsiveSheet>
      )}

      {detail && (
        <StudentDetail student={detail} onClose={() => setDetail(null)} />
      )}

      {page.deleteId && (
        <ConfirmationDialog
          title="Delete student"
          description="This removes the student and their related join records."
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
                disabled={page.saving}
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

function StudentForm({
  form,
  setForm,
}: {
  form: any;
  setForm: (fn: any) => void;
}) {
  const set = (key: string, value: any) =>
    setForm((current: any) => ({ ...current, [key]: value }));
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[
        ["firstName", "First name"],
        ["lastName", "Last name"],
        ["email", "Email"],
        ["phone", "Phone"],
        ["studentId", "Student ID"],
        ["image", "Image URL"],
        ["address", "Address"],
        ["guardianName", "Guardian name"],
        ["guardianPhone", "Guardian phone"],
      ].map(([key, label]) => (
        <DashboardField key={key} label={label}>
          <input
            value={form[key] ?? ""}
            onChange={(event) => set(key, event.target.value)}
            className={fieldClass}
          />
        </DashboardField>
      ))}
      <DashboardField label="Gender">
        <DashboardSelect
          value={form.gender}
          onValueChange={(value) => set("gender", value)}
          options={genderOptions.map((option) => ({
            value: option,
            label: labelize(option),
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
      <DashboardField label="Date of birth">
        <input
          type="date"
          value={form.dateOfBirth ?? ""}
          onChange={(event) => set("dateOfBirth", event.target.value)}
          className={fieldClass}
        />
      </DashboardField>
      <label className="flex items-center gap-3 rounded-lg border border-[var(--border)] bg-[#FAF8F3] px-4 py-3 text-sm font-semibold">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(event) => set("isActive", event.target.checked)}
          className="h-5 w-5 accent-[var(--rubric-black)]"
        />
        Active student
      </label>
    </div>
  );
}

function StudentDetail({
  student,
  onClose,
}: {
  student: any;
  onClose: () => void;
}) {
  return (
    <ResponsiveSheet
      title="Student relationships"
      onClose={onClose}
      className="md:max-w-3xl"
    >
      <div className="space-y-5">
        <div>
          <h2 className="text-2xl font-semibold">
            {student.firstName} {student.lastName}
          </h2>
          <p className="mt-1 text-sm text-[var(--rubric-muted)]">
            {student.email}
          </p>
        </div>
        <Relation
          title="Classes"
          items={student.classLists?.map((item: any) => item.classList.name)}
        />
        <Relation
          title="Subjects"
          items={student.subjectEnrollments?.map(
            (item: any) => item.subject.name,
          )}
        />
        <Relation
          title="Certificates"
          items={student.certifications?.map(
            (item: any) =>
              `${item.certification.name}${item.certificateRef ? ` (${item.certificateRef})` : ""}`,
          )}
        />
        <Relation
          title="Test scores"
          items={student.testScores?.map(
            (item: any) =>
              `${item.test.name}: ${item.score}/${item.totalMarks}`,
          )}
        />
        <Relation
          title="Live attempts"
          items={student.liveAttempts?.map(
            (item: any) =>
              `${item.test.name}: ${item.submittedAt ? "Submitted" : "In progress"}`,
          )}
        />
        <Relation
          title="Attendance"
          items={student.attendanceRecords?.map(
            (item: any) =>
              `${formatDate(item.session.date)} - ${labelize(item.status)}`,
          )}
        />
      </div>
    </ResponsiveSheet>
  );
}

function Relation({ title, items = [] }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4">
      <p className="text-sm font-semibold">{title}</p>
      <div className="mt-3 space-y-2 text-sm text-[var(--rubric-slate)]">
        {items.length ? (
          items.map((item) => <p key={item}>{item}</p>)
        ) : (
          <p>None yet.</p>
        )}
      </div>
    </div>
  );
}

function toStudentForm(student: any) {
  return {
    ...emptyStudent,
    ...student,
    dateOfBirth: student.dateOfBirth
      ? new Date(student.dateOfBirth).toISOString().slice(0, 10)
      : "",
  };
}
