"use client";

import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, ArrowRight } from "lucide-react";
import CheckoutModal from "./components/CheckoutModal";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Plan = {
  name: string,
  description : string,
  price : {monthly : string , annually : string},
  priceIds : {
    monthly : string,
    annually : string
  },
  features : string[],
  popular? : boolean

}

type BillingCycle = "monthly" | "annually"

const plans: Plan[] = [
  {
    name: "Free",
    description: "Perfect for trying out KwizKit",
    price: { monthly: "Free", annually: "Free" },
    priceIds: { monthly: "price_free_monthly", annually: "price_free_annually" },
    features: ["5 tests per month", "Basic question types", "Up to 30 students", "Email support"],
  },
  {
    name: "Tutor+",
    description: "Ideal for individual educators",
    price: { monthly: "$19", annually: "$180" },
    priceIds: { monthly: "price_tutor_monthly", annually: "price_tutor_annually" },
    popular: true,
    features: ["Unlimited tests", "All question types", "Up to 150 students", "Priority support", "Advanced analytics"],
  },
  {
    name: "Enterprise",
    description: "For schools and institutions",
    price: { monthly: "Custom", annually: "Custom" },
    priceIds: { monthly: "price_enterprise_monthly", annually: "price_enterprise_annually" },
    features: ["Everything in Tutor+", "Unlimited students", "Admin dashboard", "SSO integration", "Dedicated support"],
  },
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly");
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // GSAP animations for toggle and price changes
  useGSAP(() => {
    const isAnnual = billingCycle === "annually";
    // Animate toggle handle
    gsap.to(".toggle-handle", {
      x: isAnnual ? "1.6rem" : "0.15rem",
      duration: 0.3,
      ease: "power2.inOut",
    });
    // Animate save badge
    gsap.to(".save-badge", {
      opacity:  1 ,
      scale:  1 ,
      duration: 0.3,
      ease: "power2.out",
      repeat: 1,
      yoyo: true,
    });

    // Animate price text switch
    const prices = gsap.utils.toArray<HTMLSpanElement>(".price-text");
    prices.forEach(priceEl => {
        const planName = priceEl.dataset.plan;
        const plan = plans.find(p => p.name === planName);
        if (plan) {
            const newPrice = plan.price[billingCycle];
            // Simple crossfade animation
            gsap.to(priceEl, {
                opacity: 0,
                duration: 0.15,
                onComplete: () => {
                    priceEl.textContent = newPrice;
                    gsap.to(priceEl, { opacity: 1, duration: 0.15 });
                }
            });
        }
    });

  }, { dependencies: [billingCycle], scope: containerRef });

  // GSAP scroll-triggered animations for cards
  useGSAP(() => {
    gsap.from(".pricing-card", {
      opacity: 0,
      y: 50,
      stagger: 0.1,
      duration: 0.8,
      ease: "power2.out",
      scrollTrigger: {
        trigger: ".pricing-grid",
        start: "top 80%",
      },
    });
  }, { scope: containerRef });


  const handleSelectPlan = (plan: Plan) => {
    if (plan.price.monthly !== "Custom") {
      setSelectedPlan(plan);
    } else {
      window.location.href = "/support"; // Redirect to support for enterprise
    }
  };

  const handleCloseModal = () => setSelectedPlan(null);

  return (
    <>
      <section ref={containerRef} className="theme-bg theme-text w-full py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl theme-text-secondary">Select the perfect plan for your educational needs.</p>
          </div>

          <div className="flex justify-center items-center gap-4 mb-12">
            <span className="font-medium">Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly")}
              className="relative flex items-center h-8 w-14 rounded-md border-2 border-dashed theme-border-color"
            >
              <span className="toggle-handle absolute inline-block h-6 w-6 rounded-sm theme-bg-accent" />
            </button>
            <span className="font-medium">Annually</span>
            <span className="save-badge theme-text-accent text-xs font-semibold ml-2 border border-dashed p-1">{ billingCycle == "annually" ? 'SAVE 20%' : "Best Price"}</span>
          </div>

          <div className="pricing-grid grid sm:grid-cols-1 lg:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`pricing-card relative flex flex-col theme-bg rounded-md p-8 border-2 border-dashed ${
                  plan.popular ? "theme-accent-border-color" : "theme-border-color"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="theme-accent-bg theme-bg text-xs font-semibold px-3 py-1 rounded-md">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex-grow">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="theme-text-secondary mb-6 h-12">{plan.description}</p>

                  <div className="mb-8">
                    <span data-plan={plan.name} className="price-text text-4xl font-extrabold">
                      {plan.price[billingCycle]}
                    </span>
                    {plan.price.monthly !== "Free" && plan.price.monthly !== "Custom" && (
                      <span className="theme-text-secondary">
                        {billingCycle === "monthly" ? "/month" : "/year"}
                      </span>
                    )}
                  </div>

                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check size={20} className="theme-text-accent flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                { false && <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`flex items-center justify-center gap-2 ${
                    plan.popular ? "theme-button-primary" : "theme-button-secondary"
                  }`}
                >
                  <span>{plan.name === "Enterprise" ? "Contact Sales" : "Choose Plan"}</span>
                  {/* <ArrowRight size={16} /> */}
                </button>}
              </div>
            ))}
          </div>
        </div>
      </section>


      {selectedPlan && (
        <CheckoutModal plan={selectedPlan} billingCycle={billingCycle} onClose={handleCloseModal} />
      )}
    </>
  );
}