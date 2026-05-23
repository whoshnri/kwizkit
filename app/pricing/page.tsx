"use client";

import { useMemo, useState } from "react";
import { ArrowRight, Mail, MessageCircle, PhoneCall } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { HelpContactSection, RubricButton } from "@/components/site";

type Track = "solo" | "institution";
type Currency = "NGN" | "USD";

type PricingPlan = {
  id: string;
  name: string;
  description?: string;
  price: Record<Currency, string>;
  subtitle: string;
  features: string[];
  recommended?: boolean;
};

const soloPlans: PricingPlan[] = [
  {
    id: "solo_paygo",
    name: "Pay As You Go",
    price: { NGN: "₦0", USD: "$0" },
    subtitle: "setup fee",
    features: [
      "₦500 per test created",
      "₦200 per student added",
      "₦1,500 per certificate",
      "₦1,000 per 100k AI tokens",
      "₦300 per 50MB+ upload"
    ]
  },
  {
    id: "solo_starter",
    name: "Starter",
    price: { NGN: "₦5,000", USD: "$5" },
    subtitle: "/month",
    features: [
      "Up to 50 students",
      "10 tests per month",
      "5GB Material storage",
      "Basic AI generation",
      "Email support"
    ]
  },
  {
    id: "solo_growth",
    name: "Growth",
    price: { NGN: "₦12,000", USD: "$12" },
    subtitle: "/month",
    recommended: true,
    features: [
      "Up to 200 students",
      "Unlimited tests",
      "20GB Material storage",
      "Full AI Suite (Advanced)",
      "Priority support"
    ]
  },
];

const institutionPlans: PricingPlan[] = [
  {
    id: "inst_starter",
    name: "Starter",
    price: { NGN: "₦50,000", USD: "$50" },
    subtitle: "/month",
    features: ["200 students", "5 staff", "500k AI tokens", "20GB", "Email support"]
  },
  {
    id: "inst_school",
    name: "School",
    price: { NGN: "₦120,000", USD: "$120" },
    subtitle: "/month",
    recommended: true,
    features: ["1,000 students", "20 staff", "2M AI tokens", "100GB", "WhatsApp support"]
  },
  {
    id: "inst_campus",
    name: "Campus",
    price: { NGN: "₦250,000", USD: "$250" },
    subtitle: "/month",
    features: ["5,000 students", "Unlimited staff", "5M AI tokens", "500GB", "Account manager"]
  },
  {
    id: "inst_enterprise",
    name: "Enterprise",
    price: { NGN: "Custom", USD: "Custom" },
    subtitle: "",
    features: ["Unlimited students", "Unlimited staff", "Unlimited AI", "SLA + onsite support"]
  },
];

export default function PricingPage() {
  const [track, setTrack] = useState<Track>("solo");
  const [currency, setCurrency] = useState<Currency>("NGN");

  const activePlans = track === "solo" ? soloPlans : institutionPlans;

  return (
    <div className="rubric-page py-16 md:py-24">
      <div className="rubric-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rubric-kicker mb-4">Pricing</div>
          <h1 className="rubric-title text-[clamp(2.75rem,7vw,5.5rem)]">Plans & Pricing</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--rubric-slate)]">Assessment infrastructure that scales with your institution.</p>
        </div>

        <div className="mt-12 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <div className="flex rounded-full border border-[var(--border)] bg-[#FAF8F3] p-1">
            {(["solo", "institution"] as Track[]).map((t) => (
              <button
                key={t}
                onClick={() => setTrack(t)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  track === t ? "bg-[var(--rubric-black)] text-white" : "text-[var(--rubric-muted)]"
                }`}
              >
                {t === "solo" ? "Solo Educator" : "Institution"}
              </button>
            ))}
          </div>

          <div className="flex rounded-full border border-[var(--border)] bg-[#FAF8F3] p-1">
            {(["NGN", "USD"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`rounded-full px-6 py-2 text-sm font-semibold transition-all ${
                  currency === c ? "bg-[var(--rubric-black)] text-white" : "text-[var(--rubric-muted)]"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className={`mt-12 grid gap-6 ${track === "solo" ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {activePlans.map((plan) => (
            <article
              key={plan.id}
              className={`rubric-card flex flex-col p-8 transition-all ${
                plan.recommended ? "border-2 border-[var(--rubric-black)] shadow-lg" : ""
              }`}
            >
              {plan.recommended && (
                <div className="mb-4 w-fit rounded-full bg-[var(--rubric-black)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Recommended
                </div>
              )}
              <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--rubric-muted)]">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-[var(--rubric-black)]">
                  {plan.price[currency]}
                </span>
                <span className="text-sm text-[var(--rubric-muted)]">{plan.subtitle}</span>
              </div>

              <ul className="mt-8 flex-1 space-y-4">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-sm">
                    <div className="mt-1 flex size-4 items-center justify-center rounded-full bg-green-100">
                      <ArrowRight className="size-2.5 text-green-600" />
                    </div>
                    <span className="text-[var(--rubric-black)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <RubricButton
                href={plan.name === "Enterprise" ? "/support" : "/auth"}
                variant={plan.recommended ? "primary" : "secondary"}
                className="mt-10 w-full"
              >
                {plan.name === "Enterprise" ? "Contact sales" : "Get started"}
              </RubricButton>
            </article>
          ))}
        </div>

        {track === "solo" && (
          <div className="mt-20">
            <h3 className="text-2xl font-semibold text-[var(--rubric-black)]">Detailed Comparison</h3>
            <div className="mt-8 overflow-x-auto rounded-3xl border border-[var(--border)] bg-white">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#FAF8F3]">
                    <th className="px-8 py-5 text-sm font-bold uppercase tracking-wider text-[var(--rubric-black)]">Feature</th>
                    <th className="px-8 py-5 text-center text-sm font-bold uppercase tracking-wider text-[var(--rubric-black)]">Pay As You Go</th>
                    <th className="px-8 py-5 text-center text-sm font-bold uppercase tracking-wider text-[var(--rubric-black)]">Starter</th>
                    <th className="px-8 py-5 text-center text-sm font-bold uppercase tracking-wider text-[var(--rubric-black)]">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {[
                    ["Student Limit", "Unlimited (Pay-per)", "50", "200"],
                    ["Monthly Tests", "Unlimited (Pay-per)", "10", "Unlimited"],
                    ["AI Tokens", "Purchase-as-needed", "50k /mo", "500k /mo"],
                    ["Storage", "₦300/upload (>50MB)", "5GB", "20GB"],
                    ["Analytics", "Basic", "Basic", "Advanced"],
                    ["Support", "Email", "Email", "Priority"],
                  ].map(([label, paygo, starter, growth]) => (
                    <tr key={label}>
                      <td className="px-8 py-5 text-sm font-medium text-[var(--rubric-black)]">{label}</td>
                      <td className="px-8 py-5 text-center text-sm text-[var(--rubric-slate)]">{paygo}</td>
                      <td className="px-8 py-5 text-center text-sm text-[var(--rubric-slate)]">{starter}</td>
                      <td className="px-8 py-5 text-center text-sm text-[var(--rubric-slate)]">{growth}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <HelpContactSection
          eyebrow="Need help deciding?"
          title="Talk through the right plan before you upgrade."
          intro="If you’re comparing rollout options, we’ll help you pick the right setup for your team, budget, and delivery model."
          badge="Support"
          rows={[
            {
              icon: Mail,
              label: "Write us an email",
              value: "support@rubric.app",
              href: "mailto:support@rubric.app",
              helper: "Best for billing, setup, and plan questions.",
            },
            {
              icon: MessageCircle,
              label: "Request a walkthrough",
              value: "Book a demo",
              href: "/support",
              helper: "See how Rubric fits your workflow before you buy.",
            },
            {
              icon: PhoneCall,
              label: "Talk to sales",
              value: "Enterprise pricing",
              href: "/support",
              helper: "For campus-wide rollouts and custom controls.",
            },
          ]}
        />

        <div className="mt-16 rounded-[28px] bg-[var(--rubric-black)] px-6 py-10 text-white md:px-10">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="rubric-kicker mb-3 text-white/60">Enterprise</p>
              <h2 className="text-2xl font-medium tracking-[-0.02em] md:text-3xl">Need more? Talk to us.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/70">We can support multi-campus rollouts, custom integrations, and dedicated service agreements.</p>
            </div>
            <RubricButton href="/support" variant="inverse">
              Contact sales
            </RubricButton>
          </div>
        </div>
      </div>
    </div>
  );
}