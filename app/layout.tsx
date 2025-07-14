import type { Metadata } from "next";
import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth"; // Make sure this path is correct
import Link from "next/link";
import { Providers } from "./providers"; // For client-side context (e.g., NextAuth SessionProvider)
import { User, LogIn } from "lucide-react";
import "./globals.css";
import AccountDropdownMenu from "./components/AccountDropdownMenu"

// Metadata for SEO and social sharing
export const metadata: Metadata = {
  metadataBase: new URL("https://kwizkit.app"), // Replace with your actual domain
  title: {
    default: "KwizKit - AI-Powered Assessments for Educators",
    template: "%s | KwizKit",
  },
  description: "AI-powered test creation, grading, and analytics for modern educators.",
  openGraph: {
    title: "KwizKit",
    description: "The future of educational assessments is here.",
    url: "https://kwizkit.app", // Replace with your actual domain
    siteName: "KwizKit",
    images: [
      {
        url: "/og-image.png", // Create and place an Open Graph image in your /public folder
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KwizKit",
    description: "AI-powered test creation, grading, and analytics for modern educators.",
    images: ["/og-image.png"], // Must be an absolute URL in production
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Correctly await the session inside the async component
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className=" theme-bg theme-text min-h-screen flex flex-col">
        <header className="sticky theme-border bg-white/70 dark:theme-bg border top-0 z-50 backdrop-blur-lg w-full flex justify-between items-center p-4 md:p-6 ">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
            KwizKit
          </Link>

          {/* Navigation */}
          <div className="flex items-center gap-4 md:gap-6">
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium ">
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

            {/* Conditional Authentication UI */}
            {session?.user ? (
              <AccountDropdownMenu session={session}/>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/auth/authorize"
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg shadow-md hover:opacity-90 transition-opacity"
                >
                  <LogIn size={16} />
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </header>

        <Providers>
          <main className="flex-1 w-full">{children}</main>
        </Providers>

        <footer className="w-full border-t theme-border p-6 text-center text-sm ">
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
    </html>
  );
}
