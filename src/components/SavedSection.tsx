import React from "react";
import {
  Heart,
  Bell,
  History,
  Trash2,
  Package,
  ArrowRight,
  Sparkles,
  ShoppingBag,
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
  wishlistIds,
  onToggleWishlist,
  onClearWishlist,
  onOpenDetails,
  onOpenLightbox,
  onOpenChat,
  onOpenCalendar,
  onShowToast,
  alerts,
  alertHistory,
  onOpenAlertsModal,
  recentlyViewed,
  onClearRecentlyViewed,
  isOnline = true,
}) => {
  const { isDark } = useTheme();

  return (
    <div
      id="saved-section-container"
      className="w-full space-y-8 animate-in fade-in duration-200"
    >
      {/* 1. Wishlist Collection */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/15 text-rose-500">
              <Heart className="w-4 h-4 fill-current" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Saved Wishlist ({wishlistListings.length})
            </h3>
          </div>

          {wishlistListings.length > 0 && (
            <button
              type="button"
              onClick={() => {
                triggerHaptic("warning");
                onClearWishlist();
              }}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
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
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <Heart className="w-8 h-8 mx-auto text-slate-400" />
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
              Your Wishlist is Empty
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tap the heart icon on any campus listing to bookmark items for price drops and quick comparison.
            </p>
          </div>
        )}
      </div>

      {/* 2. Active Alert Subscriptions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3 px-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-500/15 text-amber-500">
              <Bell className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Notify Me Alerts ({alerts.filter((a) => a.active).length} Active)
            </h3>
          </div>

          <button
            type="button"
            onClick={onOpenAlertsModal}
            className={`h-7 px-2.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              isDark
                ? "bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-800"
                : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-2xs"
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
              className={`p-3.5 rounded-xl border text-xs space-y-1.5 cursor-pointer transition-all hover:shadow-xs ${
                isDark
                  ? "bg-slate-900/70 hover:bg-slate-800 border-slate-800"
                  : "bg-white hover:bg-slate-50 border-slate-200 shadow-2xs"
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-slate-900 dark:text-white truncate">
                  {alert.keyword || alert.category || "Any Item"}
                </span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${
                    alert.active
                      ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-500"
                  }`}
                >
                  {alert.active ? "Active" : "Paused"}
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                <span>Category: {alert.category}</span>
                {alert.maxPrice ? (
                  <span className="font-mono font-bold">Max: ₹{alert.maxPrice}</span>
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
              <span className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-500">
                <History className="w-4 h-4" />
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Recently Viewed ({recentlyViewed.length})
              </h3>
            </div>

            <button
              type="button"
              onClick={onClearRecentlyViewed}
              className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 hover:underline cursor-pointer"
            >
              Clear History
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {recentlyViewed.map((item) => (
              <div
                key={item.id}
                onClick={() => onOpenDetails(item)}
                className={`p-2.5 rounded-xl border text-xs space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 hover:border-indigo-500/40"
                    : "bg-white border-slate-200 hover:border-indigo-300 shadow-2xs"
                }`}
              >
                <div className="aspect-video w-full rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                      <Package className="w-4 h-4" />
                    </div>
                  )}
                </div>
                <h5 className="font-bold text-slate-900 dark:text-white truncate">
                  {item.title}
                </h5>
                <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 block">
                  {item.listingType === "exchange" ? "For Exchange" : `₹${item.price}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
