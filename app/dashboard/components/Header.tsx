"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, RefreshCcw, ArrowLeft } from "lucide-react";
import NewTest from "./NewTest";
import { useSession } from "../../SessionContext";
import { HiOutlineSparkles } from "react-icons/hi2";
import AIContentModal from "./Aimodal";
import { Question, Test } from "../tests/[test-name]/page";

export default function Header() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [newTest, setNewTest] = useState(false);
  const { session, loading, setGeneratedContent } = useSession();

  return (
    <>
      <div className="theme-bg theme-text text-sm p-4 rounded">
        <nav aria-label="Breadcrumb">
          <ul className="flex items-center text-base flex-wrap gap-2">
            {/* First breadcrumb: user's name linked to dashboard */}
            <li>
              <Link
                href="/dashboard"
                className="hover:underline flex items-center font-medium theme-text rounded px-1 py-0.5 transition-colors"
              >
                {loading ? (
                  // Skeleton loader while fetching session
                  <span className="inline-block h-5 w-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2" />
                ) : (
                  <span className="hover:underline text-blue-600 font-medium theme-text rounded px-1 py-0.5 transition-colors">
                    {session?.firstName}
                  </span>
                )}
              </Link>
            </li>

            {/* Render all segments except the last one as links */}
            {segments.length > 1 &&
              segments.slice(1, segments.length - 1).map((segment, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="theme-text">/</span>
                  <Link
                    href={`/${segments.slice(0, idx + 2).join("/")}`}
                    className="hover:underline font-medium theme-text rounded px-1 py-0.5 transition-colors"
                  >
                    {decodeURIComponent(segment).replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            {/* Last segment (non-clickable) */}
            {segments.length > 1 && (
              <li className="flex items-center gap-2">
                <span className="theme-text">/</span>
                <span className="capitalize font-medium theme-text">
                  {decodeURIComponent(segments[segments.length - 1]).replace(
                    /-/g,
                    " "
                  )}
                </span>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div>
        <ProjectToolbar setNewTest={setNewTest} setGeneratedContent={setGeneratedContent} />
      </div>
      {newTest && <NewTest setNewTest={setNewTest} />}
    </>
  );
}
  

interface ToolbarProps {
  setNewTest: (value: boolean) => void;
  setGeneratedContent: React.Dispatch<React.SetStateAction<Question[] | null>>;
}

export function ProjectToolbar({ setNewTest, setGeneratedContent }: ToolbarProps) {
  const pathname = usePathname();
  const isTestsRoute = pathname === "/dashboard/tests";
  const isHomeRoute = pathname === "/dashboard";
  const isTestDetailRoute =
    pathname.startsWith("/dashboard/tests/") && pathname.split("/").length === 4;
  const segments = pathname.split("/").filter(Boolean);
  const parentPath = "/" + segments.slice(0, -1).join("/");

  const [isAiModalOpen, setIsAiModalOpen] = useState(false);

  const [pageContent, setPageContent] = useState(
    "This is the current content on the page that the AI can revise."
  );




  return (
    <>
      <div className="flex items-center gap-2 w-full theme-bg theme-text p-2 rounded">
        <div className="flex gap-2">
          {!isHomeRoute && (
            <Link
              href={parentPath}
              className="flex items-center text-sm font-medium theme-text-secondary gap-2 border theme-border-color border-dashed px-4 py-2 rounded hover:theme-bg-subtle cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
          )}
          {isTestsRoute && (
            <button
              onClick={() => setNewTest(true)}
              className="flex items-center text-sm font-medium gap-2 theme-text-secondary border theme-border-color border-dashed px-4 py-2 rounded hover:theme-bg-subtle cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              aria-label="Create new test"
            >
              <Plus className="w-4 h-4" />
              New
            </button>
          )}

          <button
            onClick={() => window.location.reload()}
            className="flex items-center text-sm font-medium gap-2 theme-text-secondary border theme-border-color border-dashed px-4 py-2 rounded hover:theme-bg-subtle cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            aria-label="Reload page"
          >
            <RefreshCcw className="w-4 h-4" />
            Reload
          </button>

          {isTestDetailRoute && (
            <button
              // This button now opens the modal
              onClick={() => setIsAiModalOpen(true)}
              className="flex items-center text-sm font-medium gap-2 theme-text-secondary border theme-border-color border-dashed px-4 py-2 rounded hover:theme-bg-subtle cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
              aria-label="Use AI Assistant"
            >
              <HiOutlineSparkles className="w-4 h-4" />
              Use AI
            </button>
          )}
        </div>
      </div>

      <AIContentModal
        isOpen={isAiModalOpen}
        onSave={setGeneratedContent}
        onClose={() => setIsAiModalOpen(false)}
        currentContent={pageContent}
      />
    </>
  );
}