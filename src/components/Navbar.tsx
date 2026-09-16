import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Trophy,
  Zap,
  Leaf,
  MapPin,
} from "lucide-react";
import { User } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";
import { ThemeSelector } from "./ThemeSelector";

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
  alertsCount?: number;
  onOpenAlerts: () => void;
  onOpenBlueprint?: () => void;
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
  alertsCount = 0,
  onOpenAlerts,
  onOpenBlueprint,
  isOnline = true,
  isSimulatedOffline = false,
  onToggleSimulateOffline,
  onShowToast,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  return (
    <header
      className={`sticky top-0 z-40 w-full backdrop-blur-xl border-b transition-colors duration-200 ${
        isDark
          ? "bg-slate-950/95 border-indigo-500/40 shadow-xl shadow-black/40"
          : "bg-white/95 border-slate-200/90 shadow-xs"
      }`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12">
        <div className="flex items-center justify-between h-16 gap-3">
          {/* Brand Logo & College Marker */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              onClick={onOpenPBLInfo}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center font-black text-lg shadow-md group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className={`text-base font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Campus Resale
                  </span>
                  <span className="text-xs font-bold text-purple-500">&</span>
                  <span className={`text-base font-extrabold tracking-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                    Exchange
                  </span>
                </div>
                <div className={`flex items-center gap-1 text-[10px] font-medium -mt-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  <span>PVG's COET Marketplace</span>
                  <span>•</span>
                  <span className="text-purple-600 dark:text-indigo-400 font-bold">PBL 2026</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Icons & User Info */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* AI Inspector button */}
            <button
              id="navbar-ai-inspector-btn"
              onClick={onOpenAIInspector}
              aria-keyshortcuts="I"
              title="Inspect item condition with Gemini AI (Shortcut: I)"
              className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shadow-2xs cursor-pointer ${
                isDark
                  ? "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30"
                  : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 shadow-xs"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-500 dark:text-indigo-400" />
              <span className="hidden md:inline">AI Inspector</span>
              <kbd
                className={`hidden lg:inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-mono font-bold rounded border select-none ${
                  isDark
                    ? "bg-indigo-950/60 text-indigo-300 border-indigo-700/50"
                    : "bg-purple-100 text-purple-700 border-purple-200"
                }`}
                title="Shortcut: I"
              >
                I
              </kbd>
            </button>

            {/* Notify Me / Alerts Button */}
            <button
              id="navbar-alerts-button"
              onClick={onOpenAlerts}
              title="Set 'Notify Me' alerts for calculators, books, and keywords"
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shadow-2xs ${
                isDark
                  ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200 shadow-xs"
              }`}
            >
              <Bell
                className={`w-3.5 h-3.5 ${
                  alertsCount > 0
                    ? "text-amber-500 fill-amber-500"
                    : "text-amber-500"
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
            <motion.button
              id="navbar-wishlist-button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenWishlist}
              aria-keyshortcuts="W"
              title="View Saved Wishlist (Shortcut: W)"
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shadow-2xs cursor-pointer ${
                isDark
                  ? "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border-rose-500/30"
                  : "bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 shadow-xs"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlistCount > 0
                    ? "fill-rose-500 text-rose-500"
                    : "text-rose-500"
                }`}
              />
              <span className="hidden md:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
              <kbd
                className={`hidden sm:inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-mono font-bold rounded border shadow-2xs select-none ${
                  isDark
                    ? "bg-rose-950/60 text-rose-300 border-rose-700/50"
                    : "bg-rose-100 text-rose-700 border-rose-200"
                }`}
                title="Shortcut: W"
              >
                W
              </kbd>
            </motion.button>

            {/* Google Calendar Handover link */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenHandovers}
              title="View Scheduled Campus Handovers"
              className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shadow-2xs ${
                isDark
                  ? "bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/30"
                  : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 shadow-xs"
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden lg:inline">Handovers</span>
              {upcomingHandoversCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {upcomingHandoversCount}
                </span>
              )}
            </motion.button>

            {/* Campus Blueprint Map Button */}
            {onOpenBlueprint && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onOpenBlueprint}
                title="Interactive Campus Handover Blueprint & Map"
                className={`relative inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors shadow-2xs cursor-pointer ${
                  isDark
                    ? "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30"
                    : "bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200 shadow-xs"
                }`}
              >
                <MapPin className="w-3.5 h-3.5 text-purple-600 dark:text-indigo-400" />
                <span className="hidden xl:inline">Campus Map</span>
              </motion.button>
            )}

            {/* Network Status Indicator */}
            {onToggleSimulateOffline && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
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
              </motion.button>
            )}

            {/* Post Item Button */}
            <motion.button
              id="navbar-post-item-btn"
              whileHover={isOnline ? { scale: 1.05 } : {}}
              whileTap={isOnline ? { scale: 0.95 } : {}}
              onClick={() => {
                if (!isOnline) return;
                onOpenCreateModal();
              }}
              disabled={!isOnline}
              aria-keyshortcuts="N"
              title={
                !isOnline
                  ? "Offline mode: Creating listings is disabled while disconnected"
                  : "Create Listing / Post Item (Shortcut: N)"
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
              <kbd
                className="hidden sm:inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-mono font-bold rounded bg-white/20 text-white border border-white/30 shadow-2xs select-none"
                title="Shortcut: N"
              >
                N
              </kbd>
            </motion.button>

            {/* Free Topper Notes Vault Button */}
            <motion.button
              id="navbar-topper-notes-btn"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onOpenTopperNotes}
              aria-keyshortcuts="T"
              title="Free Topper Notes Vault (Shortcut: T)"
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all shadow-sm cursor-pointer select-none ${
                isDark
                  ? "bg-gradient-to-r from-emerald-600/25 via-teal-600/20 to-emerald-600/25 hover:from-emerald-600/35 hover:to-teal-600/30 border-emerald-500/40 text-emerald-300 shadow-emerald-950/20"
                  : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 border-emerald-600 text-white shadow-emerald-600/25"
              }`}
            >
              <GraduationCap className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-emerald-300" : "text-white"}`} />
              <span className="hidden md:inline">Topper Notes</span>
              <span
                className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                  isDark
                    ? "bg-emerald-500/30 text-emerald-300 border border-emerald-400/30"
                    : "bg-white/25 text-white border border-white/30"
                }`}
              >
                Free
              </span>
              <kbd
                className={`hidden lg:inline-flex items-center justify-center min-w-[17px] h-[17px] px-1 text-[10px] font-mono font-bold rounded border select-none ${
                  isDark
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50"
                    : "bg-white/25 text-white border border-white/30"
                }`}
                title="Shortcut: T"
              >
                T
              </kbd>
            </motion.button>

            {/* Light / Dark Mode Selector */}
            <div className="hidden sm:inline-flex">
              <ThemeSelector variant="segmented" />
            </div>
            <div className="sm:hidden inline-flex">
              <ThemeSelector variant="button" />
            </div>

            {/* Compact Group for PBL Info and User Profile */}
            <div className="flex items-center gap-1 sm:gap-1.5 shrink-0 mr-1 sm:mr-2">
              {/* PBL Info Button */}
              <button
                onClick={onOpenPBLInfo}
                title="PBL Project Scope & Team Info"
                className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  isDark
                    ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100"
                }`}
              >
                <BookOpen className="w-4 h-4" />
              </button>

              {/* Auth / Profile Area */}
              {currentUser ? (
                <div className="relative shrink-0">
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    aria-label="User Profile and Account Menu"
                    className={`flex items-center gap-1 p-0.5 rounded-full transition-colors cursor-pointer shrink-0 ${
                      isDark ? "hover:bg-slate-800" : "hover:bg-slate-100"
                    }`}
                  >
                    <div className="w-8 h-8 min-w-[32px] min-h-[32px] max-w-[32px] max-h-[32px] rounded-full p-0.5 border-2 border-indigo-500/70 bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 aspect-square overflow-hidden shadow-xs">
                      {currentUser.photoURL ? (
                        <img
                          src={currentUser.photoURL}
                          alt={currentUser.displayName || "User"}
                          className="w-full h-full rounded-full object-cover shrink-0 aspect-square block"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-indigo-600 text-white font-black flex items-center justify-center text-xs shrink-0 aspect-square">
                          {currentUser.displayName?.charAt(0) || "S"}
                        </div>
                      )}
                    </div>
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 ${
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
                        className="absolute right-0 mt-2 w-56 rounded-2xl shadow-2xl border border-slate-700 py-2 z-50 text-xs backdrop-blur-xl bg-slate-800/95 text-slate-200"
                      >
                      <div
                        className="px-4 py-2 border-b border-slate-700/80"
                      >
                        <div
                          className="font-bold flex items-center gap-1 text-white"
                        >
                          {currentUser.displayName || "Student User"}
                          <BadgeCheck className="w-3.5 h-3.5 text-blue-400" />
                        </div>
                        <span
                          className="text-[11px] truncate block font-mono text-slate-400"
                        >
                          {currentUser.email}
                        </span>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <span
                            className="inline-block px-2 py-0.5 rounded-md font-semibold text-[10px] border bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
                          >
                            ✓ @pvgcoet.ac.in Verified
                          </span>
                        </div>

                        {/* Student Milestones Badges */}
                        <div className="mt-2 pt-2 border-t border-slate-700/60">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                            <Trophy className="w-3 h-3 text-amber-400" />
                            <span>Campus Milestones</span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span
                              title="Top Seller: 3+ completed campus handovers"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 select-none"
                            >
                              <Trophy className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              Top Seller
                            </span>
                            <span
                              title="Quick Responder: Average response under 15 minutes"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30 select-none"
                            >
                              <Zap className="w-2.5 h-2.5 fill-sky-400 text-sky-400" />
                              Quick Responder
                            </span>
                            <span
                              title="Eco-Friendly Exchanger: Active in direct student swaps & zero-waste circular trade"
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 select-none"
                            >
                              <Leaf className="w-2.5 h-2.5 fill-emerald-400 text-emerald-400" />
                              Eco-Friendly
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Dark/Light Mode toggle option in dropdown */}
                      <ThemeSelector variant="dropdown-item" />

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenAlerts();
                        }}
                        className="w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-700/60 text-slate-300 hover:text-white"
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
                        className="w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-700/60 text-slate-300 hover:text-white"
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
                        className="w-full text-left px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer hover:bg-slate-700/60 text-slate-300 hover:text-white"
                      >
                        <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                        Calendar Handovers
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenTopperNotes();
                        }}
                        className="w-full text-left px-4 py-2 flex items-center justify-between transition-colors cursor-pointer hover:bg-slate-700/60 text-slate-300 hover:text-white"
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
                        className="w-full text-left px-4 py-2 flex items-center gap-2 transition-colors cursor-pointer hover:bg-slate-700/60 text-slate-300 hover:text-white"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                        PBL Project Report
                      </button>

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2 flex items-center gap-2 font-semibold border-t border-slate-700/80 hover:bg-rose-500/20 text-rose-300 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={onLogin}
                  title="Sign in with your Google account"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold shadow-md transition-all cursor-pointer"
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
      </div>
    </header>
  );
};
