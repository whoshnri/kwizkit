"use client";

import { ChangeEvent, DragEvent, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { run } from "@/app/actions/aiOps";
import { useSession } from "@/app/SessionContext";
import { readStorageItem, writeStorageItem } from "@/lib/browserStorage";
import {
  AiImportMode,
  AiModalStep,
  AiQuestion,
  AiQuestionType,
  AiUseCase,
  buildAIGenerationPrompt,
  parseAIQuestions,
} from "@/app/dashboard/lib/aiModal";

const hideOnboardingKey = "hideAIOnboarding";

export function useAIContentModal({
  onClose,
  currentContent,
}: {
  onClose: () => void;
  currentContent?: string;
}) {
  const { updateGeneratedContent } = useSession();
  const [step, setStep] = useState<AiModalStep>(AiModalStep.Onboarding);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [useCase, setUseCase] = useState<AiUseCase>("create");
  const [prompt, setPrompt] = useState("");
  const [subject, setSubject] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questionTypes, setQuestionTypes] = useState<AiQuestionType[]>(["multiple_choice"]);
  const [questionTypeInstructions, setQuestionTypeInstructions] = useState<Record<AiQuestionType, string>>({
    multiple_choice: "",
    true_or_false: "",
    short_answer: "",
    essay: "",
  });
  const [importMode, setImportMode] = useState<AiImportMode>("upsert");
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<AiQuestion[]>([]);

  useEffect(() => {
    setStep(
      readStorageItem(hideOnboardingKey) === "true"
        ? AiModalStep.UseCaseSelection
        : AiModalStep.Onboarding
    );
  }, []);

  const resetState = useCallback(() => {
    const shouldSkipOnboarding = readStorageItem(hideOnboardingKey) === "true";
    setStep(shouldSkipOnboarding ? AiModalStep.UseCaseSelection : AiModalStep.Onboarding);
    setPrompt("");
    setSubject("");
    setNumQuestions(5);
    setQuestionTypes(["multiple_choice"]);
    setQuestionTypeInstructions({
      multiple_choice: "",
      true_or_false: "",
      short_answer: "",
      essay: "",
    });
    setImportMode("upsert");
    setFileContent(null);
    setFileName(null);
    setDontShowAgain(false);
    setGeneratedQuestions([]);
  }, []);

  const close = useCallback(() => {
    onClose();
    window.setTimeout(resetState, 300);
  }, [onClose, resetState]);

  const proceedFromOnboarding = useCallback(() => {
    if (dontShowAgain) {
      writeStorageItem(hideOnboardingKey, "true");
    }
    setStep(AiModalStep.UseCaseSelection);
  }, [dontShowAgain]);

  const selectUseCase = useCallback(
    (selectedUseCase: AiUseCase) => {
      setUseCase(selectedUseCase);
      setPrompt(selectedUseCase === "revise" && currentContent ? currentContent : "");
      setStep(AiModalStep.Configuration);
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
    reader.onload = (event) => {
      setFileContent(event.target?.result as string);
      setFileName(file.name);
    };
    reader.onerror = () => toast.error("Failed to read file. Please try again.");
    reader.readAsText(file);
  }, []);

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      processFile(event.target.files?.[0] ?? null);
    },
    [processFile]
  );

  const handleDrop = useCallback(
    (event: DragEvent<HTMLLabelElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setIsDragging(false);
      processFile(event.dataTransfer.files?.[0] ?? null);
    },
    [processFile]
  );

  const handleDragEvents = useCallback((event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(event.type === "dragenter" || event.type === "dragover");
  }, []);

  const toggleQuestionType = useCallback((type: AiQuestionType) => {
    setQuestionTypes((previous) => {
      if (previous.includes(type)) {
        return previous.length === 1 ? previous : previous.filter((item) => item !== type);
      }

      return [...previous, type];
    });
  }, []);

  const updateQuestionTypeInstruction = useCallback((type: AiQuestionType, value: string) => {
    setQuestionTypeInstructions((previous) => ({
      ...previous,
      [type]: value,
    }));
  }, []);

  const generate = useCallback(async () => {
    if (!prompt.trim()) {
      toast.error("Please provide a prompt to guide the AI.");
      return;
    }

    setStep(AiModalStep.Loading);

    const response = await run(
      buildAIGenerationPrompt({
        subject,
        numQuestions,
        prompt,
        questionTypes,
        questionTypeInstructions,
      }),
      fileContent || ""
    );

    if (response && response.status === "error") {
      toast.error("Generation Failed", { description: response.message });
      console.error("Server error details:", response.details);
      setStep(AiModalStep.Configuration);
      return;
    }

    const parsedQuestions = parseAIQuestions(response);
    if (parsedQuestions.length === 0) {
      toast.error("The AI returned an empty or invalid set of questions.");
      setStep(AiModalStep.Configuration);
      return;
    }

    setGeneratedQuestions(parsedQuestions);
    setStep(AiModalStep.Review);
    toast.success("Questions generated! Please review and edit below.");
  }, [fileContent, numQuestions, prompt, questionTypeInstructions, questionTypes, subject]);

  const updateQuestion = useCallback(
    <Field extends keyof AiQuestion>(id: string, field: Field, value: AiQuestion[Field]) => {
      setGeneratedQuestions((previous) =>
        previous.map((question) =>
          question.id === id ? { ...question, [field]: value } : question
        )
      );
    },
    []
  );

  const updateOption = useCallback((id: string, optionKey: string, value: string) => {
    setGeneratedQuestions((previous) =>
      previous.map((question) =>
        question.id === id
          ? { ...question, options: { ...question.options, [optionKey]: value } }
          : question
      )
    );
  }, []);

  const updateCorrectOption = useCallback((id: string, correctOption: number) => {
    updateQuestion(id, "correctOption", correctOption);
  }, [updateQuestion]);

  const importQuestions = useCallback(() => {
    updateGeneratedContent({
      questions: generatedQuestions,
      importMode,
    });
    close();
  }, [close, generatedQuestions, importMode, updateGeneratedContent]);

  return {
    step,
    dontShowAgain,
    setDontShowAgain,
    useCase,
    prompt,
    setPrompt,
    subject,
    setSubject,
    numQuestions,
    setNumQuestions,
    questionTypes,
    toggleQuestionType,
    questionTypeInstructions,
    updateQuestionTypeInstruction,
    importMode,
    setImportMode,
    fileName,
    isDragging,
    generatedQuestions,
    close,
    proceedFromOnboarding,
    selectUseCase,
    handleFileChange,
    handleDrop,
    handleDragEvents,
    generate,
    updateQuestion,
    updateOption,
    updateCorrectOption,
    importQuestions,
  };
}
