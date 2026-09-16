import React from "react";
import { motion, AnimatePresence } from "motion/react";
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
  const { theme, isDark, setTheme, toggleTheme, isTransitioning } = useTheme();

  if (variant === "button") {
    return (
      <motion.button
        id="theme-mode-toggle-button"
        type="button"
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.94 }}
        onClick={toggleTheme}
        title={`Current mode: ${isDark ? "Dark" : "Light"}. Click to switch to ${isDark ? "Light" : "Dark"} mode.`}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors duration-300 cursor-pointer select-none shadow-xs ${
          isDark
            ? "bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-amber-300 hover:text-amber-200"
            : "bg-white hover:bg-slate-50 border-slate-300 text-indigo-700 hover:text-indigo-900"
        } ${className}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="sun-icon"
              initial={{ rotate: -90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: 90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex items-center gap-1.5"
            >
              <Sun className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Light Mode</span>
            </motion.div>
          ) : (
            <motion.div
              key="moon-icon"
              initial={{ rotate: 90, scale: 0.5, opacity: 0 }}
              animate={{ rotate: 0, scale: 1, opacity: 1 }}
              exit={{ rotate: -90, scale: 0.5, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex items-center gap-1.5"
            >
              <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
              <span>Dark Mode</span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    );
  }

  if (variant === "dropdown-item") {
    return (
      <div
        className={`px-3 py-2 border-b flex items-center justify-between transition-colors duration-300 ${
          isDark ? "border-slate-700/80 bg-slate-900/40" : "border-slate-100 bg-slate-50/70"
        } ${className}`}
      >
        <span className={`text-xs font-semibold ${isDark ? "text-slate-300" : "text-slate-600"}`}>
          Appearance
        </span>
        <div
          role="radiogroup"
          aria-label="Theme selection"
          className={`relative flex items-center p-0.5 rounded-lg border transition-colors duration-300 ${
            isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200 shadow-2xs"
          }`}
        >
          <button
            type="button"
            role="radio"
            aria-checked={!isDark}
            onClick={() => setTheme("light")}
            title="Select Light Mode"
            className={`relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors duration-200 ${
              !isDark ? "text-slate-950 font-extrabold" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {!isDark && (
              <motion.div
                layoutId="dropdown-theme-pill"
                className="absolute inset-0 rounded-md bg-amber-400 shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <Sun className={`w-3.5 h-3.5 transition-transform duration-300 ${!isDark ? "rotate-12" : ""}`} />
            <span>Light</span>
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={isDark}
            onClick={() => setTheme("dark")}
            title="Select Dark Mode"
            className={`relative z-10 flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold cursor-pointer transition-colors duration-200 ${
              isDark ? "text-white font-extrabold" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {isDark && (
              <motion.div
                layoutId="dropdown-theme-pill"
                className="absolute inset-0 rounded-md bg-indigo-600 shadow-xs -z-10"
                transition={{ type: "spring", stiffness: 450, damping: 32 }}
              />
            )}
            <Moon className={`w-3.5 h-3.5 transition-transform duration-300 ${isDark ? "-rotate-12" : ""}`} />
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
      className={`relative inline-flex items-center p-1 rounded-xl border transition-colors duration-400 shadow-inner ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80"
          : "bg-slate-200/90 border-slate-300/80"
      } ${className}`}
    >
      <button
        id="theme-select-light-btn"
        type="button"
        role="radio"
        aria-checked={!isDark}
        onClick={() => setTheme("light")}
        title="Select Light Mode"
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer select-none transition-colors duration-200 ${
          !isDark
            ? "text-slate-950 font-extrabold"
            : isDark
            ? "text-slate-400 hover:text-slate-200"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        {!isDark && (
          <motion.div
            layoutId="segmented-theme-active-indicator"
            className="absolute inset-0 rounded-lg bg-white border border-slate-200/90 shadow-sm -z-10"
            transition={{ type: "spring", stiffness: 480, damping: 34 }}
          />
        )}
        <Sun
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            !isDark ? "text-amber-500 fill-amber-400 rotate-12 scale-110" : "text-slate-400"
          }`}
        />
        <span>Light</span>
      </button>

      <button
        id="theme-select-dark-btn"
        type="button"
        role="radio"
        aria-checked={isDark}
        onClick={() => setTheme("dark")}
        title="Select Dark Mode"
        className={`relative z-10 flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer select-none transition-colors duration-200 ${
          isDark
            ? "text-white font-extrabold"
            : "text-slate-600 hover:text-slate-900"
        }`}
      >
        {isDark && (
          <motion.div
            layoutId="segmented-theme-active-indicator"
            className="absolute inset-0 rounded-lg bg-indigo-600 border border-indigo-400/50 shadow-md shadow-indigo-600/30 -z-10"
            transition={{ type: "spring", stiffness: 480, damping: 34 }}
          />
        )}
        <Moon
          className={`w-3.5 h-3.5 transition-transform duration-300 ${
            isDark ? "text-indigo-200 fill-indigo-200 -rotate-12 scale-110" : "text-slate-500"
          }`}
        />
        <span>Dark</span>
      </button>
    </div>
  );
};

