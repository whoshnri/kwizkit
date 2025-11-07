import { run } from "@/app/actions/aiOps";
import React, {
  useState,
  useEffect,
  useCallback,
  ChangeEvent,
  DragEvent,
  FC,
  ReactNode,
} from "react";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Test } from "../tests/[test-name]/page";
import { useSession } from "@/app/SessionContext";

type UseCase = "revise" | "create";

type QuestionType =
  | "multiple_choice"
  | "short_answer"
  | "essay"
  | "true_or_false";

type QuestionOptions = {
  A?: string;
  B?: string;
  C?: string;
  D?: string;
};

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

interface AIContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent?: string;
}

enum ModalStep {
  Onboarding,
  UseCaseSelection,
  Configuration,
  Loading,
  Review,
}

const ReviseIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 mb-2 theme-text-accent"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L14.732 3.732z"
    />
  </svg>
);
const CreateIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-8 w-8 mb-2 theme-text-accent"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
    />
  </svg>
);
const InlineSpinner = () => (
  <span className="loading loading-bars loading-lg" />
);

const AIContentModal: FC<AIContentModalProps> = ({
  isOpen,
  onClose,
  currentContent,
}) => {
  const { updateGeneratedContent } = useSession();
  const [step, setStep] = useState<ModalStep>(ModalStep.Onboarding);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [useCase, setUseCase] = useState<UseCase>("create");
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);

  useEffect(() => {
    if (localStorage.getItem("hideAIOnboarding") === "true") {
      setStep(ModalStep.UseCaseSelection);
    } else {
      setStep(ModalStep.Onboarding);
    }
  }, []);

  const resetState = useCallback(() => {
    const shouldSkipOnboarding =
      localStorage.getItem("hideAIOnboarding") === "true";
    setStep(
      shouldSkipOnboarding ? ModalStep.UseCaseSelection : ModalStep.Onboarding
    );
    setPrompt("");
    setSubject("");
    setNumQuestions(5);
    setFileContent(null);
    setFileName(null);
    setDontShowAgain(false);
    setGeneratedQuestions([]);
  }, []);

  const handleClose = useCallback(() => {
    onClose();
    setTimeout(resetState, 300);
  }, [onClose, resetState]);

  const handleProceedFromOnboarding = useCallback(() => {
    if (dontShowAgain) {
      localStorage.setItem("hideAIOnboarding", "true");
    }
    setStep(ModalStep.UseCaseSelection);
  }, [dontShowAgain]);

  const handleSelectUseCase = useCallback(
    (selectedUseCase: UseCase) => {
      setUseCase(selectedUseCase);
      if (selectedUseCase === "revise" && currentContent) {
        setPrompt(currentContent);
      } else {
        setPrompt("");
      }
      setStep(ModalStep.Configuration);
    },
    [currentContent]
  );

  const processFile = useCallback((file: File | null) => {
    if (!file) return;
    if (file.type !== "text/plain") {
      toast.error("Invalid file type. Please upload a .txt file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setFileContent(e.target?.result as string);
      setFileName(file.name);
    };
    reader.onerror = () =>
      toast.error("Failed to read file. Please try again.");
    reader.readAsText(file);
  }, []);

  const handleFileChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      processFile(e.target.files?.[0] ?? null);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (e: DragEvent<HTMLLabelElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      processFile(e.dataTransfer.files?.[0] ?? null);
    },
    [processFile]
  );

  const handleDragEvents = useCallback((e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragging(true);
    } else if (e.type === "dragleave") {
      setIsDragging(false);
    }
  }, []);

  const parseAIResponse = (response: any): Question[] => {
    if (!response || !Array.isArray(response.metadata)) {
      console.error("Invalid AI response structure:", response);
      return [];
    }
    return response.metadata.map((item: any) => ({
      id: uuidv4(),
      testId: "",
      text: item.text || "",
      type: item.type,
      options: item.opt || {},
      correctOption: item.correctOpt ?? item.correctOption,
      correctAnswer: item.correctAnswer || null,
      marks: 1,
      explanation: item.explanation || null,
    }));
  };

  const handleGenerate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please provide a prompt to guide the AI.");
      return;
    }
    setStep(ModalStep.Loading);

    const fullPrompt = `
      Subject: ${subject || "General"}
      Number of Questions to Generate: ${numQuestions}
      ---
      User Prompt:
      ${prompt}
    `;

    const response = await run(fullPrompt, fileContent || "");
    console.log("AI Response:", response);

    if (response && response.status === "error") {
      toast.error("Generation Failed", { description: response.message });
      console.error("Server error details:", response.details);
      setStep(ModalStep.Configuration);
    } else {
      const parsedQuestions = parseAIResponse(response);
      if (parsedQuestions.length === 0) {
        toast.error("The AI returned an empty or invalid set of questions.");
        setStep(ModalStep.Configuration);
        return;
      }
      setGeneratedQuestions(parsedQuestions);
      setStep(ModalStep.Review);
      toast.success("Questions generated! Please review and edit below.");
    }
  }, [prompt, subject, numQuestions, fileContent]);

  const handleQuestionChange = (
    id: string,
    field: keyof Question,
    value: any
  ) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleOptionChange = (id: string, optionKey: string, value: string) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) =>
        q.id === id
          ? { ...q, options: { ...q.options, [optionKey]: value } }
          : q
      )
    );
  };

  const handleCorrectOptionChange = (id: string, newCorrectIndex: number) => {
    setGeneratedQuestions((prev) =>
      prev.map((q) =>
        q.id === id ? { ...q, correctOption: newCorrectIndex } : q
      )
    );
  };

  const handleSave = useCallback(() => {
    console.log("importing questions");
    updateGeneratedContent(generatedQuestions);
    handleClose();
  }, [generatedQuestions, handleClose]);

  if (!isOpen) return null;

  const renderStepContent = (): ReactNode => {
    switch (step) {
      case ModalStep.Onboarding:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-200">
              How to Use the AI Assistant
            </h2>
            <div className="mt-4 text-gray-400 space-y-3">
              <p>Welcome! Here’s a quick guide to get you started:</p>
              <ul className="list-disc list-inside space-y-2">
                <li>
                  <strong>Choose Your Goal:</strong> Select whether you want to
                  revise existing text or create something new.
                </li>
                <li>
                  <strong>Provide Context:</strong> Write a clear prompt to
                  guide the AI. Be specific!
                </li>
                <li>
                  <strong>(Optional) Upload Notes:</strong> For more detailed
                  results, you can upload a <code>.txt</code> file with key
                  points.
                </li>
              </ul>
            </div>
            <div className="mt-6 flex justify-between items-center">
              <label className="flex items-center text-sm text-gray-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="ml-2">Don't show this again</span>
              </label>
              <button
                onClick={handleProceedFromOnboarding}
                className="px-6 py-2 theme-button-primary text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
              >
                Get Started
              </button>
            </div>
          </>
        );
      case ModalStep.UseCaseSelection:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-200 text-center">
              What would you like to do?
            </h2>
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleSelectUseCase("revise")}
                className="flex flex-col items-center p-6 border-2 theme-border-color rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <ReviseIcon />
                <h3 className="font-semibold text-gray-200">Revise Content</h3>
                <p className="text-sm text-gray-400 text-center mt-1">
                  Enhance, shorten, or rephrase your current test.
                </p>
              </button>
              <button
                onClick={() => handleSelectUseCase("create")}
                className="flex flex-col items-center p-6 border-2 theme-border-color rounded-lg hover:bg-white/10 transition-all duration-200"
              >
                <CreateIcon />
                <h3 className="font-semibold text-gray-200">Create Content</h3>
                <p className="text-sm text-gray-400 text-center mt-1">
                  Generate fresh tests from a prompt or your notes.
                </p>
              </button>
            </div>
          </>
        );
      case ModalStep.Configuration:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-200 capitalize">
              {useCase} with AI
            </h2>
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Subject
                  </label>
                  <input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full p-2 rounded-md shadow-sm theme-input"
                  />
                </div>
                <div>
                  <label
                    htmlFor="numQuestions"
                    className="block text-sm font-medium text-gray-300 mb-1"
                  >
                    Number of Questions
                  </label>
                  <input
                    id="numQuestions"
                    type="number"
                    value={numQuestions}
                    onChange={(e) => setNumQuestions(Number(e.target.value))}
                    className="w-full p-2 rounded-md shadow-sm theme-input"
                    min="1"
                    max="20"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="prompt"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  AI Prompt
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  className="w-full p-2 theme-input rounded-md shadow-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Optional Guide (.txt)
                </label>
                <label
                  onDrop={handleDrop}
                  onDragOver={handleDragEvents}
                  onDragEnter={handleDragEvents}
                  onDragLeave={handleDragEvents}
                  className={`flex justify-center w-full px-6 pt-5 pb-6 border-2 theme-border-color border-dashed rounded-md transition-colors ${
                    isDragging
                      ? "theme-bg-subtle border-indigo-400"
                      : "hover:bg-white/10"
                  }`}
                >
                  <div className="space-y-1 text-center">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      stroke="currentColor"
                      fill="none"
                      viewBox="0 0 48 48"
                      aria-hidden="true"
                    >
                      <path
                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8"
                        strokeWidth={2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <span className="relative font-medium text-indigo-600 hover:text-indigo-500">
                        <span>Upload a file</span>
                        <input
                          id="file-upload"
                          name="file-upload"
                          type="file"
                          accept=".txt"
                          onChange={handleFileChange}
                          className="sr-only"
                        />
                      </span>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">TXT up to 1MB</p>
                  </div>
                </label>
                {fileName && (
                  <p className="mt-2 text-sm text-green-600">
                    File attached: {fileName}
                  </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerate}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
              >
                Generate
              </button>
            </div>
          </>
        );
      case ModalStep.Loading:
        return (
          <div className="flex flex-col items-center justify-center py-20">
            <InlineSpinner />
            <h2 className="mt-4 text-xl font-semibold text-gray-200">
              Generating Questions...
            </h2>
            <p className="mt-1 text-gray-400">
              The AI is working its magic. Please wait.
            </p>
          </div>
        );
      case ModalStep.Review:
        return (
          <>
            <h2 className="text-2xl font-bold text-gray-200">
              Review & Edit Questions
            </h2>
            <div className="mt-4 space-y-6 max-h-[60vh] overflow-y-auto pr-4">
              {generatedQuestions.map((q, index) => (
                <div
                  key={q.id}
                  className="p-4 rounded-lg border-2 theme-border-color theme-bg-subtle"
                >
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Question {index + 1}
                  </label>
                  <textarea
                    value={q.text}
                    onChange={(e) =>
                      handleQuestionChange(q.id, "text", e.target.value)
                    }
                    className="w-full p-2 theme-input rounded-md shadow-sm"
                    rows={3}
                  />
                  {q.type === "multiple_choice" && (
                    <div className="mt-3 grid grid-cols-2 gap-3">
                      {Object.entries(q.options).map(
                        ([key, value], optIndex) => (
                          <div key={key} className="flex items-center">
                            <input
                              type="radio"
                              name={`correct_opt_${q.id}`}
                              checked={q.correctOption === optIndex}
                              onChange={() =>
                                handleCorrectOptionChange(q.id, optIndex)
                              }
                              className="radio radio-primary"
                            />
                            <input
                              type="text"
                              value={value}
                              onChange={(e) =>
                                handleOptionChange(q.id, key, e.target.value)
                              }
                              className="ml-2 w-full p-2 theme-input rounded-md"
                            />
                          </div>
                        )
                      )}
                    </div>
                  )}
                  {q.type === "true_or_false" && (
                    <div className="mt-3 flex space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`correct_opt_${q.id}`}
                          className="radio radio-primary"
                          checked={q.correctOption === 0}
                          onChange={() => handleCorrectOptionChange(q.id, 0)}
                        />
                        <span className="ml-2">True</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`correct_opt_${q.id}`}
                          className="radio radio-primary"
                          checked={q.correctOption === 1}
                          onChange={() => handleCorrectOptionChange(q.id, 1)}
                        />
                        <span className="ml-2">False</span>
                      </label>
                    </div>
                  )}
                  {(q.type === "short_answer" || q.type === "essay") && (
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Correct Answer
                      </label>
                      <input
                        type="text"
                        value={q.correctAnswer ?? ""}
                        onChange={(e) =>
                          handleQuestionChange(
                            q.id,
                            "correctAnswer",
                            e.target.value
                          )
                        }
                        className="w-full p-2 theme-input rounded-md"
                      />
                    </div>
                  )}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Explanation
                    </label>
                    <textarea
                      value={q.explanation ?? ""}
                      onChange={(e) =>
                        handleQuestionChange(
                          q.id,
                          "explanation",
                          e.target.value
                        )
                      }
                      className="w-full p-2 theme-input rounded-md"
                      rows={2}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 font-semibold rounded-lg hover:bg-gray-300"
              >
                Discard
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700"
              >
                Import
              </button>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10  transition-opacity"
      aria-labelledby="modal-title"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative theme-bg theme-border-color border-2 border-dashed rounded-lg shadow-xl w-full max-w-3xl mx-4 p-6 sm:p-8 transform transition-all">
        {step !== ModalStep.Loading && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
        {renderStepContent()}
      </div>
    </div>
  );
};

export default AIContentModal;
