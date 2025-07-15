"use client"

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, X, Save, FileText, CheckCircle, Circle, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { isEqual } from 'lodash';

// --- TYPE DEFINITIONS (as in original file) ---
// It's assumed these types are defined in your project.
// Included here for completeness.

export interface Test {
  id: number | string;
  name: string;
  subject: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  format: 'theory' | 'multiple_choice' | 'mixed';
  visibility: 'public' | 'private';
  durationMinutes: number;
  numberOfQuestions: number;
  totalMarks: number;
  questions: Question[];
}

export interface Question {
  qid: string;
  testId: number | string;
  type: string;
  text: string;
  question?: string; // For compatibility
  options: { [key: string]: string };
  correctAnswer: string;
  correctOption: number;
  explanation: string;
  marks: number;
  points?: number; // For compatibility
  required?: boolean;
}

// --- MAIN COMPONENT ---

const TestMaker = () => {
  // Original state from the server
  const [test, setTest] = useState<Test | null>(null);
  // The state being edited by the user
  const [newTest, setNewTest] = useState<Test | null>(null);

  const searchParams = useSearchParams();
  const testId = searchParams.get("testId");

  // UI/Flow states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>();
  const [saving, setSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [failure, setFailure] = useState<boolean>(false);
  const [hasChanges, setHasChanges] = useState<boolean>(false);

  // State for the question modal (lifted up for shared access)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);

  // --- Core Logic Functions ---

  useEffect(() => {
    const fetchTest = async () => {
      if (!testId) {
        setError("No Test ID provided in the URL.");
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`/api/test?testId=${testId}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch test');
        setTest(data.test);
        setNewTest(data.test);
        console.log(data.test)
      } catch (err: any) {
        console.error('[FETCH_TEST_ERROR]', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTest();
  }, [testId]);

  // Effect to detect if there are changes between the original and edited test
  useEffect(() => {
    if (test && newTest) {
      setHasChanges(!isEqual(test, newTest));
    } else {
      setHasChanges(false);
    }
  }, [test, newTest]);

  const handleTestUpdate = async () => {
    setSaving(true);
    setSuccess(false);
    setFailure(false);
    try {
      const res = await fetch('/api/test', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTest),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update test');
      // On successful save, update the original 'test' state to match the new state
      setTest(newTest);
      setSuccess(true);
    } catch (err) {
      setFailure(true);
    } finally {
      setSaving(false);
    }
  };

  const handleDiscardChanges = () => {
    // Revert the editable 'newTest' state back to the original 'test' state
    setNewTest(test);
  };

  // --- Question Management Functions ---

  const handleModalClose = () => {
    setIsModalOpen(false);
    setActiveQuestion(null);
  };

  const handleModalOpen = (question: Question | null = null) => {
    setActiveQuestion(question);
    setIsModalOpen(true);
  };

  const onSaveQuestion = (questionToSave: Question) => {
    setNewTest(prev => {
      if (!prev) return prev;
      let updatedQuestions;
      const isEditing = questionToSave.qid && prev.questions.some(q => q.qid === questionToSave.qid);

      if (isEditing) {
        // Replace existing question
        updatedQuestions = prev.questions.map(q =>
          q.qid === questionToSave.qid ? questionToSave : q
        );
      } else {
        // Add new question with a unique temporary ID
        const newQid = Date.now().toString();
        updatedQuestions = [...prev.questions, { ...questionToSave, qid: newQid }];
      }

      // Recalculate totals
      const totalMarks = updatedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const numberOfQuestions = updatedQuestions.length;

      return {
        ...prev,
        questions: updatedQuestions,
        totalMarks,
        numberOfQuestions
      };
    });
  };

  const handleDeleteQuestion = (qid: string) => {
    setNewTest(prev => {
      if (!prev) return prev;
      const updatedQuestions = prev.questions.filter(q => q.qid !== qid);

      // Recalculate totals
      const totalMarks = updatedQuestions.reduce((sum, q) => sum + (q.marks || 0), 0);
      const numberOfQuestions = updatedQuestions.length;

      return {
        ...prev,
        questions: updatedQuestions,
        totalMarks,
        numberOfQuestions
      };
    });
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <div className="p-6 theme-bg theme-text mx-auto h-full w-full flex items-center justify-center">
        <span className="loading loading-bars loading-xl"></span>
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
    { newTest &&
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
      }


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
          testId={testId}
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

// --- CHILD COMPONENTS ---

interface BuilderPageProps {
  newTest: Test;
  onDeleteQuestion: (qid: string) => void;
  onEditQuestion: (question: Question) => void;
}

const BuilderPage = ({ newTest, onDeleteQuestion, onEditQuestion }: BuilderPageProps) => {
  return (
    <div className="theme-bg theme-border border rounded-lg p-4 md:p-6 mb-24">
      <h3 className="text-xl font-semibold mb-4 theme-text">
        Questions ({newTest.questions?.length || 0})
      </h3>
      {newTest?.questions?.length > 0 ? (
        <div className="space-y-4">
          {newTest.questions.map((question, index) => (
            <div
              key={question.qid}
              className="theme-border border rounded-lg p-4 theme-bg-subtle transition-shadow hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-grow pr-4">
                  <h4 className="font-semibold theme-text">
                    {index + 1}. {question.question || question.text}
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
                    onClick={() => onDeleteQuestion(question.qid)}
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
                    <li key={key} className={`flex items-center gap-2 ${i + 1 === question.correctOption ? "font-semibold text-green-500" : "theme-text-secondary"}`}>
                      {i + 1 === question.correctOption ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4 text-gray-400" />}
                      <span>{String.fromCharCode(65 + i)}. {value}</span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="text-xs theme-text-secondary flex justify-between items-center pt-2 border-t theme-border">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded-full text-xs font-medium">
                  {question.marks ?? question.points} Points
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
  )
}

function QuestionNavigator({ questions, onSelectQuestion, onAddNew }: {
  questions: Question[];
  onSelectQuestion: (question: Question) => void;
  onAddNew: () => void;
}) {
  return (
    <aside className="w-80 flex-shrink-0 hidden lg:flex flex-col h-full">
      <div className="theme-bg theme-border border rounded-lg p-4 flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-lg">Question Navigator</h3>
        </div>
        <div className="flex-grow overflow-y-auto space-y-2 -mr-2 pr-2">
          {questions.map((q, index) => (
            <button
              key={q.qid}
              onClick={() => onSelectQuestion(q)}
              className="w-full text-left flex items-start gap-3 p-3 rounded-md theme-bg-subtle hover:bg-primary/10 transition-colors"
            >
              <FileText className="w-5 h-5 mt-0.5 text-primary flex-shrink-0" />
              <div className="flex-grow">
                <p className="font-medium text-sm truncate">{index + 1}. {q.question || q.text}</p>
                <p className="text-xs theme-text-secondary">{q.type.replace(/_/g, ' ')} - {q.marks} marks</p>
              </div>
            </button>
          ))}
          {questions.length === 0 && (
            <p className='text-sm text-center py-8 theme-text-secondary'>Your questions will appear here.</p>
          )}
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
    <div className="fixed bottom-0 left-0 right-0  z-40 animate-in fade-in slide-in-from-bottom-5 duration-300">
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
                  <span className="loading loading-spinner loading-sm"></span>
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

function AddQuestionModal({
  isOpen, onClose, onSave, testId, initialQuestion
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (question: Question) => void;
  testId: number | string;
  initialQuestion?: Question | null;
}) {
  const isEditing = !!initialQuestion;

  const defaultQuestionState: Question = {
    testId: testId,
    qid: "",
    type: "multiple_choice",
    text: "",
    options: { "A": "", "B": "", "C": "", "D": "" },
    correctAnswer: "",
    correctOption: 1,
    explanation: "",
    marks: 5,
  };

  const [newQuestion, setNewQuestion] = useState<Question>(initialQuestion || defaultQuestionState);

  useEffect(() => {
    if (initialQuestion) {
      setNewQuestion(initialQuestion);
    } else {
      setNewQuestion(defaultQuestionState);
    }
  }, [initialQuestion, testId]);

  useEffect(() => {
    if (initialQuestion?.type !== newQuestion.type) {
      if (newQuestion.type === "true_or_false") {
        setNewQuestion(prev => ({ ...prev, options: { "1": "True", "2": "False" }, correctOption: 1, }));
      }
      if (newQuestion.type === "multiple_choice") {
        setNewQuestion(prev => ({ ...prev, options: { "A": "", "B": "", "C": "", "D": "" }, correctOption: 1, }));
      }
    }
  }, [newQuestion.type, initialQuestion]);

  const handleOptionChange = (index: number, value: string) => {
    const keys = Object.keys(newQuestion.options);
    const key = keys[index];
    if (key) {
      const updatedOptions = { ...newQuestion.options, [key]: value };
      setNewQuestion({ ...newQuestion, options: updatedOptions });
    }
  };

  const handleSave = () => {
    onSave(newQuestion);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="theme-bg theme-border border h-[90vh] max-h-[800px] p-6 rounded-lg shadow-lg w-full max-w-2xl flex flex-col">
        <div className="flex justify-between items-center mb-4 flex-shrink-0">
          <h2 className="text-xl font-bold">{isEditing ? 'Edit Question' : 'Add New Question'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4 overflow-y-auto flex-grow pr-2 -mr-2">
          <div>
            <label className="block text-sm font-medium mb-1">Question</label>
            <textarea
              value={newQuestion.text}
              onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              className="textarea textarea-bordered w-full theme-bg-subtle theme-border"
              rows={2}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Type</label>
            <select
              value={newQuestion.type}
              onChange={(e) => setNewQuestion({ ...newQuestion, type: e.target.value })}
              className="w-full px-3 py-2 rounded border text-sm appearance-none theme-border theme-bg-subtle theme-text-secondary focus:outline-none focus:outline-none"
            >
              <option className="bg-white dark:bg-gray-800 text-black dark:text-white" value="multiple_choice">Multiple Choice</option>
              <option className="bg-white dark:bg-gray-800 text-black dark:text-white" value="true_or_false">True / False</option>
              <option className="bg-white dark:bg-gray-800 text-black dark:text-white" value="short_answer">Short Answer</option>
              <option className="bg-white dark:bg-gray-800 text-black dark:text-white" value="essay">Essay</option>
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
                    value={newQuestion.options[key as keyof typeof newQuestion.options]}
                    onChange={(e) => handleOptionChange(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    className="input input-bordered w-full theme-bg-subtle theme-border"
                  />
                </div>
              ))}
              <div className="pt-2">
                <label className="block text-sm font-medium mb-1">Correct Answer</label>
                <select
                  value={newQuestion.correctOption}
                  onChange={(e) =>
                    setNewQuestion({ ...newQuestion, correctOption: parseInt(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded border text-sm appearance-none theme-bg-subtle theme-border theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {Object.keys(newQuestion.options).map((_, i) => (
                    <option
                      key={i}
                      value={i + 1}
                      className="bg-white dark:bg-gray-800 text-black dark:text-white"
                    >
                      Option {i + 1}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {newQuestion.type === "true_or_false" && (
            <div className="space-y-2 p-4 theme-bg-subtle rounded-md">
              <label className="block text-sm font-medium mb-1">Correct Answer</label>
              <select
                value={newQuestion.correctOption}
                onChange={(e) =>
                  setNewQuestion({ ...newQuestion, correctOption: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2 rounded border text-sm appearance-none theme-bg-subtle theme-border theme-text-secondary focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option className="bg-white dark:bg-gray-800 text-black dark:text-white" value={1}>
                  True
                </option>
                <option className="bg-white dark:bg-gray-800 text-black dark:text-white" value={2}>
                  False
                </option>
              </select>

            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Points</label>
            <input
              type="number"
              min={1}
              value={newQuestion.marks}
              onChange={(e) => setNewQuestion({ ...newQuestion, marks: parseInt(e.target.value) || 1 })}
              className="input input-bordered w-full theme-bg-subtle theme-border"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Explanation (optional)</label>
            <textarea
              value={newQuestion.explanation}
              onChange={(e) => setNewQuestion({ ...newQuestion, explanation: e.target.value })}
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
            {isEditing ? 'Update Question' : 'Save Question'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditTestForm({ newTest, setNewTest }: {
  newTest: Test;
  setNewTest: React.Dispatch<React.SetStateAction<Test | null>>;
}) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue = ['durationMinutes'].includes(name) ? parseInt(value) || 0 : value;
    setNewTest(prev => prev ? { ...prev, [name]: finalValue } : prev);
  };

  return (
    <div className="space-y-4 h-fit theme-bg p-4 md:p-6 rounded-lg theme-border border">
      <h1 className="font-semibold text-xl">Test Details</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Test Name</label>
          <input
            type="text" name="name" value={newTest?.name || ''} onChange={handleChange}
            className="input input-bordered w-full theme-bg-subtle theme-border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Subject</label>
          <input
            type="text" name="subject" value={newTest?.subject || ''} onChange={handleChange}
            className="input input-bordered w-full theme-bg-subtle theme-border"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          name="description" value={newTest?.description || ''} onChange={handleChange}
          className="textarea textarea-bordered w-full theme-bg-subtle theme-border"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Difficulty</label>
          <select
            name="difficulty" value={newTest?.difficulty || 'medium'} onChange={handleChange}
            className="select select-bordered w-full theme-bg-subtle theme-border"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Format</label>
          <select
            name="format" value={newTest?.format || 'mixed'} onChange={handleChange}
            className="select select-bordered w-full theme-bg-subtle theme-border"
          >
            <option value="theory">Theory</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="mixed">Mixed</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Visibility</label>
          <select
            name="visibility" value={newTest?.visibility || 'private'} onChange={handleChange}
            className="select select-bordered w-full theme-bg-subtle theme-border"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Duration (minutes)</label>
          <input
            type="number" name="durationMinutes" value={newTest?.durationMinutes || 0} onChange={handleChange}
            className="input input-bordered w-full theme-bg-subtle theme-border"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Number of Questions</label>
          <input
            type="number" readOnly value={newTest?.numberOfQuestions || 0}
            className="input input-bordered w-full theme-bg-subtle theme-border bg-black/5 dark:bg-white/5 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Total Marks</label>
          <input
            type="number" readOnly value={newTest?.totalMarks || 0}
            className="input input-bordered w-full theme-bg-subtle theme-border bg-black/5 dark:bg-white/5 cursor-not-allowed"
          />
        </div>
      </div>
    </div>
  );
}
