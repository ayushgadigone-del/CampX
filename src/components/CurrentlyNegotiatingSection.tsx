import React from "react";
import {
  MessageSquare,
  Calendar as CalendarIcon,
  ArrowUpRight,
  Handshake,
  Clock,
  Tag,
} from "lucide-react";
import { Conversation, Listing } from "../types";
import { useTheme } from "../context/ThemeContext";
import { getLatestOfferAmount } from "../utils/chatStorage";

interface CurrentlyNegotiatingSectionProps {
  chats: Conversation[];
  allListings: Listing[];
  onOpenChat: (listing: Listing, initialMessage?: string) => void;
  onOpenDetails: (listing: Listing) => void;
  onOpenCalendar: (
    listing: Listing,
    otherPartyName?: string,
    otherPartyEmail?: string
  ) => void;
  onViewAllChats: () => void;
  isOnline?: boolean;
}

const formatRelativeTime = (timestamp: number): string => {
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

const getNegotiationStage = (
  status?: Conversation["status"],
  hasOffer?: boolean
): { label: string; toneClass: string } => {
  switch (status) {
    case "handover_scheduled":
      return {
        label: "Agreed · Meetup planned",
        toneClass: "text-[#2F5D50] dark:text-[#7BBFA8]",
      };
    case "deal_proposed":
      return {
        label: "Offer sent",
        toneClass: "text-[#9E6B43] dark:text-[#DFC29B]",
      };
    default:
      return {
        label: hasOffer ? "Price discussed" : "In discussion",
        toneClass: "text-[#5C6B63] dark:text-[#8FA199]",
      };
  }
};

export const CurrentlyNegotiatingSection: React.FC<
  CurrentlyNegotiatingSectionProps
> = ({
  chats,
  allListings,
  onOpenChat,
  onOpenDetails,
  onOpenCalendar,
  onViewAllChats,
  isOnline = true,
}) => {
  const { isDark } = useTheme();

  const activeNegotiations = chats.filter((c) => c.status !== "completed");

  const resolveListing = (chat: Conversation): Listing => {
    const matched = allListings.find((l) => l.id === chat.listingId);
    if (matched) return matched;
    return {
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
      listingType: chat.listingPrice === 0 ? "exchange" : "sell",
      description: "Campus student listing currently in negotiation.",
      views: 1,
      createdAt: new Date(chat.lastMessageTimestamp || Date.now()).toISOString(),
    };
  };

  return (
    <section
      id="currently-negotiating-section"
      aria-label="Currently Negotiating"
      className="w-full space-y-3"
    >
      {/* Clean Minimal Section Header */}
      <div className="flex items-baseline justify-between gap-3">
        <div className="flex flex-wrap items-baseline gap-2.5">
          <h2
            className={`text-base font-semibold tracking-tight flex items-center gap-2 ${
              isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
            }`}
          >
            <Handshake
              className={`w-4 h-4 shrink-0 ${
                isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
              }`}
            />
            <span>Currently negotiating</span>
          </h2>
          <span
            className={`text-xs font-mono tabular-nums ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          >
            {activeNegotiations.length}{" "}
            {activeNegotiations.length === 1 ? "item" : "items"}
          </span>
        </div>

        {activeNegotiations.length > 0 && (
          <button
            type="button"
            onClick={onViewAllChats}
            className={`text-xs font-medium inline-flex items-center gap-1 cursor-pointer whitespace-nowrap shrink-0 ${
              isDark
                ? "text-[#8FA199] hover:text-[#ECF2EF]"
                : "text-[#5C6B63] hover:text-[#18201C]"
            }`}
          >
            <span>All chats</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Empty State or Negotiation Cards Grid */}
      {activeNegotiations.length === 0 ? (
        <div
          className={`px-4 py-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isDark
              ? "bg-[#141A18] border-[#242E2A] text-[#8FA199]"
              : "bg-white border-[#DFE6E2] text-[#5C6B63]"
          }`}
        >
          <span>
            No active buying talks yet. Open{" "}
            <strong className={isDark ? "text-[#ECF2EF]" : "text-[#18201C]"}>
              Chat
            </strong>{" "}
            on any listing below to send an offer or discuss a meetup — it will
            appear here automatically.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeNegotiations.slice(0, 6).map((chat) => {
            const listing = resolveListing(chat);
            const offeredPrice = getLatestOfferAmount(chat);
            const stage = getNegotiationStage(chat.status, Boolean(offeredPrice));
            const messagesCount = chat.messages?.length || 1;

            return (
              <article
                key={chat.id}
                className={`rounded-xl border p-4 flex flex-col justify-between gap-3.5 ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A]"
                    : "bg-white border-[#DFE6E2]"
                }`}
              >
                {/* Top: Product Thumbnail + Title + Seller */}
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => onOpenDetails(listing)}
                    className={`w-12 h-12 rounded-lg overflow-hidden shrink-0 border cursor-pointer ${
                      isDark
                        ? "bg-[#1B2320] border-[#242E2A]"
                        : "bg-[#EFF4F1] border-[#DFE6E2]"
                    }`}
                  >
                    {listing.imageUrl ? (
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
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
                      onClick={() => onOpenDetails(listing)}
                      title={listing.title}
                      className={`text-sm font-semibold leading-snug truncate cursor-pointer hover:underline ${
                        isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                      }`}
                    >
                      {listing.title}
                    </h3>

                    <div
                      className={`flex items-center gap-1.5 text-xs mt-0.5 truncate ${
                        isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                      }`}
                    >
                      <span className="truncate">
                        {chat.sellerName || listing.sellerName}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {formatRelativeTime(chat.lastMessageTimestamp)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Middle: Price Talk Summary & Stage */}
                <div
                  className={`py-2.5 border-y flex items-center justify-between gap-3 text-xs ${
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
                          ₹{listing.price.toLocaleString("en-IN")}
                        </span>
                      </>
                    ) : (
                      <span
                        className={`text-sm font-semibold ${
                          isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                        }`}
                      >
                        {listing.listingType === "exchange"
                          ? "Swap"
                          : `₹${listing.price.toLocaleString("en-IN")}`}
                      </span>
                    )}
                  </div>

                  <span className={`text-xs font-medium truncate ${stage.toneClass}`}>
                    {stage.label}
                  </span>
                </div>

                {/* Latest Message Snippet */}
                <div className="space-y-1">
                  <p
                    className={`text-xs line-clamp-2 leading-relaxed ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    &ldquo;{chat.lastMessage}&rdquo;
                  </p>
                  <p
                    className={`text-[11px] font-mono tabular-nums ${
                      isDark ? "text-[#6D7E76]" : "text-[#83928A]"
                    }`}
                  >
                    {messagesCount} {messagesCount === 1 ? "message" : "messages"} in thread
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-0.5">
                  <button
                    type="button"
                    disabled={!isOnline}
                    onClick={() => onOpenChat(listing)}
                    className={`flex-1 h-8 px-3 rounded-lg text-xs font-medium inline-flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap ${
                      isDark
                        ? "bg-[#387262] text-white hover:bg-[#448573]"
                        : "bg-[#2F5D50] text-white hover:bg-[#244A3F]"
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5 shrink-0" />
                    <span>Continue talk</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onOpenCalendar(
                        listing,
                        chat.sellerName || listing.sellerName,
                        chat.sellerEmail || listing.sellerEmail
                      )
                    }
                    title="Schedule campus handover"
                    className={`h-8 px-2.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                      isDark
                        ? "border-[#242E2A] bg-[#141A18] text-[#ECF2EF] hover:bg-[#1B2320] hover:border-[#34433D]"
                        : "border-[#DFE6E2] bg-white text-[#18201C] hover:bg-[#EFF4F1] hover:border-[#C4D1CA]"
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 shrink-0" />
                    <span>Meetup</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onOpenDetails(listing)}
                    title="View item details"
                    aria-label={`View details for ${listing.title}`}
                    className={`h-8 w-8 rounded-lg border inline-flex items-center justify-center cursor-pointer shrink-0 ${
                      isDark
                        ? "border-[#242E2A] bg-[#141A18] text-[#8FA199] hover:text-[#ECF2EF] hover:border-[#34433D]"
                        : "border-[#DFE6E2] bg-white text-[#5C6B63] hover:text-[#18201C] hover:border-[#C4D1CA]"
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
