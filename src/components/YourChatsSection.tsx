import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  Clock,
  ArrowRight,
  Calendar as CalendarIcon,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Maximize2,
  DollarSign,
  User,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { Conversation, Listing } from "../types";
import { useTheme } from "../context/ThemeContext";
import { HorizontalSlider } from "./HorizontalSlider";

interface YourChatsSectionProps {
  chats: Conversation[];
  allListings: Listing[];
  onOpenChat: (listing: Listing, initialMessage?: string) => void;
  onOpenDetails: (listing: Listing) => void;
  onOpenCalendar: (listing: Listing, otherPartyName?: string, otherPartyEmail?: string) => void;
  onOpenFullModal: () => void;
}

export const YourChatsSection: React.FC<YourChatsSectionProps> = ({
  chats,
  allListings,
  onOpenChat,
  onOpenDetails,
  onOpenCalendar,
  onOpenFullModal,
}) => {
  const { isDark } = useTheme();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Format relative timestamp
  const formatTimeAgo = (timestamp: number) => {
    if (!timestamp) return "Recently";
    const diffMs = Date.now() - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);

    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const getStatusBadge = (status?: Conversation["status"]) => {
    switch (status) {
      case "handover_scheduled":
        return {
          label: "Handover Planned",
          icon: CalendarIcon,
          className: isDark
            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
            : "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "deal_proposed":
        return {
          label: "Offer Pending",
          icon: DollarSign,
          className: isDark
            ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
            : "bg-amber-50 text-amber-700 border-amber-200",
        };
      default:
        return {
          label: "In Discussion",
          icon: MessageSquare,
          className: isDark
            ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/30"
            : "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
    }
  };

  return (
    <section
      id="your-chats-section"
      aria-label="Your Chats Section"
      className={`w-full rounded-3xl border shadow-lg backdrop-blur-xl transition-all duration-300 overflow-hidden ${
        isDark
          ? "bg-slate-900/90 border-indigo-500/30 shadow-indigo-950/20"
          : "bg-white border-slate-200/90 shadow-slate-200/50"
      }`}
    >
      {/* Section Header */}
      <div
        className={`px-6 py-4.5 border-b flex flex-wrap items-center justify-between gap-3 ${
          isDark
            ? "border-slate-800/80 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900"
            : "border-slate-100 bg-gradient-to-r from-indigo-50/50 via-purple-50/30 to-white"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 text-white flex items-center justify-center shadow-md shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-2">
                Your Chats
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-600 text-white shadow-2xs">
                {chats.length} {chats.length === 1 ? "Active Thread" : "Active Threads"}
              </span>
            </div>
            <p
              className={`text-xs mt-0.5 ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Stored conversations and price negotiations with student sellers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Open Full Screen Modal */}
          <button
            onClick={onOpenFullModal}
            title="Expand to Full View"
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:border-indigo-500/50"
                : "bg-white text-slate-700 hover:text-indigo-600 border-slate-200 hover:border-indigo-300 shadow-2xs"
            }`}
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">All Chats</span>
          </button>

          {/* Collapse / Expand Button */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? "Expand section" : "Collapse section"}
            className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
              isDark
                ? "bg-slate-800 text-slate-400 hover:text-white border-slate-700"
                : "bg-white text-slate-500 hover:text-slate-900 border-slate-200"
            }`}
          >
            {isCollapsed ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Section Content */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="p-5 sm:p-6"
          >
            {chats.length === 0 ? (
              <div className="py-8 text-center flex flex-col items-center justify-center">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 ${
                    isDark ? "bg-slate-800 text-indigo-400" : "bg-indigo-50 text-indigo-600"
                  }`}
                >
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-sm font-bold mb-1">No chats saved yet</h3>
                <p
                  className={`text-xs max-w-sm ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  Click "Ask Seller" on any listing in the marketplace to start a negotiation or question. Your chat thread will automatically be saved here.
                </p>
              </div>
            ) : (
              <HorizontalSlider
                id="your-chats-slider"
                showArrows={true}
                showProgress={true}
                showMobileHint={true}
                scrollStep={300}
                itemSnap={true}
                ariaLabel="Your Chats Conversations Slider"
                trackClassName="gap-4 py-1"
              >
                {chats.slice(0, 6).map((chat) => {
                  const statusBadge = getStatusBadge(chat.status);
                  const StatusIcon = statusBadge.icon;

                  // Find original listing if available
                  const matchedListing = allListings.find(
                    (l) => l.id === chat.listingId
                  );

                  const listingToUse: Listing = matchedListing || {
                    id: chat.listingId,
                    title: chat.listingTitle,
                    price: chat.listingPrice,
                    imageUrl: chat.listingImage,
                    category: (chat.listingCategory as any) || "General",
                    condition: (chat.listingCondition as any) || "Good",
                    sellerId: chat.sellerId,
                    sellerName: chat.sellerName || "Campus Seller",
                    sellerEmail: chat.sellerEmail,
                    status: "available",
                    listingType: "sell",
                    description: "Verified campus resale item",
                    views: 1,
                    createdAt: new Date().toISOString(),
                  };

                  return (
                    <motion.div
                      key={chat.id}
                      whileHover={{ y: -3, scale: 1.01 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className={`group w-[290px] sm:w-[320px] md:w-[340px] shrink-0 snap-start rounded-2xl border p-4 flex flex-col justify-between transition-all duration-200 relative ${
                        isDark
                          ? "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-indigo-500/50 shadow-md"
                          : "bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-xs"
                      }`}
                    >
                      {/* Top: Status & Timestamp */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.className}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          <span>{statusBadge.label}</span>
                        </span>

                        <span
                          className={`text-[11px] font-medium flex items-center gap-1 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span>{formatTimeAgo(chat.lastMessageTimestamp)}</span>
                        </span>
                      </div>

                      {/* Middle: Product & Seller */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                          <img
                            src={chat.listingImage}
                            alt={chat.listingTitle}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <span className="absolute bottom-0.5 right-0.5 bg-black/70 backdrop-blur-xs text-white text-[8px] font-black px-1 py-0.2 rounded">
                            ₹{chat.listingPrice}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onOpenDetails(listingToUse)}
                            className={`font-bold text-xs truncate cursor-pointer hover:underline ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                            title={chat.listingTitle}
                          >
                            {chat.listingTitle}
                          </h4>

                          <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                            <User className="w-3 h-3 text-indigo-500 shrink-0" />
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">
                              {chat.sellerName || "Seller"}
                            </span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium shrink-0">
                              Verified
                            </span>
                          </div>

                          <div
                            className={`mt-1.5 text-[11px] line-clamp-1 p-1.5 rounded-lg border flex items-center gap-1.5 ${
                              isDark
                                ? "bg-slate-900/60 border-slate-750 text-slate-300"
                                : "bg-slate-50 border-slate-100 text-slate-600"
                            }`}
                          >
                            <span className="italic truncate font-medium">
                              "{chat.lastMessage}"
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Bottom Action Bar */}
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onOpenChat(listingToUse)}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xs transition-all cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Resume Chat</span>
                        </button>

                        <button
                          onClick={() => onOpenDetails(listingToUse)}
                          className={`p-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                            isDark
                              ? "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
                              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                          title="View Product Details"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </HorizontalSlider>
            )}

            {/* Bottom info link if more chats exist */}
            {chats.length > 6 && (
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
                <button
                  onClick={onOpenFullModal}
                  className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View all {chats.length} conversations in Your Chats</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
