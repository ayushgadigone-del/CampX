import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Search,
  X,
  Clock,
  Sparkles,
  Tag,
  ArrowRight,
  CornerDownLeft,
  BookOpen,
  Calculator,
  FlaskConical,
  Bike,
  Briefcase,
  Package,
  Layers,
  Boxes,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { HorizontalSlider } from "./HorizontalSlider";

interface DedicatedSearchBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalResultsCount: number;
  selectedCategory: string;
  onSelectCategory?: (category: any) => void;
  categoryStockCounts?: Record<string, number>;
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

const CATEGORY_ITEMS = [
  { key: "All", label: "Total:", icon: Layers },
  { key: "Cycles", label: "Cycles", icon: Bike },
  { key: "Books", label: "Books", icon: BookOpen },
  { key: "Calculators", label: "Calculators", icon: Calculator },
  { key: "Lab Equipment", label: "Lab Equipment", icon: FlaskConical },
  { key: "Bags", label: "Bags", icon: Briefcase },
  { key: "Other", label: "Other", icon: Package },
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
              ? "bg-[#0F172A] border-indigo-500/80 ring-2 ring-indigo-500/20 shadow-lg shadow-indigo-950/40"
              : "bg-[#0F172A]/85 hover:bg-[#0F172A] border-slate-800/90 ring-1 ring-white/5"
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
              placeholder="Search gear, Casio fx-991, SPPU books, cycles, drafters..."
              className={`w-full pl-12 sm:pl-13 pr-28 sm:pr-32 py-3.5 sm:py-4 rounded-xl text-sm sm:text-base font-medium outline-none transition-all ${
                isDark
                  ? "bg-slate-950/80 text-white placeholder:text-slate-500 border border-slate-800 focus:border-indigo-500"
                  : "bg-slate-50/90 text-slate-900 placeholder:text-slate-400 border border-slate-200 focus:border-indigo-500"
              }`}
            />

            {/* Right Action Cluster in Search Bar */}
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery && (
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => {
                    onSearchChange("");
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Clear search text"
                  aria-label="Clear search text"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              )}

              <motion.button
                type="submit"
                id="dedicated-search-submit-btn"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
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
              </motion.button>
            </div>
          </form>

          {/* Search Dropdown: Query Action + Recent History with AnimatePresence */}
          <AnimatePresence>
            {isDropdownOpen && (
              <motion.div
                id="dedicated-search-dropdown"
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className={`absolute left-0 right-0 top-full mt-2 rounded-2xl border shadow-2xl overflow-hidden z-50 backdrop-blur-xl ${
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
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Category Available Stock Console Bar */}
        <div className="pt-3.5 mt-2 border-t border-slate-700/50 dark:border-slate-800/80">
          <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <Boxes className="w-3.5 h-3.5 text-purple-400" />
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDark ? "text-purple-300" : "text-purple-700 font-extrabold"
                }`}
              >
                Category Available Stock:
              </span>
            </div>
            <span
              className={`text-[11px] font-medium ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Click any category to filter &bull; Real-time Pune campus inventory
            </span>
          </div>

          <HorizontalSlider
            id="search-console-stock-slider"
            showArrows={true}
            showProgress={true}
            showMobileHint={true}
            scrollStep={220}
            itemSnap={true}
            ariaLabel="Campus Categories Available Stock Slider"
            trackClassName="gap-2 sm:gap-2.5 py-1"
          >
            {CATEGORY_ITEMS.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.key;
              const stock =
                cat.key === "All"
                  ? Object.values(categoryStockCounts).reduce((a, b) => a + b, 0)
                  : categoryStockCounts[cat.key] ?? 0;

              return (
                <button
                  key={cat.key}
                  type="button"
                  id={`search-console-category-${cat.key.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => onSelectCategory && onSelectCategory(cat.key)}
                  className={`group relative flex items-center justify-between gap-2 sm:gap-2.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 cursor-pointer select-none whitespace-nowrap shrink-0 snap-start hover:shadow-[0_0_22px_rgba(168,85,247,0.65)] hover:border-purple-400 hover:ring-2 hover:ring-purple-400/50 ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white border-purple-400 ring-2 ring-purple-400/60 shadow-lg shadow-purple-600/30 scale-[1.02]"
                      : isDark
                      ? "bg-slate-800/85 hover:bg-slate-800 text-slate-200 hover:text-white border-slate-700/80"
                      : "bg-slate-50/90 hover:bg-purple-50/80 text-slate-700 hover:text-purple-700 border-slate-200 shadow-2xs"
                  }`}
                >
                  <div className="flex items-center gap-1.5 shrink-0 whitespace-nowrap">
                    <Icon
                      className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                        isSelected
                          ? "text-white"
                          : "text-purple-400 group-hover:text-purple-300"
                      }`}
                    />
                    <span className="font-bold whitespace-nowrap">{cat.label}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-black shrink-0 whitespace-nowrap transition-all ${
                      stock === 0
                        ? isSelected
                          ? "bg-rose-600 text-white shadow-xs ring-1 ring-rose-300"
                          : isDark
                          ? "bg-rose-950/80 text-rose-300 border border-rose-800/80 group-hover:bg-rose-900"
                          : "bg-rose-100 text-rose-700 border border-rose-300 group-hover:bg-rose-200"
                        : isSelected
                        ? "bg-emerald-600 text-white shadow-xs ring-1 ring-emerald-300"
                        : isDark
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 group-hover:bg-emerald-900"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-300 group-hover:bg-emerald-200"
                    }`}
                  >
                    {stock > 0 ? `${stock} in stock` : "0 in stock"}
                  </span>
                </button>
              );
            })}
          </HorizontalSlider>
        </div>

        {/* Dedicated Popular Campus Search Shortcuts (Slideable on mobile) */}
        <div className="pt-3 mt-2">
          <HorizontalSlider
            id="search-console-popular-slider"
            showArrows={true}
            showProgress={false}
            showMobileHint={false}
            scrollStep={180}
            ariaLabel="Popular campus searches slider"
            trackClassName="gap-1.5 sm:gap-2 py-1 items-center"
          >
            <span
              className={`text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 mr-1 shrink-0 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              <Tag className="w-3 h-3 text-indigo-400" />
              <span>Popular:</span>
            </span>

            {POPULAR_CAMPUS_SEARCHES.map((item) => (
              <motion.button
                key={item.label}
                type="button"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onSearchChange(item.label);
                  addRecentSearch(item.label);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0 snap-start hover:shadow-[0_0_18px_rgba(168,85,247,0.55)] hover:border-purple-400 hover:ring-1 hover:ring-purple-400/40 ${
                  searchQuery.toLowerCase().includes(item.label.toLowerCase())
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-400 shadow-xs"
                    : isDark
                    ? "bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-700/80"
                    : "bg-slate-100/90 hover:bg-purple-50 text-slate-700 hover:text-purple-700 border-slate-200"
                }`}
              >
                <span>{item.label}</span>
              </motion.button>
            ))}
          </HorizontalSlider>
        </div>
      </div>
    </section>
  );
};
