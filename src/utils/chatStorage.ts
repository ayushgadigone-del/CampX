import { Conversation, ChatMessage, Listing } from "../types";

const STORAGE_KEY = "campus_marketplace_user_chats";
export const CHATS_UPDATED_EVENT = "campus_chats_updated";

// Realistic initial chat threads so "Your Chats" demonstrates real student interactions right away
const INITIAL_DEMO_CHATS: Conversation[] = [
  {
    id: "conv_list_calc_991_demo",
    listingId: "list_calc_991",
    listingTitle: "Casio FX-991CW ClassWiz Scientific Calculator",
    listingPrice: 850,
    listingImage: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80",
    listingCategory: "Electronics",
    listingCondition: "Like New",
    sellerId: "user_rahul_sharma",
    sellerName: "Rahul Sharma",
    sellerEmail: "rahul.sharma@pvgcoet.ac.in",
    buyerId: "student_verified_curr",
    buyerName: "You",
    buyerEmail: "student@pvgcoet.ac.in",
    participants: ["user_rahul_sharma", "student_verified_curr"],
    lastMessage: "Sounds great! Let's meet at Central Library Quad tomorrow at 1:15 PM.",
    lastMessageTimestamp: Date.now() - 1000 * 60 * 25, // 25 mins ago
    status: "handover_scheduled",
    unread: false,
    messages: [
      {
        id: "m1",
        conversationId: "conv_list_calc_991_demo",
        senderId: "student_verified_curr",
        senderName: "You",
        senderEmail: "student@pvgcoet.ac.in",
        text: "Hi Rahul! Is this Casio FX-991CW still available? Does it come with the sliding protective cover?",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 60 * 2,
      },
      {
        id: "m2",
        conversationId: "conv_list_calc_991_demo",
        senderId: "user_rahul_sharma",
        senderName: "Rahul Sharma",
        senderEmail: "rahul.sharma@pvgcoet.ac.in",
        text: "Yes, absolutely! The hard sliding cover and fresh solar battery are included. I barely used it for FE sem 2.",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 50,
      },
      {
        id: "m3",
        conversationId: "conv_list_calc_991_demo",
        senderId: "student_verified_curr",
        senderName: "You",
        senderEmail: "student@pvgcoet.ac.in",
        text: "Would you take ₹800 if I pick it up during lunch break?",
        type: "offer",
        offerAmount: 800,
        timestamp: Date.now() - 1000 * 60 * 35,
      },
      {
        id: "m4",
        conversationId: "conv_list_calc_991_demo",
        senderId: "user_rahul_sharma",
        senderName: "Rahul Sharma",
        senderEmail: "rahul.sharma@pvgcoet.ac.in",
        text: "Sounds great! Let's meet at Central Library Quad tomorrow at 1:15 PM.",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 25,
      },
    ],
  },
  {
    id: "conv_list_mech_book_demo",
    listingId: "list_mech_book",
    listingTitle: "Engineering Mechanics (SPPU Revised Syllabus)",
    listingPrice: 320,
    listingImage: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80",
    listingCategory: "Books",
    listingCondition: "Good",
    sellerId: "user_sneha_kulkarni",
    sellerName: "Sneha Kulkarni",
    sellerEmail: "sneha.kulkarni@pvgcoet.ac.in",
    buyerId: "student_verified_curr",
    buyerName: "You",
    buyerEmail: "student@pvgcoet.ac.in",
    participants: ["user_sneha_kulkarni", "student_verified_curr"],
    lastMessage: "I highlighted important formulas and solved previous question papers in pencil.",
    lastMessageTimestamp: Date.now() - 1000 * 60 * 60 * 3, // 3 hours ago
    status: "active",
    unread: true,
    messages: [
      {
        id: "mb1",
        conversationId: "conv_list_mech_book_demo",
        senderId: "student_verified_curr",
        senderName: "You",
        senderEmail: "student@pvgcoet.ac.in",
        text: "Hey Sneha! Does this edition cover the latest SPPU in-sem question bank?",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 60 * 4,
      },
      {
        id: "mb2",
        conversationId: "conv_list_mech_book_demo",
        senderId: "user_sneha_kulkarni",
        senderName: "Sneha Kulkarni",
        senderEmail: "sneha.kulkarni@pvgcoet.ac.in",
        text: "I highlighted important formulas and solved previous question papers in pencil.",
        type: "text",
        timestamp: Date.now() - 1000 * 60 * 60 * 3,
      },
    ],
  },
];

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
 * Initializes with demo student chats on first load.
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
    if (Array.isArray(parsed) && parsed.length > 0) {
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

    // Sort newest first
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
    lastMessage: message.text || (message.offerAmount ? `Offered ₹${message.offerAmount}` : "New message"),
    lastMessageTimestamp: message.timestamp || Date.now(),
    status,
    messages: updatedMessages,
    unread: false,
  };

  saveStoredChat(updatedConv);
  return updatedConv;
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
    localStorage.removeItem(STORAGE_KEY);
    notifyChatUpdates();
  } catch (err) {
    console.warn("Could not clear chats from localStorage:", err);
  }
};
