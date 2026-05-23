"use client";

import { useEffect, useState } from "react";
import { addToWaitList } from "../actions/waitinglist";
import { toast } from "sonner";
import { readStorageItem, writeStorageItem } from "@/lib/browserStorage";
import { Sparkles, Users, BarChart3, Database, Send, Loader, CheckCircle2 } from "lucide-react";

const features = [
  { icon: Sparkles, title: "AI Test Generation", description: "Create tailored assessments from your material in seconds." },
  { icon: Users, title: "Student Distribution", description: "Distribute assessments through secure portals and time controls." },
  { icon: BarChart3, title: "Analytics & Grading", description: "Track outcomes and automate grading workflows." },
  { icon: Database, title: "Secure Storage", description: "Keep tests, results, and exports in one place." },
];

export default function PrelaunchPage() {
  const [isLoading, setLoading] = useState(false);
  const [isOnWaitlist, setIsOnWaitList] = useState(false);

  useEffect(() => {
    setIsOnWaitList(readStorageItem("isOnWaitlist") === "true");
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const email = new FormData(e.currentTarget).get("email");
    if (typeof email !== "string" || !/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    const response = await addToWaitList({ email });
    if (response.success) {
      writeStorageItem("isOnWaitlist", "true");
      setIsOnWaitList(true);
    } else {
      toast.error("Failed to add to waitlist. Please try again later.");
    }

    setLoading(false);
  }

  return (
    <div className="rubric-page py-16 md:py-24">
      <div className="rubric-shell">
        <section className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            <div className="rubric-kicker">Coming soon</div>
            <h1 className="rubric-title max-w-3xl text-[clamp(3rem,7vw,6rem)] leading-[0.92]">Rubric is launching soon.</h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--rubric-slate)]">Revolutionary AI-powered test creation, intelligent grading, and comprehensive analytics for modern education teams.</p>
            <div className="flex items-center gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[var(--rubric-black)]">
                <span className="text-2xl font-medium">70%</span>
              </div>
              <div>
                <p className="font-medium">Build progress</p>
                <p className="text-sm text-[var(--rubric-muted)]">Development in progress</p>
              </div>
            </div>
          </div>

          <div className="rubric-card p-6 md:p-8">
            {isOnWaitlist ? (
              <div className="text-center">
                <CheckCircle2 className="mx-auto size-12 text-[var(--rubric-black)]" />
                <h2 className="mt-4 text-2xl font-medium">You&apos;re on the waitlist</h2>
                <p className="mt-3 text-sm leading-7 text-[var(--rubric-slate)]">Thanks for joining. We&apos;ll keep you updated with launch details and early access.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <div className="rubric-kicker mb-3">Join the waitlist</div>
                  <h2 className="text-2xl font-medium">Stay in the loop.</h2>
                  <p className="mt-2 text-sm leading-7 text-[var(--rubric-slate)]">Get early access updates, launch notes, and product news.</p>
                </div>
                <input name="email" type="email" placeholder="Enter your email" className="theme-input" required />
                <button type="submit" disabled={isLoading} className="rubric-button-primary w-full">
                  {isLoading ? <Loader className="size-4 animate-spin" /> : <Send className="size-4" />}
                  {isLoading ? "Joining..." : "Join waitlist"}
                </button>
              </form>
            )}
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <article key={feature.title} className="rubric-card p-6">
                <Icon className="size-5 text-[var(--rubric-black)]" />
                <h3 className="mt-4 text-lg font-medium">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[var(--rubric-slate)]">{feature.description}</p>
              </article>
            );
          })}
        </section>
      </div>
    </div>
  );
}
