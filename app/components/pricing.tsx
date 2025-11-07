"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { CTAButton } from "../page";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const PricingSection = () => {
  const scaleRef = useRef<HTMLSpanElement>(null);

  useGSAP(() => {
    const el = scaleRef.current;
    if (!el) return;

    gsap.to(el, {
      scale: 1.2,
      duration: 1.2,
      ease: "power1.inOut",
      repeat: -1,
      yoyo: true,
      scrollTrigger: {
        trigger: el,
        start: "top 85%",
        toggleActions: "play pause resume reset",
      },
    });
  }, []);

  return (
    <section className="py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold theme-text">
          Start free, then{" "}
          <span ref={scaleRef} className="inline-block theme-text-accent origin-center">
            Scale
          </span>
        </h2>
        <p className="max-w-2xl mx-auto mt-4 text-lg theme-text-secondary">
          Choose the plan that's right for you.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Basic Plan */}
        <div className="border-2 border-dashed theme-border-color rounded-md p-8 flex flex-col">
          <h3 className="text-2xl font-semibold theme-text">Basic</h3>
          <p className="text-4xl font-bold theme-text-accent my-4">
            $0<span className="text-lg theme-text-secondary">/month</span>
          </p>
          <ul className="space-y-3 theme-text-secondary flex-grow">
            <li>✓ 3 Quizzes per Month</li>
            <li>✓ Basic Analytics</li>
            <li>✓ Community Support</li>
          </ul>
          <div className="mt-8">
            <CTAButton href="/auth/register">Get Started</CTAButton>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="border-2 scale-y-110 border-dashed theme-accent-border-color rounded-md p-8 flex flex-col relative">
          <span className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 px-3 py-1 text-sm font-semibold theme-accent-bg theme-bg rounded-full">
            Most Popular
          </span>
          <h3 className="text-2xl font-semibold theme-text">Pro</h3>
          <p className="text-4xl font-bold theme-text-accent my-4">
            $29<span className="text-lg theme-text-secondary">/month</span>
          </p>
          <ul className="space-y-3 theme-text-secondary flex-grow">
            <li>✓ Unlimited Quizzes</li>
            <li>✓ Advanced Analytics</li>
            <li>✓ Priority Email Support</li>
            <li>✓ Custom Certifications</li>
          </ul>
          <div className="mt-8">
            <CTAButton href="/pricing">Choose Pro</CTAButton>
          </div>
        </div>

        {/* Enterprise Plan */}
        <div className="border-2 border-dashed theme-border-color rounded-md p-8 flex flex-col">
          <h3 className="text-2xl font-semibold theme-text">Enterprise</h3>
          <p className="text-4xl font-bold theme-text-accent my-4">
            Contact<span className="text-lg theme-text-secondary"> Us</span>
          </p>
          <ul className="space-y-3 theme-text-secondary flex-grow">
            <li>✓ All Pro Features</li>
            <li>✓ API Access</li>
            <li>✓ Dedicated Support</li>
            <li>✓ Custom Integrations</li>
          </ul>
          <div className="mt-8">
            <CTAButton href="/support">Contact Sales</CTAButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
