import React from "react";
import {
  X,
  Heart,
  Tag,
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
  if (!isOpen) return null;

  const totalEstimatedValue = savedListings.reduce(
    (sum, item) => sum + (item.listingType !== "exchange" ? item.price : 0),
    0
  );

  return (
    <div
      id="wishlist-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="wishlist-modal-container"
        className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8 flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900">
                  Saved Wishlist
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700">
                  {savedListings.length}{" "}
                  {savedListings.length === 1 ? "item" : "items"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Quick access to campus listings you are tracking
              </p>
            </div>
          </div>
          <button
            id="close-wishlist-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {savedListings.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-400 flex items-center justify-center mx-auto shadow-xs">
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className="text-base font-bold text-slate-800">
                  Your Wishlist is Empty
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Click the heart icon on any listing card to save scientific
                  calculators, engineering textbooks, lab gear, or campus
                  bicycles for quick comparison and handover scheduling.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Campus Listings
              </button>
            </div>
          ) : (
            <>
              {/* Summary Stats Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-gradient-to-r from-rose-50/70 via-indigo-50/50 to-slate-50 border border-rose-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ₹
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500 block">
                      Estimated Total Cost
                    </span>
                    <span className="text-base font-extrabold text-slate-900">
                      ₹{totalEstimatedValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs text-slate-600">
                  <span className="text-[11px] text-slate-500 italic">
                    Persisted in your personal collection
                  </span>
                  <button
                    onClick={onClearWishlist}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors p-1"
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
                    className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:shadow-md transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    {/* Item Info Thumbnail & Details */}
                    <div
                      onClick={() => {
                        onClose();
                        onOpenDetails(item);
                      }}
                      className="flex items-center gap-3.5 cursor-pointer group flex-1 min-w-0"
                    >
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 group/thumb">
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        {item.aiInspection && (
                          <div className="absolute top-1 left-1">
                            <span className="w-4 h-4 rounded-full bg-slate-900/90 text-indigo-300 flex items-center justify-center">
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
                            className="absolute bottom-1 right-1 p-1 rounded-md bg-black/75 hover:bg-black text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-xs"
                          >
                            <ZoomIn className="w-3 h-3 text-indigo-300" />
                          </button>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700">
                            {item.condition}
                          </span>
                          {item.status !== "available" && (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
                              {item.status}
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                          {item.title}
                        </h4>

                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          {item.listingType === "exchange" ? (
                            <span className="font-bold text-purple-700 text-xs">
                              Exchange / Swap
                            </span>
                          ) : (
                            <span className="font-extrabold text-slate-950 text-sm">
                              ₹{item.price.toLocaleString("en-IN")}
                            </span>
                          )}
                          <span>•</span>
                          <span className="truncate max-w-[120px]">
                            {item.sellerName}
                          </span>
                          {item.locationPreference && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[120px]">
                                <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                {item.locationPreference}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <button
                        onClick={() => {
                          onClose();
                          onOpenDetails(item);
                        }}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors"
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
                        className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors select-none ${
                          !isOnline
                            ? "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed"
                            : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 cursor-pointer"
                        }`}
                        title={
                          !isOnline
                            ? "Chat is disabled while offline to prevent data loss"
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
                        className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors"
                        title="Schedule Google Calendar Handover"
                      >
                        <CalendarIcon className="w-3.5 h-3.5" />
                        <span className="hidden md:inline">Meet</span>
                      </button>

                      <button
                        onClick={() => onRemoveFromWishlist(item.id)}
                        className="p-2 rounded-xl text-rose-500 hover:bg-rose-50 border border-rose-200/60 transition-colors"
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
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            {savedListings.length > 0
              ? `${savedListings.length} item${
                  savedListings.length === 1 ? "" : "s"
                } saved in your browser`
              : "No items saved"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
