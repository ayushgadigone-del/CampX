import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  PlusCircle,
  Calendar as CalendarIcon,
  BookOpen,
  LogOut,
  BadgeCheck,
  Building2,
  ChevronDown,
  Heart,
  Bell,
  WifiOff,
  GraduationCap,
  Sun,
  Moon,
  Trophy,
  Zap,
  Leaf,
  MapPin,
  MessageSquare,
  ExternalLink,
} from "lucide-react";
import { User } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";
import { HorizontalSlider } from "./HorizontalSlider";

interface NavbarProps {
  currentUser: User | null;
  onLogin: () => void;
  onDemoLogin?: () => void;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenAIInspector: () => void;
  onOpenHandovers: () => void;
  onOpenPBLInfo: () => void;
  onOpenTopperNotes: () => void;
  upcomingHandoversCount: number;
  wishlistCount?: number;
  onOpenWishlist: () => void;
  chatsCount?: number;
  onOpenYourChats: () => void;
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
  onOpenCreateModal,
  onOpenAIInspector,
  onOpenHandovers,
  onOpenPBLInfo,
  onOpenTopperNotes,
  upcomingHandoversCount,
  wishlistCount = 0,
  onOpenWishlist,
  chatsCount = 0,
  onOpenYourChats,
  alertsCount = 0,
  onOpenAlerts,
  isOnline = true,
  isSimulatedOffline = false,
  onToggleSimulateOffline,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Close profile menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 ${
        isDark
          ? "bg-[#0B0F19]/95 border-slate-800/80 shadow-lg shadow-black/30"
          : "bg-white/95 border-slate-200/90 shadow-xs"
      }`}
    >
      <div className="w-full px-2 sm:px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-1.5 sm:gap-3 w-full">
          {/* ================= LEFT: Brand Logo & Title ================= */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div
              onClick={onOpenPBLInfo}
              className="flex items-center gap-2 sm:gap-2.5 cursor-pointer group"
              title="PVG's COET Campus Resale & Exchange • Click for PBL Info (Shortcut: P)"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform duration-200 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>

              <div>
                <div className="flex items-center gap-1 leading-none">
                  <span
                    className={`text-sm sm:text-base font-extrabold tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Campus Resale
                  </span>
                  <span className="text-xs font-bold text-indigo-500">&</span>
                  <span
                    className={`text-sm sm:text-base font-extrabold tracking-tight ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Exchange
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`text-[10px] font-semibold tracking-wide uppercase px-1.5 py-0.2 rounded border ${
                      isDark
                        ? "bg-slate-900 text-indigo-300 border-indigo-500/30"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200/80"
                    }`}
                  >
                    PVG's COET
                  </span>
                  <span
                    className={`hidden lg:inline text-[10px] font-medium ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    PBL 2026
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ================= CENTER / MIDDLE: Evenly Spaced Header Actions (Desktop xl) ================= */}
          <nav
            aria-label="Campus Navigation"
            className="hidden xl:flex flex-1 items-center justify-center px-1 sm:px-2 md:px-4 max-w-2xl mx-auto"
          >
            <div className="flex items-center justify-evenly w-full gap-1 sm:gap-2">
              {/* 1. Free Topper Notes Vault */}
              <motion.button
                id="navbar-topper-notes-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenTopperNotes}
                aria-keyshortcuts="T"
                title="Free Topper Notes Vault (Shortcut: T)"
                className={`h-9 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap ${
                  isDark
                    ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                    : "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-700 shadow-2xs"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="hidden sm:inline">Topper Vault</span>
                <span className="inline sm:hidden">Vault</span>
                <span
                  className={`hidden md:inline px-1 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                    isDark
                      ? "bg-emerald-500/25 text-emerald-300"
                      : "bg-emerald-200/80 text-emerald-800"
                  }`}
                >
                  Free
                </span>
              </motion.button>

              {/* 2. AI Inspector Button */}
              <motion.button
                id="navbar-ai-inspector-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenAIInspector}
                aria-keyshortcuts="I"
                title="Inspect item condition with Gemini AI (Shortcut: I)"
                className={`h-9 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  isDark
                    ? "bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span className="hidden sm:inline">AI Inspector</span>
                <span className="inline sm:hidden">AI Scan</span>
              </motion.button>

              {/* 3. Handovers Button */}
              <motion.button
                id="navbar-handovers-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenHandovers}
                aria-keyshortcuts="H"
                title={`Campus Handover Schedule & Google Calendar Sync (Shortcut: H)${
                  upcomingHandoversCount > 0 ? ` • ${upcomingHandoversCount} scheduled` : ""
                }`}
                className={`h-9 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  upcomingHandoversCount > 0
                    ? isDark
                      ? "bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30"
                      : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-2xs"
                    : isDark
                    ? "bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>Handovers</span>
                {upcomingHandoversCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-black text-[10px] shadow-2xs">
                    {upcomingHandoversCount}
                  </span>
                )}
              </motion.button>

              {/* 4. PBL Report Button */}
              <motion.button
                id="navbar-pbl-report-btn"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onOpenPBLInfo}
                aria-keyshortcuts="P"
                title="PVG's COET Project Based Learning Report & System Specs (Shortcut: P)"
                className={`h-9 inline-flex items-center justify-center gap-1.5 px-2.5 sm:px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap ${
                  isDark
                    ? "bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
                    : "bg-purple-50 hover:bg-purple-100/80 text-purple-700 border-purple-200 shadow-2xs"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
                <span className="hidden sm:inline">PBL Report</span>
                <span className="inline sm:hidden">PBL</span>
              </motion.button>
            </div>
          </nav>

          {/* ================= RIGHT: User Actions, Primary CTA & Profile ================= */}
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-2.5 shrink-0">
            {/* Your Chats Button (Desktop xl) */}
            <button
              id="navbar-your-chats-button"
              onClick={onOpenYourChats}
              aria-keyshortcuts="C"
              title={`Your Chats with Sellers (Shortcut: C)${
                chatsCount > 0 ? ` • ${chatsCount} active` : ""
              }`}
              className={`hidden xl:flex h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-indigo-600 border-slate-200 shadow-2xs"
              }`}
            >
              <MessageSquare className="w-4 h-4 text-indigo-500 shrink-0" />
              <span className="inline text-xs font-medium">Chats</span>
              {chatsCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-indigo-600 text-white text-[10px] font-black flex items-center justify-center shadow-2xs">
                  {chatsCount}
                </span>
              )}
            </button>

            {/* Wishlist Button (Desktop xl) */}
            <button
              id="navbar-wishlist-button"
              onClick={onOpenWishlist}
              aria-keyshortcuts="W"
              title={`Saved Wishlist (Shortcut: W)${
                wishlistCount > 0 ? ` • ${wishlistCount} items` : ""
              }`}
              className={`hidden xl:flex h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-rose-600 border-slate-200 shadow-2xs"
              }`}
            >
              <Heart
                className={`w-4 h-4 shrink-0 ${
                  wishlistCount > 0
                    ? "fill-rose-500 text-rose-500"
                    : "text-rose-500 dark:text-rose-400"
                }`}
              />
              <span className="inline text-xs font-medium">Saved</span>
              {wishlistCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center shadow-2xs">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* Notify Me / Alerts Button (Desktop xl) */}
            <button
              id="navbar-alerts-button"
              onClick={onOpenAlerts}
              title={`Keyword & Item Alerts${
                alertsCount > 0 ? ` • ${alertsCount} active` : ""
              }`}
              className={`hidden xl:flex h-9 px-2.5 sm:px-3 rounded-xl border text-xs font-semibold transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-amber-600 border-slate-200 shadow-2xs"
              }`}
            >
              <Bell
                className={`w-4 h-4 shrink-0 ${
                  alertsCount > 0
                    ? "fill-amber-500 text-amber-500"
                    : "text-amber-500 dark:text-amber-400"
                }`}
              />
              <span className="inline text-xs font-medium">Alerts</span>
              {alertsCount > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center shadow-2xs">
                  {alertsCount}
                </span>
              )}
            </button>

            {/* Network Status Dot / Badge (Unclickable indicator reflecting true internet connectivity) */}
            <div
              id="navbar-network-status-indicator"
              role="status"
              aria-live="polite"
              title={
                isOnline
                  ? "Network Status: Connected to Internet"
                  : "Network Status: Offline (No Internet Connection)"
              }
              className={`h-9 px-2.5 rounded-xl border transition-all flex items-center justify-center cursor-default select-none pointer-events-none ${
                isOnline
                  ? isDark
                    ? "bg-slate-900/80 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-700 shadow-2xs"
                  : "bg-rose-500/15 border-rose-500/40 text-rose-500 dark:text-rose-400 animate-pulse"
              }`}
            >
              {isOnline ? (
                <div className="flex items-center gap-1.5" title="Online">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hidden xl:inline">
                    Online
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-rose-500 dark:text-rose-400">
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  <span className="inline">Offline</span>
                </div>
              )}
            </div>

            {/* Theme Toggle Button (Clean Sun/Moon) */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
              title={`Switch to ${isDark ? "Light" : "Dark"} mode (Shortcut: D)`}
              className={`h-9 w-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer ${
                isDark
                  ? "bg-slate-900/80 border-slate-800 text-amber-400 hover:bg-slate-800 hover:text-amber-300"
                  : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-indigo-600"
              }`}
            >
              {isDark ? (
                <Sun className="w-4 h-4 shrink-0" />
              ) : (
                <Moon className="w-4 h-4 shrink-0" />
              )}
            </button>

            {/* Primary Action: + Post Item CTA */}
            <motion.button
              id="navbar-post-item-btn"
              whileHover={isOnline ? { scale: 1.02 } : {}}
              whileTap={isOnline ? { scale: 0.98 } : {}}
              onClick={() => {
                if (!isOnline) return;
                onOpenCreateModal();
              }}
              disabled={!isOnline}
              aria-keyshortcuts="N"
              title={
                !isOnline
                  ? "Listing creation is disabled while offline"
                  : "Post an item for sale / swap (Shortcut: N)"
              }
              className={`h-9 inline-flex items-center gap-1.5 px-3.5 rounded-xl text-xs font-bold transition-all select-none shadow-sm whitespace-nowrap shrink-0 ${
                !isOnline
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white cursor-pointer hover:shadow-indigo-500/20"
              }`}
            >
              <PlusCircle className="w-4 h-4 shrink-0" />
              <span className="font-bold">Post Item</span>
              <kbd className="hidden lg:inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[9px] font-mono font-bold rounded bg-white/20 text-white select-none">
                N
              </kbd>
            </motion.button>

            {/* Profile Menu or Sign In */}
            {currentUser ? (
              <div className="relative shrink-0 flex items-center h-9" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="User Account Menu"
                  className={`flex items-center gap-1 p-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                    isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
                  }`}
                >
                  <div className="w-8 h-8 rounded-full p-0.5 border-2 border-indigo-500/80 bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt={currentUser.displayName || "User"}
                        className="w-full h-full rounded-full object-cover shrink-0 block"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                        {currentUser.displayName?.charAt(0) || "S"}
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3 h-3 shrink-0 ${
                      isDark ? "text-slate-400" : "text-slate-600"
                    }`}
                  />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -6 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -6 }}
                      transition={{ duration: 0.15 }}
                      className={`absolute right-0 mt-2 w-60 rounded-2xl shadow-2xl border py-2 z-50 text-xs backdrop-blur-xl ${
                        isDark
                          ? "bg-[#0B0F19] border-slate-800 text-slate-200 shadow-black/80"
                          : "bg-white border-slate-200 text-slate-700 shadow-slate-200/80"
                      }`}
                    >
                      {/* User Header */}
                      <div
                        className={`px-4 py-2.5 border-b ${
                          isDark ? "border-slate-800" : "border-slate-200/80"
                        }`}
                      >
                        <div
                          className={`font-bold flex items-center gap-1.5 ${
                            isDark ? "text-white" : "text-slate-900"
                          }`}
                        >
                          <span>{currentUser.displayName || "Student User"}</span>
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        </div>
                        <span
                          className={`text-[11px] truncate block font-mono mt-0.5 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          {currentUser.email}
                        </span>
                        <div className="mt-1.5">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold border ${
                              isDark
                                ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/60"
                                : "bg-emerald-500/15 text-emerald-700 border-emerald-500/20"
                            }`}
                          >
                            ✓ Verified Student
                          </span>
                        </div>

                        {/* Campus Milestones Badges */}
                        <div
                          className={`mt-2.5 pt-2 border-t ${
                            isDark ? "border-slate-800/80" : "border-slate-200/60"
                          }`}
                        >
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-500" />
                            <span>Milestones</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/25">
                              <Trophy className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              Top Seller
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/15 text-sky-700 dark:text-sky-300 border border-sky-500/25">
                              <Zap className="w-2.5 h-2.5 fill-sky-500 text-sky-500" />
                              Fast Reply
                            </span>
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                              <Leaf className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500" />
                              Circular
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dropdown Menu Items */}
                      <div className="py-1">
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenYourChats();
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                            isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
                            Your Chats
                          </span>
                          {chatsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 font-bold text-[10px]">
                              {chatsCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenWishlist();
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                            isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <Heart className="w-3.5 h-3.5 text-rose-500" />
                            Saved Wishlist
                          </span>
                          {wishlistCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold text-[10px]">
                              {wishlistCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenAlerts();
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                            isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <Bell className="w-3.5 h-3.5 text-amber-500" />
                            Notify Me Alerts
                          </span>
                          {alertsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-bold text-[10px]">
                              {alertsCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenHandovers();
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium transition-colors cursor-pointer ${
                            isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                          <span>Handover Schedule</span>
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenTopperNotes();
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer ${
                            isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-medium">
                            <GraduationCap className="w-3.5 h-3.5 text-emerald-500" />
                            Topper Notes Vault
                          </span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 font-bold text-[10px]">
                            Free
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenPBLInfo();
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center gap-2 font-medium transition-colors cursor-pointer ${
                            isDark ? "hover:bg-slate-800" : "hover:bg-slate-50"
                          }`}
                        >
                          <BookOpen className="w-3.5 h-3.5 text-purple-500" />
                          <span>PBL Project Info</span>
                        </button>
                      </div>

                      <div
                        className={`pt-1 border-t ${
                          isDark ? "border-slate-800" : "border-slate-200/80"
                        }`}
                      >
                        <button
                          onClick={() => {
                            setShowProfileMenu(false);
                            onLogout();
                          }}
                          className={`w-full text-left px-4 py-2 flex items-center gap-2 font-semibold text-rose-600 dark:text-rose-400 transition-colors cursor-pointer ${
                            isDark ? "hover:bg-rose-500/20" : "hover:bg-rose-50"
                          }`}
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-2 h-9 shrink-0">
                <button
                  onClick={onLogin}
                  title="Sign in with your Google account"
                  className={`h-9 flex items-center gap-2 px-3 rounded-xl border text-xs font-semibold shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isDark
                      ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-750"
                      : "bg-white hover:bg-slate-50 text-slate-800 border-slate-300"
                  }`}
                >
                  <svg
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="w-3.5 h-3.5 shrink-0"
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
                  <span className="inline font-semibold">Sign In</span>
                </button>
                {onDemoLogin && (
                  <button
                    onClick={onDemoLogin}
                    title="1-Click verified student account for testing without Google popup"
                    className="h-9 inline-flex items-center px-2.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 text-xs font-semibold transition-all cursor-pointer whitespace-nowrap shrink-0"
                  >
                    <span>Demo</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ================= MOBILE / TABLET HORIZONTAL ACTIONS SLIDER ================= */}
        <div className="xl:hidden w-full border-t border-slate-200/80 dark:border-slate-800/80 py-2">
          <HorizontalSlider
            id="navbar-mobile-actions-slider"
            showArrows={true}
            showProgress={false}
            showMobileHint={false}
            scrollStep={180}
            ariaLabel="Mobile Campus Tools Slider"
            trackClassName="gap-2 px-1"
          >
            {/* 1. Topper Notes Vault */}
            <button
              id="mobile-nav-topper-notes-btn"
              onClick={onOpenTopperNotes}
              className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer select-none whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-300"
                  : "bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-700 shadow-2xs"
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <span>Topper Vault</span>
              <span
                className={`px-1 py-0.2 rounded text-[9px] font-black uppercase tracking-wider ${
                  isDark
                    ? "bg-emerald-500/25 text-emerald-300"
                    : "bg-emerald-200/80 text-emerald-800"
                }`}
              >
                Free
              </span>
            </button>

            {/* 2. AI Inspector */}
            <button
              id="mobile-nav-ai-inspector-btn"
              onClick={onOpenAIInspector}
              className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-slate-900/70 hover:bg-slate-800 text-slate-300 hover:text-white border-slate-800"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400 shrink-0" />
              <span>AI Inspector</span>
            </button>

            {/* 3. Handovers */}
            <button
              id="mobile-nav-handovers-btn"
              onClick={onOpenHandovers}
              className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                upcomingHandoversCount > 0
                  ? isDark
                    ? "bg-blue-500/15 text-blue-300 border-blue-500/30"
                    : "bg-blue-50 text-blue-700 border-blue-200 shadow-2xs"
                  : isDark
                  ? "bg-slate-900/70 text-slate-300 border-slate-800"
                  : "bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
              <span>Handovers</span>
              {upcomingHandoversCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-blue-500 text-white font-black text-[10px]">
                  {upcomingHandoversCount}
                </span>
              )}
            </button>

            {/* 4. Your Chats */}
            <button
              id="mobile-nav-chats-btn"
              onClick={onOpenYourChats}
              className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-slate-900/80 text-slate-300 border-slate-800"
                  : "bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>Chats</span>
              {chatsCount > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-indigo-600 text-white font-black text-[10px] flex items-center justify-center">
                  {chatsCount}
                </span>
              )}
            </button>

            {/* 5. Wishlist */}
            <button
              id="mobile-nav-wishlist-btn"
              onClick={onOpenWishlist}
              className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-slate-900/80 text-slate-300 border-slate-800"
                  : "bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 shrink-0 ${
                  wishlistCount > 0 ? "fill-rose-500 text-rose-500" : "text-rose-500"
                }`}
              />
              <span>Saved</span>
              {wishlistCount > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>

            {/* 6. Alerts */}
            <button
              id="mobile-nav-alerts-btn"
              onClick={onOpenAlerts}
              className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-slate-900/80 text-slate-300 border-slate-800"
                  : "bg-slate-50 text-slate-700 border-slate-200 shadow-2xs"
              }`}
            >
              <Bell
                className={`w-3.5 h-3.5 shrink-0 ${
                  alertsCount > 0 ? "fill-amber-500 text-amber-500" : "text-amber-500"
                }`}
              />
              <span>Alerts</span>
              {alertsCount > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] flex items-center justify-center">
                  {alertsCount}
                </span>
              )}
            </button>

            {/* 7. PBL Report */}
            <button
              id="mobile-nav-pbl-btn"
              onClick={onOpenPBLInfo}
              className={`h-8 inline-flex items-center gap-1.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                isDark
                  ? "bg-indigo-500/10 text-indigo-300 border-indigo-500/30"
                  : "bg-purple-50 text-purple-700 border-purple-200 shadow-2xs"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>PBL Report</span>
            </button>
          </HorizontalSlider>
        </div>
      </div>
    </header>
  );
};
