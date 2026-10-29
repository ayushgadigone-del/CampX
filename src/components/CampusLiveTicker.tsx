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
  const [isPaused, setIsPaused] = useState(false);
  const [isRushMode, setIsRushMode] = useState(true);

  // Auto cycle ticker events every 4.5s if not paused
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TICKER_EVENTS.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [isPaused]);

  const currentEvent = TICKER_EVENTS[currentIndex];

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
      className={`relative w-full border-y transition-colors select-none text-xs ${
        isDark
          ? "bg-[#0A0E17]/95 border-slate-800/80 text-slate-200"
          : "bg-white/95 border-slate-200 text-slate-800 shadow-2xs"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        {/* Left Beacon Badge */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-[11px]">
            <span className="relative flex h-2 w-2">
              <span className="inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>CAMPUS BEACON</span>
          </div>

          <button
            type="button"
            onClick={() => setIsRushMode((prev) => !prev)}
            title="Toggle Semester Rush Mode"
            className={`hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider transition-colors cursor-pointer ${
              isRushMode
                ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                : "bg-slate-200 dark:bg-slate-800 text-slate-500"
            }`}
          >
            <Flame className="w-3 h-3 text-amber-500" />
            <span>Rush Mode: Active</span>
          </button>
        </div>

        {/* Center Live Event Stream with Smooth Motion Fade */}
        <div
          onClick={handleTickerClick}
          className="flex-1 min-w-0 cursor-pointer overflow-hidden flex items-center gap-2"
          title="Click to explore this campus drop"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentEvent.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="flex items-center gap-2 truncate"
            >
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] tracking-wide shrink-0 ${getBadgeStyle(
                  currentEvent.type
                )}`}
              >
                {currentEvent.badge}
              </span>

              <span className="text-xs font-semibold truncate hover:underline">
                {currentEvent.message}
              </span>

              <span className="text-[10px] text-slate-400 font-mono shrink-0 hidden sm:inline">
                • {currentEvent.timestamp}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Quick Controls */}
        <div className="flex items-center gap-2 shrink-0 text-xs">
          {/* Dots Pager Indicator */}
          <div className="flex items-center gap-1">
            {TICKER_EVENTS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-1.5 h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === idx
                    ? "w-4 bg-indigo-500"
                    : "bg-slate-300 dark:bg-slate-700"
                }`}
                title={`Event ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
