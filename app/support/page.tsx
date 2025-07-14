"use client"

import { Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Disclosure } from "@headlessui/react"
import { Mail, MessageCircle, HelpCircle, Clock, ChevronDown, Send } from "lucide-react"

// Framer Motion Variants for animations
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.15,
      duration: 0.6,
      ease: "easeOut",
    },
  }),
}

const faqItems = [
  {
    question: "How does AI test generation work?",
    answer: "Our AI analyzes your curriculum and learning objectives to generate relevant, high-quality questions tailored to your students' level and needs. You can specify topics, difficulty, and question formats.",
  },
  {
    question: "Can I customize the generated questions?",
    answer: "Yes, absolutely! You have full control. You can edit, modify, or completely rewrite any AI-generated questions to perfectly match your specific requirements and teaching style.",
  },
  {
    question: "Is student data secure?",
    answer: "Security is our top priority. We use enterprise-grade encryption and comply with educational privacy standards like FERPA and GDPR to protect all student and educator information.",
  },
  {
    question: "What question types are supported?",
    answer: "KwizKit supports a wide range of question types, including multiple choice, true/false, short answer, essay questions, fill-in-the-blank, matching, and we are continuously adding more.",
  },
]

export default function SupportPage() {
  const handleScrollToContact = (e) => {
    e.preventDefault();
    document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="theme-bg theme-text min-h-screen py-16 md:py-24 px-6">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={sectionVariants}
        custom={1}
        className="max-w-4xl mx-auto"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How Can We <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Help?</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get the support you need to make the most of KwizKit.
          </p>
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          variants={sectionVariants}
          custom={2}
          className="grid md:grid-cols-2 gap-8 mb-16"
        >
          {/* Email Support Card */}
          <motion.a
            href="#contact-form"
            onClick={handleScrollToContact}
            whileHover={{ y: -5, scale: 1.02 }}
            className="block bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-transparent hover:shadow-blue-500/10 transition-shadow duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Email Support</h3>
                <p className="text-gray-600 dark:text-gray-400">Response within 24 hours</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Best for detailed questions. Send us your inquiry and we'll provide a thorough response.
            </p>
          </motion.a>

          {/* Live Chat Card */}
          <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg shadow-transparent hover:shadow-blue-500/10 transition-shadow duration-300"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle size={24} />
              </div>
              <div>
                <h3 className="text-xl font-semibold">Live Chat</h3>
                <p className="text-gray-600 dark:text-gray-400">Available during business hours</p>
              </div>
            </div>
            <p className="text-gray-700 dark:text-gray-300">
              Get instant help for quick questions from our support team.
            </p>
          </motion.div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          custom={3}
          className="bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl p-8 md:p-12 mb-16 border border-gray-200/50 dark:border-gray-700/50"
        >
          <div className="flex items-center gap-4 mb-8">
            <HelpCircle className="text-blue-600" size={32} />
            <h2 className="text-2xl md:text-3xl font-semibold">Frequently Asked Questions</h2>
          </div>

          <div className="w-full space-y-4">
            {faqItems.map((item, i) => (
              <Disclosure key={i} as="div" className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                {({ open }) => (
                  <>
                    <Disclosure.Button className="flex w-full justify-between items-center py-4 text-left text-lg font-medium theme-text hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                      <span>{item.question}</span>
                      <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.3 }}>
                        <ChevronDown className="h-5 w-5" />
                      </motion.div>
                    </Disclosure.Button>
                    <AnimatePresence>
                      {open && (
                        <Disclosure.Panel
                          static
                          as={motion.div}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          className="pb-4 pr-4 text-gray-600 dark:text-gray-300"
                        >
                          {item.answer}
                        </Disclosure.Panel>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </Disclosure>
            ))}
          </div>
        </motion.div>

        {/* Contact Form Section */}
        <motion.div
          id="contact-form"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={sectionVariants}
          custom={4}
          className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-700/50 shadow-xl shadow-blue-500/5"
        >
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">Send Us a Message</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <input
                type="email"
                placeholder="Your Email"
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>
            <input
              type="text"
              placeholder="Subject"
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
            <textarea
              placeholder="Your Message"
              rows={5}
              className="w-full p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            ></textarea>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              <Send size={16} />
              Send Message
            </motion.button>
          </form>
        </motion.div>

        {/* Support Hours Banner */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.8 }}
          variants={sectionVariants}
          custom={5}
          className="mt-12 p-4 bg-blue-100/50 dark:bg-blue-900/30 rounded-lg flex items-center justify-center gap-3 text-center"
        >
          <Clock className="text-blue-600 dark:text-blue-300" size={20} />
          <p className="text-blue-800 dark:text-blue-200">
            <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
          </p>
        </motion.div>
      </motion.section>
    </div>
  )
}
