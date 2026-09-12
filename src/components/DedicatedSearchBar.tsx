import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Sparkles, Tag, ArrowRight, CornerDownLeft } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface DedicatedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResultsCount: number;
  selectedCategory: string;
  onSelectCategory?: (category: any) => void;
}

const STORAGE_KEY = "campus_marketplace_recent_searches";
const POPULAR_CAMPUS_SEARCHES = [
  { label: "Casio fx-991", category: "Calculators" },
  { label: "SPPU Textbooks", category: "Books" },
  { label: "Mini Drafter", category: "Lab Equipment" },
  { label: "Campus Cycles", category: "Cycles" },
  { label: "Engineering Maths M3", category: "Books" },
  { label: "Workshop Apron", category: "Lab Equipment" },
  { label: "Vernier Caliper", category: "Lab Equipment" },
];

export const DedicatedSearchBar: React.FC<DedicatedSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  totalResultsCount,
  selectedCategory,
  onSelectCategory,
}) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 6);
        }
      }
    } catch (e) {
      console.warn("Could not load recent searches", e);
    }
    return [
      "Casio Calculator",
      "B.S. Grewal",
      "Mini Drafter",
      "Campus Cycle",
      "Vernier Caliper",
    ];
  });

  // Handle outside clicks to close dropdown
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
    const updated = [clean, ...recentSearches.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save recent searches", e);
    }
  };

  const removeRecentSearch = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (err) {
      console.warn("Could not remove recent search", err);
    }
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn("Could not clear recent searches", err);
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

  return (
    <section
      id="dedicated-search-bar-section"
      aria-label="Dedicated Campus Marketplace Search"
      className="w-full mb-2"
    >
      <div
        className={`w-full rounded-2xl p-4 sm:p-5 border transition-all duration-200 shadow-sm relative overflow-visible ${
          isDark
            ? isFocused
              ? "bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-indigo-950/50"
              : "bg-slate-900/90 hover:bg-slate-900 border-slate-800"
            : isFocused
            ? "bg-white border-indigo-400 ring-2 ring-indigo-500/15 shadow-md shadow-indigo-100"
            : "bg-white hover:bg-slate-50/80 border-slate-200"
        }`}
      >
        {/* Top Context Header: Label & Live Results Status */}
        <div className="flex items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                isDark ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Campus Search Console</span>
            </span>
            {selectedCategory !== "All" && (
              <span
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold border ${
                  isDark
                    ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}
              >
                Category: {selectedCategory}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs">
            {searchQuery ? (
              <div className="flex items-center gap-1.5">
                <span
                  className={`font-semibold ${
                    totalResultsCount > 0
                      ? isDark
                        ? "text-emerald-400"
                        : "text-emerald-700"
                      : isDark
                      ? "text-amber-400"
                      : "text-amber-700"
                  }`}
                >
                  {totalResultsCount} {totalResultsCount === 1 ? "match" : "matches"} found
                </span>
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors underline cursor-pointer ml-1"
                >
                  Clear
                </button>
              </div>
            ) : (
              <span className={`hidden sm:inline text-[11px] font-mono ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Quick focus: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">/</kbd>
              </span>
            )}
          </div>
        </div>

        {/* Elongated Dedicated Search Input Bar */}
        <div ref={containerRef} className="relative w-full">
          <form onSubmit={handleSubmit} className="relative w-full flex items-center">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 flex items-center gap-1.5">
              <Search
                className={`w-5 h-5 transition-colors ${
                  isFocused ? (isDark ? "text-indigo-400" : "text-indigo-600") : "text-slate-400"
                }`}
              />
            </div>

            <input
              ref={inputRef}
              id="dedicated-search-bar-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (!isDropdownOpen) setIsDropdownOpen(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                setIsDropdownOpen(true);
              }}
              onBlur={() => setIsFocused(false)}
              placeholder="Search by gear name, model, SPPU course code (e.g. Casio fx-991CW, M3 Maths, Mini Drafter, Cycle)..."
              className={`w-full pl-12 sm:pl-13 pr-28 sm:pr-32 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-medium outline-none transition-all ${
                isDark
                  ? "bg-slate-950/80 text-white placeholder:text-slate-500 border border-slate-800 focus:border-indigo-500"
                  : "bg-slate-50/90 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-indigo-500"
              }`}
            />

            {/* Right Action Cluster in Search Bar */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear search text"
                  aria-label="Clear search text"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              <button
                type="submit"
                id="dedicated-search-submit-btn"
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  searchQuery.trim()
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/25"
                    : isDark
                    ? "bg-slate-800 text-slate-400 hover:text-slate-200"
                    : "bg-slate-200 text-slate-600 hover:text-slate-900"
                }`}
                title="Search campus marketplace"
              >
                <span>Search</span>
                <CornerDownLeft className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Search Dropdown: Query Action + Recent History */}
          {isDropdownOpen && (
            <div
              id="dedicated-search-dropdown"
              className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl ${
                isDark
                  ? "bg-slate-900/98 border-slate-700 text-slate-100"
                  : "bg-white/98 border-slate-200 text-slate-900"
              }`}
            >
              {searchQuery.trim() && (
                <div
                  onClick={() => {
                    addRecentSearch(searchQuery);
                    setIsDropdownOpen(false);
                  }}
                  className={`p-3 px-4 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors border-b ${
                    isDark
                      ? "bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border-indigo-800/50"
                      : "bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 border-indigo-100"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <Search className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span>Search for &ldquo;{searchQuery}&rdquo;</span>
                  </div>
                  <span className="text-[11px] font-bold text-indigo-500 flex items-center gap-1">
                    <span>Press Enter</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              )}

              {/* Recent Searches Header */}
              <div
                className={`px-4 py-2 flex items-center justify-between border-b text-xs ${
                  isDark
                    ? "bg-slate-950/70 border-slate-800 text-slate-400"
                    : "bg-slate-50 border-slate-100 text-slate-500"
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Recent Searches</span>
                </div>
                {recentSearches.length > 0 && (
                  <button
                    type="button"
                    onClick={clearAllRecent}
                    className="text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {recentSearches.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400">
                  No recent searches yet. Search any engineering equipment above!
                </div>
              ) : (
                <div className="divide-y divide-slate-800/40 max-h-56 overflow-y-auto">
                  {recentSearches.map((term) => (
                    <div
                      key={term}
                      onClick={() => {
                        onSearchChange(term);
                        addRecentSearch(term);
                        setIsDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between px-4 py-2.5 text-xs cursor-pointer transition-colors ${
                        isDark
                          ? "hover:bg-slate-800/70 text-slate-200 hover:text-white"
                          : "hover:bg-slate-50 text-slate-700 hover:text-indigo-600"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-medium">{term}</span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => removeRecentSearch(term, e)}
                        title="Remove from history"
                        aria-label={`Remove ${term} from search history`}
                        className="p-1 text-slate-400 hover:text-rose-500 rounded-md transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Dedicated Popular Campus Search Shortcuts */}
        <div className="pt-3 mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
          <span
            className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 mr-1 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            <Tag className="w-3 h-3 text-indigo-400" />
            <span>Popular:</span>
          </span>

          {POPULAR_CAMPUS_SEARCHES.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                onSearchChange(item.label);
                addRecentSearch(item.label);
                if (onSelectCategory && selectedCategory !== "All" && selectedCategory !== item.category) {
                  // Keep search versatile
                }
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 ${
                searchQuery.toLowerCase().includes(item.label.toLowerCase())
                  ? isDark
                    ? "bg-indigo-600 text-white border-indigo-500 shadow-xs"
                    : "bg-indigo-600 text-white border-indigo-600 shadow-xs"
                  : isDark
                  ? "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80 hover:border-indigo-500/40"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border-slate-200"
              }`}
            >
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
