"use client";

import { useTheme } from "./theme-provider";
import { Sun, Moon } from "lucide-react";
import { useEffect } from "react";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    console.log("[ThemeToggle] Theme changed to:", theme);
  }, [theme]);

  return (
    <button
      onClick={() => {
        console.log("[ThemeToggle] Toggle clicked");
        toggleTheme();
      }}
      className="p-2 rounded-full cursor-pointer border dark:border-gray-700 border-gray-300 bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:opacity-80 transition"
      aria-label="Toggle Theme"
    >
      {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
