"use client";

import { useEffect, useRef, useState, use } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useKindeBrowserClient } from "@kinde-oss/kinde-auth-nextjs";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { toast } from "sonner";
import { createAccount } from "@/app/actions/checkAccount";
import { Gender } from "@prisma/client";

// --- Type Definitions for Strict Type Safety ---
interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | undefined;
  picture: string | null;
  city: string;
  role: string;
  gender: string;
}

export default function OnboardingPage ({
  searchParams,
}: {
  searchParams: Promise<{ testId?: string, step?: string }>;
}) {
  const { idToken } = useKindeBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const params = use(searchParams);
  const testId = params.testId ?? null;

  // State
  const currentStep = Number(params.step ?? 1);
  const totalSteps = 2;
  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: undefined,
    picture: null,
    city: "",
    role: "",
    gender: "male",
  });

  // Refs for animations
  const containerRef = useRef<HTMLDivElement>(null);
  const stepContainerRef = useRef<HTMLDivElement>(null);
  const stepsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Initialize form data from Kinde
  useEffect(() => {
    if (idToken) {
      setFormData((prev) => ({
        ...prev,
        firstName: idToken.given_name ?? prev.firstName,
        lastName: idToken.family_name ?? prev.lastName,
        email: idToken.email ?? prev.email,
        phone: idToken.phone_number ?? prev.phone,
        city: idToken.user_properties?.kp_usr_city?.v ?? prev.city,
        picture: idToken.picture ?? prev.picture,
      }));
    }
  }, [idToken]);

  // --- GSAP Animations ---
  useGSAP(() => {
    gsap.from(containerRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.7,
      ease: "power2.out",
    });
    if (stepsRef.current[0] && stepContainerRef.current) {
      gsap.set(stepContainerRef.current, {
        height: stepsRef.current[0].offsetHeight,
      });
    }
  }, []);

  useGSAP(
    () => {
      if (stepsRef.current[currentStep - 1] && stepContainerRef.current) {
        const targetStep = stepsRef.current[currentStep - 1];
        const targetHeight = targetStep!.offsetHeight;

        const tl = gsap.timeline();
        tl.to(stepContainerRef.current, {
          height: targetHeight,
          duration: 0.4,
          ease: "power2.inOut",
        });

        stepsRef.current.forEach((step) => {
          if (step) {
            gsap.to(step, {
              xPercent: -(currentStep - 1) * 100,
              duration: 0.5,
              ease: "power2.inOut",
            });
          }
        });
      }
    },
    { dependencies: [currentStep] }
  );

  // Typed handler for form updates
  const handleUpdate = (field: keyof FormData, value: string | undefined) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateStep = (newStep: number) => {
    router.push(
      `${pathname}?step=${Math.max(1, Math.min(totalSteps, newStep))}`
    );
  };

  const handleSubmit = async () => {
    const res = createAccount(
      `${formData.firstName} ${formData.lastName}`,
      formData.phone || "",
      formData.email,
      formData.gender as Gender,
      formData.city,
      formData.picture || "",
      idToken?.sub || ""
    );
    if (!res) {
      toast.error("Failed to create account. Please try again.");
      return;
    } else {
      toast.success("Account created successfully!", {
        description: "Redirecting to dashboard...",
      });
      router.push("/dashboard");
    }
  };

  return (
    <div className="flex items-center h-fit justify-center theme-bg p-4">
      <div
        ref={containerRef}
        className="w-full max-w-lg rounded-md theme-bg border-2 border-dashed theme-border-color p-6 md:p-10"
      >
        <div className="text-center mb-8">
          <h1 className="theme-text-accent text-3xl font-bold">
            Welcome Onboard!
          </h1>
          <p className="text-sm theme-text-secondary">
            Just a few steps to get you set up.
          </p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-2 w-full max-w-[200px] mx-auto">
          {[...Array(totalSteps)].map((_, i) => {
            const stepIndex = i + 1;
            const isActive = stepIndex <= currentStep;
            return (
              <div
                key={stepIndex}
                className={`flex items-center ${
                  stepIndex < totalSteps ? "flex-grow" : ""
                }`}
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-md border-2 border-dashed text-sm font-medium ${
                    isActive
                      ? "theme-accent-border-color theme-text-accent"
                      : "theme-border-color theme-text-secondary"
                  }`}
                >
                  {stepIndex}
                </div>
                {stepIndex < totalSteps && (
                  <div className="h-0.5 flex-1 border-b-2 border-dashed theme-border-color" />
                )}
              </div>
            );
          })}
        </div>

        <div
          ref={stepContainerRef}
          className="relative overflow-hidden transition-height duration-300"
        >
          <div className="flex">
            {/* Step 1 */}
            <div
              ref={(el) => {
                stepsRef.current[0] = el;
              }}
              className="w-full flex-shrink-0 space-y-6 px-1"
            >
              <h2 className="text-xl font-semibold">Personal Info</h2>
              <img
                src={
                  formData.picture ??
                  `https://avatar.iran.liara.run/username?username=${formData.firstName}+${formData.lastName}`
                }
                alt="Profile"
                className="w-24 h-24 rounded-md border-2 border-dashed theme-border-color"
              />
              <div>
                <label className="text-sm theme-text-secondary mb-1 block">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdate("firstName", e.target.value)
                  }
                  placeholder="First name"
                  className="theme-input"
                />
              </div>
              <div>
                <label className="text-sm theme-text-secondary mb-1 block">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdate("lastName", e.target.value)
                  }
                  placeholder="Last name"
                  className="theme-input"
                />
              </div>
              <div>
                <label className="text-sm theme-text-secondary mb-1 block">
                  Gender
                </label>
                <select
                  value={formData.gender}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    handleUpdate("gender", e.target.value)
                  }
                  className="theme-input theme-select"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>
            </div>

            {/* Step 2 */}
            <div
              ref={(el) => {
                stepsRef.current[1] = el;
              }}
              className="w-full flex-shrink-0 space-y-6 px-1"
            >
              <h2 className="text-xl font-semibold">Contact Info</h2>
              <div>
                <label className="text-sm theme-text-secondary mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdate("email", e.target.value)
                  }
                  placeholder="you@example.com"
                  className="theme-input"
                />
              </div>
              <div>
                <label className="text-sm theme-text-secondary mb-1 block">
                  Phone
                </label>
                <PhoneInput
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={(value) => handleUpdate("phone", value)}
                  className="theme-input phone-input"
                />
              </div>
              <div>
                <label className="text-sm theme-text-secondary mb-1 block">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleUpdate("city", e.target.value)
                  }
                  placeholder="e.g., New York"
                  className="theme-input"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex justify-between gap-4">
          {currentStep > 1 ? (
            <button
              onClick={() => updateStep(currentStep - 1)}
              className="theme-button-secondary flex-1"
            >
              Back
            </button>
          ) : (
            <div className="flex-1" />
          )}
          {currentStep < totalSteps ? (
            <button
              onClick={() => updateStep(currentStep + 1)}
              className="theme-button-primary flex-1"
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="theme-button-primary flex-1 cursor-pointer"
            >
              Finish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
