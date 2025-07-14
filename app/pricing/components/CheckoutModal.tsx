"use client"

import { useState } from "react"
import { Dialog } from "@headlessui/react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check, CreditCard, User, Mail } from "lucide-react"
import { Plan, BillingCycle } from "@/lib/index"

interface CheckoutModalProps {
  plan: Plan
  billingCycle: BillingCycle
  onClose: () => void
}

export default function CheckoutModal({ plan, billingCycle, onClose }: CheckoutModalProps) {
  const [step, setStep] = useState<"overview" | "checkout">("overview")

  const price = plan.price[billingCycle]
  const period = billingCycle === "monthly" ? "/month" : "/year"

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  }

  const stepVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      transition: { duration: 0.3, ease: 'easeIn' }
    })
  };

  return (
    <AnimatePresence>
      <Dialog
        static
        open={true}
        onClose={onClose}
        className="relative z-50"
      >
        {/* The backdrop, rendered as a fixed sibling to the panel container */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50"
          aria-hidden="true"
        />

        {/* Full-screen container to center the panel */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel
            as={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="w-full max-w-md rounded-2xl theme-bg p-6 overflow-hidden"
          >
            <div className="flex justify-between items-center mb-4">
              <Dialog.Title className="text-xl font-bold theme-text">
                {step === "overview" ? "Plan Overview" : "Complete Purchase"}
              </Dialog.Title>
              <button onClick={onClose} className="p-1 rounded-full hover:theme-bg-subtle">
                <X size={24} className="theme-text" />
              </button>
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {step === "overview" && (
                <motion.div
                  key="overview"
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={-1}
                  variants={stepVariants}
                >
                  <div className="theme-bg-subtle p-4 rounded-lg mb-6">
                    <h3 className="text-lg font-semibold theme-text">{plan.name} Plan</h3>
                    <p className="text-3xl font-bold theme-text">{price}<span className="text-base font-normal theme-text-secondary">{price !== 'Free' && period}</span></p>
                  </div>
                  <p className="font-semibold mb-3 theme-text">Features included:</p>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3">
                        <Check size={20} className="text-green-500 flex-shrink-0" />
                        <span className="theme-text-secondary">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setStep("checkout")}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Confirm & Proceed to Checkout
                  </button>
                </motion.div>
              )}

              {step === 'checkout' && (
                <motion.div
                  key="checkout"
                  initial="enter"
                  animate="center"
                  exit="exit"
                  custom={1}
                  variants={stepVariants}
                >
                  <form onSubmit={(e) => { e.preventDefault(); alert('Payment Successful!'); onClose(); }}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="text-sm font-medium theme-text-secondary">Full Name</label>
                        <div className="relative mt-1">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" size={18}/>
                          <input type="text" id="name" required className="w-full pl-10 pr-4 py-2 rounded-lg theme-bg-subtle theme-text border theme-border focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Jane Doe" />
                        </div>
                      </div>
                       <div>
                        <label htmlFor="email" className="text-sm font-medium theme-text-secondary">Email Address</label>
                        <div className="relative mt-1">
                           <Mail className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" size={18}/>
                          <input type="email" id="email" required className="w-full pl-10 pr-4 py-2 rounded-lg theme-bg-subtle theme-text border theme-border focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="jane.doe@example.com" />
                        </div>
                      </div>
                       <div>
                        <label htmlFor="card" className="text-sm font-medium theme-text-secondary">Card Details</label>
                        <div className="relative mt-1">
                           <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 theme-text-secondary" size={18}/>
                          <input type="text" id="card" required className="w-full pl-10 pr-4 py-2 rounded-lg theme-bg-subtle theme-text border theme-border focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Card Number" />
                        </div>
                      </div>
                    </div>
                     <div className="flex items-center justify-between mt-8">
                       <button
                         type="button"
                         onClick={() => setStep('overview')}
                         className="font-semibold theme-text hover:text-blue-600"
                       >
                         Back
                       </button>
                       <button
                         type="submit"
                         className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                       >
                         Pay {price}
                       </button>
                     </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </Dialog.Panel>
        </div>
      </Dialog>
    </AnimatePresence>
  )
}
