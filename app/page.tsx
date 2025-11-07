// src/app/page.tsx

import React from 'react';
import { FaBrain, FaMagic, FaChartLine, FaCertificate, FaShieldAlt, FaQuestionCircle } from 'react-icons/fa';
import Link from 'next/link';
import SocialProof from './components/social-proof';
import PricingSection from './components/pricing';
import FAQSection from './components/faq-section';


export const CTAButton = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href}>
    <span className="theme-button inline-block text-center text-base font-semibold">
      {children}
    </span>
  </Link>
);


const HeroSection = () => (
  <section className="text-center py-8 max-w-4xl mx-auto ">
    {/* GSAP: Animate these text elements and the button on page load */}
    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold theme-text leading-tight mb-4">
      We&apos;re the ultimate test management suite.
    </h1>
    <p className="max-w-3xl mx-auto text-lg sm:text-xl theme-text-secondary mb-8">
      Effortlessly create, grade, and analyze tests with the power of AI. Save time, reduce bias, and gain deeper insights into student performance.
    </p>
    <CTAButton href="/auth/">Start Creating for Free</CTAButton>
  </section>
);


const DashboardPreview = () => (
  <section className="py-16 sm:py-20">
    <div className="bg-transparent border-2 border-dashed theme-border-color rounded-md p-4 shadow-lg">
      {/* Placeholder for an auto-playing video or a high-quality screenshot of the app dashboard */}
      <div className="w-full aspect-video theme-bg-subtle rounded-sm flex items-center justify-center">
        <p className="theme-text-secondary text-sm">[Dashboard Video/Screenshot Placeholder]</p>
      </div>
    </div>
  </section>
);


// --- Features Section ---
const FeaturesSection = () => {
    const features = [
        { icon: <FaBrain />, title: "AI-Powered Test Creation", description: "Generate diverse and relevant questions from your source material in seconds." },
        { icon: <FaMagic />, title: "Automated Grading", description: "Save countless hours with instant, accurate, and unbiased automated grading." },
        { icon: <FaChartLine />, title: "In-Depth Analytics", description: "Track student performance and identify knowledge gaps with powerful insights." },
        { icon: <FaCertificate />, title: "Custom Certifications", description: "Automatically issue secure, verifiable certificates upon course completion." },
        { icon: <FaShieldAlt />, title: "High Security", description: "Ensure the integrity of your assessments with robust, secure protocols." },
        { icon: <FaQuestionCircle />, title: "Variety of Question Types", description: "From multiple-choice to long-form essays, our AI handles it all." }
    ];

  return (
    <section className="py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold theme-text">Whats the hype?</h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg theme-text-secondary">
          Everything you need to create and manage assessments, all in one platform.
        </p>
      </div>
      {/* GSAP: Use a scroll trigger to stagger-animate the feature cards fading in */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <div key={index} className="p-6 border-2 border-dashed theme-border-color">
            <div className="text-3xl theme-text-accent mb-4">{feature.icon}</div>
            <h3 className="text-xl font-semibold theme-text mb-2">{feature.title}</h3>
            <p className="theme-text-secondary">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};




// --- Final CTA Section ---
const FinalCTA = () => (
    <section className="py-16 sm:py-24 text-center border-2 border-dashed theme-border-color rounded">
        <h2 className="text-3xl sm:text-4xl font-bold theme-text mb-4">
            Ready to Revolutionize Your Assessments?
        </h2>
        <p className="max-w-2xl mx-auto text-lg theme-text-secondary mb-8">
            Join hundreds of educators who are already saving time and enhancing their teaching.
        </p>
        <CTAButton href="/auth/">Sign Up and Start Now</CTAButton>
    </section>
);


export default function HomePage() {
  return (
    <div className="mx-auto px-4 sm:px-6 lg:px-8">
      <HeroSection />
      <DashboardPreview />
      <SocialProof />
      <FeaturesSection />
      <PricingSection />
      <FAQSection />
      <FinalCTA />
    </div>
  )
}