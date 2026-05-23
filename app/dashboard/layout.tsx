
"use client";

import { useState } from "react";
import Sidebar from "./components/Navbar";
import Header from "./components/Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-dvh overflow-hidden bg-[var(--rubric-off-white)] text-[var(--rubric-black)]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden lg:block lg:w-[220px]">
        <Sidebar />
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 lg:hidden" onMouseDown={() => setSidebarOpen(false)}>
          <div onMouseDown={(event) => event.stopPropagation()}>
            <Sidebar mobile onClose={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <main className="h-dvh min-w-0 overflow-y-auto lg:pl-[220px]">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <div className="px-4 pb-8 sm:px-6 lg:px-9">
          {children}
        </div>
      </main>
    </div>
  );
}
