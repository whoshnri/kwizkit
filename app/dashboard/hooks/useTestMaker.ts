"use client";

import { ChangeEvent, Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { cloneDeep, isEqual } from "lodash";
import { toast } from "sonner";
import { useSession } from "@/app/SessionContext";
import { fetchTestForDashBySlug, updateTestQuestions, updateTestDetails } from "@/app/actions/testOps";
import { readStorageItem, removeStorageItem, writeStorageItem } from "@/lib/browserStorage";

type QuestionType =
  | "multiple_choice"
  | "short_answer"
  | "essay"
  | "true_or_false";

type QuestionOptions = Record<string, string>;

export type Question = {
  id: string;
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
  subjectId?: string;
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
  questions: Question[];
  assignedClasses?: any[];
  liveAttempts?: any[];
};

function normalizeTest(test: Test) {
  // Focus only on fields that can be changed by the user in the Test Maker
  return {
    name: test.name,
    description: test.description,
    subject: test.subject,
    subjectId: test.subjectId,
    difficulty: test.difficulty,
    visibility: !!test.visibility,
    durationMinutes: test.durationMinutes || 0,
    questions: (test.questions || []).map((q) => ({
      text: q.text,
      type: q.type,
      marks: q.marks,
      options: q.options ?? {},
      correctOption: q.correctOption ?? null,
      correctAnswer: q.correctAnswer ?? null,
      explanation: q.explanation ?? null,
    })),
    assignedClassIds: (test.assignedClasses || [])
      .map((c: any) => c.id)
      .sort()
  };
}

function parseServerTest(raw: any): Test {
  const createdAt = raw.createdAt ? new Date(raw.createdAt) : new Date();
  const updatedAt = raw.updatedAt ? new Date(raw.updatedAt) : createdAt;

  const questions = (raw.questions || []).map((question: any, index: number) => {
    const id = question.id ?? `${Date.now()}-${index}`;
    const options: QuestionOptions =
      typeof question.options === "string"
        ? (() => {
            try {
              return JSON.parse(question.options);
            } catch {
              return {};
            }
          })()
        : question.options && typeof question.options === "object"
          ? question.options
          : {};

    return {
      id,
      testId: question.testId ?? raw.id ?? "",
      text: question.text ?? question.question ?? "",
      type: question.type ?? "multiple_choice",
      options,
      correctOption: question.correctOption ?? question.correct_answer ?? null,
      correctAnswer: question.correctAnswer ?? question.correct_answer ?? null,
      marks:
        typeof question.marks === "number"
          ? question.marks
          : Number(question.points ?? 0) || 0,
      explanation: question.explanation ?? null,
    } as Question;
  });

  const totalMarks =
    typeof raw.totalMarks === "number"
      ? raw.totalMarks
      : questions.reduce((sum: number, question: Question) => sum + question.marks, 0);

  return {
    id: raw.id,
    name: raw.name ?? "",
    description: raw.description ?? null,
    subject:
      typeof raw.subject === "string"
        ? raw.subject
        : raw.subject?.name || raw.subjectName || "",
    subjectId: raw.subjectId ?? "",
    totalMarks,
    numberOfQuestions: questions.length,
    difficulty: raw.difficulty ?? "medium",
    createdAt,
    updatedAt,
    createdById: raw.createdById,
    slug: raw.slug,
    settings:
      typeof raw.settings === "string"
        ? (() => {
            try {
              return JSON.parse(raw.settings);
            } catch {
              return {};
            }
          })()
        : raw.settings ?? {},
    visibility: !!raw.visibility,
    format: raw.format ?? "mixed",
    durationMinutes: raw.durationMinutes ?? raw.duration ?? 0,
    questions,
    assignedClasses: raw.assignedClasses ?? [],
    liveAttempts: raw.liveAttempts ?? [],
  };
}

function cloneTest(test: Test) {
  return cloneDeep(test);
}

function normalizeQuestionKey(text: string) {
  return text.trim().toLowerCase().replace(/\s+/g, " ");
}

function parseStoredDraft(value: string | null, testId: string): Test | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as { test?: Test };
    if (parsed?.test?.id !== testId || !Array.isArray(parsed.test.questions)) {
      return null;
    }

    return parsed.test;
  } catch {
    return null;
  }
}

export function useTestMaker({ testSlug }: { testSlug: string | null }) {
  const { generatedContent, updateGeneratedContent } = useSession();
  const [test, setTest] = useState<Test | null>(null);
  const [newTest, setNewTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  useEffect(() => {
    const fetchTest = async () => {
      if (!testSlug) {
        setError("No test slug provided in the URL.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetchTestForDashBySlug(testSlug);
        if (res == null) {
          toast.error("Failed to fetch test");
          return;
        }

        const parsed = parseServerTest(res);
        const storedDraft = parseStoredDraft(readStorageItem(testSlug), parsed.id);

        setTest(parsed);
        setNewTest(storedDraft ?? cloneTest(parsed));
      } catch (err: any) {
        console.error("[FETCH_TEST_ERROR]", err);
        setError(err?.message ?? "Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    fetchTest();
  }, [testSlug]);

  useEffect(() => {
    if (!generatedContent || generatedContent.questions.length === 0) return;

    setNewTest((prev) => {
      if (!prev) return prev;

      const importedQuestions = generatedContent.questions.map((generatedQuestion, index) => {
        const options =
          generatedQuestion.options && typeof generatedQuestion.options === "object"
            ? generatedQuestion.options
            : {};

        return {
          id: generatedQuestion.id ?? `${Date.now()}-${index}`,
          testId: prev.id,
          text: generatedQuestion.text ?? "",
          type: generatedQuestion.type ?? "multiple_choice",
          options,
          correctOption: generatedQuestion.correctOption ?? null,
          correctAnswer: generatedQuestion.correctAnswer ?? null,
          marks: generatedQuestion.marks ?? 0,
          explanation: generatedQuestion.explanation ?? null,
        } as Question;
      });

      const updatedQuestions =
        generatedContent.importMode === "append"
          ? [...prev.questions, ...importedQuestions]
          : importedQuestions.reduce<Question[]>((questions, importedQuestion) => {
              const importedKey = normalizeQuestionKey(importedQuestion.text);
              const existingIndex = questions.findIndex(
                (question) =>
                  question.id === importedQuestion.id ||
                  (!!importedKey && normalizeQuestionKey(question.text) === importedKey)
              );

              if (existingIndex === -1) {
                return [...questions, importedQuestion];
              }

              return questions.map((question, index) =>
                index === existingIndex ? { ...question, ...importedQuestion } : question
              );
            }, prev.questions);

      return {
        ...prev,
        questions: updatedQuestions,
        totalMarks: updatedQuestions.reduce((sum, question) => sum + question.marks, 0),
        numberOfQuestions: updatedQuestions.length,
      };
    });

    updateGeneratedContent(null);
  }, [generatedContent, updateGeneratedContent]);

  useEffect(() => {
    if (test && newTest) {
      setHasChanges(!isEqual(normalizeTest(test), normalizeTest(newTest)));
    } else {
      setHasChanges(false);
    }
  }, [test, newTest]);

  useEffect(() => {
    if (!testSlug || !test || !newTest) return;

    if (isEqual(normalizeTest(test), normalizeTest(newTest))) {
      removeStorageItem(testSlug);
      return;
    }

    writeStorageItem(
      testSlug,
      JSON.stringify({
        savedAt: new Date().toISOString(),
        test: newTest,
      })
    );
  }, [newTest, test, testSlug]);

  const handleTestUpdate = useCallback(async () => {
    if (!newTest) return;

    setSaving(true);

    const formattedQuestions = newTest.questions.map((question) => ({
      text: question.text,
      marks: question.marks,
      type: question.type,
      options: question.options,
      correctOption: question.correctOption,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
    }));

    try {
      // First update details (including assigned classes and visibility)
      const detailsRes = await updateTestDetails(newTest.id, {
        name: newTest.name,
        description: newTest.description,
        subject: newTest.subject,
        subjectId: newTest.subjectId,
        difficulty: newTest.difficulty,
        visibility: !!newTest.visibility,
        duration: newTest.durationMinutes,
        assignedClassIds: newTest.assignedClasses?.map(c => c.id) || [],
      });

      if (detailsRes.status !== 200) {
        toast.error(detailsRes.message || "Failed to update test details");
        setSaving(false);
        return;
      }

      // Then update questions
      const res = await updateTestQuestions(
        newTest.id,
        newTest.name,
        newTest.totalMarks,
        newTest.numberOfQuestions,
        newTest.subject,
        newTest.difficulty,
        newTest.description ? newTest.description : "",
        formattedQuestions
      );

      if (!res.status || res.status !== 200) {
        toast.error(res?.message || "Failed to update questions");
        return;
      }

      const updatedRes = await fetchTestForDashBySlug(testSlug!);
      if (updatedRes) {
        const parsed = parseServerTest(updatedRes);
        setTest(parsed);
        setNewTest(cloneTest(parsed));
      }
      
      if (testSlug) {
        removeStorageItem(testSlug);
      }
      toast.success("Test updated successfully");
    } catch (err) {
      console.error("[UPDATE_TEST_ERROR]", err);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  }, [newTest, testSlug]);

  const toggleVisibility = useCallback(() => {
    setNewTest(prev => prev ? ({ ...prev, visibility: !prev.visibility }) : prev);
  }, []);

  const handleDiscardChanges = useCallback(() => {
    setNewTest(test ? cloneTest(test) : null);
    if (testSlug) {
      removeStorageItem(testSlug);
    }
  }, [test, testSlug]);

  const handleModalOpen = useCallback((question: Question | null = null) => {
    setActiveQuestion(question);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setActiveQuestion(null);
  }, []);

  const onSaveQuestion = useCallback((questionToSave: Question) => {
    setNewTest((prev) => {
      if (!prev) return prev;

      const isEditing =
        !!questionToSave.id && prev.questions.some((question) => question.id === questionToSave.id);

      let updatedQuestions: Question[] = [];

      if (isEditing) {
        updatedQuestions = prev.questions.map((question) =>
          question.id === questionToSave.id ? { ...question, ...questionToSave } : question
        );
      } else {
        updatedQuestions = [
          ...prev.questions,
          { ...questionToSave, id: Date.now().toString(), testId: prev.id },
        ];
      }

      return {
        ...prev,
        questions: updatedQuestions,
        totalMarks: updatedQuestions.reduce((sum, question) => sum + question.marks, 0),
        numberOfQuestions: updatedQuestions.length,
      };
    });

    setIsModalOpen(false);
    setActiveQuestion(null);
  }, []);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setNewTest((prev) => {
      if (!prev) return prev;

      const updatedQuestions = prev.questions.filter((question) => question.id !== questionId);

      return {
        ...prev,
        questions: updatedQuestions,
        totalMarks: updatedQuestions.reduce((sum, question) => sum + question.marks, 0),
        numberOfQuestions: updatedQuestions.length,
      };
    });
  }, []);

  return {
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
  };
}

export function useQuestionForm({
  testId,
  initialQuestion,
  onSave,
  onClose,
}: {
  testId: string;
  initialQuestion: Question | null;
  onSave: (q: Question) => void;
  onClose: () => void;
}) {
  const isEditing = !!initialQuestion;

  const defaultQuestionState: Question = {
    id: "",
    testId,
    type: "multiple_choice",
    text: "",
    options: { A: "", B: "", C: "", D: "" },
    correctAnswer: null,
    correctOption: 0,
    explanation: null,
    marks: 5,
  };

  const [newQuestion, setNewQuestion] = useState<Question>(
    initialQuestion ?? defaultQuestionState
  );

  useEffect(() => {
    setNewQuestion(initialQuestion ?? { ...defaultQuestionState, testId });
  }, [initialQuestion, testId]);

  const handleOptionChange = useCallback((index: number, value: string) => {
    const keys = Object.keys(newQuestion.options);
    const key = keys[index];
    if (!key) return;

    setNewQuestion((prev) => ({
      ...prev,
      options: { ...prev.options, [key]: value },
    }));
  }, [newQuestion.options]);

  const handleSave = useCallback(() => {
    if (!newQuestion.text.trim()) return;
    onSave({ ...newQuestion, testId });
    onClose();
  }, [newQuestion, onClose, onSave, testId]);

  return {
    isEditing,
    newQuestion,
    setNewQuestion,
    handleOptionChange,
    handleSave,
  };
}

export function useEditTestForm({
  setNewTest,
}: {
  setNewTest: Dispatch<SetStateAction<Test | null>>;
}) {
  const handleChange = useCallback((
    e: ChangeEvent<HTMLTextAreaElement | HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numericKeys = ["durationMinutes", "totalMarks", "numberOfQuestions"];
    const finalValue: string | number = numericKeys.includes(name)
      ? parseInt(value) || 0
      : value;

    setNewTest((prev) => (prev ? ({ ...prev, [name]: finalValue } as Test) : prev));
  }, [setNewTest]);

  const toggleClass = useCallback((classObj: { id: string, name: string }) => {
    setNewTest((prev) => {
      if (!prev) return prev;
      const current = prev.assignedClasses || [];
      const exists = current.find(c => c.id === classObj.id);
      
      const updated = exists 
        ? current.filter(c => c.id !== classObj.id)
        : [...current, classObj];
        
      return { ...prev, assignedClasses: updated };
    });
  }, [setNewTest]);

  return { handleChange, toggleClass };
}
