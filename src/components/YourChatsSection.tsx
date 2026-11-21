import React from "react";
import {
  MessageSquare,
  Clock,
  Calendar as CalendarIcon,
  Maximize2,
  ArrowUpRight,
  Tag,
} from "lucide-react";
import { Conversation, Listing } from "../types";
import { useTheme } from "../context/ThemeContext";
import { getLatestOfferAmount } from "../utils/chatStorage";

interface YourChatsSectionProps {
  chats: Conversation[];
  allListings: Listing[];
  onOpenChat: (listing: Listing, initialMessage?: string) => void;
  onOpenDetails: (listing: Listing) => void;
  onOpenCalendar: (
    listing: Listing,
    otherPartyName?: string,
    otherPartyEmail?: string
  ) => void;
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

  const formatTimeAgo = (timestamp: number) => {
    if (!timestamp) return "Recently";
    const diffMin = Math.floor((Date.now() - timestamp) / 60000);
    if (diffMin < 1) return "Just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    if (diffDays === 1) return "Yesterday";
    return `${diffDays}d ago`;
  };

  const getStatusLabel = (status?: Conversation["status"]) => {
    switch (status) {
      case "handover_scheduled":
        return {
          label: "Agreed · Meetup planned",
          toneClass: "text-[#2F5D50] dark:text-[#7BBFA8]",
        };
      case "deal_proposed":
        return {
          label: "Offer sent",
          toneClass: "text-amber-700 dark:text-amber-400",
        };
      default:
        return {
          label: "In discussion",
          toneClass: "text-[#5C6B63] dark:text-[#8FA199]",
        };
    }
  };

  return (
    <section
      id="your-chats-section"
      aria-label="Your Chats Section"
      className="w-full space-y-5"
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-2.5">
            <h2
              className={`text-base font-semibold tracking-tight ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Your chats
            </h2>
            <span
              className={`text-xs font-mono tabular-nums ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              {chats.length} {chats.length === 1 ? "thread" : "threads"}
            </span>
          </div>
          <p className={`text-xs mt-0.5 ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
            Ongoing conversations, price offers, and handover plans with campus sellers
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenFullModal}
          className={`h-8 px-3 rounded-lg text-xs font-medium border inline-flex items-center gap-1.5 cursor-pointer ${
            isDark
              ? "bg-[#141A18] text-[#ECF2EF] hover:bg-[#1B2320] border-[#242E2A]"
              : "bg-white text-[#18201C] hover:bg-[#EFF4F1] border-[#DFE6E2]"
          }`}
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Manage all</span>
        </button>
      </div>

      {/* Content */}
      {chats.length === 0 ? (
        <div
          className={`py-14 px-6 rounded-xl border text-center space-y-2 ${
            isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-white border-[#DFE6E2]"
          }`}
        >
          <MessageSquare className="w-6 h-6 mx-auto text-[#83928A]" />
          <h3
            className={`text-sm font-semibold ${
              isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
            }`}
          >
            No active conversations
          </h3>
          <p className={`text-xs max-w-sm mx-auto ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
            Click Chat on any listing in the marketplace to send an offer or ask a question. Your thread will appear here automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {chats.map((chat) => {
            const statusInfo = getStatusLabel(chat.status);
            const offeredPrice = getLatestOfferAmount(chat);
            const matchedListing = allListings.find((l) => l.id === chat.listingId);

            const listingToUse: Listing = matchedListing || {
              id: chat.listingId,
              title: chat.listingTitle,
              price: chat.listingPrice,
              imageUrl: chat.listingImage,
              category: (chat.listingCategory as Listing["category"]) || "Other",
              condition: (chat.listingCondition as Listing["condition"]) || "Good",
              sellerId: chat.sellerId,
              sellerName: chat.sellerName || "Campus Seller",
              sellerEmail: chat.sellerEmail,
              status: "available",
              listingType: "sell",
              description: "Campus student listing",
              views: 1,
              createdAt: new Date(chat.lastMessageTimestamp || Date.now()).toISOString(),
            };

            return (
              <article
                key={chat.id}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3.5 ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A]"
                    : "bg-white border-[#DFE6E2]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(listingToUse)}
                    className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border cursor-pointer ${
                      isDark
                        ? "bg-[#1B2320] border-[#242E2A]"
                        : "bg-[#EFF4F1] border-[#DFE6E2]"
                    }`}
                  >
                    {listingToUse.imageUrl ? (
                      <img
                        src={listingToUse.imageUrl}
                        alt={listingToUse.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#83928A]">
                        <Tag className="w-4 h-4" />
                      </div>
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <h3
                      onClick={() => onOpenDetails(listingToUse)}
                      title={listingToUse.title}
                      className={`text-sm font-semibold truncate cursor-pointer hover:underline ${
                        isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                      }`}
                    >
                      {listingToUse.title}
                    </h3>
                    <div
                      className={`flex items-center gap-1.5 text-xs mt-0.5 truncate ${
                        isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                      }`}
                    >
                      <span className="truncate">{chat.sellerName || "Campus Seller"}</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(chat.lastMessageTimestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                <div
                  className={`py-2.5 border-y flex items-center justify-between gap-2 text-xs ${
                    isDark ? "border-[#242E2A]" : "border-[#EFF4F1]"
                  }`}
                >
                  <div className="flex items-baseline gap-2 font-mono tabular-nums">
                    {offeredPrice ? (
                      <>
                        <span
                          className={`text-sm font-semibold ${
                            isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                          }`}
                        >
                          ₹{offeredPrice.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[11px] text-[#83928A] line-through">
                          ₹{listingToUse.price.toLocaleString("en-IN")}
                        </span>
                      </>
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                        }`}
                      >
                        ₹{listingToUse.price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${statusInfo.toneClass}`}>
                    {statusInfo.label}
                  </span>
                </div>

                <p
                  className={`text-xs line-clamp-2 leading-relaxed ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  &ldquo;{chat.lastMessage}&rdquo;
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenChat(listingToUse)}
                    className={`flex-1 h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer ${
                      isDark
                        ? "bg-[#387262] text-white hover:bg-[#448573]"
                        : "bg-[#2F5D50] text-white hover:bg-[#244A3F]"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Resume chat</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenCalendar(
                        listingToUse,
                        chat.sellerName,
                        chat.sellerEmail
                      )
                    }
                    className={`h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer ${
                      isDark
                        ? "border-[#242E2A] bg-[#141A18] text-[#ECF2EF] hover:bg-[#1B2320]"
                        : "border-[#DFE6E2] bg-white text-[#18201C] hover:bg-[#EFF4F1]"
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5" />
                    <span>Meetup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDetails(listingToUse)}
                    title="View details"
                    className={`h-8 w-8 rounded-lg border inline-flex items-center justify-center cursor-pointer shrink-0 ${
                      isDark
                        ? "border-[#242E2A] bg-[#141A18] text-[#8FA199] hover:text-[#ECF2EF]"
                        : "border-[#DFE6E2] bg-white text-[#5C6B63] hover:text-[#18201C]"
                    }`}
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
};
