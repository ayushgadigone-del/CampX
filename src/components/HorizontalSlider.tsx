import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal, ArrowRight } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface HorizontalSliderProps {
  children: React.ReactNode;
  id?: string;
  title?: string;
  subtitle?: string;
  badge?: React.ReactNode;
  icon?: React.ElementType;
  className?: string;
  trackClassName?: string;
  headerActions?: React.ReactNode;
  showArrows?: boolean;
  showProgress?: boolean;
  showMobileHint?: boolean;
  scrollStep?: number;
  itemSnap?: boolean;
  ariaLabel?: string;
}

export const HorizontalSlider: React.FC<HorizontalSliderProps> = ({
  children,
  id,
  title,
  subtitle,
  badge,
  icon: Icon,
  className = "",
  trackClassName = "",
  headerActions,
  showArrows = true,
  showProgress = true,
  showMobileHint = true,
  scrollStep = 300,
  itemSnap = false,
  ariaLabel = "Horizontal scrollable section",
}) => {
  const { isDark } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeftState] = useState(0);

  // Check scroll position and calculate progress percentage
  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const currentScroll = el.scrollLeft;

    setCanScrollLeft(currentScroll > 4);
    setCanScrollRight(maxScroll > 4 && currentScroll < maxScroll - 4);

    if (maxScroll > 0) {
      const pct = Math.min(100, Math.max(0, (currentScroll / maxScroll) * 100));
      setScrollProgress(pct);
    } else {
      setScrollProgress(0);
    }
  }, []);

  // Set up listeners for resize and scroll
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollState();

    const handleScroll = () => {
      updateScrollState();
    };

    el.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateScrollState);

    // Initial check after short delay to allow children rendering
    const timer = setTimeout(updateScrollState, 150);

    return () => {
      el.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateScrollState);
      clearTimeout(timer);
    };
  }, [children, updateScrollState]);

  // Smooth scroll left
  const handleScrollLeft = () => {
    if (!trackRef.current) return;
    const distance = scrollStep || trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({
      left: -distance,
      behavior: "smooth",
    });
  };

  // Smooth scroll right
  const handleScrollRight = () => {
    if (!trackRef.current) return;
    const distance = scrollStep || trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollBy({
      left: distance,
      behavior: "smooth",
    });
  };

  // Mouse drag support for desktop/trackpad preview
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
    // Don't drag if clicking interactive elements (buttons, inputs, links)
    const target = e.target as HTMLElement;
    if (
      target.tagName === "BUTTON" ||
      target.tagName === "A" ||
      target.tagName === "INPUT" ||
      target.tagName === "SELECT" ||
      target.closest("button") ||
      target.closest("a") ||
      target.closest("select")
    ) {
      return;
    }

    setIsDragging(true);
    setStartX(e.pageX - trackRef.current.offsetLeft);
    setScrollLeftState(trackRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    e.preventDefault();
    const x = e.pageX - trackRef.current.offsetLeft;
    const walk = (x - startX) * 1.5; // Drag sensitivity
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div
      id={id}
      className={`relative w-full ${className}`}
      aria-label={ariaLabel}
    >
      {/* Optional Slider Header with Title, Badge, Mobile Slide Hint & Controls */}
      {(title || headerActions || showArrows) && (
        <div className="flex items-center justify-between gap-2.5 mb-2.5 px-0.5">
          {/* Left Title / Badge */}
          {title ? (
            <div className="flex items-center gap-2 min-w-0">
              {Icon && (
                <div
                  className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                    isDark
                      ? "bg-indigo-950/70 text-indigo-400 border border-indigo-800/40"
                      : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
              )}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4
                    className={`text-xs sm:text-sm font-extrabold tracking-tight truncate ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    {title}
                  </h4>
                  {badge && (
                    <div className="shrink-0">{badge}</div>
                  )}
                </div>
                {subtitle && (
                  <p
                    className={`text-[11px] truncate ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Right: Slide Controls & Header Actions */}
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}

            {/* Mobile swipe hint text */}
            {showMobileHint && (canScrollLeft || canScrollRight) && (
              <span
                className={`sm:hidden inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? "bg-slate-900/80 text-indigo-300 border-indigo-500/30"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}
              >
                <span>Swipe / Slide</span>
                <ArrowRight className="w-2.5 h-2.5 text-indigo-500" />
              </span>
            )}

            {/* Previous & Next Slider Buttons */}
            {showArrows && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  disabled={!canScrollLeft}
                  aria-label="Slide left"
                  title="Slide left"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border select-none ${
                    canScrollLeft
                      ? isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm active:scale-95"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs active:scale-95"
                      : isDark
                      ? "bg-slate-900/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50"
                      : "bg-slate-100/60 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleScrollRight}
                  disabled={!canScrollRight}
                  aria-label="Slide right"
                  title="Slide right"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center transition-all cursor-pointer border select-none ${
                    canScrollRight
                      ? isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm active:scale-95"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs active:scale-95"
                      : isDark
                      ? "bg-slate-900/40 text-slate-600 border-slate-800/60 cursor-not-allowed opacity-50"
                      : "bg-slate-100/60 text-slate-400 border-slate-200 cursor-not-allowed opacity-50"
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slider Viewport Container */}
      <div className="relative group/slider w-full">
        {/* Subtle Edge Fade Scrims (Left & Right) */}
        {canScrollLeft && (
          <div
            className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r transition-opacity duration-200 ${
              isDark
                ? "from-[#0B0F19] to-transparent"
                : "from-white to-transparent"
            }`}
          />
        )}
        {canScrollRight && (
          <div
            className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l transition-opacity duration-200 ${
              isDark
                ? "from-[#0B0F19] to-transparent"
                : "from-white to-transparent"
            }`}
          />
        )}

        {/* Scrollable Track */}
        <div
          ref={trackRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          className={`flex items-center gap-3 overflow-x-auto overflow-y-hidden no-scrollbar py-1 px-0.5 scroll-smooth overscroll-x-contain select-none cursor-grab active:cursor-grabbing ${
            itemSnap ? "snap-x snap-mandatory" : ""
          } ${trackClassName}`}
          style={{
            WebkitOverflowScrolling: "touch",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {children}
        </div>
      </div>

      {/* Progress Track & Mobile Swipe Affordance */}
      {showProgress && (canScrollLeft || canScrollRight) && (
        <div className="mt-2 flex items-center justify-between gap-3 px-1">
          {/* Subtle Progress Bar */}
          <div
            className={`flex-1 h-1.5 rounded-full overflow-hidden ${
              isDark ? "bg-slate-800" : "bg-slate-200"
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-150 rounded-full"
              style={{
                width: `${Math.max(12, scrollProgress)}%`,
              }}
            />
          </div>

          {/* Quick Slider Indicator Label */}
          <span
            className={`text-[10px] font-mono font-semibold shrink-0 ${
              isDark ? "text-slate-500" : "text-slate-400"
            }`}
          >
            {Math.round(scrollProgress)}% slid
          </span>
        </div>
      )}
    </div>
  );
};
