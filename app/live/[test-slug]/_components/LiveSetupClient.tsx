"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  PiArrowRight,
  PiCamera,
  PiCheck,
  PiMicrophone,
  PiShieldCheck,
  PiWarningCircle,
} from "react-icons/pi";
import type { LiveTestPayload } from "@/app/actions/liveTestOps";
import { completeLiveSetup } from "@/app/actions/liveTestOps";
import { readStoredLiveAttempt, type StoredLiveAttempt } from "./liveAttemptStorage";

type SetupStep = "rules" | "devices" | "summary";

export default function LiveSetupClient({ test }: { test: LiveTestPayload }) {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [attempt, setAttempt] = useState<StoredLiveAttempt | null>(null);
  const [step, setStep] = useState<SetupStep>("rules");
  const [agreed, setAgreed] = useState(false);
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const storedAttempt = readStoredLiveAttempt(test.slug);
    if (!storedAttempt) {
      router.replace(`/live/${test.slug}/access`);
      return;
    }

    setAttempt(storedAttempt);
  }, [router, test.slug]);

  useEffect(() => {
    if (videoRef.current && mediaStream) {
      videoRef.current.srcObject = mediaStream;
    }
  }, [mediaStream]);

  useEffect(() => {
    return () => {
      mediaStream?.getTracks().forEach((track) => track.stop());
    };
  }, [mediaStream]);

  async function requestDeviceAccess() {
    setMediaError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setMediaStream(stream);
    } catch {
      setMediaError("Camera and microphone access are required before the test can start.");
    }
  }

  async function finishSetup() {
    if (!attempt) return;

    setSubmitting(true);
    const response = await completeLiveSetup(attempt.attemptId);
    setSubmitting(false);

    if (response.status === 200) {
      router.push(`/live/${test.slug}/test`);
    }
  }

  const cameraReady = !!mediaStream?.getVideoTracks().length;
  const micReady = !!mediaStream?.getAudioTracks().length;
  const setupSteps: SetupStep[] = ["rules", "devices", "summary"];
  const activeStepIndex = setupSteps.indexOf(step);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[var(--background)] px-4 py-8 text-[var(--rubric-black)]">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-4 lg:flex-row lg:items-stretch">
        <aside className="flex rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-5 lg:w-[360px] h-fit lg:shrink-0">
          <div className="flex w-full flex-col justify-between gap-8">
            <div>
              <Image src="/logo.svg" alt="Rubric" width={32} height={32} className="rounded-lg" />
              <div>
               
                <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em]">{test.name}</h1>
              </div>
            </div>

            <div className="flex w-full items-start">
              <div className="flex w-full items-start">
                {setupSteps.map((item, index) => {
                  const isActive = step === item;
                  const isDone = index < activeStepIndex;
                  return (
                    <div key={item} className="flex flex-1 items-start last:flex-none">
                      <div className="flex min-w-14 flex-col items-center text-center">
                        <span
                          className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold ${
                            isActive || isDone
                              ? "border-[var(--rubric-black)] bg-[var(--rubric-black)] text-white"
                              : "border-[var(--border)] bg-[var(--surface-muted)] text-[var(--rubric-slate)]"
                          }`}
                        >
                          {isDone ? <PiCheck className="h-5 w-5" /> : index + 1}
                        </span>
                        <span
                          className={`mt-2 text-xs font-semibold capitalize ${
                            isActive ? "text-[var(--rubric-black)]" : "text-[var(--rubric-muted)]"
                          }`}
                        >
                          {item}
                        </span>
                      </div>
                      {index < setupSteps.length - 1 && (
                        <div
                          className={`mt-4 h-px flex-1 ${
                            index < activeStepIndex ? "bg-[var(--rubric-black)]" : "bg-[#E5E0D6]"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <section className="rounded-[28px] border border-[var(--border)] bg-[var(--surface-strong)] p-5 shadow-sm md:p-6">
          {step === "rules" && (
            <div>
             
              <h2 className="mt-4 text-3xl font-semibold">Agree to the test rules</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--rubric-slate)]">
                Review the rules before device checks. You will see the full summary again before
                starting the test.
              </p>
              <div className="mt-6 space-y-3">
                {test.rules.map((rule) => (
                  <div
                    key={rule}
                    className="flex gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-3 text-sm text-[var(--rubric-slate)]"
                  >
                    <PiCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--rubric-success)]" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
              <label className="mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border border-[var(--border)] bg-[#FAF8F3] p-3 text-sm font-semibold">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(event) => setAgreed(event.target.checked)}
                  className="h-5 w-5 accent-[var(--rubric-black)]"
                />
                I have read and agree to the rules of this assessment.
              </label>
              <div className="mt-6 flex justify-end">
                <button
                  disabled={!agreed}
                  onClick={() => setStep("devices")}
                  className="rubric-button-primary disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Continue <PiArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === "devices" && (
            <div>
              <h2 className="text-3xl font-semibold">Grant device access</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--rubric-slate)]">
                Camera and microphone previews replace the no-access state once permission is
                granted.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <DeviceCard
                  title="Camera"
                  ready={cameraReady}
                  icon={<PiCamera className="h-6 w-6" />}
                >
                  {cameraReady ? (
                    <video
                      ref={videoRef}
                      autoPlay
                      muted
                      playsInline
                      className="h-full w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <NoAccess label="Camera preview unavailable" />
                  )}
                </DeviceCard>
                <DeviceCard
                  title="Microphone"
                  ready={micReady}
                  icon={<PiMicrophone className="h-6 w-6" />}
                >
                  {micReady && mediaStream ? (
                    <AudioPreview stream={mediaStream} />
                  ) : (
                    <NoAccess label="Microphone access unavailable" />
                  )}
                </DeviceCard>
              </div>
              {mediaError && (
                <p className="mt-4 flex items-center gap-2 rounded-xl border border-[rgba(180,35,24,0.2)] bg-[rgba(180,35,24,0.08)] px-3 py-2 text-sm text-[var(--rubric-danger)]">
                  <PiWarningCircle className="h-5 w-5" />
                  {mediaError}
                </p>
              )}
              <div className="mt-6 flex justify-between gap-3">
                <button onClick={() => setStep("rules")} className="rubric-button-secondary">
                  Back
                </button>
                {cameraReady && micReady ? (
                  <button onClick={() => setStep("summary")} className="rubric-button-primary">
                    Review summary <PiArrowRight className="h-5 w-5" />
                  </button>
                ) : (
                  <button onClick={requestDeviceAccess} className="rubric-button-primary">
                    Grant access
                  </button>
                )}
              </div>
            </div>
          )}

          {step === "summary" && (
            <div>
              <h2 className="text-3xl font-semibold">Ready to begin</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--rubric-slate)]">
                Confirm the test details and your attempt identity before starting.
              </p>
              <div className="mt-6 grid gap-3 md:grid-cols-2">
                <SummaryItem label="Test name" value={test.name} />
                <SummaryItem label="Subject" value={test.subject} />
                <SummaryItem label="Allotted minutes" value={`${test.duration || 0}`} />
                <SummaryItem label="Questions" value={`${test.numberOfQuestions}`} />
                <SummaryItem label="Owner" value={test.ownerName} />
                <SummaryItem label="Attempting as" value={attempt?.studentName ?? "Student"} />
                <SummaryItem label="Email" value={attempt?.email ?? ""} wide />
                <SummaryItem label="Description" value={test.description ?? "No description"} wide />
              </div>
              <div className="mt-6 rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
                <p className="text-sm font-semibold">Rules</p>
                <ul className="mt-3 space-y-2 text-sm text-[var(--rubric-slate)]">
                  {test.rules.map((rule) => (
                    <li key={rule}>- {rule}</li>
                  ))}
                </ul>
              </div>
              <div className="mt-6 flex justify-between gap-3">
                <button onClick={() => setStep("devices")} className="rubric-button-secondary">
                  Back
                </button>
                <button
                  onClick={finishSetup}
                  disabled={submitting}
                  className="rubric-button-primary disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Preparing..." : "Start test"}
                </button>
              </div>
            </div>
          )}
        </section>
      </section>
    </main>
  );
}

function DeviceCard({
  title,
  ready,
  icon,
  children,
}: {
  title: string;
  ready: boolean;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-muted)] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          {icon}
          {title}
        </div>
        {/* <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold ${
            ready
              ? "border-[rgba(47,107,79,0.25)] bg-[rgba(47,107,79,0.1)] text-[var(--rubric-success)]"
              : "border-[rgba(180,35,24,0.2)] bg-[rgba(180,35,24,0.08)] text-[var(--rubric-danger)]"
          }`}
        >
          {ready ? "Preview" : "No access"}
        </span> */}
      </div>
      <div className="h-56 overflow-hidden rounded-2xl border border-[var(--border)] bg-[#1f2328]">
        {children}
      </div>
    </div>
  );
}

function NoAccess({ label }: { label: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white/75">
      <PiWarningCircle className="h-8 w-8" />
      <p className="text-sm font-semibold">{label}</p>
    </div>
  );
}

function AudioPreview({ stream }: { stream: MediaStream }) {
  const [levels, setLevels] = useState(() =>
    Array.from({ length: 22 }, (_, index) => 28 + Math.sin(index) * 10)
  );
  const [inputLevel, setInputLevel] = useState(0);

  useEffect(() => {
    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.82;
    source.connect(analyser);

    const data = new Uint8Array(analyser.frequencyBinCount);
    let frame = 0;
    let animationFrame = 0;

    const update = () => {
      analyser.getByteFrequencyData(data);

      const barCount = 22;
      let total = 0;
      const nextLevels = Array.from({ length: barCount }, (_, index) => {
        const bucketStart = Math.floor((index / barCount) * data.length);
        const bucketEnd = Math.floor(((index + 1) / barCount) * data.length);
        const values = data.slice(bucketStart, Math.max(bucketStart + 1, bucketEnd));
        const bucket =
          values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);

        const idlePulse = 0.18 + Math.sin(frame / 12 + index * 0.65) * 0.055;
        const normalized = Math.max(bucket / 255, idlePulse);
        total += bucket;

        return Math.max(32, Math.round(normalized * 132));
      });

      if (frame % 3 === 0) {
        setLevels(nextLevels);
        const level = Math.min(100, Math.round((total / barCount / 255) * 140));
        setInputLevel(level);
      }

      frame += 1;
      animationFrame = requestAnimationFrame(update);
    };

    void context.resume();
    update();

    return () => {
      cancelAnimationFrame(animationFrame);
      source.disconnect();
      analyser.disconnect();
      void context.close();
    };
  }, [stream]);

  return (
    <div className="flex h-full flex-col justify-center p-5">
      <div
        className="flex h-36 w-full items-end justify-center gap-2"
        aria-label="Live microphone frequency spectrum"
      >
        {levels.map((height, index) => (
          <span
            key={index}
            className="w-3.5 rounded-full bg-white shadow-[0_0_18px_rgba(255,255,255,0.25)]"
            style={{ height }}
          />
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-sm text-white/75">
        <span>Frequency intake</span>
        <span>{inputLevel}%</span>
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  wide = false,
}: {
  label: string;
  value: string;
  wide?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[#FAF8F3] p-4 ${
        wide ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-xs font-bold uppercase text-[var(--rubric-muted)]">{label}</p>
      <p className="mt-2 text-sm font-semibold text-[var(--rubric-black)]">{value}</p>
    </div>
  );
}
