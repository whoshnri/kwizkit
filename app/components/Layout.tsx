"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";
import AccountDropdownMenu from "@/app/components/AccountDropdownMenu";
import ThemeToggle from "@/app/components/DarkMode";
import { ThemeProvider } from "@/app/components/theme-provider";
import { Providers } from "@/app/providers";

export default function AppLayout({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <ThemeProvider>
      <body className="theme-bg theme-text min-h-screen flex flex-col" id="home">
        <header className="sticky theme-border theme-bg border-b top-0 z-50 backdrop-blur-lg w-full flex justify-between items-center p-4 md:p-6 ">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            KwizKit
          </Link>

          <div className="flex items-center gap-4 md:gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium ">
              <ThemeToggle />

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

            {session?.user ? (
              <AccountDropdownMenu session={session} />
            ) : (
              <div className="flex items-center gap-4">
                <Link
                  href="/auth/authorize"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md hover:opacity-90 transition-opacity"
                >
                  <LogIn size={16} />
                  Signin
                </Link>
              </div>
            )}
          </div>
        </header>

        <Providers>
          <main className="flex-1 w-full">{children}</main>
        </Providers>

        <footer className="w-full border-t theme-border theme-bg p-6 text-center text-sm ">
          <div className="flex justify-center gap-6 mb-4">
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
          <p>© {new Date().getFullYear()} KwizKit. All rights reserved.</p>
        </footer>
      </body>
    </ThemeProvider>
  );
}
