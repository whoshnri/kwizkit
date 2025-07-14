"use client"


import React, { useState, useEffect } from 'react';

export default function App() {
  // State to manage which accordion item is open
  const [openSection, setOpenSection] = useState(null);

  // Function to toggle accordion sections
  const toggleSection = (sectionId) => {
    setOpenSection(openSection === sectionId ? null : sectionId);
  };

  // State to control the visibility of the scroll-to-top button
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Effect to add and remove the scroll event listener for scroll-to-top
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <>
          By accessing and using <span className="font-semibold text-blue-600 dark:text-blue-400">KwizKit</span>, you accept and agree to be bound by the terms and provisions of this
          agreement. If you do not agree to abide by the above, please do not use this service. Your continued use
          of the service after any modifications to these terms signifies your acceptance of the revised terms.
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
            <li className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">&bull;</span>
              <span>Modify or copy the materials;</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">&bull;</span>
              <span>Use the materials for any commercial purpose or for any public display;</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">&bull;</span>
              <span>Attempt to reverse engineer any software contained on the website;</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">&bull;</span>
              <span>Remove any copyright or other proprietary notations from the materials.</span>
            </li>
          </ul>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
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
          of your account on our service. You are responsible for safeguarding the password that you use to access
          the service and for any activities or actions under your password, whether your password is with our
          service or a third-party social media service.
        </>
      ),
    },
    {
      id: 'guidelines',
      title: '4. Content Guidelines',
      content: (
        <>
          <p className="mb-4">
            Users are responsible for the content they create and share through KwizKit. You agree not to:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-4">
            <li className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">&bull;</span>
              <span>Upload content that is illegal, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically or otherwise objectionable;</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">&bull;</span>
              <span>Violate any intellectual property rights of any party;</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">&bull;</span>
              <span>Share inappropriate content with students or other users;</span>
            </li>
            <li className="flex items-start">
              <span className="mr-2 text-blue-500 dark:text-blue-400">&bull;</span>
              <span>Use the service to harass, abuse, or harm another person.</span>
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'availability',
      title: '5. Service Availability',
      content: (
        <>
          We strive to provide reliable service but cannot guarantee 100% uptime. We reserve the right to modify or
          discontinue the service (or any part thereof) temporarily or permanently, with or without notice, at any time.
          You agree that KwizKit shall not be liable to you or to any third party for any modification, suspension, or
          discontinuance of the service.
        </>
      ),
    },
    {
      id: 'liability',
      title: '6. Limitation of Liability',
      content: (
        <>
          In no event shall KwizKit or its suppliers be liable for any damages (including, without limitation,
          damages for loss of data or profit, or due to business interruption) arising out of the use or inability
          to use KwizKit, even if KwizKit or a KwizKit authorized representative has been notified orally or in writing
          of the possibility of such damage. Because some jurisdictions do not allow limitations on implied warranties,
          or limitations of liability for consequential or incidental damages, these limitations may not apply to you.
        </>
      ),
    },
    {
      id: 'governing-law',
      title: '7. Governing Law',
      content: (
        <>
          These terms and conditions are governed by and construed in accordance with the laws of the United States
          and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location. Any dispute
          arising from these terms will be resolved in accordance with these laws.
        </>
      ),
    },
    {
      id: 'contact',
      title: '8. Contact Information',
      content: (
        <>
          If you have any questions about these Terms and Conditions, please contact us at{' '}
          <a href="mailto:legal@kwizkit.com" className="text-blue-600 hover:underline dark:text-blue-400">legal@kwizkit.com</a> or
          through our <a href="#" className="text-blue-600 hover:underline dark:text-blue-400">support page</a>.
        </>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 font-inter text-gray-800 dark:text-gray-200">
      {/* Sticky, Minimalistic Banner */}
      <header className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="max-w-4xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-0">Terms and Conditions</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl overflow-hidden p-6 sm:p-8">
          <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
            Welcome to KwizKit! Please read these Terms and Conditions carefully before using our service. By accessing or using KwizKit, you agree to be bound by these terms.
          </p>

          <div className="space-y-4">
            {sections.map((section) => (
              <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  className="flex justify-between items-center w-full p-4 text-left font-semibold text-lg text-gray-900 dark:text-white bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => toggleSection(section.id)}
                  aria-expanded={openSection === section.id}
                  aria-controls={`content-${section.id}`}
                >
                  {section.title}
                  <svg
                    className={`w-6 h-6 transform transition-transform duration-300 ${
                      openSection === section.id ? 'rotate-180' : ''
                    }`}
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
                  className={`overflow-hidden transition-all duration-500 ease-in-out ${
                    openSection === section.id ? 'max-h-screen p-4' : 'max-h-0'
                  } text-gray-700 dark:text-gray-300`}
                >
                  {section.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75"
          aria-label="Scroll to top"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
          </svg>
        </button>
      )}
    </div>
  );
}
