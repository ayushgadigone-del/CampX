export type ItemCategory =
  | "Books"
  | "Calculators"
  | "Lab Equipment"
  | "Cycles"
  | "Bags"
  | "Other";

export type ItemCondition = "Like New" | "Good" | "Fair" | "Wear & Tear";

export type ListingType = "sell" | "exchange" | "both";

export type ListingStatus =
  | "available"
  | "reserved"
  | "handover_scheduled"
  | "completed"
  | "inactive";

export interface AIInspectionResult {
  title: string;
  category: ItemCategory;
  condition: ItemCondition;
  categoryConfidence?: number;
  categoryReasoning?: string;
  conditionReasoning?: string;
  inspectionScore: number;
  conditionDetails: string;
  conditionNotes?: string;
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  keyFeatures: string[];
  recommendedHandoverTips: string;
  authenticityCheck?: string;
}

export interface HandoverDetails {
  scheduledDate: string;
  scheduledTime: string;
  location: string;
  calendarEventId?: string;
  calendarLink?: string;
  notes?: string;
}

export interface Review {
  id: string;
  listingId: string;
  reviewerId: string;
  reviewerName: string;
  reviewerEmail?: string;
  reviewerDepartment?: string;
  reviewerYear?: string;
  rating: number; // 1 to 5
  comment: string;
  handoverLocation?: string;
  conditionMatched?: boolean;
  createdAt: string;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category: ItemCategory;
  condition: ItemCondition;
  listingType: ListingType;
  price: number;
  exchangeFor?: string;
  imageUrl: string;
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  sellerPhoto?: string;
  department?: string;
  year?: string;
  status: ListingStatus;
  locationPreference?: string;
  tags?: string[];
  aiInspection?: AIInspectionResult;
  handoverDetails?: HandoverDetails;
  reviews?: Review[];
  averageRating?: number;
  totalReviews?: number;
  expiryDate?: string;
  isReported?: boolean;
  reportReason?: string;
  reportedAt?: string;
  reportedBy?: string;
  sellerRating?: number;
  sellerReviewCount?: number;
  createdAt: string;
}

export interface Conversation {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingImage: string;
  sellerId: string;
  buyerId: string;
  buyerName?: string;
  buyerEmail?: string;
  sellerName?: string;
  sellerEmail?: string;
  participants: string[];
  lastMessage: string;
  lastMessageTimestamp: number;
  updatedAt?: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderEmail: string;
  text: string;
  type: "text" | "offer" | "handover";
  offerAmount?: number;
  handoverProposal?: {
    date: string;
    time: string;
    location: string;
  };
  timestamp: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  collegeVerified: boolean;
  department?: string;
  year?: string;
}

export interface AlertSubscription {
  id: string;
  keyword: string; // e.g. "Casio Calculator", "Drafter", "B.S. Grewal"
  category?: ItemCategory | "All";
  maxPrice?: number;
  active: boolean;
  createdAt: string;
  matchCount: number;
  lastTriggeredAt?: string;
}

export interface AlertMatchEvent {
  id: string;
  alertId: string;
  alertKeyword: string;
  alertCategory?: ItemCategory | "All";
  listing: Listing;
  timestamp: number;
}
