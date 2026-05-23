import { Shield, Database, BookOpen, Clock, Mail, Info } from "lucide-react";

const policySections = [
  { icon: Info, title: "Information we collect", content: ["Name, email address, and role", "Institution information", "Content you create and administer", "Student responses and performance data", "Usage data for product analytics"] },
  { icon: Database, title: "How we use it", content: ["Provide and improve the service", "Power AI test generation and analytics", "Personalize the experience", "Send notices and support messages", "Respond to questions and requests"] },
  { icon: Shield, title: "Data security", content: ["Appropriate technical and organizational measures", "Access controls and encryption", "Regular operational review"] },
  { icon: BookOpen, title: "Educational privacy", content: ["We design the product for educational use", "We do not sell student data", "Data is used to provide the services you direct"] },
  { icon: Clock, title: "Data retention", content: ["We retain information as long as the account is active or needed", "You can request deletion of your account and data"] },
  { icon: Mail, title: "Contact", content: ["support@rubric.app", "Or use the support page for help"] },
];

export default function PrivacyPolicyPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="rubric-page py-16 md:py-24">
      <div className="rubric-shell">
        <div className="mx-auto max-w-3xl text-center">
          <div className="rubric-kicker mb-4">Legal</div>
          <h1 className="rubric-title text-[clamp(2.75rem,7vw,5.5rem)]">Privacy Policy</h1>
          <p className="mt-4 text-sm text-[var(--rubric-muted)]">Last updated: {lastUpdated}</p>
        </div>

        <div className="mx-auto mt-12 max-w-4xl space-y-4">
          {policySections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.title} className="rubric-card p-6 md:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--border)] bg-[var(--surface-muted)]">
                    <Icon className="size-5 text-[var(--rubric-black)]" />
                  </div>
                  <h2 className="text-xl font-medium tracking-[-0.02em]">{section.title}</h2>
                </div>
                <ul className="mt-4 list-disc space-y-2 pl-6 text-sm leading-7 text-[var(--rubric-slate)]">
                  {section.content.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}