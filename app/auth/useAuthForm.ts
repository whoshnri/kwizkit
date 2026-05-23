"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn, signUp } from "@/lib/auth-client";

export type AuthMode = "sign-in" | "sign-up";
export type AuthProvider = "google";

const dashboardURL = "/dashboard";
const onboardingURL = "/auth/onboarding";

async function getPostAuthURL() {
  const response = await fetch("/api/auth/session", {
    method: "GET",
    credentials: "include",
    cache: "no-store",
  });
  const data = await response.json().catch(() => ({}));
  return data?.onboardingRequired ? onboardingURL : dashboardURL;
}

export function useAuthForm() {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [pending, setPending] = useState(false);
  const [pendingProvider, setPendingProvider] = useState<AuthProvider | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setMessage(null);
  }

  async function handleOAuth(provider: AuthProvider) {
    setPendingProvider(provider);
    setMessage(null);

    try {
      const result = (await signIn.social({ provider, callbackURL: dashboardURL })) as any;
      const url = result?.data?.url ?? result?.url;

      if (url) {
        window.location.assign(url);
        return;
      }

      router.push(await getPostAuthURL());
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "OAuth sign-in failed.");
    } finally {
      setPendingProvider(null);
    }
  }

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setMessage(null);

    try {
      if (mode === "sign-in") {
        const identifier = String(formData.get("identifier") ?? "").trim();
        const password = String(formData.get("password") ?? "");

        if (!identifier || !password) {
          throw new Error("Enter your email or username and password.");
        }

        const payload = { password, callbackURL: dashboardURL, rememberMe: true } as const;
        const response = identifier.includes("@")
          ? await (signIn.email({ email: identifier, ...payload }) as Promise<any>)
          : await (signIn.username({ username: identifier, ...payload }) as Promise<any>);

        if (response?.error) {
          throw new Error(response.error.message || "Sign-in failed.");
        }

        router.push(await getPostAuthURL());
        router.refresh();
        return;
      }

      const name = String(formData.get("name") ?? "").trim();
      const username = String(formData.get("username") ?? "").trim();
      const email = String(formData.get("email") ?? "").trim();
      const password = String(formData.get("password") ?? "");

      if (!name || !username || !email || !password) {
        throw new Error("Fill in all fields to create your account.");
      }

      const response = await (signUp.email({
        name,
        username,
        displayUsername: username,
        email,
        password,
        callbackURL: dashboardURL,
      }) as Promise<any>);

      if (response?.error) {
        throw new Error(response.error.message || "Sign-up failed.");
      }

      router.push(await getPostAuthURL());
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setPending(false);
    }
  }

  return {
    mode,
    message,
    pending,
    pendingProvider,
    busy: pending || pendingProvider !== null,
    switchMode,
    handleOAuth,
    handleSubmit,
  };
}
