import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface DedicatedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResultsCount: number;
  selectedCategory: string;
  onSelectCategory?: (category: any) => void;
  categoryStockCounts?: Record<string, number>;
}

const STORAGE_KEY = "campus_marketplace_recent_searches";

const CATEGORY_ITEMS = [
  { key: "All", label: "All" },
  { key: "Books", label: "Books" },
  { key: "Calculators", label: "Calculators" },
  { key: "Lab Equipment", label: "Lab Equipment" },
  { key: "Cycles", label: "Cycles" },
  { key: "Bags", label: "Bags" },
  { key: "Other", label: "Other" },
];

export const DedicatedSearchBar: React.FC<DedicatedSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  totalResultsCount,
  selectedCategory,
  onSelectCategory,
  categoryStockCounts = {},
}) => {
  const { isDark } = useTheme();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch {
      // ignore storage errors
    }
    return ["Casio fx-991", "SPPU Textbooks", "Mini Drafter", "Campus Cycle"];
  });

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const addRecentSearch = (term: string) => {
    const clean = term.trim();
    if (!clean) return;
    const updated = [
      clean,
      ...recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      addRecentSearch(searchQuery);
      setIsDropdownOpen(false);
      inputRef.current?.blur();
    }
  };

  const totalStock = Object.values(categoryStockCounts).reduce((a, b) => a + b, 0);

  return (
    <section
      id="dedicated-search-bar-section"
      aria-label="Search Campus Marketplace"
      className="w-full space-y-3"
    >
      {/* Clean Single-Row Search Bar */}
      <div ref={containerRef} className="relative w-full">
        <form onSubmit={handleSubmit} className="relative w-full flex items-center">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? "text-[#6D7E76]" : "text-[#83928A]"
            }`}
          />

          <input
            ref={inputRef}
            id="dedicated-search-bar-input"
            type="text"
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (!isDropdownOpen) setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search textbooks, calculators, drafters, cycles..."
            className={`w-full h-11 pl-10 pr-24 rounded-xl text-sm outline-none border ${
              isDark
                ? "bg-[#141A18] text-[#ECF2EF] placeholder:text-[#6D7E76] border-[#242E2A] focus:border-[#5BA18C]"
                : "bg-white text-[#18201C] placeholder:text-[#83928A] border-[#DFE6E2] focus:border-[#2F5D50]"
            }`}
          />

          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            {searchQuery && (
              <>
                <span
                  className={`hidden sm:inline text-[11px] font-mono tabular-nums mr-1 ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  {totalResultsCount} {totalResultsCount === 1 ? "result" : "results"}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    inputRef.current?.focus();
                  }}
                  className={`p-1.5 rounded-md cursor-pointer ${
                    isDark
                      ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                      : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
                  }`}
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </form>

        {/* Minimal Recent Searches Dropdown */}
        {isDropdownOpen && recentSearches.length > 0 && (
          <div
            id="dedicated-search-dropdown"
            className={`absolute left-0 right-0 top-full mt-1.5 rounded-xl border shadow-lg overflow-hidden z-40 ${
              isDark
                ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
                : "bg-white border-[#DFE6E2] text-[#18201C]"
            }`}
          >
            <div
              className={`px-3.5 py-2 flex items-center justify-between border-b text-[11px] ${
                isDark
                  ? "border-[#242E2A] text-[#8FA199]"
                  : "border-[#DFE6E2] text-[#5C6B63]"
              }`}
            >
              <span>Recent searches</span>
              <button
                type="button"
                onClick={clearAllRecent}
                className="hover:underline cursor-pointer"
              >
                Clear
              </button>
            </div>
            <div className={`divide-y ${isDark ? "divide-[#242E2A]" : "divide-[#EFF4F1]"}`}>
              {recentSearches.map((term) => (
                <div
                  key={term}
                  onClick={() => {
                    onSearchChange(term);
                    addRecentSearch(term);
                    setIsDropdownOpen(false);
                  }}
                  className={`flex items-center justify-between px-3.5 py-2 text-xs cursor-pointer ${
                    isDark ? "hover:bg-[#1B2320]" : "hover:bg-[#F7F9F8]"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Clock className="w-3.5 h-3.5 text-[#83928A] shrink-0" />
                    <span className="truncate">{term}</span>
                  </span>
                  <button
                    type="button"
                    onClick={(e) => removeRecentSearch(term, e)}
                    aria-label={`Remove ${term}`}
                    className="p-1 text-[#83928A] hover:text-[#18201C] dark:hover:text-[#ECF2EF] cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Cleanly Aligned Category Filter Bar */}
      <div
        role="group"
        aria-label="Filter by category"
        className="w-full flex items-center gap-2 overflow-x-auto no-scrollbar lg:grid lg:grid-cols-7"
      >
        {CATEGORY_ITEMS.map((cat) => {
          const isSelected = selectedCategory === cat.key;
          const stock =
            cat.key === "All" ? totalStock : categoryStockCounts[cat.key] ?? 0;

          return (
            <button
              key={cat.key}
              type="button"
              id={`search-console-category-${cat.key.toLowerCase().replace(/\s+/g, "-")}`}
              onClick={() => onSelectCategory && onSelectCategory(cat.key)}
              className={`h-9 px-3 rounded-lg text-xs font-medium inline-flex items-center justify-between gap-2 border whitespace-nowrap shrink-0 cursor-pointer ${
                isSelected
                  ? isDark
                    ? "bg-[#387262] text-white border-[#387262] font-semibold"
                    : "bg-[#2F5D50] text-white border-[#2F5D50] font-semibold"
                  : isDark
                  ? "bg-[#141A18] text-[#8FA199] hover:text-[#ECF2EF] border-[#242E2A] hover:border-[#34433D]"
                  : "bg-white text-[#5C6B63] hover:text-[#18201C] border-[#DFE6E2] hover:border-[#C4D1CA]"
              }`}
            >
              <span className="truncate">{cat.label}</span>
              <span
                className={`text-[11px] font-mono tabular-nums shrink-0 ${
                  isSelected
                    ? "text-white/80"
                    : isDark
                    ? "text-[#6D7E76]"
                    : "text-[#83928A]"
                }`}
              >
                {stock}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
};
