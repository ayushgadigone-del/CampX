import React from "react";
import {
  X,
  Heart,
  MapPin,
  MessageCircle,
  Calendar as CalendarIcon,
  Trash2,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  ZoomIn,
} from "lucide-react";
import { Listing } from "../types";
import { useTheme } from "../context/ThemeContext";

interface WishlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedListings: Listing[];
  onRemoveFromWishlist: (listingId: string) => void;
  onClearWishlist: () => void;
  onOpenDetails: (listing: Listing) => void;
  onOpenChat: (listing: Listing) => void;
  onOpenCalendar: (listing: Listing) => void;
  onOpenLightbox?: (listing: Listing) => void;
  isOnline?: boolean;
}

export const WishlistModal: React.FC<WishlistModalProps> = ({
  isOpen,
  onClose,
  savedListings,
  onRemoveFromWishlist,
  onClearWishlist,
  onOpenDetails,
  onOpenChat,
  onOpenCalendar,
  onOpenLightbox,
  isOnline = true,
}) => {
  const { isDark } = useTheme();
  if (!isOpen) return null;

  const totalEstimatedValue = savedListings.reduce(
    (sum, item) => sum + (item.listingType !== "exchange" ? item.price : 0),
    0
  );

  return (
    <div
      id="wishlist-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto"
    >
      <div
        id="wishlist-modal-container"
        className={`relative w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden my-8 flex flex-col max-h-[85vh] ${
          isDark
            ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
            : "bg-white border-[#DFE6E2] text-[#18201C]"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDark
              ? "border-[#242E2A] bg-[#111715]"
              : "border-[#DFE6E2] bg-[#F3F5F2]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                isDark
                  ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                  : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
              }`}
            >
              <Heart className="w-4 h-4 fill-current" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2
                  className={`text-base font-semibold ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  Saved Wishlist
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-mono ${
                    isDark
                      ? "bg-[#182823] text-[#7BBFA8] border border-[#2A4A40]"
                      : "bg-[#EFF4F1] text-[#2F5D50] border border-[#C4D9D1]"
                  }`}
                >
                  {savedListings.length}{" "}
                  {savedListings.length === 1 ? "item" : "items"}
                </span>
              </div>
              <p
                className={`text-[11px] ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                Quick access to campus listings you are tracking
              </p>
            </div>
          </div>
          <button
            id="close-wishlist-modal-btn"
            onClick={onClose}
            className={`p-2 rounded-lg cursor-pointer ${
              isDark
                ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {savedListings.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div
                className={`w-14 h-14 rounded-full border flex items-center justify-center mx-auto ${
                  isDark
                    ? "bg-[#1B2320] border-[#242E2A] text-[#7BBFA8]"
                    : "bg-[#EFF4F1] border-[#DFE6E2] text-[#2F5D50]"
                }`}
              >
                <Heart className="w-6 h-6" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3
                  className={`text-base font-semibold ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  Your Wishlist is Empty
                </h3>
                <p
                  className={`text-xs leading-relaxed ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  Click the heart icon on any listing card to save scientific
                  calculators, engineering textbooks, lab gear, or campus
                  bicycles for quick comparison and handover scheduling.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white font-semibold text-xs cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Campus Listings
              </button>
            </div>
          ) : (
            <>
              {/* Summary Stats Bar */}
              <div
                className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border ${
                  isDark
                    ? "bg-[#1B2320] border-[#242E2A]"
                    : "bg-[#F7F9F8] border-[#DFE6E2]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2F5D50] dark:bg-[#387262] text-white flex items-center justify-center font-bold text-xs">
                    ₹
                  </div>
                  <div className="text-left">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-semibold block ${
                        isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                      }`}
                    >
                      Estimated Total Cost
                    </span>
                    <span
                      className={`text-base font-bold font-mono ${
                        isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                      }`}
                    >
                      ₹{totalEstimatedValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                  <span
                    className={`text-[11px] ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    Saved in your personal collection
                  </span>
                  <button
                    onClick={onClearWishlist}
                    className={`inline-flex items-center gap-1 text-[11px] font-semibold p-1 cursor-pointer ${
                      isDark
                        ? "text-[#E58989] hover:underline"
                        : "text-[#A63A3A] hover:underline"
                    }`}
                    title="Remove all saved items"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3">
                {savedListings.map((item) => (
                  <div
                    key={item.id}
                    id={`wishlist-item-${item.id}`}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                      isDark
                        ? "bg-[#111715] border-[#242E2A] hover:border-[#34433D]"
                        : "bg-white border-[#DFE6E2] hover:border-[#C4D1CA]"
                    }`}
                  >
                    <div
                      onClick={() => {
                        onClose();
                        onOpenDetails(item);
                      }}
                      className="flex items-center gap-3.5 cursor-pointer flex-1 min-w-0"
                    >
                      <div
                        className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border shrink-0 ${
                          isDark
                            ? "bg-[#1B2320] border-[#242E2A]"
                            : "bg-[#EFF4F1] border-[#DFE6E2]"
                        }`}
                      >
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        {item.aiInspection && (
                          <div className="absolute top-1 left-1">
                            <span className="w-4 h-4 rounded-full bg-[#141A18]/90 text-[#7BBFA8] flex items-center justify-center">
                              <Sparkles className="w-2.5 h-2.5" />
                            </span>
                          </div>
                        )}
                        {onOpenLightbox && (
                          <button
                            type="button"
                            title="Zoom & inspect condition"
                            onClick={(e) => {
                              e.stopPropagation();
                              onClose();
                              onOpenLightbox(item);
                            }}
                            className="absolute bottom-1 right-1 p-1 rounded-md bg-[#141A18]/80 hover:bg-[#141A18] text-white cursor-pointer"
                          >
                            <ZoomIn className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1 text-left">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              isDark
                                ? "bg-[#1B2320] text-[#ECF2EF]"
                                : "bg-[#EFF4F1] text-[#18201C]"
                            }`}
                          >
                            {item.category}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                              isDark
                                ? "bg-[#182823] text-[#7BBFA8]"
                                : "bg-[#EBF3EF] text-[#2F5D50]"
                            }`}
                          >
                            {item.condition}
                          </span>
                          {item.status !== "available" && (
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                                isDark
                                  ? "bg-[#251F15] text-[#DFC29B]"
                                  : "bg-[#FDF6EC] text-[#9E6B43]"
                              }`}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>

                        <h4
                          className={`text-sm font-semibold line-clamp-1 ${
                            isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                          }`}
                        >
                          {item.title}
                        </h4>

                        <div
                          className={`flex items-center gap-2 text-xs ${
                            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                          }`}
                        >
                          {item.listingType === "exchange" ? (
                            <span
                              className={`font-semibold text-xs ${
                                isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                              }`}
                            >
                              Exchange / Swap
                            </span>
                          ) : (
                            <span
                              className={`font-bold font-mono text-sm ${
                                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                              }`}
                            >
                              ₹{item.price.toLocaleString("en-IN")}
                            </span>
                          )}
                          <span>·</span>
                          <span className="truncate max-w-[120px]">
                            {item.sellerName}
                          </span>
                          {item.locationPreference && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1 text-[11px] truncate max-w-[120px]">
                                <MapPin className="w-3 h-3 shrink-0" />
                                {item.locationPreference}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className={`flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 ${
                        isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"
                      }`}
                    >
                      <button
                        onClick={() => {
                          onClose();
                          onOpenDetails(item);
                        }}
                        className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                          isDark
                            ? "border-[#242E2A] hover:bg-[#1B2320] text-[#ECF2EF]"
                            : "border-[#DFE6E2] hover:bg-[#EFF4F1] text-[#18201C]"
                        }`}
                        title="View Full Item Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (!isOnline) return;
                          onClose();
                          onOpenChat(item);
                        }}
                        disabled={!isOnline}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-semibold select-none ${
                          !isOnline
                            ? "bg-[#DFE6E2] dark:bg-[#242E2A] text-[#8FA199] cursor-not-allowed"
                            : isDark
                            ? "bg-[#387262] hover:bg-[#448573] text-white cursor-pointer"
                            : "bg-[#2F5D50] hover:bg-[#244A3F] text-white cursor-pointer"
                        }`}
                        title={
                          !isOnline
                            ? "Chat is disabled while offline"
                            : "Chat with Student Seller"
                        }
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">
                          {!isOnline ? "Offline" : "Chat"}
                        </span>
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenCalendar(item);
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-lg border text-xs font-semibold cursor-pointer ${
                          isDark
                            ? "bg-[#1B2320] hover:bg-[#222D29] text-[#ECF2EF] border-[#242E2A]"
                            : "bg-[#EFF4F1] hover:bg-[#E5EEE9] text-[#18201C] border-[#DFE6E2]"
                        }`}
                        title="Schedule Google Calendar Handover"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Meet</span>
                      </button>

                      <button
                        onClick={() => onRemoveFromWishlist(item.id)}
                        className={`p-2 rounded-lg cursor-pointer border ${
                          isDark
                            ? "text-[#E58989] hover:bg-[#261617] border-[#4E2628]"
                            : "text-[#A63A3A] hover:bg-[#FDF2F2] border-[#F2CACA]"
                        }`}
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div
          className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
            isDark
              ? "border-[#242E2A] bg-[#111715]"
              : "border-[#DFE6E2] bg-[#F3F5F2]"
          }`}
        >
          <span
            className={`text-xs ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          >
            {savedListings.length > 0
              ? `${savedListings.length} item${
                  savedListings.length === 1 ? "" : "s"
                } saved in your browser`
              : "No items saved"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white text-xs font-semibold cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
