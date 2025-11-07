"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Shield, Database, BookOpen, Clock, Mail, Info } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Data for policy sections for cleaner JSX
const policySections = [
  {
    icon: <Info size={24} />,
    title: "Information We Collect",
    content: (
      <>
        <p>
          At KwizKit, we collect information you provide directly to us, such as when you create an account, use our
          services, or contact us for support. This may include:
        </p>
        <ul className="list-disc space-y-2 pl-5 mt-4">
          <li>Your name, email address, and role (e.g., educator, student).</li>
          <li>Educational institution information.</li>
          <li>Content you create, including quizzes, questions, and other learning materials.</li>
          <li>Student responses and performance data when you administer assessments.</li>
          <li>Usage data and analytics to help us understand how you interact with our services.</li>
        </ul>
      </>
    ),
  },
  {
    icon: <Database size={24} />,
    title: "How We Use Your Information",
    content: (
      <>
        <p>We use the information we collect for the following purposes:</p>
        <ul className="list-disc space-y-2 pl-5 mt-4">
          <li>To provide, maintain, and improve our services.</li>
          <li>To power our AI features for test generation and performance analytics.</li>
          <li>To personalize your experience and provide relevant content.</li>
          <li>To send you technical notices, updates, security alerts, and support messages.</li>
          <li>To respond to your comments, questions, and provide customer service.</li>
        </ul>
      </>
    ),
  },
  {
    icon: <Shield size={24} />,
    title: "Data Security",
    content: (
      <p>
        We implement appropriate technical and organizational measures to protect your personal information
        against unauthorized access, alteration, disclosure, or destruction. We use industry-standard encryption,
        secure access protocols, and regular security audits to safeguard your data.
      </p>
    ),
  },
  {
    icon: <BookOpen size={24} />,
    title: "Educational Privacy (FERPA)",
    content: (
      <p>
        KwizKit is committed to protecting student privacy and complies with the Family Educational Rights and
        Privacy Act (FERPA). We act as a "school official" with a "legitimate educational interest" under FERPA.
        We do not sell student data and only use it to provide educational services as directed by you, the educator.
      </p>
    ),
  },
  {
    icon: <Clock size={24} />,
    title: "Data Retention",
    content: (
      <p>
        We retain your information for as long as your account is active or as needed to provide you with our services.
        You may request the deletion of your account and associated data at any time by contacting our support team.
      </p>
    ),
  },
  {
    icon: <Mail size={24} />,
    title: "Contact Us",
    content: (
      <p>
        If you have any questions or concerns about this Privacy Policy or our data practices, please do not hesitate to
        contact us at <a href="mailto:support@kwizkit.com" className="theme-text-accent hover:underline">support@kwizkit.com</a> or through our support page.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  const mainRef = useRef<HTMLDivElement>(null);
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useGSAP(() => {
    // Animate the title and container on page load
    gsap.from([".page-title", ".policy-container"], {
        opacity: 0,
        y: 30,
        duration: 0.7,
        stagger: 0.2,
        ease: 'power2.out'
    });

    // Stagger-animate each policy section as it scrolls into view
    gsap.from(".policy-section", {
        opacity: 0,
        y: 40,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
            trigger: ".policy-container",
            start: "top 80%",
        }
    });

  }, { scope: mainRef });

  return (
    <div ref={mainRef} className="theme-bg theme-text min-h-screen py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <section className="max-w-4xl mx-auto">
        <div className="page-title mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Privacy <span className="theme-text-accent">Policy</span>
          </h1>
          <p className="theme-text-secondary">Last updated: {lastUpdated}</p>
        </div>

        <div className="policy-container border-2 border-dashed theme-border-color rounded p-8 md:p-12 space-y-10">
          {policySections.map((section, idx) => (
            <>
            <section key={section.title} className="policy-section">
              <div className="flex items-center gap-4 mb-4">
                <div className="theme-text-accent">{section.icon}</div>
                <h2 className="text-2xl font-semibold theme-text">{section.title}</h2>
              </div>
              <div className="theme-text-secondary leading-relaxed">
                {section.content}
              </div>
            </section>
            {idx !== policySections.length - 1 && <div className="border-2 border-dashed theme-border-color"/>}
            </>
          ))}
        </div>
      </section>
    </div>
  );
}