"use client";

import React, { useCallback, useEffect, useState } from "react";
import {
  Plus,
  Trash2,
  Edit3,
  X,
  Save,
  FileText,
  CheckCircle,
  Circle,
  AlertCircle,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { isEqual, cloneDeep } from "lodash";
type QuestionType = "multiple_choice" | "short_answer" | "essay" | "true_or_false";
type QuestionOptions = Record<string, string>;

export type Question = {
  id: string; // UI-level id (we standardized on qid)
  testId: string;
  text: string;
  type: QuestionType;
  options: QuestionOptions;
  correctOption?: number | null;
  correctAnswer?: string | null;
  marks: number;
  explanation?: string | null;
};

export type Test = {
  id: string;
  name: string;
  description: string | null;
  subject: string;
  totalMarks: number;
  numberOfQuestions: number;
  difficulty: "easy" | "medium" | "hard";
  createdAt: Date;
  updatedAt: Date;
  createdById?: string;
  slug?: string;
  settings?: Record<string, unknown>;
  visibility?: boolean;
  format?: string;
  durationMinutes?: number;
  questions: Question[]; // always an array in UI
};

/* -------------------- HELPERS --------------------- */


function normalizeTest(t: Test) {
  const copy = cloneDeep(t);

  // normalize dates
  copy.createdAt = t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt);
  copy.updatedAt = t.updatedAt instanceof Date ? t.updatedAt : new Date(t.updatedAt);

  // normalize questions
  if (copy.questions) {
    copy.questions = copy.questions.map((q) => ({
      ...q,
      options: q.options ?? null,
      correctOption: q.correctOption ?? null,
      correctAnswer: q.correctAnswer ?? null,
      explanation: q.explanation ?? null,
    }));
  }

  return copy;
}

function parseServerTest(raw: any): Test {
  const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const updatedAt = raw.updatedAt ? new Date(raw.updatedAt) : createdAt;

  const questions = (raw.questions || []).map((q: any, idx: number) => {
    const id = q.id ?? `${Date.now()}-${idx}`;
    const testId = q.testId ?? raw.id ?? "";
    const options: QuestionOptions =
      q.options && typeof q.options === "object" ? q.options : {};
    return {
      id,
      testId,
      text: q.text ?? q.question ?? "",
      type: q.type ?? "multiple_choice",
      options,
      correctOption: q.correctOption ?? q.correct_answer ?? null,
      correctAnswer: q.correctAnswer ?? q.correct_answer ?? null,
      marks: typeof q.marks === "number" ? q.marks : Number(q.points ?? 0) || 0,
      explanation: q.explanation ?? null,
    } as Question;
  });

  const totalMarks =
    typeof raw.totalMarks === "number"
      ? raw.totalMarks
      : questions.reduce((s: number, q: Question) => s + (q.marks || 0), 0);

  const numberOfQuestions = questions.length;

  return {
    id: raw.id,
    name: raw.name ?? "",
    description: raw.description ?? null,
    subject: raw.subject ?? "",
    totalMarks,
    numberOfQuestions,
    difficulty: raw.difficulty ?? "medium",
    createdAt,
    updatedAt,
    createdById: raw.createdById,
    slug: raw.slug,
    settings: raw.settings ?? {},
    visibility: !!raw.visibility,
    format: raw.format ?? "mixed",
    durationMinutes: raw.durationMinutes ?? 0,
    questions,
  };
}

/* ------------------ MAIN COMPONENT ----------------- */

const TestMaker: React.FC = () => {
  const [test, setTest] = useState<Test | null>(null); // original from server
  const [newTest, setNewTest] = useState<Test | null>(null); // editable copy

  const searchParams = useSearchParams();
  const testId = searchParams?.get("testId") ?? null;

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [failure, setFailure] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) {
        setError("No Test ID provided in the URL.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/test?testId=${testId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to fetch test");
        const parsed = parseServerTest(data.test);
        setTest(parsed);
        // clone for editing
        setNewTest(JSON.parse(JSON.stringify(parsed)));
      } catch (err: any) {
        console.error("[FETCH_TEST_ERROR]", err);
        setError(err?.message ?? "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

useEffect(() => {
  if (test && newTest) {
    const normalizedTest = normalizeTest(test);
    const normalizedNewTest = normalizeTest(newTest);

    setHasChanges(!isEqual(normalizedTest, normalizedNewTest));
  } else {
    setHasChanges(false);
  }
}, [test, newTest]);
  


  const handleTestUpdate = useCallback(async () => {
    if (!newTest) return;
    setSaving(true);
    setSuccess(false);
    setFailure(false);
    try {
      const res = await fetch("/api/test", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTest),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to update test");

      const parsed = parseServerTest(data.test ?? newTest);
      setTest(parsed);
      setNewTest(JSON.parse(JSON.stringify(parsed)));
      setSuccess(true);
    } catch (err) {
      console.error("[UPDATE_TEST_ERROR]", err);
      setFailure(true);
    } finally {
      setSaving(false);
    }
  }, [newTest]);

  const handleDiscardChanges = useCallback(() => {
    setNewTest(test ? JSON.parse(JSON.stringify(test)) : null);
  }, [test]);


  const handleModalOpen = (question: Question | null = null) => {
    setActiveQuestion(question);
    setIsModalOpen(true);
  };
  const handleModalClose = () => {
    setIsModalOpen(false);
    setActiveQuestion(null);
  };

  const onSaveQuestion = (questionToSave: Question) => {
    if (!newTest) return;

    setNewTest((prev) => {
      if (!prev) return prev;

      const isEditing =
        !!questionToSave.id &&
        prev.questions.some((q) => q.id === questionToSave.id);

      let updatedQuestions: Question[] = [];

      if (isEditing) {
        updatedQuestions = prev.questions.map((q) =>
          q.id === questionToSave.id ? { ...q, ...questionToSave } : q
        );
      } else {
        // create new id
        const newId = Date.now().toString();
        updatedQuestions = [
          ...prev.questions,
          { ...questionToSave, id: newId, testId: prev.id },
        ];
      }

      const totalMarks = updatedQuestions.reduce(
        (sum, q) => sum + (q.marks ?? 0),
        0
      );

      return {
        ...prev,
        questions: updatedQuestions,
        totalMarks,
        numberOfQuestions: updatedQuestions.length,
      };
    });


    setIsModalOpen(false);
    setActiveQuestion(null);
  };

  const handleDeleteQuestion = (qid: string) => {
    setNewTest((prev) => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.filter((q) => q.id !== qid);

      const totalMarks = updatedQuestions.reduce(
        (sum, q) => sum + (q.marks || 0),
        0
      );
      const numberOfQuestions = updatedQuestions.length;

      return {
        ...prev,
        questions: updatedQuestions,
        totalMarks,
        numberOfQuestions,
      };
    });
  };

  /* --------------- RENDER --------------- */

  if (loading) {
    return (
      <div className="p-6 theme-bg theme-text mx-auto h-full w-full flex items-center justify-center">
        <span className="loading loading-bars loading-xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 theme-bg theme-text mx-auto h-full w-full flex items-center justify-center">
        <div className="theme-bg-subtle theme-border border rounded-lg p-6 text-center space-y-2 max-w-sm w-full">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <p className="text-destructive font-semibold text-base">Error loading test</p>
          <p className="theme-text-secondary text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!test || !newTest) {
    return (
      <div className="p-6 theme-bg rounded theme-text mx-auto h-full w-full flex items-center justify-center">
        No test data found.
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-row gap-6 p-4 md:p-6">
        {/* Main Content Area */}
        <main className="flex-grow h-full overflow-y-auto pr-2 space-y-6">
          <EditTestForm newTest={newTest} setNewTest={setNewTest} />
          <BuilderPage
            newTest={newTest}
            onDeleteQuestion={handleDeleteQuestion}
            onEditQuestion={handleModalOpen}
          />
        </main>

        {/* Right Navigator */}
        <QuestionNavigator
          questions={newTest.questions}
          onSelectQuestion={handleModalOpen}
          onAddNew={() => handleModalOpen(null)}
        />
      </div>

      {/* Floating Action Bar */}
      <FloatingSaveBar
        isVisible={hasChanges}
        onSave={handleTestUpdate}
        onDiscard={handleDiscardChanges}
        saving={saving}
      />

      {/* Modals */}
      {isModalOpen && (
        <AddQuestionModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onSave={onSaveQuestion}
          testId={testId as string}
          initialQuestion={activeQuestion}
        />
      )}

      {(success || failure) && (
        <StatusModal
          isSuccess={success}
          onClose={() => {
            setSuccess(false);
            setFailure(false);
          }}
        />
      )}
    </>
  );
};

export default TestMaker;

/* ------------------ Child components (typed) ------------------ */

function BuilderPage({
  newTest,
  onDeleteQuestion,
  onEditQuestion,
}: {
  newTest: Test;
  onDeleteQuestion: (qid: string) => void;
  onEditQuestion: (question: Question) => void;
}) {
  return (
    <div className="theme-bg theme-border border rounded-lg p-4 md:p-6 mb-24">
      <h3 className="text-xl font-semibold mb-4 theme-text">Questions ({newTest.questions.length})</h3>

      {newTest.questions.length > 0 ? (
        <div className="space-y-4">
          {newTest.questions.map((question, index) => (
            <div
              key={question.id}
              className="theme-border border rounded-lg p-4 theme-bg-subtle transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-grow pr-4">
                  <h4 className="font-semibold theme-text">
                    {index + 1}. {question.text}
                  </h4>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => onEditQuestion(question)}
                    className="p-2 rounded-md hover:bg-blue-600/10 text-blue-500"
                    title="Edit Question"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDeleteQuestion(question.id)}
                    className="p-2 rounded-md hover:bg-red-600/10 text-red-500"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {["multiple_choice", "true_or_false"].includes(question.type) && question.options && (
                <ul className="list-inside text-sm space-y-1 mb-2">
                  {Object.entries(question.options).map(([key, value], i) => (
                    <li
                      key={key}
                      className={`flex items-center gap-2 ${
                        i + 1 === question.correctOption ? "font-semibold text-green-500" : "theme-text-secondary"
                      }`}
                    >
                      {i + 1 === question.correctOption ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4 text-gray-400" />}
                      <span>{String.fromCharCode(65 + i)}. {value}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="text-xs theme-text-secondary flex justify-between items-center pt-2 border-t theme-border">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                  {question.marks} Points
                </span>
                {question.explanation && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">
                    <span className="font-medium">Explanation available</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border-2 border-dashed theme-border rounded-lg">
          <div className="mx-auto w-24 h-24 theme-bg-subtle rounded-full flex items-center justify-center mb-4">
            <FileText className="w-12 h-12 theme-text-secondary" />
          </div>
          <h3 className="text-lg font-medium theme-text mb-2">No questions yet</h3>
          <p className="theme-text-secondary mb-4">Add your first question using the navigator on the right.</p>
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
    <aside className="w-64 flex-shrink-0 hidden lg:flex flex-col h-full">
      <div className="theme-bg theme-border border rounded-lg p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Question Navigator</h3>
        </div>
        <div className="flex-grow overflow-y-auto space-y-2 -mr-2 pr-2">
          {questions.map((q, index) => (
            <button
              key={q.id}
              onClick={() => onSelectQuestion(q)}
              className="w-full text-left flex items-start gap-3 p-3 rounded-md theme-bg-subtle hover:bg-primary/10 transition-colors"
            >
              <FileText className="w-5 h-5 mt-0.5 text-primary flex-shrink-0 " />
              <div className="flex-grow">
                <p className="font-medium text-sm truncate">{index + 1}. {q.text.slice(0, 20)}...</p>
                <p className="text-xs theme-text-secondary">{q.type.replace(/_/g, " ")} - {q.marks} marks</p>
              </div>
            </button>
          ))}
          {questions.length === 0 && <p className="text-sm text-center py-8 theme-text-secondary">Your questions will appear here.</p>}
        </div>
        <div className="mt-4 pt-4 border-t theme-border">
          <button
            onClick={onAddNew}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md cursor-pointer font-medium transition-colors"
          >
            <Plus className="w-5 h-5" /> Add New Question
          </button>
        </div>
      </div>
    </aside>
  );
}

function FloatingSaveBar({ isVisible, onSave, onDiscard, saving }: {
  isVisible: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saving: boolean;
}) {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="container mx-auto p-4 w-[60%]">
        <div className="theme-bg theme-border border rounded-lg shadow-2xl p-4 flex justify-between items-center">
          <p className="font-medium text-sm md:text-base">You have unsaved changes.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={onDiscard}
              disabled={saving}
              className="px-4 py-2 rounded-md font-semibold text-sm theme-text-secondary hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
            >
              Discard
            </button>
            <button
              onClick={onSave}
              disabled={saving}
              className="bg-blue-600 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-sm" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusModal({ isSuccess, onClose }: { isSuccess: boolean; onClose: () => void }) {
  const Icon = isSuccess ? CheckCircle : AlertCircle;
  const title = isSuccess ? "Success!" : "Update Failed";
  const message = isSuccess ? "Your test has been updated successfully." : "There was an error saving your test. Please try again.";
  const colorClass = isSuccess ? "text-green-500" : "text-destructive";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="theme-bg theme-border border rounded-lg shadow-xl p-8 w-full max-w-sm text-center space-y-4 animate-in zoom-in-95">
        <Icon className={`w-16 h-16 mx-auto ${colorClass}`} />
        <h2 className={`text-2xl font-bold ${colorClass}`}>{title}</h2>
        <p className="theme-text-secondary">{message}</p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 w-full"
        >
          OK
        </button>
      </div>
    </div>
  );
}

/* ---------------- AddQuestionModal (typed) ---------------- */

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
  const isEditing = !!initialQuestion;

  const defaultQuestionState: Question = {
    id: "",
    testId,
    type: "multiple_choice",
    text: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: null,
    correctOption: 1,
    explanation: null,
    marks: 5,
  };

  const [newQuestion, setNewQuestion] = useState<Question>(initialQuestion ?? defaultQuestionState);

  useEffect(() => {
    setNewQuestion(initialQuestion ?? { ...defaultQuestionState, testId });
  }, [initialQuestion, testId]);

  useEffect(() => {
    // adjust options when type switches
    if (newQuestion.type === "true_or_false") {
      setNewQuestion(prev => ({ ...prev, options: { "1": "True", "2": "False" }, correctOption: 1 }));
    } else if (newQuestion.type === "multiple_choice") {
      setNewQuestion(prev => ({ ...prev, options: { A: "", B: "", C: "", D: "" }, correctOption: 1 }));
    }
    // other types keep options but UI will ignore them
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newQuestion.type]);

  const handleOptionChange = (index: number, value: string) => {
    const keys = Object.keys(newQuestion.options);
    const key = keys[index];
    if (!key) return;
    setNewQuestion(prev => ({ ...prev, options: { ...prev.options, [key]: value } }));
  };

  const handleSave = () => {
    // minimal validation: text and marks
    if (!newQuestion.text?.trim()) {
      // could show a toast or validation UI; for now just abort
      return;
    }
    onSave({ ...newQuestion, testId });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="theme-bg theme-border border h-[90vh] max-h-[800px] p-6 rounded-lg shadow-lg w-full max-w-2xl flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold">{isEditing ? "Edit Question" : "Add New Question"}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto flex-grow pr-2 -mr-2">
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <textarea
              value={newQuestion.text}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, text: e.target.value }))}
              className="textarea textarea-bordered w-full theme-bg-subtle theme-border"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={newQuestion.type}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, type: e.target.value as QuestionType }))}
              className="w-full px-3 py-2 rounded border text-sm appearance-none theme-border theme-bg-subtle theme-text-secondary focus:outline-none "
            >
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_or_false">True / False</option>
              <option value="short_answer">Short Answer</option>
              <option value="essay">Essay</option>
            </select>
          </div>

          {newQuestion.type === "multiple_choice" && (
            <div className="space-y-3 p-4 theme-bg-subtle rounded-md">
              <label className="block text-sm font-medium">Options & Answer</label>
              {Object.keys(newQuestion.options).map((key, i) => (
                <div key={key} className="flex items-center gap-2">
                  <span className="font-mono text-sm theme-text-secondary">{String.fromCharCode(65 + i)}.</span>
                  <input
                    type="text"
                    value={newQuestion.options[key]}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="input input-bordered w-full theme-bg-subtle theme-border"
                  />
                </div>
              ))}
              <div className="pt-2">
                <label className="block text-sm font-medium mb-1">Correct Answer</label>
                <select
                  value={newQuestion.correctOption ?? 1}
                  onChange={(e) => setNewQuestion(prev => ({ ...prev, correctOption: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 rounded border text-sm appearance-none theme-bg-subtle theme-border theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(newQuestion.options).map((_, i) => (
                    <option key={i} value={i + 1}>Option {i + 1}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {newQuestion.type === "true_or_false" && (
            <div className="space-y-2 p-4 theme-bg-subtle rounded-md">
              <label className="block text-sm font-medium mb-1">Correct Answer</label>
              <select
                value={newQuestion.correctOption ?? 1}
                onChange={(e) => setNewQuestion(prev => ({ ...prev, correctOption: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 rounded border text-sm appearance-none theme-bg-subtle theme-border theme-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>True</option>
                <option value={2}>False</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Points</label>
            <input
              type="number"
              min={1}
              value={newQuestion.marks}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, marks: parseInt(e.target.value) || 1 }))}
              className="input input-bordered w-full theme-bg-subtle theme-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
            <textarea
              value={newQuestion.explanation ?? ""}
              onChange={(e) => setNewQuestion(prev => ({ ...prev, explanation: e.target.value }))}
              className="textarea textarea-bordered w-full theme-bg-subtle theme-border"
              rows={3}
              placeholder="Explain why the correct answer is right. This can be shown to students after the test."
            />
          </div>
        </div>
        <div className="flex items-center justify-end pt-4 mt-auto border-t theme-border flex-shrink-0">
          <button
            onClick={handleSave}
            className="bg-blue-600 self-end text-white px-5 py-2 rounded-md hover:bg-blue-700 font-semibold flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isEditing ? "Update Question" : "Save Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- EditTestForm (typed) ---------------- */

function EditTestForm({ newTest, setNewTest }: {
  newTest: Test;
  setNewTest: React.Dispatch<React.SetStateAction<Test | null>>;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // map numeric fields
    const numericKeys = ["durationMinutes", "totalMarks", "numberOfQuestions"];
    const finalValue: any = numericKeys.includes(name) ? parseInt(value) || 0 : value;

    setNewTest(prev => prev ? ({ ...prev, [name]: finalValue } as Test) : prev);
  };
  return (
    <div className="space-y-4 h-fit theme-bg p-4 md:p-6 rounded-lg theme-border border">
      <h1 className="font-semibold text-xl">Test Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test Name</label>
          <input type="text" name="name" value={newTest.name} onChange={handleChange}
            className="input input-bordered w-full theme-bg-subtle theme-border" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input type="text" name="subject" value={newTest.subject} onChange={handleChange}
            className="input input-bordered w-full theme-bg-subtle theme-border" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea name="description" value={newTest.description ?? ""} onChange={handleChange}
          className="textarea textarea-bordered w-full theme-bg-subtle theme-border" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select name="difficulty" value={newTest.difficulty} onChange={handleChange}
            className="select select-bordered w-full theme-bg-subtle theme-border">
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
         <div>
          <label className="block text-sm font-medium mb-1">Number of Questions</label>
          <input type="number" readOnly value={newTest.numberOfQuestions} className="input input-bordered w-full theme-bg-subtle theme-border bg-black/5 dark:bg-white/5 cursor-not-allowed" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Marks</label>
          <input type="number" readOnly value={newTest.totalMarks} className="input input-bordered w-full theme-bg-subtle theme-border bg-black/5 dark:bg-white/5 cursor-not-allowed" />
        </div>
      </div>

    </div>
  );
}
