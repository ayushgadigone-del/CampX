import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Maximize2,
  Minimize2,
  MessageCircle,
  MapPin,
  Sparkles,
  BadgeCheck,
  Calendar as CalendarIcon,
  ShieldCheck,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Listing } from "../types";

interface ListingImageLightboxModalProps {
  listing: Listing | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (listing: Listing) => void;
  onOpenDetails?: (listing: Listing) => void;
  onOpenCalendar?: (listing: Listing) => void;
}

export const ListingImageLightboxModal: React.FC<ListingImageLightboxModalProps> = ({
  listing,
  isOpen,
  onClose,
  onOpenChat,
  onOpenDetails,
  onOpenCalendar,
}) => {
  const [scale, setScale] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // Reset transformation whenever a new listing is opened or modal toggles
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setRotation(0);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen, listing?.id]);

  // Keyboard shortcut handlers
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "+" || e.key === "=") {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === "-" || e.key === "_") {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === "0") {
        e.preventDefault();
        handleResetZoom();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        handleRotate();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, scale, rotation]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(Number((prev + 0.5).toFixed(1)), 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(Number((prev - 0.5).toFixed(1)), 1);
      if (next === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return next;
    });
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleDoubleTapOrClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (scale > 1) {
      handleResetZoom();
    } else {
      setScale(2);
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      setScale((prev) => Math.min(Number((prev + 0.25).toFixed(2)), 4));
    } else {
      setScale((prev) => {
        const next = Math.max(Number((prev - 0.25).toFixed(2)), 1);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
    }
  };

  // Dragging support when zoomed in
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    e.preventDefault();
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    e.preventDefault();
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    // Bound movement according to scale factor
    const maxBound = 350 * (scale - 1);
    setPosition({
      x: Math.max(-maxBound, Math.min(maxBound, newX)),
      y: Math.max(-maxBound, Math.min(maxBound, newY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile devices
  const touchStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    if (scale <= 1 || e.touches.length !== 1) return;
    touchStartRef.current = {
      x: e.touches[0].clientX - position.x,
      y: e.touches[0].clientY - position.y,
    };
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || scale <= 1 || e.touches.length !== 1) return;
    const newX = e.touches[0].clientX - touchStartRef.current.x;
    const newY = e.touches[0].clientY - touchStartRef.current.y;
    const maxBound = 350 * (scale - 1);
    setPosition({
      x: Math.max(-maxBound, Math.min(maxBound, newX)),
      y: Math.max(-maxBound, Math.min(maxBound, newY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  if (!isOpen || !listing) return null;

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case "Like New":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/40";
      case "Good":
        return "bg-blue-500/20 text-blue-300 border-blue-500/40";
      case "Fair":
        return "bg-amber-500/20 text-amber-300 border-amber-500/40";
      default:
        return "bg-rose-500/20 text-rose-300 border-rose-500/40";
    }
  };

  return (
    <AnimatePresence>
      <div
        id="listing-image-lightbox"
        role="dialog"
        aria-modal="true"
        aria-label={`Inspect condition of ${listing.title}`}
        className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 backdrop-blur-md text-white select-none overflow-hidden"
        onMouseUp={handleMouseUp}
      >
        {/* Top Header Controls Bar */}
        <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 py-3.5 bg-slate-900/80 border-b border-slate-800/80 backdrop-blur-md">
          {/* Item Meta & Condition Pill */}
          <div className="flex items-center gap-3 max-w-[65%] truncate">
            <span
              className={`px-2.5 py-1 rounded-full text-xs font-bold border backdrop-blur-xs shrink-0 ${getConditionColor(
                listing.condition
              )}`}
            >
              Condition: {listing.condition}
            </span>

            <div className="truncate">
              <h2 className="text-sm sm:text-base font-bold text-slate-100 truncate">
                {listing.title}
              </h2>
              <p className="text-[11px] text-slate-400 truncate flex items-center gap-2">
                <span>{listing.category}</span>
                <span>•</span>
                <span className="flex items-center gap-1.5">
                  <span>Offered by {listing.sellerName}</span>
                  <span
                    className="badge-shimmer-hover relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 overflow-hidden select-none"
                    title="Verified Student Seller"
                  >
                    <span className="animate-shimmer-hover" aria-hidden="true" />
                    <BadgeCheck className="w-2.5 h-2.5 text-blue-400 shrink-0" />
                    <span>Verified</span>
                  </span>
                </span>
                {listing.locationPreference && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 text-slate-300 truncate">
                      <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                      {listing.locationPreference}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Header Action Tools */}
          <div className="flex items-center gap-2">
            {/* Zoom Controls Pill */}
            <div className="hidden sm:flex items-center bg-slate-800/90 rounded-xl p-1 border border-slate-700/80 text-xs">
              <button
                id="lightbox-zoom-out-btn"
                type="button"
                onClick={handleZoomOut}
                disabled={scale <= 1}
                aria-label="Zoom out"
                title="Zoom out (-)"
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                id="lightbox-reset-zoom-btn"
                type="button"
                onClick={handleResetZoom}
                title="Reset zoom (0)"
                className="px-2 py-1 text-[11px] font-mono font-bold text-slate-200 hover:text-indigo-400 transition-colors"
              >
                {Math.round(scale * 100)}%
              </button>
              <button
                id="lightbox-zoom-in-btn"
                type="button"
                onClick={handleZoomIn}
                disabled={scale >= 4}
                aria-label="Zoom in"
                title="Zoom in (+)"
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 disabled:opacity-35 disabled:hover:bg-transparent transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-slate-700 mx-1" />
              <button
                id="lightbox-rotate-btn"
                type="button"
                onClick={handleRotate}
                aria-label="Rotate image"
                title="Rotate 90° (R)"
                className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-300 transition-colors"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            {/* Close Button */}
            <button
              id="lightbox-close-btn"
              type="button"
              onClick={onClose}
              aria-label="Close image inspection"
              title="Close (Esc)"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Center Stage: Interactive Image Inspection Viewport */}
        <main
          ref={imageContainerRef}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={(e) => {
            // Click outside image on backdrop closes modal if not dragged
            if (e.target === imageContainerRef.current && scale === 1) {
              onClose();
            }
          }}
          className={`relative flex-1 flex items-center justify-center p-4 overflow-hidden select-none ${
            scale > 1
              ? isDragging
                ? "cursor-grabbing"
                : "cursor-grab"
              : "cursor-zoom-in"
          }`}
        >
          {/* Subtle Inspection Grid / Guides */}
          <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />

          {/* Image Canvas */}
          <motion.div
            style={{
              transform: `translate(${position.x}px, ${position.y}px) scale(${scale}) rotate(${rotation}deg)`,
              transition: isDragging ? "none" : "transform 0.22s cubic-bezier(0.2, 0, 0, 1)",
            }}
            onDoubleClick={handleDoubleTapOrClick}
            className="relative flex items-center justify-center max-w-full max-h-full"
          >
            <img
              id="lightbox-inspected-image"
              src={listing.imageUrl}
              alt={listing.title}
              draggable={false}
              referrerPolicy="no-referrer"
              className="max-h-[70vh] max-w-[90vw] object-contain rounded-xl shadow-2xl border border-slate-800/80 pointer-events-auto"
            />
          </motion.div>

          {/* Floating Mobile Controls overlay */}
          <div className="sm:hidden absolute top-4 right-4 z-20 flex items-center bg-slate-900/90 rounded-xl p-1 border border-slate-700 backdrop-blur-md">
            <button
              onClick={handleZoomOut}
              disabled={scale <= 1}
              className="p-2 text-slate-300 disabled:opacity-30"
              title="Zoom out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="px-2 text-xs font-mono font-bold text-slate-200">
              {Math.round(scale * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              disabled={scale >= 4}
              className="p-2 text-slate-300 disabled:opacity-30"
              title="Zoom in"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>

          {/* Condition Inspector Helper Pill */}
          <div className="absolute top-4 left-4 z-20 pointer-events-none hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/85 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-md shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span>
              {scale > 1
                ? "Drag to pan and examine wear, scratches, or ports • Double-click to reset"
                : "Click or scroll to zoom in • Inspect condition before chatting"}
            </span>
          </div>
        </main>

        {/* Bottom Inspection & Pre-Chat Action Deck */}
        <footer className="relative z-20 bg-slate-900/95 border-t border-slate-800/90 px-4 sm:px-6 py-4 backdrop-blur-md">
          <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Condition Evaluation / AI Summary */}
            <div className="w-full md:w-auto flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-xs">
              <div className="flex items-baseline gap-1.5 shrink-0">
                <span className="text-slate-400">Price:</span>
                {listing.listingType === "exchange" ? (
                  <span className="font-extrabold text-purple-400 text-base">
                    Exchange Only
                  </span>
                ) : (
                  <span className="font-extrabold text-white text-lg">
                    ₹{listing.price}
                    {listing.listingType === "both" && (
                      <span className="text-[11px] font-normal text-slate-400 ml-1">
                        (or Swap)
                      </span>
                    )}
                  </span>
                )}
              </div>

              {/* AI Verification or Condition Details */}
              {listing.aiInspection ? (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-200">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div>
                    <span className="font-bold">
                      AI Verified Condition: {listing.aiInspection.inspectionScore}%
                    </span>
                    {listing.aiInspection.conditionDetails && (
                      <span className="hidden lg:inline text-slate-300 ml-1.5 text-[11px]">
                        "{listing.aiInspection.conditionDetails}"
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 text-slate-300">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Student verified item listed for campus handover</span>
                </div>
              )}
            </div>

            {/* Primary Action Buttons: "Chat Before Handover" */}
            <div className="w-full md:w-auto flex items-center justify-end gap-2.5 shrink-0">
              {onOpenDetails && (
                <button
                  id="lightbox-view-details-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenDetails(listing);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  <span>Full Details</span>
                </button>
              )}

              {onOpenCalendar && (
                <button
                  id="lightbox-meet-btn"
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCalendar(listing);
                  }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold transition-colors border border-slate-700 flex items-center gap-1.5"
                  title="Schedule handover meeting on Google Calendar"
                >
                  <CalendarIcon className="w-3.5 h-3.5 text-blue-400" />
                  <span className="hidden sm:inline">Meet</span>
                </button>
              )}

              {/* The Key CTA: Initiate Chat */}
              <button
                id="lightbox-initiate-chat-btn"
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat(listing);
                }}
                className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white text-xs font-extrabold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <MessageCircle className="w-4 h-4 text-white shrink-0" />
                <span>Chat with {listing.sellerName.split(" ")[0]}</span>
              </button>
            </div>
          </div>
        </footer>
      </div>
    </AnimatePresence>
  );
};
