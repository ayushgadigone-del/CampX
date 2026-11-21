import { Conversation, ChatMessage, Listing } from "../types";

const STORAGE_KEY = "campus_marketplace_user_chats";
export const CHATS_UPDATED_EVENT = "campus_chats_updated";

// Initial active negotiation threads linked to real campus listings
const INITIAL_DEMO_CHATS: Conversation[] = [
  {
    id: "conv_seed-calc-1_demo",
    listingId: "seed-calc-1",
    listingTitle: "Casio FX-991ES Plus 2nd Edition Scientific Calculator",
    listingPrice: 450,
    listingImage:
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80",
    listingCategory: "Calculators",
    listingCondition: "Good",
    sellerId: "seed-user-ayush",
    sellerName: "Ayush Gadigone",
    sellerEmail: "ayush.gadigone@pvgcoet.ac.in",
    buyerId: "student_current",
    buyerName: "You",
    buyerEmail: "student@pvgcoet.ac.in",
    participants: ["seed-user-ayush", "student_current"],
    lastMessage: "₹400 works for me! Let's meet at Central Library Quad tomorrow at 1:15 PM.",
    lastMessageTimestamp: Date.now() - 1000 * 60 * 25,
    status: "handover_scheduled",
    unread: false,
    messages: [
      {
        id: "m1",
        conversationId: "conv_seed-calc-1_demo",
        senderId: "student_current",
        senderName: "You",
        senderEmail: "student@pvgcoet.ac.in",
        text: "Hi! Is the Casio FX-991ES Plus still available? Does it include the hard slide cover?",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
      },
      {
        id: "m2",
        conversationId: "conv_seed-calc-1_demo",
        senderId: "seed-user-ayush",
        senderName: "Ayush Gadigone",
        senderEmail: "ayush.gadigone@pvgcoet.ac.in",
        text: "Yes, still available! Hard cover is included and solar + keypad both work cleanly.",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 50,
      },
      {
        id: "m3",
        conversationId: "conv_seed-calc-1_demo",
        senderId: "student_current",
        senderName: "You",
        senderEmail: "student@pvgcoet.ac.in",
        text: "Would you take ₹400 if I pick it up during lunch break?",
        type: "offer",
        offerAmount: 400,
        timestamp: Date.now() - 1000 * 60 * 35,
      },
      {
        id: "m4",
        conversationId: "conv_seed-calc-1_demo",
        senderId: "seed-user-ayush",
        senderName: "Ayush Gadigone",
        senderEmail: "ayush.gadigone@pvgcoet.ac.in",
        text: "₹400 works for me! Let's meet at Central Library Quad tomorrow at 1:15 PM.",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 25,
      },
    ],
  },
  {
    id: "conv_seed-book-1_demo",
    listingId: "seed-book-1",
    listingTitle: "Higher Engineering Mathematics (44th Edition) – B.S. Grewal",
    listingPrice: 260,
    listingImage:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
    listingCategory: "Books",
    listingCondition: "Good",
    sellerId: "seed-user-parshwa",
    sellerName: "Parshwa Gandhi",
    sellerEmail: "parshwa.gandhi@pvgcoet.ac.in",
    buyerId: "student_current",
    buyerName: "You",
    buyerEmail: "student@pvgcoet.ac.in",
    participants: ["seed-user-parshwa", "student_current"],
    lastMessage: "Can we settle at ₹220? I can collect it near the Canteen Porch after lectures.",
    lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 2,
    status: "deal_proposed",
    unread: true,
    messages: [
      {
        id: "mb1",
        conversationId: "conv_seed-book-1_demo",
        senderId: "student_current",
        senderName: "You",
        senderEmail: "student@pvgcoet.ac.in",
        text: "Hey Parshwa! Are all pages and differential equations chapters intact in this 44th edition?",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
      },
      {
        id: "mb2",
        conversationId: "conv_seed-book-1_demo",
        senderId: "seed-user-parshwa",
        senderName: "Parshwa Gandhi",
        senderEmail: "parshwa.gandhi@pvgcoet.ac.in",
        text: "Yes, binding is firm and only light pencil notes in a few chapters.",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 60 * 2.5,
      },
      {
        id: "mb3",
        conversationId: "conv_seed-book-1_demo",
        senderId: "student_current",
        senderName: "You",
        senderEmail: "student@pvgcoet.ac.in",
        text: "Can we settle at ₹220? I can collect it near the Canteen Porch after lectures.",
        type: "offer",
        offerAmount: 220,
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
      },
    ],
  },
];

/**
 * Extracts the latest monetary offer amount from a conversation's message history.
 */
export const getLatestOfferAmount = (conversation: Conversation): number | undefined => {
  const msgs = conversation.messages || [];
  for (let i = msgs.length - 1; i >= 0; i--) {
    const m = msgs[i];
    if (typeof m.offerAmount === "number" && m.offerAmount > 0) {
      return m.offerAmount;
    }
    const match = m.text?.match(/₹\s*(\d{2,6})/);
    if (match && match[1]) {
      const parsed = Number(match[1]);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }
  const fallbackMatch = conversation.lastMessage?.match(/₹\s*(\d{2,6})/);
  if (fallbackMatch && fallbackMatch[1]) {
    const parsed = Number(fallbackMatch[1]);
    if (!Number.isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return undefined;
};

/**
 * Dispatches a window event so all React components listening can re-render
 */
const notifyChatUpdates = () => {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(CHATS_UPDATED_EVENT));
  }
};

/**
 * Loads all stored chat conversations from localStorage.
 * Initializes with active student negotiation threads on first load.
 */
export const getStoredChats = (): Conversation[] => {
  if (typeof window === "undefined") return INITIAL_DEMO_CHATS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CHATS));
      return INITIAL_DEMO_CHATS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
    }
    return INITIAL_DEMO_CHATS;
  } catch (err) {
    console.warn("Could not read chats from localStorage:", err);
    return INITIAL_DEMO_CHATS;
  }
};

/**
 * Saves or updates a specific conversation in localStorage.
 */
export const saveStoredChat = (conversation: Conversation): void => {
  if (typeof window === "undefined") return;

  try {
    const currentChats = getStoredChats();
    const existingIndex = currentChats.findIndex(
      (c) => c.id === conversation.id || c.listingId === conversation.listingId
    );

    let updated: Conversation[];
    if (existingIndex >= 0) {
      updated = [...currentChats];
      updated[existingIndex] = {
        ...updated[existingIndex],
        ...conversation,
        lastMessageTimestamp: conversation.lastMessageTimestamp || Date.now(),
      };
    } else {
      updated = [conversation, ...currentChats];
    }

    updated.sort((a, b) => (b.lastMessageTimestamp || 0) - (a.lastMessageTimestamp || 0));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyChatUpdates();
  } catch (err) {
    console.warn("Could not save chat to localStorage:", err);
  }
};

/**
 * Records a new message for a product listing into the user's stored chats.
 */
export const recordChatMessage = (
  listing: Listing,
  message: ChatMessage,
  currentUser: { uid?: string; displayName?: string | null; email?: string | null } | null
): Conversation => {
  const currentChats = getStoredChats();
  const convId = message.conversationId || `conv_${listing.id}_${currentUser?.uid || "guest"}`;
  const existingConv = currentChats.find((c) => c.id === convId || c.listingId === listing.id);

  const existingMessages = existingConv?.messages || [];
  const updatedMessages = [...existingMessages.filter((m) => m.id !== message.id), message];

  let status: Conversation["status"] = existingConv?.status || "active";
  if (message.type === "offer") {
    status = "deal_proposed";
  } else if (message.type === "handover") {
    status = "handover_scheduled";
  }

  const updatedConv: Conversation = {
    id: convId,
    listingId: listing.id,
    listingTitle: listing.title,
    listingPrice: listing.price,
    listingImage: listing.imageUrl,
    listingCategory: listing.category,
    listingCondition: listing.condition,
    sellerId: listing.sellerId,
    sellerName: listing.sellerName,
    sellerEmail: listing.sellerEmail,
    buyerId: currentUser?.uid || "current-user",
    buyerName: currentUser?.displayName || "You",
    buyerEmail: currentUser?.email || "student@pvgcoet.ac.in",
    participants: [listing.sellerId, currentUser?.uid || "current-user"],
    lastMessage:
      message.text || (message.offerAmount ? `Offered ₹${message.offerAmount}` : "New message"),
    lastMessageTimestamp: message.timestamp || Date.now(),
    status,
    messages: updatedMessages,
    unread: false,
  };

  saveStoredChat(updatedConv);
  return updatedConv;
};

/**
 * Updates the negotiation status of an existing stored chat.
 */
export const updateChatStatus = (
  conversationId: string,
  status: Conversation["status"]
): void => {
  if (typeof window === "undefined") return;

  try {
    const currentChats = getStoredChats();
    const updated = currentChats.map((c) =>
      c.id === conversationId ? { ...c, status } : c
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyChatUpdates();
  } catch (err) {
    console.warn("Could not update chat status:", err);
  }
};

/**
 * Removes a conversation by ID from stored chats.
 */
export const deleteStoredChat = (conversationId: string): void => {
  if (typeof window === "undefined") return;

  try {
    const currentChats = getStoredChats();
    const updated = currentChats.filter((c) => c.id !== conversationId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    notifyChatUpdates();
  } catch (err) {
    console.warn("Could not delete chat from localStorage:", err);
  }
};

/**
 * Clears all chat history.
 */
export const clearAllStoredChats = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    notifyChatUpdates();
  } catch (err) {
    console.warn("Could not clear chats from localStorage:", err);
  }
};
