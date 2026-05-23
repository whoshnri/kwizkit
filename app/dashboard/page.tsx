"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PiBooks,
  PiCertificate,
  PiChalkboardTeacher,
  PiFileArchive,
  PiFileText,
  PiGraduationCap,
  PiPlus,
  PiReceipt,
  PiStudent,
  PiWallet,
} from "react-icons/pi";
import { fetchDashboardSummary } from "@/app/actions/fetchDashboardSummary";
import { useSession } from "@/app/SessionContext";
import { DashboardPanel, StatusBadge } from "./components/primitives";
import { formatDate, formatMoney, labelize } from "./lib/schoolOptions";

type DashboardSummary = NonNullable<
  Extract<
    Awaited<ReturnType<typeof fetchDashboardSummary>>,
    { summary: unknown }
  >["summary"]
>;

export default function Dashboard() {
  const router = useRouter();
  const { session, loading: sessionLoading, onboardingRequired } = useSession();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (sessionLoading) return;
    if (!session) {
      router.push("/auth");
      return;
    }
    if (onboardingRequired) {
      router.push("/auth/onboarding");
      return;
    }

    const currentSessionId = session.id;
    let active = true;

    async function loadSummary() {
      setLoading(true);
      const result = await fetchDashboardSummary(currentSessionId);

      if (!active) return;

      if ("error" in result) {
        setError(result.error ?? "Failed to load dashboard summary");
        setSummary(null);
      } else {
        setError("");
        setSummary(result.summary);
      }
      setLoading(false);
    }

    loadSummary();

    return () => {
      active = false;
    };
  }, [session, sessionLoading, onboardingRequired, router]);

  const metrics = useMemo(
    () => [
      {
        label: "Students",
        value: summary?.students ?? 0,
        href: "/dashboard/students",
        icon: PiStudent,
      },
      {
        label: "Classes",
        value: summary?.classLists ?? 0,
        href: "/dashboard/classes",
        icon: PiChalkboardTeacher,
      },
      {
        label: "Subjects",
        value: summary?.subjects ?? 0,
        href: "/dashboard/subjects",
        icon: PiGraduationCap,
      },
      {
        label: "Tests",
        value: summary?.totalTests ?? 0,
        href: "/dashboard/tests",
        icon: PiBooks,
      },
      {
        label: "Materials",
        value: summary?.materials ?? 0,
        href: "/dashboard/materials",
        icon: PiFileArchive,
      },
      {
        label: "Certificates",
        value: summary?.certificates ?? 0,
        href: "/dashboard/certificates",
        icon: PiCertificate,
      },
      {
        label: "Questions",
        value: summary?.totalQuestions ?? 0,
        href: "/dashboard/tests",
        icon: PiFileText,
      },
      {
        label: "Attempts",
        value: summary?.liveAttempts ?? 0,
        href: "/dashboard/students",
        icon: PiReceipt,
      },
    ],
    [summary],
  );

  const setupItems = useMemo(
    () => [
      {
        label: "Create class lists",
        done: (summary?.classLists ?? 0) > 0,
        href: "/dashboard/classes",
      },
      {
        label: "Add students",
        done: (summary?.students ?? 0) > 0,
        href: "/dashboard/students",
      },
      {
        label: "Create subjects",
        done: (summary?.subjects ?? 0) > 0,
        href: "/dashboard/subjects",
      },
      {
        label: "Publish tests",
        done: (summary?.publicTests ?? 0) > 0,
        href: "/dashboard/tests",
      },
      {
        label: "Upload materials",
        done: (summary?.materials ?? 0) > 0,
        href: "/dashboard/materials",
      },
    ],
    [summary],
  );

  if (sessionLoading || loading) {
    return (
      <div className="space-y-6 pb-8">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
            <DashboardPanel key={item} className="h-32 animate-pulse" />
          ))}
        </section>
        <section className="grid gap-5 xl:grid-cols-[1fr_380px]">
          <DashboardPanel className="h-96 animate-pulse" />
          <DashboardPanel className="h-96 animate-pulse" />
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {error && (
        <DashboardPanel className="p-4 text-sm text-[var(--rubric-danger)]">
          {error}
        </DashboardPanel>
      )}

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, href, icon: Icon }) => (
          <Link key={label} href={href}>
            <DashboardPanel className="group h-full p-5 transition hover:border-[var(--rubric-black)]/30">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase text-[var(--rubric-muted)]">
                    {label}
                  </p>
                  <p className="mt-4 text-4xl font-semibold leading-none text-[var(--rubric-black)]">
                    {value}
                  </p>
                </div>
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#FAF8F3] text-[var(--rubric-black)] transition group-hover:bg-[var(--rubric-black)] group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </DashboardPanel>
          </Link>
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <DashboardPanel className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--rubric-muted)]">
                Operations
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Recent activity</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/dashboard/students"
                className="rubric-button-secondary py-2"
              >
                <PiPlus className="h-4 w-4" />
                Student
              </Link>
              <Link
                href="/dashboard/classes"
                className="rubric-button-secondary py-2"
              >
                <PiPlus className="h-4 w-4" />
                Class
              </Link>
              <Link
                href="/dashboard/tests"
                className="rubric-button-primary py-2"
              >
                <PiPlus className="h-4 w-4" />
                Test
              </Link>
            </div>
          </div>

          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            <RecentTests tests={summary?.recentTests ?? []} />
            <RecentStudents students={summary?.recentStudents ?? []} />
          </div>
        </DashboardPanel>

        <div className="space-y-5">
          <DashboardPanel className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-[var(--rubric-muted)]">
                  Wallet
                </p>
                <p className="mt-2 text-3xl font-semibold">
                  {formatMoney(summary?.walletBalance)}
                </p>
              </div>
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--rubric-black)] text-white">
                <PiWallet className="h-6 w-6" />
              </span>
            </div>
            <div className="mt-5 space-y-2">
              {(summary?.recentTransactions ?? []).length ? (
                summary?.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-3"
                  >
                    <span className="text-sm text-[var(--rubric-slate)]">
                      {transaction.type === "cr" ? "Credit" : "Debit"}
                    </span>
                    <span className="text-sm font-semibold">
                      {formatMoney(transaction.amount)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="rounded-lg border border-dashed border-[var(--border)] p-4 text-sm text-[var(--rubric-muted)]">
                  No wallet activity yet.
                </p>
              )}
            </div>
            <Link
              href="/dashboard/transactions"
              className="rubric-button-secondary mt-5 w-full justify-center"
            >
              View transactions
            </Link>
          </DashboardPanel>

          <DashboardPanel className="p-6">
            <p className="text-sm font-bold text-[var(--rubric-muted)]">
              Setup progress
            </p>
            <div className="mt-5 space-y-3">
              {setupItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-3"
                >
                  <span className="text-sm font-semibold text-[var(--rubric-black)]">
                    {item.label}
                  </span>
                  <StatusBadge tone={item.done ? "success" : "neutral"}>
                    {item.done ? "Done" : "Open"}
                  </StatusBadge>
                </Link>
              ))}
            </div>
          </DashboardPanel>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <DashboardPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--rubric-muted)]">
                Resources
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Recent materials</h2>
            </div>
            <Link
              href="/dashboard/materials"
              className="rounded-full bg-[#FAF8F3] px-4 py-2 text-sm font-semibold"
            >
              View all
            </Link>
          </div>
          <div className="mt-5 space-y-3">
            {(summary?.recentMaterials ?? []).length ? (
              summary?.recentMaterials.map((material) => (
                <Link
                  key={material.id}
                  href="/dashboard/materials"
                  className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4"
                >
                  <div>
                    <p className="font-semibold text-[var(--rubric-black)]">
                      {material.name}
                    </p>
                    <p className="mt-1 text-sm text-[var(--rubric-muted)]">
                      {material.subject.name} · {labelize(material.type)}
                    </p>
                  </div>
                  <span className="text-xs text-[var(--rubric-muted)]">
                    {formatDate(material.createdAt)}
                  </span>
                </Link>
              ))
            ) : (
              <EmptyPrompt
                href="/dashboard/materials"
                label="Upload first material"
              />
            )}
          </div>
        </DashboardPanel>

        <DashboardPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[var(--rubric-muted)]">
                Assessment
              </p>
              <h2 className="mt-2 text-2xl font-semibold">Test coverage</h2>
            </div>
            <Link
              href="/dashboard/tests"
              className="rounded-full bg-[#FAF8F3] px-4 py-2 text-sm font-semibold"
            >
              Manage
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <CoverageCard label="Published" value={summary?.publicTests ?? 0} />
            <CoverageCard label="Drafts" value={summary?.draftTests ?? 0} />
            <CoverageCard
              label="Questions"
              value={summary?.totalQuestions ?? 0}
            />
          </div>
          <p className="mt-5 rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4 text-sm leading-6 text-[var(--rubric-slate)]">
            Use students, classes, subjects, and materials to keep test building
            grounded in the same academic records.
          </p>
        </DashboardPanel>
      </section>
    </div>
  );
}

function RecentTests({ tests }: { tests: DashboardSummary["recentTests"] }) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Tests</h3>
        <Link
          href="/dashboard/tests"
          className="text-sm font-semibold text-[var(--rubric-slate)]"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {tests.length ? (
          tests.map((test) => (
            <Link
              key={test.id}
              href={`/dashboard/tests/${test.slug}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--rubric-black)]">
                  {test.name}
                </p>
                <p className="mt-1 text-sm text-[var(--rubric-muted)]">
                  {test.subject?.name} ·{" "}
                  {test.numberOfQuestions ?? test._count.questions} questions
                </p>
              </div>
              <StatusBadge tone={test.visibility ? "success" : "warning"}>
                {test.visibility ? "Live" : "Draft"}
              </StatusBadge>
            </Link>
          ))
        ) : (
          <EmptyPrompt href="/dashboard/tests" label="Create first test" />
        )}
      </div>
    </div>
  );
}

function RecentStudents({
  students,
}: {
  students: DashboardSummary["recentStudents"];
}) {
  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Students</h3>
        <Link
          href="/dashboard/students"
          className="text-sm font-semibold text-[var(--rubric-slate)]"
        >
          View all
        </Link>
      </div>
      <div className="space-y-3">
        {students.length ? (
          students.map((student) => (
            <Link
              key={student.id}
              href="/dashboard/students"
              className="flex items-center justify-between gap-3 rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--rubric-black)]">
                  {student.firstName} {student.lastName}
                </p>
                <p className="mt-1 text-sm text-[var(--rubric-muted)]">
                  {student.email} · {labelize(student.level)}
                </p>
              </div>
              <StatusBadge tone={student.isActive ? "success" : "neutral"}>
                {student.isActive ? "Active" : "Inactive"}
              </StatusBadge>
            </Link>
          ))
        ) : (
          <EmptyPrompt href="/dashboard/students" label="Add first student" />
        )}
      </div>
    </div>
  );
}

function EmptyPrompt({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-center rounded-lg border border-dashed border-[var(--border)] bg-[#FAF8F3] p-6 text-sm font-semibold text-[var(--rubric-slate)]"
    >
      <PiPlus className="mr-2 h-4 w-4" />
      {label}
    </Link>
  );
}

function CoverageCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4">
      <p className="text-xs font-bold uppercase text-[var(--rubric-muted)]">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}
