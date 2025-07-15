import "./globals.css";
import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import AppLayout from "./components/Layout";

export const metadata: Metadata = {
  metadataBase: new URL("https://kwizkit.app"),
  title: {
    default: "KwizKit - AI-Powered Assessments for Educators",
    template: "%s | KwizKit",
  },
  description: "AI-powered test creation, grading, and analytics for modern educators.",
  openGraph: {
    title: "KwizKit",
    description: "The future of educational assessments is here.",
    url: "https://kwizkit.app",
    siteName: "KwizKit",
    images: [
      {
        url: "/og-image.png",
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
    images: ["/og-image.png"],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <AppLayout session={session}>
        {children}
      </AppLayout>
    </html>
  );
}
