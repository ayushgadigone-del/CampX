import React from "react";
import { motion, AnimatePresence } from "motion/react";
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <motion.div
        id="wishlist-modal-container"
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ type: "spring", damping: 25, stiffness: 350 }}
        className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden my-8 flex flex-col max-h-[85vh] ${
          isDark
            ? "bg-[#0B0F19] border-slate-800 text-slate-100 shadow-black/60"
            : "bg-white border-slate-200 text-slate-900 shadow-slate-300/40"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDark
              ? "border-slate-850 bg-slate-900/90 text-slate-100"
              : "border-slate-100 bg-slate-50/90 text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-500 flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 fill-rose-500 text-rose-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Saved Wishlist
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  isDark
                    ? "bg-rose-950/60 text-rose-300 border border-rose-800/40"
                    : "bg-rose-100 text-rose-700"
                }`}>
                  {savedListings.length}{" "}
                  {savedListings.length === 1 ? "item" : "items"}
                </span>
              </div>
              <p className={`text-[11px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Quick access to campus listings you are tracking
              </p>
            </div>
          </div>
          <button
            id="close-wishlist-modal-btn"
            onClick={onClose}
            className={`p-2 rounded-xl transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {savedListings.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-4">
              <div className={`w-16 h-16 rounded-full border flex items-center justify-center mx-auto shadow-xs ${
                isDark
                  ? "bg-rose-950/20 border-rose-800/40 text-rose-400"
                  : "bg-rose-50 border-rose-100 text-rose-400"
              }`}>
                <Heart className="w-8 h-8" />
              </div>
              <div className="space-y-1 max-w-sm mx-auto">
                <h3 className={`text-base font-bold ${isDark ? "text-slate-100" : "text-slate-800"}`}>
                  Your Wishlist is Empty
                </h3>
                <p className={`text-xs leading-relaxed ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Click the heart icon on any listing card to save scientific
                  calculators, engineering textbooks, lab gear, or campus
                  bicycles for quick comparison and handover scheduling.
                </p>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Campus Listings
              </button>
            </div>
          ) : (
            <>
              {/* Summary Stats Bar */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl border ${
                isDark
                  ? "bg-slate-900/80 border-slate-800"
                  : "bg-gradient-to-r from-rose-50/70 via-indigo-50/50 to-slate-50 border-rose-100"
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    ₹
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                      Estimated Total Cost
                    </span>
                    <span className={`text-base font-extrabold ${isDark ? "text-white" : "text-slate-900"}`}>
                      ₹{totalEstimatedValue.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3 text-xs">
                  <span className={`text-[11px] italic ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Persisted in your personal collection
                  </span>
                  <button
                    onClick={onClearWishlist}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    title="Remove all saved items"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Items List with AnimatePresence & layout animation */}
              <motion.div layout className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {savedListings.map((item) => (
                    <motion.div
                      key={item.id}
                      id={`wishlist-item-${item.id}`}
                      layout
                      initial={{ opacity: 0, scale: 0.95, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -20 }}
                      transition={{ duration: 0.2 }}
                      className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isDark
                          ? "bg-slate-900/60 border-slate-800 hover:border-indigo-500/50"
                          : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                      }`}
                    >
                      {/* Item Info Thumbnail & Details */}
                      <div
                        onClick={() => {
                          onClose();
                          onOpenDetails(item);
                        }}
                        className="flex items-center gap-3.5 cursor-pointer group flex-1 min-w-0"
                      >
                        <div className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border shrink-0 group/thumb ${
                          isDark ? "bg-slate-800 border-slate-700" : "bg-slate-100 border-slate-200"
                        }`}>
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
                              className="absolute bottom-1 right-1 p-1 rounded-md bg-black/75 hover:bg-black text-white opacity-0 group-hover/thumb:opacity-100 transition-opacity shadow-xs cursor-pointer"
                            >
                              <ZoomIn className="w-3 h-3 text-indigo-300" />
                            </button>
                          )}
                        </div>

                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isDark ? "bg-slate-800 text-slate-300" : "bg-slate-100 text-slate-700"
                            }`}>
                              {item.category}
                            </span>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                              isDark ? "bg-emerald-950/60 text-emerald-300" : "bg-emerald-50 text-emerald-700"
                            }`}>
                              {item.condition}
                            </span>
                            {item.status !== "available" && (
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-400">
                                {item.status}
                              </span>
                            )}
                          </div>

                          <h4 className={`text-sm font-bold transition-colors line-clamp-1 ${
                            isDark
                              ? "text-slate-100 group-hover:text-indigo-400"
                              : "text-slate-900 group-hover:text-indigo-600"
                          }`}>
                            {item.title}
                          </h4>

                          <div className={`flex items-center gap-3 text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                            {item.listingType === "exchange" ? (
                              <span className="font-bold text-purple-400 text-xs">
                                Exchange / Swap
                              </span>
                            ) : (
                              <span className={`font-extrabold text-sm ${isDark ? "text-white" : "text-slate-950"}`}>
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
                                <span className="flex items-center gap-1 text-[11px] truncate max-w-[120px]">
                                  <MapPin className="w-3 h-3 text-red-500 shrink-0" />
                                  {item.locationPreference}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className={`flex items-center gap-2 w-full sm:w-auto justify-end pt-2 sm:pt-0 border-t sm:border-t-0 ${
                        isDark ? "border-slate-800" : "border-slate-100"
                      }`}>
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => {
                            onClose();
                            onOpenDetails(item);
                          }}
                          className={`p-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                            isDark
                              ? "border-slate-800 hover:bg-slate-800 text-slate-300"
                              : "border-slate-200 hover:bg-slate-100 text-slate-700"
                          }`}
                          title="View Full Item Details"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          whileHover={isOnline ? { scale: 1.05 } : {}}
                          whileTap={isOnline ? { scale: 0.95 } : {}}
                          onClick={() => {
                            if (!isOnline) return;
                            onClose();
                            onOpenChat(item);
                          }}
                          disabled={!isOnline}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors select-none ${
                            !isOnline
                              ? "bg-slate-800 text-slate-500 border border-slate-750 cursor-not-allowed"
                              : isDark
                              ? "bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-800/50 cursor-pointer"
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
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            onClose();
                            onOpenCalendar(item);
                          }}
                          className={`inline-flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                            isDark
                              ? "bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-800/50"
                              : "bg-blue-50 hover:bg-blue-100 text-blue-700"
                          }`}
                          title="Schedule Google Calendar Handover"
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Meet</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => onRemoveFromWishlist(item.id)}
                          className={`p-2 rounded-xl transition-colors cursor-pointer border ${
                            isDark
                              ? "text-rose-400 hover:bg-rose-950/30 border-rose-800/40"
                              : "text-rose-500 hover:bg-rose-50 border-rose-200/60"
                          }`}
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between shrink-0 ${
          isDark
            ? "border-slate-850 bg-slate-900/90"
            : "border-slate-100 bg-slate-50"
        }`}>
          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            {savedListings.length > 0
              ? `${savedListings.length} item${
                  savedListings.length === 1 ? "" : "s"
                } saved in your browser`
              : "No items saved"}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  );
};
