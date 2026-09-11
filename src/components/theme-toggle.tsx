"use client";

import React from "react";
import { useTheme } from "@/lib/theme-context";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Prevent layout jump or incorrect icon during initial hydration
  if (!mounted) {
    return (
      <div
        className={`inline-flex items-center justify-center h-9 w-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 ${className}`}
        aria-hidden="true"
      />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      aria-label={isDark ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}
      className={`inline-flex items-center gap-2 p-2 rounded-xl transition-all duration-200 active:scale-95 cursor-pointer border ${
        isDark
          ? "bg-slate-900/90 text-amber-300 border-slate-800 hover:bg-slate-800 hover:text-amber-200 shadow-sm"
          : "bg-white text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-slate-950 shadow-xs"
      } ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 transition-transform duration-300 -rotate-12 hover:rotate-0 text-slate-700" />
      )}
      {showLabel && (
        <span className="text-xs font-semibold select-none">
          {isDark ? "Mode Terang" : "Mode Gelap"}
        </span>
      )}
    </button>
  );
}
