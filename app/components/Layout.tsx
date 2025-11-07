"use client";

import { SessionProvider, useSession } from "../SessionContext";
import Link from "next/link";
import AccountDropdownMenu from "@/app/components/AccountDropdownMenu";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useEffect, useState, useRef } from "react";
import { gsap } from "gsap";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { User } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { FaGithub, FaGithubAlt } from "react-icons/fa";

function Wrapper({ children }: { children: React.ReactNode }) {
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.fromTo(
      bodyRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.75, ease: "power2.inOut" }
    );

  }, []);

  return <div ref={bodyRef}>{children}</div>;
}


function AuthMenu() {
  const { session} = useSession();
  const [exists, setExists] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserAccount = async () => {
      if (session) {
        setExists(session);
      } else {
        setExists(null);
      }
      setIsLoading(false);
    };
    checkUserAccount();
  }, [session]);

  if (isLoading) {
    return (
      <div className="flex items-center gap-4">
        <div className="w-7 h-7 rounded-full theme-bg-subtle animate-pulse" />
      </div>
    );
  }

  if (exists) {
    return <AccountDropdownMenu session={exists} />;
  }


  return !exists && !isLoading && (
    <div className="flex items-center">
      <RegisterLink postLoginRedirectURL="/auth/onboarding">
        <span
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold theme-button"
        >
          Sign up
        </span>
      </RegisterLink>
    </div>
  )
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <header className="theme-bg theme-border-color w-full border-b border-dashed">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6 lg:px-8">
          <Link
            href="/prelaunch"
            className="text-2xl font-bold theme-text-accent"
          >
            KwizKit
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/prelaunch" className="theme-text-interactive">
                Home
              </Link>
              <Link href="/pricing" className="theme-text-interactive">
                Pricing
              </Link>
              <Link href="/support" className="theme-text-interactive">
                Support
              </Link>
            </nav>

            <div className="w-px h-6 theme-bg-subtle hidden md:block" />
            {/* <AuthMenu /> */}
            <Link className="theme-button" href={"https://github.com/whoshnri/kwizkit"}>
                <FaGithub className=" h-5 w-5"></FaGithub>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Wrapper>{children}</Wrapper>
      </main>


      <footer className="w-full border-t border-dashed theme-border-color theme-bg">
        <div className="max-w-7xl mx-auto p-6 text-center text-xs theme-text-secondary">
            <div className="flex justify-center gap-4 mb-4">
              <Link href="/privacy-policy" className="theme-text-interactive">
                Privacy
              </Link>
              <Link href="/terms-and-conditions" className="theme-text-interactive">
                Terms
              </Link>
              <Link href="/support" className="theme-text-interactive">
                Support
              </Link>
            </div>
            <p>&copy; {new Date().getFullYear()} KwizKit. All rights reserved.</p>
        </div>
      </footer>
    </SessionProvider>
  );
}