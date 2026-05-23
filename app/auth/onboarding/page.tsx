"use client";

import { useEffect, useMemo, useState, use } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import { toast } from "sonner";
import { PiArrowLeft, PiArrowRight, PiCheck, PiSpinnerGap } from "react-icons/pi";
import { createAccount } from "@/app/actions/checkAccount";
import { useSession } from "@/app/SessionContext";
import { Gender, Plan } from "@/lib/generated/prisma/client";

type OnboardingForm = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | undefined;
  city: string;
  gender: Gender;
  image: string;
  plan: Plan;
};

const totalSteps = 3;

export default function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ testId?: string; step?: string }>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = use(searchParams);
  const { session, loading, onboardingRequired, refreshSession } = useSession();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<OnboardingForm>({
    firstName: "",
    lastName: "",
    email: "",
    phone: undefined,
    city: "",
    gender: "male",
    image: "",
    plan: "solo_paygo",
  });

  const currentStep = useMemo(() => {
    const step = Number(params.step ?? 1);
    if (!Number.isFinite(step)) return 1;
    return Math.max(1, Math.min(totalSteps, step));
  }, [params.step]);

  const dashboardPath = params.testId
    ? `/dashboard/tests?testId=${encodeURIComponent(params.testId)}`
    : "/dashboard";

  useEffect(() => {
    if (loading) return;
    if (!session) {
      router.replace("/auth");
      return;
    }
    if (!onboardingRequired) {
      router.replace(dashboardPath);
    }
  }, [dashboardPath, loading, onboardingRequired, router, session]);

  useEffect(() => {
    if (!session) return;

    setFormData((previous) => ({
      firstName: session.firstName ?? previous.firstName,
      lastName: session.lastName ?? previous.lastName,
      email: session.email ?? previous.email,
      phone: session.phone ?? previous.phone,
      city: session.city ?? previous.city,
      gender: session.gender ?? previous.gender,
      image: session.image ?? previous.image,
      plan: session.plan ?? previous.plan
    }));
  }, [session]);

  function updateField<Key extends keyof OnboardingForm>(
    field: Key,
    value: OnboardingForm[Key]
  ) {
    setFormData((previous) => ({ ...previous, [field]: value }));
  }

  function updateStep(nextStep: number) {
    const step = Math.max(1, Math.min(totalSteps, nextStep));
    const nextParams = new URLSearchParams();
    nextParams.set("step", String(step));
    if (params.testId) nextParams.set("testId", params.testId);
    router.push(`${pathname}?${nextParams.toString()}`);
  }

  function validateStep(step: number) {
    if (step === 1) {
      return Boolean(formData.firstName.trim() && formData.lastName.trim() && formData.gender);
    }
    if (step === 2) {
      return Boolean(formData.email.trim() && formData.phone?.trim() && formData.city.trim());
    }
    return Boolean(formData.plan);
  }

  async function handleNext() {
    if (!validateStep(currentStep)) {
      toast.error("Complete the required fields before continuing.");
      return;
    }
    updateStep(currentStep + 1);
  }

  async function handleSubmit() {
    if (!session?.accountId) {
      toast.error("Your session is not ready. Please sign in again.");
      return;
    }
    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.error("Complete all required fields before finishing onboarding.");
      return;
    }

    setSaving(true);
    try {
      const saved = await createAccount(
        `${formData.firstName.trim()} ${formData.lastName.trim()}`,
        formData.phone ?? "",
        formData.email.trim(),
        formData.gender,
        formData.city.trim(),
        formData.image,
        session.accountId,
        formData.plan
      );

      if (!saved) {
        toast.error("Failed to save your profile. Please try again.");
        return;
      }

      await refreshSession();
      toast.success("Profile completed.");
      router.replace(dashboardPath);
    } catch (error) {
      console.error("[ONBOARDING_SUBMIT_ERROR]", error);
      toast.error("Something went wrong while saving your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading || !session) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--rubric-off-white)] p-4">
        <div className="flex items-center gap-2 rounded-full border border-[var(--border)] bg-white px-4 py-3 text-sm text-[var(--rubric-slate)]">
          <PiSpinnerGap className="h-4 w-4 animate-spin" />
          Loading profile
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--rubric-off-white)] px-4 py-8 text-[var(--rubric-black)] sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="hidden lg:block">
          <Image src="/logo.svg" alt="Rubric" width={42} height={42} className="mb-8 rounded-lg" />
          <h1 className="max-w-sm text-5xl font-normal leading-tight tracking-normal">
            Finish setting up Rubric.
          </h1>
          <p className="mt-5 max-w-md text-base leading-7 text-[var(--rubric-muted)]">
            Add the profile details Rubric needs for dashboard access, test ownership, and account recovery.
          </p>
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-white p-5 sm:p-7">
          <div className="mb-7 flex items-center gap-3 lg:hidden">
            <Image src="/logo.svg" alt="Rubric" width={32} height={32} className="rounded-lg" />
            <span className="text-lg font-semibold">Rubric</span>
          </div>

          <div className="mb-7">
            <p className="text-sm font-semibold text-[var(--rubric-muted)]">
              Step {currentStep} of {totalSteps}
            </p>
            <h2 className="mt-2 text-3xl font-normal">
              {currentStep === 1 ? "Personal info" : currentStep === 2 ? "Contact info" : "Choose your plan"}
            </h2>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`h-2 rounded-full ${
                    step <= currentStep ? "bg-[var(--rubric-black)]" : "bg-[#E5E0D6]"
                  }`}
                />
              ))}
            </div>
          </div>

          {currentStep === 1 ? (
            <div className="space-y-5">
              <div className="flex items-center gap-4 rounded-xl bg-[#FAF8F3] p-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[var(--rubric-black)] text-lg font-semibold text-white">
                  {formData.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.image} alt="" className="h-full w-full object-cover" />
                  ) : (
                    `${formData.firstName?.[0] ?? "R"}${formData.lastName?.[0] ?? ""}`
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold">Your profile</p>
                  <p className="truncate text-sm text-[var(--rubric-muted)]">
                    {formData.email || "Complete your details"}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="First name">
                  <input
                    value={formData.firstName}
                    onChange={(event) => updateField("firstName", event.target.value)}
                    className="theme-input"
                    placeholder="Henry"
                  />
                </Field>
                <Field label="Last name">
                  <input
                    value={formData.lastName}
                    onChange={(event) => updateField("lastName", event.target.value)}
                    className="theme-input"
                    placeholder="Bassey"
                  />
                </Field>
              </div>

              <Field label="Gender">
                <select
                  value={formData.gender}
                  onChange={(event) => updateField("gender", event.target.value as Gender)}
                  className="theme-input theme-select"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </Field>
            </div>
          ) : (
            <div className="space-y-5">
              <Field label="Email">
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="theme-input opacity-80"
                />
              </Field>

              <Field label="Phone">
                <PhoneInput
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(value) => updateField("phone", value)}
                  className="theme-input phone-input"
                />
              </Field>

              <Field label="City">
                <input
                  value={formData.city}
                  onChange={(event) => updateField("city", event.target.value)}
                  className="theme-input"
                  placeholder="e.g., Lagos"
                />
              </Field>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-[var(--rubric-muted)] mb-4">Select the plan that fits your current needs. You can upgrade anytime.</p>
              
              <div className="grid gap-3">
                {[
                  { id: "solo_paygo", name: "Pay As You Go", price: "₦0", desc: "Pay per test/student" },
                  { id: "solo_starter", name: "Solo Starter", price: "₦5,000", desc: "50 students, 10 tests" },
                  { id: "solo_growth", name: "Solo Growth", price: "₦12,000", desc: "200 students, unlimited tests" },
                ].map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateField("plan", p.id as Plan)}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                      formData.plan === p.id 
                        ? "border-[var(--rubric-black)] bg-[#FAF8F3]" 
                        : "border-[var(--border)] hover:border-[var(--rubric-muted)]"
                    }`}
                  >
                    <div>
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-xs text-[var(--rubric-muted)]">{p.desc}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{p.price}</p>
                      <p className="text-[10px] text-[var(--rubric-muted)]">{p.id === 'solo_paygo' ? 'setup' : '/mo'}</p>
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="mt-4 p-4 rounded-xl bg-[var(--rubric-off-white)] border border-dashed border-[var(--border)]">
                <p className="text-xs text-center text-[var(--rubric-muted)]">
                  Running an institution? <span className="font-semibold text-[var(--rubric-black)] cursor-pointer">Contact sales</span> for enterprise plans.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex gap-3">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => updateStep(currentStep - 1)}
                disabled={saving}
                className="theme-button-secondary flex-1"
              >
                <PiArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            {currentStep < totalSteps ? (
              <button type="button" onClick={handleNext} className="theme-button-primary flex-1">
                Next
                <PiArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="theme-button-primary flex-1"
              >
                {saving ? (
                  <PiSpinnerGap className="h-4 w-4 animate-spin" />
                ) : (
                  <PiCheck className="h-4 w-4" />
                )}
                Finish
              </button>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-semibold text-[var(--rubric-slate)]">{label}</span>
      {children}
    </label>
  );
}
