"use client";
import { useEffect } from "react";
import { Menu } from "@headlessui/react";
import Link from "next/link";
import { LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { LogOut } from "lucide-react";
import { UserIcon } from "@heroicons/react/24/solid";
import { TbLayoutDashboardFilled } from "react-icons/tb";

interface MenuProps {
  session: any;
}

export default function AccountDropdownMenu({ session }: MenuProps) {
  useEffect(() => {
    console.log("Session changed:", session);
  }, [session]);
  return (
    <div className="text-right z-50">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex items-center gap-2 theme-bg py-1.5 text-xs font-semibold theme-text focus:outline-none hover:bg-gray-800/70">
          {session.picture ? (
            <img
              src={session.picture}
              className="w-7 h-7 rounded-full border-2 border-transparent hover:border-blue-500 transition-all"
              alt="User profile"
            />
          ) : (
            <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-xs font-bold text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-blue-500 transition-all">
              {session.given_name?.charAt(0).toUpperCase() || (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
          )}
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-36 origin-top-right rounded-xl border border-white/10 theme-bg backdrop-blur-md p-1 text-xs theme-text shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/dashboard"
                className={`flex items-center hover:theme-bg-subtle gap-2 rounded-lg px-3 py-2 transition-colors ${
                  active ? "theme-bg-subtle" : ""
                }`}
              >
                <TbLayoutDashboardFilled className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </Menu.Item>
          {/* <Menu.Item>
            {({ active }) => (
              <Link
                href="/account"
                className={`flex items-center hover:theme-bg-subtle gap-2 rounded-lg px-3 py-2 transition-colors ${
                  active ? "theme-bg-subtle" : ""
                }`}
              >
                <User className="w-4 h-4" />
                View Profile
              </Link>
            )}
          </Menu.Item> */}
          <Menu.Item>
            {({ active }) => (
              <p
                className={`flex items-center hover:theme-bg-subtle gap-2 rounded-lg px-3 py-2 transition-colors ${
                  active ? "bg-red-500 text-white cursor-pointer" : ""
                }`}
              >
                <LogOut className="w-4 h-4" />
                <LogoutLink>Log out</LogoutLink>
              </p>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
}
