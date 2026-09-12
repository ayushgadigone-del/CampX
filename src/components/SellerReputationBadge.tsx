import React, { useState, useRef, useEffect } from "react";
import {
  ShieldCheck,
  Shield,
  Star,
  CheckCircle2,
  Users,
  Info,
  X,
  Award,
  Sparkles,
  GraduationCap,
} from "lucide-react";
import { Listing } from "../types";
import { calculateSellerReputation, SellerReputation } from "../utils/reputation";
import { useTheme } from "../context/ThemeContext";

interface SellerReputationBadgeProps {
  listing: Listing;
  allListings?: Listing[];
  variant?: "badge" | "compact" | "seller-row" | "inline";
  className?: string;
  onViewReviews?: (listing: Listing) => void;
}

export const SellerReputationBadge: React.FC<SellerReputationBadgeProps> = ({
  listing,
  allListings,
  variant = "badge",
  className = "",
  onViewReviews,
}) => {
  const { isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const rep: SellerReputation = calculateSellerReputation(listing, allListings);

  // Close popover when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleBadgeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIsOpen((prev) => !prev);
  };

  const getTierIcon = () => {
    if (rep.tier === "Elite") {
      return <Award className="w-3 h-3 text-emerald-500 shrink-0" />;
    }
    if (rep.tier === "Trusted") {
      return <ShieldCheck className="w-3 h-3 text-indigo-500 shrink-0" />;
    }
    if (rep.tier === "Good Standing") {
      return <CheckCircle2 className="w-3 h-3 text-sky-500 shrink-0" />;
    }
    return <Shield className="w-3 h-3 text-amber-500 shrink-0" />;
  };

  return (
    <div className={`relative inline-block ${className}`} ref={popoverRef}>
      {/* Badge Button Trigger */}
      {variant === "seller-row" ? (
        <button
          id={`seller-trust-badge-${listing.id}`}
          type="button"
          onClick={handleBadgeClick}
          aria-label={`Seller Trust Score: ${rep.trustScore} out of 100 (${rep.tierLabel})`}
          title={`Click to view ${listing.sellerName}'s verified Trust Score breakdown (${rep.trustScore}/100)`}
          className={`group/badge relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold border transition-all duration-200 cursor-pointer select-none ${
            rep.tier === "Elite"
              ? isDark
                ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/25 hover:border-emerald-500/50"
                : "bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
              : rep.tier === "Trusted"
              ? isDark
                ? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25 hover:border-indigo-500/50"
                : "bg-indigo-50 text-indigo-700 border-indigo-300 hover:bg-indigo-100"
              : rep.tier === "Good Standing"
              ? isDark
                ? "bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25 hover:border-sky-500/50"
                : "bg-sky-50 text-sky-700 border-sky-300 hover:bg-sky-100"
              : isDark
              ? "bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25 hover:border-amber-500/50"
              : "bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100"
          }`}
        >
          {getTierIcon()}
          <span className="font-extrabold">{rep.trustScore}</span>
          <span className="opacity-80 text-[9px] font-medium hidden sm:inline">Trust</span>
        </button>
      ) : variant === "compact" ? (
        <button
          id={`seller-trust-badge-compact-${listing.id}`}
          type="button"
          onClick={handleBadgeClick}
          aria-label={`Trust Score: ${rep.trustScore}/100`}
          title={`Trust Score: ${rep.trustScore}/100 • ${rep.tierLabel}`}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-transform hover:scale-105 select-none cursor-pointer ${
            rep.tier === "Elite"
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-400/40"
              : rep.tier === "Trusted"
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-400/40"
              : rep.tier === "Good Standing"
              ? "bg-sky-500/20 text-sky-300 border-sky-400/40"
              : "bg-amber-500/20 text-amber-300 border-amber-400/40"
          }`}
        >
          {getTierIcon()}
          <span>{rep.trustScore}% Trust</span>
        </button>
      ) : (
        /* Default "badge" variant: Prominent pill */
        <button
          id={`seller-trust-badge-default-${listing.id}`}
          type="button"
          onClick={handleBadgeClick}
          aria-label={`Seller Trust Score: ${rep.trustScore} out of 100 (${rep.tierLabel})`}
          title={`Click to view ${listing.sellerName}'s Trust Score breakdown`}
          className={`group/trust relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border backdrop-blur-md transition-all duration-200 cursor-pointer select-none shadow-xs hover:scale-[1.02] ${
            rep.tier === "Elite"
              ? isDark
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/30"
                : "bg-emerald-50 text-emerald-800 border-emerald-300 hover:border-emerald-400"
              : rep.tier === "Trusted"
              ? isDark
                ? "bg-indigo-950/60 text-indigo-300 border-indigo-500/40 hover:border-indigo-400 shadow-indigo-950/30"
                : "bg-indigo-50 text-indigo-800 border-indigo-300 hover:border-indigo-400"
              : rep.tier === "Good Standing"
              ? isDark
                ? "bg-sky-950/60 text-sky-300 border-sky-500/40 hover:border-sky-400 shadow-sky-950/30"
                : "bg-sky-50 text-sky-800 border-sky-300 hover:border-sky-400"
              : isDark
              ? "bg-amber-950/60 text-amber-300 border-amber-500/40 hover:border-amber-400 shadow-amber-950/30"
              : "bg-amber-50 text-amber-800 border-amber-300 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center gap-1">
            {getTierIcon()}
            <span className="font-extrabold">{rep.trustScore}</span>
            <span className="text-[10px] font-medium opacity-85">/100</span>
          </div>
          <span className="h-2.5 w-[1px] bg-current opacity-30" />
          <span className="text-[11px] font-semibold truncate max-w-[85px] sm:max-w-[105px]">
            {rep.tierLabel}
          </span>
          <Info className="w-3 h-3 opacity-60 group-hover/trust:opacity-100 transition-opacity ml-0.5" />
        </button>
      )}

      {/* Interactive Trust Score Details Popover */}
      {isOpen && (
        <div
          id={`trust-score-popover-${listing.id}`}
          className={`absolute right-0 bottom-full mb-2 w-76 sm:w-80 rounded-2xl p-4 shadow-2xl border backdrop-blur-2xl z-50 text-left transition-all animate-in fade-in zoom-in-95 duration-150 ${
            isDark
              ? "bg-slate-900/95 border-slate-700 text-slate-100 shadow-black/60"
              : "bg-white border-slate-200 text-slate-900 shadow-xl"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between pb-3 border-b border-slate-700/50 dark:border-slate-700/50">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Seller Reputation & Trust Score</span>
              </div>
              <h4 className="text-sm font-extrabold mt-0.5 flex items-center gap-1.5 text-slate-900 dark:text-white">
                <span>{listing.sellerName}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                    rep.tier === "Elite"
                      ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                      : rep.tier === "Trusted"
                      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/40"
                      : rep.tier === "Good Standing"
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/40"
                      : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                  }`}
                >
                  {rep.tierLabel}
                </span>
              </h4>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
              aria-label="Close Trust Score details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main Score Display */}
          <div className="py-3 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-medium text-slate-400">Calculated Score</div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  {rep.trustScore}
                </span>
                <span className="text-xs font-bold text-slate-400">/ 100</span>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">Reliability Grade</span>
              <span
                className={`text-xs font-bold ${
                  rep.trustScore >= 90
                    ? "text-emerald-500 dark:text-emerald-400"
                    : rep.trustScore >= 80
                    ? "text-indigo-500 dark:text-indigo-400"
                    : rep.trustScore >= 70
                    ? "text-sky-500 dark:text-sky-400"
                    : "text-amber-500 dark:text-amber-400"
                }`}
              >
                {rep.trustScore >= 90
                  ? "A+ Elite"
                  : rep.trustScore >= 80
                  ? "A Reliable"
                  : rep.trustScore >= 70
                  ? "B+ Good"
                  : "New Member"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mb-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                rep.trustScore >= 90
                  ? "bg-emerald-500"
                  : rep.trustScore >= 80
                  ? "bg-indigo-500"
                  : rep.trustScore >= 70
                  ? "bg-sky-500"
                  : "bg-amber-500"
              }`}
              style={{ width: `${rep.trustScore}%` }}
            />
          </div>

          {/* Breakdown Items */}
          <div className="space-y-2.5 pt-1 text-xs">
            {/* 1. Completed Handovers */}
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <Users className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Completed Handovers</span>
                </div>
                <span className="font-extrabold text-indigo-500 dark:text-indigo-300">
                  +{rep.scoreBreakdown.handoverScore} / {rep.scoreBreakdown.handoverMax} pts
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                <span>
                  {rep.completedHandovers} verified physical campus {rep.completedHandovers === 1 ? "meetup" : "meetups"}
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">
                  {rep.completedHandovers > 0 ? "✓ Track Record" : "Awaiting 1st"}
                </span>
              </div>
            </div>

            {/* 2. Review Ratings */}
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>Student Peer Ratings</span>
                </div>
                <span className="font-extrabold text-amber-500 dark:text-amber-300">
                  +{rep.scoreBreakdown.reviewScore} / {rep.scoreBreakdown.reviewMax} pts
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex items-center justify-between">
                <span>
                  {rep.totalReviews > 0
                    ? `${rep.averageRating.toFixed(1)} ★ (${rep.totalReviews} ${
                        rep.totalReviews === 1 ? "review" : "reviews"
                      })`
                    : "No reviews yet (base student credit)"}
                </span>
                {onViewReviews && rep.totalReviews > 0 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsOpen(false);
                      onViewReviews(listing);
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline"
                  >
                    View reviews
                  </button>
                )}
              </div>
            </div>

            {/* 3. College Verification */}
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-400" />
                  <span>Institutional Domain Verified</span>
                </div>
                <span className="font-extrabold text-blue-500 dark:text-blue-300">
                  +{rep.scoreBreakdown.verificationScore} / {rep.scoreBreakdown.verificationMax} pts
                </span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Official @pvgcoet.ac.in authenticated student
              </div>
            </div>
          </div>

          {/* Footer explanation */}
          <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
            <span>Dynamic score updates with every completed handover.</span>
            <span className="text-indigo-400 font-semibold">Campus Trusted</span>
          </div>
        </div>
      )}
    </div>
  );
};
