"use client";

import { SessionProvider, useSession } from "../SessionContext";
import { checkAccount } from "@/app/actions/checkAccount";
import Link from "next/link";
import AccountDropdownMenu from "@/app/components/AccountDropdownMenu";
import { RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { useEffect, useState } from "react";

function AuthMenu() {
  const { session: idToken, loading } = useSession();
  const [exists, setExists] = useState<boolean | null>(null);

  useEffect(() => {
    async function verifyAccount() {
      if (idToken?.sub) {
        const found = await checkAccount(idToken.sub);
        setExists(found);
      } else {
        setExists(false);
      }
    }
    verifyAccount();
  }, [idToken]);

  if (loading || !exists) {
    // Skeleton Loader
    return (
      <div className="flex items-center gap-4">
        <div className="w-7 h-7 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
      </div>
    );
  }

  if (idToken?.sub && exists) {
    return <AccountDropdownMenu session={idToken} />;
  }

  return (
    <div className="flex items-center gap-4">
      <RegisterLink postLoginRedirectURL="/auth/router">
        <span className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md hover:opacity-90 transition-opacity">
          Sign up
        </span>
      </RegisterLink>
    </div>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
        <header className="theme-border theme-bg backdrop-blur-lg w-full flex justify-between items-center py-4 px-4 ">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
          >
            KwizKit
          </Link>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Home
              </Link>
              <Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Pricing
              </Link>
              <Link href="/support" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Support
              </Link>
            </nav>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 hidden md:block" />
            <AuthMenu />
          </div>
        </header>

        <main className="flex-1 w-full">{children}</main>

        <footer className="w-full border-t theme-border theme-bg p-6 text-center text-xs ">
          <div className="flex justify-center gap-2 mb-4">
            <Link href="/privacy-policy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Privacy
            </Link>
            <Link href="/terms-and-conditions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Terms
            </Link>
            <Link href="/support" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Contact
            </Link>
          </div>
          <p>&copy; {new Date().getFullYear()} KwizKit. All rights reserved.</p>
        </footer>
    </SessionProvider>
  );
}
