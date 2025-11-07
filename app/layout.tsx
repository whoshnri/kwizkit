import "./globals.css";
import type { Metadata } from "next";
import { Geist_Mono, Geist } from "next/font/google";
import AppLayout from "./components/Layout";
import { AuthProvider } from "./components/AuthProvider";
import { Toaster } from "sonner";


const geist = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "700"], // optional: choose weights you use
  variable: "--font-geist", // optional: if you want to use it in Tailwind
});

export const metadata: Metadata = {
  metadataBase: new URL("https://kwizkit.app"),
  title: {
    default: "KwizKit - AI-Powered Assessments for Educators",
    template: "%s | KwizKit",
  },
  description:
    "Empower your teaching with KwizKit. Leverage AI for effortless test creation, automated grading, and insightful analytics. Save time and enhance student outcomes.",
  keywords: [
    "AI assessment tool",
    "test generator",
    "quiz maker for teachers",
    "automated grading",
    "educational technology",
    "teacher tools",
    "assessment software",
    "KwizKit",
  ],
  creator: "KwizKit Team",
  publisher: "KwizKit",
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
    title: "KwizKit: The Smart Assessment Tool for Modern Educators",
    description:
      "Discover the future of educational assessments. AI-powered test creation, grading, and analytics are here.",
    url: "https://kwizkit.app",
    siteName: "KwizKit",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "KwizKit application interface showing an AI-generated quiz.",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "KwizKit - AI-Powered Assessments for Educators",
    description:
      "Streamline your teaching with AI. Effortless test creation, automated grading, and powerful analytics with KwizKit.",
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
    <html lang="en" className={geist.className}>
      <body
        className={`theme-bg theme-text min-h-screen flex flex-col antialiased`}
        id="home"
      >
        <AuthProvider>
          <AppLayout>{children}</AppLayout>
        </AuthProvider>
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
