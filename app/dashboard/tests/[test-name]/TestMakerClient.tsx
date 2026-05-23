"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  PiPlus,
  PiTrash,
  PiFloppyDisk,
  PiFileText,
  PiCheckCircle,
  PiCircle,
  PiWarningCircle,
  PiUsers,
  PiChartBar,
  PiGear,
  PiEye,
  PiEyeSlash,
  PiClock,
  PiCheck,
} from "react-icons/pi";
import {
  DashboardButton,
  DashboardField,
  fieldClass,
  ResponsiveSheet,
  textareaClass,
  DashboardPanel,
  StatusBadge,
} from "../../components/primitives";
import { DashboardSelect } from "../../components/DashboardDropdown";
import type { Question, Test } from "@/app/dashboard/hooks/useTestMaker";
import {
  useEditTestForm,
  useQuestionForm,
  useTestMaker,
} from "@/app/dashboard/hooks/useTestMaker";
import { PenNibIcon } from "@phosphor-icons/react";
import { fetchClassLists, fetchSubjects } from "@/app/actions/schoolOps";
import { useSession } from "@/app/SessionContext";
import { formatDate } from "../../lib/schoolOptions";

type QuestionType = Question["type"];

const TestMakerClient = ({ testSlug }: { testSlug: string }) => {
  const [activeTab, setActiveTab] = useState<
    "overview" | "questions" | "participation"
  >("questions");
  const {
    test,
    newTest,
    setNewTest,
    loading,
    error,
    saving,
    hasChanges,
    isModalOpen,
    activeQuestion,
    handleTestUpdate,
    handleDiscardChanges,
    handleModalOpen,
    handleModalClose,
    onSaveQuestion,
    handleDeleteQuestion,
    toggleVisibility,
  } = useTestMaker({ testSlug });

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--background)] p-6">
        <span className="loading loading-bars loading-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--background)] p-6">
        <div className="w-full max-w-sm rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-6 text-center">
          <PiWarningCircle className="mx-auto h-10 w-10 text-[var(--rubric-danger)]" />
          <p className="mt-3 text-base font-semibold text-[var(--rubric-danger)]">
            Error loading test
          </p>
          <p className="mt-2 text-sm text-[var(--rubric-slate)]">{error}</p>
        </div>
      </div>
    );
  }

  if (!test || !newTest) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[var(--background)] p-6 text-[var(--rubric-slate)]">
        No test data found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--rubric-black)]">
            {newTest.name}
          </h1>
          <p className="text-sm text-[var(--rubric-muted)]">
            {newTest.subject} · {newTest.difficulty} ·{" "}
            {newTest.numberOfQuestions} questions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardButton
            variant="secondary"
            onClick={toggleVisibility}
            className="h-10 px-4"
          >
            {newTest.visibility ? (
              <PiEye className="h-4 w-4" />
            ) : (
              <PiEyeSlash className="h-4 w-4" />
            )}
            {newTest.visibility ? "Public" : "Private"}
          </DashboardButton>
          {hasChanges && (
            <DashboardButton
              onClick={handleTestUpdate}
              disabled={saving}
              className="h-10 px-4"
            >
              {saving ? (
                <span className="loading loading-spinner loading-xs" />
              ) : (
                <PiFloppyDisk className="h-4 w-4" />
              )}
              Save Changes
            </DashboardButton>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border w-fit rounded-full bg-white border-[var(--border)]">
        <TabButton
          active={activeTab === "overview"}
          onClick={() => setActiveTab("overview")}
          icon={<PiGear size={20} />}
          label="Overview"
        />
        <TabButton
          active={activeTab === "questions"}
          onClick={() => setActiveTab("questions")}
          icon={<PiFileText size={20} />}
          label="Questions"
        />
        <TabButton
          active={activeTab === "participation"}
          onClick={() => setActiveTab("participation")}
          icon={<PiUsers size={20} />}
          label="Participation"
        />
      </div>

      <div className="min-h-0">
        {activeTab === "overview" && (
          <TestOverview newTest={newTest} setNewTest={setNewTest} />
        )}

        {activeTab === "questions" && (
          <div className="flex flex-row items-start gap-5 pb-6">
            <main className="flex-grow space-y-6 overflow-y-auto pr-2">
              <BuilderPage
                newTest={newTest}
                onDeleteQuestion={handleDeleteQuestion}
                onEditQuestion={handleModalOpen}
              />
            </main>

            <QuestionNavigator
              questions={newTest.questions}
              onSelectQuestion={handleModalOpen}
              onAddNew={() => handleModalOpen(null)}
            />
          </div>
        )}

        {activeTab === "participation" && (
          <TestParticipation attempts={newTest.liveAttempts || []} />
        )}
      </div>

      <FloatingSaveBar
        isVisible={hasChanges}
        onSave={handleTestUpdate}
        onDiscard={handleDiscardChanges}
        saving={saving}
      />

      {isModalOpen && (
        <AddQuestionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={onSaveQuestion}
          testId={test.id}
          initialQuestion={activeQuestion}
        />
      )}
    </div>
  );
};

export default TestMakerClient;

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 border rounded-full px-4 py-3 text-sm font-medium transition-colors ${
        active
          ? "border-[var(--rubric-muted)] bg-[var(--rubric-black)]/80 text-white font-bold"
          : "border-transparent text-[var(--rubric-muted)] hover:text-[var(--rubric-black)]"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function TestOverview({
  newTest,
  setNewTest,
}: {
  newTest: Test;
  setNewTest: any;
}) {
  const { handleChange, toggleClass } = useEditTestForm({ setNewTest });
  const { session } = useSession();
  const [classLists, setClassLists] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);

  useEffect(() => {
    if (session?.id) {
      fetchClassLists(session.id).then((res) => {
        if ("classLists" in res && res.classLists !== undefined) {
          setClassLists(res.classLists);
        }
      });
      fetchSubjects(session.id).then((res) => {
        if ("subjects" in res && res.subjects !== undefined) {
          setSubjects(res.subjects);
        }
      });
    }
  }, [session?.id]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <DashboardPanel className="p-6">
        <h3 className="mb-4 text-lg font-medium">Test Information</h3>
        <div className="space-y-4">
          <DashboardField label="Test Name">
            <input
              type="text"
              name="name"
              value={newTest.name}
              onChange={handleChange}
              className={fieldClass}
            />
          </DashboardField>
          <DashboardField label="Subject">
            <DashboardSelect
              value={newTest.subjectId || ""}
              onValueChange={(value) => {
                const selectedSubject = subjects.find((s) => s.id === value);
                setNewTest((prev: any) => ({
                  ...prev,
                  subjectId: value,
                  subject: selectedSubject?.name || "",
                }));
              }}
              placeholder="Select a subject"
              options={subjects.map((s) => ({
                value: s.id,
                label: `${s.name} (${s.code})`,
              }))}
            />
          </DashboardField>
          <DashboardField label="Description">
            <textarea
              name="description"
              value={newTest.description ?? ""}
              onChange={handleChange}
              className={textareaClass}
              rows={4}
            />
          </DashboardField>
          <div className="grid grid-cols-2 gap-4">
            <DashboardField label="Difficulty">
              <DashboardSelect
                value={newTest.difficulty}
                onValueChange={(value) =>
                  setNewTest((prev: any) =>
                    prev
                      ? { ...prev, difficulty: value as Test["difficulty"] }
                      : prev,
                  )
                }
                options={[
                  { value: "easy", label: "Easy" },
                  { value: "medium", label: "Medium" },
                  { value: "hard", label: "Hard" },
                ]}
              />
            </DashboardField>
            <DashboardField label="Duration (minutes)">
              <input
                type="number"
                name="durationMinutes"
                value={newTest.durationMinutes || 0}
                onChange={handleChange}
                className={fieldClass}
              />
            </DashboardField>
          </div>
        </div>
      </DashboardPanel>

      <DashboardPanel className="p-6">
        <h3 className="mb-4 text-lg font-medium">Class Assignment</h3>
        <p className="mb-4 text-sm text-[var(--rubric-muted)]">
          Assigned classes restrict test access to enrolled students only. Leave
          empty for public access.
        </p>
        <div className="flex flex-wrap gap-2">
          {classLists.map((cls) => {
            const isAssigned = newTest.assignedClasses?.some(
              (c) => c.id === cls.id,
            );
            return (
              <button
                key={cls.id}
                onClick={() => toggleClass({ id: cls.id, name: cls.name })}
                className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                  isAssigned
                    ? "border-[var(--rubric-black)] bg-[var(--rubric-black)] text-white"
                    : "border-[var(--border)] bg-[#FAF8F3] text-[var(--rubric-muted)] hover:border-[var(--rubric-black)] hover:text-[var(--rubric-black)]"
                }`}
              >
                {isAssigned ? <PiCheck /> : <PiPlus />}
                {cls.name}
              </button>
            );
          })}
          {classLists.length === 0 && (
            <p className="py-4 text-sm italic text-[var(--rubric-muted)]">
              No classes found.
            </p>
          )}
        </div>
      </DashboardPanel>
    </div>
  );
}

function TestParticipation({ attempts }: { attempts: any[] }) {
  return (
    <DashboardPanel className="overflow-hidden">
      <div className="p-6">
        <h3 className="text-lg font-medium">Test Attempts</h3>
        <p className="text-sm text-[var(--rubric-muted)]">
          Track student participation and scores.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-[#FAF8F3] border-y border-[var(--border)]">
            <tr>
              <th className="px-6 py-4 text-xs font-bold uppercase text-[var(--rubric-muted)]">
                Student
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-[var(--rubric-muted)]">
                Status
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-[var(--rubric-muted)]">
                Score
              </th>
              <th className="px-6 py-4 text-xs font-bold uppercase text-[var(--rubric-muted)]">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {attempts.length > 0 ? (
              attempts.map((attempt) => (
                <tr
                  key={attempt.id}
                  className="hover:bg-[#FAF8F3]/50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-[var(--rubric-black)]">
                      {attempt.student.firstName} {attempt.student.lastName}
                    </div>
                    <div className="text-xs text-[var(--rubric-muted)]">
                      {attempt.student.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge
                      tone={attempt.submittedAt ? "success" : "warning"}
                    >
                      {attempt.submittedAt ? "Submitted" : "Ongoing"}
                    </StatusBadge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-semibold text-[var(--rubric-black)]">
                      {attempt.score ?? "-"}/{attempt.totalMarks ?? "-"}
                    </div>
                    {attempt.score !== null && attempt.totalMarks && (
                      <div className="text-[10px] text-[var(--rubric-muted)]">
                        {Math.round((attempt.score / attempt.totalMarks) * 100)}
                        %
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--rubric-muted)]">
                    {formatDate(attempt.startedAt)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-12 text-center text-sm text-[var(--rubric-muted)]"
                >
                  No participation records found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </DashboardPanel>
  );
}

function BuilderPage({
  newTest,
  onDeleteQuestion,
  onEditQuestion,
}: {
  newTest: Test;
  onDeleteQuestion: (questionId: string) => void;
  onEditQuestion: (question: Question) => void;
}) {
  return (
    <div className="mb-24 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 md:p-6">
      <h3 className="mb-4 text-xl font-medium">
        Questions ({newTest.questions.length})
      </h3>

      {newTest.questions.length > 0 ? (
        <div className="space-y-4">
          {newTest.questions.map((question, index) => (
            <div
              key={question.id}
              className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4"
            >
              <div className="mb-3 flex items-start justify-between">
                <div className="flex-grow pr-4">
                  <h4 className="font-medium">
                    {index + 1}. {question.text}
                  </h4>
                </div>
                <div className="flex flex-shrink-0 gap-2">
                  <button
                    onClick={() => onEditQuestion(question)}
                    className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] p-2 text-[var(--rubric-black)]"
                    title="Edit Question"
                  >
                    <PenNibIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(question.id)}
                    className="rounded-full border border-[rgba(180,35,24,0.18)] bg-[rgba(180,35,24,0.08)] p-2 text-[var(--rubric-danger)]"
                    title="Delete Question"
                  >
                    <PiTrash className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {(
                ["multiple_choice", "true_or_false"] as QuestionType[]
              ).includes(question.type) &&
                question.options && (
                  <ul className="mb-2 space-y-1 text-sm">
                    {Object.entries(question.options).map(
                      ([key, value], optionIndex) => (
                        <li
                          key={key}
                          className={`flex items-center gap-2 ${
                            optionIndex === question.correctOption
                              ? "font-medium text-[var(--rubric-black)]"
                              : "text-[var(--rubric-slate)]"
                          }`}
                        >
                          {optionIndex === question.correctOption ? (
                            <PiCheckCircle className="h-4 w-4" />
                          ) : (
                            <PiCircle className="h-4 w-4 text-[var(--rubric-muted)]" />
                          )}
                          <span>
                            {String.fromCharCode(65 + optionIndex)}.{" "}
                            {String(value)}
                          </span>
                        </li>
                      ),
                    )}
                  </ul>
                )}

              <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--rubric-muted)]">
                <span className="rounded-full border border-[var(--border)] bg-[var(--surface-strong)] px-2 py-1 text-xs font-medium text-[var(--rubric-black)]">
                  {question.marks} Points
                </span>
                {question.explanation && (
                  <p className="text-sm italic text-[var(--rubric-slate)]">
                    <span className="font-medium">Explanation available</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-dashed border-[var(--border)] py-16 text-center">
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-muted)]">
            <PiFileText className="h-12 w-12 text-[var(--rubric-muted)]" />
          </div>
          <h3 className="mb-2 text-lg font-medium">No questions yet</h3>
          <p className="text-[var(--rubric-slate)]">
            Add your first question using the navigator on the right.
          </p>
        </div>
      )}
    </div>
  );
}

function QuestionNavigator({
  questions,
  onSelectQuestion,
  onAddNew,
}: {
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
  onAddNew: () => void;
}) {
  return (
    <aside className="sticky top-6 hidden h-[calc(60dvh-3rem)] w-80 flex-none lg:flex">
      <div className="flex min-h-0 w-full flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4">
        <div className="mb-4 shrink-0 flex items-center justify-between">
          <h3 className="text-lg font-medium">Question navigator</h3>
        </div>
        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {questions.map((question, index) => (
            <button
              key={question.id}
              onClick={() => onSelectQuestion(question)}
              className="flex w-full items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-left transition-colors hover:bg-[var(--surface-strong)]"
            >
              <PiFileText className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--rubric-black)]" />
              <div className="flex-grow">
                <p className="truncate text-sm font-medium">
                  {index + 1}. {question.text.slice(0, 20)}...
                </p>
                <p className="text-xs text-[var(--rubric-muted)]">
                  {question.type.replace(/_/g, " ")} - {question.marks} marks
                </p>
              </div>
            </button>
          ))}
          {questions.length === 0 && (
            <p className="py-8 text-center text-sm text-[var(--rubric-muted)]">
              Your questions will appear here.
            </p>
          )}
        </div>
        <div className="mt-4 shrink-0 border-t border-[var(--border)] pt-4">
          <button onClick={onAddNew} className="rubric-button-primary w-full">
            <PiPlus className="h-5 w-5" /> Add new question
          </button>
        </div>
      </div>
    </aside>
  );
}

function FloatingSaveBar({
  isVisible,
  onSave,
  onDiscard,
  saving,
}: {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saving: boolean;
}) {
  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ y: 40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 40, opacity: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="fixed inset-x-0 bottom-0 z-40"
    >
      <div className="mx-auto w-full max-w-4xl p-4">
        <div className="flex max-sm:flex-col gap-3 items-center justify-between rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4">
          <p className="text-sm font-medium md:text-base">
            You have unsaved changes.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onDiscard}
              disabled={saving}
              className="rubric-button-ghost max-sm:border px-4 py-2 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="rubric-button-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Saving...
                </>
              ) : (
                <>
                  <PiFloppyDisk className="h-4 w-4" />
                  Save changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AddQuestionModal({
  isOpen,
  onClose,
  onSave,
  testId,
  initialQuestion,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (q: Question) => void;
  testId: string;
  initialQuestion: Question | null;
}) {
  const {
    isEditing,
    newQuestion,
    setNewQuestion,
    handleOptionChange,
    handleSave,
  } = useQuestionForm({
    testId,
    initialQuestion,
    onSave,
    onClose,
  });

  if (!isOpen) return null;

  return (
    <ResponsiveSheet
      title={isEditing ? "Edit question" : "Add question"}
      onClose={onClose}
      className="md:max-w-[660px]"
      footer={
        <DashboardButton onClick={handleSave} className="w-full md:w-auto">
          <PiFloppyDisk className="h-4 w-4" />
          {isEditing ? "Update question" : "Save question"}
        </DashboardButton>
      }
    >
      <div className="space-y-4">
        <DashboardField label="Question type">
          <DashboardSelect
            value={newQuestion.type}
            onValueChange={(value) =>
              setNewQuestion((prev) => ({
                ...prev,
                type: value as QuestionType,
              }))
            }
            options={[
              { value: "multiple_choice", label: "Multiple Choice" },
              { value: "true_or_false", label: "True / False" },
              { value: "short_answer", label: "Short Answer" },
              { value: "essay", label: "Essay" },
            ]}
          />
        </DashboardField>

        <DashboardField label="Question text">
          <textarea
            required
            value={newQuestion.text}
            onChange={(e) =>
              setNewQuestion((prev) => ({ ...prev, text: e.target.value }))
            }
            className={textareaClass}
            rows={3}
            placeholder="Type the question students will answer"
          />
        </DashboardField>

        {newQuestion.type === "multiple_choice" && (
          <div className="space-y-3">
            <p className="text-xs font-bold text-[var(--rubric-muted)]">
              Answer options
            </p>
            {Object.keys(newQuestion.options).map((key, index) => (
              <div
                key={key}
                className={`flex h-[46px] items-center gap-3 rounded-lg border px-3 ${
                  index === newQuestion.correctOption
                    ? "border-[#A8DDBA] bg-[#E7F5EC]"
                    : "border-[var(--border)] bg-[#FAF8F3]"
                }`}
              >
                <button
                  type="button"
                  onClick={() =>
                    setNewQuestion((prev) => ({
                      ...prev,
                      correctOption: index,
                    }))
                  }
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${
                    index === newQuestion.correctOption
                      ? "border-[#1F7A4D] bg-[#1F7A4D] text-white"
                      : "border-[var(--border)] bg-white text-[var(--rubric-muted)]"
                  }`}
                >
                  {String.fromCharCode(65 + index)}
                </button>
                <input
                  type="text"
                  required
                  value={newQuestion.options[key]}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
                />
              </div>
            ))}
          </div>
        )}

        {newQuestion.type === "true_or_false" && (
          <DashboardField label="Correct">
            <DashboardSelect
              value={String(newQuestion.correctOption ?? 0)}
              onValueChange={(value) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  correctOption: parseInt(value),
                }))
              }
              options={[
                { value: "0", label: "True" },
                { value: "1", label: "False" },
              ]}
            />
          </DashboardField>
        )}

        <div className="grid grid-cols-2 gap-3">
          <DashboardField label="Marks">
            <input
              type="number"
              min={1}
              required
              value={newQuestion.marks}
              onChange={(e) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  marks: parseInt(e.target.value) || 1,
                }))
              }
              className={fieldClass}
            />
          </DashboardField>
          <DashboardField label="Correct">
            <DashboardSelect
              value={String(newQuestion.correctOption ?? 0)}
              disabled={newQuestion.type !== "multiple_choice"}
              onValueChange={(value) =>
                setNewQuestion((prev) => ({
                  ...prev,
                  correctOption: parseInt(value),
                }))
              }
              options={Object.keys(newQuestion.options).map((_, index) => ({
                value: String(index),
                label: String.fromCharCode(65 + index),
              }))}
            />
          </DashboardField>
        </div>

        <DashboardField label="Explanation">
          <textarea
            value={newQuestion.explanation ?? ""}
            onChange={(e) =>
              setNewQuestion((prev) => ({
                ...prev,
                explanation: e.target.value,
              }))
            }
            className={textareaClass}
            rows={3}
            placeholder="Optional explanation after review"
          />
        </DashboardField>
      </div>
    </ResponsiveSheet>
  );
}
