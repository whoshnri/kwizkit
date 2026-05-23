"use client";

import type { ReactNode } from "react";
import { useMemo } from "react";
import { usePathname } from "next/navigation";
import { SessionProvider } from "../SessionContext";
import { SiteFooter, SiteNavbar } from "@/components/site";

function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const hideShell = useMemo(
    () =>
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/live"),
    [pathname]
  );

  if (hideShell) {
    return <>{children}</>;
  }

  return (
    <div className="rubric-page flex min-h-screen flex-col">
      <SiteNavbar
        links={[
          { label: "Features", href: "/#features" },
          { label: "Pricing", href: "/pricing" },
          { label: "Support", href: "/support" },
          { label: "Privacy", href: "/privacy-policy" },
        ]}
        primaryAction={{ label: "Get started", href: "/auth" }}
        secondaryAction={{ label: "Sign in", href: "/auth" }}
      />

      <main className="flex-1">{children}</main>

      <SiteFooter
        columns={[
          {
            title: "Product",
            links: [
              { label: "Features", href: "/#features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Support", href: "/support" },
            ],
          },
          {
            title: "Company",
            links: [
              { label: "About", href: "/support" },
              { label: "Blog", href: "/support" },
              { label: "Careers", href: "/support" },
            ],
          },
          {
            title: "Legal",
            links: [
              { label: "Privacy policy", href: "/privacy-policy" },
              { label: "Terms", href: "/terms" },
            ],
          },
          {
            title: "Contact",
            links: [
              { label: "Email support", href: "/support" },
              { label: "Plan help", href: "/pricing" },
            ],
          },
        ]}
        ctaTitle="Run the academic work around every learner from one place."
        ctaDescription="Manage students, classes, materials, tests, live attempts, grading, certificates, and account activity in a workspace built for modern education teams."
        ctaHref="/auth"
        ctaLabel="Get started"
      />
    </div>
  );
}

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <Shell>{children}</Shell>
    </SessionProvider>
  );
}
