"use client";

import { useEffect, useState } from "react";
import {
  DashboardButton,
  DashboardField,
  fieldClass,
  ResponsiveSheet,
  textareaClass,
} from "./primitives";
import { useNewTestForm } from "@/app/dashboard/hooks/useNewTestForm";
import { DashboardSelect } from "./DashboardDropdown";
import { fetchClassLists, fetchSubjects } from "@/app/actions/schoolOps";
import { useSession } from "@/app/SessionContext";

type NewTestProps = {
  setNewTest: (isOpen: boolean) => void;
};

export default function NewTest({ setNewTest }: NewTestProps) {
  const { session } = useSession();
  const { form, isLoading, error, handleChange, updateField, handleSubmit } = useNewTestForm({
    onCreated: () => setNewTest(false),
  });
  const [classLists, setClassLists] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (session?.id) {
      fetchClassLists(session.id).then((res) => {
        if ("classLists" in res && res.classLists !== null && res.classLists !== undefined) {
          setClassLists(res.classLists);
        }
      });
      fetchSubjects(session.id).then((res) => {
        if ("subjects" in res && res.subjects !== null && res.subjects !== undefined) {
          setSubjects(res.subjects);
        }
      });
    }
  }, [session?.id]);

  const toggleClass = (id: string) => {
    const current = form.assignedClassIds || [];
    if (current.includes(id)) {
      updateField("assignedClassIds", current.filter((c) => c !== id));
    } else {
      updateField("assignedClassIds", [...current, id]);
    }
  };

  return (
    <ResponsiveSheet
      title="Create New Test"
      onClose={() => setNewTest(false)}
      className="md:max-w-[420px]"
      footer={
        <div className="flex justify-end gap-3">
          <DashboardButton
            type="button"
            variant="secondary"
            onClick={() => setNewTest(false)}
            disabled={isLoading}
          >
            Cancel
          </DashboardButton>
          <DashboardButton type="submit" form="new-test-form" disabled={isLoading}>
            {isLoading ? "Creating..." : "Create Test"}
          </DashboardButton>
        </div>
      }
    >
      <form id="new-test-form" onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg border border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.08)] p-3 text-sm text-[var(--rubric-danger)]">
            {error}
          </div>
        )}

        <DashboardField label="Test Name">
          <input
            name="name"
            placeholder="e.g., Chapter 5: Algebra Basics"
            value={form.name}
            onChange={handleChange}
            required
            className={fieldClass}
          />
        </DashboardField>

        <DashboardField label="Subject">
          <DashboardSelect
            value={form.subjectId}
            onValueChange={(value) => {
              const selectedSubject = subjects.find((s) => s.id === value);
              updateField("subjectId", value);
              updateField("subject", selectedSubject?.name || "");
            }}
            placeholder="Select a subject"
            options={subjects.map((s) => ({ value: s.id, label: `${s.name} (${s.code})` }))}
          />
        </DashboardField>

        <div className="grid grid-cols-2 gap-3">
          <DashboardField label="Difficulty">
            <DashboardSelect
              value={form.difficulty}
              onValueChange={(value) => updateField("difficulty", value)}
              options={[
                { value: "easy", label: "Easy" },
                { value: "medium", label: "Medium" },
                { value: "hard", label: "Hard" },
              ]}
            />
          </DashboardField>
          <DashboardField label="Visibility">
            <input value={form.visibility ? "Public" : "Private"} disabled readOnly className={fieldClass} />
          </DashboardField>
        </div>

        <DashboardField label="Assigned Classes">
          <div className="flex flex-wrap gap-2 rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-3">
            {classLists.length > 0 ? (
              classLists.map((cls) => (
                <button
                  key={cls.id}
                  type="button"
                  onClick={() => toggleClass(cls.id)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    form.assignedClassIds.includes(cls.id)
                      ? "bg-[var(--rubric-black)] text-white"
                      : "bg-white text-[var(--rubric-muted)] border border-[var(--border)]"
                  }`}
                >
                  {cls.name}
                </button>
              ))
            ) : (
              <p className="text-xs text-[var(--rubric-muted)]">No classes found. Create one first.</p>
            )}
          </div>
        </DashboardField>

        <DashboardField label="Description">
          <textarea
            name="description"
            placeholder="A brief summary of what this test covers"
            value={form.description}
            onChange={handleChange}
            rows={4}
            className={textareaClass}
          />
        </DashboardField>
      </form>
    </ResponsiveSheet>
  );
}
