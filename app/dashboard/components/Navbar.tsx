"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  PiBooks,
  PiCertificate,
  PiChalkboardTeacher,
  PiFileArchive,
  PiGraduationCap,
  PiPlanet,
  PiReceipt,
  PiStudent,
  PiUserCircleGear,
  PiX,
} from "react-icons/pi";
import Image from "next/image";
import { useSession } from "@/app/SessionContext";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: PiPlanet },
  { label: "Tests", href: "/dashboard/tests", icon: PiBooks },
  { label: "Students", href: "/dashboard/students", icon: PiStudent },
  { label: "Classes", href: "/dashboard/classes", icon: PiChalkboardTeacher },
  { label: "Subjects", href: "/dashboard/subjects", icon: PiGraduationCap },
  { label: "Materials", href: "/dashboard/materials", icon: PiFileArchive },
  { label: "Certificates", href: "/dashboard/certificates", icon: PiCertificate },
  { label: "Transactions", href: "/dashboard/transactions", icon: PiReceipt },
  { label: "Account", href: "/dashboard/account", icon: PiUserCircleGear },
];

export default function Navbar({
  mobile = false,
  onClose,
}: {
  mobile?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();
  const { session } = useSession();
  const firstName = session?.firstName || "Henry";

  return (
    <div className="flex h-dvh w-[220px] flex-col bg-[var(--rubric-black)] px-5 py-6 text-white">
      <div className="flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <Image src="/logo.svg" alt="Rubric" width={32} height={32} className="rounded-lg" />
          <span className="text-[17px] font-semibold tracking-tight">Rubric</span>
        </Link>
        {mobile && (
          <button type="button" onClick={onClose} className="rounded-full p-2 text-white/70">
            <PiX className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pt-8 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <nav className="space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                href={item.href}
                key={item.href}
                onClick={onClose}
                className={`flex h-11 items-center gap-3 rounded-xl px-4 text-sm font-semibold transition-colors ${
                  active ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="flex h-[58px] items-center gap-3 rounded-lg bg-white/10 px-3">
        <div className="h-8 w-8 rounded-full bg-[#D9D9D9]" />
        <span className="truncate text-sm font-semibold">{firstName}</span>
      </div>
    </div>
  );
}
