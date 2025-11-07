"use client";

import React, { useRef } from 'react';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TermsAndConditionsPage() {
  const mainRef = useRef<HTMLElement>(null);
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <>
          By accessing and using <span className="font-semibold theme-text-accent">KwizKit</span>, you accept and agree to be bound by the terms and provisions of this
          agreement. If you do not agree to abide by the above, please do not use this service.
        </>
      ),
    },
    {
        id: 'license',
        title: '2. Use License',
        content: (
          <>
            <p className="mb-4">
              Permission is granted to temporarily use KwizKit for educational purposes. This is the grant of a license,
              not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Modify or copy the materials;</li>
              <li>Use the materials for any commercial purpose or for any public display;</li>
              <li>Attempt to reverse engineer any software contained on the website;</li>
              <li>Remove any copyright or other proprietary notations from the materials.</li>
            </ul>
            <p className="text-sm theme-text-secondary mt-4">
              This license shall automatically terminate if you violate any of these restrictions and may be terminated by KwizKit at any time.
            </p>
          </>
        ),
    },
    {
        id: 'accounts',
        title: '3. User Accounts',
        content: (
          <>
            When you create an account with us, you must provide information that is accurate, complete, and current
            at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination
            of your account on our service.
          </>
        ),
    },
    {
      id: 'contact',
      title: '8. Contact Information',
      content: (
        <>
          If you have any questions about these Terms and Conditions, please contact us at{' '}
          <a href="mailto:legal@kwizkit.com" className="theme-text-accent hover:underline">legal@kwizkit.tech</a> or
          through our <a href="/support" className="theme-text-accent hover:underline">support page</a>.
        </>
      ),
    },
  ];
  const lastUpdated = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  useGSAP(() => {
    gsap.from([".page-title", ".terms-container"], {
      opacity: 0,
      y: 30,
      duration: 0.7,
      stagger: 0.2,
      ease: 'power2.out',
    });

    const accordions = gsap.utils.toArray<HTMLDivElement>('.accordion-item');
    accordions.forEach(accordion => {
      const button = accordion.querySelector('.accordion-button');
      const content = accordion.querySelector('.accordion-content');
      if (!button || !content) return;

      gsap.set(content, { height: 0, opacity: 0 }); // Set initial state

      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';

        accordions.forEach(otherAccordion => {
          if (otherAccordion !== accordion) {
            const otherButton = otherAccordion.querySelector('.accordion-button');
            const otherContent = otherAccordion.querySelector('.accordion-content');
            otherButton?.setAttribute('aria-expanded', 'false');
            gsap.to(otherContent, { height: 0, opacity: 0, duration: 0.4, ease: 'power1.inOut' });
            otherButton?.querySelector('svg')?.classList.remove('rotate-180');
          }
        });

        if (isExpanded) {
          button.setAttribute('aria-expanded', 'false');
          gsap.to(content, { height: 0, opacity: 0, duration: 0.4, ease: 'power1.inOut' });
          button.querySelector('svg')?.classList.remove('rotate-180');
        } else {
          button.setAttribute('aria-expanded', 'true');
          gsap.to(content, { height: 'auto', opacity: 1, duration: 0.5, ease: 'power1.out' });
          button.querySelector('svg')?.classList.add('rotate-180');
        }
      });
    });

  }, { scope: mainRef });

  return (
    <div className="min-h-screen theme-bg theme-text">
      <main ref={mainRef} className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center page-title">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Terms <span className="theme-text-accent">&amp;</span> Conditions
          </h1>
          <p className="theme-text-secondary">Last updated: {lastUpdated}</p>
        </div>

        <div className="terms-container border-2 border-dashed theme-border-color rounded-md p-6 sm:p-8">
          <p className="theme-text-secondary mb-8 leading-relaxed">
            Welcome to KwizKit! Please read these Terms and Conditions carefully before using our service. By accessing or using KwizKit, you agree to be bound by these terms.
          </p>

          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="accordion-item border-2 border-dashed theme-border-color rounded-md overflow-hidden">
                <button
                  className="accordion-button flex justify-between items-center w-full p-4 text-left font-semibold text-lg focus:outline-none"
                  aria-expanded="false"
                  aria-controls={`content-${section.id}`}
                >
                  {section.title}
                  <svg
                    className="w-6 h-6 transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                  </svg>
                </button>
                <div
                  id={`content-${section.id}`}
                  className="accordion-content overflow-hidden"
                >
                  <div className="p-4 pt-0 theme-text-secondary">{section.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}