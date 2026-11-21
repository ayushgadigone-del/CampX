import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Send,
  Calendar as CalendarIcon,
  MessageCircle,
  Tag,
  CheckCircle2,
  DollarSign,
  MapPin,
  Sparkles,
  Zap,
  Building,
  Clock,
  HelpCircle,
  ChevronRight,
  WifiOff,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Conversation, ChatMessage, Listing } from "../types";
import { recordChatMessage, getStoredChats, saveStoredChat } from "../utils/chatStorage";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { sanitizeText, detectSuspiciousChatContent } from "../utils/security";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeListing: Listing | null;
  currentUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
  } | null;
  onOpenCalendarFromChat: (listing: Listing, otherPartyName: string, otherPartyEmail?: string) => void;
  isOnline?: boolean;
  initialMessage?: string;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  isOpen,
  onClose,
  activeListing,
  currentUser,
  onOpenCalendarFromChat,
  isOnline = true,
  initialMessage = "",
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialMessage || "");
  const [offerInput, setOfferInput] = useState<string>("");
  const [showOfferBox, setShowOfferBox] = useState(false);
  const [quickReplyFilter, setQuickReplyFilter] = useState<"all" | "negotiate" | "meetup" | "questions">("all");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const chatInputRef = useRef<HTMLInputElement | null>(null);

  // Sync initialMessage when drawer opens with a prefilled question
  useEffect(() => {
    if (isOpen && initialMessage) {
      setInputText(initialMessage);
      setTimeout(() => {
        chatInputRef.current?.focus();
        chatInputRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialMessage]);

  // Generate conversation ID based on listing and participants
  const conversationId = activeListing
    ? `conv_${activeListing.id}_${currentUser?.uid || "guest"}`
    : "general_conv";

  // Auto scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // Initial greeting if no messages
  useEffect(() => {
    if (!isOpen || !activeListing) return;

    // Check if we have existing stored messages for this conversation
    const storedChats = getStoredChats();
    const existing = storedChats.find(
      (c) => c.listingId === activeListing.id || c.id === conversationId
    );

    if (existing && existing.messages && existing.messages.length > 0) {
      setMessages(existing.messages);
    } else {
      // Set initial mock message if empty
      const initialMsg: ChatMessage = {
        id: "msg_init",
        conversationId,
        senderId: activeListing.sellerId,
        senderName: activeListing.sellerName,
        senderEmail: activeListing.sellerEmail,
        text: `Hi! Thanks for checking out my listing "${activeListing.title}". Feel free to make an offer or suggest a campus meeting spot for handover.`,
        type: "text",
        timestamp: Date.now() - 3600000,
      };

      setMessages([initialMsg]);
    }

    // Listen to firestore subcollection if available
    try {
      const messagesRef = collection(db, "conversations", conversationId, "messages");
      const q = query(messagesRef, orderBy("timestamp", "asc"));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const fetched: ChatMessage[] = [];
            snapshot.forEach((docSnap) => {
              fetched.push({ id: docSnap.id, ...(docSnap.data() as any) });
            });
            setMessages(fetched);
          }
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, `conversations/${conversationId}/messages`);
        }
      );
      return () => unsubscribe();
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `conversations/${conversationId}/messages`);
    }
  }, [isOpen, activeListing, conversationId]);

  if (!isOpen || !activeListing) return null;

  const isSeller = currentUser?.uid === activeListing.sellerId;
  const otherPartyName = isSeller ? "Student Buyer" : activeListing.sellerName;
  const otherPartyEmail = isSeller ? "student@college.edu.in" : activeListing.sellerEmail;

  // Pre-calculated offer amounts based on listing price
  const listingPrice = activeListing.price || 0;
  const offer10 = listingPrice > 0 ? Math.max(10, Math.round((listingPrice * 0.9) / 10) * 10) : 0;
  const offer15 = listingPrice > 0 ? Math.max(10, Math.round((listingPrice * 0.85) / 10) * 10) : 0;
  const offer20 = listingPrice > 0 ? Math.max(10, Math.round((listingPrice * 0.8) / 10) * 10) : 0;

  const handleSendMessage = async (customText?: string, type: ChatMessage["type"] = "text", offer?: number) => {
    if (!isOnline) return;
    const rawText = (customText || inputText).trim();
    if (!rawText && !offer) return;
    const textToSend = sanitizeText(rawText);

    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser?.uid || "current-user",
      senderName: currentUser?.displayName || "You",
      senderEmail: currentUser?.email || "student@college.edu.in",
      text: textToSend,
      type,
      offerAmount: offer,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
    setShowOfferBox(false);

    // Save to user's stored chats
    recordChatMessage(activeListing, newMsg, currentUser);

    // Save to Firestore
    try {
      // Upsert conversation metadata
      await setDoc(
        doc(db, "conversations", conversationId),
        {
          id: conversationId,
          listingId: activeListing.id,
          listingTitle: activeListing.title,
          listingPrice: activeListing.price,
          listingImage: activeListing.imageUrl,
          sellerId: activeListing.sellerId,
          buyerId: currentUser?.uid || "guest",
          participants: [activeListing.sellerId, currentUser?.uid || "guest"],
          lastMessage: textToSend || `Offered ₹${offer}`,
          lastMessageTimestamp: Date.now(),
        },
        { merge: true }
      );

      // Add to messages subcollection
      await addDoc(
        collection(db, "conversations", conversationId, "messages"),
        newMsg
      );
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `conversations/${conversationId}/messages`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/55">
      <div
        id="chat-drawer"
        className="w-full max-w-md h-full bg-white dark:bg-[#141A18] shadow-2xl flex flex-col justify-between border-l border-[#DFE6E2] dark:border-[#242E2A]"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#DFE6E2] dark:border-[#242E2A] bg-[#F7F9F8] dark:bg-[#111715] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#2F5D50] text-white flex items-center justify-center font-bold text-sm shadow-sm">
              {otherPartyName.charAt(0)}
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#18201C] dark:text-[#ECF2EF] leading-tight">
                {otherPartyName}
              </h3>
              <span className="text-[11px] text-[#5C6B63] dark:text-[#8FA199]">
                PVG&apos;s COET Student
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#8FA199] hover:text-[#5C6B63] hover:bg-[#DFE6E2] dark:hover:bg-[#242E2A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Listing preview card */}
        <div className="p-3 mx-4 mt-3 rounded-xl bg-[#F7F9F8] dark:bg-[#111715] border border-[#DFE6E2] dark:border-[#242E2A] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={activeListing.imageUrl}
              alt={activeListing.title}
              className="w-11 h-11 rounded-lg object-cover shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0">
              <span className="text-xs font-bold text-[#18201C] dark:text-[#ECF2EF] truncate block">
                {activeListing.title}
              </span>
              <span className="text-xs font-extrabold text-[#2F5D50] dark:text-[#7BBFA8]">
                ₹{activeListing.price}
              </span>
            </div>
          </div>

          <button
            onClick={() => onOpenCalendarFromChat(activeListing, otherPartyName, otherPartyEmail)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] text-white text-xs font-bold shrink-0 shadow-xs transition-colors cursor-pointer"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Schedule Meet
          </button>
        </div>

        {/* Campus Safe Handover & Anti-Scam Shield Banner */}
        <div className="mx-4 mt-2 px-3 py-2 rounded-xl bg-[#EFF4F1] dark:bg-[#182823] border border-[#C4D9D1] dark:border-[#2A4A40] text-[#2F5D50] dark:text-[#7BBFA8] text-[11px] flex items-center gap-2 shadow-2xs">
          <ShieldCheck className="w-4 h-4 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
          <div className="leading-tight">
            <span className="font-bold">Campus Security: </span>
            <span className="text-[#2F5D50] dark:text-[#7BBFA8]">
              Handover on campus. Never share UPI PINs or send advance payments.
            </span>
          </div>
        </div>

        {/* Offline Banner Inside Drawer */}
        {!isOnline && (
          <div
            id="chat-drawer-offline-banner"
            className="mx-4 mt-2.5 p-2.5 rounded-xl bg-[#FDF6EC] dark:bg-[#251F15] border border-[#EED8B8] dark:border-[#4A3B23] text-[#9E6B43] dark:text-[#DFC29B] text-xs flex items-center gap-2 shadow-2xs"
          >
            <WifiOff className="w-4 h-4 text-[#9E6B43] dark:text-[#DFC29B] shrink-0" />
            <div className="leading-tight">
              <span className="font-bold block">Offline Mode Active</span>
              <span className="text-[11px] text-[#9E6B43] dark:text-[#DFC29B]">
                Messaging, quick replies, and offers are temporarily disabled to prevent lost messages.
              </span>
            </div>
          </div>
        )}

        {/* Messages Feed */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg) => {
            const isMe = msg.senderId === (currentUser?.uid || "current-user");
            const scamCheck = detectSuspiciousChatContent(msg.text);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                    isMe
                      ? "bg-[#2F5D50] text-white rounded-br-xs"
                      : "bg-[#EFF4F1] dark:bg-[#1B2320] text-[#18201C] dark:text-[#ECF2EF] rounded-bl-xs border border-[#DFE6E2] dark:border-[#242E2A]"
                  }`}
                >
                  {msg.type === "offer" && (
                    <div className="mb-1 pb-1 border-b border-white/20 font-bold flex items-center gap-1 text-[11px]">
                      <Tag className="w-3 h-3" />
                      Special Deal Offer: ₹{msg.offerAmount}
                    </div>
                  )}
                  <p>{msg.text}</p>
                </div>

                {/* Inline Suspicious Behavior Alert */}
                {scamCheck.isSuspicious && (
                  <div className="max-w-[85%] mt-1 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/40 text-[#9E6B43] dark:text-[#DFC29B] text-[10px] flex items-start gap-1.5 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5 text-[#9E6B43] dark:text-[#DFC29B] shrink-0 mt-0.5" />
                    <span>
                      <strong>Safety Alert:</strong> {scamCheck.reason}. Do not transfer advance money or enter your UPI PIN.
                    </span>
                  </div>
                )}

                <span className="text-[10px] text-[#8FA199] mt-1 px-1">
                  {new Date(msg.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Reply Expedite Panel */}
        <div id="quick-replies-container" className="border-t border-[#DFE6E2] dark:border-[#242E2A] bg-[#F7F9F8] dark:bg-[#111715] p-2.5 space-y-2">
          {/* Quick Replies Header & Filter Chips */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
              <span className="text-[11px] font-bold text-[#18201C] dark:text-[#ECF2EF] tracking-tight">
                Quick Replies
              </span>
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full bg-[#EFF4F1] dark:bg-[#1B2320] text-[#2F5D50] dark:text-[#7BBFA8] border border-[#C4D9D1] dark:border-[#2A4A40] hidden sm:inline-block">
                1-tap send
              </span>
            </div>

            {/* Quick Filter tabs */}
            <div className="flex items-center gap-1">
              {(["all", "negotiate", "meetup", "questions"] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  disabled={!isOnline}
                  onClick={() => setQuickReplyFilter(filter)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors capitalize ${
                    !isOnline
                      ? "text-[#8FA199] cursor-not-allowed"
                      : quickReplyFilter === filter
                      ? "bg-[#2F5D50] text-white shadow-2xs cursor-pointer"
                      : "text-[#5C6B63] dark:text-[#8FA199] hover:text-[#18201C] dark:hover:text-[#ECF2EF] hover:bg-[#DFE6E2] dark:hover:bg-[#242E2A] cursor-pointer"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Reply Buttons Carousel / List */}
          {!isOnline ? (
            <div className="py-1 px-1 flex items-center gap-2 text-xs text-[#5C6B63] dark:text-[#8FA199] italic bg-[#EFF4F1] dark:bg-[#1B2320] rounded-lg">
              <WifiOff className="w-3.5 h-3.5 text-[#8FA199] shrink-0 ml-1" />
              <span>Quick replies are unavailable while offline.</span>
            </div>
          ) : (
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar items-center">
              {/* 1. "Is this still available?" */}
            {(quickReplyFilter === "all" || quickReplyFilter === "questions") && (
              <button
                id="quick-reply-is-available"
                type="button"
                onClick={() => handleSendMessage("Hi! Is this still available?")}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#DFE6E2] dark:border-[#242E2A] hover:border-[#C4D9D1] dark:hover:border-[#5BA18C] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#2F5D50] dark:hover:text-[#7BBFA8] font-medium whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Ask if the listing is still available"
              >
                <CheckCircle2 className="w-3 h-3 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
                <span>Is this still available?</span>
              </button>
            )}

            {/* 2. "Can we meet at the library?" */}
            {(quickReplyFilter === "all" || quickReplyFilter === "meetup") && (
              <button
                id="quick-reply-meet-library"
                type="button"
                onClick={() => handleSendMessage("Can we meet at the library to inspect and exchange?")}
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#DFE6E2] dark:border-[#242E2A] hover:border-[#C4D9D1] dark:hover:border-[#5BA18C] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#2F5D50] dark:hover:text-[#7BBFA8] font-medium whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Suggest campus library as handover spot"
              >
                <Building className="w-3 h-3 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
                <span>Can we meet at the library?</span>
              </button>
            )}

            {/* 3. "Would you take [Price]?" - Dynamic & interactive */}
            {(quickReplyFilter === "all" || quickReplyFilter === "negotiate") && (
              <>
                <button
                  id="quick-reply-would-you-take-price"
                  type="button"
                  onClick={() => {
                    setShowOfferBox(!showOfferBox);
                    if (!offerInput && offer10 > 0) {
                      setOfferInput(String(offer10));
                    }
                  }}
                  className={`px-2.5 py-1.5 rounded-xl font-bold whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer ${
                    showOfferBox
                      ? "bg-[#2F5D50] text-white border border-[#2A4A40]"
                      : "bg-[#EFF4F1] dark:bg-[#1B2320] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#C4D9D1] dark:border-[#2A4A40] text-[#2F5D50] dark:text-[#7BBFA8]"
                  }`}
                  title="Make a custom price counter offer"
                >
                  <DollarSign className="w-3 h-3 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
                  <span>Would you take [Price]?</span>
                </button>

                {/* Instant calculated price quick buttons if price > 0 */}
                {listingPrice > 0 && offer10 > 0 && (
                  <button
                    id="quick-reply-offer-10"
                    type="button"
                    onClick={() =>
                      handleSendMessage(
                        `Would you take ₹${offer10} for ${activeListing.title}? I can pick it up today on campus.`,
                        "offer",
                        offer10
                      )
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#DFE6E2] dark:border-[#242E2A] hover:border-[#C4D9D1] dark:hover:border-[#5BA18C] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#2F5D50] dark:hover:text-[#7BBFA8] font-medium whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title={`Instantly offer ₹${offer10} (10% student discount)`}
                  >
                    <Tag className="w-3 h-3 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
                    <span>Would you take ₹{offer10}?</span>
                    <span className="text-[9px] px-1 rounded bg-[#EFF4F1] dark:bg-[#1B2320] text-[#2F5D50] dark:text-[#7BBFA8] font-bold">
                      -10%
                    </span>
                  </button>
                )}

                {listingPrice > 0 && offer20 > 0 && (
                  <button
                    id="quick-reply-offer-20"
                    type="button"
                    onClick={() =>
                      handleSendMessage(
                        `Would you take ₹${offer20} for ${activeListing.title}? Can meet between classes.`,
                        "offer",
                        offer20
                      )
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#DFE6E2] dark:border-[#242E2A] hover:border-[#C4D9D1] dark:hover:border-[#5BA18C] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#2F5D50] dark:hover:text-[#7BBFA8] font-medium whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title={`Instantly offer ₹${offer20} (20% student discount)`}
                  >
                    <Tag className="w-3 h-3 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
                    <span>Would you take ₹{offer20}?</span>
                    <span className="text-[9px] px-1 rounded bg-[#EFF4F1] dark:bg-[#1B2320] text-[#2F5D50] dark:text-[#7BBFA8] font-bold">
                      -20%
                    </span>
                  </button>
                )}

                <button
                  id="quick-reply-is-negotiable"
                  type="button"
                  onClick={() => handleSendMessage("Hi! Is the price negotiable for students?")}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#DFE6E2] dark:border-[#242E2A] hover:border-[#C4D9D1] dark:hover:border-[#5BA18C] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#2F5D50] dark:hover:text-[#7BBFA8] font-medium whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Ask if price is negotiable"
                >
                  <HelpCircle className="w-3 h-3 text-amber-500 shrink-0" />
                  <span>Is price negotiable?</span>
                </button>
              </>
            )}

            {/* Meetup spots & timing */}
            {(quickReplyFilter === "all" || quickReplyFilter === "meetup") && (
              <>
                {activeListing.locationPreference && (
                  <button
                    id="quick-reply-preferred-location"
                    type="button"
                    onClick={() =>
                      handleSendMessage(
                        `Can we meet at ${activeListing.locationPreference} for the exchange?`
                      )
                    }
                    className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#DFE6E2] dark:border-[#242E2A] hover:border-[#C4D9D1] dark:hover:border-[#5BA18C] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#2F5D50] dark:hover:text-[#7BBFA8] font-medium whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                    title={`Suggest seller's preferred location: ${activeListing.locationPreference}`}
                  >
                    <MapPin className="w-3 h-3 text-rose-500 shrink-0" />
                    <span>Meet at {activeListing.locationPreference}?</span>
                  </button>
                )}

                <button
                  id="quick-reply-meet-today"
                  type="button"
                  onClick={() => handleSendMessage("Can we meet today after classes for handover?")}
                  className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#DFE6E2] dark:border-[#242E2A] hover:border-[#C4D9D1] dark:hover:border-[#5BA18C] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#2F5D50] dark:hover:text-[#7BBFA8] font-medium whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                  title="Ask for handover today after classes"
                >
                  <Clock className="w-3 h-3 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
                  <span>Meet today after class?</span>
                </button>
              </>
            )}

            {/* Questions & Condition */}
            {(quickReplyFilter === "all" || quickReplyFilter === "questions") && (
              <button
                id="quick-reply-photos-details"
                type="button"
                onClick={() =>
                  handleSendMessage("Could you share a few more photos or details about the item's condition?")
                }
                className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] border border-[#DFE6E2] dark:border-[#242E2A] hover:border-[#C4D9D1] dark:hover:border-[#5BA18C] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#2F5D50] dark:hover:text-[#7BBFA8] font-medium whitespace-nowrap shadow-2xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                title="Ask for condition details or more photos"
              >
                <Sparkles className="w-3 h-3 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
                <span>Can you share more photos?</span>
              </button>
            )}
            </div>
          )}

          {/* Dedicated "Would you take [Price]?" Offer Box */}
          {showOfferBox && (
            <div
              id="quick-reply-offer-box"
              className="p-3 bg-[#EFF4F1] dark:bg-[#1B2320] rounded-xl border border-[#C4D9D1] dark:border-[#2A4A40] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#2F5D50] dark:text-[#7BBFA8]">
                  <DollarSign className="w-3.5 h-3.5 text-[#2F5D50] dark:text-[#7BBFA8]" />
                  <span>Negotiation Offer: &ldquo;Would you take [Price]?&rdquo;</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowOfferBox(false)}
                  className="text-[11px] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#18201C] dark:hover:text-[#ECF2EF] font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {/* Quick discount chips */}
              {listingPrice > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap text-[10px]">
                  <span className="text-[#2F5D50] dark:text-[#7BBFA8] font-medium">Quick presets:</span>
                  <button
                    type="button"
                    onClick={() => setOfferInput(String(offer10))}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-[#141A18] border border-[#C4D9D1] dark:border-[#2A4A40] text-[#2F5D50] dark:text-[#7BBFA8] font-bold hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] transition-colors cursor-pointer"
                  >
                    -10% (₹{offer10})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferInput(String(offer15))}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-[#141A18] border border-[#C4D9D1] dark:border-[#2A4A40] text-[#2F5D50] dark:text-[#7BBFA8] font-bold hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] transition-colors cursor-pointer"
                  >
                    -15% (₹{offer15})
                  </button>
                  <button
                    type="button"
                    onClick={() => setOfferInput(String(offer20))}
                    className="px-2 py-0.5 rounded-md bg-white dark:bg-[#141A18] border border-[#C4D9D1] dark:border-[#2A4A40] text-[#2F5D50] dark:text-[#7BBFA8] font-bold hover:bg-[#EFF4F1] dark:hover:bg-[#222D29] transition-colors cursor-pointer"
                  >
                    -20% (₹{offer20})
                  </button>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-[#5C6B63] dark:text-[#8FA199]">
                    ₹
                  </span>
                  <input
                    id="quick-reply-offer-input"
                    type="number"
                    disabled={!isOnline}
                    placeholder={`Enter your offer (e.g. ${offer10 || 250})`}
                    value={offerInput}
                    onChange={(e) => setOfferInput(e.target.value)}
                    className="w-full pl-6 pr-3 py-1.5 text-xs rounded-lg border border-[#C4D9D1] dark:border-[#2A4A40] bg-white dark:bg-[#141A18] font-semibold text-[#18201C] dark:text-[#ECF2EF] focus:outline-none focus:ring-2 focus:ring-[#2F5D50] disabled:bg-[#EFF4F1] disabled:text-[#8FA199] disabled:cursor-not-allowed"
                    autoFocus
                  />
                </div>
                <button
                  id="send-quick-offer-btn"
                  type="button"
                  disabled={!isOnline}
                  onClick={() => {
                    if (offerInput && isOnline) {
                      handleSendMessage(
                        `Would you take ₹${offerInput} for "${activeListing.title}"? I can meet on campus for inspection.`,
                        "offer",
                        Number(offerInput)
                      );
                      setOfferInput("");
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-white text-xs font-bold shadow-xs transition-colors shrink-0 flex items-center gap-1 ${
                    !isOnline
                      ? "bg-[#DFE6E2] dark:bg-[#242E2A] text-[#8FA199] cursor-not-allowed opacity-70"
                      : "bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] cursor-pointer"
                  }`}
                >
                  <Send className="w-3 h-3" />
                  <span>Send Offer</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Input */}
        <div className="p-3 border-t border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] flex items-center gap-2">
          <input
            id="chat-text-input"
            ref={chatInputRef}
            type="text"
            disabled={!isOnline}
            placeholder={
              !isOnline
                ? "Chat disabled while offline (preventing data loss)..."
                : "Type a message or negotiation note..."
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && isOnline) handleSendMessage();
            }}
            className={`flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none transition-colors ${
              !isOnline
                ? "border-[#DFE6E2] dark:border-[#242E2A] bg-[#F7F9F8] dark:bg-[#111715] text-[#8FA199] placeholder:text-[#8FA199] cursor-not-allowed"
                : "border-[#C4D1CA] dark:border-[#34433D] bg-white dark:bg-[#141A18] text-[#18201C] dark:text-[#ECF2EF] focus:ring-2 focus:ring-[#2F5D50]"
            }`}
          />
          <button
            id="chat-send-btn"
            disabled={!isOnline}
            onClick={() => {
              if (!isOnline) return;
              handleSendMessage();
            }}
            className={`p-2.5 rounded-xl transition-colors select-none ${
              !isOnline
                ? "bg-[#DFE6E2] text-[#8FA199] cursor-not-allowed"
                : "bg-[#2F5D50] hover:bg-[#244A3F] text-white cursor-pointer shadow-sm"
            }`}
            title={!isOnline ? "Chat is disabled while offline" : "Send message"}
          >
            {!isOnline ? <WifiOff className="w-4 h-4" /> : <Send className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
