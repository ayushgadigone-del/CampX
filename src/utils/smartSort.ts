import { Listing } from "../types";
import { calculateSellerReputation } from "./reputation";

export interface SmartSortBreakdown {
  totalScore: number;
  aiScore: number;
  trustScore: number;
  recencyScore: number;
  qualityBadge?: string;
}

/**
 * Computes a weighted Smart Sort score (0-100+) combining:
 * 1. AI Inspection Score (40% weight): Verifies item condition, authenticity, and quality
 * 2. Seller Trust Rating (35% weight): College verification, completed handovers, and student reviews
 * 3. Recency (25% weight): Ensures active, fresh listings are surfaced promptly for new users
 */
export function calculateSmartSortScore(
  item: Listing,
  allListings?: Listing[]
): number {
  return getSmartSortBreakdown(item, allListings).totalScore;
}

export function getSmartSortBreakdown(
  item: Listing,
  allListings?: Listing[]
): SmartSortBreakdown {
  // 1. AI Inspection Score (0-100)
  let aiScore = 65; // safe default baseline
  if (item.aiInspection && typeof item.aiInspection.inspectionScore === "number") {
    aiScore = Math.min(100, Math.max(0, item.aiInspection.inspectionScore));
  } else {
    // Condition-based conservative estimation
    switch (item.condition) {
      case "Like New":
        aiScore = 78;
        break;
      case "Good":
        aiScore = 68;
        break;
      case "Fair":
        aiScore = 52;
        break;
      case "Wear & Tear":
        aiScore = 38;
        break;
      default:
        aiScore = 60;
    }
  }

  // 2. Seller Trust Rating (0-100)
  let trustScore = 70; // verified campus peer baseline
  try {
    const rep = calculateSellerReputation(item, allListings);
    trustScore = rep.trustScore;
  } catch {
    if (typeof item.sellerRating === "number") {
      trustScore = Math.min(100, item.sellerRating * 20);
    } else if (typeof item.averageRating === "number") {
      trustScore = Math.min(100, item.averageRating * 20);
    }
  }

  // 3. Recency Score (0-100)
  const itemDate = new Date(item.createdAt).getTime();
  const now = Date.now();
  const diffDays = Math.max(0, (now - (isNaN(itemDate) ? now : itemDate)) / (1000 * 60 * 60 * 24));
  // Half-life decay over ~14 days
  const recencyScore = Math.max(10, Math.round(100 * Math.exp(-diffDays / 12)));

  // Weighted composite score (40% AI Inspection + 35% Seller Trust + 25% Recency)
  let totalScore = Math.round(
    aiScore * 0.40 +
    trustScore * 0.35 +
    recencyScore * 0.25
  );

  // High-quality booster: If item is inspected with score >= 90 and verified seller
  if (item.aiInspection && item.aiInspection.inspectionScore >= 90 && trustScore >= 75) {
    totalScore = Math.min(100, totalScore + 4);
  }

  let qualityBadge: string | undefined;
  if (totalScore >= 88) {
    qualityBadge = "Top Quality Choice";
  } else if (totalScore >= 78) {
    qualityBadge = "Verified Campus Value";
  }

  return {
    totalScore,
    aiScore,
    trustScore,
    recencyScore,
    qualityBadge,
  };
}
