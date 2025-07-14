"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Session } from "next-auth";
import { Plus, RefreshCcw, ArrowLeft } from "lucide-react";
import NewTest from './NewTest';
import { Test } from "@/lib/test";

interface NavProps {
  session: Session;
}

export default function Header({ session }: NavProps) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);
  const [newTest, setNewTest] = useState<boolean>(false);

  return (
    <>
      <div className="theme-bg theme-text text-sm p-4">
        <nav aria-label="Breadcrumb">
          <ul className="flex flex-wrap gap-2 items-center text-sm">
            {/* First breadcrumb: user's name linked to dashboard */}
            <li>
              <p
                className="font-semibold text-2xl text-blue-600 rounded px-1 transition-colors"
              >
                Dashboard   /
              </p>
            </li>
            <li>
              <Link
                href="/dashboard"
                className="hover:underline font-medium theme-text rounded px-1 py-0.5 transition-colors"
              >
                {session.user.firstName || "User"}
              </Link>
            </li>
            {/* Render all segments except the last one as links */}
            {segments.length > 1 &&
              segments.slice(1, segments.length - 1).map((segment, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="theme-text">></span>
                  <Link
                    href={`/${segments.slice(0, idx + 2).join('/')}`}
                    className="hover:underline font-medium theme-text rounded px-1 py-0.5 transition-colors"
                  >
                    {decodeURIComponent(segment).replace(/-/g, " ")}
                  </Link>
                </li>
              ))}
            {/* Last segment (non-clickable) */}
            {segments.length > 1 && (
              <li className="flex items-center gap-2">
                <span className="theme-text">></span>
                <span className="capitalize font-medium theme-text">
                  {decodeURIComponent(segments[segments.length - 1]).replace(/-/g, " ")}
                </span>
              </li>
            )}
          </ul>
        </nav>
      </div>
      <div>
        <ProjectToolbar setNewTest={setNewTest} />
      </div>
      {newTest && <NewTest setNewTest={setNewTest} />}
    </>
  );
}

interface ToolbarProps {
  setNewTest: (value: boolean) => void;
}

export function ProjectToolbar({ setNewTest }: ToolbarProps) {
  const pathname = usePathname();
  const isTestsRoute = pathname === '/dashboard/tests';
  const isHomeRoute = pathname === '/dashboard';
  const segments = pathname.split('/').filter(Boolean);
  const parentPath = '/' + segments.slice(0, -1).join('/');

  return (
    <div className="flex items-center gap-2 w-full theme-bg theme-text p-2 rounded">
      <div className="flex gap-2">
        {isTestsRoute ? (
          <button
            onClick={() => setNewTest(true)}
            className="flex items-center text-sm font-medium gap-2 border theme-border px-4 py-2 rounded hover:theme-bg-subtle cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            aria-label="Create new test"
          >
            <Plus className="w-4 h-4" />
            New
          </button>
        ) : !isHomeRoute && (
          <Link
            href={parentPath}
            className="flex items-center text-sm font-medium gap-2 border theme-border px-4 py-2 rounded hover:theme-bg-subtle cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        )}
        <button
          onClick={() => window.location.reload()}
          className="flex items-center text-sm font-medium gap-2 border theme-border px-4 py-2 rounded hover:theme-bg-subtle cursor-pointer focus:outline-none focus:ring-2 focus:ring-gray-300 transition-colors"
          aria-label="Reload page"
        >
          <RefreshCcw className="w-4 h-4" />
          Reload
        </button>
      </div>
    </div>
  );
}
