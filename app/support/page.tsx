"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Mail, MessageCircle, HelpCircle, ChevronDown, Send, Clock } from "lucide-react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// Interface for type-safe FAQ items
interface FaqItem {
  question: string;
  answer: string;
}

const faqItems: FaqItem[] = [
    {
      question: "How does AI test generation work?",
      answer: "Our AI analyzes your curriculum and learning objectives to generate relevant, high-quality questions tailored to your students' level and needs.",
    },
    {
      question: "Can I customize the generated questions?",
      answer: "Yes, absolutely! You have full control. You can edit, modify, or completely rewrite any AI-generated questions to perfectly match your specific requirements.",
    },
    {
      question: "Is student data secure?",
      answer: "Security is our top priority. We use enterprise-grade encryption and comply with educational privacy standards like FERPA to protect all student and educator information.",
    },
    {
      question: "What question types are supported?",
      answer: "KwizKit supports a wide range of question types, including multiple choice, true/false, short answer, essay questions, and we are continuously adding more.",
    },
];

export default function SupportPage() {
  const mainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Animate sections into view on scroll
    const sections = gsap.utils.toArray<HTMLElement>(".animated-section");
    sections.forEach((section) => {
      gsap.from(section, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
        },
      });
    });

    // GSAP-powered accordion logic
    const accordions = gsap.utils.toArray<HTMLDivElement>(".faq-item");
    accordions.forEach(accordion => {
        const button = accordion.querySelector<HTMLButtonElement>(".faq-button");
        const content = accordion.querySelector<HTMLDivElement>(".faq-content");
        const chevron = button?.querySelector("svg");

        if (!button || !content || !chevron) return; // Type guard

        gsap.set(content, { height: 0, opacity: 0 }); // Set initial state

        button.addEventListener("click", () => {
            const isExpanded = button.getAttribute('aria-expanded') === 'true';

            // Close all others
            accordions.forEach(other => {
                if (other !== accordion) {
                    const otherButton = other.querySelector<HTMLButtonElement>('.faq-button');
                    const otherContent = other.querySelector<HTMLDivElement>('.faq-content');
                    const otherChevron = otherButton?.querySelector("svg");
                    if (otherButton && otherContent && otherChevron) {
                        otherButton.setAttribute('aria-expanded', 'false');
                        gsap.to(otherContent, { height: 0, opacity: 0, duration: 0.4, ease: 'power1.inOut' });
                        gsap.to(otherChevron, { rotate: 0, duration: 0.3 });
                    }
                }
            });

            // Toggle clicked one
            if (isExpanded) {
                button.setAttribute('aria-expanded', 'false');
                gsap.to(content, { height: 0, opacity: 0, duration: 0.4, ease: 'power1.inOut' });
                gsap.to(chevron, { rotate: 0, duration: 0.3 });
            } else {
                button.setAttribute('aria-expanded', 'true');
                gsap.to(content, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power1.out' });
                gsap.to(chevron, { rotate: 180, duration: 0.3 });
            }
        });
    });

  }, { scope: mainRef });

  return (
    <div ref={mainRef} className="theme-bg theme-text min-h-screen py-16 md:py-24 px-4 sm:px-6 lg:px-8">
      <section className="max-w-xl mx-auto">
        <div className="animated-section text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            How Can We <span className="theme-text-accent">Help?</span>
          </h1>
          <p className="text-lg md:text-xl theme-text-secondary max-w-2xl mx-auto">
            Get the support you need to make the most of KwizKit.
          </p>
        </div>

        <div className="animated-section grid md:grid-cols-2 gap-8 mb-16">
          {/* Email Support Card */}
          <a href="#contact-form" className="block border-2 border-dashed theme-border-color rounded-md p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="theme-text-accent flex-shrink-0"><Mail size={24} /></div>
              <div>
                <h3 className="text-xl font-semibold">Email Support</h3>
                <p className="theme-text-secondary">Response within 24 hours</p>
              </div>
            </div>
            <p className="theme-text-secondary">
              Best for detailed questions. Send us your inquiry and we'll provide a thorough response.
            </p>
          </a>

          {/* Live Chat Card */}
          <div className="border-2 border-dashed theme-border-color rounded-md p-8">
            <div className="flex items-start gap-4 mb-4">
              <div className="theme-text-accent flex-shrink-0"><MessageCircle size={24} /></div>
              <div>
                <h3 className="text-xl font-semibold">Live Chat</h3>
                <p className="theme-text-secondary">Available during business hours</p>
              </div>
            </div>
            <p className="theme-text-secondary">
              Get instant help for quick questions from our support team.
            </p>
          </div>
        </div>

        {/* Contact Form Section */}
        <div id="contact-form" className="animated-section border-2 border-dashed theme-border-color rounded-md p-8 md:p-12">
          <h2 className="text-2xl md:text-3xl font-semibold mb-6">Send Us a Message</h2>
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <input type="text" placeholder="Your Name" required className="theme-input" />
              <input type="email" placeholder="Your Email" required className="theme-input" />
            </div>
            <input type="text" placeholder="Subject" required className="theme-input" />
            <textarea placeholder="Your Message" rows={5} required className="theme-input"></textarea>
            <button type="submit" className="border-dashed border-2 rounded py-2 inline-flex items-center gap-2 w-full justify-center hover:bg-white/5 duration-100 cursor-pointer theme-border-color-accent">
              <Send size={16} />
              Send Message
            </button>
          </form>
        </div>

        <div className="animated-section mt-16 border-2 border-dashed theme-border-color rounded-md p-4 flex items-center justify-center gap-3 text-center">
            <Clock className="theme-text-accent" size={20} />
            <p className="theme-text-secondary">
                <strong>Support Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST
            </p>
        </div>
      </section>
    </div>
  )
}