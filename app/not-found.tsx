"use client";

import Link from "next/link";
import Lottie from "lottie-react";
import animationData from "../public/lottie/404.json";

export default function NotFound() {
  return (
    <div className="theme-bg flex items-center justify-center">
      <div className="w-full theme-border text-center space-y-1">
        {/* Lottie Animation */}
        <div className="w-150 mx-auto">
          <Lottie animationData={animationData} loop={true} autoplay={true} />
        </div>
        <p className="text-lg font-semibold theme-text">Page not found</p>
        <p className="text-sm text-gray-500 mb-4">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block theme-bg border-2 border-dashed theme-border-color theme-text px-6 py-2.5  rounded-md text-sm font-medium transition-colors active:scale-95 focus:outline-none"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
