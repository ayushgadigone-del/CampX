import React from "react";
import { motion } from "motion/react";
import {
  Terminal,
  Cpu,
  Sparkles,
  ShieldCheck,
  TrendingDown,
  CalendarCheck,
  PlusCircle,
  Search,
  GraduationCap,
  Heart,
  Sun,
  Moon,
  Zap,
  Tag,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface EngineeringBentoHeroProps {
  totalListingsCount: number;
  availableCount?: number;
  topperNotesCount?: number;
  upcomingHandoversCount?: number;
  isOnline?: boolean;
  onOpenCreateListing?: () => void;
  onOpenCreateModal?: () => void;
  onOpenAIInspector: () => void;
  onOpenTopperNotes: () => void;
  onOpenWishlist?: () => void;
  onOpenAlerts?: () => void;
  onOpenPBLInfo?: () => void;
  onFocusSearch?: () => void;
  onSelectCategory: (cat: any) => void;
  selectedCategory?: string;
}

export const EngineeringBentoHero: React.FC<EngineeringBentoHeroProps> = ({
  totalListingsCount,
  availableCount,
  topperNotesCount = 0,
  upcomingHandoversCount = 0,
  isOnline = true,
  onOpenCreateListing,
  onOpenCreateModal,
  onOpenAIInspector,
  onOpenTopperNotes,
  onOpenWishlist,
  onOpenAlerts,
  onOpenPBLInfo,
  onFocusSearch,
  onSelectCategory,
  selectedCategory = "All",
}) => {
  const { isDark, toggleTheme } = useTheme();
  const handleCreate = onOpenCreateListing || onOpenCreateModal || (() => {});

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 mb-6 sm:mb-8">
      {/* Top Engineering Micro-Status Ribbon (Linear / Raycast Style) */}
      <div
        className={`w-full mb-4 px-3.5 sm:px-4 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 border transition-colors ${
          isDark
            ? "bg-zinc-950/80 border-zinc-800 text-zinc-400"
            : "bg-white/90 border-slate-200 text-slate-600 shadow-2xs"
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-mono text-[11px] font-semibold tracking-tight">
            <strong className={isDark ? "text-zinc-200" : "text-slate-900"}>
              PVG&apos;s COET Terminal Node:
            </strong>{" "}
            Pune Campus Network Online
          </span>
        </div>

        {/* Keyboard Shortcut Cheatsheet Pills */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono">
          <span className="text-zinc-500">Shortcuts:</span>
          {onFocusSearch && (
            <button
              onClick={onFocusSearch}
              className={`px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-indigo-500"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:border-indigo-400"
              }`}
              title="Focus search input"
            >
              <kbd className="font-bold">/</kbd> Search
            </button>
          )}
          <button
            onClick={handleCreate}
            className={`px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-indigo-500"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:border-indigo-400"
            }`}
            title="Create new listing"
          >
            <kbd className="font-bold">N</kbd> Post
          </button>
          <button
            onClick={onOpenTopperNotes}
            className={`px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors cursor-pointer ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-indigo-500"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:border-indigo-400"
            }`}
            title="Open Topper Notes vault"
          >
            <kbd className="font-bold">T</kbd> Notes
          </button>
          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              className={`px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors cursor-pointer ${
                isDark
                  ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-indigo-500"
                  : "bg-slate-100 border-slate-300 text-slate-700 hover:border-indigo-400"
              }`}
              title="Open saved wishlist"
            >
              <kbd className="font-bold">W</kbd> Wishlist
            </button>
          )}
          <button
            onClick={toggleTheme}
            className={`px-1.5 py-0.5 rounded border text-[10px] font-mono transition-colors cursor-pointer flex items-center gap-1 ${
              isDark
                ? "bg-zinc-900 border-zinc-700 text-zinc-300 hover:border-amber-400"
                : "bg-slate-100 border-slate-300 text-slate-700 hover:border-indigo-400"
            }`}
            title="Toggle Dark / Light Mode"
          >
            <kbd className="font-bold">D</kbd> {isDark ? "Light" : "Dark"}
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-emerald-400 font-bold">
            100% Student Verified
          </span>
        </div>
      </div>

      {/* Main Structural Flow */}
      <div className="space-y-4 sm:space-y-5">
        {/* SECTION 1: PVG's COET Engineering Resale & Exchange (Full Width) */}
        <motion.div
          id="pvg-engineering-resale-section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`w-full rounded-2xl p-5 sm:p-6 md:p-7 border relative overflow-hidden flex flex-col justify-between ${
            isDark
              ? "bg-gradient-to-br from-zinc-900/95 via-zinc-900/85 to-zinc-950/95 border-zinc-800/90 shadow-xl"
              : "bg-gradient-to-br from-white via-slate-50 to-indigo-50/40 border-slate-200/90 shadow-md"
          }`}
        >
          {/* Subtle background tech grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 space-y-3.5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`p-1.5 rounded-lg font-mono text-xs font-bold flex items-center gap-1.5 border ${
                    isDark
                      ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300"
                      : "bg-indigo-50 border-indigo-200 text-indigo-700"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                  <span>terminal://pvgcoet.market</span>
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider ${
                    isDark
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  v2.6 Engineering Build
                </span>
                {onOpenPBLInfo && (
                  <button
                    onClick={onOpenPBLInfo}
                    className={`hidden sm:inline-flex px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider border cursor-pointer transition-colors ${
                      isDark
                        ? "bg-indigo-950/40 text-indigo-300 border-indigo-800/50 hover:bg-indigo-900/60"
                        : "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    }`}
                  >
                    PBL 2026 CS Specs
                  </button>
                )}
              </div>

              {/* Theme quick toggle pill */}
              <button
                onClick={toggleTheme}
                className={`p-2 rounded-xl border transition-colors flex items-center gap-1.5 text-xs font-semibold cursor-pointer ${
                  isDark
                    ? "bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-200"
                    : "bg-white hover:bg-slate-100 border-slate-300 text-slate-800 shadow-2xs"
                }`}
                title={`Switch to ${isDark ? "Light" : "Dark"} Mode (or press 'D')`}
              >
                {isDark ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden sm:inline">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="hidden sm:inline">Dark Mode</span>
                  </>
                )}
              </button>
            </div>

            <div className="space-y-1.5 max-w-4xl">
              <h1
                className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                PVG&apos;s COET Engineering Resale &amp; Exchange
              </h1>
              <p
                className={`text-xs sm:text-sm md:text-base leading-relaxed ${
                  isDark ? "text-zinc-300" : "text-slate-600"
                }`}
              >
                The official zero-commission Pune campus exchange for Casio fx-991 calculators, SPPU engineering textbooks, mini drafters, cycles, lab aprons, and free topper exam revision notes.
              </p>
            </div>

            {/* Quick Department / Subject Filter Shortcuts */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span
                className={`text-[11px] font-mono font-semibold flex items-center gap-1 ${
                  isDark ? "text-zinc-400" : "text-slate-500"
                }`}
              >
                <Tag className="w-3 h-3 text-indigo-400" />
                <span>Quick Tags:</span>
              </span>
              {[
                { label: "Casio fx-991", cat: "Calculators" },
                { label: "SPPU Textbooks", cat: "Books" },
                { label: "Mini Drafters", cat: "Lab Equipment" },
                { label: "Campus Cycles", cat: "Cycles" },
                { label: "FE Common Gear", cat: "Lab Equipment" },
              ].map((t) => (
                <button
                  key={t.label}
                  onClick={() => onSelectCategory(t.cat)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                    isDark
                      ? "bg-zinc-800/80 hover:bg-zinc-700 border-zinc-700 text-zinc-300 hover:text-white hover:border-indigo-500/50"
                      : "bg-white hover:bg-slate-100 border-slate-200 text-slate-700 hover:text-indigo-600 shadow-2xs"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Action Row */}
          <div className="relative z-10 pt-4 mt-4 border-t flex flex-wrap items-center gap-3 border-zinc-700/60">
            <button
              onClick={handleCreate}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Equipment</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 text-[10px] bg-indigo-700 rounded font-mono font-bold">
                N
              </kbd>
            </button>

            <button
              onClick={onOpenTopperNotes}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
                isDark
                  ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Free Topper Notes Vault</span>
              <span className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[10px] font-extrabold uppercase tracking-wider">
                Free
              </span>
            </button>

            {onOpenAlerts && (
              <button
                onClick={onOpenAlerts}
                className={`px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center gap-1.5 cursor-pointer ${
                  isDark
                    ? "bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 border-zinc-700"
                    : "bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-2xs"
                }`}
              >
                <span>Equipment Alerts</span>
              </button>
            )}
          </div>
        </motion.div>

        {/* SECTION 2: AI Condition & Pricing Inspector (Positioned Below PVG Engineering Resale & Exchange) */}
        <motion.div
          id="ai-condition-pricing-inspector-section"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={`w-full rounded-2xl p-5 sm:p-6 md:p-7 border relative overflow-hidden flex flex-col justify-between ${
            isDark
              ? "bg-gradient-to-br from-zinc-900/95 via-indigo-950/40 to-zinc-900/95 border-indigo-500/35 shadow-xl"
              : "bg-gradient-to-br from-indigo-50/80 via-white to-indigo-50/50 border-indigo-200/90 shadow-md"
          }`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span
                  className={`p-1.5 rounded-lg border flex items-center gap-1.5 text-xs font-bold ${
                    isDark
                      ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/30"
                      : "bg-indigo-100 text-indigo-800 border-indigo-200"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
                  <span>Gemini 3.1 Pro Preview</span>
                </span>
                <span
                  className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                    isDark
                      ? "bg-indigo-950/60 text-indigo-300 border border-indigo-800/60"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  Multi-Modal Computer Vision &amp; Pricing
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-bold px-2.5 py-1 rounded-md ${
                  isDark
                    ? "bg-zinc-800 text-emerald-400 border border-zinc-700"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                PBL AI Inspection Lab Ready
              </span>
            </div>

            <div className="max-w-3xl">
              <h2
                className={`text-lg sm:text-xl md:text-2xl font-extrabold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                AI Condition &amp; Pricing Inspector
              </h2>
              <p
                className={`text-xs sm:text-sm mt-1.5 leading-relaxed ${
                  isDark ? "text-zinc-300" : "text-slate-600"
                }`}
              >
                Snap or upload a photo of your pre-owned engineering equipment. Gemini scans model serials, verifies authenticity, detects scratches, dents, and key wear, and calculates fair SPPU student pricing (₹) automatically.
              </p>
            </div>

            {/* Feature Highlights Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
              <div
                className={`p-3 rounded-xl border text-xs ${
                  isDark
                    ? "bg-zinc-900/85 border-zinc-800"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-indigo-400 font-bold uppercase tracking-wider">
                    Defect Detection
                  </span>
                  <Zap className="w-3.5 h-3.5 text-indigo-400" />
                </div>
                <div
                  className={`font-semibold text-xs ${
                    isDark ? "text-zinc-200" : "text-slate-800"
                  }`}
                >
                  Scratches, Dents &amp; Key Wear
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  Locates cosmetic blemishes and grades condition (Like New, Good, Fair).
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs ${
                  isDark
                    ? "bg-zinc-900/85 border-zinc-800"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-emerald-400 font-bold uppercase tracking-wider">
                    Fair Price Range
                  </span>
                  <span className="text-xs font-bold text-emerald-500">₹</span>
                </div>
                <div
                  className={`font-semibold text-xs ${
                    isDark ? "text-zinc-200" : "text-slate-800"
                  }`}
                >
                  ₹ Indian Student Budget
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  Computes fair campus resale valuation to prevent price gouging.
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs ${
                  isDark
                    ? "bg-zinc-900/85 border-zinc-800"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-blue-400 font-bold uppercase tracking-wider">
                    Instant Auto-Draft
                  </span>
                  <Cpu className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div
                  className={`font-semibold text-xs ${
                    isDark ? "text-zinc-200" : "text-slate-800"
                  }`}
                >
                  1-Click Listing Setup
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  Pre-fills equipment name, specs, condition tier, and price into your form.
                </p>
              </div>

              <div
                className={`p-3 rounded-xl border text-xs ${
                  isDark
                    ? "bg-zinc-900/85 border-zinc-800"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Authenticity
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div
                  className={`font-semibold text-xs ${
                    isDark ? "text-zinc-200" : "text-slate-800"
                  }`}
                >
                  Model &amp; Serial Verification
                </div>
                <p className={`text-[11px] mt-1 ${isDark ? "text-zinc-400" : "text-slate-500"}`}>
                  Detects genuine Casio, Tech-Max, Omega drafter hallmarks.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-indigo-500/20">
            <div className="flex items-center gap-2 text-xs">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className={isDark ? "text-zinc-400" : "text-slate-600"}>
                Ready for live camera snap or image upload • Works with student gear
              </span>
            </div>

            <button
              onClick={onOpenAIInspector}
              className={`py-2.5 px-5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                isDark
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-indigo-600/25"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-indigo-200"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Launch AI Item Scanner</span>
            </button>
          </div>
        </motion.div>

        {/* SECTION 3: Micro Stats Tiles (Full Width 4-Column Grid) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1"
        >
          {/* Stat 1: Verified Items Available */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800/80"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="space-y-0.5">
              <span
                className={`text-[11px] font-mono uppercase tracking-wider block ${
                  isDark ? "text-zinc-500" : "text-slate-500"
                }`}
              >
                Active Campus Gear
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {totalListingsCount}
                </span>
                <span className="text-[11px] text-emerald-500 font-bold">
                  Verified In Stock
                </span>
              </div>
            </div>
            <div
              className={`p-2.5 rounded-xl ${
                isDark
                  ? "bg-indigo-500/15 text-indigo-400"
                  : "bg-indigo-50 text-indigo-600"
              }`}
            >
              <Cpu className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 2: Student Savings */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800/80"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="space-y-0.5">
              <span
                className={`text-[11px] font-mono uppercase tracking-wider block ${
                  isDark ? "text-zinc-500" : "text-slate-500"
                }`}
              >
                Avg Student Savings
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  64%
                </span>
                <span className="text-[11px] text-emerald-500 font-bold">
                  vs Retail MRP
                </span>
              </div>
            </div>
            <div
              className={`p-2.5 rounded-xl ${
                isDark
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 3: Safe Handover Hotspots */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800/80"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="space-y-0.5">
              <span
                className={`text-[11px] font-mono uppercase tracking-wider block ${
                  isDark ? "text-zinc-500" : "text-slate-500"
                }`}
              >
                Handover Locations
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-xl font-black ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  4 Spots
                </span>
                <span className="text-[11px] text-blue-400 font-bold">
                  Quad &amp; Library
                </span>
              </div>
            </div>
            <div
              className={`p-2.5 rounded-xl ${
                isDark
                  ? "bg-blue-500/15 text-blue-400"
                  : "bg-blue-50 text-blue-600"
              }`}
            >
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>

          {/* Stat 4: Authentication Security */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border flex items-center justify-between ${
              isDark
                ? "bg-zinc-900/70 border-zinc-800/80"
                : "bg-white border-slate-200 shadow-2xs"
            }`}
          >
            <div className="space-y-0.5">
              <span
                className={`text-[11px] font-mono uppercase tracking-wider block ${
                  isDark ? "text-zinc-500" : "text-slate-500"
                }`}
              >
                Domain Restriction
              </span>
              <div className="flex items-baseline gap-2">
                <span
                  className={`text-sm sm:text-base font-black truncate max-w-[130px] ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  @pvgcoet.ac.in
                </span>
                <span className="text-[11px] text-emerald-500 font-bold">
                  Enforced
                </span>
              </div>
            </div>
            <div
              className={`p-2.5 rounded-xl ${
                isDark
                  ? "bg-amber-500/15 text-amber-400"
                  : "bg-amber-50 text-amber-600"
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
