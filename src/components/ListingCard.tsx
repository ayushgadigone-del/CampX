import React, { useState } from "react";
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
} from "lucide-react";
import { Listing } from "../types";
import { formatExpiryInfo } from "../utils/expiryUtils";
import { useTheme } from "../context/ThemeContext";
import { SellerReputationBadge } from "./SellerReputationBadge";

interface ListingCardProps {
  listing: Listing;
  allListings?: Listing[];
  isWishlisted?: boolean;
  onToggleWishlist?: (listingId: string) => void;
  onOpenDetails: (listing: Listing) => void;
  onOpenChat: (listing: Listing) => void;
  onOpenCalendar: (listing: Listing) => void;
  onShowToast?: (message: string) => void;
  onOpenLightbox?: (listing: Listing) => void;
  isOnline?: boolean;
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
  isOnline = true,
}) => {
  const { isDark } = useTheme();
  const [isShared, setIsShared] = useState(false);

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

  const getConditionColor = (cond: string) => {
    switch (cond) {
      case "Like New":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";
      case "Good":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30";
      case "Fair":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30";
      default:
        return "bg-rose-500/20 text-rose-300 border-rose-500/30";
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

    // Custom message formatted for students
    const customMessage = `🎓 Check out this verified student listing on Campus Marketplace: "${listing.title}" for ${priceText} (Condition: ${listing.condition}) by ${listing.sellerName}.${locationText}`;

    // Generate listing URL with query parameter
    const shareUrl = `${window.location.origin}${window.location.pathname}?item=${listing.id}#listing-${listing.id}`;

    // Try native Web Share API
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
        // Only fallback if not aborted/dismissed by user
        if (err.name !== "AbortError") {
          console.warn("Web Share API encountered error, falling back to clipboard:", err);
          await fallbackCopy(shareUrl, customMessage);
        }
      }
    } else {
      // Fallback for browsers / iframes where navigator.share is unavailable
      await fallbackCopy(shareUrl, customMessage);
    }
  };

  return (
    <div
      id={`listing-card-${listing.id}`}
      className={`group relative flex flex-col rounded-2xl border backdrop-blur-xl transition-all duration-300 overflow-hidden h-full ${
        isDark
          ? "bg-slate-800/90 border-slate-700/80 shadow-xl hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10"
          : "bg-white border-slate-200/90 shadow-sm hover:border-indigo-400 hover:shadow-xl hover:shadow-indigo-500/5"
      }`}
    >
      {/* Image Container with Lightbox Trigger */}
      <div
        className={`relative h-48 w-full cursor-pointer overflow-hidden group/image ${
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
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />

        {/* Hover zoom affordance badge */}
        <div className="absolute inset-0 bg-slate-950/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-full bg-slate-900/90 text-white backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5 shadow-lg transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-200 border border-slate-700">
            <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
            <span>Click to Zoom</span>
          </span>
        </div>

        {/* Badges on Image */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[72%]">
          {/* Verified Student Badge with Subtle Shimmer on Hover */}
          <span
            id={`verified-student-badge-${listing.id}`}
            className="badge-shimmer-hover relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/95 hover:bg-blue-600 text-white border border-blue-400/40 backdrop-blur-md shadow-xs overflow-hidden transition-all duration-300 select-none group-hover:scale-[1.02] cursor-default"
            title="Verified Student Seller • Campus Authenticated"
          >
            {/* Subtle Shimmer Sweep Effect on Hover */}
            <span className="animate-shimmer-hover" aria-hidden="true" />
            <BadgeCheck className="w-3 h-3 text-blue-200 shrink-0 group-hover:rotate-12 transition-transform duration-300" />
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

          {/* Reported for Moderation Badge */}
          {listing.isReported && (
            <span
              id={`reported-badge-${listing.id}`}
              className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-600 text-white shadow-xs flex items-center gap-1 animate-pulse"
              title="This listing has been reported for campus moderator review"
            >
              <Flag className="w-3 h-3 fill-white" />
              <span>Reported</span>
            </span>
          )}

          {/* Inactive / Expired Badge */}
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
          <button
            id={`listing-quick-share-${listing.id}`}
            type="button"
            aria-label="Share listing"
            title="Share this listing"
            onClick={handleShare}
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm border ${
              isShared
                ? "bg-emerald-600 text-white scale-105 shadow-md border-emerald-400/50"
                : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-white border-slate-700 hover:scale-110"
            }`}
          >
            {isShared ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Share2 className="w-4 h-4" />
            )}
          </button>

          {onToggleWishlist && (
            <button
              id={`wishlist-toggle-${listing.id}`}
              type="button"
              aria-label={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(listing.id);
              }}
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm border ${
                isWishlisted
                  ? "bg-slate-900 text-rose-500 hover:bg-slate-800 border-rose-500/50 scale-105 shadow-md"
                  : "bg-slate-900/80 text-slate-300 hover:bg-slate-800 hover:text-rose-400 border-slate-700 hover:scale-110"
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${
                  isWishlisted ? "fill-rose-500 text-rose-500 scale-110" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* AI Inspection tag if verified */}
        {listing.aiInspection && (
          <div className="absolute bottom-2.5 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/90 text-indigo-300 border border-indigo-500/30 backdrop-blur-xs shadow-md">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              AI Verified: {listing.aiInspection.inspectionScore}%
            </span>
          </div>
        )}

        {/* Quick Zoom Trigger Button */}
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
          className="absolute bottom-2.5 right-3 z-10 px-2 py-1 rounded-lg bg-slate-900/90 hover:bg-slate-800 text-white backdrop-blur-md text-[10px] font-bold flex items-center gap-1 border border-slate-700 opacity-90 hover:opacity-100 transition-all hover:scale-105 shadow-sm"
        >
          <ZoomIn className="w-3.5 h-3.5 text-indigo-400" />
          <span>Zoom</span>
        </button>

        {/* Status overlay if not available */}
        {listing.status !== "available" && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center">
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
                : listing.status === "inactive"
                ? "Inactive (Expired 30d)"
                : "Sold / Exchanged"}
            </span>
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className={`flex items-center justify-between text-xs mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            <span className="flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3 text-indigo-400" />
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
                <span className={`flex items-center gap-0.5 truncate max-w-[110px] ${isDark ? "text-slate-400" : "text-slate-500"}`} title={listing.locationPreference}>
                  <MapPin className="w-3 h-3 text-rose-400 shrink-0" />
                  {listing.locationPreference}
                </span>
              )}
            </div>
          </div>

          <h3
            onClick={() => onOpenDetails(listing)}
            className={`text-sm font-bold transition-colors line-clamp-2 cursor-pointer leading-snug ${
              isDark ? "text-white hover:text-indigo-300" : "text-slate-900 hover:text-indigo-600"
            }`}
          >
            {listing.title}
          </h3>

          <p className={`text-xs line-clamp-2 mt-1 leading-relaxed ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {listing.description}
          </p>

          {/* Tags Chips */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {listing.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold transition-colors ${
                    isDark
                      ? "bg-slate-900/80 text-slate-300 border border-slate-700/60 group-hover:border-indigo-500/40 group-hover:text-indigo-300"
                      : "bg-slate-100 text-slate-700 border border-slate-200 group-hover:border-indigo-400 group-hover:text-indigo-700"
                  }`}
                >
                  #{tag}
                </span>
              ))}
              {listing.tags.length > 3 && (
                <span className={`text-[10px] font-medium ${isDark ? "text-slate-500" : "text-slate-400"}`}>
                  +{listing.tags.length - 3}
                </span>
              )}
            </div>
          )}
          {/* Star Rating & Review Summary */}
          <div
            id={`listing-rating-summary-${listing.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(listing);
            }}
            className={`mt-2.5 flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg border transition-colors cursor-pointer group/rating ${
              isDark
                ? "bg-slate-900/60 hover:bg-slate-900/90 border-slate-700/60 hover:border-indigo-500/40"
                : "bg-slate-50 hover:bg-slate-100/90 border-slate-200/80 hover:border-indigo-400"
            }`}
            title={
              reviewCount > 0
                ? `${rating.toFixed(1)} ★ based on ${reviewCount} student handovers • Click to view reviews`
                : "No reviews yet • Click to view details and leave feedback after handover"
            }
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
                  <span className={`text-[11px] transition-colors ${isDark ? "text-slate-400 group-hover/rating:text-indigo-300" : "text-slate-500 group-hover/rating:text-indigo-600"}`}>
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Star className="w-3.5 h-3.5 text-slate-400" />
                  <span>No reviews yet</span>
                </div>
              )}
            </div>

            <span className={`text-[10px] font-semibold transition-colors flex items-center gap-0.5 ${isDark ? "text-slate-400 group-hover/rating:text-indigo-300" : "text-slate-500 group-hover/rating:text-indigo-600"}`}>
              {reviewCount > 0 ? (
                <>
                  <span>Handover Verified</span>
                  <span className="text-emerald-500 font-bold">✓</span>
                </>
              ) : (
                <span>Review after meetup</span>
              )}
            </span>
          </div>
        </div>

        <div className={`pt-2 border-t space-y-3 ${isDark ? "border-slate-700/60" : "border-slate-200"}`}>
          {/* Price & Seller Row */}
          <div className="flex items-center justify-between">
            <div>
              {listing.listingType === "exchange" ? (
                <div className="text-sm font-bold text-purple-400">
                  Open for Exchange
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}>₹</span>
                  <span className={`text-lg font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                    {listing.price}
                  </span>
                  {listing.listingType === "both" && (
                    <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>or Swap</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-right">
              <div className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                {listing.sellerName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className={`text-xs font-semibold truncate max-w-[80px] ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {listing.sellerName.split(" ")[0]}
                  </span>
                  <span
                    id={`seller-verified-student-badge-${listing.id}`}
                    className="badge-shimmer-hover relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/15 text-blue-500 dark:text-blue-300 border border-blue-500/30 overflow-hidden select-none transition-colors"
                    title="Verified Student Seller • Campus Authenticated"
                  >
                    <span className="animate-shimmer-hover" aria-hidden="true" />
                    <BadgeCheck className="w-2.5 h-2.5 text-blue-500 dark:text-blue-400 shrink-0" />
                    <span>Verified</span>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 -mt-0.5">
                  <span className={`text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {listing.department?.split(" ")[0] || "Student"}
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
          <div className="grid grid-cols-4 gap-1.5">
            <button
              id={`listing-details-btn-${listing.id}`}
              onClick={() => onOpenDetails(listing)}
              className={`px-2 py-1.5 rounded-xl border text-xs font-semibold transition-colors text-center cursor-pointer ${
                isDark
                  ? "border-slate-700 bg-slate-900/60 hover:bg-slate-700 text-slate-200"
                  : "border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700"
              }`}
            >
              Details
            </button>
            <button
              id={`listing-chat-btn-${listing.id}`}
              onClick={() => {
                if (!isOnline) {
                  onShowToast?.("⚠️ Chat is disabled while offline to prevent data loss.");
                  return;
                }
                onOpenChat(listing);
              }}
              disabled={!isOnline}
              title={
                !isOnline
                  ? "Chat is disabled while offline to prevent data loss"
                  : "Chat & negotiate with student seller"
              }
              className={`inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl text-xs font-semibold transition-colors select-none ${
                !isOnline
                  ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed opacity-60"
                  : "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30 cursor-pointer"
              }`}
            >
              {!isOnline ? (
                <WifiOff className="w-3.5 h-3.5 shrink-0 text-slate-500" />
              ) : (
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>Chat</span>
            </button>
            <button
              id={`listing-meet-btn-${listing.id}`}
              onClick={() => onOpenCalendar(listing)}
              className="inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 text-blue-600 dark:text-blue-300 border border-blue-500/30 text-xs font-semibold transition-colors cursor-pointer"
              title="Schedule Handover on Google Calendar"
            >
              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Meet</span>
            </button>
            <button
              id={`listing-share-btn-${listing.id}`}
              type="button"
              onClick={handleShare}
              className={`inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isShared
                  ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border border-emerald-500/30"
                  : isDark
                  ? "bg-slate-900/60 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700"
                  : "bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 border border-slate-200"
              }`}
              title="Share listing via Web Share"
            >
              {isShared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-[11px] font-bold">Shared</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-[11px]">Share</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
