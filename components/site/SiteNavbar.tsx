"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronRight, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { RubricButton } from "./RubricButton";
import { useSession } from "@/app/SessionContext";

type NavLink = {
  label: string;
  href: string;
};

type SiteNavbarProps = {
  links: NavLink[];
  logoHref?: string;
  primaryAction: NavLink;
  secondaryAction?: NavLink;
};

export function SiteNavbar({
  links,
  logoHref = "/",
  primaryAction,
  secondaryAction,
}: SiteNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const prevOverflowRef = useRef<string>("");
  const desktopLinks = useMemo(() => links, [links]);
  const { session } = useSession();

  useEffect(() => {
    let t: ReturnType<typeof setTimeout> | undefined;

    if (mobileOpen) {
      prevOverflowRef.current = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      setMounted(true);
    } else if (mounted) {
      // keep mounted during exit animation
      t = setTimeout(() => {
        document.body.style.overflow = prevOverflowRef.current || "";
        setMounted(false);
      }, 320);
    }

    return () => {
      if (t) clearTimeout(t);
    };
  }, [mobileOpen, mounted]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--border)] bg-[var(--background)]/92 backdrop-blur-sm">
      <div className="rubric-shell flex h-16 items-center justify-between gap-3 py-3 md:h-18 md:py-4 lg:grid lg:grid-cols-[1fr_auto_1fr] lg:gap-4">
        <Link href={logoHref} className="flex items-center gap-3 lg:hidden" onClick={() => setMobileOpen(false)}>
          <Image src="/logo.svg" alt="Rubric" width={28} height={28} priority style={{ height: "auto" }} />
          <Image src="/word-logo.svg" alt="Rubric" width={102} height={24} priority className="hidden sm:block" style={{ height: "auto" }} />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {desktopLinks.map((item) => (
            <Link
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="text-sm text-[var(--rubric-slate)] transition-colors hover:text-[var(--rubric-black)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link href={logoHref} className="hidden items-center justify-center gap-3 lg:col-start-2 lg:flex lg:justify-self-center">
          <Image src="/logo.svg" alt="Rubric" width={28} height={28} priority style={{ height: "auto" }} />
        </Link>

        {session ? (
          <div className="hidden items-center justify-end gap-3 lg:flex">
            <RubricButton href="/dashboard" variant="primary" size="sm">
              Dashboard
              <ArrowUpRight className="size-4" />
            </RubricButton>
          </div>
        ) : (
          <div className="hidden items-center justify-end gap-3 lg:flex">
            {secondaryAction && (
              <RubricButton href={secondaryAction.href} variant="ghost" size="sm">
                {secondaryAction.label}
              </RubricButton>
            )}
            <RubricButton href={primaryAction.href} variant="primary" size="sm">
              {primaryAction.label}
              <ArrowUpRight className="size-4" />
            </RubricButton>
          </div>)
        }
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="rubric-button-secondary h-10 w-10 p-0 lg:hidden"
          aria-label="Open navigation"
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
        >
          <Menu className="size-5" />
        </button>
      </div>

      {mounted && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: mobileOpen ? 1 : 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            aria-hidden={!mobileOpen}
            className="absolute inset-0 bg-black/20"
            onClick={() => setMobileOpen(false)}
          />

          <motion.div
            id="mobile-navigation"
            initial={{ y: "-100%" }}
            animate={{ y: mobileOpen ? 0 : "-100%" }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="fixed left-0 right-0 top-0 flex h-[100dvh] flex-col bg-white px-4 pb-4 pt-[calc(0.75rem+env(safe-area-inset-top))] sm:px-6"
          >
            <div className="flex items-center justify-between gap-4">
              <Link href={logoHref} className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
                <Image src="/logo.svg" alt="Rubric" width={28} height={28} style={{ height: "auto" }} />
                <div className="leading-tight">
                  <p className="text-sm font-medium text-[var(--rubric-black)]">Rubric</p>
                  <p className="text-xs text-[var(--rubric-slate)]">Assessment infrastructure</p>
                </div>
              </Link>
              <button
                type="button"
                className="rubric-button-secondary h-10 w-10 justify-center p-0"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <RubricButton href={primaryAction.href} variant="primary" className="w-full justify-center" size="md">
                {primaryAction.label}
              </RubricButton>
              {secondaryAction && (
                <RubricButton href={secondaryAction.href} variant="secondary" className="w-full justify-center" size="md">
                  {secondaryAction.label}
                </RubricButton>
              )}
            </div>

            <nav className="mt-5 grid gap-2">
              {desktopLinks.map((item, index) => (
                <motion.div
                  key={`${item.label}-${item.href}`}
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: mobileOpen ? 0 : 10, opacity: mobileOpen ? 1 : 0 }}
                  transition={{ duration: 0.22, delay: mobileOpen ? index * 0.035 : 0 }}
                >
                <Link
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex h-16 items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-base font-medium text-[var(--rubric-black)]"
                >
                  <span>{item.label}</span>
                  <ChevronRight className="size-4 text-[var(--rubric-muted)]" />
                </Link>
                </motion.div>
              ))}
            </nav>

            <div className="mt-auto pb-[calc(0.5rem+env(safe-area-inset-bottom))] pt-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-[var(--rubric-muted)]">
                Quick access
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <Link
                  href="/support"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-medium text-[var(--rubric-black)]"
                >
                  Support
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)] px-4 py-3 text-sm font-medium text-[var(--rubric-black)]"
                >
                  Pricing
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </header>
  );
}
