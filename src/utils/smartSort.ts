import { Listing } from "../types";

export interface SmartSortBreakdown {
  totalScore: number;
  aiScore: number;
  recencyScore: number;
}

/**
 * Computes a weighted Smart Sort score (0-100) combining:
 * 1. Item Condition / AI Inspection Score (60% weight)
 * 2. Recency (40% weight)
 */
export function calculateSmartSortScore(
  item: Listing,
  _allListings?: Listing[]
): number {
  return getSmartSortBreakdown(item).totalScore;
}

export function getSmartSortBreakdown(item: Listing): SmartSortBreakdown {
  let aiScore = 65;
  if (item.aiInspection && typeof item.aiInspection.inspectionScore === "number") {
    aiScore = Math.min(100, Math.max(0, item.aiInspection.inspectionScore));
  } else {
    switch (item.condition) {
      case "Like New":
        aiScore = 82;
        break;
      case "Good":
        aiScore = 70;
        break;
      case "Fair":
        aiScore = 54;
        break;
      case "Wear & Tear":
        aiScore = 38;
        break;
      default:
        aiScore = 60;
    }
  }

  const itemDate = new Date(item.createdAt).getTime();
  const now = Date.now();
  const diffDays = Math.max(
    0,
    (now - (isNaN(itemDate) ? now : itemDate)) / (1000 * 60 * 60 * 24)
  );
  const recencyScore = Math.max(10, Math.round(100 * Math.exp(-diffDays / 12)));

  const totalScore = Math.round(aiScore * 0.6 + recencyScore * 0.4);

  return {
    totalScore,
    aiScore,
    recencyScore,
  };
}
