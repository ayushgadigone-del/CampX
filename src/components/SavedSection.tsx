import React from "react";
import {
  Heart,
  Bell,
  History,
  Trash2,
  Package,
  ArrowRight,
} from "lucide-react";
import { Listing, AlertSubscription, AlertMatchEvent } from "../types";
import { useTheme } from "../context/ThemeContext";
import { ListingCard } from "./ListingCard";
import { triggerHaptic } from "../utils/haptics";

interface SavedSectionProps {
  wishlistListings: Listing[];
  allListings: Listing[];
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onClearWishlist: () => void;
  onOpenDetails: (item: Listing) => void;
  onOpenLightbox?: (item: Listing) => void;
  onOpenChat: (item: Listing) => void;
  onOpenCalendar: (item: Listing) => void;
  onShowToast: (msg: string) => void;
  alerts: AlertSubscription[];
  alertHistory: AlertMatchEvent[];
  onOpenAlertsModal: () => void;
  recentlyViewed: Listing[];
  onClearRecentlyViewed: () => void;
  isOnline?: boolean;
}

export const SavedSection: React.FC<SavedSectionProps> = ({
  wishlistListings,
  allListings,
  onToggleWishlist,
  onClearWishlist,
  onOpenDetails,
  onOpenLightbox,
  onOpenChat,
  onOpenCalendar,
  onShowToast,
  alerts,
  onOpenAlertsModal,
  recentlyViewed,
  onClearRecentlyViewed,
  isOnline = true,
}) => {
  const { isDark } = useTheme();

  return (
    <div id="saved-section-container" className="w-full space-y-8">
      {/* 1. Wishlist Collection */}
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3 px-1">
          <div className="space-y-0.5 text-left">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
              }`}
            >
              BOOKMARKED ITEMS
            </p>
            <h3
              className={`text-lg sm:text-xl font-normal tracking-tight flex items-center gap-2 ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              <span>Saved Wishlist</span>
              <span
                className={`text-xs font-mono ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                ({wishlistListings.length})
              </span>
            </h3>
          </div>

          {wishlistListings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic("warning");
                onClearWishlist();
              }}
              className={`text-xs font-semibold hover:underline flex items-center gap-1 cursor-pointer ${
                isDark ? "text-[#E58989]" : "text-[#A63A3A]"
              }`}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Wishlist</span>
            </button>
          )}
        </div>

        {wishlistListings.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {wishlistListings.map((listing, index) => (
              <ListingCard
                key={listing.id}
                index={index}
                listing={listing}
                allListings={allListings}
                isWishlisted={true}
                onToggleWishlist={onToggleWishlist}
                onOpenDetails={onOpenDetails}
                onOpenLightbox={onOpenLightbox}
                onOpenChat={onOpenChat}
                onOpenCalendar={onOpenCalendar}
                onShowToast={onShowToast}
                isOnline={isOnline}
              />
            ))}
          </div>
        ) : (
          <div
            className={`p-8 text-center rounded-2xl border space-y-2 ${
              isDark
                ? "bg-[#141A18] border-[#242E2A]"
                : "bg-white border-[#DFE6E2]"
            }`}
          >
            <Heart
              className={`w-7 h-7 mx-auto ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            />
            <h4
              className={`text-sm font-semibold ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Your Wishlist is Empty
            </h4>
            <p
              className={`text-xs max-w-sm mx-auto ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Tap the heart icon on any campus listing to bookmark items for price drops and quick comparison.
            </p>
          </div>
        )}
      </div>

      {/* 2. Active Alert Subscriptions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg ${
                isDark
                  ? "bg-[#182823] text-[#7BBFA8]"
                  : "bg-[#EFF4F1] text-[#2F5D50]"
              }`}
            >
              <Bell className="w-4 h-4" />
            </span>
            <h3
              className={`text-sm sm:text-base font-semibold ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Notify Me Alerts ({alerts.filter((a) => a.active).length} Active)
            </h3>
          </div>

          <button
            type="button"
            onClick={onOpenAlertsModal}
            className={`h-8 px-3 rounded-lg border text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5 ${
              isDark
                ? "bg-[#141A18] hover:bg-[#1B2320] text-[#ECF2EF] border-[#242E2A]"
                : "bg-white hover:bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2]"
            }`}
          >
            <span>Manage Alerts</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              onClick={onOpenAlertsModal}
              className={`p-4 rounded-xl border text-xs space-y-1.5 cursor-pointer text-left ${
                isDark
                  ? "bg-[#141A18] hover:bg-[#19211E] border-[#242E2A]"
                  : "bg-white hover:bg-[#F9FBFA] border-[#DFE6E2]"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`font-semibold truncate ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  {alert.keyword || alert.category || "Any Item"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                    alert.active
                      ? isDark
                        ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                        : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                      : isDark
                      ? "bg-[#1B2320] text-[#8FA199] border-[#242E2A]"
                      : "bg-[#F3F5F2] text-[#5C6B63] border-[#DFE6E2]"
                  }`}
                >
                  {alert.active ? "Active" : "Paused"}
                </span>
              </div>
              <div
                className={`flex items-center justify-between text-[11px] ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                <span>Category: {alert.category}</span>
                {alert.maxPrice ? (
                  <span className="font-mono font-semibold">
                    Max: ₹{alert.maxPrice}
                  </span>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Recently Viewed Items */}
      {recentlyViewed.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3 px-1">
            <div className="flex items-center gap-2">
              <span
                className={`p-1.5 rounded-lg ${
                  isDark
                    ? "bg-[#1B2320] text-[#7BBFA8]"
                    : "bg-[#EFF4F1] text-[#2F5D50]"
                }`}
              >
                <History className="w-4 h-4" />
              </span>
              <h3
                className={`text-sm sm:text-base font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Recently Viewed ({recentlyViewed.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={onClearRecentlyViewed}
              className={`text-xs font-medium hover:underline cursor-pointer ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF]"
                  : "text-[#5C6B63] hover:text-[#18201C]"
              }`}
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {recentlyViewed.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenDetails(item)}
                className={`p-2.5 rounded-xl border text-xs space-y-1.5 cursor-pointer text-left ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A] hover:border-[#34433D]"
                    : "bg-white border-[#DFE6E2] hover:border-[#C4D1CA]"
                }`}
              >
                <div
                  className={`aspect-video w-full rounded-lg overflow-hidden ${
                    isDark ? "bg-[#1B2320]" : "bg-[#EFF4F1]"
                  }`}
                >
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center ${
                        isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                      }`}
                    >
                      <Package className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <h5
                  className={`font-semibold truncate ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  {item.title}
                </h5>
                <span
                  className={`font-mono font-semibold block ${
                    isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                  }`}
                >
                  {item.listingType === "exchange"
                    ? "For Exchange"
                    : `₹${item.price}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
