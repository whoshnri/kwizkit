"use client";

import { useRef } from "react";
import {
  RegisterLink,
  LoginLink,
} from "@kinde-oss/kinde-auth-nextjs/components";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export default function AuthPage() {
  const authCardRef = useRef<HTMLDivElement>(null);

  // GSAP animation for a smooth entrance
  useGSAP(() => {
    gsap.from(authCardRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.75,
      ease: "power2.out",
    });
  }, []);

  return (
    <div className="flex  items-center justify-center theme-bg p-4">
      <div
        ref={authCardRef}
        className="border border-dotted theme-border-color rounded-md p-8 sm:p-10 w-full max-w-md text-center"
      >
        <h1 className="text-3xl font-bold theme-text mb-2">Welcome</h1>
        <p className="theme-text-secondary mb-8">
          Sign in to access your dashboard or create a new account.
        </p>

        <div className="space-y-4">
          {/* Primary Button Style */}
          <LoginLink
            postLoginRedirectURL="/api/auth/self"
            className="theme-button-primary"
          >
            Sign In
          </LoginLink>

          {/* Secondary Button Style */}
          <RegisterLink
            postLoginRedirectURL="/api/auth/self"
            className="theme-button-secondary"
          >
            Create Account
          </RegisterLink>
        </div>

        <p className="mt-8 text-sm theme-text-secondary">
          By continuing, you agree to our{" "}
          <a href="/terms" className="theme-text-accent hover:underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="/privacy-policy" className="theme-text-accent hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
}