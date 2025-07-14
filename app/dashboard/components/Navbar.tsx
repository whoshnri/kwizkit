"use client";

import { Session } from "next-auth";
import { useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Home, PlusCircle, BookOpen, BarChart2, Settings, Menu, LogOut } from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: Home },
  { label: "My Tests", href: "/dashboard/tests", icon: BookOpen },
  { label: "Results", href: "/dashboard/results", icon: BarChart2 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];

interface NavProps {
  session: Session;
}

export default function Navbar({ session }: NavProps) {
  const [show, setShow] = useState(false);

  const toggleDrawer = () => {
    setShow(!show);
  };

  return (
    <div
      className={`rounded-lg h-screen theme-bg  shadow-lg transition-all duration-300 ease-in-out z-50 ${
        show ? "w-52" : "w-20"
      }`}
    >
      <div className={`flex flex-col h-full py-6  px-3`}>
        {/* Header */}
        <div className={`flex items-center ${show ? "justify-between" : "justify-center"} mb-6`}>
          {show && <span className="text-lg font-semibold text-gray-900 dark:text-white">Menu</span>}
          <button
            onClick={toggleDrawer}
            className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white focus:outline-none rounded-full"
            aria-label={show ? "Collapse menu" : "Expand menu"}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Items */}
        <div className={`flex flex-col gap-2 flex-1 `}>
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/50 hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none focus:ring-2 ${show ? "gap-3" : "justify-center"} focus:ring-blue-500 transition duration-200`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {show && <span className="text-sm font-medium">{item.label}</span>}
            </Link>
          ))}
        </div>

        {/* User Info and Logout */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700 px-2">
          <div className={`flex items-center gap-3 ${show ? "justify-between" : "justify-center"}`}>
            {session.user?.image ? (
              <img
                src={session.user.image}
                className="w-10 h-10 rounded-full border border-gray-300 dark:border-gray-600"
                alt="User profile"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300">
                {session.user.firstName?.[0] || "?"}
              </div>
            )}
            {show && (
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Signed in as {session.user.firstName}
                </p>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-xs text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-red-500 transition duration-200"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
