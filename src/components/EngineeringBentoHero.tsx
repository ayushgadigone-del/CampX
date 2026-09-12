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
  onOpenCreateModal: () => void;
  onOpenAIInspector: () => void;
  onOpenTopperNotes: () => void;
  onOpenWishlist: () => void;
  onFocusSearch: () => void;
  onSelectCategory: (cat: any) => void;
}

export const EngineeringBentoHero: React.FC<EngineeringBentoHeroProps> = ({
  totalListingsCount,
  onOpenCreateModal,
  onOpenAIInspector,
  onOpenTopperNotes,
  onOpenWishlist,
  onFocusSearch,
  onSelectCategory,
}) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <div className="w-full mb-8">
      {/* Top Engineering Micro-Status Ribbon (Linear / Raycast Style) */}
      <div
        className={`w-full mb-4 px-3.5 py-2 rounded-xl text-xs flex flex-wrap items-center justify-between gap-3 border transition-colors ${
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
              PVG's COET Terminal Node:
            </strong>{" "}
            Pune Campus Network Online
          </span>
        </div>

        {/* Keyboard Shortcut Cheatsheet Pills */}
        <div className="hidden lg:flex items-center gap-2 text-[11px] font-mono">
          <span className="text-zinc-500">Shortcuts:</span>
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
          <button
            onClick={onOpenCreateModal}
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

      {/* Main Asymmetric Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-12 gap-4">
        {/* Bento Box 1: Large Terminal Command Hub (7 Cols on LG) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className={`lg:col-span-7 rounded-2xl p-5 md:p-6 border relative overflow-hidden flex flex-col justify-between ${
            isDark
              ? "bg-gradient-to-br from-zinc-900/95 via-zinc-900/80 to-zinc-950/95 border-zinc-800/90 shadow-xl"
              : "bg-gradient-to-br from-white via-slate-50 to-indigo-50/30 border-slate-200/90 shadow-md"
          }`}
        >
          {/* Subtle background tech grid lines */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-center justify-between">
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

            <div className="space-y-1.5">
              <h1
                className={`text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                PVG's COET Engineering Resale & Exchange
              </h1>
              <p
                className={`text-xs sm:text-sm leading-relaxed max-w-xl ${
                  isDark ? "text-zinc-400" : "text-slate-600"
                }`}
              >
                The zero-commission campus exchange for Casio fx-991 calculators, SPPU engineering textbooks, mini drafters, cycles, and free topper exam revision notes.
              </p>
            </div>

            {/* Quick Department / Subject Filter Shortcuts */}
            <div className="pt-2 flex flex-wrap items-center gap-1.5">
              <span
                className={`text-[11px] font-mono font-semibold ${
                  isDark ? "text-zinc-400" : "text-slate-500"
                }`}
              >
                Quick Tags:
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
              onClick={onOpenCreateModal}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Equipment</span>
              <kbd className="hidden sm:inline px-1 py-0.2 text-[10px] bg-indigo-700 rounded font-mono">
                N
              </kbd>
            </button>

            <button
              onClick={onOpenTopperNotes}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors flex items-center gap-2 cursor-pointer ${
                isDark
                  ? "bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border-amber-500/30"
                  : "bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200"
              }`}
            >
              <GraduationCap className="w-4 h-4 text-amber-400" />
              <span>Free Topper Notes Vault</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500 text-white text-[10px] font-extrabold uppercase">
                Free
              </span>
            </button>
          </div>
        </motion.div>

        {/* Bento Box 2: Gemini 3.1 Pro Preview Scanner Widget (5 Cols on LG) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className={`lg:col-span-5 rounded-2xl p-5 md:p-6 border relative overflow-hidden flex flex-col justify-between ${
            isDark
              ? "bg-gradient-to-br from-zinc-900/95 via-indigo-950/30 to-zinc-900/95 border-indigo-500/30 shadow-xl"
              : "bg-gradient-to-br from-indigo-50/60 via-white to-indigo-50/40 border-indigo-200 shadow-md"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between">
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
              </div>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  isDark
                    ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                    : "bg-slate-200 text-slate-700"
                }`}
              >
                Multi-Modal Vision
              </span>
            </div>

            <div>
              <h2
                className={`text-base font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                AI Condition & Pricing Inspector
              </h2>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isDark ? "text-zinc-400" : "text-slate-600"
                }`}
              >
                Snap a photo of your pre-owned gear. Gemini identifies model serials, scratches, key wear, and calculates fair student pricing (₹) automatically.
              </p>
            </div>

            {/* Micro Feature Matrix */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div
                className={`p-2.5 rounded-xl border text-xs ${
                  isDark
                    ? "bg-zinc-900/80 border-zinc-800"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <span className="block font-mono text-[10px] text-indigo-400 font-bold uppercase">
                  Detection
                </span>
                <span
                  className={`font-semibold text-[11px] ${
                    isDark ? "text-zinc-200" : "text-slate-800"
                  }`}
                >
                  Scratches & Dents
                </span>
              </div>
              <div
                className={`p-2.5 rounded-xl border text-xs ${
                  isDark
                    ? "bg-zinc-900/80 border-zinc-800"
                    : "bg-white border-slate-200 shadow-2xs"
                }`}
              >
                <span className="block font-mono text-[10px] text-emerald-400 font-bold uppercase">
                  Fair Price Range
                </span>
                <span
                  className={`font-semibold text-[11px] ${
                    isDark ? "text-zinc-200" : "text-slate-800"
                  }`}
                >
                  ₹ Indian Student Budget
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2">
            <button
              onClick={onOpenAIInspector}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isDark
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-500/50 shadow-md shadow-indigo-600/20"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-600 shadow-sm"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-200" />
              <span>Launch AI Item Scanner</span>
            </button>
          </div>
        </motion.div>

        {/* Bento Box 3: Three Micro Stats Tiles (Span 12) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3"
        >
          {/* Stat 1: Verified Items Available */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
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
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
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
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
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
                  Quad & Library
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
            className={`p-3.5 rounded-xl border flex items-center justify-between ${
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
                  className={`text-base font-black truncate max-w-[130px] ${
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
