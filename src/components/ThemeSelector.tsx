import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface ThemeSelectorProps {
  variant?: "segmented" | "button" | "dropdown-item";
  className?: string;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  variant = "segmented",
  className = "",
}) => {
  const { theme, isDark, setTheme, toggleTheme } = useTheme();

  if (variant === "button") {
    return (
      <button
        id="theme-mode-toggle-button"
        type="button"
        onClick={toggleTheme}
        title={`Current mode: ${isDark ? "Dark" : "Light"}. Click to switch to ${isDark ? "Light" : "Dark"} mode.`}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none shadow-xs ${
          isDark
            ? "bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-amber-300 hover:text-amber-200"
            : "bg-white hover:bg-slate-50 border-slate-300 text-indigo-700 hover:text-indigo-900"
        } ${className}`}
      >
        {isDark ? (
          <>
            <Sun className="w-4 h-4 text-amber-400 shrink-0 animate-spin-slow" />
            <span>Light Mode</span>
          </>
        ) : (
          <>
            <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>Dark Mode</span>
          </>
        )}
      </button>
    );
  }

  if (variant === "dropdown-item") {
    return (
      <div
        className={`px-3 py-2 border-b flex items-center justify-between ${
          isDark ? "border-slate-700/80 bg-slate-900/40" : "border-slate-100 bg-slate-50/70"
        } ${className}`}
      >
        <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          Appearance
        </span>
        <div
          role="radiogroup"
          aria-label="Theme selection"
          className={`flex items-center p-0.5 rounded-lg border ${
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-2xs"
          }`}
        >
          <button
            type="button"
            role="radio"
            aria-checked={!isDark}
            onClick={() => setTheme("light")}
            title="Select Light Mode"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              !isDark
                ? "bg-amber-400 text-slate-950 shadow-xs"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Light</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={isDark}
            onClick={() => setTheme("dark")}
            title="Select Dark Mode"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
              isDark
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>
      </div>
    );
  }

  // Default: segmented selector with both Light & Dark buttons clearly visible
  return (
    <div
      role="radiogroup"
      aria-label="Theme mode selector"
      className={`inline-flex items-center p-1 rounded-xl border transition-all ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 shadow-inner"
          : "bg-slate-800/90 border-slate-700 shadow-inner"
      } ${className}`}
    >
      <button
        id="theme-select-light-btn"
        type="button"
        role="radio"
        aria-checked={!isDark}
        onClick={() => setTheme("light")}
        title="Select Light Mode"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
          !isDark
            ? "bg-white text-slate-950 border border-slate-200 shadow-sm"
            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
        }`}
      >
        <Sun className={`w-3.5 h-3.5 ${!isDark ? "text-amber-500 fill-amber-400" : "text-slate-400"}`} />
        <span>Light</span>
      </button>

      <button
        id="theme-select-dark-btn"
        type="button"
        role="radio"
        aria-checked={isDark}
        onClick={() => setTheme("dark")}
        title="Select Dark Mode"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer select-none ${
          isDark
            ? "bg-indigo-600 text-white border border-indigo-400/50 shadow-sm"
            : "text-slate-300 hover:text-white hover:bg-slate-700/60"
        }`}
      >
        <Moon className={`w-3.5 h-3.5 ${isDark ? "text-indigo-200 fill-indigo-200" : "text-slate-400"}`} />
        <span>Dark</span>
      </button>
    </div>
  );
};
