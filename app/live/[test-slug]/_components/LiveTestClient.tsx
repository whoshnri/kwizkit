"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PiCheckCircle,
  PiFlag,
  PiFlagFill,
  PiPaperPlaneTilt,
  PiTimer,
  PiWarningCircle,
} from "react-icons/pi";
import type { LiveQuestion, LiveTestPayload } from "@/app/actions/liveTestOps";
import { submitLiveAttempt } from "@/app/actions/liveTestOps";
import {
  clearStoredLiveAttempt,
  readStoredLiveAttempt,
  type StoredLiveAttempt,
} from "./liveAttemptStorage";

type AnswerMap = Record<string, string | number | null>;

export default function LiveTestClient({ test }: { test: LiveTestPayload }) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<StoredLiveAttempt | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [secondsLeft, setSecondsLeft] = useState(Math.max(test.duration, 1) * 60);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; totalMarks: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedAttempt = readStoredLiveAttempt(test.slug);
    if (!storedAttempt) {
      router.replace(`/live/${test.slug}/access`);
      return;
    }

    setAttempt(storedAttempt);
  }, [router, test.slug]);

  useEffect(() => {
    if (result) return;

    const timer = window.setInterval(() => {
      setSecondsLeft((current) => Math.max(current - 1, 0));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [result]);

  useEffect(() => {
    if (secondsLeft === 0 && !submitting && !result && attempt) {
      void handleSubmit();
    }
  }, [attempt, result, secondsLeft, submitting]);

  const currentQuestion = test.questions[currentIndex];
  const answeredCount = useMemo(
    () =>
      test.questions.filter((question) => {
        const answer = answers[question.id];
        return answer !== undefined && answer !== null && String(answer).trim() !== "";
      }).length,
    [answers, test.questions]
  );

  function setAnswer(questionId: string, value: string | number | null) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  }

  function toggleFlag(questionId: string) {
    setFlagged((current) =>
      current.includes(questionId)
        ? current.filter((id) => id !== questionId)
        : [...current, questionId]
    );
  }

  async function handleSubmit() {
    if (!attempt) return;

    setSubmitting(true);
    setError(null);

    const response = await submitLiveAttempt({
      attemptId: attempt.attemptId,
      answers,
      flagged,
    });

    setSubmitting(false);

    if (response.status !== 200 || !response.metadata) {
      setError(response.message);
      return;
    }

    clearStoredLiveAttempt(test.slug);
    setResult(response.metadata);
  }

  if (!currentQuestion) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[var(--background)] p-4">
        <div className="max-w-md rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-6 text-center">
          <PiWarningCircle className="mx-auto h-10 w-10 text-[var(--rubric-warning)]" />
          <h1 className="mt-4 text-xl font-semibold">No questions available</h1>
          <p className="mt-2 text-sm text-[var(--rubric-slate)]">
            This test has no questions yet.
          </p>
        </div>
      </main>
    );
  }

  if (result) {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-[var(--background)] p-4">
        <section className="w-full max-w-lg rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-8 text-center">
          <PiCheckCircle className="mx-auto h-12 w-12 text-[var(--rubric-success)]" />
          <h1 className="mt-4 text-3xl font-semibold">Attempt submitted</h1>
          <p className="mt-3 text-sm leading-6 text-[var(--rubric-slate)]">
            Your answers have been recorded for {test.name}.
          </p>
          <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
            <p className="text-sm text-[var(--rubric-muted)]">Auto-scored result</p>
            <p className="mt-1 text-2xl font-semibold">
              {result.score} / {result.totalMarks}
            </p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-dvh bg-[var(--background)] p-4 text-[var(--rubric-black)] md:p-6">
      <section className="mx-auto flex w-full max-w-7xl items-start gap-6">
        <div className="min-w-0 flex-1">
          <header className="mb-5 rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-[var(--rubric-muted)]">
                  {test.subject}
                </p>
                <h1 className="mt-1 text-2xl font-semibold md:text-3xl">{test.name}</h1>
              </div>
              <div className="flex items-center gap-3 text-sm text-[var(--rubric-slate)]">
                <span>{answeredCount} answered</span>
                <span>{flagged.length} flagged</span>
              </div>
            </div>
          </header>

          <QuestionPanel
            question={currentQuestion}
            index={currentIndex}
            total={test.questions.length}
            answer={answers[currentQuestion.id]}
            flagged={flagged.includes(currentQuestion.id)}
            onAnswer={(value) => setAnswer(currentQuestion.id, value)}
            onToggleFlag={() => toggleFlag(currentQuestion.id)}
          />

          {error && (
            <p className="mt-4 rounded-xl border border-[rgba(180,35,24,0.2)] bg-[rgba(180,35,24,0.08)] px-3 py-2 text-sm text-[var(--rubric-danger)]">
              {error}
            </p>
          )}

          <div className="mt-5 flex justify-between gap-3">
            <button
              onClick={() => setCurrentIndex((index) => Math.max(index - 1, 0))}
              disabled={currentIndex === 0}
              className="rubric-button-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            {currentIndex === test.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="rubric-button-primary disabled:cursor-not-allowed disabled:opacity-60"
              >
                <PiPaperPlaneTilt className="h-5 w-5" />
                {submitting ? "Submitting..." : "Submit test"}
              </button>
            ) : (
              <button
                onClick={() =>
                  setCurrentIndex((index) => Math.min(index + 1, test.questions.length - 1))
                }
                className="rubric-button-primary"
              >
                Next question
              </button>
            )}
          </div>
        </div>

        <aside className="sticky top-6 hidden h-[calc(100dvh-3rem)] w-80 flex-none lg:block">
          <div className="flex h-full min-h-0 flex-col rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4">
            <div className="shrink-0 rounded-2xl border border-[var(--border)] bg-[var(--rubric-black)] p-4 text-white">
              <div className="flex items-center gap-2 text-sm text-white/75">
                <PiTimer className="h-5 w-5" />
                Time remaining
              </div>
              <p className="mt-2 text-3xl font-semibold tabular-nums">
                {formatTime(secondsLeft)}
              </p>
            </div>

            <div className="mt-4 shrink-0">
              <h2 className="text-lg font-semibold">Question navigator</h2>
              <p className="mt-1 text-sm text-[var(--rubric-muted)]">
                Answered, current, and flagged states stay visible here.
              </p>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-y-auto pr-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              <div className="grid grid-cols-5 gap-2">
                {test.questions.map((question, index) => {
                  const isCurrent = index === currentIndex;
                  const isAnswered =
                    answers[question.id] !== undefined &&
                    answers[question.id] !== null &&
                    String(answers[question.id]).trim() !== "";
                  const isFlagged = flagged.includes(question.id);

                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`relative flex h-11 items-center justify-center rounded-xl border text-sm font-semibold ${
                        isCurrent
                          ? "border-[var(--rubric-black)] bg-[var(--rubric-black)] text-white"
                          : isAnswered
                            ? "border-[rgba(47,107,79,0.25)] bg-[rgba(47,107,79,0.1)] text-[var(--rubric-success)]"
                            : "border-[var(--border)] bg-[#FAF8F3] text-[var(--rubric-slate)]"
                      }`}
                    >
                      {index + 1}
                      {isFlagged && (
                        <PiFlagFill className="absolute -right-1 -top-1 h-4 w-4 text-[var(--rubric-warning)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rubric-button-primary mt-4 w-full shrink-0 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PiPaperPlaneTilt className="h-5 w-5" />
              Submit
            </button>
          </div>
        </aside>
      </section>
    </main>
  );
}

function QuestionPanel({
  question,
  index,
  total,
  answer,
  flagged,
  onAnswer,
  onToggleFlag,
}: {
  question: LiveQuestion;
  index: number;
  total: number;
  answer: string | number | null | undefined;
  flagged: boolean;
  onAnswer: (value: string | number | null) => void;
  onToggleFlag: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-5 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[var(--rubric-muted)]">
            Question {index + 1} of {total} · {question.marks} marks
          </p>
          <h2 className="mt-3 text-2xl font-semibold leading-tight">{question.text}</h2>
        </div>
        <button
          onClick={onToggleFlag}
          className={`inline-flex h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold ${
            flagged
              ? "border-[rgba(161,98,7,0.25)] bg-[rgba(161,98,7,0.12)] text-[var(--rubric-warning)]"
              : "border-[var(--border)] bg-[#FAF8F3] text-[var(--rubric-slate)]"
          }`}
        >
          {flagged ? <PiFlagFill className="h-5 w-5" /> : <PiFlag className="h-5 w-5" />}
          Flag
        </button>
      </div>

      <div className="mt-8">
        {question.type === "multiple_choice" && (
          <div className="space-y-3">
            {question.options.map((option, optionIndex) => (
              <button
                key={`${question.id}-${option.key}`}
                onClick={() => onAnswer(optionIndex)}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                  answer === optionIndex
                    ? "border-[var(--rubric-black)] bg-[#FAF8F3]"
                    : "border-[var(--border)] bg-[var(--surface-muted)] hover:bg-[#FAF8F3]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold ${
                    answer === optionIndex
                      ? "border-[var(--rubric-black)] bg-[var(--rubric-black)] text-white"
                      : "border-[var(--border)] bg-white text-[var(--rubric-slate)]"
                  }`}
                >
                  {option.key}
                </span>
                <span className="text-sm font-medium">{option.value}</span>
              </button>
            ))}
          </div>
        )}

        {question.type === "true_or_false" && (
          <div className="grid gap-3 sm:grid-cols-2">
            {["true", "false"].map((value) => (
              <button
                key={value}
                onClick={() => onAnswer(value)}
                className={`rounded-2xl border p-5 text-left text-sm font-semibold capitalize ${
                  answer === value
                    ? "border-[var(--rubric-black)] bg-[#FAF8F3]"
                    : "border-[var(--border)] bg-[var(--surface-muted)]"
                }`}
              >
                {value}
              </button>
            ))}
          </div>
        )}

        {(question.type === "short_answer" || question.type === "essay") && (
          <textarea
            value={typeof answer === "string" ? answer : ""}
            onChange={(event) => onAnswer(event.target.value)}
            rows={question.type === "essay" ? 10 : 4}
            className="w-full rounded-2xl border border-[var(--border)] bg-[#FAF8F3] p-4 text-sm outline-none focus:border-[var(--rubric-black)]"
            placeholder="Type your answer here"
          />
        )}
      </div>
    </section>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}
