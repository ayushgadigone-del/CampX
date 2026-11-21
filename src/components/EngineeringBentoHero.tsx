import React, { useState, useRef, useEffect } from "react";
import { Search, X, Check, Recycle, History, Trash2 } from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { ALLOWED_COLLEGE_DOMAIN } from "../utils/collegeAuth";

const RECENT_SEARCHES_KEY = "pvg_campus_recent_searches_v1";

interface EngineeringBentoHeroProps {
  totalListingsCount: number;
  totalActiveStock?: number;
  availableCount?: number;
  topperNotesCount?: number;
  upcomingHandoversCount?: number;
  isOnline?: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  totalResultsCount?: number;
  onOpenCreateListing?: () => void;
  onOpenCreateModal?: () => void;
  onOpenAIInspector: () => void;
  onOpenTopperNotes: () => void;
  onOpenWishlist?: () => void;
  onOpenYourChats?: () => void;
  onOpenAlerts?: () => void;
  onFocusSearch?: () => void;
  onSelectCategory: (cat: any) => void;
  selectedCategory?: string;
}

export const EngineeringBentoHero: React.FC<EngineeringBentoHeroProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const { isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.slice(0, 6) : [];
      }
    } catch {
      // Ignore storage error
    }
    return [];
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearch = (term: string) => {
    const cleaned = term.trim();
    if (!cleaned || cleaned.length < 2) return;
    setRecentSearches((prev) => {
      const updated = [cleaned, ...prev.filter((item) => item.toLowerCase() !== cleaned.toLowerCase())].slice(0, 6);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage error
      }
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      saveRecentSearch(searchQuery);
    }
    setIsFocused(false);
    inputRef.current?.blur();
    onSearchSubmit?.();
  };

  const handleRemoveRecent = (term: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== term);
    setRecentSearches(updated);
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleClearRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch {
      // Ignore
    }
  };

  return (
    <section
      id="pvg-engineering-resale-section"
      className={`w-full border-b ${
        isDark
          ? "bg-[#111715] border-[#242E2A]"
          : "bg-[#F3F5F2] border-[#DFE6E2]"
      }`}
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-8">
          {/* Left Column: Editorial Headline + Live Search */}
          <div className="lg:col-span-7 text-left space-y-6">
            <div
              className={`inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
              }`}
            >
              <span aria-hidden="true" className="text-sm leading-none">
                ✳
              </span>
              <span>MADE FOR CAMPUS LIFE</span>
            </div>

            <h1
              className={`text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-tight leading-[1.05] ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              <span className="block">Good finds.</span>
              <span
                className={`block ${
                  isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                }`}
              >
                Great campus
              </span>
              <span className="block">stories.</span>
            </h1>

            <p
              className={`text-sm sm:text-base leading-relaxed max-w-lg ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Buy, sell and exchange the things you need with students from your own college community.
            </p>

            {/* Inline Search Box */}
            <div ref={containerRef} className="relative max-w-lg w-full pt-1">
              <form
                onSubmit={handleSubmit}
                className={`flex items-center gap-2 p-1.5 rounded-xl border shadow-sm ${
                  isFocused
                    ? isDark
                      ? "bg-[#141A18] border-[#5BA18C]"
                      : "bg-white border-[#2F5D50]"
                    : isDark
                    ? "bg-[#141A18] border-[#242E2A]"
                    : "bg-white border-[#DFE6E2]"
                }`}
              >
                <Search
                  className={`w-4 h-4 ml-3 shrink-0 ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                />
                <input
                  ref={inputRef}
                  id="dedicated-search-bar-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  onFocus={() => setIsFocused(true)}
                  placeholder="What are you looking for?"
                  className={`w-full bg-transparent text-sm focus:outline-none py-2.5 ${
                    isDark
                      ? "text-[#ECF2EF] placeholder:text-[#73847D]"
                      : "text-[#18201C] placeholder:text-[#7C8B83]"
                  }`}
                />

                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      onSearchChange("");
                      inputRef.current?.focus();
                    }}
                    aria-label="Clear search"
                    className={`p-1.5 rounded-md cursor-pointer shrink-0 ${
                      isDark
                        ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                        : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}

                <button
                  id="hero-search-submit-btn"
                  type="submit"
                  className={`h-10 px-5 rounded-lg text-sm font-semibold text-white shrink-0 cursor-pointer ${
                    isDark
                      ? "bg-[#387262] hover:bg-[#448573]"
                      : "bg-[#2F5D50] hover:bg-[#244A3F]"
                  }`}
                >
                  Search
                </button>
              </form>

              {/* Recent Searches Dropdown */}
              {isFocused && recentSearches.length > 0 && !searchQuery && (
                <div
                  className={`absolute left-0 right-0 top-full mt-1.5 rounded-xl border shadow-lg z-30 p-3 space-y-2 ${
                    isDark
                      ? "bg-[#141A18] border-[#242E2A]"
                      : "bg-white border-[#DFE6E2]"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[11px] font-medium flex items-center gap-1.5 ${
                        isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                      }`}
                    >
                      <History className="w-3 h-3" />
                      Recent searches
                    </span>
                    <button
                      type="button"
                      onClick={handleClearRecent}
                      className={`text-[11px] font-medium flex items-center gap-1 cursor-pointer ${
                        isDark
                          ? "text-[#8FA199] hover:text-[#ECF2EF]"
                          : "text-[#5C6B63] hover:text-[#18201C]"
                      }`}
                    >
                      <Trash2 className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <div
                        key={term}
                        onClick={() => {
                          onSearchChange(term);
                          setIsFocused(false);
                          onSearchSubmit?.();
                        }}
                        className={`inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 rounded-md border text-xs cursor-pointer ${
                          isDark
                            ? "bg-[#1B2320] border-[#242E2A] text-[#ECF2EF] hover:border-[#34433D]"
                            : "bg-[#EFF4F1] border-[#DFE6E2] text-[#18201C] hover:border-[#C4D1CA]"
                        }`}
                      >
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveRecent(term, e)}
                          className="p-0.5 text-[#5C6B63] dark:text-[#8FA199] hover:text-[#18201C] dark:hover:text-[#ECF2EF] cursor-pointer"
                          aria-label={`Remove ${term}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div
              className={`flex items-center gap-1.5 text-xs ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              <Check className="w-3.5 h-3.5 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
              <span>
                Exclusively for your college community (@{ALLOWED_COLLEGE_DOMAIN})
              </span>
            </div>
          </div>

          {/* Right Column: Static Campus Community Emblem + Value Cards */}
          <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
            <div className="relative flex items-center justify-center py-6 px-6 sm:px-12">
              {/* Outer Soft Sage Circle */}
              <div
                className={`w-60 h-60 sm:w-72 sm:h-72 rounded-full flex items-center justify-center ${
                  isDark ? "bg-[#192621]" : "bg-[#DDE6E0]"
                }`}
              >
                {/* Inner Solid Deep Pine Circle */}
                <div
                  className={`w-40 h-40 sm:w-44 sm:h-44 rounded-full flex flex-col items-center justify-center text-center shadow-sm ${
                    isDark ? "bg-[#244A3F]" : "bg-[#2F5D50]"
                  }`}
                >
                  <span className="text-white text-sm sm:text-[15px] font-bold tracking-[0.14em] uppercase leading-relaxed">
                    CAMPUS
                    <br />
                    COMMUNITY
                  </span>
                </div>
              </div>

              {/* Top-Left Static Card: Pass it on. */}
              <div
                className={`absolute top-2 left-0 sm:-left-2 rounded-xl border px-3.5 py-3 shadow-sm flex items-center gap-3 w-52 sm:w-56 ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A]"
                    : "bg-white border-[#DFE6E2]"
                }`}
              >
                <div className="shrink-0">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 28 28"
                    fill="none"
                    aria-hidden="true"
                  >
                    <rect x="3" y="5" width="7" height="16" rx="1.5" fill="#4CAF50" />
                    <rect x="9.5" y="7" width="7" height="15" rx="1.5" fill="#E53935" />
                    <rect x="16" y="9" width="7" height="14" rx="1.5" fill="#3B82F6" />
                  </svg>
                </div>
                <div className="min-w-0 text-left">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  >
                    Pass it on.
                  </p>
                  <p
                    className={`text-[11px] leading-snug mt-0.5 ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    Give your books a new life
                  </p>
                </div>
              </div>

              {/* Bottom-Right Static Card: Buy smarter. */}
              <div
                className={`absolute bottom-2 right-0 sm:-right-2 rounded-xl border px-3.5 py-3 shadow-sm flex items-center gap-3 w-48 sm:w-52 ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A]"
                    : "bg-white border-[#DFE6E2]"
                }`}
              >
                <div className="shrink-0">
                  <Recycle
                    className={`w-5 h-5 ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  />
                </div>
                <div className="min-w-0 text-left">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  >
                    Buy smarter.
                  </p>
                  <p
                    className={`text-[11px] leading-snug mt-0.5 ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    Spend less, do more
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
