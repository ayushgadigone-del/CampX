import React, { useRef, useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
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
  arrowPosition?: "header" | "inline";
  showProgress?: boolean;
  showDots?: boolean;
  showMobileHint?: boolean;
  scrollStep?: number;
  itemSnap?: boolean;
  hideFadeScrim?: boolean;
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
  arrowPosition = "header",
  showProgress = true,
  showDots = false,
  showMobileHint = true,
  scrollStep = 300,
  itemSnap = false,
  hideFadeScrim = false,
  ariaLabel = "Horizontal scrollable section",
}) => {
  const { isDark } = useTheme();
  const trackRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeftState] = useState(0);

  // Measure horizontal scroll state safely without causing vertical layout thrash
  const updateScrollState = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;

    const maxScroll = el.scrollWidth - el.clientWidth;
    const currentScroll = el.scrollLeft;

    const nextLeft = currentScroll > 8;
    const nextRight = maxScroll > 10 && currentScroll < maxScroll - 8;
    const nextPct =
      maxScroll > 0
        ? Math.min(100, Math.max(0, Math.round((currentScroll / maxScroll) * 100)))
        : 100;
    const approxPageWidth = Math.max(1, el.clientWidth * 0.8);
    const nextPages =
      maxScroll > 10 ? Math.max(1, Math.ceil(el.scrollWidth / Math.max(1, el.clientWidth))) : 1;
    const nextActive =
      maxScroll > 10
        ? Math.min(nextPages - 1, Math.max(0, Math.round(currentScroll / approxPageWidth)))
        : 0;

    setCanScrollLeft((prev) => (prev === nextLeft ? prev : nextLeft));
    setCanScrollRight((prev) => (prev === nextRight ? prev : nextRight));
    setScrollProgress((prev) => (prev === nextPct ? prev : nextPct));
    setTotalPages((prev) => (prev === nextPages ? prev : nextPages));
    setCurrentPage((prev) => (prev === nextActive ? prev : nextActive));
  }, []);

  // Listen only to explicit track scroll and debounced window resize (no ResizeObserver feedback loop)
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    updateScrollState();

    let resizeTimer: number | null = null;
    const handleResize = () => {
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
      resizeTimer = window.setTimeout(() => {
        resizeTimer = null;
        updateScrollState();
      }, 180);
    };

    el.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", handleResize);
      if (resizeTimer !== null) {
        window.clearTimeout(resizeTimer);
      }
    };
  }, [updateScrollState]);

  // Instant static scroll left
  const handleScrollLeft = () => {
    if (!trackRef.current) return;
    const distance = scrollStep || trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollLeft -= distance;
    updateScrollState();
  };

  // Instant static scroll right
  const handleScrollRight = () => {
    if (!trackRef.current) return;
    const distance = scrollStep || trackRef.current.clientWidth * 0.75;
    trackRef.current.scrollLeft += distance;
    updateScrollState();
  };

  // Jump directly to specific page
  const scrollToPage = (pageIndex: number) => {
    if (!trackRef.current) return;
    const targetScroll = pageIndex * (trackRef.current.clientWidth * 0.85);
    trackRef.current.scrollLeft = targetScroll;
    updateScrollState();
  };

  // Mouse drag support for desktop/trackpad
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!trackRef.current) return;
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
    const walk = (x - startX) * 1.5;
    trackRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  return (
    <div id={id} className={`relative w-full ${className}`} aria-label={ariaLabel}>
      {/* Optional Slider Header with Title, Badge, Mobile Slide Hint & Controls */}
      {(title || headerActions || (showArrows && arrowPosition === "header")) && (
        <div className="flex items-center justify-between gap-2.5 mb-2.5 px-0.5">
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
                  {badge && <div className="shrink-0">{badge}</div>}
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

            {/* Static Mobile swipe hint text (never dynamically mounts/unmounts) */}
            {showMobileHint && (
              <span
                className={`sm:hidden inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  isDark
                    ? "bg-slate-900 text-indigo-300 border-indigo-500/30"
                    : "bg-indigo-50 text-indigo-700 border-indigo-200"
                }`}
              >
                <span>Swipe / Slide</span>
                <ArrowRight className="w-2.5 h-2.5 text-indigo-500" />
              </span>
            )}

            {/* Previous & Next Slider Buttons (header mode) */}
            {showArrows && arrowPosition === "header" && (
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleScrollLeft}
                  disabled={!canScrollLeft}
                  aria-label="Slide left"
                  title="Slide left"
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer border select-none ${
                    canScrollLeft
                      ? isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs"
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
                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center cursor-pointer border select-none ${
                    canScrollRight
                      ? isDark
                        ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm"
                        : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs"
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

      {/* Main Track Container with Inline Arrows option */}
      {arrowPosition === "inline" ? (
        <div className="flex items-center gap-1 sm:gap-1.5 w-full">
          {showArrows && (
            <button
              type="button"
              onClick={handleScrollLeft}
              disabled={!canScrollLeft}
              aria-label="Slide left"
              title="Slide left"
              className={`w-6 sm:w-7 h-8 rounded-lg flex items-center justify-center cursor-pointer border select-none shrink-0 ${
                canScrollLeft
                  ? isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs"
                  : isDark
                  ? "bg-slate-900/30 text-slate-700 border-slate-800/40 cursor-not-allowed opacity-30"
                  : "bg-slate-100/40 text-slate-300 border-slate-200/50 cursor-not-allowed opacity-30"
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Slider Viewport Container */}
          <div className="relative flex-1 min-w-0">
            {!hideFadeScrim && canScrollLeft && (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute left-0 top-0 bottom-0 w-4 z-10 bg-gradient-to-r ${
                  isDark ? "from-[#090D16] to-transparent" : "from-white to-transparent"
                }`}
              />
            )}
            {!hideFadeScrim && canScrollRight && (
              <div
                aria-hidden="true"
                className={`pointer-events-none absolute right-0 top-0 bottom-0 w-4 z-10 bg-gradient-to-l ${
                  isDark ? "from-[#090D16] to-transparent" : "from-white to-transparent"
                }`}
              />
            )}

            <div
              ref={trackRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUpOrLeave}
              onMouseLeave={handleMouseUpOrLeave}
              className={`flex items-center gap-2 overflow-x-auto overflow-y-hidden no-scrollbar py-1 px-0.5 overscroll-x-contain select-none cursor-grab active:cursor-grabbing ${
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

          {showArrows && (
            <button
              type="button"
              onClick={handleScrollRight}
              disabled={!canScrollRight}
              aria-label="Slide right"
              title="Slide right"
              className={`w-6 sm:w-7 h-8 rounded-lg flex items-center justify-center cursor-pointer border select-none shrink-0 ${
                canScrollRight
                  ? isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-white border-slate-700 shadow-sm"
                    : "bg-white hover:bg-slate-100 text-slate-800 border-slate-300 shadow-2xs"
                  : isDark
                  ? "bg-slate-900/30 text-slate-700 border-slate-800/40 cursor-not-allowed opacity-30"
                  : "bg-slate-100/40 text-slate-300 border-slate-200/50 cursor-not-allowed opacity-30"
              }`}
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      ) : (
        <div className="relative w-full">
          {!hideFadeScrim && canScrollLeft && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r ${
                isDark ? "from-[#0B0F19] to-transparent" : "from-white to-transparent"
              }`}
            />
          )}
          {!hideFadeScrim && canScrollRight && (
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l ${
                isDark ? "from-[#0B0F19] to-transparent" : "from-white to-transparent"
              }`}
            />
          )}

          <div
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUpOrLeave}
            onMouseLeave={handleMouseUpOrLeave}
            className={`flex items-center gap-3 overflow-x-auto overflow-y-hidden no-scrollbar py-1 px-0.5 overscroll-x-contain select-none cursor-grab active:cursor-grabbing ${
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
      )}

      {/* Constant-height Slide Pagination Dots (never toggles vertical layout height) */}
      {showDots && (
        <div className="mt-1.5 h-3 flex items-center justify-center gap-1.5 py-0.5">
          {totalPages > 1 &&
            Array.from({ length: totalPages }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => scrollToPage(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                className={`h-1.5 rounded-full cursor-pointer ${
                  currentPage === idx
                    ? "w-4 bg-gradient-to-r from-indigo-500 to-purple-500"
                    : isDark
                    ? "w-1.5 bg-slate-700 hover:bg-slate-600"
                    : "w-1.5 bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
        </div>
      )}

      {/* Constant-height Progress Track (always rendered when showProgress=true to prevent scrollbar-height feedback flicker) */}
      {showProgress && (
        <div className="mt-2 h-4 flex items-center justify-between gap-3 px-1">
          <div
            className={`flex-1 h-1.5 rounded-full overflow-hidden ${
              isDark ? "bg-slate-800" : "bg-slate-200"
            }`}
          >
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
              style={{
                width: `${Math.max(12, scrollProgress)}%`,
              }}
            />
          </div>

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
