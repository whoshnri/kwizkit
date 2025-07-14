"use client"

import { motion } from "framer-motion"
import { Shield, Database, BookOpen, Clock, Mail, Info, FileText } from "lucide-react"

// Framer Motion Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
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
        <ul>
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
        <ul>
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
        contact us at <a href="mailto:privacy@kwizkit.com">privacy@kwizkit.com</a> or through our support page.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="theme-bg theme-text min-h-screen py-16 md:py-24 px-6">
      <motion.section
        initial="hidden"
        animate="visible"
        variants={itemVariants}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-12 text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Privacy <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Policy</span>
          </motion.h1>
          <p className="text-gray-500 dark:text-gray-400">Last updated: {lastUpdated}</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-200/50 dark:border-gray-700/50 space-y-10"
        >
          {policySections.map((section) => (
            <motion.section key={section.title} variants={itemVariants}>
              <div className="flex items-center gap-4 mb-4">
                <div className="text-blue-600 dark:text-blue-400">{section.icon}</div>
                <h2 className="text-2xl font-semibold theme-text">{section.title}</h2>
              </div>
              <div className="prose prose-gray dark:prose-invert max-w-none prose-a:text-blue-600 hover:prose-a:text-blue-500 dark:prose-a:text-blue-400 dark:hover:prose-a:text-blue-300 prose-ul:list-disc prose-ul:pl-6 prose-li:my-1">
                {section.content}
              </div>
            </motion.section>
          ))}
        </motion.div>
      </motion.section>
    </div>
  )
}
