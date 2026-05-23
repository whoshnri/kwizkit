"use client";

import { FC, ReactNode } from "react";
import {
  DashboardButton,
  DashboardField,
  fieldClass,
  ResponsiveSheet,
  textareaClass,
} from "./primitives";
import { useAIContentModal } from "@/app/dashboard/hooks/useAIContentModal";
import { AiModalStep, AiQuestion, AiQuestionType, AiUseCase } from "@/app/dashboard/lib/aiModal";
import { CheckCircle2, FileText, PenLine, Sparkles, UploadCloud } from "lucide-react";
import {PenNibIcon, UploadIcon} from "@phosphor-icons/react"
import FlareIcon from '@mui/icons-material/Flare';
import CircularProgress from "@mui/material/CircularProgress";


interface AIContentModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentContent?: string;
}

const InlineSpinner = () => <span className="loading loading-bars loading-lg" />;

const AIContentModal: FC<AIContentModalProps> = ({
  isOpen,
  onClose,
  currentContent,
}) => {
  const modal = useAIContentModal({ onClose, currentContent });

  if (!isOpen) return null;

  return (
    <ResponsiveSheet
      title="AI Assistant"
      onClose={modal.close}
      className="md:max-w-3xl"
    >
      <div className="space-y-6">
        <StepContent modal={modal} />
      </div>
    </ResponsiveSheet>
  );
};

export default AIContentModal;

type ModalController = ReturnType<typeof useAIContentModal>;

function StepContent({ modal }: { modal: ModalController }): ReactNode {
  switch (modal.step) {
    case AiModalStep.Onboarding:
      return <OnboardingStep modal={modal} />;
    case AiModalStep.UseCaseSelection:
      return <UseCaseStep onSelect={modal.selectUseCase} />;
    case AiModalStep.Configuration:
      return <ConfigurationStep modal={modal} />;
    case AiModalStep.Loading:
      return <LoadingStep />;
    case AiModalStep.Review:
      return <ReviewStep modal={modal} />;
    default:
      return null;
  }
}

function OnboardingStep({ modal }: { modal: ModalController }) {
  return (
    <div className="space-y-6">
      <div>
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--rubric-black)]">
          <Sparkles className="h-5 w-5" />
        </div>
        <h2 className="text-2xl font-semibold text-[var(--rubric-black)]">
          Create better questions with AI
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--rubric-slate)]">
          Start with a goal, add the context you want Rubric to follow, then review
          each generated question before importing it into your test.
        </p>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <ul className="space-y-3 text-sm leading-6 text-[var(--rubric-slate)]">
          <li>
            <strong className="font-semibold text-[var(--rubric-black)]">Choose a goal.</strong>{" "}
            Revise existing text or create fresh questions.
          </li>
          <li>
            <strong className="font-semibold text-[var(--rubric-black)]">Add context.</strong>{" "}
            Include the subject, count, and a clear prompt.
          </li>
          <li>
            <strong className="font-semibold text-[var(--rubric-black)]">Attach notes.</strong>{" "}
            Upload a <code>.txt</code> file when you want the output to follow source material.
          </li>
        </ul>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex cursor-pointer items-center text-sm font-medium text-[var(--rubric-slate)]">
          <input
            type="checkbox"
            checked={modal.dontShowAgain}
            onChange={(event) => modal.setDontShowAgain(event.target.checked)}
            className="h-4 w-4 rounded border-[var(--border)] accent-[var(--rubric-black)]"
          />
          <span className="ml-2">Don't show this again</span>
        </label>
        <DashboardButton type="button" onClick={modal.proceedFromOnboarding}>
          Get Started
        </DashboardButton>
      </div>
    </div>
  );
}

function UseCaseStep({ onSelect }: { onSelect: (useCase: AiUseCase) => void }) {
  const options: Array<{
    value: AiUseCase;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      value: "revise",
      title: "Revise Content",
      description: "Improve, shorten, or rephrase questions already in this test.",
      icon: PenNibIcon,
    },
    {
      value: "create",
      title: "Create Content",
      description: "Generate a new question set from your prompt or uploaded notes.",
      icon: FlareIcon,
    },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--rubric-black)]">
          What would you like to do?
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--rubric-slate)]">
          Pick the workflow that matches the content you want to prepare.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {options.map(({ value, title, description, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onSelect(value)}
            className="flex min-h-40 cursor-pointer flex-col items-start rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] p-5 text-left transition hover:bg-[var(--surface-muted)]"
          >
            <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--surface-muted)] text-[var(--rubric-black)]">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="text-base font-semibold text-[var(--rubric-black)]">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[var(--rubric-slate)]">
              {description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function ConfigurationStep({ modal }: { modal: ModalController }) {
  const questionTypeOptions: Array<{
    value: AiQuestionType;
    label: string;
    description: string;
    placeholder: string;
  }> = [
    {
      value: "multiple_choice",
      label: "Multiple choice",
      description: "Four-option questions with one correct answer.",
      placeholder: "e.g., focus on interpretation, not recall",
    },
    {
      value: "true_or_false",
      label: "True / false",
      description: "Binary checks for facts, claims, or definitions.",
      placeholder: "e.g., use nuanced statements students must evaluate",
    },
    {
      value: "short_answer",
      label: "Short answer",
      description: "Brief written responses with an expected answer.",
      placeholder: "e.g., ask for one-sentence explanations",
    },
    {
      value: "essay",
      label: "Essay",
      description: "Longer prompts that test argument and structure.",
      placeholder: "e.g., compare two themes with evidence",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold capitalize text-[var(--rubric-black)]">
          {modal.useCase} with AI
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--rubric-slate)]">
          Give Rubric the exact boundaries for the questions you want to generate.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <DashboardField label="Subject">
            <input
              id="subject"
              value={modal.subject}
              onChange={(event) => modal.setSubject(event.target.value)}
              placeholder="e.g., Biology"
              className={fieldClass}
            />
          </DashboardField>
          <DashboardField label="Number of Questions">
            <input
              id="numQuestions"
              type="number"
              value={modal.numQuestions}
              onChange={(event) => modal.setNumQuestions(Number(event.target.value))}
              className={fieldClass}
              min="1"
              max="20"
            />
          </DashboardField>
        </div>

        <div className="space-y-3">
          <div>
            <span className="mb-2 block text-xs font-bold text-[var(--rubric-muted)]">
              Question Types
            </span>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {questionTypeOptions.map((option) => {
                const selected = modal.questionTypes.includes(option.value);

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => modal.toggleQuestionType(option.value)}
                    className={`rounded-lg border p-4 text-left transition ${
                      selected
                        ? "border-[var(--rubric-black)] bg-[var(--surface-muted)]"
                        : "border-[var(--border)] bg-[var(--surface-strong)] hover:bg-[var(--surface-muted)]"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold text-[var(--rubric-black)]">
                      <span
                        className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                          selected
                            ? "border-[var(--rubric-black)] bg-[var(--rubric-black)]"
                            : "border-[var(--border)] bg-white"
                        }`}
                      >
                        {selected && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
                      </span>
                      {option.label}
                    </span>
                    <span className="mt-2 block text-sm leading-5 text-[var(--rubric-slate)]">
                      {option.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {questionTypeOptions
            .filter((option) => modal.questionTypes.includes(option.value))
            .map((option) => (
              <DashboardField key={option.value} label={`${option.label} guidance`}>
                <input
                  value={modal.questionTypeInstructions[option.value]}
                  onChange={(event) =>
                    modal.updateQuestionTypeInstruction(option.value, event.target.value)
                  }
                  placeholder={option.placeholder}
                  className={fieldClass}
                />
              </DashboardField>
            ))}
        </div>

        <DashboardField label="AI Prompt">
          <textarea
            id="prompt"
            value={modal.prompt}
            onChange={(event) => modal.setPrompt(event.target.value)}
            placeholder="Describe the topic, grade level, format, and any rules the questions should follow."
            rows={5}
            className={textareaClass}
          />
        </DashboardField>

        <div>
          <span className="mb-2 block text-xs font-bold text-[var(--rubric-muted)]">
            Optional Guide (.txt)
          </span>
          <label
            onDrop={modal.handleDrop}
            onDragOver={modal.handleDragEvents}
            onDragEnter={modal.handleDragEvents}
            onDragLeave={modal.handleDragEvents}
            className={`flex min-h-40 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed px-6 py-6 transition ${
              modal.isDragging
                ? "border-[var(--rubric-black)] bg-[var(--surface-muted)]"
                : "border-[var(--border)] bg-[var(--surface-strong)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            <div className="space-y-2 text-center">
              <UploadIcon className="mx-auto h-9 w-9 text-[var(--rubric-black)]" />
              <div className="text-sm text-[var(--rubric-slate)]">
                <span className="font-semibold text-[var(--rubric-black)]">Upload a file</span>{" "}
                or drag and drop
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  accept=".txt"
                  onChange={modal.handleFileChange}
                  className="sr-only"
                />
              </div>
              <p className="text-xs text-[var(--rubric-muted)]">TXT up to 1MB</p>
            </div>
          </label>
          {modal.fileName && (
            <p className="mt-2 flex items-center gap-2 text-sm font-medium text-[var(--rubric-success)]">
              <CheckCircle2 className="h-4 w-4" />
              File attached: {modal.fileName}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <DashboardButton type="button" variant="secondary" onClick={modal.close}>
          Cancel
        </DashboardButton>
        <DashboardButton type="button" onClick={modal.generate}>
          <FlareIcon className="h-4 w-4" />
          Generate
        </DashboardButton>
      </div>
    </div>
  );
}

function LoadingStep() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <CircularProgress size={40} color="inherit" className="text-[var(--rubric-black)]" aria-label="Loading…" />
      <h2 className="mt-4 text-xl font-semibold text-[var(--rubric-black)]">
        Generating questions...
      </h2>
      <p className="mt-1 text-sm text-[var(--rubric-slate)]">
        The AI is preparing your draft.
      </p>
    </div>
  );
}

function ReviewStep({ modal }: { modal: ModalController }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-[var(--rubric-black)]">
          Review and edit questions
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--rubric-slate)]">
          Check each answer and explanation before importing the set.
        </p>
      </div>
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
        <span className="mb-3 block text-xs font-bold text-[var(--rubric-muted)]">
          Import Behavior
        </span>
        <div className="grid gap-3 md:grid-cols-2">
          {[
            {
              value: "upsert" as const,
              title: "Upsert",
              description: "Update matching questions and add new ones.",
            },
            {
              value: "append" as const,
              title: "Append",
              description: "Add every generated question to the current bank.",
            },
          ].map((option) => {
            const selected = modal.importMode === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => modal.setImportMode(option.value)}
                className={`rounded-lg border p-4 text-left transition ${
                  selected
                    ? "border-[var(--rubric-black)] bg-[var(--surface-strong)]"
                    : "border-[var(--border)] bg-transparent hover:bg-[var(--surface-strong)]"
                }`}
              >
                <span className="text-sm font-semibold text-[var(--rubric-black)]">
                  {option.title}
                </span>
                <span className="mt-1 block text-sm leading-5 text-[var(--rubric-slate)]">
                  {option.description}
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="max-h-[60vh] space-y-4 overflow-y-auto pr-2">
        {modal.generatedQuestions.map((question, index) => (
          <QuestionReviewCard
            key={question.id}
            question={question}
            index={index}
            modal={modal}
          />
        ))}
      </div>
      <div className="flex justify-end gap-3">
        <DashboardButton type="button" variant="secondary" onClick={modal.close}>
          Discard
        </DashboardButton>
        <DashboardButton type="button" onClick={modal.importQuestions}>
          <FileText className="h-4 w-4" />
          Import
        </DashboardButton>
      </div>
    </div>
  );
}

function QuestionReviewCard({
  question,
  index,
  modal,
}: {
  question: AiQuestion;
  index: number;
  modal: ModalController;
}) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <label className="mb-2 block text-xs font-bold text-[var(--rubric-muted)]">
        Question {index + 1}
      </label>
      <textarea
        value={question.text}
        onChange={(event) => modal.updateQuestion(question.id, "text", event.target.value)}
        className={textareaClass}
        rows={3}
      />

      {question.type === "multiple_choice" && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {Object.entries(question.options).map(([key, value], optionIndex) => (
            <div key={key} className="flex items-center">
              <input
                type="radio"
                name={`correct_opt_${question.id}`}
                checked={question.correctOption === optionIndex}
                onChange={() => modal.updateCorrectOption(question.id, optionIndex)}
                className="h-4 w-4 accent-[var(--rubric-black)]"
              />
              <input
                type="text"
                value={value}
                onChange={(event) => modal.updateOption(question.id, key, event.target.value)}
                className={`ml-2 ${fieldClass}`}
              />
            </div>
          ))}
        </div>
      )}

      {question.type === "true_or_false" && (
        <div className="mt-3 flex space-x-4">
          {[0, 1].map((value) => (
            <label
              key={value}
              className="flex items-center text-sm font-medium text-[var(--rubric-black)]"
            >
              <input
                type="radio"
                name={`correct_opt_${question.id}`}
                className="h-4 w-4 accent-[var(--rubric-black)]"
                checked={question.correctOption === value}
                onChange={() => modal.updateCorrectOption(question.id, value)}
              />
              <span className="ml-2">{value === 0 ? "True" : "False"}</span>
            </label>
          ))}
        </div>
      )}

      {(question.type === "short_answer" || question.type === "essay") && (
        <div className="mt-3">
          <label className="mb-2 block text-xs font-bold text-[var(--rubric-muted)]">
            Correct Answer
          </label>
          <input
            type="text"
            value={question.correctAnswer ?? ""}
            onChange={(event) =>
              modal.updateQuestion(question.id, "correctAnswer", event.target.value)
            }
            className={fieldClass}
          />
        </div>
      )}

      <div className="mt-3">
        <label className="mb-2 block text-xs font-bold text-[var(--rubric-muted)]">
          Explanation
        </label>
        <textarea
          value={question.explanation ?? ""}
          onChange={(event) =>
            modal.updateQuestion(question.id, "explanation", event.target.value)
          }
          className={textareaClass}
          rows={2}
        />
      </div>
    </div>
  );
}
