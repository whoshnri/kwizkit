import Image from "next/image";
import Link from "next/link";
import { RubricButton } from "./RubricButton";
import { ArrowUpRightIcon } from "@heroicons/react/24/solid";

type FooterLink = {
  label: string;
  href: string;
};

type FooterColumn = {
  title: string;
  links: FooterLink[];
};

type SiteFooterProps = {
  columns: FooterColumn[];
  ctaTitle: string;
  ctaDescription: string;
  ctaHref: string;
  ctaLabel?: string;
  legalText?: string;
};

export function SiteFooter({
  columns,
  ctaTitle,
  ctaDescription,
  ctaHref,
  ctaLabel = "Get started",
  legalText = "© 2026 Rubric. All rights reserved.",
}: SiteFooterProps) {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--rubric-black)] text-white">
      <div className="rubric-shell py-10 md:py-16">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-5 md:rounded-[32px] md:p-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <Image src="/logo.svg" alt="Rubric" width={28} height={28} style={{ height: "auto" }} />
                <Image src="/word-logo-white.svg" alt="Rubric" width={102} height={24} style={{ height: "auto" }} />
              </div>
              <h2 className="mt-6 text-[clamp(1.8rem,6vw,4rem)] leading-[0.96] tracking-[-0.05em] md:mt-8">
                {ctaTitle}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/68 md:mt-4 md:text-base">
                {ctaDescription}
              </p>
            </div>
            <RubricButton href={ctaHref} variant="inverse" className="w-full justify-center lg:w-auto">
              {ctaLabel}
              <ArrowUpRightIcon className="size-4" /> 
            </RubricButton>
          </div>

          <div className="mt-10 grid gap-6 border-t border-white/10 pt-6 sm:grid-cols-2 md:mt-12 md:gap-8 md:pt-8 xl:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <p className="text-sm font-medium text-white/90">{column.title}</p>
                <div className="mt-3 grid gap-3 text-sm text-white/66 md:mt-4">
                  {column.links.map((link) => (
                    <Link key={`${link.label}-${link.href}`} href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-5 text-sm text-white/50 md:mt-10 md:flex-row md:items-center md:justify-between md:gap-4 md:pt-6">
            <p>{legalText}</p>
            <p>Built for educators managing the full academic workflow.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
