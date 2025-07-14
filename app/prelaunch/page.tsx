"use client"

import { useState, Fragment } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, Transition } from "@headlessui/react"
import { X, MessageCircle, Send, Sparkles, Database, Brain, BarChart3, Users, ChevronRight, Mail, User, Github, Twitter } from "lucide-react"

// Framer Motion Variants for animations
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
}

const featureGridVariants = {
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
}

const featureCardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function PrelaunchPage() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [message, setMessage] = useState("")
  const [email, setEmail] = useState("")
  const [name, setName] = useState("")

  const mockMessages = [
    { type: "bot", text: "Hi! I'm KwizKit AI. How can I help you create better assessments?" },
    { type: "user", text: "Can you help me create a math quiz?" },
    { type: "bot", text: "I can generate math questions for any grade level. What topic would you like to focus on?" },
    { type: "user", text: "Algebra for 9th graders" },
    {
      type: "bot",
      text: "Perfect! I'll create algebra questions covering linear equations, inequalities, and graphing. Would you like multiple choice or open-ended questions?",
    },
  ]

  const features = [
    {
      icon: <Sparkles className="w-6 h-6" />,
      title: "AI Test Generation and vetting",
      description: "Create sophisticated assessments with AI-powered question generation tailored to your curriculum. Vet student entries with AI",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Student Distribution",
      description: "Seamlessly distribute assessments via secure portals with time controls and anti-cheating measures.",
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics & Grading",
      description: "Get instant performance analytics, automated grading, and detailed feedback to improve outcomes.",
    },
    {
      icon: <Database className="w-6 h-6" />,
      title: "Storage",
      description: "Effortlessly store your tests & test results and export to your freffered format.",
    },
  ]

  return (
    <div className="min-h-screen theme-bg theme-text">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-indigo-50/10 to-purple-50/20 dark:from-blue-900/10 dark:via-indigo-900/5 dark:to-purple-900/10"></div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="relative max-w-7xl mx-auto px-6 py-24 md:py-32"
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            {/* Content */}
            <div className="flex-1 text-center lg:text-left">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-full text-sm font-medium mb-8"
              >
                <Sparkles className="w-4 h-4" />
                Coming Soon
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  KwizKit
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl font-normal">is launching soon</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-xl md:text-2xl mb-12 text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Revolutionary AI-powered test creation, intelligent grading, and comprehensive analytics for the modern educator.
              </motion.p>

              {/* Build Progress */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="flex items-center justify-center lg:justify-start"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-16 h-16">
                    <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-gray-200 dark:text-gray-700"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <motion.path
                        className="text-blue-600"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                        strokeLinecap="round"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        initial={{ strokeDasharray: "0, 100" }}
                        animate={{ strokeDasharray: "30, 100" }}
                        transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-sm font-semibold text-blue-600">30%</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-600 dark:text-gray-400">Build Progress</p>
                    <p className="text-xs text-gray-500">Development in progress</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Waitlist Form */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="flex-shrink-0 w-full max-w-md lg:max-w-sm"
            >
              <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-2xl shadow-blue-500/10">
                <h2 className="text-2xl font-semibold mb-6 theme-text text-center">Join the Waitlist</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Full Name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      className="w-full pl-11 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                      placeholder="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Get Early Access
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-20 px-6"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 theme-text">
              How KwizKit Will Transform
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Your Teaching</span>
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of educational assessment with our comprehensive suite of AI-powered tools.
            </p>
          </div>

          <motion.div
            variants={featureGridVariants}
            className="grid lg:grid-cols-4 md:grid-cols-2 gap-8"
          >
            {features.map((feature) => (
              <motion.div
                key={feature.title}
                variants={featureCardVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 shadow-lg shadow-transparent hover:shadow-blue-500/10 h-full flex"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-xl flex items-center justify-center mb-5 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold mb-3 theme-text transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Social Links Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.5 }}
        variants={sectionVariants}
        className="py-20 px-6"
      >
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 theme-text">Stay Connected</h2>
          <p className="text-lg mb-8 text-gray-600 dark:text-gray-300">
            Follow our development journey and be the first to know when we launch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <motion.a
              href="https://github.com/whoshnri"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex w-full sm:w-auto items-center justify-center gap-3 bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 px-6 py-3 rounded-lg transition-all"
            >
              <Github className="w-5 h-5" />
              <span className="font-medium">GitHub</span>
            </motion.a>
            <motion.a
              href="https://x.com/xyz_07hb"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex w-full sm:w-auto items-center justify-center gap-3 bg-gray-200/50 dark:bg-gray-800/50 hover:bg-gray-200 dark:hover:bg-gray-800 px-6 py-3 rounded-lg transition-all"
            >
              <Twitter className="w-5 h-5" />
              <span className="font-medium">Follow on X</span>
            </motion.a>
          </div>
          <div className="flex items-center justify-center gap-4">
            <div className="flex -space-x-5">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 border-2 border-white dark:border-gray-950 flex items-center justify-center text-xs text-white font-bold">
                  <User className="w-4 h-4"/>
                </div>
              ))}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">37+ educators have joined so far</span>
          </div>
        </div>
      </motion.section>

      {/* Floating Chat Button */}
      <motion.button
        onClick={() => setIsChatOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-full shadow-2xl hover:shadow-blue-500/25 transition-all flex items-center justify-center z-40"
      >
        <MessageCircle size={24} />
      </motion.button>

      {/* Chat Modal with Headless UI & Framer Motion */}
      <AnimatePresence>
            <Transition show={isChatOpen}>
          <Dialog static as={motion.div} className="relative z-50" open={isChatOpen} onClose={() => setIsChatOpen(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel as={motion.div}
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md h-[90vh] max-h-[600px] flex flex-col border border-gray-200/50 dark:border-gray-700/50"
              >
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <Dialog.Title className="font-semibold theme-text">KwizKit AI Assistant</Dialog.Title>
                      <p className="text-sm text-gray-500">Always here to help</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsChatOpen(false)}
                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {mockMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${ msg.type === "user" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-md" : "bg-gray-100 dark:bg-gray-800 theme-text rounded-bl-md" }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm bg-white dark:bg-gray-800 theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg">
                      <Send size={16} />
                    </motion.button>
                  </div>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>
          </Transition>
      </AnimatePresence>
    </div>
  )
}
