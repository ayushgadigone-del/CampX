import React, { useState } from "react";
import {
  MapPin,
  MessageCircle,
  Calendar as CalendarIcon,
  Heart,
  Share2,
  Check,
  Repeat,
  ArrowRight,
  CheckCircle2,
  Clock,
  Package,
} from "lucide-react";
import { Listing } from "../types";
import { formatExpiryInfo } from "../utils/expiryUtils";
import { useTheme } from "../context/ThemeContext";

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
  onOpenBarter?: (listing: Listing) => void;
  isOnline?: boolean;
  layoutMode?: "grid" | "detailed";
  isFullScreen?: boolean;
  onTagClick?: (tag: string) => void;
  index?: number;
  isOwner?: boolean;
  onUpdateStatus?: (listingId: string, newStatus: Listing["status"]) => void;
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
  onOpenBarter,
  isOnline = true,
  layoutMode = "grid",
  isOwner = false,
  onUpdateStatus,
}) => {
  const { isDark } = useTheme();
  const [isShared, setIsShared] = useState(false);

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
      onShowToast?.("Listing link copied to clipboard.");
    } catch {
      onShowToast?.("Could not copy link.");
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();

    const priceText =
      listing.listingType === "exchange"
        ? "Available for Exchange"
        : listing.listingType === "both"
        ? `₹${listing.price} (or Swap)`
        : `₹${listing.price}`;

    const locationText = listing.locationPreference
      ? ` Handover: ${listing.locationPreference}.`
      : "";

    const customMessage = `Check out "${listing.title}" on Campus Resale for ${priceText} (${listing.condition}) by ${listing.sellerName}.${locationText}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?item=${listing.id}#listing-${listing.id}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${listing.title} | Campus Resale`,
          text: customMessage,
          url: shareUrl,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2500);
        onShowToast?.("Shared listing.");
      } catch (err: any) {
        if (err.name !== "AbortError") {
          await fallbackCopy(shareUrl, customMessage);
        }
      }
    } else {
      await fallbackCopy(shareUrl, customMessage);
    }
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (listing.status === "completed") {
      onOpenDetails(listing);
      return;
    }
    if (!isOnline) {
      onShowToast?.("Chat is unavailable while offline.");
      return;
    }
    onOpenChat(
      listing,
      `Hi ${listing.sellerName.split(" ")[0]}, is "${listing.title}" still available for handover on campus?`
    );
  };

  const stockCount = listing.availableStock ?? 1;
  const isSoldOut = stockCount === 0 || listing.status === "completed";
  const hasDiscount =
    listing.listingType !== "exchange" &&
    Boolean(listing.originalPrice && listing.originalPrice > listing.price);

  /* ========================================================================= */
  /* DETAILED / LIST VIEW CARD                                                 */
  /* ========================================================================= */
  if (layoutMode === "detailed") {
    return (
      <article
        id={`listing-card-${listing.id}`}
        className={`flex flex-col md:flex-row rounded-xl border overflow-hidden h-full ${
          isDark
            ? "bg-[#141A18] border-[#242E2A] hover:border-[#34433D]"
            : "bg-white border-[#DFE6E2] hover:border-[#C4D1CA]"
        }`}
      >
        {/* Left Image */}
        <div
          className={`relative md:w-64 lg:w-72 shrink-0 aspect-[4/3] md:aspect-auto cursor-pointer overflow-hidden ${
            isDark ? "bg-[#1B2320]" : "bg-[#EFF4F1]"
          }`}
          onClick={() => (onOpenLightbox ? onOpenLightbox(listing) : onOpenDetails(listing))}
        >
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          {/* Top-right subtle icon actions */}
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 z-10">
            <button
              id={`listing-quick-share-${listing.id}`}
              type="button"
              aria-label="Share listing"
              onClick={handleShare}
              className={`w-8 h-8 rounded-full border flex items-center justify-center cursor-pointer ${
                isShared
                  ? "bg-zinc-900 text-white border-zinc-800"
                  : "bg-white/95 dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800"
              }`}
            >
              {isShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            </button>
            {onToggleWishlist && (
              <button
                id={`wishlist-toggle-${listing.id}`}
                type="button"
                aria-label={isWishlisted ? "Remove from saved" : "Save item"}
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleWishlist(listing.id);
                }}
                className="w-8 h-8 rounded-full border bg-white/95 dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer"
              >
                <Heart
                  className={`w-3.5 h-3.5 ${
                    isWishlisted ? "fill-rose-500 text-rose-500" : ""
                  }`}
                />
              </button>
            )}
          </div>

          {listing.status !== "available" && (
            <div className="absolute inset-0 bg-black/65 flex items-center justify-center p-3 z-10">
              <span className="text-xs font-semibold text-white tracking-wide uppercase">
                {listing.status === "completed"
                  ? "Sold"
                  : listing.status === "reserved"
                  ? "Reserved"
                  : listing.status === "handover_scheduled"
                  ? "Meetup Scheduled"
                  : "Inactive"}
              </span>
            </div>
          )}
        </div>

        {/* Right Info */}
        <div className="flex-1 p-5 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            {/* Unboxed Metadata Line */}
            <div
              className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-xs ${
                isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
            >
              <span>{listing.category}</span>
              <span aria-hidden="true">·</span>
              <span>{listing.condition}</span>
              {listing.locationPreference && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.locationPreference}
                  </span>
                </>
              )}
              {listing.aiInspection && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">
                    AI {listing.aiInspection.inspectionScore}%
                  </span>
                </>
              )}
              {listing.expiryDate && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatExpiryInfo(listing).label}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h3
              onClick={() => onOpenDetails(listing)}
              className={`text-base sm:text-lg font-semibold leading-snug cursor-pointer hover:underline underline-offset-4 ${
                isDark ? "text-zinc-50" : "text-zinc-950"
              }`}
            >
              {listing.title}
            </h3>

            {/* Description */}
            <p
              className={`text-xs sm:text-sm leading-relaxed line-clamp-3 ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              {listing.description}
            </p>

            {/* Semester Bundle Items Preview */}
            {listing.isBundle && listing.bundleItems && listing.bundleItems.length > 0 && (
              <div
                className={`p-2.5 rounded-lg border text-xs space-y-1 ${
                  isDark
                    ? "bg-[#0D1110] border-[#242E2A] text-[#C5D2CC]"
                    : "bg-[#F7F9F8] border-[#DFE6E2] text-[#3B4A42]"
                }`}
              >
                <div className="font-semibold text-[#2F5D50] dark:text-[#7BBFA8] flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 shrink-0" />
                  <span>Semester Bundle · {listing.bundleItems.length} items included</span>
                </div>
                <p className="text-[11px] text-[#5C6B63] dark:text-[#8FA199] truncate">
                  {listing.bundleItems.join(" · ")}
                </p>
              </div>
            )}

            {listing.exchangeFor && (
              <div
                className={`text-xs flex items-center gap-1.5 ${
                  isDark ? "text-[#C5D2CC]" : "text-[#3B4A42]"
                }`}
              >
                <Repeat className="w-3.5 h-3.5 text-[#5C6B63] shrink-0" />
                <span className="truncate">Open to swap for: {listing.exchangeFor}</span>
              </div>
            )}
          </div>

          {/* Footer: Seller, Price, Actions */}
          <div
            className={`pt-4 border-t flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDark ? "border-zinc-800/80" : "border-zinc-100"
            }`}
          >
            {/* Plain Seller Info (No badges) */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                  isDark ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-800"
                }`}
              >
                {listing.sellerName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <div
                  className={`text-xs font-medium truncate ${
                    isDark ? "text-zinc-200" : "text-zinc-900"
                  }`}
                >
                  {listing.sellerName}
                </div>
                <div
                  className={`text-[11px] truncate ${
                    isDark ? "text-zinc-500" : "text-zinc-500"
                  }`}
                >
                  {[listing.department || "Engineering", listing.year]
                    .filter(Boolean)
                    .join(" · ")}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4">
              {/* Price */}
              <div className="text-left sm:text-right">
                {listing.listingType === "exchange" ? (
                  <div
                    className={`text-sm font-semibold ${
                      isDark ? "text-zinc-100" : "text-zinc-950"
                    }`}
                  >
                    Exchange
                  </div>
                ) : (
                  <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                    <span
                      className={`text-lg font-semibold ${
                        isDark ? "text-zinc-50" : "text-zinc-950"
                      }`}
                    >
                      ₹{listing.price}
                    </span>
                    {hasDiscount && (
                      <span className="text-xs line-through text-zinc-400">
                        ₹{listing.originalPrice}
                      </span>
                    )}
                    {listing.listingType === "both" && (
                      <span className="text-[11px] font-sans text-zinc-500">· Swap</span>
                    )}
                  </div>
                )}
                <div className="text-[11px] text-zinc-500">
                  {isSoldOut ? "Sold out" : `${stockCount} available`}
                </div>
              </div>

              {/* Clean Actions */}
              <div className="flex items-center gap-1.5 shrink-0">
                {isOwner && onUpdateStatus ? (
                  <div className="flex items-center gap-1">
                    {(
                      [
                        { key: "available", label: "Available" },
                        { key: "reserved", label: "Reserved" },
                        { key: "completed", label: "Sold" },
                      ] as const
                    ).map((st) => {
                      const active = listing.status === st.key;
                      return (
                        <button
                          key={st.key}
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onUpdateStatus(listing.id, st.key);
                          }}
                          className={`h-8 px-2.5 rounded-lg border text-xs font-medium cursor-pointer ${
                            active
                              ? "bg-[#2F5D50] dark:bg-[#387262] text-white border-[#2F5D50] dark:border-[#387262]"
                              : isDark
                              ? "bg-[#0D1110] border-[#242E2A] text-[#8FA199] hover:text-[#ECF2EF]"
                              : "bg-white border-[#DFE6E2] text-[#5C6B63] hover:text-[#18201C]"
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <>
                    <button
                      id={`listing-details-btn-${listing.id}`}
                      type="button"
                      onClick={() => onOpenDetails(listing)}
                      className={`h-8 px-3 rounded-lg border text-xs font-medium cursor-pointer ${
                        isDark
                          ? "border-[#242E2A] text-[#ECF2EF] hover:bg-[#1B2320]"
                          : "border-[#DFE6E2] text-[#18201C] hover:bg-[#EFF4F1]"
                      }`}
                    >
                      Details
                    </button>
                    <button
                      id={`listing-meet-btn-${listing.id}`}
                      type="button"
                      onClick={() => onOpenCalendar(listing)}
                      title="Schedule campus handover"
                      className={`h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer ${
                        isDark
                          ? "border-[#242E2A] text-[#8FA199] hover:bg-[#1B2320] hover:text-[#ECF2EF]"
                          : "border-[#DFE6E2] text-[#5C6B63] hover:bg-[#EFF4F1] hover:text-[#18201C]"
                      }`}
                    >
                      <CalendarIcon className="w-3.5 h-3.5" />
                    </button>
                    <button
                      id={`listing-chat-btn-${listing.id}`}
                      type="button"
                      onClick={handleChatClick}
                      disabled={!isOnline && listing.status !== "completed"}
                      className={`h-8 px-3 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                        isDark
                          ? "bg-[#387262] hover:bg-[#448573] text-white"
                          : "bg-[#2F5D50] hover:bg-[#244A3F] text-white"
                      }`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Chat</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </article>
    );
  }

  /* ========================================================================= */
  /* MINIMALIST GRID CARD (CLEAN PHOTO, ZERO BADGE CLUTTER)                    */
  /* ========================================================================= */
  return (
    <article
      id={`listing-card-${listing.id}`}
      className={`flex flex-col rounded-xl border overflow-hidden h-full ${
        isDark
          ? "bg-[#141A18] border-[#242E2A] hover:border-[#34433D]"
          : "bg-white border-[#DFE6E2] hover:border-[#C4D1CA]"
      }`}
    >
      {/* Clean 4:3 Product Photo (No badge spam) */}
      <div
        className={`relative aspect-[4/3] w-full cursor-pointer overflow-hidden ${
          isDark ? "bg-[#1B2320]" : "bg-[#EFF4F1]"
        }`}
        onClick={() => onOpenDetails(listing)}
      >
        <img
          src={listing.imageUrl}
          alt={listing.title}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />

        {/* Minimal Floating Wishlist & Share */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <button
            id={`listing-quick-share-${listing.id}`}
            type="button"
            aria-label="Share listing"
            title="Share listing"
            onClick={handleShare}
            className="w-8 h-8 rounded-full border bg-white/95 dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer"
          >
            {isShared ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
          </button>

          {onToggleWishlist && (
            <button
              id={`wishlist-toggle-${listing.id}`}
              type="button"
              aria-label={isWishlisted ? "Remove from saved" : "Save item"}
              title={isWishlisted ? "Remove from saved" : "Save item"}
              onClick={(e) => {
                e.stopPropagation();
                onToggleWishlist(listing.id);
              }}
              className="w-8 h-8 rounded-full border bg-white/95 dark:bg-zinc-950/90 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-800 flex items-center justify-center cursor-pointer"
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  isWishlisted ? "fill-rose-500 text-rose-500" : ""
                }`}
              />
            </button>
          )}
        </div>

        {/* Status Overlay only when unavailable */}
        {listing.status !== "available" && (
          <div className="absolute inset-0 bg-black/65 flex flex-col items-center justify-center p-4 text-center z-20">
            {listing.status === "completed" ? (
              <div className="flex items-center gap-1.5 text-white text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Sold</span>
              </div>
            ) : (
              <span className="text-xs font-semibold text-white uppercase tracking-wider">
                {listing.status === "reserved"
                  ? "Reserved"
                  : listing.status === "handover_scheduled"
                  ? "Handover Scheduled"
                  : "Inactive"}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Airy Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-1.5">
          {/* Quiet Unboxed Metadata */}
          <div
            className={`flex items-center gap-1.5 text-[11px] truncate ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          >
            {listing.isBundle ? (
              <span className="font-semibold text-[#2F5D50] dark:text-[#7BBFA8] shrink-0">
                Bundle ({listing.bundleItems?.length || 2} items)
              </span>
            ) : (
              <span className="truncate">{listing.category}</span>
            )}
            <span aria-hidden="true">·</span>
            <span className="shrink-0">{listing.condition}</span>
            {listing.aiInspection && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums shrink-0">
                  AI {listing.aiInspection.inspectionScore}%
                </span>
              </>
            )}
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onOpenDetails(listing)}
            className={`text-[15px] font-semibold leading-snug line-clamp-2 cursor-pointer hover:underline underline-offset-4 ${
              isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
            }`}
          >
            {listing.title}
          </h3>

          {/* Price Row */}
          <div className="pt-1 flex items-baseline justify-between gap-2">
            {listing.listingType === "exchange" ? (
              <span
                className={`text-sm font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Open to Exchange
              </span>
            ) : (
              <div className="flex items-baseline gap-1.5 font-mono tabular-nums">
                <span
                  className={`text-base font-semibold ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  ₹{listing.price}
                </span>
                {hasDiscount && (
                  <span className="text-xs line-through text-[#83928A]">
                    ₹{listing.originalPrice}
                  </span>
                )}
                {listing.listingType === "both" && (
                  <span className="text-[11px] font-sans text-[#5C6B63] dark:text-[#8FA199]">· Swap</span>
                )}
              </div>
            )}

            <span
              className={`text-[11px] tabular-nums shrink-0 ${
                isSoldOut
                  ? "text-[#83928A]"
                  : isDark
                  ? "text-[#8FA199]"
                  : "text-[#5C6B63]"
              }`}
            >
              {isSoldOut ? "Sold out" : `${stockCount} left`}
            </span>
          </div>

          {/* Location */}
          {listing.locationPreference && (
            <div
              className={`flex items-center gap-1 text-[11px] truncate pt-0.5 ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              <MapPin className="w-3 h-3 shrink-0" />
              <span className="truncate">{listing.locationPreference}</span>
            </div>
          )}
        </div>

        {/* Footer: Plain Seller & Actions */}
        <div
          className={`pt-3 border-t space-y-2.5 ${
            isDark ? "border-[#242E2A]" : "border-[#EFF4F1]"
          }`}
        >
          {/* Seller row — plain name, zero student badges */}
          <div className="flex items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-semibold shrink-0 ${
                  isDark ? "bg-[#1B2320] text-[#ECF2EF]" : "bg-[#EFF4F1] text-[#18201C]"
                }`}
              >
                {listing.sellerName.charAt(0).toUpperCase()}
              </div>
              <span
                className={`font-medium truncate ${
                  isDark ? "text-[#C5D2CC]" : "text-[#3B4A42]"
                }`}
              >
                {listing.sellerName}
              </span>
            </div>

            {listing.year && (
              <span className="text-[#83928A] shrink-0 truncate max-w-[90px]">
                {listing.year}
              </span>
            )}
          </div>

          {/* Minimal Action Row (or One-Tap Seller Status Controls if Owner) */}
          {isOwner && onUpdateStatus ? (
            <div className="grid grid-cols-3 gap-1">
              {(
                [
                  { key: "available", label: "Available" },
                  { key: "reserved", label: "Reserved" },
                  { key: "completed", label: "Sold" },
                ] as const
              ).map((st) => {
                const active = listing.status === st.key;
                return (
                  <button
                    key={st.key}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus(listing.id, st.key);
                    }}
                    className={`h-8 rounded-lg border text-[11px] font-semibold cursor-pointer ${
                      active
                        ? "bg-[#2F5D50] dark:bg-[#387262] text-white border-[#2F5D50] dark:border-[#387262]"
                        : isDark
                        ? "bg-[#0D1110] border-[#242E2A] text-[#8FA199] hover:text-[#ECF2EF]"
                        : "bg-white border-[#DFE6E2] text-[#5C6B63] hover:text-[#18201C]"
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <button
                id={`listing-chat-btn-${listing.id}`}
                type="button"
                onClick={handleChatClick}
                disabled={!isOnline && listing.status !== "completed"}
                className={`flex-1 h-8 px-2.5 rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                  isDark
                    ? "bg-[#387262] hover:bg-[#448573] text-white"
                    : "bg-[#2F5D50] hover:bg-[#244A3F] text-white"
                }`}
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>{listing.status === "completed" ? "View" : "Chat"}</span>
              </button>

              {listing.listingType !== "sell" && onOpenBarter && listing.status === "available" && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenBarter(listing);
                  }}
                  title="Propose a barter swap"
                  className={`h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1 cursor-pointer ${
                    isDark
                      ? "border-[#242E2A] text-[#ECF2EF] hover:bg-[#1B2320]"
                      : "border-[#DFE6E2] text-[#18201C] hover:bg-[#EFF4F1]"
                  }`}
                >
                  <Repeat className="w-3.5 h-3.5" />
                  <span>Swap</span>
                </button>
              )}

              <button
                id={`listing-meet-btn-${listing.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenCalendar(listing);
                }}
                aria-label="Schedule handover"
                title="Schedule handover"
                className={`h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer shrink-0 ${
                  isDark
                    ? "border-[#242E2A] text-[#8FA199] hover:bg-[#1B2320] hover:text-[#ECF2EF]"
                    : "border-[#DFE6E2] text-[#5C6B63] hover:bg-[#EFF4F1] hover:text-[#18201C]"
                }`}
              >
                <CalendarIcon className="w-3.5 h-3.5" />
              </button>

              <button
                id={`listing-details-btn-${listing.id}`}
                type="button"
                onClick={() => onOpenDetails(listing)}
                aria-label="View item details"
                title="View details"
                className={`h-8 w-8 rounded-lg border flex items-center justify-center cursor-pointer shrink-0 ${
                  isDark
                    ? "border-[#242E2A] text-[#8FA199] hover:bg-[#1B2320] hover:text-[#ECF2EF]"
                    : "border-[#DFE6E2] text-[#5C6B63] hover:bg-[#EFF4F1] hover:text-[#18201C]"
                }`}
              >
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
};
