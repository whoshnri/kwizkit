"use client";

import { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import  banner from "@/public/banner.png";
import {
  X,
  MessageCircle,
  Send,
  Sparkles,
  Database,
  BarChart3,
  Users,
  ChevronRight,
  Mail,
  User,
  Github,
  Twitter,
  Brain,
  Loader,
} from "lucide-react";
import { FaHeartbeat } from "react-icons/fa";
import { TbHeartCheck } from "react-icons/tb";
import { MdRocketLaunch } from "react-icons/md";
import { addToWaitList } from "../actions/waitinglist";
import { toast } from "sonner";
import { set } from "lodash";
import Image from "next/image";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// --- Type Definitions ---
interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}
interface ChatMessage {
  type: "bot" | "user";
  text: string;
}

// --- Component Data ---
const features: Feature[] = [
  {
    icon: <Sparkles size={24} />,
    title: "AI Test Generation",
    description:
      "Create tailored assessments with AI-powered question generation and vetting.",
  },
  {
    icon: <Users size={24} />,
    title: "Student Distribution",
    description:
      "Seamlessly distribute assessments via secure portals with time controls.",
  },
  {
    icon: <BarChart3 size={24} />,
    title: "Analytics & Grading",
    description:
      "Get instant performance analytics and automated grading to improve outcomes.",
  },
  {
    icon: <Database size={24} />,
    title: "Secure Storage",
    description:
      "Effortlessly store your tests, results, and export them in your preferred format.",
  },
];
const mockMessages: ChatMessage[] = [
  {
    type: "bot",
    text: "Hi! I'm KwizKit AI. How can I help you create better assessments?",
  },
  { type: "user", text: "Can you help me create a math quiz?" },
  {
    type: "bot",
    text: "Of course! What topic and grade level are you focusing on?",
  },
];

export default function PrelaunchPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const chatModalRef = useRef<HTMLDivElement>(null);
  const chatBackdropRef = useRef<HTMLDivElement>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [isOnWaitlist, setIsOnWaitList] = useState<boolean>(false);

  useEffect(() => {
    const token = localStorage.getItem("isOnWaitlist");
    if (token) {
      if (token === "true") setIsOnWaitList(true);
      else setIsOnWaitList(false);
    } else {
      setIsOnWaitList(false);
    }
  }, [isOnWaitlist]);

  useGSAP(
    () => {
      gsap.utils
        .toArray<HTMLElement>(".animated-section")
        .forEach((section) => {
          gsap.from(section, {
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: { trigger: section, start: "top 85%" },
          });
        });

      // Animate build progress ring to 50%
      gsap.to(".progress-ring", {
        strokeDashoffset: 30, // 100 - 50 (50% progress)
        duration: 1.5,
        ease: "power2.inOut",
        scrollTrigger: { trigger: ".progress-ring", start: "top 90%" },
      });
      gsap.to(".progress-text", {
        textContent: 70, // Animate text to 70
        duration: 1.5,
        roundProps: "textContent",
        ease: "power2.inOut",
        scrollTrigger: { trigger: ".progress-text", start: "top 90%" },
      });
    },
    { scope: containerRef }
  );

  useGSAP(
    () => {
      const tl = gsap.timeline({ paused: true });
      tl.fromTo(
        chatBackdropRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.3 }
      ).fromTo(
        chatModalRef.current,
        { opacity: 0, scale: 0.95 },
        { opacity: 1, scale: 1, duration: 0.3 },
        "<"
      );
      if (isChatOpen) {
        tl.play();
      } else {
        tl.reverse();
      }
    },
    { dependencies: [isChatOpen] }
  );

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const isValidEmail = (email: string) => {
      return /\S+@\S+\.\S+/.test(email);
    };
    const email = e.currentTarget.elements[0] as HTMLInputElement;
    if (email && email.value && isValidEmail(email.value)) {
      const response = await addToWaitList({ email: email.value });
      if (response.success) {
        // toast.success("Successfully added to waitlist!");
        localStorage.setItem("isOnWaitlist", "true");
        setIsOnWaitList(true);
      } else {
        toast.error("Failed to add to waitlist. Please try again later.");
      }
    } else {
      toast.error("Please enter a valid email address.");
    }
    setLoading(false);
    return;
  }

  return (
    <div ref={containerRef} className="min-h-screen theme-bg theme-text">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 pb-20 md:px-20">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
            <div className="animated-section flex-1 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 border-purple-500 text-purple-500 border border-dashed text-sm font-medium px-3 py-1 rounded-md mb-8">
                <MdRocketLaunch size={16} /> Coming Soon
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight grid">
                <span className="theme-text-accent mr-5">KwizKit</span>
                <span className="text-3xl md:text-4xl font-normal theme-text-secondary">
                  is launching soon
                </span>
              </h1>
              <p className="text-lg md:text-xl mb-12 theme-text-secondary max-w-2xl mx-auto lg:mx-0">
                Revolutionary AI-powered test creation, intelligent grading, and
                comprehensive analytics for the modern educator.
              </p>
              <div className="flex items-center justify-center lg:justify-start gap-4">
                <div className="relative w-16 h-16">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      className="stroke-current theme-border-color"
                      strokeWidth="2"
                      fill="none"
                      cx="18"
                      cy="18"
                      r="16"
                    />
                    <circle
                      className="progress-ring stroke-current theme-text-accent"
                      strokeWidth="2"
                      strokeDasharray="100 100"
                      strokeDashoffset="100"
                      strokeLinecap="round"
                      fill="none"
                      cx="18"
                      cy="18"
                      r="16"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="progress-text text-sm font-semibold theme-text-accent">
                      0
                    </span>
                    %
                  </div>
                </div>
                <div>
                  <p className="font-medium theme-text">Build Progress</p>
                  <p className="text-xs theme-text-secondary">
                    Development in progress
                  </p>
                </div>
              </div>
            </div>
            <div className="animated-section flex-shrink-0 w-full max-w-md lg:max-w-sm">
              {isOnWaitlist ? (
                <div>
                  <div className="rounded-md p-8 border-2 border-dashed theme-border-color">
                    <TbHeartCheck
                      className="mx-auto mb-4 theme-text-accent"
                      size={48}
                    />
                    <h2 className="text-2xl font-semibold mb-6 theme-text text-center">
                      You're on the Waitlist!
                    </h2>
                    <p className="theme-text-secondary text-center">
                      Thank you for joining the KwizKit waitlist. We'll keep you
                      updated with the latest news and launch details.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-md p-8 border-2 border-dashed theme-border-color">
                  <h2 className="text-2xl font-semibold mb-6 theme-text text-center">
                    Join the Waitlist
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="relative">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 theme-text-secondary"
                        size={18}
                      />
                      <input
                        className="theme-input pl-11 w-full"
                        placeholder="Email Address"
                        type="email"
                      />
                    </div>
                    <button
                      type="submit"
                      className="border-2 theme-border-color-accent theme-text-accent py-2 border-dashed rounded w-full flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <span className="loading loading-bars loading-xl" />
                      ) : (
                        <>
                          Get Early Access <ChevronRight size={16} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Screenshot Display Section */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="border-2 border-dashed theme-border-color rounded-md p-4">
            <div className="w-full p-2 theme-bg-subtle rounded-sm flex items-center justify-center">
              <Image
                src={banner}
                alt="KwizKit Screenshot"
                width={1280}
                height={720}
                className="object-contain rounded-sm"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="animated-section py-20 px-4 sm:px-6 lg:px-8 border-2 border-dashed theme-border-color rounded mb-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              How We Will Transform{" "}
              <span className="block theme-text-accent">Your Teaching</span>
            </h2>
            <p className="text-xl theme-text-secondary max-w-3xl mx-auto">
              Experience the future of assessment with our comprehensive suite
              of test automation tools.
            </p>
          </div>
          <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-md p-6 border-2 border-dashed theme-border-color flex flex-col items-center text-center"
              >
                <div className="theme-text-accent mb-5">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-3">{feature.title}</h3>
                <p className="theme-text-secondary text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Links Section */}
      <section className="animated-section py-20 px-4 sm:px-6 lg:px-8 border-2 border-dashed theme-border-color rounded">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Stay Connected
          </h2>
          <p className="text-lg mb-8 theme-text-secondary">
            Follow our journey and be the first to know when we launch.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#"
              className="border-2 theme-border-color-accent border-dashed py-2 px-3 hover:theme-border-color-accent theme-text-accent rounded w-full sm:w-auto flex items-center justify-center gap-3"
            >
              <Github size={16} /> GitHub
            </a>
            <a
              href="#"
              className="border-2 border-dashed py-2 px-3  theme-text rounded w-full sm:w-auto flex items-center justify-center gap-3"
            >
              <Twitter size={16} /> Follow on X
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
