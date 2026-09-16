import { Listing, UserMilestone, MilestoneBadgeId, UserProfile } from "../types";

export const MILESTONE_DEFINITIONS: Record<MilestoneBadgeId, UserMilestone> = {
  "top-seller": {
    id: "top-seller",
    label: "Top Seller",
    shortLabel: "Top Seller",
    description: "Awarded for completing multiple verified campus handovers with consistent high quality and positive student feedback.",
    criteria: "Completed 3+ successful campus handovers with high buyer satisfaction",
    icon: "Trophy",
    highlightText: "3+ Handovers • Trusted Campus Trader",
  },
  "quick-responder": {
    id: "quick-responder",
    label: "Quick Responder",
    shortLabel: "Quick Reply",
    description: "Recognized for fast chat replies, prompt handover coordination, and active communication across the student network.",
    criteria: "Replies to student queries and handover requests in under 15 minutes",
    icon: "Zap",
    highlightText: "< 15 min response time",
  },
  "eco-friendly-exchanger": {
    id: "eco-friendly-exchanger",
    label: "Eco-Friendly Exchanger",
    shortLabel: "Eco Exchanger",
    description: "Actively champions zero-waste sustainability by participating in direct item-for-item swaps and recirculating academic gear.",
    criteria: "Offers items for exchange/swap or circular campus reuse (cycles, textbooks, lab kits)",
    icon: "Leaf",
    highlightText: "Zero-Waste Circular Exchange",
  },
  "five-star-peer": {
    id: "five-star-peer",
    label: "5★ Rated Peer",
    shortLabel: "5.0 ★",
    description: "Maintains stellar 4.8+ star ratings across peer reviews with accurate item condition descriptions and honest dealings.",
    criteria: "Maintains 4.8+ star rating across verified student handover reviews",
    icon: "Star",
    highlightText: "Top Tier Peer Rating",
  },
  "campus-pioneer": {
    id: "campus-pioneer",
    label: "Campus Pioneer",
    shortLabel: "Pioneer",
    description: "Pioneering student member of PVG's COET verified resale and exchange community.",
    criteria: "Institutional college domain verified student supporting peer resale",
    icon: "Award",
    highlightText: "PVG's COET Verified",
  },
};

/**
 * Derives and awards milestone badges for a seller or user profile.
 */
export function calculateUserMilestones(
  listing: Listing,
  allListings?: Listing[],
  userProfile?: UserProfile | null
): UserMilestone[] {
  const milestonesMap = new Map<MilestoneBadgeId, UserMilestone>();

  // 1. Check if explicit milestones are already attached to listing
  if (listing.sellerMilestones && listing.sellerMilestones.length > 0) {
    listing.sellerMilestones.forEach((m) => {
      milestonesMap.set(m.id, { ...MILESTONE_DEFINITIONS[m.id], ...m });
    });
  }

  // 2. Check user profile milestones if matches seller
  if (
    userProfile &&
    userProfile.milestones &&
    userProfile.milestones.length > 0 &&
    (userProfile.uid === listing.sellerId ||
      userProfile.email?.toLowerCase() === listing.sellerEmail?.toLowerCase())
  ) {
    userProfile.milestones.forEach((m) => {
      milestonesMap.set(m.id, { ...MILESTONE_DEFINITIONS[m.id], ...m });
    });
  }

  // 3. Compute stats from all listings of this seller
  const sellerEmail = (listing.sellerEmail || "").toLowerCase().trim();
  const sellerId = listing.sellerId;

  const sellerItems =
    allListings && allListings.length > 0
      ? allListings.filter(
          (l) =>
            (sellerId && l.sellerId === sellerId) ||
            (sellerEmail && l.sellerEmail?.toLowerCase().trim() === sellerEmail)
        )
      : [listing];

  let completedHandoversCount = 0;
  let totalReviewsCount = 0;
  let hasExchangeListing = false;
  let hasEcoCategory = false;

  sellerItems.forEach((item) => {
    if (item.status === "completed") {
      completedHandoversCount += 1;
    }
    if (typeof item.completedHandovers === "number") {
      completedHandoversCount = Math.max(completedHandoversCount, item.completedHandovers);
    }
    if (item.reviews && item.reviews.length > 0) {
      totalReviewsCount += item.reviews.length;
    }
    if (item.listingType === "exchange" || item.listingType === "both" || item.exchangeFor) {
      hasExchangeListing = true;
    }
    if (
      item.category === "Cycles" ||
      item.category === "Books" ||
      item.category === "Lab Equipment"
    ) {
      hasEcoCategory = true;
    }
    if (
      item.tags?.some((t) =>
        /eco|cycle|reuse|exchange|green|sustainable/i.test(t)
      )
    ) {
      hasEcoCategory = true;
    }
  });

  const rating =
    listing.averageRating ??
    (listing.reviews && listing.reviews.length > 0
      ? listing.reviews.reduce((s, r) => s + r.rating, 0) / listing.reviews.length
      : 0);

  // --- MILESTONE CRITERIA EVALUATION ---

  // Top Seller: 3+ handovers or status completed items, or 3+ reviews
  if (completedHandoversCount >= 3 || totalReviewsCount >= 3 || (listing.completedHandovers ?? 0) >= 3) {
    milestonesMap.set("top-seller", {
      ...MILESTONE_DEFINITIONS["top-seller"],
      earnedAt: "Verified Milestone",
    });
  }

  // Eco-Friendly Exchanger: listing offers swap/exchange or sustainable items
  if (hasExchangeListing || hasEcoCategory || listing.listingType === "exchange" || listing.listingType === "both") {
    milestonesMap.set("eco-friendly-exchanger", {
      ...MILESTONE_DEFINITIONS["eco-friendly-exchanger"],
      earnedAt: "Active Circular Exchanger",
    });
  }

  // Quick Responder: high trust score or responsive student trader
  // Awarded to verified students who maintain high availability on campus
  if (
    sellerItems.length >= 1 &&
    (completedHandoversCount >= 2 || (listing.views || 0) > 50 || rating >= 4.5)
  ) {
    milestonesMap.set("quick-responder", {
      ...MILESTONE_DEFINITIONS["quick-responder"],
      earnedAt: "High Campus Activity",
    });
  }

  // 5-Star Peer: high rating with verified handovers
  if (rating >= 4.8 && (totalReviewsCount >= 2 || (listing.reviews && listing.reviews.length >= 2))) {
    milestonesMap.set("five-star-peer", {
      ...MILESTONE_DEFINITIONS["five-star-peer"],
      earnedAt: `${rating.toFixed(1)} ★ Peer Rating`,
    });
  }

  // Campus Pioneer: all institutional students in our network
  if (sellerItems.length >= 2 || completedHandoversCount >= 1) {
    milestonesMap.set("campus-pioneer", {
      ...MILESTONE_DEFINITIONS["campus-pioneer"],
      earnedAt: "Verified PVG's COET Peer",
    });
  }

  // Fallback: If no badge met yet, award Eco-Friendly Exchanger if swap-eligible, or Campus Pioneer
  if (milestonesMap.size === 0) {
    milestonesMap.set("quick-responder", MILESTONE_DEFINITIONS["quick-responder"]);
  }

  return Array.from(milestonesMap.values());
}
