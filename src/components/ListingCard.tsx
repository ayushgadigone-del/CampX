import React, { useState, useRef } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

// Stable listing card variants (prevents blinking or flashing on re-renders)
const listingCardVariants: Variants = {
  hidden: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.15,
      ease: "easeInOut",
    },
  },
};
import {
  Sparkles,
  MapPin,
  MessageCircle,
  Calendar as CalendarIcon,
  Tag,
  Repeat,
  BadgeCheck,
  Heart,
  Share2,
  Check,
  ZoomIn,
  Star,
  Flag,
  Clock,
  WifiOff,
  Eye,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Award,
  SlidersHorizontal,
  ArrowRight,
  Maximize2,
  CalendarCheck,
  GraduationCap,
  Package,
} from "lucide-react";
import { Listing } from "../types";
import { formatExpiryInfo } from "../utils/expiryUtils";
import { useTheme } from "../context/ThemeContext";
import { SellerReputationBadge } from "./SellerReputationBadge";
import { UserMilestoneBadge } from "./UserMilestoneBadge";

interface ListingCardProps {
  listing: Listing;
  allListings?: Listing[];
  isWishlisted?: boolean;
  onToggleWishlist?: (listingId: string) => void;
  onOpenDetails: (listing: Listing) => void;
  onOpenChat: (listing: Listing, initialMessage?: string) => void;
  onOpenCalendar: (listing: Listing) => void;
  onShowToast?: (message: string) => void;
  onOpenLightbox?: (listing: Listing) => void;
  onOpenPassport?: (listing: Listing) => void;
  onOpenBarter?: (listing: Listing) => void;
  isOnline?: boolean;
  layoutMode?: "grid" | "detailed";
  isFullScreen?: boolean;
  onTagClick?: (tag: string) => void;
  index?: number;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  allListings,
  isWishlisted = false,
  onToggleWishlist,
  onOpenDetails,
  onOpenChat,
  onOpenCalendar,
  onShowToast,
  onOpenLightbox,
  onOpenPassport,
  onOpenBarter,
  isOnline = true,
  layoutMode = "grid",
  isFullScreen = false,
  onTagClick,
  index,
}) => {
  const { isDark } = useTheme();
  const [isShared, setIsShared] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const reviewCount = listing.reviews?.length ?? listing.totalReviews ?? 0;
  const rating =
    listing.averageRating ??
    (listing.reviews && listing.reviews.length > 0
      ? Math.round(
          (listing.reviews.reduce((acc, r) => acc + r.rating, 0) /
            listing.reviews.length) *
            10
        ) / 10
      : 0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    // Subtle 3D perspective tilt calculation (limit to ±5.5 degrees)
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = Math.max(-5.5, Math.min(5.5, ((y - centerY) / centerY) * -5.5));
    const rotateY = Math.max(-5.5, Math.min(5.5, ((x - centerX) / centerX) * 5.5));
    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setTilt({ x: 0, y: 0 });
  };

  const getConditionScore = (cond: string) => {
    switch (cond) {
      case "Like New":
        return 96;
      case "Good":
        return 82;
      case "Fair":
        return 65;
      default:
        return 45;
    }
  };

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case "Like New":
        return "bg-emerald-600 text-white border-emerald-500 shadow-xs";
      case "Good":
        return "bg-blue-600 text-white border-blue-500 shadow-xs";
      case "Fair":
        return "bg-amber-600 text-white border-amber-500 shadow-xs";
      default:
        return "bg-rose-600 text-white border-rose-500 shadow-xs";
    }
  };

  const getConditionBarColor = (cond: string) => {
    switch (cond) {
      case "Like New":
        return "bg-emerald-500";
      case "Good":
        return "bg-blue-500";
      case "Fair":
        return "bg-amber-500";
      default:
        return "bg-rose-500";
    }
  };

  const fallbackCopy = async (shareUrl: string, message: string) => {
    try {
      const shareContent = `${message}\n\nView listing: ${shareUrl}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareContent);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareContent;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2500);
      onShowToast?.("Listing link & message copied to clipboard!");
    } catch (err) {
      console.warn("Clipboard copy notice:", err);
      onShowToast?.("Could not copy link.");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const priceText =
      listing.listingType === "exchange"
        ? "Available for Exchange"
        : listing.listingType === "both"
        ? `₹${listing.price} (or Open to Swap)`
        : `₹${listing.price}`;

    const locationText = listing.locationPreference
      ? ` Handover spot: ${listing.locationPreference}.`
      : "";

    const customMessage = `🎓 Check out this verified student listing on Campus Marketplace: "${listing.title}" for ${priceText} (Condition: ${listing.condition}) by ${listing.sellerName}.${locationText}`;

    const shareUrl = `${window.location.origin}${window.location.pathname}?item=${listing.id}#listing-${listing.id}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${listing.title} | Campus Marketplace`,
          text: customMessage,
          url: shareUrl,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2500);
        onShowToast?.("Shared listing successfully!");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          await fallbackCopy(shareUrl, customMessage);
        }
      }
    } else {
      await fallbackCopy(shareUrl, customMessage);
    }
  };

  // Check if we should render detailed widescreen card layout
  const isDetailedView = layoutMode === "detailed";

  /* ========================================================================= */
  /* DETAILED WIDESCREEN / FULL-SCREEN CARD LAYOUT (EVERY DETAIL VISIBLE)      */
  /* ========================================================================= */
  if (isDetailedView) {
    return (
      <motion.div
        id={`listing-card-${listing.id}`}
        variants={listingCardVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        custom={index}
        whileHover={{ y: -4, transition: { duration: 0.2, ease: "easeOut" } }}
        className="h-full w-full flex flex-col"
      >
        <div
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={handleMouseLeave}
          style={{
            transform: isHovered
              ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(4px)`
              : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
            transition: isHovered ? "transform 0.08s ease-out" : "transform 0.4s ease-out",
          }}
          className={`group relative flex flex-col md:flex-row rounded-3xl border backdrop-blur-xl transition-colors duration-300 overflow-hidden shadow-lg h-full ${
            isDark
              ? "bg-[#0F172A]/90 border-slate-800/80 shadow-xl shadow-black/40 hover:border-indigo-500/60 ring-1 ring-white/5 hover:shadow-indigo-500/10"
              : "bg-white border-slate-200/90 shadow-slate-200/70 hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-500/10"
          }`}
        >
        {/* Realistic Spotlight Highlight */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-100 transition-opacity duration-300 z-0"
            style={{
              background: isDark
                ? `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.12), transparent 75%)`
                : `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 75%)`,
            }}
          />
        )}

        {/* Holographic Iridescent Foil Sheen */}
        {isHovered && (
          <div
            className="pointer-events-none absolute -inset-px rounded-3xl opacity-35 mix-blend-color-dodge transition-opacity duration-300 z-10"
            style={{
              background: `radial-gradient(450px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.4) 0%, rgba(147,197,253,0.25) 30%, rgba(244,114,182,0.2) 60%, transparent 80%)`,
            }}
          />
        )}

        {/* Top edge physical bevel shine */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-indigo-400/30 to-transparent pointer-events-none z-10" />

        {/* Left Side: Visual Media & Condition Gauge Column */}
        <div className="relative md:w-5/12 lg:w-4/12 flex-shrink-0 flex flex-col bg-slate-950/5 dark:bg-slate-950/30">
          <div
            className="relative h-64 md:h-full min-h-[240px] w-full cursor-pointer overflow-hidden group/image"
            onClick={() => {
              if (onOpenLightbox) {
                onOpenLightbox(listing);
              } else {
                onOpenDetails(listing);
              }
            }}
            title="Click to zoom and inspect item condition"
          >
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              referrerPolicy="no-referrer"
            />

            {/* Hover zoom affordance */}
            <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
              <span className="px-3.5 py-2 rounded-full bg-slate-900/90 text-white backdrop-blur-md text-xs font-bold flex items-center gap-2 shadow-xl border border-slate-700 transform -translate-y-1 group-hover:translate-y-0 transition-transform">
                <ZoomIn className="w-4 h-4 text-indigo-400" />
                <span>Zoom & Inspect</span>
              </span>
            </div>

            {/* Badges on Media */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[78%] z-10">
              {/* Verified Student Badge */}
              <span
                id={`verified-student-badge-${listing.id}`}
                className="badge-shimmer-hover relative inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-600/95 text-white border border-blue-400/40 backdrop-blur-md shadow-xs select-none"
                title="Verified Student Seller • Campus Authenticated"
              >
                <span className="animate-shimmer-hover" aria-hidden="true" />
                <BadgeCheck className="w-3.5 h-3.5 text-blue-200 shrink-0" />
                <span>Verified Student</span>
              </span>

              {/* Condition Badge */}
              <span
                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border backdrop-blur-md ${getConditionColor(
                  listing.condition
                )}`}
              >
                {listing.condition}
              </span>

              {/* Available Stock Badge */}
              <span
                id={`stock-badge-${listing.id}`}
                className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold border backdrop-blur-md shadow-xs flex items-center gap-1 ${
                  listing.availableStock === 0 || listing.status === "completed"
                    ? "bg-slate-700 text-slate-300 border-slate-600"
                    : (listing.availableStock ?? 1) === 1
                    ? "bg-rose-600 text-white border-rose-400/50 shadow-rose-900/30 shadow-xs"
                    : "bg-emerald-600 text-white border-emerald-400/50 shadow-emerald-900/30 shadow-xs"
                }`}
              >
                <Package className="w-3 h-3" />
                <span>
                  {listing.availableStock === 0 || listing.status === "completed"
                    ? "Out of Stock"
                    : `${listing.availableStock ?? 1} in stock`}
                </span>
              </span>

              {/* Listing Type Tag */}
              {listing.listingType === "exchange" ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-purple-600 text-white shadow-xs flex items-center gap-1">
                  <Repeat className="w-3 h-3" />
                  Exchange Only
                </span>
              ) : listing.listingType === "both" ? (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-indigo-600 text-white shadow-xs flex items-center gap-1">
                  Sell or Swap
                </span>
              ) : null}

              {listing.isReported && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-rose-600 text-white shadow-xs flex items-center gap-1">
                  <Flag className="w-3 h-3 fill-white" />
                  Reported
                </span>
              )}
            </div>

            {/* Floating Top Right: Quick Share & Wishlist */}
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
              <motion.button
                id={`listing-quick-share-${listing.id}`}
                type="button"
                aria-label="Share listing"
                title="Share this listing"
                whileHover={{ scale: 1.12 }}
                whileTap={{ scale: 0.88 }}
                onClick={handleShare}
                className={`p-2.5 rounded-full backdrop-blur-md shadow-sm border cursor-pointer ${
                  isShared
                    ? "bg-emerald-600 text-white shadow-md border-emerald-400/50"
                    : "bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white border-slate-700"
                }`}
              >
                {isShared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
              </motion.button>

              {onToggleWishlist && (
                <motion.button
                  id={`wishlist-toggle-${listing.id}`}
                  type="button"
                  aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                  whileHover={{ scale: 1.12 }}
                  whileTap={{ scale: 0.88 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(listing.id);
                  }}
                  className={`p-2.5 rounded-full backdrop-blur-md shadow-sm border cursor-pointer ${
                    isWishlisted
                      ? "bg-slate-900 text-rose-500 hover:bg-slate-800 border-rose-500/50 shadow-md"
                      : "bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-rose-400 border-slate-700"
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""
                    }`}
                  />
                </motion.button>
              )}
            </div>

            {/* Bottom on Image: AI Inspection & Views */}
            <div className="absolute bottom-3 inset-x-3 z-10 flex items-center justify-between gap-2">
              {listing.aiInspection ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black bg-slate-950 text-white border border-slate-700/80 backdrop-blur-md shadow-lg select-none">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-100 font-bold">AI Score:</span>
                  <span className="text-emerald-400 font-black">{listing.aiInspection.inspectionScore}%</span>
                </span>
              ) : (
                <span />
              )}

              <span
                className={`px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5 border shadow-xs select-none ${
                  (listing.views || 0) >= 100
                    ? "bg-slate-950/90 text-amber-300 border-amber-500/50"
                    : "bg-slate-900/80 text-slate-200 border-slate-700/80"
                }`}
              >
                {(listing.views || 0) >= 100 ? (
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-indigo-400" />
                )}
                <span>{(listing.views || 0).toLocaleString()} views</span>
              </span>
            </div>

            {/* Status Overlay */}
            {listing.status !== "available" && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-4 text-center z-20">
                {listing.status === "completed" ? (
                  <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-2 shadow-xl">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    </div>
                    <span className="px-3.5 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs uppercase tracking-wider shadow-md">
                      Sold / Deal Completed
                    </span>
                    <span className="text-[11px] text-slate-300 mt-1.5 font-medium">
                      Verified Campus Handover
                    </span>
                  </div>
                ) : (
                  <span
                    className={`px-3.5 py-1.5 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg ${
                      listing.status === "inactive"
                        ? "bg-slate-800 border border-slate-700 text-slate-300"
                        : "bg-amber-600/90 border border-amber-500/40"
                    }`}
                  >
                    {listing.status === "reserved"
                      ? "Reserved"
                      : listing.status === "handover_scheduled"
                      ? "Handover Scheduled"
                      : "Inactive (Expired 30d)"}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Rich Information, Specs & Actions Column */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between space-y-4 relative z-10">
          <div>
            {/* Meta Row: Category, Handover Spot, Expiry */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs pb-2 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-bold text-indigo-600 dark:text-indigo-400">
                  <Tag className="w-3.5 h-3.5" />
                  {listing.category}
                </span>

                {listing.locationPreference && (
                  <span
                    className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md"
                    title={`Preferred handover spot: ${listing.locationPreference}`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span className="font-semibold">{listing.locationPreference}</span>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                {listing.expiryDate && (
                  <span
                    className={`flex items-center gap-1 text-[11px] font-medium ${
                      listing.status === "inactive"
                        ? "text-slate-400 line-through"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{formatExpiryInfo(listing).label}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Title (Full unclipped in full screen) */}
            <h3
              onClick={() => onOpenDetails(listing)}
              className={`text-lg sm:text-xl font-extrabold mt-3 cursor-pointer transition-colors leading-snug ${
                isDark ? "text-white hover:text-indigo-300" : "text-slate-900 hover:text-indigo-600"
              }`}
            >
              {listing.title}
            </h3>

            {/* Description (Full text in detailed view) */}
            <p className={`text-sm mt-2 leading-relaxed ${isDark ? "text-slate-300" : "text-slate-600"}`}>
              {listing.description}
            </p>

            {/* Exchange Terms Box if Applicable */}
            {listing.exchangeFor && (
              <div className="mt-3 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-start gap-2.5">
                <Repeat className="w-4 h-4 text-purple-500 mt-0.5 shrink-0" />
                <div className="text-xs">
                  <span className="font-extrabold text-purple-700 dark:text-purple-300">
                    Open for Exchange Barter:{" "}
                  </span>
                  <span className="text-purple-900 dark:text-purple-200 font-medium">
                    {listing.exchangeFor}
                  </span>
                </div>
              </div>
            )}

            {/* AI Inspection Highlights Banner if Available */}
            {listing.aiInspection && (
              <div className="mt-3 p-3 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border-2 border-indigo-200 dark:border-indigo-800/80 space-y-2">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-xs font-extrabold text-slate-950 dark:text-white">
                      Gemini Inspection
                    </span>
                  </div>
                  <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-slate-950 text-white border border-slate-800 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-300">Score:</span>
                    <span className="text-xs font-black text-emerald-400">
                      {listing.aiInspection.inspectionScore}%
                    </span>
                  </div>
                </div>

                {listing.aiInspection.conditionDetails && (
                  <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-normal">
                    {listing.aiInspection.conditionDetails}
                  </p>
                )}

                {listing.aiInspection.keyFeatures && listing.aiInspection.keyFeatures.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {listing.aiInspection.keyFeatures.slice(0, 4).map((feature, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 shadow-2xs"
                      >
                        <Check className="w-2.5 h-2.5 text-indigo-500" />
                        <span>{feature}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Scheduled Handover Banner if Active */}
            {listing.handoverDetails && (
              <div className="mt-3 p-2.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CalendarCheck className="w-4 h-4 text-emerald-500" />
                  <span className="font-bold">Meetup Scheduled:</span>
                  <span>
                    {listing.handoverDetails.scheduledDate} at {listing.handoverDetails.scheduledTime} ({listing.handoverDetails.location})
                  </span>
                </div>
              </div>
            )}

            {/* Tags Row */}
            {listing.tags && listing.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 mt-3">
                {listing.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onTagClick?.(tag);
                    }}
                    className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                      isDark
                        ? "bg-slate-800 text-slate-300 border border-slate-700 hover:border-indigo-500 hover:text-indigo-300"
                        : "bg-slate-100 text-slate-700 border border-slate-200 hover:border-indigo-400 hover:text-indigo-700"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bottom Card Footer: Seller Credentials, Price & Action Buttons */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            {/* Seller & Price Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              {/* Seller Profile Info */}
              <div
                onClick={() => onOpenPassport?.(listing)}
                className="flex items-center gap-3 cursor-pointer group/seller"
                title="Click to inspect Verified Student Digital Passport"
              >
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center font-extrabold text-sm shadow-md shrink-0 group-hover/seller:scale-105 transition-transform">
                  {listing.sellerName.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold group-hover/seller:text-indigo-400 transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
                      {listing.sellerName}
                    </span>
                    <span className="badge-shimmer-hover relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/15 text-blue-500 dark:text-blue-300 border border-blue-500/30">
                      <span className="animate-shimmer-hover" aria-hidden="true" />
                      <BadgeCheck className="w-3 h-3 text-blue-500" />
                      <span>Passport</span>
                    </span>
                    <UserMilestoneBadge listing={listing} allListings={allListings} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>{listing.department || "Engineering"}</span>
                    <span>•</span>
                    <span>{listing.year || "Student"}</span>
                    <span>•</span>
                    <SellerReputationBadge
                      listing={listing}
                      allListings={allListings}
                      variant="seller-row"
                      onViewReviews={onOpenDetails}
                    />
                  </div>
                </div>
              </div>

              {/* Price Display */}
              <div className="sm:text-right">
                {listing.listingType === "exchange" ? (
                  <div className="text-base font-extrabold text-purple-500">
                    Open for Exchange
                  </div>
                ) : (
                  <div className="flex items-baseline sm:justify-end gap-1">
                    <span className="text-sm font-bold text-slate-500">₹</span>
                    <span className={`text-2xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      {listing.price}
                    </span>
                    {listing.listingType === "both" && (
                      <span className="text-xs font-semibold text-indigo-500 ml-1">
                        (or Swap)
                      </span>
                    )}
                  </div>
                )}
                {/* Available Stock Indicator */}
                <div className="flex items-center sm:justify-end gap-1.5 text-xs font-semibold mt-1">
                  <Package className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                  <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                    Stock:{" "}
                    <strong
                      className={
                        listing.availableStock === 0 || listing.status === "completed"
                          ? "text-slate-500 font-bold"
                          : (listing.availableStock ?? 1) === 1
                          ? "text-rose-600 dark:text-rose-400 font-bold"
                          : "text-emerald-600 dark:text-emerald-400 font-bold"
                      }
                    >
                      {listing.availableStock === 0 || listing.status === "completed"
                        ? "0 Available (Sold Out)"
                        : `${listing.availableStock ?? 1} Available`}
                    </strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Full-width Responsive Action Buttons */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
              <motion.button
                id={`listing-details-btn-${listing.id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenDetails(listing)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition-all text-center cursor-pointer shadow-2xs flex items-center justify-center gap-1.5 ${
                  listing.status === "completed"
                    ? isDark
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : isDark
                    ? "border-slate-700 bg-slate-800 hover:bg-slate-700 text-white"
                    : "border-slate-300 bg-white hover:bg-slate-50 text-slate-800"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
                <span>{listing.status === "completed" ? "History" : "Full Specs"}</span>
              </motion.button>

              <motion.button
                id={`listing-chat-btn-${listing.id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  if (listing.status === "completed") {
                    onOpenDetails(listing);
                    return;
                  }
                  if (!isOnline) {
                    onShowToast?.("⚠️ Chat is disabled while offline to prevent data loss.");
                    return;
                  }
                  onOpenChat(
                    listing,
                    `Hi ${listing.sellerName.split(" ")[0]}! I saw your listing for "${listing.title}". Is it still available for handover on campus?`
                  );
                }}
                disabled={!isOnline && listing.status !== "completed"}
                title={`Ask ${listing.sellerName} questions or negotiate a deal`}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-2xs ${
                  listing.status === "completed"
                    ? isDark
                      ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                      : "bg-slate-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                    : !isOnline
                    ? "bg-slate-800 text-slate-500 border border-slate-700"
                    : isDark
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/20 cursor-pointer"
                    : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/20 cursor-pointer"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Ask Seller</span>
              </motion.button>

              <motion.button
                id={`listing-meet-btn-${listing.id}`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onOpenCalendar(listing)}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                  isDark
                    ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-500/40"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200"
                }`}
                title="Schedule Handover on Google Calendar"
              >
                <CalendarIcon className="w-3.5 h-3.5" />
                <span>Meetup</span>
              </motion.button>

              <motion.button
                id={`listing-share-btn-${listing.id}`}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleShare}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                  isShared
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/40"
                    : isDark
                    ? "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200"
                }`}
              >
                {isShared ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Share</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        </div>
      </motion.div>
    );
  }

  /* ========================================================================= */
  /* STANDARD DYNAMIC GRID CARD LAYOUT (WITH EXPANDABLE QUICK SPECS & REALISM) */
  /* ========================================================================= */
  return (
    <motion.div
      id={`listing-card-${listing.id}`}
      variants={listingCardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      custom={index}
      whileHover={{ y: -5, transition: { duration: 0.2, ease: "easeOut" } }}
      className="h-full w-full flex flex-col"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) translateZ(4px)`
            : "perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)",
          transition: isHovered ? "transform 0.08s ease-out" : "transform 0.4s ease-out",
        }}
        className={`group relative flex flex-col rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden h-full ${
          isDark
            ? "bg-[#0F172A]/90 border-slate-800/80 shadow-xl shadow-black/40 hover:border-indigo-500/60 ring-1 ring-white/5 hover:shadow-indigo-500/10"
            : "bg-white border-slate-200/90 shadow-md hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/10"
        }`}
      >
      {/* Realistic Spotlight Gradient */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-100 transition-opacity duration-300 z-0"
          style={{
            background: isDark
              ? `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.14), transparent 70%)`
              : `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(99, 102, 241, 0.08), transparent 70%)`,
          }}
        />
      )}

      {/* Holographic Iridescent Foil Sheen */}
      {isHovered && (
        <div
          className="pointer-events-none absolute -inset-px rounded-2xl opacity-35 mix-blend-color-dodge transition-opacity duration-300 z-10"
          style={{
            background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.4) 0%, rgba(147,197,253,0.25) 30%, rgba(244,114,182,0.2) 60%, transparent 80%)`,
          }}
        />
      )}

      {/* Subtle top edge bevel highlight */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 dark:via-indigo-400/30 to-transparent pointer-events-none z-10" />

      {/* Image Container with Lightbox Trigger */}
      <div
        className={`relative h-42 sm:h-44 w-full cursor-pointer overflow-hidden group/image ${
          isDark ? "bg-slate-900" : "bg-slate-100"
        }`}
        onClick={() => {
          if (onOpenLightbox) {
            onOpenLightbox(listing);
          } else {
            onOpenDetails(listing);
          }
        }}
        title="Click to zoom and inspect item condition"
      >
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="h-full w-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
          referrerPolicy="no-referrer"
        />

        {/* Hover zoom affordance badge */}
        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center z-10">
          <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5 shadow-lg transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-200 border border-slate-700">
            <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>Click to Zoom</span>
          </span>
        </div>

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[75%] z-10">
          {/* Verified Student Badge */}
          <span
            id={`verified-student-badge-${listing.id}`}
            className="badge-shimmer-hover relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/95 hover:bg-blue-600 text-white border border-blue-400/40 backdrop-blur-md shadow-xs overflow-hidden select-none"
            title="Verified Student Seller • Campus Authenticated"
          >
            <span className="animate-shimmer-hover" aria-hidden="true" />
            <BadgeCheck className="w-3 h-3 text-blue-200 shrink-0" />
            <span>Verified Student</span>
          </span>

          {/* Seller Reputation Trust Score Badge */}
          <SellerReputationBadge
            listing={listing}
            allListings={allListings}
            variant="compact"
            onViewReviews={onOpenDetails}
          />

          <span
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border backdrop-blur-xs ${getConditionColor(
              listing.condition
            )}`}
          >
            {listing.condition}
          </span>

          {/* Available Stock Badge */}
          <span
            id={`stock-badge-${listing.id}`}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border backdrop-blur-md shadow-xs flex items-center gap-1 ${
              listing.availableStock === 0 || listing.status === "completed"
                ? "bg-slate-700 text-slate-300 border-slate-600"
                : (listing.availableStock ?? 1) === 1
                ? "bg-rose-600 text-white border-rose-400/40 shadow-rose-900/30 shadow-xs"
                : "bg-emerald-600 text-white border-emerald-400/40 shadow-emerald-900/30 shadow-xs"
            }`}
            title="Current available campus stock"
          >
            <Package className="w-3 h-3" />
            <span>
              {listing.availableStock === 0 || listing.status === "completed"
                ? "0 Stock"
                : `${listing.availableStock ?? 1} in stock`}
            </span>
          </span>

          {listing.listingType === "exchange" ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-600 text-white shadow-xs flex items-center gap-1">
              <Repeat className="w-3 h-3" />
              Exchange
            </span>
          ) : listing.listingType === "both" ? (
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-600 text-white shadow-xs flex items-center gap-1">
              Sell / Swap
            </span>
          ) : null}

          {listing.isReported && (
            <span
              id={`reported-badge-${listing.id}`}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs flex items-center gap-1"
              title="This listing has been reported for campus moderator review"
            >
              <Flag className="w-3 h-3 fill-white" />
              <span>Reported</span>
            </span>
          )}

          {listing.status === "inactive" && (
            <span
              id={`inactive-badge-${listing.id}`}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900/90 text-slate-200 border border-slate-700 shadow-xs flex items-center gap-1"
              title="Listing has expired after 30 days and is marked inactive"
            >
              <Clock className="w-3 h-3 text-amber-400" />
              <span>Inactive</span>
            </span>
          )}
        </div>

        {/* Floating Actions: Share & Wishlist */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
          <motion.button
            id={`listing-quick-share-${listing.id}`}
            type="button"
            aria-label="Share listing"
            title="Share this listing"
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.88 }}
            onClick={handleShare}
            className={`p-2 rounded-full backdrop-blur-md shadow-sm border cursor-pointer ${
              isShared
                ? "bg-emerald-600 text-white shadow-md border-emerald-400/50"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700"
            }`}
          >
            {isShared ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4" />}
          </motion.button>

          {onToggleWishlist && (
            <motion.button
              id={`wishlist-toggle-${listing.id}`}
              type="button"
              aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.88 }}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(listing.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md shadow-sm border cursor-pointer ${
                isWishlisted
                  ? "bg-slate-900 text-rose-500 hover:bg-slate-800 border-rose-500/50 shadow-md"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-rose-400 border-slate-700"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${
                  isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""
                }`}
              />
            </motion.button>
          )}
        </div>

        {/* Interactive Holographic Condition Pass Pill */}
        <div className="absolute bottom-2.5 left-3 z-10">
          {listing.aiInspection ? (
            <motion.button
              type="button"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetails(listing);
              }}
              className="relative overflow-hidden inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/90 text-indigo-200 border border-indigo-500/40 backdrop-blur-md shadow-md group/holo cursor-pointer"
              title="Interactive 3D Holographic Pass • Inspected by Gemini 3.8 Flash"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/holo:translate-x-full transition-transform duration-700 ease-out" />
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-white font-black text-xs">Pass • {listing.aiInspection.inspectionScore}% AI Score</span>
            </motion.button>
          ) : (
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border backdrop-blur-xs shadow-md ${getConditionColor(
                listing.condition
              )}`}
            >
              <Award className="w-3 h-3 shrink-0" />
              <span>{getConditionScore(listing.condition)}% {listing.condition}</span>
            </span>
          )}
        </div>

        {/* Quick Zoom & View Count Pill */}
        <div className="absolute bottom-2.5 right-3 z-10 flex items-center gap-1.5">
          <span
            id={`listing-thumb-views-${listing.id}`}
            className={`px-2 py-1 rounded-lg backdrop-blur-md text-[10px] font-bold flex items-center gap-1 border shadow-xs select-none ${
              (listing.views || 0) >= 100
                ? "bg-slate-950/90 text-amber-300 border-amber-500/50"
                : "bg-slate-900/80 text-slate-200 border-slate-700/80"
            }`}
            title={`${listing.views || 0} students viewed this listing`}
          >
            {(listing.views || 0) >= 100 ? (
              <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
            ) : (
              <Eye className="w-3 h-3 text-indigo-400" />
            )}
            <span>{(listing.views || 0).toLocaleString()}</span>
          </span>

          <button
            id={`listing-zoom-btn-${listing.id}`}
            type="button"
            aria-label={`Zoom and inspect condition of ${listing.title}`}
            title="Zoom & inspect condition in lightbox"
            onClick={(e) => {
              e.stopPropagation();
              if (onOpenLightbox) {
                onOpenLightbox(listing);
              } else {
                onOpenDetails(listing);
              }
            }}
            className="px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white backdrop-blur-md text-[10px] font-bold flex items-center gap-1 border border-slate-700 opacity-90 hover:opacity-100 transition-all hover:scale-105 shadow-sm"
          >
            <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>Zoom</span>
          </button>
        </div>

        {/* Status overlay if not available or completed */}
        {listing.status !== "available" && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-3 text-center z-20">
            {listing.status === "completed" ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in-95 duration-200">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-1.5 shadow-lg">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-950/90 border border-emerald-500/50 text-emerald-300 font-extrabold text-xs uppercase tracking-wider shadow-md">
                  Sold / Completed
                </span>
                <span className="text-[10px] text-slate-300 mt-1 font-medium">
                  Verified Campus Handover
                </span>
              </div>
            ) : (
              <span
                className={`px-3 py-1 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg ${
                  listing.status === "inactive"
                    ? "bg-slate-800 border border-slate-700 text-slate-300"
                    : "bg-amber-600/90 border border-amber-500/40"
                }`}
              >
                {listing.status === "reserved"
                  ? "Reserved"
                  : listing.status === "handover_scheduled"
                  ? "Handover Scheduled"
                  : "Inactive (Expired 30d)"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between space-y-2 relative z-10">
        <div>
          {/* Category & Handover Location Row */}
          <div className={`flex items-center justify-between text-xs mb-1.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
              <Tag className="w-3 h-3" />
              {listing.category}
            </span>
            <div className="flex items-center gap-2">
              {listing.expiryDate && (
                <span
                  className={`flex items-center gap-1 text-[10px] font-medium ${
                    listing.status === "inactive"
                      ? isDark ? "text-slate-500 line-through" : "text-slate-400 line-through"
                      : isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                  title={`Listing validity: ${new Date(listing.expiryDate).toLocaleDateString()}`}
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatExpiryInfo(listing).label}</span>
                </span>
              )}
              {listing.locationPreference && (
                <span
                  className={`flex items-center gap-0.5 font-medium ${
                    isFullScreen ? "max-w-none" : "truncate max-w-[130px]"
                  } ${isDark ? "text-slate-300" : "text-slate-600"}`}
                  title={`Preferred handover spot: ${listing.locationPreference}`}
                >
                  <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                  <span className={isFullScreen ? "break-words" : "truncate"}>{listing.locationPreference}</span>
                </span>
              )}
            </div>
          </div>

          {/* Title */}
          <h3
            onClick={() => onOpenDetails(listing)}
            className={`text-sm font-bold transition-colors cursor-pointer leading-snug break-words ${
              isFullScreen ? "line-clamp-none" : "line-clamp-2 hover:line-clamp-none"
            } ${
              isDark ? "text-white hover:text-indigo-300" : "text-slate-900 hover:text-indigo-600"
            }`}
          >
            {listing.title}
          </h3>

          {/* Description */}
          <p className={`text-xs mt-1 leading-relaxed break-words ${
            isFullScreen ? "line-clamp-none" : "line-clamp-3 hover:line-clamp-none"
          } ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {listing.description}
          </p>

          {/* Exchange Terms Badge if present */}
          {listing.exchangeFor && (
            <div className="mt-2 p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-[11px] text-purple-700 dark:text-purple-300 flex items-start gap-1.5">
              <Repeat className="w-3 h-3 text-purple-500 shrink-0 mt-0.5" />
              <span className="break-words">
                <strong className="font-bold">Swap for:</strong> {listing.exchangeFor}
              </span>
            </div>
          )}

          {/* Tags Chips */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {(isFullScreen ? listing.tags : listing.tags.slice(0, 3)).map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTagClick?.(tag);
                  }}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? "bg-slate-900/80 text-slate-300 border border-slate-700/60 hover:border-indigo-500/40 hover:text-indigo-300"
                      : "bg-slate-100 text-slate-700 border border-slate-200 hover:border-indigo-400 hover:text-indigo-700"
                  }`}
                >
                  #{tag}
                </button>
              ))}
              {!isFullScreen && listing.tags.length > 3 && (
                <span className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  +{listing.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Expandable Quick Specs & AI Report Accordion */}
          <div className="mt-2.5">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`w-full py-1 px-2 rounded-lg text-[11px] font-bold flex items-center justify-between border transition-colors cursor-pointer ${
                isExpanded
                  ? isDark
                    ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-300"
                    : "bg-indigo-50 border-indigo-200 text-indigo-700"
                  : isDark
                  ? "bg-slate-900/50 border-slate-700/60 text-slate-400 hover:text-slate-200"
                  : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
              }`}
            >
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-400" />
                <span>{isExpanded ? "Hide Full Details" : "Show All Details & Specs"}</span>
              </span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden pt-2 space-y-2 text-xs"
                >
                  {/* Full Description */}
                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-900/80 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <div className="font-bold text-[10px] uppercase text-slate-400 mb-1">Full Description</div>
                    <p className={`text-xs leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}>
                      {listing.description}
                    </p>
                  </div>

                  {/* Condition Meter */}
                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-900/80 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                      <span>Condition Health: {listing.condition}</span>
                      <span className="text-indigo-400">{getConditionScore(listing.condition)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getConditionBarColor(listing.condition)}`}
                        style={{ width: `${getConditionScore(listing.condition)}%` }}
                      />
                    </div>
                  </div>

                  {/* AI Inspection Notes if present */}
                  {listing.aiInspection && (
                    <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-1">
                      <div className="flex items-center justify-between text-xs font-black text-slate-900 dark:text-white">
                        <span className="flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          AI Inspection Score
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-950 text-emerald-400 font-black">
                          {listing.aiInspection.inspectionScore}%
                        </span>
                      </div>
                      {listing.aiInspection.conditionDetails && (
                        <p className="text-xs text-slate-800 dark:text-slate-200 font-medium leading-normal">
                          {listing.aiInspection.conditionDetails}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Seller Details */}
                  <div className={`p-2.5 rounded-xl border ${isDark ? "bg-slate-900/80 border-slate-700" : "bg-slate-50 border-slate-200"}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-400 text-[10px] uppercase">Seller Credentials</span>
                      <span className="text-[10px] text-emerald-500 font-bold">✓ Campus Verified</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="font-semibold">{listing.sellerName}</span>
                      <span className="text-slate-400">{listing.department} ({listing.year || "Student"})</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Star Rating & Review Summary */}
          <div
            id={`listing-rating-summary-${listing.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(listing);
            }}
            className={`mt-2 flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg border transition-colors cursor-pointer group/rating ${
              isDark
                ? "bg-slate-900/60 hover:bg-slate-900/90 border-slate-700/60 hover:border-indigo-500/40"
                : "bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 hover:border-indigo-400"
            }`}
          >
            <div className="flex items-center gap-1.5">
              {reviewCount > 0 ? (
                <>
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                    <span className={`text-xs font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                      {rating.toFixed(1)}
                    </span>
                  </div>
                  <span className={`text-[11px] ${isDark ? "text-slate-400 group-hover/rating:text-indigo-300" : "text-slate-500 group-hover/rating:text-indigo-600"}`}>
                    ({reviewCount} reviews)
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Star className="w-3.5 h-3.5 text-slate-400" />
                  <span>No reviews yet</span>
                </div>
              )}
            </div>

            <span className={`text-[10px] font-semibold flex items-center gap-0.5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              {reviewCount > 0 ? (
                <>
                  <span>Verified Deal</span>
                  <span className="text-emerald-500 font-bold">✓</span>
                </>
              ) : (
                <span>Campus Guarantee</span>
              )}
            </span>
          </div>
        </div>

        {/* Card Footer: Price, Seller & Quick Actions */}
        <div className={`pt-2.5 border-t space-y-2.5 ${isDark ? "border-slate-700/60" : "border-slate-200"}`}>
          {/* Price & Seller Row */}
          <div className="flex items-center justify-between">
            <div>
              {listing.listingType === "exchange" ? (
                <div className="text-sm font-bold text-purple-500">
                  Open for Exchange
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>₹</span>
                  <span className={`text-lg font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                    {listing.price}
                  </span>
                  {listing.listingType === "both" && (
                    <span className={`text-[10px] font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>or Swap</span>
                  )}
                </div>
              )}
              {/* Available Stock Indicator */}
              <div className="flex items-center gap-1 text-[11px] font-bold mt-0.5">
                <Package className="w-3 h-3 text-purple-400 shrink-0" />
                <span className={isDark ? "text-slate-300" : "text-slate-600"}>
                  Stock:{" "}
                  <strong
                    className={
                      listing.availableStock === 0 || listing.status === "completed"
                        ? "text-slate-500 font-bold"
                        : (listing.availableStock ?? 1) === 1
                        ? "text-rose-600 dark:text-rose-400 font-bold"
                        : "text-emerald-600 dark:text-emerald-400 font-bold"
                    }
                  >
                    {listing.availableStock === 0 || listing.status === "completed"
                      ? "0 Left"
                      : `${listing.availableStock ?? 1} Available`}
                  </strong>
                </span>
              </div>
            </div>

            <div
              onClick={() => onOpenPassport?.(listing)}
              className="flex items-center gap-1.5 text-right cursor-pointer group/seller"
              title="Click to view Verified Student Digital Passport"
            >
              <div className="w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-xs shrink-0 group-hover/seller:scale-105 group-hover/seller:border-indigo-400 transition-all">
                {listing.sellerName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-semibold group-hover/seller:text-indigo-400 transition-colors ${
                    isFullScreen ? "break-words" : "truncate max-w-[90px]"
                  } ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {isFullScreen ? listing.sellerName : listing.sellerName.split(" ")[0]}
                  </span>
                  <UserMilestoneBadge listing={listing} allListings={allListings} />
                </div>
                <div className="flex items-center gap-1 -mt-0.5">
                  <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {isFullScreen ? (listing.department || "Student") : (listing.department?.split(" ")[0] || "Student")}
                  </span>
                  <SellerReputationBadge
                    listing={listing}
                    allListings={allListings}
                    variant="seller-row"
                    onViewReviews={onOpenDetails}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="space-y-1.5">
            {/* Primary Action: Direct Ask Seller Button */}
            <motion.button
              id={`listing-chat-btn-${listing.id}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (listing.status === "completed") {
                  onOpenDetails(listing);
                  return;
                }
                if (!isOnline) {
                  onShowToast?.("⚠️ Chat is disabled while offline to prevent data loss.");
                  return;
                }
                onOpenChat(
                  listing,
                  `Hi ${listing.sellerName.split(" ")[0]}! I saw your listing for "${listing.title}". Is it still available for handover on campus?`
                );
              }}
              disabled={!isOnline && listing.status !== "completed"}
              title={
                listing.status === "completed"
                  ? "This item has already been sold on campus. Click to view history."
                  : !isOnline
                  ? "Chat is disabled while offline"
                  : `Ask ${listing.sellerName} questions or negotiate a deal`
              }
              className={`w-full py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-2xs select-none ${
                listing.status === "completed"
                  ? isDark
                    ? "bg-slate-800 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                    : "bg-slate-100 text-emerald-700 border border-emerald-200 cursor-pointer"
                  : !isOnline
                  ? isDark
                    ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                    : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                  : isDark
                  ? "bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/30 cursor-pointer"
                  : "bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-indigo-600/25 cursor-pointer"
              }`}
            >
              {listing.status === "completed" ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                  <span>Item Sold • View History</span>
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 shrink-0" />
                  <span>Chat Offline</span>
                </>
              ) : (
                <>
                  <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>Ask Seller</span>
                </>
              )}
            </motion.button>

            {/* Secondary Actions: Details, Meet, Share */}
            <div className="flex items-center gap-1.5">
              <motion.button
                id={`listing-details-btn-${listing.id}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onOpenDetails(listing)}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold transition-colors text-center cursor-pointer shadow-2xs ${
                  listing.status === "completed"
                    ? isDark
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                      : "border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                    : isDark
                    ? "border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-200"
                    : "border-slate-200 bg-white hover:bg-slate-50 text-slate-800"
                }`}
              >
                {listing.status === "completed" ? "History" : "Details"}
              </motion.button>

              <motion.button
                id={`listing-meet-btn-${listing.id}`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => onOpenCalendar(listing)}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${
                  isDark
                    ? "bg-blue-500/15 hover:bg-blue-500/25 text-blue-300 border-blue-500/40"
                    : "bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
                }`}
                title="Schedule Handover on Google Calendar"
              >
                <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                <span>Meet</span>
              </motion.button>

              <motion.button
                id={`listing-share-btn-${listing.id}`}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleShare}
                className={`flex-1 py-1.5 px-2 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${
                  isShared
                    ? isDark
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : isDark
                    ? "bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700"
                    : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
                }`}
                title="Share listing via Web Share"
              >
                {isShared ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span>Done</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Share</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </motion.div>
  );
};
