import type { LucideIcon } from "lucide-react";
import Link from "next/link";

type HelpContactRow = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
  helper?: string;
};

type HelpContactSectionProps = {
  eyebrow: string;
  title: string;
  intro: string;
  rows: HelpContactRow[];
  badge?: string;
};

export function HelpContactSection({
  eyebrow,
  title,
  intro,
  rows,
  badge = "Help",
}: HelpContactSectionProps) {
  return (
    <section className="py-16 md:py-24">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-6 md:p-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="rubric-kicker mb-4">{eyebrow}</div>
            <h2 className="text-[clamp(2.5rem,7vw,5.25rem)] leading-[0.92] tracking-[-0.06em] mt-4 text-[var(--rubric-black)]">
              {title}
            </h2>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--rubric-slate)]">
              {intro}
            </p>
          </div>

          {/* <div className="flex justify-end lg:min-w-36">
            <div className="rounded-2xl bg-[var(--rubric-black)] px-4 py-3 text-right text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-sm">
              {badge}
            </div>
          </div> */}
        </div>

        <div className="mt-12 divide-y divide-[var(--border)] border-t border-[var(--border)]">
          {rows.map((row) => {
            const Icon = row.icon;
            const content = (
              <div className="grid gap-4 py-5 md:grid-cols-[1fr_auto] md:items-center">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--rubric-black)] text-white">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-base font-medium text-[var(--rubric-black)]">{row.label}</p>
                    {row.helper && (
                      <p className="mt-1 text-sm text-[var(--rubric-muted)]">{row.helper}</p>
                    )}
                  </div>
                </div>
                <div className="text-base font-medium text-[var(--rubric-black)] md:text-right">
                  {row.value}
                </div>
              </div>
            );

            if (row.href) {
              return (
                <Link key={row.label} href={row.href} className="block hover:opacity-90">
                  {content}
                </Link>
              );
            }

            return <div key={row.label}>{content}</div>;
          })}
        </div>
      </div>
    </section>
  );
}
