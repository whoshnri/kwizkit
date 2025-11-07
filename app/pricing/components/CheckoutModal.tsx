"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { X, Check, CreditCard, User, Mail, ArrowLeft } from "lucide-react";
import { Plan, BillingCycle } from "@/lib/index";

interface CheckoutModalProps {
  plan: Plan;
  billingCycle: BillingCycle;
  onClose: () => void;
}

export default function CheckoutModal({ plan, billingCycle, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<"overview" | "checkout">("overview");

  // Refs for all animated elements
  const modalRef = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overviewStepRef = useRef<HTMLDivElement>(null);
  const checkoutStepRef = useRef<HTMLDivElement>(null);

  const price = plan.price[billingCycle];
  const period = billingCycle === "monthly" ? "/month" : "/year";

  // GSAP animation for modal entrance and initial height
  useGSAP(() => {
    // Entrance animation
    gsap.fromTo(backdropRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" });
    gsap.fromTo(modalRef.current, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: 0.3, ease: "power2.out" });

    // Set initial container height based on the overview step
    if (overviewStepRef.current && containerRef.current) {
      gsap.set(containerRef.current, { height: overviewStepRef.current.offsetHeight });
    }
  }, []);

  // GSAP animation for step and height transitions
  useGSAP(() => {
    const isCheckout = step === 'checkout';
    const targetStep = isCheckout ? checkoutStepRef.current : overviewStepRef.current;
    if (!targetStep || !containerRef.current) return;

    // Get the height of the content we are transitioning to
    const targetHeight = targetStep.offsetHeight;

    // Animate the height and the slide simultaneously
    const tl = gsap.timeline();
    tl.to(containerRef.current, {
        height: targetHeight,
        duration: 0.4,
        ease: "power2.inOut"
      })
      .to(".overview-step", { xPercent: isCheckout ? -100 : 0, duration: 0.4, ease: "power2.inOut" }, "<")
      .to(".checkout-step", { xPercent: isCheckout ? -100 : 0, duration: 0.4, ease: "power2.inOut" }, "<");

  }, { dependencies: [step], scope: modalRef });

  // GSAP-powered close animation
  const handleClose = () => {
    gsap.to(modalRef.current, { opacity: 0, scale: 0.95, duration: 0.2, ease: "power2.in", onComplete: onClose });
    gsap.to(backdropRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" });
  };

  return (
    <div className="relative z-50">
      <div ref={backdropRef} className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div ref={modalRef} className="w-full max-w-md rounded-md theme-bg border-2 border-dashed theme-border-color">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold theme-text">
                {step === "overview" ? "Plan Overview" : "Complete Purchase"}
              </h2>
              <button onClick={handleClose} className="p-1 rounded-md hover:theme-bg-subtle">
                <X size={24} className="theme-text-secondary" />
              </button>
            </div>

            <div ref={containerRef} className="relative overflow-hidden">
              {/* Step 1: Overview */}
              <div ref={overviewStepRef} className="overview-step">
                <div className="theme-bg-subtle p-4 rounded-md mb-6 border-2 border-dashed theme-border-color">
                  <h3 className="text-lg font-semibold theme-text">{plan.name} Plan</h3>
                  <p className="text-3xl font-bold theme-text">
                    {price}
                    <span className="text-base font-normal theme-text-secondary">
                      {price !== "Free" && period}
                    </span>
                  </p>
                </div>
                <p className="font-semibold mb-3 theme-text">Features included:</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check size={20} className="theme-text-accent flex-shrink-0" />
                      <span className="theme-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => setStep("checkout")} className="theme-button-primary w-full">
                  Confirm & Proceed
                </button>
              </div>

              {/* Step 2: Checkout Form */}
              <div ref={checkoutStepRef} className="checkout-step absolute top-0 left-0 w-full translate-x-full">
                <form onSubmit={(e) => { e.preventDefault(); alert("Payment Successful!"); handleClose(); }}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="text-sm font-medium theme-text-secondary block mb-1">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" size={18} />
                        <input type="text" id="name" required className="theme-input pl-10" placeholder="Jane Doe" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="email" className="text-sm font-medium theme-text-secondary block mb-1">Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" size={18} />
                        <input type="email" id="email" required className="theme-input pl-10" placeholder="jane.doe@example.com" />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="card" className="text-sm font-medium theme-text-secondary block mb-1">Card Details</label>
                       <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" size={18} />
                        <input type="text" id="card" required className="theme-input pl-10" placeholder="Card Number" />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-8 gap-4">
                    <button type="button" onClick={() => setStep("overview")} className="theme-border-color border-2 border-dashed py-2 rounded flex-1 flex items-center justify-center">
                      <ArrowLeft size={16} className="mr-2" />
                      Back
                    </button>
                    <button type="submit" className="theme-button-primary flex-1">
                      Pay {price}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}