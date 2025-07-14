"use client"

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquarePlus, SendHorizonal } from 'lucide-react';

// --- Animation Variants (You can share these across components) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const formContainerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, delay: 0.2 } },
};

// --- Feedback Categories Data ---
const feedbackTypes = [
  { id: 'suggestion', label: 'Suggestion' },
  { id: 'bug', label: 'Bug Report' },
  { id: 'question', label: 'Question' },
];

const FeedbackSection = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [activeType, setActiveType] = useState('suggestion');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' or 'error'

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus(null);
    console.log({ name, email, feedbackType: activeType, message });
    // Replace with your actual API call
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus('success');
      // Reset form
      setName('');
      setEmail('');
      setMessage('');
    }, 1500);
  };

  return (
    <motion.section
      id="feedback"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={sectionVariants}
      className="py-24 px-6 theme-bg theme-text"
    >
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        {/* --- Left Column: Explanatory Text --- */}
        <div className="text-center md:text-left">
          <MessageSquarePlus className="w-12 h-12 mx-auto md:mx-0 mb-4 text-blue-500" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4 ">
            Share Your Thoughts
          </h2>
          <p className="text-xl opacity-70">
            Your feedback is invaluable. Let us know how we can improve, what you love, or what features you'd like to see next.
          </p>
        </div>

        {/* --- Right Column: The Form --- */}
        <motion.div
          variants={formContainerVariants}
          className="bg-gray-800  p-8 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="feedbackType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type of Feedback
              </label>
              <div className="flex gap-2 p-1 rounded-lg bg-gray-200 dark:bg-gray-700">
                {feedbackTypes.map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setActiveType(type.id)}
                    className={`flex-1 py-2 px-3 text-sm font-semibold rounded-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-800
                      ${activeType === type.id
                        ? 'bg-white text-gray-800 shadow-sm dark:bg-gray-900 dark:text-white'
                        : 'bg-transparent text-gray-600 hover:bg-gray-300/50 dark:text-gray-300 dark:hover:bg-gray-600/50'
                      }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid  opp-text sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input id="name" type="text" placeholder="Jane Doe" value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email <span className="text-red-500">*</span></label>
                <input id="email" type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Your Message <span className="text-red-500">*</span></label>
              <textarea id="message" placeholder="I'd love to see a feature that..." value={message} onChange={e => setMessage(e.target.value)} rows={5} required className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white opp-text dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>

            <p className="text-xs text-gray-500 dark:text-gray-400">
              We'll only use your email to follow up on your feedback. No spam, we promise.
            </p>

            <div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? 'Sending...' : 'Send Feedback'}
                {!isSubmitting && <SendHorizonal className="w-5 h-5" />}
              </motion.button>
            </div>
            {status && (
              <p className={`text-center font-medium ${status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
                {status === 'success' ? "Thank you! Your feedback has been sent." : "Something went wrong. Please try again."}
              </p>
            )}
          </form>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default FeedbackSection;
