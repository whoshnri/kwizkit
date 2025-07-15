"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    console.log("[ThemeProvider] Mounted");

    const storedTheme = localStorage.getItem("theme") as Theme | null;
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initial = storedTheme || (prefersDark ? "dark" : "light");

    console.log("[ThemeProvider] Stored theme:", storedTheme);
    console.log("[ThemeProvider] Prefers dark:", prefersDark);
    console.log("[ThemeProvider] Initial theme:", initial);

    setTheme(initial);

    if (initial === "dark") {
      document.documentElement.classList.add("dark");
      console.log("[ThemeProvider] Added .dark class");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("[ThemeProvider] Removed .dark class");
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "light" ? "dark" : "light";
    console.log("[ThemeToggle] Switching to:", next);

    setTheme(next);
    localStorage.setItem("theme", next);

    if (next === "dark") {
      document.documentElement.classList.add("dark");
      console.log("[ThemeToggle] Added .dark class");
    } else {
      document.documentElement.classList.remove("dark");
      console.log("[ThemeToggle] Removed .dark class");
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
