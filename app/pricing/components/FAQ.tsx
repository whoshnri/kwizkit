"use client"

import { ChevronDown } from "lucide-react"

const faqItems = [
  {
    question: "Can I change my plan later?",
    answer: "Yes, you can upgrade or downgrade your plan at any time from your account dashboard. Prorated charges or credits will be applied automatically.",
  },
  {
    question: "Is there a discount for annual billing?",
    answer: "Absolutely! We offer a 20% discount on all plans when you choose to pay annually. You can select the annual option with the toggle above the pricing table.",
  },
  {
    question: "What happens if I exceed my plan's limits?",
    answer: "For the Free plan, you will be notified and prompted to upgrade if you reach the test or student limit. Paid plans like Tutor+ have unlimited tests.",
  },
  {
    question: "Do you offer support for all plans?",
    answer: "Yes, email support is available for all plans. The Tutor+ and Enterprise plans include priority support for faster response times.",
  },
]

export default function FAQ() {
  return (
    <section className="container mx-auto max-w-3xl py-12 px-4 md:px-6">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
        <p className="text-lg theme-text-secondary mt-2">
          Have questions? We've got answers.
        </p>
      </div>
      <div className="space-y-4">
        {faqItems.map((item, index) => (
          <details
            key={index}
            className="group p-4 rounded-lg theme-bg-subtle"
          >
            <summary className="flex justify-between items-center cursor-pointer font-semibold list-none">
              {item.question}
              <ChevronDown className="group-open:rotate-180 transition-transform duration-300" />
            </summary>
            <p className="mt-4 theme-text-secondary">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
