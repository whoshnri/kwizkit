"use client";

import { useState } from "react";
import Link from "next/link";
import { VscBook, VscGraph, VscHome } from "react-icons/vsc";
import { usePathname } from "next/navigation";
import { CiDatabase, CiSettings } from "react-icons/ci";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: VscHome },
  { label: "My Tests", href: "/dashboard/tests", icon: VscBook },
  { label: "My Databases", href: "/dashboard/database", icon: CiDatabase },
  { label: "Results", href: "/dashboard/results", icon: VscGraph },
  { label: "Settings", href: "/dashboard/settings", icon: CiSettings },
];


export default function Navbar() {
  const pathname = usePathname();


  return (
    <TooltipProvider>
      <div
        className={`rounded theme-bg shadow-lg transition-all duration-300 ease-in-out z-50`}
      >
        <div className={`flex flex-col min-h-screen py-6 px-2 items-center`}>
          {/* Navigation Items */}
          <div className={`flex flex-col gap-2 flex-1`}>
            {navItems.map((item) => (
              <Link
                href={item.href}
                key={item.href}
                className={`flex ${pathname === item.href ? 'brand-bg text-white' : ''} items-center gap-3 px-3 py-2 rounded-lg theme-text focus:outline-none focus:ring-2  transition duration-200`}
              >
                <Tooltip >
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-center ">
                      <item.icon className={`h-5 w-5 flex-shrink-0 ${pathname === item.href ? 'text-white' : ''}`} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right" >
                    <p className="text-white">{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}