"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const FAQSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const faqs = [
    {
      q: "How does the AI generate questions?",
      a: "Our AI is trained on a vast dataset of educational material. You provide it with your content (like a PDF, text, or URL), and it analyzes the material to generate relevant and contextually accurate questions.",
    },
    {
      q: "Is the automated grading accurate?",
      a: "Yes, for objective questions like multiple-choice, it's nearly 100% accurate. For subjective questions, our AI provides a highly reliable grade based on predefined rubrics, which you can review and adjust.",
    },
    {
      q: "Can I use KwizKit with my existing LMS?",
      a: "We are actively developing integrations for popular Learning Management Systems. Our Enterprise plan offers custom integration solutions today.",
    },
    {
      q: "What is your refund policy?",
      a: "We offer a 14-day money-back guarantee on all our paid plans. If you're not satisfied, simply contact support for a full refund.",
    },
  ];

  useGSAP(
    () => {
      const allDetails = gsap.utils.toArray<HTMLDetailsElement>(".faq-details");
      const allContent = gsap.utils.toArray<HTMLParagraphElement>(".faq-content");

      gsap.set(allContent, { height: 0, opacity: 0 });

      gsap.fromTo(allDetails, {
        opacity: 0,
        y: 50,
      }, {
        opacity: 1,
        y: 0,
        stagger: 0.1,
        duration: 0.6,
        ease: "power2.out",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 85%",
        },
      });

      allDetails.forEach((detail, index) => {
        const content = detail.querySelector<HTMLParagraphElement>(".faq-content");
        if (!content) return;

        detail.addEventListener("toggle", () => {
          if (detail.open) {
            allDetails.forEach((otherDetail, otherIndex) => {
              if (index !== otherIndex) {
                otherDetail.open = false;
              }
            });
            gsap.to(content, {
              height: "auto",
              opacity: 1,
              duration: 0.4,
              ease: "power1.out",
            });
          } else {
            gsap.to(content, {
              height: 0,
              opacity: 0,
              duration: 0.3,
              ease: "power1.in",
            });
          }
        });
      });
    },
    { scope: containerRef }
  );

  return (
    <section className="py-16 sm:py-20">
      <div className="text-center mb-12">
        <h2 className="text-3xl sm:text-4xl font-bold theme-text">
          Frequently Asked Questions
        </h2>
      </div>

      <div ref={containerRef} className="max-w-3xl mx-auto space-y-4">
        {faqs.map((faq, index) => (
          <details
            key={index}
            className="faq-details p-4 border-2 border-dashed theme-border-color rounded cursor-pointer overflow-hidden"
          >
            <summary className="font-semibold text-lg theme-text list-none">
              {faq.q}
            </summary>
            <p className="faq-content mt-2 theme-text-secondary">{faq.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;