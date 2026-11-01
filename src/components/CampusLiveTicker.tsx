import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Flame,
  Zap,
  Radio,
  Sparkles,
  BookOpen,
  TrendingUp,
  ShieldCheck,
  Tag,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface CampusTickerItem {
  id: string;
  type: "listing" | "handover" | "hot" | "exam_rush";
  badge: string;
  message: string;
  timestamp: string;
  queryFilter?: string;
}

const TICKER_EVENTS: CampusTickerItem[] = [
  {
    id: "t-1",
    type: "exam_rush",
    badge: "SEMESTER RUSH",
    message: "28 peer handovers coordinated across campus today with 100% verified student safety",
    timestamp: "Live",
    queryFilter: "",
  },
  {
    id: "t-2",
    type: "hot",
    badge: "HOT DROP",
    message: "Casio fx-991CW Scientific Calculator (Like New) listed for ₹850 at Library Quad",
    timestamp: "3m ago",
    queryFilter: "Calculator",
  },
  {
    id: "t-3",
    type: "listing",
    badge: "NEW LISTING",
    message: "Fluid Mechanics by Modi & Seth (SPPU 3rd Sem) just added by 3rd Year Mechanical",
    timestamp: "7m ago",
    queryFilter: "Fluid Mechanics",
  },
  {
    id: "t-4",
    type: "handover",
    badge: "HANDOVER DONE",
    message: "Engineering Mini Drafter + Board Clips verified & exchanged at Workshop Practice Shed",
    timestamp: "12m ago",
    queryFilter: "Drafter",
  },
  {
    id: "t-5",
    type: "hot",
    badge: "TOP SEARCH",
    message: "16 students currently browsing Topper Handwritten Notes for SPPU In-Sem Exams",
    timestamp: "Trending",
    queryFilter: "Notes",
  },
  {
    id: "t-6",
    type: "listing",
    badge: "BARTER ALERT",
    message: "Arduino Uno Sensor Kit available for swap with Casio CW Calculator or ED Board",
    timestamp: "18m ago",
    queryFilter: "Arduino",
  },
];

interface CampusLiveTickerProps {
  onSelectItem?: (query: string) => void;
}

export const CampusLiveTicker: React.FC<CampusLiveTickerProps> = ({
  onSelectItem,
}) => {
  const { isDark } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  // Default to static display to prevent constant blinking/flashing
  const [isPaused, setIsPaused] = useState(true);
  const [isRushMode, setIsRushMode] = useState(true);

  // Auto cycle ticker events only when user explicitly enables playback
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TICKER_EVENTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const currentEvent = TICKER_EVENTS[currentIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + TICKER_EVENTS.length) % TICKER_EVENTS.length);
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % TICKER_EVENTS.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 35) {
      handleNext();
    } else if (diff < -35) {
      handlePrev();
    }
    setTouchStartX(null);
  };

  const handleTickerClick = () => {
    if (currentEvent.queryFilter && onSelectItem) {
      onSelectItem(currentEvent.queryFilter);
    }
  };

  const getBadgeStyle = (type: CampusTickerItem["type"]) => {
    switch (type) {
      case "exam_rush":
        return "bg-rose-500 text-white shadow-xs font-black";
      case "hot":
        return "bg-amber-500 text-slate-950 font-black";
      case "handover":
        return "bg-emerald-500 text-white font-black";
      default:
        return "bg-indigo-600 text-white font-black";
    }
  };

  return (
    <div
      id="campus-live-ticker-bar"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full border-y transition-colors select-none text-xs ${
        isDark
          ? "bg-[#0A0E17]/95 border-slate-800/80 text-slate-200"
          : "bg-white/95 border-slate-200 text-black shadow-2xs"
      }`}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5 sm:gap-3 w-full">
        {/* Left Beacon Badge */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] sm:text-[11px] whitespace-nowrap">
            <span className="relative flex h-2 w-2">
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="hidden xs:inline">CAMPUS </span>
            <span>BEACON</span>
          </div>

          <button
            type="button"
            onClick={() => setIsRushMode((prev) => !prev)}
            title="Toggle Semester Rush Mode"
            className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
              isRushMode
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "bg-slate-200 dark:bg-slate-800 text-black dark:text-slate-200"
            }`}
          >
            <Flame className="w-3 h-3 text-amber-500" />
            <span>Rush Mode: Active</span>
          </button>
        </div>

        {/* Center Live Event Stream with Non-Blinking Steady Motion */}
        <div
          onClick={handleTickerClick}
          className="flex-1 min-w-0 cursor-pointer overflow-hidden flex items-center gap-1.5 sm:gap-2"
          title="Click to explore this campus drop (or swipe left/right)"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvent.id}
              initial={{ x: 6 }}
              animate={{ x: 0 }}
              exit={{ x: -6 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              className="flex items-center gap-1.5 sm:gap-2 min-w-0 w-full"
            >
              <span
                className={`px-1.5 sm:px-2 py-0.2 sm:py-0.5 rounded-full text-[9px] sm:text-[10px] tracking-wide shrink-0 ${getBadgeStyle(
                  currentEvent.type
                )}`}
              >
                {currentEvent.badge}
              </span>

              <span className="text-[11px] sm:text-xs font-bold truncate hover:underline text-black dark:text-white">
                {currentEvent.message}
              </span>

              <span className="text-[10px] text-black/80 dark:text-slate-300 font-mono shrink-0 hidden lg:inline">
                • {currentEvent.timestamp}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Slider Controls (Arrows, Play/Pause & Pager Dots) */}
        <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0 text-xs">
          {/* Pause / Play Auto-Cycle Toggle */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused((prev) => !prev);
            }}
            aria-label={isPaused ? "Play auto-cycle" : "Pause auto-cycle"}
            title={isPaused ? "Play live drops (auto-cycle)" : "Pause live drops (steady mode)"}
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "text-slate-300 hover:text-white hover:bg-slate-800"
                : "text-black hover:text-black hover:bg-slate-200/80"
            }`}
          >
            {isPaused ? (
              <Play className="w-3 h-3 fill-current" />
            ) : (
              <Pause className="w-3 h-3 fill-current" />
            )}
          </button>

          {/* Previous Event Button */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous campus drop"
            title="Previous drop"
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "text-slate-300 hover:text-white hover:bg-slate-800"
                : "text-black hover:text-black hover:bg-slate-200/80"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Dots Pager Indicator (visible on xs+ screens) */}
          <div className="hidden xs:flex items-center gap-1">
            {TICKER_EVENTS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? "w-3 sm:w-4 bg-indigo-600"
                    : "bg-black/30 dark:bg-slate-700"
                }`}
                title={`Drop ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next Event Button */}
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next campus drop"
            title="Next drop"
            className={`w-6 h-6 rounded flex items-center justify-center transition-colors cursor-pointer ${
              isDark
                ? "text-slate-300 hover:text-white hover:bg-slate-800"
                : "text-black hover:text-black hover:bg-slate-200/80"
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
