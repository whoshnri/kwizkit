"use client";

import Image from "next/image";
import { ClipboardEvent, FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PiArrowRight, PiEnvelopeSimple } from "react-icons/pi";
import {
  requestLiveAccessOtp,
  verifyLiveAccessOtp,
} from "@/app/actions/liveTestOps";

type LiveAccessCardProps = {
  testSlug: string;
  test: {
    name: string;
    description: string | null;
    subject: string;
    questionsCount: number;
    duration: number;
    ownerName: string;
  };
};

export default function LiveAccessCard({ testSlug, test }: LiveAccessCardProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    setMessage(null);

    try {
      if (step === "email") {
        const response = await requestLiveAccessOtp(testSlug, email);

        if (response.status !== 200) {
          setError(response.message);
          return;
        }

        setEmail(response.metadata.email);
        setStep("otp");
        setMessage(response.message);
        return;
      }

      const response = await verifyLiveAccessOtp(testSlug, email, otp);

      if (response.status !== 200 || !response.metadata) {
        setError(response.message);
        return;
      }

      window.localStorage.setItem(
        `liveAttempt:${testSlug}`,
        JSON.stringify({
          attemptId: response.metadata.attemptId,
          email: response.metadata.email,
          studentName: response.metadata.studentName,
          verifiedAt: new Date().toISOString(),
        })
      );

      router.push(`/live/${testSlug}/setup`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--background)] p-4">
      <section className="w-full max-w-[420px] rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-6 shadow-sm md:p-7">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Image src="/logo.svg" alt="Rubric" width={32} height={32} className="rounded-lg" />
          <span className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)] px-3 py-1 text-xs font-semibold text-[var(--rubric-slate)]">
            Step {step === "email" ? 1 : 2} of 2
          </span>
        </div>

        <div className="mb-6 grid grid-cols-2 gap-2">
          {["Email", "Code"].map((label, index) => {
            const activeIndex = step === "email" ? 0 : 1;
            const isActive = index === activeIndex;
            const isDone = index < activeIndex;
            return (
              <div
                key={label}
                className={`h-1.5 rounded-full ${
                  isActive || isDone ? "bg-[var(--rubric-black)]" : "bg-[#E5E0D6]"
                }`}
                aria-label={`${label} step`}
              />
            );
          })}
        </div>

        <div className="mb-6">
          <div>
            <p className="text-sm font-semibold text-[var(--rubric-muted)]">Rubric Live Test</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-[-0.03em] text-[var(--rubric-black)]">
              {test.name}
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--rubric-slate)]">
              Authenticate your attempt to continue.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-5">
          <p className="text-sm font-semibold text-[var(--rubric-muted)]">{test.subject}</p>
          {test.description && (
            <p className="mt-3 text-sm leading-6 text-[var(--rubric-slate)]">
              {test.description}
            </p>
          )}
          <div className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-xl bg-[var(--surface-strong)] p-3">
              <p className="font-semibold text-[var(--rubric-black)]">{test.questionsCount}</p>
              <p className="mt-1 text-xs text-[var(--rubric-muted)]">Questions</p>
            </div>
            <div className="rounded-xl bg-[var(--surface-strong)] p-3">
              <p className="font-semibold text-[var(--rubric-black)]">{test.duration}</p>
              <p className="mt-1 text-xs text-[var(--rubric-muted)]">Minutes</p>
            </div>
            <div className="rounded-xl bg-[var(--surface-strong)] p-3">
              <p className="truncate font-semibold text-[var(--rubric-black)]">{test.ownerName}</p>
              <p className="mt-1 text-xs text-[var(--rubric-muted)]">Owner</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-2 block text-xs font-bold text-[var(--rubric-muted)]">
              {step === "email" ? "Email address" : "One-time passcode"}
            </span>
            {step === "email" ? (
              <div className="relative">
                <PiEnvelopeSimple className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--rubric-muted)]" />
                <input
                  required
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-lg border border-[var(--border)] bg-[#FAF8F3] px-4 pl-12 text-sm text-[var(--rubric-black)] outline-none focus:border-[var(--rubric-black)]"
                  placeholder="student@example.com"
                />
              </div>
            ) : (
              <OtpInput value={otp} onChange={setOtp} />
            )}
          </label>

          {message && (
            <p className="rounded-xl border border-[rgba(47,107,79,0.2)] bg-[rgba(47,107,79,0.08)] px-3 py-2 text-sm text-[var(--rubric-success)]">
              {message}
            </p>
          )}
          {error && (
            <p className="rounded-xl border border-[rgba(180,35,24,0.2)] bg-[rgba(180,35,24,0.08)] px-3 py-2 text-sm text-[var(--rubric-danger)]">
              {error}
            </p>
          )}

          {step === "otp" && (
            <button
              type="button"
              onClick={() => {
                setStep("email");
                setOtp("");
                setMessage(null);
                setError(null);
              }}
              className="text-sm font-semibold text-[var(--rubric-slate)]"
            >
              Change email
            </button>
          )}

          <button
            disabled={submitting || (step === "otp" && otp.length < 6)}
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--rubric-black)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting
              ? "Checking..."
              : step === "email"
                ? "Send mock OTP"
                : "Verify and continue"}
            {!submitting && <PiArrowRight className="h-5 w-5" />}
          </button>
        </form>
      </section>
    </main>
  );
}

function OtpInput({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(6, " ").slice(0, 6).split("");

  function setDigit(index: number, digit: string) {
    const next = digits.map((item) => (item === " " ? "" : item));
    next[index] = digit;
    onChange(next.join("").slice(0, 6));

    if (digit && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index: number, event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !digits[index].trim() && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, 5)]?.focus();
  }

  return (
    <div className="grid grid-cols-6 gap-2">
      {digits.map((digit, index) => (
        <input
          key={index}
          ref={(element) => {
            inputsRef.current[index] = element;
          }}
          aria-label={`OTP digit ${index + 1}`}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          value={digit.trim()}
          onPaste={handlePaste}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onChange={(event) => {
            const nextDigit = event.target.value.replace(/\D/g, "").slice(-1);
            setDigit(index, nextDigit);
          }}
          className="h-12 rounded-xl border border-[var(--border)] bg-[#FAF8F3] text-center text-lg font-semibold text-[var(--rubric-black)] outline-none focus:border-[var(--rubric-black)]"
        />
      ))}
    </div>
  );
}
