"use client";

import { useEffect, useRef, useState } from "react";
import "react-phone-number-input/style.css";
import PhoneInput from "react-phone-number-input";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {useKindeBrowserClient} from "@kinde-oss/kinde-auth-nextjs";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export default function OnboardingPage() {
  const {idToken, idTokenRaw} = useKindeBrowserClient();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Step in URL (search param). Default to 1.
  const currentStep = Number(searchParams?.get("step") ?? 1);
  const totalSteps = 3;

  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string | undefined>(undefined);
  const [picture, setPicture] = useState<string | null>(null)
  const [city, setCity] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [provider, setProvider] = useState<string>('')
  const [providerAccountId, setProviderAccountId] = useState<string>('')

  const prevStepRef = useRef<number>(currentStep);
  useEffect(() => {
    prevStepRef.current = currentStep;
  }, [currentStep]);

  useEffect(() => {
    if (!idToken) return;
    if (!firstName && idToken?.given_name) setFirstName(idToken.given_name);
    if (!lastName && idToken?.family_name) setLastName(idToken.family_name);
    if (!email && idToken?.email) setEmail(idToken.email);
    if (!phone && idToken?.phone_number) setPhone(idToken.phone_number);
    if (!provider && idToken?.ext_provider?.name) setProvider(idToken.ext_provider.name);
    if (!providerAccountId && idTokenRaw) setProviderAccountId(idTokenRaw);
    if (!gender) setGender("male")
  }, [idToken]);

  const updateStepParam = (newStep: number) => {
    const s = Math.max(1, Math.min(totalSteps, newStep));
    router.push(`${pathname}?step=${s}`);
  };

  useEffect(() => {
    setPicture(`https://avatar.iran.liara.run/username?username=${firstName}+${lastName}`)
  }, [firstName, lastName])

  const goNext = () => updateStepParam(currentStep + 1);
  const goBack = () => updateStepParam(currentStep - 1);

  const stepVariants: Variants = {
    initial: (direction: number) => ({
      x: direction > 0 ? "100%" : "-100%",
      opacity: 0,
    }),
    animate: {
      x: "0%",
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: (direction: number) => ({
      x: direction < 0 ? "100%" : "-100%",
      opacity: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    }),
  };

  // Render step content (values come from state)
  const renderStep = (current: number) => {
    const direction = current > prevStepRef.current ? 1 : -1;

    switch (current) {
      case 1:
        return (
          <motion.div
            key="step1"
            custom={direction}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold">Step 1: Personal Info</h2>
            <img
              src={idToken?.picture || picture  || "https://avatar.iran.liara.run/public"}
              alt={`${firstName} profile picture`}
              className="w-24 h-24 rounded-full border theme-border"
            />

            <div className="grid gap-2">
              <Label htmlFor="firstName" className="opacity-90">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
                className="theme-border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="lastName" className="opacity-90">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
                className="theme-border"
              />
            </div>

             <div className="grid gap-2">
              <Label htmlFor="gender">Gender</Label>
              <Select value={gender} onValueChange={setGender}
              >
                <SelectTrigger id="gender" >
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent className=" theme-bg">
                  <SelectItem value="male" className="theme-border theme-bg hover:theme-bg-subtle">male</SelectItem>
                  <SelectItem value="female" className="theme-border theme-bg hover:theme-bg-subtle">female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            custom={direction}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold">Step 2: Contact</h2>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="theme-border"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <p className="text-sm text-muted-foreground opacity-50">
                use the format +1234567890
              </p>
              <div className="text-sm theme-border border p-2 rounded">
                <PhoneInput
                  placeholder="Enter phone number"
                  value={phone}
                  onChange={setPhone}
                />
              </div>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            custom={direction}
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="space-y-6"
          >
            <h2 className="text-xl font-semibold">Step 3: Work</h2>

            <div className="grid gap-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="City"
                className="theme-border"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={setRole}
              >
                <SelectTrigger id="role" >
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent className=" theme-bg">
                  <SelectItem value="tutor" className="theme-border theme-bg hover:theme-bg-subtle">Tutor</SelectItem>
                  <SelectItem value="admin" className="theme-border theme-bg hover:theme-bg-subtle">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Submit the form (single payload from state)
  const handleSubmit = async () => {
    const payload = {
      firstName,
      lastName,
      email,
      phone,
      city,
      role,
      provider,
      providerAccountId,
      gender,
      image: picture,
      accountId: idToken?.sub
      
    };

    try {
      const res = await fetch("/api/auth/self", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ details: payload }),
      });

      if (!res.ok) throw new Error("Failed to save onboarding data");

      // go to dashboard on success
      router.push("/dashboard");
    } catch (err) {
      console.error("Onboarding save error:", err);
      alert("Something went wrong saving your data.");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="w-full max-w-lg rounded theme-border shadow-lg p-6 md:p-10 overflow-hidden">
        <CardHeader className="text-center p-0 mb-8">
          <CardTitle className="brand-text text-3xl font-extrabold">
            Welcome Onboard!
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Just a few steps to get you set up.
          </p>
        </CardHeader>

        <CardContent className="p-0">
          {/* Progress */}
          <div className="mb-8 flex items-center justify-between gap-6 w-fit mx-auto">
            {[...Array(totalSteps)].map((_, i) => {
              const seg = i + 1;
              const active = seg <= currentStep;
              return (
                <div key={seg} className="flex flex-1 items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors duration-200",
                      active
                        ? "border-primary brand-bg text-white"
                        : "border-input text-muted-foreground"
                    )}
                  >
                    {seg}
                  </div>
                  {seg < totalSteps && (
                    <div
                      className={cn(
                        "mx-2 h-1 flex-1 rounded-full",
                        currentStep > seg ? "brand-bg" : "bg-border"
                      )}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Animated step */}
          <AnimatePresence mode="wait">
            {renderStep(currentStep)}
          </AnimatePresence>

          {/* Navigation */}
          <div className="mt-8 flex justify-between gap-4">
            {currentStep > 1 ? (
              <Button variant="outline" onClick={goBack} className="flex-1">
                Back
              </Button>
            ) : (
              <div className="flex-1" />
            )}

            {currentStep < totalSteps ? (
              <Button onClick={goNext} className="flex-1 brand-bg text-white">
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className="flex-1 brand-bg text-white"
              >
                Finish
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
