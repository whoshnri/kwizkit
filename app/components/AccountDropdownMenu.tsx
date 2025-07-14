"use client"

import { Menu } from '@headlessui/react'
import Link from "next/link"
import { signOut } from "next-auth/react";
import type { Session } from "next-auth"
import { User, LayoutDashboard, LogOut } from "lucide-react"
import { ChevronDownIcon, UserIcon } from '@heroicons/react/24/solid'

interface MenuProps {
  session: Session
}

export default function AccountDropdownMenu({ session }: MenuProps) {
  return (
    <div className="text-right">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex items-center gap-2 rounded-md theme-bg px-3 py-1.5 text-sm font-semibold theme-text shadow focus:outline-none hover:bg-gray-800/70">
          {session.user.image ? (
            <img
              src={session.user.image}
              className="w-9 h-9 rounded-full border-2 border-transparent hover:border-blue-500 transition-all"
              alt="User profile"
            />
          ) : (
            <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-700 text-sm font-bold text-gray-700 dark:text-gray-300 border-2 border-transparent hover:border-blue-500 transition-all">
              {session.user.name?.charAt(0).toUpperCase() || <UserIcon className="w-4 h-4" />}
            </div>
          )}
          <ChevronDownIcon className="w-4 h-4 cursor-pointer" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-white/10 theme-bg backdrop-blur-md p-1 text-sm theme-text shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/dashboard"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  active ? 'theme-bg-subtle' : ''
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <Link
                href="/account"
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  active ? 'theme-bg-subtle' : ''
                }`}
              >
                <User className="w-4 h-4" />
                View Profile
              </Link>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <p
                onClick={() => signOut()}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                  active ? 'bg-red-500 text-white cursor-pointer' : ''
                }`}
              >
                <LogOut className="w-4 h-4" />
                Logout
              </p>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  )
}
