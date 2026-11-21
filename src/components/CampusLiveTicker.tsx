import React, { useState } from "react";
import { Flame, ChevronLeft, ChevronRight } from "lucide-react";
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
    message:
      "28 peer handovers coordinated across campus today with 100% verified student safety",
    timestamp: "Live",
    queryFilter: "",
  },
  {
    id: "t-2",
    type: "hot",
    badge: "HOT DROP",
    message:
      "Casio fx-991CW Scientific Calculator (Like New) listed for ₹850 at Library Quad",
    timestamp: "3m ago",
    queryFilter: "Calculator",
  },
  {
    id: "t-3",
    type: "listing",
    badge: "NEW LISTING",
    message:
      "Fluid Mechanics by Modi & Seth (SPPU 3rd Sem) just added by 3rd Year Mechanical",
    timestamp: "7m ago",
    queryFilter: "Fluid Mechanics",
  },
  {
    id: "t-4",
    type: "handover",
    badge: "HANDOVER DONE",
    message:
      "Engineering Mini Drafter + Board Clips verified & exchanged at Workshop Practice Shed",
    timestamp: "12m ago",
    queryFilter: "Drafter",
  },
  {
    id: "t-5",
    type: "hot",
    badge: "TOP SEARCH",
    message:
      "16 students currently browsing Topper Handwritten Notes for SPPU In-Sem Exams",
    timestamp: "Trending",
    queryFilter: "Notes",
  },
  {
    id: "t-6",
    type: "listing",
    badge: "BARTER ALERT",
    message:
      "Arduino Uno Sensor Kit available for swap with Casio CW Calculator or ED Board",
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
  const [isRushMode, setIsRushMode] = useState(true);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const currentEvent = TICKER_EVENTS[currentIndex];

  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setCurrentIndex(
      (prev) => (prev - 1 + TICKER_EVENTS.length) % TICKER_EVENTS.length
    );
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
      case "hot":
        return isDark
          ? "bg-[#251F15] text-[#DFC29B] border border-[#4A3B23] font-semibold"
          : "bg-[#FDF6EC] text-[#9E6B43] border border-[#EED8B8] font-semibold";
      default:
        return isDark
          ? "bg-[#182823] text-[#7BBFA8] border border-[#2A4A40] font-semibold"
          : "bg-[#EFF4F1] text-[#2F5D50] border border-[#C4D9D1] font-semibold";
    }
  };

  return (
    <div
      id="campus-live-ticker-bar"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative w-full select-none text-xs ${
        isDark
          ? "bg-[#141A18] text-[#ECF2EF]"
          : "bg-white text-[#18201C]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Left Beacon Label */}
        <div className="flex items-center gap-2 shrink-0">
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold text-[10px] sm:text-[11px] whitespace-nowrap border ${
              isDark
                ? "bg-[#182823] border-[#2A4A40] text-[#7BBFA8]"
                : "bg-[#EFF4F1] border-[#C4D9D1] text-[#2F5D50]"
            }`}
          >
            <span
              className={`inline-flex rounded-full h-1.5 w-1.5 ${
                isDark ? "bg-[#5BA18C]" : "bg-[#2F5D50]"
              }`}
            />
            <span className="hidden xs:inline">CAMPUS </span>
            <span>BEACON</span>
          </div>

          <button
            type="button"
            onClick={() => setIsRushMode((prev) => !prev)}
            title="Toggle Semester Rush Mode"
            className={`hidden md:inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider cursor-pointer border ${
              isRushMode
                ? isDark
                  ? "bg-[#251F15] text-[#DFC29B] border-[#4A3B23]"
                  : "bg-[#FDF6EC] text-[#9E6B43] border-[#EED8B8]"
                : isDark
                ? "bg-[#1B2320] text-[#8FA199] border-[#242E2A]"
                : "bg-[#F3F5F2] text-[#5C6B63] border-[#DFE6E2]"
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Rush: {isRushMode ? "Active" : "Standard"}</span>
          </button>
        </div>

        {/* Center Static Event Display */}
        <div
          onClick={handleTickerClick}
          className="flex-1 min-w-0 cursor-pointer overflow-hidden flex items-center gap-2"
          title="Click to explore this campus drop (or use arrows)"
        >
          <div className="flex items-center gap-2 min-w-0 w-full">
            <span
              className={`px-2 py-0.5 rounded-md text-[9px] sm:text-[10px] tracking-wide shrink-0 ${getBadgeStyle(
                currentEvent.type
              )}`}
            >
              {currentEvent.badge}
            </span>

            <span
              className={`text-[11px] sm:text-xs font-medium truncate hover:underline ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              {currentEvent.message}
            </span>

            <span
              className={`text-[10px] font-mono shrink-0 hidden lg:inline ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              · {currentEvent.timestamp}
            </span>
          </div>
        </div>

        {/* Right Manual Controls */}
        <div className="flex items-center gap-1 shrink-0 text-xs">
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous campus drop"
            title="Previous drop"
            className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
              isDark
                ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="hidden xs:flex items-center gap-1">
            {TICKER_EVENTS.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full cursor-pointer ${
                  currentIndex === idx
                    ? isDark
                      ? "w-4 bg-[#5BA18C]"
                      : "w-4 bg-[#2F5D50]"
                    : isDark
                    ? "w-1.5 bg-[#242E2A]"
                    : "w-1.5 bg-[#C4D1CA]"
                }`}
                title={`Drop ${idx + 1}`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next campus drop"
            title="Next drop"
            className={`w-6 h-6 rounded-md flex items-center justify-center cursor-pointer ${
              isDark
                ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
