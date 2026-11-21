import React, { useState, useMemo } from "react";
import {
  X,
  MessageSquare,
  Search,
  Calendar as CalendarIcon,
  ExternalLink,
  Trash2,
  Tag,
  Clock,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShoppingBag,
  Filter,
  DollarSign,
  User,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import { Conversation, Listing } from "../types";
import { useTheme } from "../context/ThemeContext";

interface YourChatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  chats: Conversation[];
  allListings: Listing[];
  onOpenChat: (listing: Listing, initialMessage?: string) => void;
  onOpenDetails: (listing: Listing) => void;
  onOpenCalendar: (listing: Listing, otherPartyName?: string, otherPartyEmail?: string) => void;
  onDeleteChat: (conversationId: string) => void;
  onClearAllChats: () => void;
  isOnline?: boolean;
}

export const YourChatsModal: React.FC<YourChatsModalProps> = ({
  isOpen,
  onClose,
  chats,
  allListings,
  onOpenChat,
  onOpenDetails,
  onOpenCalendar,
  onDeleteChat,
  onClearAllChats,
  isOnline = true,
}) => {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "deal_proposed" | "handover_scheduled">("all");
  const [confirmClear, setConfirmClear] = useState(false);

  // Filter and search chats
  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      // Filter by status
      if (statusFilter !== "all" && chat.status !== statusFilter) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const titleMatch = chat.listingTitle.toLowerCase().includes(query);
        const sellerMatch = (chat.sellerName || "").toLowerCase().includes(query);
        const msgMatch = (chat.lastMessage || "").toLowerCase().includes(query);
        const categoryMatch = (chat.listingCategory || "").toLowerCase().includes(query);
        return titleMatch || sellerMatch || msgMatch || categoryMatch;
      }

      return true;
    });
  }, [chats, statusFilter, searchQuery]);

  if (!isOpen) return null;

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
            ? "bg-[#2F5D50] text-[#7BBFA8] border-[#5BA18C]"
            : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]",
        };
      case "deal_proposed":
        return {
          label: "Offer Pending",
          icon: DollarSign,
          className: isDark
            ? "bg-amber-500/20 text-[#DFC29B] border-amber-500/30"
            : "bg-[#FDF6EC] text-[#9E6B43] border-[#EED8B8]",
        };
      default:
        return {
          label: "In Discussion",
          icon: MessageSquare,
          className: isDark
            ? "bg-[#2F5D50] text-[#7BBFA8] border-[#5BA18C]"
            : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]",
        };
    }
  };

  return (
    <div
      id="your-chats-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto"
    >
      <div
        id="your-chats-modal-container"
        className={`relative w-full max-w-4xl rounded-3xl shadow-2xl border overflow-hidden my-6 flex flex-col max-h-[88vh] ${
          isDark
            ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] shadow-black/60"
            : "bg-white border-[#DFE6E2] text-[#18201C] shadow-[#18201C]/10"
        }`}
      >
        {/* Header */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between px-6 py-4 border-b gap-3 shrink-0 ${
            isDark
              ? "border-[#242E2A] bg-[#141A18]"
              : "border-[#DFE6E2] bg-[#F7F9F8]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2F5D50] dark:bg-[#387262] text-white flex items-center justify-center shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Your Chats</h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-[#2F5D50] text-white shadow-2xs">
                  {chats.length} {chats.length === 1 ? "thread" : "threads"}
                </span>
              </div>
              <p
                className={`text-xs ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                All ongoing discussions, offers, and handover chats with campus sellers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {chats.length > 0 && (
              <>
                {confirmClear ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-rose-500 font-bold">Clear all?</span>
                    <button
                      onClick={() => {
                        onClearAllChats();
                        setConfirmClear(false);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      Yes, Clear
                    </button>
                    <button
                      onClick={() => setConfirmClear(false)}
                      className="px-2 py-1 rounded-lg border border-[#C4D1CA] dark:border-[#242E2A] text-xs font-bold hover:bg-[#EFF4F1] dark:hover:bg-[#1B2320] transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => setConfirmClear(true)}
                    title="Clear chat history"
                    className={`p-2 rounded-xl text-xs font-medium border transition-colors flex items-center gap-1 cursor-pointer ${
                      isDark
                        ? "border-[#242E2A] text-[#8FA199] hover:text-rose-400 hover:bg-[#1B2320]"
                        : "border-[#DFE6E2] text-[#5C6B63] hover:text-rose-600 hover:bg-rose-50"
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span className="hidden md:inline">Clear History</span>
                  </button>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                isDark
                  ? "text-[#8FA199] hover:text-white hover:bg-[#1B2320]"
                  : "text-[#8FA199] hover:text-[#5C6B63] hover:bg-[#EFF4F1]"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div
          className={`px-6 py-3 border-b flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0 ${
            isDark ? "border-[#242E2A] bg-[#141A18]" : "border-[#DFE6E2] bg-white"
          }`}
        >
          {/* Search inside chats */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8FA199]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search chats by product title, seller name, or message..."
              className={`w-full pl-9 pr-4 py-2 rounded-xl text-xs border outline-hidden transition-all ${
                isDark
                  ? "bg-[#1B2320] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#5C6B63] focus:border-[#5BA18C]"
                  : "bg-[#F7F9F8] border-[#DFE6E2] text-[#18201C] placeholder:text-[#8FA199] focus:border-[#5BA18C] focus:bg-white"
              }`}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8FA199] hover:text-[#5C6B63] text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {[
              { id: "all", label: "All Chats" },
              { id: "active", label: "💬 Active" },
              { id: "deal_proposed", label: "🤝 Offers" },
              { id: "handover_scheduled", label: "📅 Scheduled" },
            ].map((tab) => {
              const isSelected = statusFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#2F5D50] text-white shadow-2xs"
                      : isDark
                      ? "bg-[#1B2320] text-[#C5D3CC] hover:bg-[#242E2A] border border-[#242E2A]"
                      : "bg-[#EFF4F1] text-[#5C6B63] hover:bg-[#DFE6E2] border border-[#DFE6E2]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chats List Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {filteredChats.length === 0 ? (
            <div className="py-14 text-center flex flex-col items-center justify-center">
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${
                  isDark ? "bg-[#1B2320] text-[#7BBFA8]" : "bg-[#EFF4F1] text-[#2F5D50]"
                }`}
              >
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="text-base font-extrabold mb-1">
                {searchQuery || statusFilter !== "all"
                  ? "No matching chats found"
                  : "No seller chats yet"}
              </h3>
              <p
                className={`text-xs max-w-sm mb-5 ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your search terms or filter to see more conversations."
                  : "Whenever you click 'Ask Seller' on any product, your chat thread will be automatically saved here for quick access!"}
              </p>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2F5D50] dark:bg-[#387262] text-white font-bold text-xs shadow-md hover:bg-[#244A3F] dark:hover:bg-[#448573] transition-all cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Explore Campus Listings</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {filteredChats.map((chat) => {
                const statusBadge = getStatusBadge(chat.status);
                const StatusIcon = statusBadge.icon;

                // Find the original listing object if available
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
                  <div
                    key={chat.id}
                    className={`group rounded-2xl border p-4 relative flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isDark
                        ? "bg-[#1B2320] hover:bg-[#1B2320] border-[#242E2A] hover:border-[#5BA18C] shadow-md"
                        : "bg-white hover:bg-[#F7F9F8] border-[#DFE6E2] hover:border-[#C4D9D1] shadow-xs"
                    }`}
                  >
                    {/* Left: Product Thumbnail & Chat Info */}
                    <div className="flex items-start gap-3.5 flex-1 min-w-0">
                      {/* Product Thumbnail */}
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-[#EFF4F1] shrink-0 border border-[#DFE6E2] dark:border-[#242E2A] shadow-2xs">
                        <img
                          src={chat.listingImage}
                          alt={chat.listingTitle}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          ₹{chat.listingPrice}
                        </span>
                      </div>

                      {/* Conversation Details */}
                      <div className="flex-1 min-w-0">
                        {/* Status & Timestamp Header */}
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusBadge.className}`}
                          >
                            <StatusIcon className="w-3 h-3" />
                            <span>{statusBadge.label}</span>
                          </span>

                          <span
                            className={`text-[11px] font-medium flex items-center gap-1 ${
                              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                            }`}
                          >
                            <Clock className="w-3 h-3" />
                            <span>{formatTimeAgo(chat.lastMessageTimestamp)}</span>
                          </span>
                        </div>

                        {/* Product Title */}
                        <h4
                          onClick={() => onOpenDetails(listingToUse)}
                          className={`font-bold text-sm truncate cursor-pointer hover:underline ${
                            isDark ? "text-white" : "text-[#18201C]"
                          }`}
                          title={chat.listingTitle}
                        >
                          {chat.listingTitle}
                        </h4>

                        {/* Seller marker */}
                        <div className="flex items-center gap-1.5 text-xs text-[#5C6B63] dark:text-[#8FA199] mt-0.5">
                          <User className="w-3 h-3" />
                          <span className="font-medium text-[#5C6B63] dark:text-[#C5D3CC]">
                            {chat.sellerName || "Campus Seller"}
                          </span>
                        </div>

                        {/* Last Message Snippet */}
                        <div
                          className={`mt-1.5 text-xs line-clamp-1 p-1.5 rounded-lg border flex items-center gap-1.5 ${
                            isDark
                              ? "bg-[#141A18] border-[#242E2A] text-[#C5D3CC]"
                              : "bg-[#F7F9F8] border-[#DFE6E2] text-[#5C6B63]"
                          }`}
                        >
                          <MessageSquare className="w-3 h-3 text-[#2F5D50] shrink-0" />
                          <span className="italic truncate font-medium">
                            "{chat.lastMessage}"
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Quick Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-[#DFE6E2] dark:border-[#242E2A]">
                      {/* Primary Resume Chat Button */}
                      <button
                        onClick={() => {
                          onClose();
                          onOpenChat(listingToUse);
                        }}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-[#2F5D50] dark:bg-[#387262] hover:bg-[#244A3F] dark:hover:bg-[#448573] text-white shadow-xs hover: transition-all cursor-pointer"
                        title="Open chat drawer to resume discussion"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Resume Chat</span>
                      </button>

                      {/* View Product Details */}
                      <button
                        onClick={() => onOpenDetails(listingToUse)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isDark
                            ? "border-[#242E2A] bg-[#1B2320] text-[#C5D3CC] hover:bg-[#242E2A] hover:text-white"
                            : "border-[#DFE6E2] bg-white text-[#5C6B63] hover:bg-[#EFF4F1]"
                        }`}
                        title="View Product Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </button>

                      {/* Schedule Handover */}
                      <button
                        onClick={() => {
                          onOpenCalendar(
                            listingToUse,
                            chat.sellerName,
                            chat.sellerEmail
                          );
                        }}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isDark
                            ? "border-[#5BA18C] bg-[#2F5D50] text-[#7BBFA8] hover:bg-[#244A3F]"
                            : "border-[#C4D9D1] bg-[#EFF4F1] text-[#2F5D50] hover:bg-[#EFF4F1]"
                        }`}
                        title="Schedule Handover on Google Calendar"
                      >
                        <CalendarIcon className="w-4 h-4" />
                      </button>

                      {/* Delete Conversation */}
                      <button
                        onClick={() => onDeleteChat(chat.id)}
                        className={`p-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                          isDark
                            ? "border-[#242E2A] text-[#5C6B63] hover:text-rose-400 hover:bg-[#1B2320] hover:border-rose-900/40"
                            : "border-[#DFE6E2] text-[#8FA199] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200"
                        }`}
                        title="Delete chat thread"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer info & security reminder */}
        <div
          className={`px-6 py-3 border-t flex flex-col sm:flex-row items-center justify-between text-[11px] gap-2 shrink-0 ${
            isDark
              ? "border-[#242E2A] bg-[#0D1110] text-[#8FA199]"
              : "border-[#DFE6E2] bg-[#F7F9F8] text-[#5C6B63]"
          }`}
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2F5D50]" />
            <span>
              All chats are encrypted and stored for peer-to-peer campus safety.
            </span>
          </div>
          <span className="font-semibold text-[#2F5D50] dark:text-[#7BBFA8]">
            PVG's COET Campus Marketplace
          </span>
        </div>
      </div>
    </div>
  );
};
