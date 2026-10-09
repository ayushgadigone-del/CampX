import React, { useState } from "react";
import {
  History,
  Clock,
  Trash2,
  X,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  ShieldCheck,
  Eye,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Listing } from "../types";
import { HorizontalSlider } from "./HorizontalSlider";

interface RecentlyViewedSectionProps {
  recentlyViewed: Listing[];
  onOpenDetails: (listing: Listing) => void;
  onClearHistory: () => void;
  onRemoveItem: (listingId: string) => void;
  isDark: boolean;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  recentlyViewed,
  onOpenDetails,
  onClearHistory,
  onRemoveItem,
  isDark,
}) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  // If there are no items and it's empty, we still render a welcoming bar or clean placeholder
  const count = recentlyViewed.length;

  return (
    <div
      id="marketplace-recently-viewed-section"
      className={`mb-6 rounded-2xl border transition-all ${
        isDark
          ? "bg-slate-900/60 border-slate-800/80 shadow-md"
          : "bg-slate-50/80 border-slate-200/90 shadow-2xs"
      }`}
    >
      {/* Section Header */}
      <div className="px-4 py-3 sm:px-5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
              isDark
                ? "bg-indigo-950/70 text-indigo-400 border border-indigo-800/50"
                : "bg-indigo-100 text-indigo-600 border border-indigo-200"
            }`}
          >
            <History className="w-4 h-4" />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <h3
              className={`text-sm font-bold tracking-tight ${
                isDark ? "text-white" : "text-slate-900"
              }`}
            >
              Recently Viewed
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold border ${
                count > 0
                  ? isDark
                    ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/60"
                    : "bg-indigo-100 text-indigo-800 border-indigo-300/80"
                  : isDark
                  ? "bg-slate-800 text-slate-400 border-slate-700"
                  : "bg-slate-200 text-slate-600 border-slate-300"
              }`}
            >
              {count} of 5 items
            </span>
          </div>

          <span
            className={`hidden md:inline text-xs ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}
          >
            • Quick access to your last 5 clicked listings
          </span>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2">
          {count > 0 && (
            <button
              type="button"
              onClick={onClearHistory}
              title="Clear recently viewed history"
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                isDark
                  ? "hover:bg-slate-800 text-slate-400 hover:text-rose-400"
                  : "hover:bg-slate-200 text-slate-500 hover:text-rose-600"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear History</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCollapsed((prev) => !prev)}
            title={isCollapsed ? "Expand Recently Viewed" : "Collapse Recently Viewed"}
            aria-label={isCollapsed ? "Expand Recently Viewed" : "Collapse Recently Viewed"}
            className={`p-1 rounded-lg text-xs transition-colors cursor-pointer ${
              isDark
                ? "hover:bg-slate-800 text-slate-400"
                : "hover:bg-slate-200 text-slate-500"
            }`}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Collapsible Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 sm:px-5">
              {count === 0 ? (
                /* Empty State */
                <div
                  className={`p-4 rounded-xl border border-dashed flex items-center gap-3 text-xs ${
                    isDark
                      ? "border-slate-800 bg-slate-950/40 text-slate-400"
                      : "border-slate-200 bg-white/70 text-slate-500"
                  }`}
                >
                  <Eye className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span>
                    No recently viewed listings yet. Click on any listing below to inspect it, and it will be saved here for rapid access (tracking up to 5 items).
                  </span>
                </div>
              ) : (
                /* 1 to 5 Items Horizontal Slider (Smooth mobile swiping and desktop sliding) */
                <HorizontalSlider
                  id="recently-viewed-slider"
                  showArrows={true}
                  showProgress={true}
                  showMobileHint={true}
                  scrollStep={210}
                  itemSnap={true}
                  ariaLabel="Recently Viewed Listings Slider"
                  trackClassName="gap-3 py-1"
                >
                  <AnimatePresence mode="popLayout">
                    {recentlyViewed.map((item, index) => {
                      const hasAi = Boolean(item.aiInspection);
                      const isSold = item.status === "completed";

                      return (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.85 }}
                          transition={{ duration: 0.2 }}
                          className="group relative w-[185px] sm:w-[210px] md:w-[220px] lg:w-[230px] shrink-0 snap-start"
                        >
                          <div
                            onClick={() => onOpenDetails(item)}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                onOpenDetails(item);
                              }
                            }}
                            className={`w-full text-left rounded-xl border p-2.5 flex flex-col justify-between h-full transition-all cursor-pointer relative overflow-hidden select-none ${
                              isDark
                                ? "bg-slate-950/90 hover:bg-slate-900 border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-950/30"
                                : "bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 hover:shadow-md"
                            }`}
                          >
                            {/* Card Image */}
                            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-slate-800 shrink-0 mb-2">
                              {item.imageUrl ? (
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    // Fallback for broken images
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600";
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-800 text-slate-500">
                                  <Tag className="w-6 h-6 opacity-40" />
                                </div>
                              )}

                              {/* Category Badge */}
                              <span
                                className={`absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-md shadow-xs ${
                                  isDark
                                    ? "bg-slate-900/80 text-slate-200 border border-slate-700/50"
                                    : "bg-white/90 text-slate-800 border border-slate-200/60"
                                }`}
                              >
                                {item.category}
                              </span>

                              {/* AI Score Badge if available */}
                              {hasAi && (
                                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-black px-1.5 py-0.5 rounded-md bg-purple-600/90 text-white backdrop-blur-md shadow-xs flex items-center gap-0.5">
                                  <Sparkles className="w-2.5 h-2.5" />
                                  <span>{item.aiInspection?.inspectionScore}%</span>
                                </span>
                              )}

                              {/* Sold Overlay */}
                              {isSold && (
                                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-rose-300 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-500/40">
                                    Sold
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Title & Price */}
                            <div className="flex-1 flex flex-col justify-between">
                              <div>
                                <h4
                                  className={`text-xs font-bold line-clamp-1 group-hover:text-indigo-500 transition-colors ${
                                    isDark ? "text-slate-100" : "text-slate-800"
                                  }`}
                                  title={item.title}
                                >
                                  {item.title}
                                </h4>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span
                                    className={`text-xs font-black ${
                                      item.price === 0
                                        ? "text-emerald-500"
                                        : isDark
                                        ? "text-emerald-400"
                                        : "text-emerald-600"
                                    }`}
                                  >
                                    {item.price === 0
                                      ? "Free"
                                      : `₹${item.price.toLocaleString("en-IN")}`}
                                  </span>
                                  <span
                                    className={`text-[10px] px-1 rounded font-medium ${
                                      isDark
                                        ? "bg-slate-800 text-slate-400"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {item.condition}
                                  </span>
                                </div>
                              </div>

                              {/* Footer: Seller & Quick Inspect Action */}
                              <div className="mt-2 pt-1.5 border-t border-slate-200/50 dark:border-slate-800/80 flex items-center justify-between text-[10px]">
                                <span
                                  className={`truncate max-w-[85px] ${
                                    isDark ? "text-slate-400" : "text-slate-500"
                                  }`}
                                  title={item.sellerName}
                                >
                                  {item.sellerName || "Campus Peer"}
                                </span>
                                <span className="text-indigo-400 font-bold group-hover:underline flex items-center gap-0.5">
                                  <span>View</span>
                                  <ExternalLink className="w-2.5 h-2.5" />
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Quick Remove Item Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRemoveItem(item.id);
                            }}
                            title={`Remove "${item.title}" from recently viewed`}
                            aria-label={`Remove "${item.title}" from recently viewed`}
                            className={`absolute top-1 right-1 p-1 rounded-full shadow-md transition-all opacity-100 sm:opacity-0 group-hover:opacity-100 z-10 cursor-pointer ${
                              isDark
                                ? "bg-slate-900/90 text-slate-400 hover:text-rose-400 hover:bg-slate-800 border border-slate-700"
                                : "bg-white/95 text-slate-500 hover:text-rose-600 hover:bg-slate-100 border border-slate-200"
                            }`}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </HorizontalSlider>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
