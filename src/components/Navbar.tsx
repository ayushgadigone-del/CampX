import React, { useState, useEffect, useRef } from "react";
import {
  Sparkles,
  PlusCircle,
  Calendar as CalendarIcon,
  Search,
  BookOpen,
  LogOut,
  BadgeCheck,
  Building2,
  ChevronDown,
  Heart,
  Bell,
  Clock,
  History,
  X,
  ArrowRight,
  Wifi,
  WifiOff,
  GraduationCap,
  Sun,
  Moon,
} from "lucide-react";
import { User } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";

interface NavbarProps {
  currentUser: User | null;
  onLogin: () => void;
  onDemoLogin?: () => void;
  onLogout: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenAIInspector: () => void;
  onOpenHandovers: () => void;
  onOpenPBLInfo: () => void;
  onOpenTopperNotes: () => void;
  upcomingHandoversCount: number;
  wishlistCount?: number;
  onOpenWishlist: () => void;
  alertsCount?: number;
  onOpenAlerts: () => void;
  isOnline?: boolean;
  isSimulatedOffline?: boolean;
  onToggleSimulateOffline?: () => void;
  onShowToast?: (msg: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogin,
  onDemoLogin,
  onLogout,
  searchQuery,
  onSearchChange,
  onOpenCreateModal,
  onOpenAIInspector,
  onOpenHandovers,
  onOpenPBLInfo,
  onOpenTopperNotes,
  upcomingHandoversCount,
  wishlistCount = 0,
  onOpenWishlist,
  alertsCount = 0,
  onOpenAlerts,
  isOnline = true,
  isSimulatedOffline = false,
  onToggleSimulateOffline,
  onShowToast,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const STORAGE_KEY = "campus_marketplace_recent_searches";
  const DEFAULT_SEARCHES = [
    "Casio Calculator",
    "B.S. Grewal",
    "Mini Drafter",
    "Campus Cycle",
    "Vernier Caliper",
  ];

  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.slice(0, 5);
        }
      }
    } catch (e) {
      console.warn("Notice reading recent searches from localStorage", e);
    }
    return DEFAULT_SEARCHES;
  });

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const saveRecentSearches = (items: string[]) => {
    setRecentSearches(items);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Notice saving recent searches to localStorage", e);
    }
  };

  const addRecentSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;
    const filtered = recentSearches.filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase()
    );
    const updated = [trimmed, ...filtered].slice(0, 5);
    saveRecentSearches(updated);
  };

  const removeRecentSearch = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((item) => item !== itemToRemove);
    saveRecentSearches(updated);
  };

  const clearAllRecentSearches = (e: React.MouseEvent) => {
    e.stopPropagation();
    saveRecentSearches([]);
  };

  const handleSelectRecentSearch = (item: string) => {
    onSearchChange(item);
    addRecentSearch(item);
    setIsSearchDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      if (searchQuery.trim()) {
        addRecentSearch(searchQuery);
      }
      setIsSearchDropdownOpen(false);
    } else if (e.key === "Escape") {
      setIsSearchDropdownOpen(false);
    }
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 ${
        isDark
          ? "bg-slate-900/90 border-slate-800 shadow-xl"
          : "bg-white/95 border-slate-200 shadow-xs"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & College Marker */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={onOpenPBLInfo}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-700 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-base font-extrabold tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Campus Resale
                  </span>
                  <span className="text-xs font-bold text-indigo-500">&</span>
                  <span
                    className={`text-base font-extrabold tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Exchange
                  </span>
                </div>
                <div
                  className={`flex items-center gap-1 text-[10px] font-medium -mt-0.5 ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <span>PVG's COET Marketplace</span>
                  <span>•</span>
                  <span className="text-indigo-500 font-bold">PBL 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Centered Search Bar with Recent History Dropdown */}
          <div ref={searchContainerRef} className="flex-1 max-w-md mx-2 relative">
            <div className="relative">
              <Search
                className={`w-4 h-4 absolute left-3.5 top-3 ${
                  isDark ? "text-slate-400" : "text-slate-400"
                }`}
              />
              <input
                id="main-navbar-search-input"
                type="text"
                value={searchQuery}
                onFocus={() => setIsSearchDropdownOpen(true)}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  if (!isSearchDropdownOpen) setIsSearchDropdownOpen(true);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Search calculators, books, lab calipers, cycles... (Press '/' to focus)"
                className={`w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border transition-all font-medium ${
                  isDark
                    ? "border-slate-700 bg-slate-800/90 hover:bg-slate-800 focus:bg-slate-900 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-100 placeholder:text-slate-500"
                    : "border-slate-300 bg-slate-100/90 hover:bg-slate-100 focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-slate-900 placeholder:text-slate-400"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                  }}
                  className={`absolute right-2.5 top-2.5 p-1 rounded-full cursor-pointer ${
                    isDark
                      ? "text-slate-400 hover:text-slate-200"
                      : "text-slate-400 hover:text-slate-700"
                  }`}
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Recent Searches Dropdown */}
            {isSearchDropdownOpen && (
              <div
                id="search-history-dropdown"
                className={`absolute left-0 right-0 top-full mt-1.5 rounded-2xl border shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 backdrop-blur-xl ${
                  isDark
                    ? "bg-slate-800/95 border-slate-700 text-slate-100"
                    : "bg-white border-slate-200 text-slate-900 shadow-xl"
                }`}
              >
                {/* Active query prompt if user typed something */}
                {searchQuery.trim() && (
                  <div
                    onClick={() => {
                      addRecentSearch(searchQuery);
                      setIsSearchDropdownOpen(false);
                    }}
                    className={`p-2.5 px-3.5 flex items-center justify-between text-xs font-semibold cursor-pointer transition-colors ${
                      isDark
                        ? "bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-200 border-b border-indigo-800/50"
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border-b border-indigo-100"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Search className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span>Search for "{searchQuery}"</span>
                    </div>
                    <span
                      className={`flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded border shrink-0 ${
                        isDark
                          ? "text-indigo-300 bg-indigo-900/60 border-indigo-700"
                          : "text-indigo-700 bg-white border-indigo-200"
                      }`}
                    >
                      <span>Enter ↵</span>
                    </span>
                  </div>
                )}

                {/* Dropdown Header */}
                <div
                  className={`px-3.5 py-2 flex items-center justify-between border-b ${
                    isDark
                      ? "bg-slate-900/80 border-slate-700/80"
                      : "bg-slate-50 border-slate-200"
                  }`}
                >
                  <div
                    className={`flex items-center gap-1.5 text-[11px] font-bold ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <History className="w-3.5 h-3.5" />
                    <span>Recent Searches (Last 5)</span>
                  </div>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {/* Recent Searches List */}
                {recentSearches.length === 0 ? (
                  <div
                    className={`p-4 text-center text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    No recent search history yet
                  </div>
                ) : (
                  <ul
                    className={`divide-y max-h-60 overflow-y-auto ${
                      isDark ? "divide-slate-700/60" : "divide-slate-100"
                    }`}
                  >
                    {recentSearches.map((item) => (
                      <li
                        key={item}
                        onClick={() => handleSelectRecentSearch(item)}
                        className={`flex items-center justify-between px-3.5 py-2.5 text-xs cursor-pointer transition-colors group ${
                          isDark
                            ? "text-slate-200 hover:bg-slate-700/60 hover:text-indigo-300"
                            : "text-slate-700 hover:bg-slate-50 hover:text-indigo-600"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Clock className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 shrink-0" />
                          <span className="truncate font-medium">{item}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(item, e)}
                          title="Remove from history"
                          aria-label={`Remove ${item} from search history`}
                          className="p-1 text-slate-400 hover:text-rose-500 rounded-md hover:bg-rose-500/10 transition-colors shrink-0"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Inspector button */}
            <button
              onClick={onOpenAIInspector}
              title="Inspect item condition using Gemini 3.1 Pro Preview"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/30 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span className="hidden md:inline">AI Inspector</span>
            </button>

            {/* Notify Me / Alerts Button */}
            <button
              id="navbar-alerts-button"
              onClick={onOpenAlerts}
              title="Set 'Notify Me' alerts for calculators, books, and keywords"
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 transition-colors shadow-2xs"
            >
              <Bell
                className={`w-3.5 h-3.5 ${
                  alertsCount > 0
                    ? "text-amber-400 fill-amber-400"
                    : "text-amber-400"
                }`}
              />
              <span className="hidden md:inline">Notify Me</span>
              {alertsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-bold flex items-center justify-center">
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              id="navbar-wishlist-button"
              onClick={onOpenWishlist}
              title="View My Saved Wishlist"
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 transition-colors shadow-2xs"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlistCount > 0
                    ? "fill-rose-500 text-rose-400"
                    : "text-rose-400"
                }`}
              />
              <span className="hidden md:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Google Calendar Handover link */}
            <button
              onClick={onOpenHandovers}
              title="View Scheduled Campus Handovers"
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border border-blue-500/30 transition-colors shadow-2xs"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden lg:inline">Handovers</span>
              {upcomingHandoversCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {upcomingHandoversCount}
                </span>
              )}
            </button>

            {/* Network Status Indicator */}
            {onToggleSimulateOffline && (
              <button
                type="button"
                id="navbar-network-status-indicator"
                onClick={onToggleSimulateOffline}
                title={
                  isOnline
                    ? "Network: Online (window.navigator.onLine) • Click to simulate offline mode"
                    : "Network: Offline • Click to resume online mode"
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-bold border transition-colors shadow-2xs select-none ${
                  isOnline
                    ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
                    : "bg-rose-500/15 text-rose-300 border-rose-500/30 hover:bg-rose-500/25"
                }`}
              >
                <span className="flex h-2 w-2 relative">
                  {!isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOnline ? "bg-emerald-400" : "bg-rose-400"
                    }`}
                  ></span>
                </span>
                {isOnline ? (
                  <span className="hidden xl:inline">Online</span>
                ) : (
                  <span className="inline font-extrabold text-rose-300">Offline</span>
                )}
              </button>
            )}

            {/* Post Item Button */}
            <button
              id="navbar-post-item-btn"
              onClick={() => {
                if (!isOnline) return;
                onOpenCreateModal();
              }}
              disabled={!isOnline}
              title={
                !isOnline
                  ? "Offline mode: Creating listings is disabled while disconnected to prevent data loss"
                  : "Post an item for campus resale or exchange"
              }
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all select-none ${
                !isOnline
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/20 cursor-pointer"
              }`}
            >
              {!isOnline ? (
                <WifiOff className="w-4 h-4 text-slate-500 shrink-0" />
              ) : (
                <PlusCircle className="w-4 h-4 shrink-0" />
              )}
              <span className="hidden sm:inline">
                {!isOnline ? "Post Disabled (Offline)" : "Post Item"}
              </span>
              <span className="sm:hidden">
                {!isOnline ? "Offline" : "Post"}
              </span>
            </button>

            {/* Free Topper Notes Vault Button */}
            <button
              id="navbar-topper-notes-btn"
              onClick={onOpenTopperNotes}
              title="Free Topper Notes Vault (Pre-uploaded by App Owner)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400/30 bg-gradient-to-r from-amber-500/20 to-amber-600/20 hover:from-amber-500/30 hover:to-amber-600/30 text-amber-200 text-xs font-bold transition-all shadow-2xs cursor-pointer select-none"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="hidden md:inline">Topper Notes</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[10px] font-extrabold uppercase">
                Free
              </span>
            </button>

            {/* Dark / Light Mode Switcher Button */}
            <button
              id="navbar-theme-toggle-btn"
              type="button"
              onClick={toggleTheme}
              title={`Switch to ${isDark ? "Light" : "Dark"} Mode (Shortcut: D)`}
              aria-label={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
              className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
                isDark
                  ? "bg-slate-800/80 hover:bg-slate-700 border-slate-700 text-amber-400 hover:text-amber-300 shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 border-slate-300 text-indigo-700 hover:text-indigo-900 shadow-2xs"
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* PBL Info Button */}
            <button
              onClick={onOpenPBLInfo}
              title="PBL Project Scope & Team Info"
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
              }`}
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-1.5 p-1 rounded-xl transition-colors cursor-pointer ${
                    isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
                  }`}
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "User"}
                      className="w-8 h-8 rounded-full border border-indigo-400/50"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {currentUser.displayName?.charAt(0) || "S"}
                    </div>
                  )}
                  <ChevronDown
                    className={`w-3.5 h-3.5 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  />
                </button>

                {showProfileMenu && (
                  <div
                    className={`absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border py-2 z-50 text-xs animate-in fade-in duration-150 backdrop-blur-xl ${
                      isDark
                        ? "bg-slate-800/95 border-slate-700 text-slate-200"
                        : "bg-white border-slate-200 text-slate-800 shadow-xl"
                    }`}
                  >
                    <div
                      className={`px-4 py-2 border-b ${
                        isDark ? "border-slate-700/80" : "border-slate-100"
                      }`}
                    >
                      <div
                        className={`font-bold flex items-center gap-1 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        {currentUser.displayName || "Student User"}
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-500" />
                      </div>
                      <span
                        className={`text-[11px] truncate block font-mono ${
                          isDark ? "text-slate-400" : "text-slate-500"
                        }`}
                      >
                        {currentUser.email}
                      </span>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-md font-semibold text-[10px] border ${
                          isDark
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        ✓ @pvgcoet.ac.in Verified
                      </span>
                    </div>

                    {/* Dark/Light Mode toggle option in dropdown */}
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        toggleTheme();
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        isDark
                          ? "hover:bg-slate-700/60 text-slate-300 hover:text-white"
                          : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {isDark ? (
                          <Sun className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          <Moon className="w-3.5 h-3.5 text-indigo-600" />
                        )}
                        <span>{isDark ? "Light Mode" : "Dark Mode"}</span>
                      </span>
                      <kbd
                        className={`text-[10px] font-mono px-1 py-0.5 rounded border ${
                          isDark
                            ? "bg-slate-700 border-slate-600 text-slate-300"
                            : "bg-slate-100 border-slate-300 text-slate-600"
                        }`}
                      >
                        D
                      </kbd>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAlerts();
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        isDark
                          ? "hover:bg-slate-700/60 text-slate-300 hover:text-white"
                          : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-amber-400" />
                        'Notify Me' Alerts
                      </span>
                      {alertsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                          {alertsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenWishlist();
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        isDark
                          ? "hover:bg-slate-700/60 text-slate-300 hover:text-white"
                          : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-rose-400" />
                        My Saved Wishlist
                      </span>
                      {wishlistCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-[10px] font-bold">
                          {wishlistCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenHandovers();
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer ${
                        isDark
                          ? "hover:bg-slate-700/60 text-slate-300 hover:text-white"
                          : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                      Calendar Handovers
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenTopperNotes();
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                        isDark
                          ? "hover:bg-slate-700/60 text-slate-300 hover:text-white"
                          : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
                        Topper Notes Vault
                      </span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                        Free
                      </span>
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenPBLInfo();
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer ${
                        isDark
                          ? "hover:bg-slate-700/60 text-slate-300 hover:text-white"
                          : "hover:bg-slate-100 text-slate-700 hover:text-slate-900"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                      PBL Project Report
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className={`w-full text-left px-4 py-2 flex items-center gap-2 font-semibold border-t transition-colors cursor-pointer ${
                        isDark
                          ? "hover:bg-rose-500/20 text-rose-300 border-slate-700/80"
                          : "hover:bg-rose-50 text-rose-600 border-slate-100"
                      }`}
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onLogin}
                  title="Sign in with your Google account"
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold shadow-md transition-all cursor-pointer ${
                    isDark
                      ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200"
                      : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-4 h-4"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#34A853"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>
                  <span className="hidden sm:inline">Sign In with Google</span>
                  <span className="sm:hidden">Sign In</span>
                </button>
                {onDemoLogin && (
                  <button
                    onClick={onDemoLogin}
                    title="1-Click verified student account for testing without Google popup"
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-400 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>Demo Student</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
