import React, { createContext, useContext, useEffect, useRef, useState } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  isTransitioning: boolean;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "campus_marketplace_theme";

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
      // Check system preference
      if (typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: light)").matches) {
        return "light";
      }
    } catch {
      // Fallback
    }
    return "dark"; // Default to dark for engineering terminal aesthetic
  });

  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionTimeoutRef = useRef<number | null>(null);

  const isDark = theme === "dark";

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    // Update HTML root element classes and dataset
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      if (theme === "dark") {
        root.classList.add("dark");
        root.classList.remove("light");
        root.setAttribute("data-theme", "dark");
        root.style.colorScheme = "dark";
      } else {
        root.classList.add("light");
        root.classList.remove("dark");
        root.setAttribute("data-theme", "light");
        root.style.colorScheme = "light";
      }
    }
  }, [theme]);

  const applyThemeWithTransition = (newTheme: ThemeMode) => {
    if (newTheme === theme) return;

    if (typeof document !== "undefined") {
      const root = document.documentElement;

      // Add transitioning class to trigger global smooth CSS interpolation
      root.classList.add("theme-transitioning");
      setIsTransitioning(true);

      if (transitionTimeoutRef.current) {
        window.clearTimeout(transitionTimeoutRef.current);
      }

      const finishTransition = () => {
        transitionTimeoutRef.current = window.setTimeout(() => {
          root.classList.remove("theme-transitioning");
          setIsTransitioning(false);
        }, 500);
      };

      // If document.startViewTransition is supported by modern browsers, use it for zero-jank cross-fade
      if ("startViewTransition" in document) {
        try {
          const transition = (document as any).startViewTransition(() => {
            setThemeState(newTheme);
          });
          if (transition && typeof transition.finished?.then === "function") {
            transition.finished.catch(() => {}).finally(finishTransition);
            return;
          }
        } catch {
          // Fallback if browser throws inside startViewTransition
        }
      }

      // Fallback for browsers without View Transitions API
      setThemeState(newTheme);
      finishTransition();
    } else {
      setThemeState(newTheme);
    }
  };

  const toggleTheme = () => {
    applyThemeWithTransition(theme === "dark" ? "light" : "dark");
  };

  const setTheme = (newTheme: ThemeMode) => {
    applyThemeWithTransition(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, isTransitioning, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

