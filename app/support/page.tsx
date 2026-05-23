import { Mail, MessageCircle, Clock, ArrowRight } from "lucide-react";

const faqItems = [
  {
    question: "How does AI test generation work?",
    answer: "Rubric analyzes your material and learning objectives to generate relevant assessment items for your context.",
  },
  {
    question: "Can I customize the generated questions?",
    answer: "Yes. All generated content is editable so your team keeps complete editorial control.",
  },
  {
    question: "Is student data secure?",
    answer: "We use strong access controls and institution-friendly privacy practices designed for educational environments.",
  },
  {
    question: "What question types are supported?",
    answer: "Rubric supports multiple choice, short answer, essay, and rubric-based evaluation workflows.",
  },
];

export default function SupportPage() {
  return (
    <div className="rubric-page py-16 md:py-24">
      <div className="rubric-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rubric-kicker mb-4">Support</div>
          <h1 className="rubric-title text-[clamp(2.75rem,7vw,5.5rem)]">How can we help?</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-[var(--rubric-slate)]">
            Get help with onboarding, billing, workflows, or anything else you need to run assessments at scale.
          </p>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <a href="#contact-form" className="rubric-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                <Mail className="size-5 text-[var(--rubric-black)]" />
              </div>
              <div>
                <h2 className="text-lg font-medium">Email support</h2>
                <p className="mt-1 text-sm text-[var(--rubric-muted)]">Response within 24 hours</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--rubric-slate)]">Best for detailed questions, troubleshooting, and account support.</p>
          </a>

          <div className="rubric-card p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                <MessageCircle className="size-5 text-[var(--rubric-black)]" />
              </div>
              <div>
                <h2 className="text-lg font-medium">Live chat</h2>
                <p className="mt-1 text-sm text-[var(--rubric-muted)]">Available during business hours</p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-6 text-[var(--rubric-slate)]">Get faster help for quick questions from the support team.</p>
          </div>
        </div>

        <div id="contact-form" className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <div className="rubric-card p-6 md:p-8">
            <div className="mb-6">
              <div className="rubric-kicker mb-3">Contact</div>
              <h2 className="rubric-section-title">Send us a message</h2>
            </div>
            <form className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <input type="text" placeholder="Your name" required className="theme-input" />
                <input type="email" placeholder="Your email" required className="theme-input" />
              </div>
              <input type="text" placeholder="Subject" required className="theme-input" />
              <textarea placeholder="Your message" rows={6} required className="theme-input resize-none"></textarea>
              <button type="submit" className="rubric-button-primary w-full">
                Send message
                <ArrowRight className="size-4" />
              </button>
            </form>
          </div>

          <div className="space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="rubric-card p-6">
                <summary className="cursor-pointer list-none text-base font-medium">{item.question}</summary>
                <p className="mt-3 text-sm leading-7 text-[var(--rubric-slate)]">{item.answer}</p>
              </details>
            ))}
            <div className="rubric-card flex items-center gap-3 p-6 text-sm text-[var(--rubric-slate)]">
              <Clock className="size-4 text-[var(--rubric-black)]" />
              Support hours: Monday - Friday, 9:00 AM - 6:00 PM EST
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}