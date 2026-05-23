"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  PiBooks,
  PiCertificate,
  PiChalkboardTeacher,
  PiFileArchive,
  PiGraduationCap,
  PiList,
  PiMagnifyingGlass,
  PiPlus,
  PiArrowClockwise,
  PiReceipt,
  PiStudent,
  PiX,
} from "react-icons/pi";
import NewTest from "./NewTest";
import { useSession } from "../../SessionContext";
import AIContentModal from "./Aimodal";
import { DashboardButton } from "./primitives";
import FlareIcon from '@mui/icons-material/Flare';
import DashboardBreadcrumb from "./DashboardBreadcrumb";
import { DashboardSearchResult, searchDashboard } from "@/app/actions/dashboardSearchOps";
import {
  DashboardDropdown,
  DashboardDropdownContent,
  DashboardDropdownItem,
  DashboardDropdownLabel,
  DashboardDropdownSeparator,
  DashboardDropdownTrigger,
} from "./DashboardDropdown";

export default function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [newTest, setNewTest] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<DashboardSearchResult[]>([]);
  const { session, loading } = useSession();
  const isTestEditorRoute =
    pathname.startsWith("/dashboard/tests/") && pathname.split("/").length === 4;
  const pageTitle = segments[segments.length - 1]
    ? decodeURIComponent(segments[segments.length - 1]).replace(/-/g, " ")
    : "Dashboard";
  const title = pathname === "/dashboard" ? `Hi, ${session?.firstName ?? "Henry"}` : pageTitle;
  const subtitle =
    pathname === "/dashboard"
      ? "Track academic records, assessments, materials, certificates, and wallet activity."
      : pathname === "/dashboard/tests"
        ? "Manage and view all your created tests."
        : pathname === "/dashboard/students"
          ? "Manage student records and related academic history."
          : pathname === "/dashboard/classes"
            ? "Create class lists and append students."
            : pathname === "/dashboard/subjects"
              ? "Manage subjects, class links, and enrollments."
              : pathname === "/dashboard/materials"
                ? "Create materials and attach dummy uploads."
                : pathname === "/dashboard/certificates"
                  ? "Create certificates and assign them to students."
                  : pathname === "/dashboard/transactions"
                    ? "Review wallet transactions and dummy top-ups."
                    : pathname === "/dashboard/account"
                      ? "Update account details and review usage."
                      : "Manage this dashboard resource.";

  useEffect(() => {
    if (!searchOpen || !session?.id) return;

    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    let active = true;
    setSearching(true);
    const timer = window.setTimeout(async () => {
      const response = await searchDashboard(session.id, searchQuery);
      if (!active) return;
      setSearchResults(response.results ?? []);
      setSearching(false);
    }, 180);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchOpen, searchQuery, session?.id]);

  useEffect(() => {
    if (!searchOpen) return;
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSearchOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen]);

  const newItems = useMemo(
    () => [
      { label: "Test", description: "Create a new assessment", href: null, icon: PiBooks, action: () => setNewTest(true) },
      { label: "Student", description: "Add a learner record", href: "/dashboard/students", icon: PiStudent },
      { label: "Class", description: "Create a class list", href: "/dashboard/classes", icon: PiChalkboardTeacher },
      { label: "Subject", description: "Create a subject", href: "/dashboard/subjects", icon: PiGraduationCap },
      { label: "Material", description: "Upload a dummy resource", href: "/dashboard/materials", icon: PiFileArchive },
      { label: "Certificate", description: "Create an award record", href: "/dashboard/certificates", icon: PiCertificate },
      { label: "Top-up", description: "Open wallet transactions", href: "/dashboard/transactions", icon: PiReceipt },
    ],
    []
  );

  function openResult(result: DashboardSearchResult) {
    setSearchOpen(false);
    setSearchQuery("");
    router.push(result.href);
  }

  return (
    <>
      <div className="px-4 pb-4 pt-4 sm:px-6 lg:px-9 lg:pt-12">
        <div className="mb-8 flex items-center justify-between lg:hidden">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Image src="/logo.svg" alt="Rubric" width={30} height={30} className="rounded-lg" />
            <span className="text-[17px] font-semibold">Rubric</span>
          </Link>
          <button
            type="button"
            onClick={onMenuClick}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-full bg-[var(--rubric-black)] text-white"
            aria-label="Open sidebar"
          >
            <PiList className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <DashboardBreadcrumb pathname={pathname} />
            {loading ? (
              <div className="mt-2 h-11 w-48 animate-pulse rounded-lg bg-black/5" />
            ) : (
              <h1 className="mt-2 truncate text-[40px] font-normal leading-tight tracking-normal text-[var(--rubric-black)]">
                {title} 
              </h1>
            )}
            <p className="mt-1 text-base text-[var(--rubric-muted)]">{subtitle}</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            {!isTestEditorRoute && <div className="relative w-full sm:w-auto">
              <PiMagnifyingGlass className="pointer-events-none absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--rubric-muted)]" />
              <button
                type="button"
                onClick={() => setSearchOpen(true)}
                aria-label="Search dashboard"
                className="h-12 w-full rounded-full border border-[var(--border)] bg-[var(--surface-strong)] pl-14 pr-5 text-left text-sm text-[var(--rubric-muted)] outline-none transition hover:border-[var(--rubric-black)]/30 sm:w-[260px] lg:w-[360px]"
              >
                Search dashboard
              </button>
            </div>}
            <DashboardButton variant="secondary" onClick={() => window.location.reload()}>
              <PiArrowClockwise className="h-5 w-5" />
              Reload
            </DashboardButton>
            {!isTestEditorRoute && (
              <DashboardDropdown>
                <DashboardDropdownTrigger asChild>
                  <DashboardButton className="min-w-[120px]">
                    <PiPlus className="h-5 w-5" />
                    New
                  </DashboardButton>
                </DashboardDropdownTrigger>
                <DashboardDropdownContent align="end" className="w-[280px]">
                  <DashboardDropdownLabel>Create new</DashboardDropdownLabel>
                  <DashboardDropdownSeparator />
                  {newItems.map((item) => {
                    const Icon = item.icon;
                    const content = (
                      <>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#FAF8F3] text-[var(--rubric-black)]">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="min-w-0">
                          <span className="block font-semibold text-[var(--rubric-black)]">{item.label}</span>
                          <span className="block truncate text-xs text-[var(--rubric-muted)]">{item.description}</span>
                        </span>
                      </>
                    );

                    if (item.href) {
                      return (
                        <DashboardDropdownItem key={item.label} asChild>
                          <Link href={item.href}>{content}</Link>
                        </DashboardDropdownItem>
                      );
                    }

                    return (
                      <DashboardDropdownItem
                        key={item.label}
                        onSelect={() => {
                          item.action?.();
                        }}
                      >
                        {content}
                      </DashboardDropdownItem>
                    );
                  })}
                </DashboardDropdownContent>
              </DashboardDropdown>
            )}
          </div>
        </div>
      </div>
      {pathname !== "/dashboard" && (
        <ProjectToolbar />
      )}
      {newTest && <NewTest setNewTest={setNewTest} />}
      {searchOpen && (
        <DashboardSearchOverlay
          query={searchQuery}
          setQuery={setSearchQuery}
          results={searchResults}
          searching={searching}
          onClose={() => setSearchOpen(false)}
          onOpenResult={openResult}
        />
      )}
    </>
  );
}

function DashboardSearchOverlay({
  query,
  setQuery,
  results,
  searching,
  onClose,
  onOpenResult,
}: {
  query: string;
  setQuery: (value: string) => void;
  results: DashboardSearchResult[];
  searching: boolean;
  onClose: () => void;
  onOpenResult: (result: DashboardSearchResult) => void;
}) {
  return (
    <div className="fixed inset-y-0 right-0 z-50 bg-black/35 p-3 lg:left-[220px]" onMouseDown={onClose}>
      <div
        className="mx-auto mt-20 flex max-h-[76dvh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-[var(--border)] p-4">
          <PiMagnifyingGlass className="h-5 w-5 shrink-0 text-[var(--rubric-muted)]" />
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tests, students, classes, subjects, materials, certificates, transactions..."
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-[var(--rubric-muted)]"
          />
          <button type="button" onClick={onClose} className="rounded-full p-2 text-[var(--rubric-muted)] hover:bg-[var(--surface-muted)]">
            <PiX className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-[280px] overflow-y-auto p-3">
          {query.trim().length < 2 ? (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[#FAF8F3] p-8 text-center text-sm text-[var(--rubric-muted)]">
              Type at least two characters to sweep dashboard records.
            </div>
          ) : searching ? (
            <div className="space-y-2">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-lg bg-[#FAF8F3]" />
              ))}
            </div>
          ) : results.length ? (
            <div className="space-y-2">
              {results.map((result) => (
                <button
                  key={`${result.type}-${result.id}`}
                  type="button"
                  onClick={() => onOpenResult(result)}
                  className="flex w-full items-center justify-between gap-4 rounded-lg border border-[var(--border)] bg-[#FAF8F3] p-4 text-left transition hover:border-[var(--rubric-black)]/30"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--rubric-black)]">{result.title}</p>
                    <p className="mt-1 truncate text-sm text-[var(--rubric-slate)]">{result.subtitle}</p>
                  </div>
                  <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs font-bold uppercase text-[var(--rubric-muted)]">
                    {result.type}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[#FAF8F3] p-8 text-center text-sm text-[var(--rubric-muted)]">
              No matching dashboard records found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
  
export function ProjectToolbar() {
  const pathname = usePathname();
  const isTestDetailRoute =
    pathname.startsWith("/dashboard/tests/") && pathname.split("/").length === 4;

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  if (!isTestDetailRoute) return null;

  return (
    <>
      <div className="px-4 pb-2 sm:px-6 lg:px-9">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <button onClick={() => setIsAiModalOpen(true)} className="rubric-button-secondary h-11" aria-label="Use AI Assistant">
            <FlareIcon className="size-4" />
            Use AI
          </button>
        </div>
      </div>

      <AIContentModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        currentContent=""
      />
    </>
  );
}
