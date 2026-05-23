import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppLayout from "./components/Layout";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "sonner";
import {GeistSans} from 'geist/font/sans';

const inter = Inter({ subsets: ["latin"], display: "swap" });



export const metadata: Metadata = {
  metadataBase: new URL("https://kwizkit.app"),
  title: {
    default: "Rubric - Assessment infrastructure for modern educators",
    template: "%s | Rubric",
  },
  description:
    "Rubric is the assessment infrastructure for modern educators and institutions. Create, proctor, certify and analyse tests at scale.",
  keywords: [
    "assessment infrastructure",
    "educator platform",
    "test creation",
    "proctoring",
    "certification",
    "analytics",
    "Rubric",
  ],
  creator: "Rubric",
  publisher: "Rubric",
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Rubric: Assessment infrastructure for modern educators",
    description: "Create, proctor, certify and analyse tests at scale.",
    url: "https://kwizkit.app",
    siteName: "Rubric",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rubric product interface showing the assessment workspace.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rubric - Assessment infrastructure for modern educators",
    description: "Create, proctor, certify and analyse tests at scale.",
    images: ["/og-image.png"],
  },
  alternates: {
    canonical: "https://kwizkit.app",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={GeistSans.className}>
      <body
        className="theme-bg theme-text min-h-screen flex flex-col antialiased"
        id="home"
      >
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <Toaster position="bottom-right" richColors closeButton />
      </body>
    </html>
  );
}
