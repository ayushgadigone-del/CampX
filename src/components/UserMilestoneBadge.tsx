import React, { useState, useRef, useEffect } from "react";
import {
  Trophy,
  Zap,
  Leaf,
  Star,
  Award,
  Sparkles,
  CheckCircle2,
  X,
  Info,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { Listing, UserMilestone, MilestoneBadgeId } from "../types";
import { calculateUserMilestones } from "../utils/milestones";
import { useTheme } from "../context/ThemeContext";

interface UserMilestoneBadgeProps {
  listing: Listing;
  allListings?: Listing[];
  variant?: "card-seller" | "detail-seller" | "compact" | "pill-list";
  className?: string;
}

export const UserMilestoneBadge: React.FC<UserMilestoneBadgeProps> = ({
  listing,
  allListings,
  variant = "card-seller",
  className = "",
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const milestones: UserMilestone[] = calculateUserMilestones(
    listing,
    allListings
  );

  // Close when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  if (!milestones || milestones.length === 0) return null;

  const primaryMilestone = milestones[0];
  const additionalCount = milestones.length - 1;

  const getMilestoneIcon = (
    iconName: UserMilestone["icon"],
    sizeClass = "w-2.5 h-2.5"
  ) => {
    switch (iconName) {
      case "Trophy":
        return <Trophy className={`${sizeClass} text-amber-500 fill-amber-500 shrink-0`} />;
      case "Zap":
        return <Zap className={`${sizeClass} text-sky-500 fill-sky-500 shrink-0`} />;
      case "Leaf":
        return <Leaf className={`${sizeClass} text-emerald-500 fill-emerald-500 shrink-0`} />;
      case "Star":
        return <Star className={`${sizeClass} text-indigo-400 fill-indigo-400 shrink-0`} />;
      case "Award":
      default:
        return <Award className={`${sizeClass} text-purple-500 shrink-0`} />;
    }
  };

  const getMilestoneColors = (id: MilestoneBadgeId) => {
    switch (id) {
      case "top-seller":
        return isDark
          ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25"
          : "bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100";
      case "quick-responder":
        return isDark
          ? "bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25"
          : "bg-sky-50 text-sky-800 border-sky-300 hover:bg-sky-100";
      case "eco-friendly-exchanger":
        return isDark
          ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25"
          : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100";
      case "five-star-peer":
        return isDark
          ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25"
          : "bg-indigo-50 text-indigo-800 border-indigo-300 hover:bg-indigo-100";
      case "campus-pioneer":
      default:
        return isDark
          ? "bg-purple-500/15 text-purple-300 border-purple-500/30 hover:bg-purple-500/25"
          : "bg-purple-50 text-purple-800 border-purple-300 hover:bg-purple-100";
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Trigger Button: Displayed next to seller name */}
      <button
        type="button"
        id={`user-milestone-badge-${listing.id}-${primaryMilestone.id}`}
        onClick={handleToggle}
        aria-label={`User Milestone Badge: ${primaryMilestone.label}. Click to view achievements.`}
        title={`User Milestone: ${primaryMilestone.label} • ${primaryMilestone.criteria} (Click to see all badges)`}
        className={`group/badge relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border transition-all duration-150 select-none cursor-pointer ${getMilestoneColors(
          primaryMilestone.id
        )}`}
      >
        {getMilestoneIcon(primaryMilestone.icon, "w-2.5 h-2.5")}
        <span className="font-bold tracking-tight whitespace-nowrap">
          {primaryMilestone.shortLabel}
        </span>
        {additionalCount > 0 && (
          <span
            className={`ml-0.5 px-1 rounded-full text-[8px] font-extrabold ${
              isDark
                ? "bg-slate-800 text-slate-300 border border-slate-700"
                : "bg-slate-200/80 text-slate-700 border border-slate-300"
            }`}
          >
            +{additionalCount}
          </span>
        )}
      </button>

      {/* Interactive Milestone Details Popover */}
      {isOpen && (
        <div
          id={`user-milestone-popover-${listing.id}`}
          onClick={(e) => e.stopPropagation()}
          className={`absolute left-0 sm:left-auto sm:right-0 bottom-full mb-2 w-72 sm:w-80 rounded-2xl shadow-2xl border p-4 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl ${
            isDark
              ? "bg-slate-900/95 border-slate-700 text-slate-200 shadow-black/80"
              : "bg-white/98 border-slate-200 text-slate-800 shadow-slate-900/20"
          }`}
        >
          {/* Popover Header */}
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/60 dark:border-slate-800">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  Student Milestones
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {listing.sellerName} • Campus Verified
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Milestone Badges List */}
          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
            {milestones.map((m) => (
              <div
                key={m.id}
                className={`p-2.5 rounded-xl border text-xs transition-colors ${
                  isDark
                    ? "bg-slate-800/60 border-slate-700/80 hover:bg-slate-800"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100/80"
                }`}
              >
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="p-1 rounded-md bg-slate-100 dark:bg-slate-900/80 shrink-0">
                      {getMilestoneIcon(m.icon, "w-3 h-3")}
                    </span>
                    <span className="font-bold text-[11px] text-slate-900 dark:text-white">
                      {m.label}
                    </span>
                  </div>
                  <span className="text-[9px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    Awarded
                  </span>
                </div>

                <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {m.description}
                </p>

                <div className="mt-1.5 pt-1.5 border-t border-slate-200/50 dark:border-slate-700/50 flex items-center justify-between text-[9px] text-slate-500 dark:text-slate-400">
                  <span className="italic">Criteria: {m.criteria}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-indigo-500" />
              Automated Campus Validation
            </span>
            <span className="font-mono text-[9px]">PVG's COET</span>
          </div>
        </div>
      )}
    </div>
  );
};
