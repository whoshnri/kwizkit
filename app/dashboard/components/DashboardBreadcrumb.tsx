"use client";

import Link from "next/link";

export default function DashboardBreadcrumb({ pathname }: { pathname: string }) {
  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;
    const label =
      index === 0 ? "Dashboard" : decodeURIComponent(segment).replace(/-/g, " ");

    return { href, label };
  });

  if (crumbs.length === 0) {
    crumbs.push({ href: "/dashboard", label: "Dashboard" });
  }

  return (
    <nav aria-label="Breadcrumb" className="text-sm font-medium text-[var(--rubric-muted)]">
      <ol className="flex flex-wrap items-center gap-2">
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;

          return (
            <li key={crumb.href} className="flex items-center gap-2 capitalize">
              {index > 0 && <span className="text-[var(--rubric-muted)]">/</span>}
              {isLast ? (
                <span className="text-[var(--rubric-black)]">{crumb.label}</span>
              ) : (
                <Link href={crumb.href} className="transition hover:text-[var(--rubric-black)]">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
