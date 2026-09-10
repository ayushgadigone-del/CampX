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

interface ListingCardProps {
  listing: Listing;
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
  isWishlisted = false,
  onToggleWishlist,
  onOpenDetails,
  onOpenChat,
  onOpenCalendar,
  onShowToast,
  onOpenLightbox,
  isOnline = true,
}) => {
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
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Good":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Fair":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-rose-100 text-rose-800 border-rose-200";
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
      className="group relative flex flex-col rounded-2xl bg-white border border-slate-200 shadow-xs hover:shadow-xl hover:border-slate-300 transition-all duration-300 overflow-hidden h-full"
    >
      {/* Image Container with Lightbox Trigger */}
      <div
        className="relative h-48 w-full bg-slate-100 cursor-pointer overflow-hidden group/image"
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
        <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none flex items-center justify-center">
          <span className="px-3 py-1.5 rounded-full bg-slate-900/85 text-white backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5 shadow-lg transform -translate-y-1 group-hover:translate-y-0 transition-transform duration-200 border border-white/10">
            <ZoomIn className="w-3.5 h-3.5 text-indigo-300" />
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
            className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
              isShared
                ? "bg-emerald-600 text-white scale-105 shadow-md ring-2 ring-emerald-300"
                : "bg-black/40 text-white hover:bg-white hover:text-indigo-600 hover:scale-110"
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
              className={`p-2 rounded-full backdrop-blur-md transition-all duration-200 shadow-sm ${
                isWishlisted
                  ? "bg-white text-rose-500 hover:bg-rose-50 ring-2 ring-rose-300 scale-105 shadow-md"
                  : "bg-black/40 text-white hover:bg-white hover:text-rose-500 hover:scale-110"
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
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/85 text-indigo-300 border border-indigo-500/30 backdrop-blur-xs shadow-md">
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
          className="absolute bottom-2.5 right-3 z-10 px-2 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-white backdrop-blur-md text-[10px] font-bold flex items-center gap-1 border border-white/10 opacity-90 hover:opacity-100 transition-all hover:scale-105 shadow-sm"
        >
          <ZoomIn className="w-3 h-3 text-indigo-300" />
          <span>Zoom</span>
        </button>

        {/* Status overlay if not available */}
        {listing.status !== "available" && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center">
            <span
              className={`px-3 py-1 rounded-xl text-white font-bold text-xs uppercase tracking-wider shadow-lg ${
                listing.status === "inactive"
                  ? "bg-slate-700 border border-slate-500"
                  : "bg-amber-500"
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
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="flex items-center gap-1 font-medium">
              <Tag className="w-3 h-3 text-indigo-600" />
              {listing.category}
            </span>
            <div className="flex items-center gap-2">
              {listing.expiryDate && (
                <span
                  className={`flex items-center gap-1 text-[10px] font-medium ${
                    listing.status === "inactive"
                      ? "text-slate-400 line-through"
                      : "text-slate-500"
                  }`}
                  title={`Listing validity: ${new Date(listing.expiryDate).toLocaleDateString()}`}
                >
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{formatExpiryInfo(listing).label}</span>
                </span>
              )}
              {listing.locationPreference && (
                <span className="flex items-center gap-0.5 text-slate-500 truncate max-w-[110px]" title={listing.locationPreference}>
                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                  {listing.locationPreference}
                </span>
              )}
            </div>
          </div>

          <h3
            onClick={() => onOpenDetails(listing)}
            className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {listing.title}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {listing.description}
          </p>

          {/* Tags Chips */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 mt-2">
              {listing.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-700 transition-colors"
                >
                  #{tag}
                </span>
              ))}
              {listing.tags.length > 3 && (
                <span className="text-[10px] font-medium text-slate-400">
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
            className="mt-2.5 flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-50 hover:bg-indigo-50/70 border border-slate-200/80 hover:border-indigo-200 transition-colors cursor-pointer group/rating"
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
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                    <span className="text-xs font-bold text-slate-900">
                      {rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 group-hover/rating:text-indigo-600 transition-colors">
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </>
              ) : (
                <div className="flex items-center gap-1 text-[11px] text-slate-400">
                  <Star className="w-3.5 h-3.5 text-slate-300" />
                  <span>No reviews yet</span>
                </div>
              )}
            </div>

            <span className="text-[10px] font-semibold text-slate-500 group-hover/rating:text-indigo-600 transition-colors flex items-center gap-0.5">
              {reviewCount > 0 ? (
                <>
                  <span>Handover Verified</span>
                  <span className="text-emerald-600 font-bold">✓</span>
                </>
              ) : (
                <span>Review after meetup</span>
              )}
            </span>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 space-y-3">
          {/* Price & Seller Row */}
          <div className="flex items-center justify-between">
            <div>
              {listing.listingType === "exchange" ? (
                <div className="text-sm font-bold text-purple-700">
                  Open for Exchange
                </div>
              ) : (
                <div className="flex items-baseline gap-1">
                  <span className="text-xs font-semibold text-slate-500">₹</span>
                  <span className="text-lg font-extrabold text-slate-950">
                    {listing.price}
                  </span>
                  {listing.listingType === "both" && (
                    <span className="text-[10px] text-slate-400">or Swap</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-right">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px] shrink-0">
                {listing.sellerName.charAt(0)}
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <span className="text-xs font-semibold text-slate-700 truncate max-w-[80px]">
                    {listing.sellerName.split(" ")[0]}
                  </span>
                  <span
                    id={`seller-verified-student-badge-${listing.id}`}
                    className="badge-shimmer-hover relative inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200/90 overflow-hidden select-none transition-colors group-hover:bg-blue-100/80 group-hover:border-blue-300"
                    title="Verified Student Seller • Campus Authenticated"
                  >
                    <span className="animate-shimmer-hover" aria-hidden="true" />
                    <BadgeCheck className="w-2.5 h-2.5 text-blue-600 shrink-0" />
                    <span>Verified</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 -mt-0.5">
                  <span className="text-[10px] text-slate-400">
                    {listing.department?.split(" ")[0] || "Student"}
                  </span>
                  {listing.sellerRating ? (
                    <span
                      className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200/80 flex items-center gap-0.5"
                      title={`Seller Rating: ${listing.sellerRating.toFixed(1)} ★`}
                    >
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                      <span>{listing.sellerRating.toFixed(1)}</span>
                    </span>
                  ) : rating > 0 ? (
                    <span
                      className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1 rounded border border-amber-200/80 flex items-center gap-0.5"
                      title={`Handover Rating: ${rating.toFixed(1)} ★`}
                    >
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-500" />
                      <span>{rating.toFixed(1)}</span>
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-1.5">
            <button
              id={`listing-details-btn-${listing.id}`}
              onClick={() => onOpenDetails(listing)}
              className="px-2 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors text-center"
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
                  ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer"
              }`}
            >
              {!isOnline ? (
                <WifiOff className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              ) : (
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              )}
              <span>Chat</span>
            </button>
            <button
              id={`listing-meet-btn-${listing.id}`}
              onClick={() => onOpenCalendar(listing)}
              className="inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors"
              title="Schedule Handover on Google Calendar"
            >
              <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
              <span>Meet</span>
            </button>
            <button
              id={`listing-share-btn-${listing.id}`}
              type="button"
              onClick={handleShare}
              className={`inline-flex items-center justify-center gap-1 px-1.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                isShared
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 hover:text-slate-900 border border-transparent"
              }`}
              title="Share listing via Web Share"
            >
              {isShared ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] font-bold">Shared</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
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
