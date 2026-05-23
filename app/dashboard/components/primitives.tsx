"use client";

import React from "react";
import { PiX } from "react-icons/pi";

export function DashboardPanel({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <section
      {...props}
      className={`rounded-lg border border-[var(--border)] bg-[var(--surface-strong)] ${className}`}
    >
      {children}
    </section>
  );
}

export function DashboardButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}) {
  const variants = {
    primary: "bg-[var(--rubric-black)] text-white hover:opacity-90",
    secondary:
      "border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--rubric-black)] hover:bg-[var(--surface-muted)]",
    ghost: "text-[var(--rubric-slate)] hover:bg-[var(--surface-muted)]",
    danger: "bg-[var(--rubric-danger)] text-white hover:opacity-90",
  };

  return (
    <button
      {...props}
      className={`inline-flex cursor-pointer h-11 items-center justify-center gap-2 rounded-full px-5  font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({
  className = "",
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={`inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--rubric-black)] transition hover:bg-[var(--surface-muted)] ${className}`}
    >
      {children}
    </button>
  );
}

export function DashboardField({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-xs font-bold text-[var(--rubric-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

export const fieldClass =
  "h-12 w-full rounded-lg border border-[var(--border)] bg-[#FAF8F3] px-4 text-sm text-[var(--rubric-black)] outline-none transition disabled:cursor-not-allowed disabled:opacity-50 placeholder:text-[var(--rubric-muted)] focus:border-[var(--rubric-black)]";

export const textareaClass =
  "w-full rounded-lg border border-[var(--border)] bg-[#FAF8F3] px-4 py-3 text-sm text-[var(--rubric-black)] outline-none transition placeholder:text-[var(--rubric-muted)] focus:border-[var(--rubric-black)]";

export function StatusBadge({
  tone,
  children,
}: {
  tone: "success" | "warning" | "danger" | "neutral";
  children: React.ReactNode;
}) {
  const tones = {
    success: "bg-[#E7F5EC] text-[#1F7A4D]",
    warning: "bg-[#FFF2D7] text-[#B7791F]",
    danger: "bg-[#FCE4E4] text-[#C92A2A]",
    neutral: "bg-[var(--surface-muted)] text-[var(--rubric-slate)]",
  };

  return (
    <span
      className={`inline-flex h-8 items-center rounded-full px-3 text-xs font-bold uppercase ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function DashboardSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={`flex h-[26px] w-[46px] items-center rounded-full p-[3px] transition ${
        checked ? "justify-end bg-[var(--rubric-black)]" : "justify-start bg-[#D8D3C8]"
      }`}
    >
      <span className="h-5 w-5 rounded-full bg-white" />
    </button>
  );
}

export function ResponsiveSheet({
  title,
  children,
  footer,
  onClose,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onClose: () => void;
  className?: string;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 md:items-center md:p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className={`flex max-h-[92dvh] w-full flex-col rounded-t-[24px] border-t border-[var(--border)] bg-white px-[18px] pb-[18px] pt-3 md:max-w-xl md:rounded-2xl md:border md:p-6 ${className}`}
      >
        <div className="mb-5 flex w-full justify-center md:hidden">
          <div className="h-[5px] w-11 rounded-full bg-[#D8D3C8]" />
        </div>
        <header className="mb-5 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--rubric-muted)] transition hover:text-[var(--rubric-black)]"
            aria-label="Close"
          >
            <PiX className="h-6 w-6" />
          </button>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto pr-1">{children}</div>
        {footer && <footer className="mt-auto pt-5">{footer}</footer>}
      </div>
    </div>
  );
}

export function ConfirmationDialog({
  title,
  description,
  children,
  footer,
  onClose,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center text-left justify-center bg-black/40 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-sm rounded-2xl border border-[var(--border)] bg-white p-6">
        <h2 className="text-xl font-semibold text-[var(--rubric-black)]">{title}</h2>
        {description && (
          <p className="mt-3 text-sm leading-6 text-[var(--rubric-slate)]">
            {description}
          </p>
        )}
        {children && <div className="mt-5">{children}</div>}
        <div className="mt-6 flex gap-3">{footer}</div>
      </div>
    </div>
  );
}
