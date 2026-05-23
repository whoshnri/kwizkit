export default function TermsAndConditionsPage() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const sections = [
    {
      title: "Acceptance of terms",
      body: "By accessing and using Rubric, you agree to the terms and provisions of this agreement. If you do not agree, do not use the service.",
    },
    {
      title: "Use license",
      body: "Permission is granted to temporarily use Rubric for educational purposes. This license does not transfer ownership or rights to copy or redistribute the materials.",
    },
    {
      title: "User accounts",
      body: "When you create an account, you must provide accurate, complete, and current information at all times.",
    },
    {
      title: "Contact information",
      body: "If you have any questions, contact legal@rubric.app or use the support page.",
    },
  ];

  return (
    <div className="rubric-page py-16 md:py-24">
      <main className="rubric-shell max-w-4xl">
        <div className="mx-auto text-center">
          <div className="rubric-kicker mb-4">Legal</div>
          <h1 className="rubric-title text-[clamp(2.75rem,7vw,5.5rem)]">Terms &amp; Conditions</h1>
          <p className="mt-4 text-sm text-[var(--rubric-muted)]">Last updated: {lastUpdated}</p>
        </div>

        <div className="mt-12 space-y-4">
          <div className="rubric-card p-6 md:p-8">
            <p className="text-sm leading-7 text-[var(--rubric-slate)]">
              Welcome to Rubric. Please read these terms carefully before using the service. By using Rubric you agree to be bound by these terms.
            </p>
          </div>

          {sections.map((section) => (
            <section key={section.title} className="rubric-card p-6 md:p-8">
              <h2 className="text-xl font-medium tracking-[-0.02em]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--rubric-slate)]">{section.body}</p>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
