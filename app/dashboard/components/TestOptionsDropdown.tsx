"use client";

import { Menu } from "@headlessui/react";
import { MoreHorizontal, Settings, Trash } from "lucide-react";
import { useState } from "react";


interface MenuProps {
  setShowSettingsModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedTestId: React.Dispatch<React.SetStateAction<string>>;
  testId: string;
  testVisibility: boolean;
  testSlug: string;
}

export default function TestActions({
  setShowSettingsModal,
  setShowDeleteModal,
  setSelectedTestId,
  testId,
  testSlug,
  testVisibility,
}: MenuProps) {


  return (
    <div className="text-right">
      <Menu as="div" className="relative inline-block text-left">
        <Menu.Button className="inline-flex items-center gap-2 rounded-md theme-bg px-3 py-1.5 text-sm font-semibold theme-text shadow focus:outline-none hover:bg-gray-800/70">
          <MoreHorizontal className="w-4 h-4" />
        </Menu.Button>

        <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-xl border border-white/10 theme-bg backdrop-blur-md p-1 text-sm theme-text shadow-lg ring-1 ring-black/5 focus:outline-none z-10">
          {/* Settings Option */}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTestId(testId);
                  setShowSettingsModal(true);
                }}
                className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 transition-colors ${
                  active ? "theme-bg-subtle cursor-pointer" : ""
                }`}
              >
                <Settings className="w-4 h-4" />
                Edit Settings
              </button>
            )}
          </Menu.Item>

          {/* Delete Option */}
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTestId(testId);
                  setShowDeleteModal(true);
                }}
                className={`flex items-center gap-2 w-full rounded-lg px-3 py-2 transition-colors text-red-500 ${
                  active ? "bg-red-500/20 cursor-pointer" : ""
                }`}
              >
                <Trash className="w-4 h-4" />
                Delete Test
              </button>
            )}
          </Menu.Item>
        </Menu.Items>
      </Menu>
    </div>
  );
}
