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
  const { isDark, setTheme, toggleTheme } = useTheme();

  if (variant === "button") {
    return (
      <button
        id="theme-mode-toggle-button"
        type="button"
        onClick={toggleTheme}
        title={`Current mode: ${isDark ? "Dark" : "Light"}. Click to switch to ${
          isDark ? "Light" : "Dark"
        } mode.`}
        aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold cursor-pointer select-none ${
          isDark
            ? "bg-[#141A18] hover:bg-[#1B2320] border-[#242E2A] text-[#ECF2EF]"
            : "bg-white hover:bg-[#EFF4F1] border-[#DFE6E2] text-[#18201C]"
        } ${className}`}
      >
        {isDark ? (
          <span className="flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-[#DFC29B] shrink-0" />
            <span>Light Mode</span>
          </span>
        ) : (
          <span className="flex items-center gap-1.5">
            <Moon className="w-4 h-4 text-[#2F5D50] shrink-0" />
            <span>Dark Mode</span>
          </span>
        )}
      </button>
    );
  }

  if (variant === "dropdown-item") {
    return (
      <div
        className={`px-3 py-2 border-b flex items-center justify-between ${
          isDark
            ? "border-[#242E2A] bg-[#141A18]"
            : "border-[#DFE6E2] bg-[#F7F9F8]"
        } ${className}`}
      >
        <span
          className={`text-xs font-semibold ${
            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
          }`}
        >
          Appearance
        </span>
        <div
          role="radiogroup"
          aria-label="Theme selection"
          className={`relative flex items-center p-0.5 rounded-lg border ${
            isDark
              ? "bg-[#0D1110] border-[#242E2A]"
              : "bg-[#EFF4F1] border-[#DFE6E2]"
          }`}
        >
          <button
            type="button"
            role="radio"
            aria-checked={!isDark}
            onClick={() => setTheme("light")}
            title="Select Light Mode"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
              !isDark
                ? "bg-white text-[#18201C] border border-[#DFE6E2]"
                : "text-[#8FA199] hover:text-[#ECF2EF]"
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
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer ${
              isDark
                ? "bg-[#387262] text-white"
                : "text-[#5C6B63] hover:text-[#18201C]"
            }`}
          >
            <Moon className="w-3.5 h-3.5" />
            <span>Dark</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme mode selector"
      className={`relative inline-flex items-center p-1 rounded-xl border ${
        isDark
          ? "bg-[#0D1110] border-[#242E2A]"
          : "bg-[#EFF4F1] border-[#DFE6E2]"
      } ${className}`}
    >
      <button
        id="theme-select-light-btn"
        type="button"
        role="radio"
        aria-checked={!isDark}
        onClick={() => setTheme("light")}
        title="Select Light Mode"
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer select-none ${
          !isDark
            ? "bg-white border border-[#DFE6E2] text-[#18201C]"
            : "text-[#8FA199] hover:text-[#ECF2EF]"
        }`}
      >
        <Sun
          className={`w-3.5 h-3.5 ${
            !isDark ? "text-[#9E6B43]" : "text-[#8FA199]"
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
        className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer select-none ${
          isDark
            ? "bg-[#387262] text-white"
            : "text-[#5C6B63] hover:text-[#18201C]"
        }`}
      >
        <Moon
          className={`w-3.5 h-3.5 ${
            isDark ? "text-white" : "text-[#5C6B63]"
          }`}
        />
        <span>Dark</span>
      </button>
    </div>
  );
};
