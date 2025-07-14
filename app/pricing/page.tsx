"use client"

import { useState } from "react"
import { Check, ArrowRight } from "lucide-react"
import CheckoutModal from "./components/CheckoutModal"
import FAQ from "./components/FAQ"
import { Plan, BillingCycle } from "@/lib/index"

// Updated plan data with monthly/annual pricing
const plans: Plan[] = [
  {
    name: "Free",
    description: "Perfect for trying out KwizKit",
    price: {
      monthly: "Free",
      annually: "Free",
    },
    priceIds: { // For Stripe or other payment gateways
      monthly: "price_free_monthly",
      annually: "price_free_annually"
    },
    features: [
      "Up to 5 tests per month",
      "Basic question types",
      "Up to 30 students",
      "Email support",
      "Basic analytics",
    ],
  },
  {
    name: "Tutor+",
    description: "Ideal for individual educators",
    price: {
      monthly: "$19",
      annually: "$180",
    },
    priceIds: {
      monthly: "price_tutor_monthly",
      annually: "price_tutor_annually"
    },
    popular: true,
    features: [
      "Unlimited tests",
      "All question types",
      "Up to 150 students",
      "Priority support",
      "Advanced analytics",
      "Custom branding",
      "Export results",
    ],
  },
  {
    name: "Enterprise",
    description: "For schools and institutions",
    price: {
      monthly: "Custom",
      annually: "Custom",
    },
    priceIds: {
      monthly: "price_enterprise_monthly",
      annually: "price_enterprise_annually"
    },
    features: [
      "Everything in Tutor+",
      "Unlimited students",
      "Admin dashboard",
      "SSO integration",
      "API access",
      "Dedicated support",
      "Custom integrations",
    ],
  },
]

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<BillingCycle>("monthly")
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null)

  const handleSelectPlan = (plan: Plan) => {
    if (plan.price.monthly !== "Custom") {
      setSelectedPlan(plan)
    } else {
      // For "Enterprise", you might want to redirect to a contact page
      // or open a different type of modal (e.g., a contact form).
      console.log("Contacting sales for Enterprise plan...")
      window.location.href = "#contact-sales"
    }
  }

  const handleCloseModal = () => {
    setSelectedPlan(null)
  }

  return (
    <>
      <section className="theme-bg theme-text w-full py-12 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
              Choose Your Plan
            </h1>
            <p className="text-xl theme-text-secondary">
              Select the perfect plan for your educational needs.
            </p>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <span className="font-medium">Monthly</span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "annually" : "monthly")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === "annually" ? "bg-blue-600" : "bg-gray-300 dark:bg-gray-700"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === "annually" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="font-medium">Annually</span>
            <span className="bg-green-100 text-green-800 text-xs font-semibold ml-2 px-2.5 py-0.5 rounded-full dark:bg-green-900 dark:text-green-300">
              SAVE 20%
            </span>
          </div>

          <div className="grid sm:grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative theme-bg  rounded-2xl p-8 shadow-lg border theme-border transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.popular ? "border-blue-600 border-2" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="flex-grow ">
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="theme-text-secondary mb-6 h-12">{plan.description}</p>

                  <div className="mb-8">
                    <span className="text-4xl font-extrabold">
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
                        <Check size={20} className="text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                    plan.popular
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "theme-bg-subtle theme-text hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  <span>{plan.name === "Enterprise" ? "Contact Sales" : "Choose Plan"}</span>
                  <ArrowRight size={16}/>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQ />

      <div id="contact-sales" className="text-center my-16 md:my-24 p-8 theme-bg-subtle rounded-lg max-w-4xl mx-auto">
        <h3 className="text-2xl font-semibold mb-2">Need a custom solution?</h3>
        <p className="theme-text-secondary mb-6">
          Contact our team to discuss enterprise features and volume discounts.
        </p>
        <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
          Contact Sales
        </button>
      </div>

      {selectedPlan && (
        <CheckoutModal
          plan={selectedPlan}
          billingCycle={billingCycle}
          onClose={handleCloseModal}
        />
      )}
    </>
  )
}
