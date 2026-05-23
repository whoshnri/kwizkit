"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ArrowRight, Loader2, Lock, Mail, User } from "lucide-react";
import { RubricButton } from "@/components/site/RubricButton";
import Image from "next/image";
import { GrGoogle } from "react-icons/gr";
import { IoPersonOutline } from "react-icons/io5";
import type { ReactNode } from "react";
import { useAuthForm } from "./useAuthForm";


export default function AuthPage() {
  const cardRef = useRef<HTMLDivElement>(null);
  const {
    mode,
    message,
    pending,
    pendingProvider,
    busy,
    switchMode,
    handleOAuth,
    handleSubmit,
  } = useAuthForm();

  useGSAP(() => {
    gsap.from(cardRef.current, {
      opacity: 0, y: 20, duration: 0.55, ease: "power2.out",
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--surface-base)] px-4 py-12">
      <div
        ref={cardRef}
        className="rubric-card w-full max-w-[420px] rounded-2xl p-6 sm:rounded-[28px] sm:p-8"
      >
        <div className="mb-6 text-center">
          <Image src="/logo.svg" alt="Rubric" width={32} height={32} className="mx-auto mb-3" />
          <h1 className="text-2xl font-medium tracking-tight text-[var(--rubric-black)]">
            {mode === "sign-in" ? "Welcome back." : "Create your account."}
          </h1>
          <p className="mt-1 text-sm text-[var(--rubric-slate)]">
            {mode === "sign-in"
              ? "Sign in to continue to Rubric."
              : "Get started, it's free."}
          </p>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-full border border-[var(--border)] bg-[var(--surface-muted)] p-1">
          {(["sign-in", "sign-up"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={`rounded-full px-4 py-2.5 text-sm font-medium transition-colors ${
                mode === m
                  ? "bg-[var(--rubric-black)] text-white"
                  : "text-[var(--rubric-slate)] hover:text-[var(--rubric-black)]"
              }`}
            >
              {m === "sign-in" ? "Sign in" : "Sign up"}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3">
          <RubricButton
            type="button"
            variant="secondary"
            className="w-full justify-center"
            onClick={() => handleOAuth("google")}
            disabled={busy}
          >
            {pendingProvider === "google"
              ? <Loader2 className="size-4 animate-spin" />
              : <GrGoogle className="size-4" />}
            Continue with Google
          </RubricButton>
          {/* <RubricButton
            type="button" variant="secondary"
            className="w-full justify-center"
            onClick={() => handleOAuth("microsoft")}
            disabled={busy}
          >
            {pendingProvider === "microsoft"
              ? <Loader2 className="size-4 animate-spin" />
              : <FaMicrosoft className="size-4" />}
            Microsoft
          </RubricButton> */}
        </div>

        <div className="my-5 flex items-center gap-3 text-xs text-[var(--rubric-muted)]">
          <span className="h-px flex-1 bg-[var(--border)]" />
          or
          <span className="h-px flex-1 bg-[var(--border)]" />
        </div>

        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(new FormData(e.currentTarget));
          }}
        >
          {mode === "sign-up" && (
            <>
              <Field label="Name">
                <InputIcon icon={<IoPersonOutline className="size-4" />} />
                <input name="name" type="text" placeholder="Ada Lovelace"
                  autoComplete="rubric-name" className="theme-input pl-11" />
              </Field>
              <Field label="Username">
                <InputIcon icon={<User className="size-4" />} />
                <input name="username" type="text" placeholder="adalove"
                  autoComplete="rubric-username" className="theme-input pl-11" />
              </Field>
            </>
          )}

          <Field label={mode === "sign-in" ? "Email or username" : "Email"}>
            <InputIcon icon={<Mail className="size-4" />} />
            <input
              name={mode === "sign-in" ? "identifier" : "email"}
              type={mode === "sign-in" ? "text" : "email"}
              placeholder="you@example.com"
              autoComplete={mode === "sign-in" ? "rubric-username" : "rubric-email"}
              className="theme-input pl-11"
            />
          </Field>

          <Field label="Password">
            <InputIcon icon={<Lock className="size-4" />} />
            <input name="password" type="password" placeholder="••••••••"
              autoComplete={mode === "sign-in" ? "rubric-current-password" : "rubric-new-password"}
              className="theme-input pl-11" />
            
          </Field>
          {mode === "sign-in" && (
              <div className="mt-1 text-right">
                <a href="/forgot-password"
                  className="text-xs text-[var(--rubric-muted)] hover:text-[var(--rubric-black)]">
                  Forgot password?
                </a>
              </div>
            )}

          {message && (
            <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm text-[var(--rubric-slate)]">
              {message}
            </p>
          )}

          <RubricButton type="submit" className="mt-1 w-full justify-center" disabled={busy}>
            {pending
              ? <Loader2 className="size-4 animate-spin" />
              : mode === "sign-in" ? "Sign in" : "Create account"}
            {!pending && <ArrowRight className="size-4" />}
          </RubricButton>
        </form>

        <p className="mt-5 text-center text-xs leading-5 text-[var(--rubric-muted)]">
          By continuing you agree to our{" "}
          <a href="/terms" className="text-[var(--rubric-black)] underline underline-offset-4">Terms</a>
          {" "}and{" "}
          <a href="/privacy-policy" className="text-[var(--rubric-black)] underline underline-offset-4">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-[var(--rubric-black)]">{label}</span>
      <div className="relative items-center flex">{children}</div>
    </label>
  );
}

function InputIcon({ icon }: { icon: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[var(--rubric-muted)]">
      {icon}
    </span>
  );
}