import {
  BadgeCheck,
  BarChart3,
  BrainCircuit,
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Award,
  Check,
  CheckCircle2,
  Circle,
  ArrowRight,
  FileArchive,
  School,
  UserRoundCheck,
  UsersRound,
  Layers3,
  LibraryBig,
  ListChecks,
  Mic,
  PenTool,
  Presentation,
  Route,
  ScanSearch,
  WalletCards,
} from "lucide-react";
import { FeatureShowcase, RubricButton } from "@/components/site";
import { FaBahai } from "react-icons/fa";
import SocialProofSection from "@/components/site/SocialProof";

const assessmentFeatures = [
  {
    icon: BrainCircuit,
    title: "Prompt-to-test creation",
    description:
      "Turn a lesson objective, topic, or uploaded material into a structured assessment your team can still review and refine.",
  },
  {
    icon: PenTool,
    title: "Question bank control",
    description:
      "Build reusable questions, tune question type, difficulty, topic coverage, and import generated sets into existing banks.",
  },
  {
    icon: BadgeCheck,
    title: "Grading that scales",
    description:
      "Move from objective scoring to rubric-backed review with cleaner records for every submitted attempt.",
  },
  {
    icon: GraduationCap,
    title: "Certificates after mastery",
    description:
      "Issue completion records from the same flow that created, delivered, scored, and archived the test.",
  },
];

const studentFeatures = [
  {
    icon: UsersRound,
    title: "Student profiles",
    description:
      "Keep each learner's classes, subjects, attempts, scores, certificates, and activity in one inspectable record.",
  },
  {
    icon: School,
    title: "Class membership",
    description:
      "Create class lists, add or update students quickly, and keep cohorts aligned with the work they are assigned.",
  },
  {
    icon: BarChart3,
    title: "Progress visibility",
    description:
      "See how students are moving through assessments, where they are improving, and where support is needed.",
  },
  {
    icon: WalletCards,
    title: "Operational history",
    description:
      "Connect activity, usage, and recent transactions to the academic work happening inside the dashboard.",
  },
];

const aiFeatures = [
  {
    icon: BrainCircuit,
    title: "Guided AI generation",
    description:
      "Ask for the exact kind of question you need: concept checks, essays, comprehension, application prompts, or mixed sets.",
  },
  {
    icon: ScanSearch,
    title: "Generation with context",
    description:
      "Use subject, difficulty, source material, and question intent so generated items feel less generic and more teachable.",
  },
  {
    icon: ShieldCheck,
    title: "Live test readiness",
    description:
      "Route test takers through access, setup, permissions, rules, timers, and a focused assessment interface.",
  },
  {
    icon: Mic,
    title: "Proctoring signals",
    description:
      "Bring camera, microphone, flagging, and attempt state into the workflow without making the testing screen noisy.",
  },
];

const curriculumFeatures = [
  {
    icon: LibraryBig,
    title: "Materials library",
    description:
      "Store lesson files, links, notes, audio, video, and references beside the subjects and classes that need them.",
  },
  {
    icon: Presentation,
    title: "Lesson planning",
    description:
      "Plan what will be taught, attach supporting material, and keep assessment prep close to the curriculum.",
  },
  {
    icon: Layers3,
    title: "Subject structure",
    description:
      "Organize academic work around subjects, classes, materials, tests, and certificates instead of isolated files.",
  },
  {
    icon: Route,
    title: "Learning pathways",
    description:
      "Move from preparation to assessment to certification with a clearer record of what happened at every step.",
  },
];

const featureSections = [
  {
    eyebrow: "Student management",
    title: "Every learner record stays connected to the work around it.",
    intro:
      "Rubric gives institutions a calmer way to manage students, classes, activity, and outcomes without scattering records across tools.",
    label: "Records",
    sideCopy:
      "The student layer is built for administrators and educators who need the full context before they make a decision.",
    items: studentFeatures,
  },
  {
    eyebrow: "Test creation and grading",
    title: "Build, deliver, grade, and certify from one assessment flow.",
    intro:
      "Teachers can create smarter tests, keep question banks clean, review results, and issue certificates without rebuilding the process each time.",
    label: "Assessment",
    sideCopy:
      "Question creation, grading, and certification sit together so tests become reusable academic infrastructure.",
    items: assessmentFeatures,
    reverse: true,
  },
  {
    eyebrow: "AI and proctoring",
    title: "Use AI to prepare better questions, then protect the live attempt.",
    intro:
      "The AI layer is designed for teaching intent, while live testing keeps access, setup, permissions, flags, and timing in view.",
    label: "Intelligence",
    sideCopy:
      "Rubric helps educators describe the kind of thinking they want to test, not just the number of questions they want generated.",
    items: aiFeatures,
  },
  {
    eyebrow: "Curriculum management",
    title: "Keep lessons, materials, subjects, and pathways in the same academic map.",
    intro:
      "Manage the resources behind instruction so the dashboard reflects how learning is planned, taught, assessed, and completed.",
    label: "Curriculum",
    sideCopy:
      "Materials and lesson planning become part of the same system that already understands students, tests, and outcomes.",
    items: curriculumFeatures,
    reverse: true,
  },
];

const dashboardCards = [
  {
    icon: UsersRound,
    label: "Students",
    value: "248",
    note: "Profiles with class, subject, score, certificate, and attempt history.",
  },
  {
    icon: School,
    label: "Class lists",
    value: "18",
    note: "Cohorts grouped by level, subject, and academic session.",
  },
  {
    icon: FileArchive,
    label: "Materials",
    value: "92",
    note: "Resources ready for teaching, lesson planning, and assessment prep.",
  },
  {
    icon: Award,
    label: "Certificates",
    value: "37",
    note: "Issued records tied directly to student profiles.",
  },
];

const workflowCards = [
  {
    icon: ListChecks,
    title: "Plan",
    description:
      "Set up classes, subjects, materials, and the learning work that should happen next.",
  },
  {
    icon: BrainCircuit,
    title: "Assess",
    description:
      "Generate or build tests, deliver live attempts, and keep grading tied to the source record.",
  },
  {
    icon: UserRoundCheck,
    title: "Track",
    description:
      "Review student progress, certificates, wallet usage, transactions, and recent dashboard activity.",
  },
];

function Hero() {
  return (
    <section className="rubric-shell grid justify-items-center gap-10 py-10 text-center sm:py-12 lg:min-h-[80vh] lg:py-24">
      <div className="mx-auto max-w-5xl space-y-6 sm:space-y-8">
        <div className="space-y-4 sm:space-y-6">
          <h1 className="rubric-title text-[clamp(3rem,8vw,6.5rem)] leading-[0.92]">
            The academic operations layer for modern educators and institutions.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-[var(--rubric-muted)]">
            Create tests, run live attempts, manage learners, organize classes,
            publish materials, issue certificates, and track the work around it.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <RubricButton href="/auth" variant="primary">
            Get started free
          </RubricButton>
          <RubricButton href="#features" variant="secondary">
            See how it works
          </RubricButton>
        </div>
      </div>

      <div className="relative mt-2 hidden lg:block">
        <div className="rubric-card overflow-hidden rounded-[28px] border p-4 shadow-none">
          <div className="rounded-[22px] border border-[var(--border)] bg-[var(--rubric-parchment)] p-5">
            {/* Top bar */}
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--rubric-black)]">
                  Rubric
                </span>
                <span className="rounded-full bg-[var(--rubric-black)] px-2.5 py-0.5 text-[10px] font-medium tracking-wide text-white">
                  Spring 2025
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-[var(--rubric-muted)]">
                <span className="size-1.5 rounded-full bg-green-500" />3
                sessions live
              </div>
            </div>

            {/* Pipeline */}
            <div className="grid grid-cols-[1fr_20px_1fr_20px_1fr] items-start gap-0">
              {/* Stage 1 — Create */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--rubric-black)] text-[10px] font-medium text-white">
                      1
                    </span>
                    <span className="text-xs font-medium text-[var(--rubric-black)]">
                      Create
                    </span>
                  </div>
                </div>
                <div className="rounded-xl bg-[var(--surface-muted)] p-3">
                  <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-[var(--rubric-muted)]">
                    Question 4 of 20
                  </p>
                  <p className="mb-3 text-xs leading-5 text-[var(--rubric-black)]">
                    Which best describes the role of mitochondria in eukaryotic
                    cells?
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      "Protein synthesis",
                      "ATP production",
                      "DNA replication",
                      "Cell division",
                    ].map((opt, i) => (
                      <div
                        key={opt}
                        className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] ${
                          i === 1
                            ? "border-[var(--rubric-black)] text-[var(--rubric-black)]"
                            : "border-[var(--border)] text-[var(--rubric-muted)]"
                        }`}
                      >
                        {i === 1 ? (
                          <CheckCircle2 className="size-3" />
                        ) : (
                          <Circle className="size-3" />
                        )}
                        {opt}
                      </div>
                    ))}
                  </div>
                  <p className="mt-2.5 flex items-center gap-1 text-[10px] text-[var(--rubric-muted)]">
                    <FaBahai className="size-3" /> Generated from Biology S2
                    syllabus
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center pt-6">
                <ArrowRight className="size-3.5 text-[var(--rubric-muted)]" />
              </div>

              {/* Stage 2 — Proctor */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--rubric-black)] text-[10px] font-medium text-white">
                      2
                    </span>
                    <span className="text-xs font-medium text-[var(--rubric-black)]">
                      Proctor
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { init: "AO", name: "A. Okafor", ok: true },
                    { init: "FM", name: "F. Mensah", ok: false },
                    { init: "BI", name: "B. Ibrahim", ok: true },
                    { init: "CE", name: "C. Eze", ok: true },
                  ].map(({ init, name, ok }) => (
                    <div
                      key={init}
                      className="relative flex aspect-[4/3] items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-muted)]"
                    >
                      <div className="flex size-7 items-center justify-center rounded-full border border-[var(--border)] bg-[var(--surface-strong)] text-[11px] font-medium text-[var(--rubric-slate)]">
                        {init}
                      </div>
                      <span className="absolute bottom-1 left-2 text-[9px] text-[var(--rubric-muted)]">
                        {name}
                      </span>
                      <span
                        className={`absolute right-1 top-1 flex size-3.5 items-center justify-center rounded-full ${ok ? "bg-green-100" : "bg-amber-100"}`}
                      >
                        {ok ? (
                          <Check className="size-2 text-green-600" />
                        ) : (
                          <AlertTriangle className="size-2 text-amber-600" />
                        )}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-2 text-[10px] text-amber-700">
                  <AlertTriangle className="size-3 shrink-0" />
                  F. Mensah switched tabs
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center justify-center pt-6">
                <ArrowRight className="size-3.5 text-[var(--rubric-muted)]" />
              </div>

              {/* Stage 3 — Certify */}
              <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] p-3.5">
                <div className="mb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 items-center justify-center rounded-full bg-[var(--rubric-black)] text-[10px] font-medium text-white">
                      3
                    </span>
                    <span className="text-xs font-medium text-[var(--rubric-black)]">
                      Certify
                    </span>
                  </div>
                </div>
                {/* Certificate card */}
                <div className="rounded-xl bg-[var(--rubric-black)] p-4 text-[var(--rubric-off-white)]">
                  <p className="mb-2 text-[9px] uppercase tracking-[0.14em] opacity-40">
                    Rubric · Certificate of completion
                  </p>
                  <p className="text-xs font-medium">Biology — Unit 2</p>
                  <p className="mb-3 text-[10px] opacity-50">
                    Spring Assessment 2025
                  </p>
                  <p className="text-sm font-medium tracking-tight">
                    Ada O. Bassey
                  </p>
                  <p className="mb-3 text-[10px] opacity-40">
                    University of Lagos · SS3 Science
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-full border border-white/20">
                      <Award className="size-3.5 opacity-60" />
                    </div>
                    <span className="text-[9px] opacity-30">
                      Issued 23 May 2025
                    </span>
                  </div>
                </div>
                {/* Score bar */}
                <div className="mt-2.5 flex items-center gap-2 text-[10px] text-[var(--rubric-muted)]">
                  <span>Score</span>
                  <div className="h-1 flex-1 overflow-hidden rounded-full bg-[rgba(28,28,28,0.08)]">
                    <div className="h-full w-[88%] rounded-full bg-[var(--rubric-black)]" />
                  </div>
                  <span>88%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashboardPreview() {
  return (
    <section className="rubric-shell max-sm:hidden py-12 md:py-24">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--rubric-parchment)] p-4 md:p-6">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--surface-strong)] p-4 md:p-6">
          <div className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 md:flex-row md:items-end md:justify-between">
            <div>
              
              <h2 className="mt-3 text-[clamp(2rem,5vw,4.5rem)] leading-[0.95] tracking-[-0.05em] text-[var(--rubric-black)]">
                A dashboard that finally matches the size of the work.
              </h2>
            </div>
            <p className="max-w-md text-base leading-7 text-[var(--rubric-slate)]">
              Rubric brings student records, class lists, materials,
              certificates, assessment activity, and account usage into one
              inspectable home.
            </p>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {dashboardCards.map((card) => {
              const Icon = card.icon;
              return (
              <div
                key={card.label}
                className="rounded-[22px] border border-[var(--border)] bg-[#FAF8F3] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-base font-medium text-[var(--rubric-muted)]">
                    {card.label}
                  </p>
                  <Icon className="size-4 text-[var(--rubric-muted)]" />
                </div>
                <p className="mt-4 text-4xl font-medium text-[var(--rubric-black)]">
                  {card.value}
                </p>
                <p className="mt-3 text-base leading-7 text-[var(--rubric-slate)]">
                  {card.note}
                </p>
              </div>
              );
            })}
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-3xl border border-[var(--border)] bg-[#FAF8F3] p-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-base font-medium text-[var(--rubric-black)]">
                  Recent activity
                </p>
                <span className="rounded-full border border-[var(--border)] px-3 py-1 text-base text-[var(--rubric-muted)]">
                  Live
                </span>
              </div>
              {[
                ["Summer Break Assessment", "Published test · 42 questions"],
                ["SS2 Science", "Class list · 31 students"],
                ["Reading Comprehension Pack", "Material · English Language"],
              ].map(([title, meta]) => (
                <div
                  key={title}
                  className="flex items-center justify-between border-t border-[var(--border)] py-3"
                >
                  <div>
                    <p className="text-base font-medium text-[var(--rubric-black)]">
                      {title}
                    </p>
                    <p className="mt-1 text-base text-[var(--rubric-muted)]">
                      {meta}
                    </p>
                  </div>
                  <ArrowRight className="size-4 text-[var(--rubric-muted)]" />
                </div>
              ))}
            </div>

            <div className="grid gap-3">
              {workflowCards.map((card) => {
                const Icon = card.icon;
                return (
                  <article
                    key={card.title}
                    className="rounded-3xl border border-[var(--border)] bg-[var(--rubric-black)] p-4 text-white"
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-2xl bg-white/10">
                        <Icon className="size-4 text-white/70" />
                      </span>
                      <div>
                        <h3 className="text-sm font-medium text-white">
                          {card.title}
                        </h3>
                        <p className="mt-1 text-base leading-7 text-white/62">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SocialProof() {
  return <SocialProofSection />;
}

function CTA() {
  return (
    <section className="rubric-shell py-8 lg:py-16">
      <div className="rounded-[28px] bg-[var(--rubric-black)] px-5 py-10 text-white sm:px-6 lg:rounded-[32px] lg:px-12 lg:py-16">
        <div className="max-w-3xl">
          <p className="rubric-kicker mb-3 text-white/60">Start here</p>
          <h2 className="text-2xl font-medium tracking-[-0.03em] sm:text-3xl md:text-5xl">
            Bring structure to assessment at institutional scale.
          </h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-white/70 sm:mt-4">
            Rubric gives educators one place to create assessments, proctor
            sessions, issue certifications, and analyse outcomes.
          </p>
          <RubricButton
            href="/auth"
            variant="inverse"
            className="mt-6 w-full sm:mt-8 sm:w-auto"
          >
            Get started free
          </RubricButton>
        </div>
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <div className="rubric-page">
      <Hero />
      {featureSections.map((section, index) => (
        <FeatureShowcase
          key={section.eyebrow}
          id={index === 0 ? "features" : undefined}
          eyebrow={section.eyebrow}
          title={section.title}
          intro={section.intro}
          label={section.label}
          sideCopy={section.sideCopy}
          reverse={section.reverse}
          items={section.items}
        />
      ))}
      <DashboardPreview />
      <SocialProof />
      {/* <CTA /> */}
    </div>
  );
}
