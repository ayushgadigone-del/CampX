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
} from "lucide-react";
import { User } from "firebase/auth";

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
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-2xs">
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
                  <span className="text-base font-extrabold text-slate-900 tracking-tight">
                    Campus Resale
                  </span>
                  <span className="text-xs font-bold text-indigo-600">&</span>
                  <span className="text-base font-extrabold text-slate-900 tracking-tight">
                    Exchange
                  </span>
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium -mt-0.5">
                  <span>Verified College Marketplace</span>
                  <span>•</span>
                  <span className="text-indigo-600 font-bold">PBL 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Centered Search Bar with Recent History Dropdown */}
          <div ref={searchContainerRef} className="flex-1 max-w-md mx-2 relative">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
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
                placeholder="Search calculators, books, lab calipers, cycles..."
                className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 bg-slate-50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-400 font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    onSearchChange("");
                  }}
                  className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 rounded-full cursor-pointer"
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
                className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Active query prompt if user typed something */}
                {searchQuery.trim() && (
                  <div
                    onClick={() => {
                      addRecentSearch(searchQuery);
                      setIsSearchDropdownOpen(false);
                    }}
                    className="p-2.5 px-3.5 flex items-center justify-between text-xs bg-indigo-50/70 hover:bg-indigo-100 text-indigo-900 border-b border-indigo-100 font-semibold cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Search className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                      <span>Search for "{searchQuery}"</span>
                    </div>
                    <span className="flex items-center gap-1 text-[10px] text-indigo-600 bg-white px-1.5 py-0.5 rounded border border-indigo-200 shrink-0">
                      <span>Enter ↵</span>
                    </span>
                  </div>
                )}

                {/* Dropdown Header */}
                <div className="px-3.5 py-2 flex items-center justify-between bg-slate-50/80 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>Recent Searches (Last 5)</span>
                  </div>
                  {recentSearches.length > 0 && (
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[10px] font-bold text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    >
                      Clear History
                    </button>
                  )}
                </div>

                {/* Recent Searches List */}
                {recentSearches.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No recent search history yet
                  </div>
                ) : (
                  <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
                    {recentSearches.map((item) => (
                      <li
                        key={item}
                        onClick={() => handleSelectRecentSearch(item)}
                        className="flex items-center justify-between px-3.5 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-indigo-600 cursor-pointer transition-colors group"
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
                          className="p-1 text-slate-300 hover:text-rose-500 rounded-md hover:bg-rose-50 transition-colors shrink-0"
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
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 transition-colors shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden md:inline">AI Inspector</span>
            </button>

            {/* Notify Me / Alerts Button */}
            <button
              id="navbar-alerts-button"
              onClick={onOpenAlerts}
              title="Set 'Notify Me' alerts for calculators, books, and keywords"
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 transition-colors shadow-2xs"
            >
              <Bell
                className={`w-3.5 h-3.5 ${
                  alertsCount > 0
                    ? "text-amber-600 fill-amber-400"
                    : "text-amber-600"
                }`}
              />
              <span className="hidden md:inline">Notify Me</span>
              {alertsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Wishlist Button */}
            <button
              id="navbar-wishlist-button"
              onClick={onOpenWishlist}
              title="View My Saved Wishlist"
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200/60 transition-colors shadow-2xs"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlistCount > 0
                    ? "fill-rose-500 text-rose-500"
                    : "text-rose-600"
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
              className="relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/60 transition-colors shadow-2xs"
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
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
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100"
                    : "bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100"
                }`}
              >
                <span className="flex h-2 w-2 relative">
                  {!isOnline && (
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  )}
                  <span
                    className={`relative inline-flex rounded-full h-2 w-2 ${
                      isOnline ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  ></span>
                </span>
                {isOnline ? (
                  <span className="hidden xl:inline">Online</span>
                ) : (
                  <span className="inline font-extrabold text-rose-700">Offline</span>
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
                  ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md cursor-pointer"
              }`}
            >
              {!isOnline ? (
                <WifiOff className="w-4 h-4 text-slate-400 shrink-0" />
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

            {/* PBL Info Button */}
            <button
              onClick={onOpenPBLInfo}
              title="PBL Project Scope & Team Info"
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
            >
              <BookOpen className="w-4 h-4" />
            </button>

            {/* Auth / Profile Area */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-1.5 p-1 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt={currentUser.displayName || "User"}
                      className="w-8 h-8 rounded-full border border-indigo-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                      {currentUser.displayName?.charAt(0) || "S"}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {showProfileMenu && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <div className="font-bold text-slate-900 flex items-center gap-1">
                        {currentUser.displayName || "Student User"}
                        <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-[11px] text-slate-500 truncate block">
                        {currentUser.email}
                      </span>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold text-[10px]">
                        College Verified Account
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenAlerts();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <Bell className="w-3.5 h-3.5 text-amber-600" />
                        'Notify Me' Alerts
                      </span>
                      {alertsCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          {alertsCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenWishlist();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center justify-between text-slate-700"
                    >
                      <span className="flex items-center gap-2">
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        My Saved Wishlist
                      </span>
                      {wishlistCount > 0 && (
                        <span className="px-1.5 py-0.2 rounded-full bg-rose-100 text-rose-700 text-[10px] font-bold">
                          {wishlistCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenHandovers();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-blue-600" />
                      Calendar Handovers
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onOpenPBLInfo();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      PBL Project Report
                    </button>

                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-700 font-semibold flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                {/* Google Sign-in button adhering to Workspace Skill SVG specifications */}
                <button
                  onClick={onLogin}
                  title="Sign in with your Google account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
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
                    className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-indigo-200 bg-indigo-50/90 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold transition-all cursor-pointer"
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
