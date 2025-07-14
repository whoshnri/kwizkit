"use client"

import { useState } from "react"
import Lottie from "lottie-react";
import animationData1 from "../public/lottie/hero.json";
import animationData2 from "../public/lottie/ai.json";
import { motion } from "framer-motion"
import dynamic from "next/dynamic";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import FeedbackSection from "./components/Feedback";
import {
  Sparkles, Database, Brain, BarChart3, Users, ChevronRight,
  User, Github, DollarSign, CheckCircle2, ArrowRight, Twitter, Layers, Edit3, Share2, TrendingUp,  PenSquare
} from "lucide-react"

// globe stuff
const World = dynamic(() => import("@/components/ui/globe").then((m) => m.World), {
  ssr: false,
});


// --- Framer Motion Variants ---
const cardContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.2,
    },
  },
};


const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut", delay },
  }),
};

const cardGridVariants = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};


// --- Main Page Component ---
export default function HomePage() {

  const globeConfig = {
    pointSize: 4,
    globeColor: "#062056",
    showAtmosphere: true,
    atmosphereColor: "#FFFFFF",
    atmosphereAltitude: 0.1,
    emissive: "#062056",
    emissiveIntensity: 0.1,
    shininess: 0.9,
    polygonColor: "rgba(255,255,255,0.7)",
    ambientLight: "#38bdf8",
    directionalLeftLight: "#ffffff",
    directionalTopLight: "#ffffff",
    pointLight: "#ffffff",
    arcTime: 1000,
    arcLength: 0.9,
    rings: 1,
    maxRings: 3,
    initialPosition: { lat: 22.3193, lng: 114.1694 },
    autoRotate: true,
    autoRotateSpeed: 0.5,
  };
  const colors = ["#06b6d4", "#3b82f6", "#6366f1"];
  const sampleArcs = [
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -22.9068,
      endLng: -43.1729,
      arcAlt: 0.1,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 1,
      startLat: 28.6139,
      startLng: 77.209,
      endLat: 3.139,
      endLng: 101.6869,
      arcAlt: 0.2,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },
    {
      order: 1,
      startLat: -19.885592,
      startLng: -43.951191,
      endLat: -1.303396,
      endLng: 36.852443,
      arcAlt: 0.5,
      color: colors[Math.floor(Math.random() * (colors.length - 1))],
    },

  ];

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [feedback, setFeedback] = useState("");

  const socialProof = [
    { value: "150+", label: "Tutors & Educators" },
    { value: "500+", label: "Tests Created" },
    { value: "10k+", label: "Students Graded" },
  ];

  const plans = [
  {
    name: 'Hobby',
    price: '$0',
    frequency: '/ forever',
    description: 'For individuals and hobbyists starting out.',
    features: [
      '1 Project',
      'Basic Analytics',
      'Community Support',
      'Up to 100 students',
    ],
    cta: 'Start for Free',
    isPopular: false,
  },
  {
    name: 'Pro',
    price: '$15',
    frequency: '/ month',
    description: 'For professional educators and small teams.',
    features: [
      'Unlimited Projects',
      'Advanced Analytics',
      'Priority Email Support',
      'Up to 1,000 students',
      'Custom Branding',
    ],
    cta: 'Choose Pro',
    isPopular: true,
  },
  {
    name: 'Team',
    price: 'Custom',
    frequency: '',
    description: 'For schools, universities, and organizations.',
    features: [
      'Everything in Pro',
      'Dedicated Account Manager',
      'Single Sign-On (SSO)',
      'Bulk Enrollment',
      'API Access',
    ],
    cta: 'Contact Sales',
    isPopular: false,
  },
];

  const features = [
    { icon: <Sparkles className="w-6 h-6" />, title: "AI Test Generation", description: "Create tailored assessments with AI-powered question generation and vetting." },
    { icon: <Users className="w-6 h-6" />, title: "Secure Distribution", description: "Seamlessly distribute tests via secure portals with time controls and anti-cheating measures." },
    { icon: <BarChart3 className="w-6 h-6" />, title: "Insightful Analytics", description: "Get instant analytics, automated grading, and detailed feedback to improve outcomes." },
    { icon: <Database className="w-6 h-6" />, title: "Cloud Storage", description: "Effortlessly store tests & results. Export to your preferred format anytime." },
  ];

  const howItWorksSteps = [
    { icon: <User className="w-6 h-6" />, title: "Create Your Account", description: "Sign up for free in seconds." },
    { icon: <Layers className="w-6 h-6" />, title: "Craft Your Test", description: "Upload questions or use KkAI to generate them instantly." },
    { icon: <Edit3 className="w-6 h-6" />, title: "Customize & Review", description: "Set time limits, security options, and review the test." },
    { icon: <Share2 className="w-6 h-6" />, title: "Publish & Distribute", description: "Share with your student database via a secure link." },
    { icon: <TrendingUp className="w-6 h-6" />, title: "Analyze Results", description: "Receive instant, detailed analytics and export reports." },
  ];

  return (
    <div className="min-h-screen theme-bg theme-text">

      {/* Hero Section */}
      <section className="relative min-h-screen overflow-hidden">
        <div className="absolute inset-0  dark:from-blue-900/10 dark:via-indigo-900/5 dark:to-purple-900/10"></div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={sectionVariants}
          className="relative max-w-7xl mx-auto px-6 py-24 md:py-32"
        >
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="flex-1 text-center lg:text-left">
              <motion.h1
                variants={cardVariants}
                className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              >
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  KwizKit
                </span>
                <br />
                <span className="text-3xl md:text-4xl lg:text-5xl font-normal">The Future of Assessment</span>
              </motion.h1>

              <motion.p
                variants={cardVariants}
                className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                Revolutionary AI-powered test creation, intelligent grading, and comprehensive analytics for the modern educator.
              </motion.p>

              <motion.div variants={cardVariants}>
                 <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="py-5 px-10 cursor-pointer rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    Get Started Free
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
              </motion.div>
            </div>

            <motion.div
              variants={cardVariants}
              className="flex-shrink-0 w-full max-w-md lg:w-2/5"
            >
                 {/* Globe Placeholder */}
                <div className="w-full h-full rounded-lg flex items-center justify-center">

                  <Lottie animationData={animationData1} loop={true} autoplay={true} />

                </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Social Proof / Credits Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-16 theme-border border bg-gray-950"
      >
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            variants={cardGridVariants}
            className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center"
          >
            {socialProof.map((item, index) => (
              <motion.div key={index} variants={cardVariants}>
                <p className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  {item.value}
                </p>
                <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">{item.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={sectionVariants}
        className="py-20 px-6 bg-black min-h-screen"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              A Comprehensive Toolkit
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">For Modern Educators</span>
            </h2>
            <p className="text-xl text-white opacity-70 max-w-3xl mx-auto">
              Everything you need to create, distribute, and analyze assessments efficiently.
            </p>
          </div>
            <div className="max-w-7xl mx-auto px-8">
              <HoverEffect items={features} />
            </div>
        </div>
      </motion.section>

      {/* KkAI Showcase Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="py-20 px-6 themebg"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={cardVariants}>
            <span className="inline-flex items-center gap-2 bg-blue-950 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <Brain className="w-4 h-4" />
              Powered by KkAI
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Meet KkAI, The Brains Behind Your Brilliance</h2>
            <p className="text-xl opacity-70 mb-8">
              Our proprietary AI is more than just a question generator. It's a smart assistant that understands educational context, ensures quality, and provides deep insights to help you teach better.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3"><Sparkles className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" /><span><strong>Adaptive Generation:</strong> Creates questions that match your specific curriculum and difficulty levels.</span></li>
              <li className="flex items-start gap-3"><BarChart3 className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" /><span><strong>Intelligent Analytics:</strong> Goes beyond scores to identify learning gaps and conceptual misunderstandings.</span></li>
              <li className="flex items-start gap-3"><Users className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" /><span><strong>Fairness &amp; Vetting:</strong> Helps detect plagiarism and ensures every student gets a fair assessment.</span></li>
            </ul>
            <motion.a
              href="/kkai"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 py-3 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold"
            >
              Learn More About KkAI <ChevronRight className="w-5 h-5" />
            </motion.a>
          </motion.div>
          <motion.div variants={cardVariants} className="flex items-center justify-center">
             {/* Lottie Placeholder */}
            <div
              className="w-full h-full"
            >
              <Lottie animationData={animationData2} loop={true} autoplay={true} />
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works Section */}

    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="py-20  px-6"
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            From Concept to Classroom in Minutes
          </h2>
          <p className="text-xl opacity-70 max-w-3xl mx-auto">
            Our streamlined process makes creating and managing tests simpler than ever.
          </p>
        </div>

        <ul className="timeline timeline-vertical lg:timeline-horizontal z-20 w-full scrollbar-hide mx-auto overflow-x-auto">
          {howItWorksSteps.map((step, index) => (
            <motion.li key={index} variants={cardVariants}>
              {index !== 0 && <hr />}
              <div className="timeline-start font-bold">Step {index + 1}</div>
              <div className="timeline-middle">
                <div className="w-8 h-8 rounded-full flex items-center justify-center">
                  {step.icon}
                </div>
              </div>
              <div className="timeline-end hover:scale-110 duration-300 hover:z-30 hover:-translate-y-1 timeline-box p-5 theme-bg border-none text-center shadow-md ">
                <h3 className="text-lg font-semibold mb-1">{step.title}</h3>
                <p className="text-sm ">{step.description}</p>
              </div>
              {index !== howItWorksSteps.length - 1 && <hr />}
            </motion.li>
          ))}
        </ul>

        <motion.div variants={cardVariants} className="text-center mt-12">
          <motion.a
            href="/auth/authorize"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex  mt-10 items-center gap-2 py-3 px-8 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold text-lg"
          >
            Start Creating Now <ChevronRight className="w-5 h-5" />
          </motion.a>
        </motion.div>
      </div>
    </motion.section>

      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={sectionVariants}
        className="relative py-24 px-6 bg-blue-950 overflow-hidden"
      >
        {/* Globe BG: right-aligned, half-visible */}
        <div className="absolute left-[50%] -translate-x-[50%] h-[1000px] bottom-[-40rem] w-[80%] hidden md:block z-0">
          <World data={sampleArcs} globeConfig={globeConfig} />
        </div>

        {/* Content: centered on top of globe */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-extrabold text-blue-400 leading-tight mb-8">
            Streamlining Education, Everywhere
          </h2>
          <p className="text-xl md:text-2xl text-white max-w-2xl mx-auto">
            Our vision is to expand access to world-class learning tools for every educator on the planet — bridging borders, scaling impact, and transforming classrooms globally.
          </p>
        </div>
      </motion.section>





      {/* Pricing Section */}
     <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={sectionVariants}
      className="relative py-24 px-6 min-h-screen bg-gray-50 dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto z-10 relative">
        {/* --- Section Header --- */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6 tracking-tight text-gray-900 dark:text-white">
            The Right Plan, Wherever You Teach
          </h2>
          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            From solo educators to global institutions, we empower teaching with flexible, affordable pricing. Start free — scale effortlessly.
          </p>
        </div>

        {/* --- Pricing Cards Grid --- */}
        <motion.div
          variants={cardContainerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              className={`relative flex flex-col h-full p-8 rounded-2xl bg-white dark:bg-gray-800/50 shadow-lg ${
                plan.isPopular ? 'border-2 border-blue-500' : 'border border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2">
                  <span className="py-1 px-4 text-sm font-semibold rounded-full bg-blue-500 text-white">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="flex-grow">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{plan.name}</h3>
                <p className="mt-2 text-gray-500 dark:text-gray-400">{plan.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    {plan.price}
                  </span>
                  <span className="text-lg font-medium text-gray-500 dark:text-gray-400">
                    {plan.frequency}
                  </span>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                      <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href="#"
                className={`mt-10 block w-full text-center py-3 px-6 rounded-lg font-semibold text-lg transition-all
                ${
                  plan.isPopular
                    ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>

        {/* --- Final CTA to View All Plans --- */}
        <div className="mt-20 text-center">
            <motion.a
                href="/pricing"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-3 py-4 px-8 rounded-xl bg-transparent text-gray-900 dark:text-white font-semibold text-lg transition-all border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
                <DollarSign className="w-6 h-6" />
                View All Plans & Features
                <ArrowRight className="w-6 h-6" />
            </motion.a>
        </div>
      </div>

      {/* Optional Glow/Blur Decoration */}
      <div className="absolute -bottom-24 right-[-10%] w-[300px] h-[300px] rounded-full bg-blue-500 opacity-20 blur-3xl pointer-events-none"></div>
      <div className="absolute -top-24 left-[-10%] w-[300px] h-[300px] rounded-full bg-indigo-500 opacity-15 blur-3xl pointer-events-none"></div>
    </motion.section>


      {/* Feedback Section */}
      <FeedbackSection/>
    </div>
  )
}
