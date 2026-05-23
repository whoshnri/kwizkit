"use client";

import Link from "next/link";
import type { MouseEventHandler, ReactNode } from "react";
import { cn } from "@/lib/utils";

type RubricButtonVariant = "primary" | "secondary" | "ghost" | "inverse";
type RubricButtonSize = "sm" | "md" | "lg";

type BaseProps = {
  children: ReactNode;
  variant?: RubricButtonVariant;
  size?: RubricButtonSize;
  className?: string;
};

type LinkButtonProps = BaseProps & {
  href: string;
  onClick?: never;
  type?: never;
  disabled?: never;
  target?: string;
  rel?: string;
};

type ActionButtonProps = BaseProps & {
  href?: never;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  target?: never;
  rel?: never;
};

export type RubricButtonProps = LinkButtonProps | ActionButtonProps;

const variantClasses: Record<RubricButtonVariant, string> = {
  primary: "bg-[var(--rubric-black)] hover:opacity-90",
  secondary:
    "border border-[var(--rubric-black)] bg-transparent hover:bg-[rgba(28,28,28,0.04)]",
  ghost: "bg-transparent hover:bg-[rgba(28,28,28,0.05)]",
  inverse: "bg-white hover:opacity-95",
};

const sizeClasses: Record<RubricButtonSize, string> = {
  sm: "h-10 px-4 text-sm",
  md: "h-12 px-5 text-sm",
  lg: "h-14 px-6 text-base",
};

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-150 active:scale-[0.98] disabled:cursor-not-allowed cursor-pointer disabled:opacity-50";

const variantStyles: Record<RubricButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--rubric-black)",
    color: "#ffffff",
  },
  secondary: {
    backgroundColor: "transparent",
    borderColor: "var(--rubric-black)",
    color: "var(--rubric-black)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--rubric-slate)",
  },
  inverse: {
    backgroundColor: "#ffffff",
    color: "var(--rubric-black)",
  },
};

export function RubricButton(props: RubricButtonProps) {
  const { children, className, variant = "primary", size = "md" } = props;
  const classes = cn(baseClasses, variantClasses[variant], sizeClasses[size], className);
  const style = variantStyles[variant];

  if ("href" in props && props.href) {
    const { href, target, rel } = props;
    return (
      <Link href={href} target={target} rel={rel} className={classes} style={style}>
        {children}
      </Link>
    );
  }

  const { onClick, type = "button", disabled } = props;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={classes} style={style}>
      {children}
    </button>
  );
}
