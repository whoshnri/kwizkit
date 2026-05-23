import type { LucideIcon } from "lucide-react";
import { ChevronRight } from "lucide-react";

export type FeatureShowcaseItem = {
  icon: LucideIcon;
  title: string;
  description: string;
  note?: string;
};

type FeatureShowcaseProps = {
  id?: string;
  eyebrow: string;
  title: string;
  intro?: string;
  label?: string;
  sideCopy?: string;
  reverse?: boolean;
  items: FeatureShowcaseItem[];
};

export function FeatureShowcase({
  id,
  eyebrow,
  title,
  intro,
  label = "Our program",
  sideCopy = "Build assessments from source material, route them through secure workflows, and keep every step visible to your team.",
  reverse = false,
  items,
}: FeatureShowcaseProps) {
  const mobileAccents = [
    ["from-[#b7ef6a] via-[#7ed957] to-[#2f6b4f]", "bg-[#91d26d]", "bg-[#d7f7a3]"],
    ["from-[#78d9ff] via-[#5fc0f4] to-[#2d84d5]", "bg-[#e7eff9]", "bg-[#7fc8ff]"],
    ["from-[#e7b8f6] via-[#b08df2] to-[#6d4cdf]", "bg-[#ead6ff]", "bg-[#9c7cff]"],
    ["from-[#ffe97a] via-[#f8d84c] to-[#c99a2d]", "bg-[#f9edb5]", "bg-[#f0cf58]"],
    ["from-[#c8d6ff] via-[#9ab3ff] to-[#5a73e6]", "bg-[#d9e1ff]", "bg-[#8398ff]"],
    ["from-[#c8f2d7] via-[#88d7a2] to-[#2b8c65]", "bg-[#dbf4e4]", "bg-[#8fd8b3]"],
  ] as const;

  return (
    <section id={id} className="rubric-shell py-12 md:py-24">
      <div className="mx-auto max-w-5xl text-left md:text-center">
        <div className="rubric-kicker mb-4">{eyebrow}</div>
        <h2 className="text-[clamp(2.2rem,7vw,5.75rem)] leading-[0.95] tracking-[-0.05em] text-[var(--rubric-black)] md:leading-[0.93] md:tracking-[-0.06em]">
          {title}
        </h2>
        {intro && (
          <p className="mt-4 max-w-3xl text-base leading-7 text-[var(--rubric-slate)] md:mx-auto md:mt-6">
            {intro}
          </p>
        )}
      </div>

      <div
        className={`mt-8 lg:mt-14 lg:grid lg:items-start lg:gap-6 ${
          reverse
            ? "lg:grid-cols-[1.3fr_0.7fr]"
            : "lg:grid-cols-[0.7fr_1.3fr]"
        }`}
      >
        <div
          className={`hidden space-y-4 lg:block lg:pt-4 ${
            reverse ? "lg:order-2" : ""
          }`}
        >
          <p className="text-base font-medium uppercase tracking-[0.18em] text-[var(--rubric-black)]">
            {label}
          </p>
          <p className="max-w-sm text-base leading-7 text-[var(--rubric-slate)]">
            {sideCopy}
          </p>
        </div>

        <div
          className={`grid gap-3 sm:grid-cols-2 sm:gap-x-10 sm:gap-y-8 lg:grid lg:grid-cols-2 lg:gap-6 ${
            reverse ? "lg:order-1" : ""
          }`}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            const [gradientClass, accentClass, glowClass] = mobileAccents[index % mobileAccents.length];

            return (
              <article key={item.title} className="rounded-[28px] max-sm:rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 lg:p-6">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-medium tracking-[-0.02em] text-[var(--rubric-black)] lg:text-lg">
                    {item.title}
                  </h3>
                </div>

                <p className="mt-2 text-base leading-7 text-[var(--rubric-muted)]">
                  {item.description}
                </p>

                <div className="relative mt-4 h-36 lg:h-44 overflow-hidden rounded-md bg-[var(--surface-muted)]">
                  <div className={`absolute left-4 top-4 h-14 w-14 rounded-full bg-gradient-to-br ${gradientClass} opacity-95 lg:h-20 lg:w-20`} />
                  <div className={`absolute bottom-4 left-4 right-4 h-10 rounded-[20px] ${accentClass} opacity-45 lg:h-14`} />
                  <div className={`absolute bottom-6 right-6 h-14 w-14 rounded-[28px] ${glowClass} opacity-90 lg:h-20 lg:w-20`} />
                  
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
