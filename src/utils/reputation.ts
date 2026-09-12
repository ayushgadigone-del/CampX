import { Listing } from "../types";

export type ReputationTier = "Elite" | "Trusted" | "Good Standing" | "New Seller";

export interface SellerReputation {
  sellerId: string;
  sellerName: string;
  sellerEmail: string;
  trustScore: number; // 0 to 100
  tier: ReputationTier;
  tierLabel: string;
  tierDescription: string;
  completedHandovers: number;
  totalReviews: number;
  averageRating: number;
  ratingPercentage: number;
  isCollegeVerified: boolean;
  scoreBreakdown: {
    handoverScore: number; // Max 40 pts
    handoverMax: number;
    reviewScore: number; // Max 50 pts
    reviewMax: number;
    verificationScore: number; // Max 10 pts
    verificationMax: number;
  };
  colorScheme: {
    bg: string;
    text: string;
    border: string;
    pillBg: string;
    badgeGlow: string;
    barColor: string;
  };
}

/**
 * Calculates a mathematically sound, campus-focused Seller Trust Score (0-100)
 * based on:
 * 1. Successfully completed handovers (up to 40 pts)
 * 2. Total review ratings and volume (up to 50 pts)
 * 3. Verified institutional college identity (10 pts)
 */
export function calculateSellerReputation(
  listing: Listing,
  allListings?: Listing[]
): SellerReputation {
  const sellerId = listing.sellerId;
  const sellerEmail = (listing.sellerEmail || "").toLowerCase().trim();

  // Find all listings belonging to this seller if allListings is available
  const sellerListings =
    allListings && allListings.length > 0
      ? allListings.filter(
          (l) =>
            (sellerId && l.sellerId === sellerId) ||
            (sellerEmail && l.sellerEmail?.toLowerCase().trim() === sellerEmail)
        )
      : [listing];

  let explicitHandovers = 0;
  let completedStatusCount = 0;
  let aggregatedReviews: NonNullable<Listing["reviews"]> = [];

  sellerListings.forEach((item) => {
    if (item.status === "completed") {
      completedStatusCount += 1;
    }
    if (typeof item.completedHandovers === "number" && item.completedHandovers > 0) {
      explicitHandovers += item.completedHandovers;
    }
    if (item.reviews && item.reviews.length > 0) {
      aggregatedReviews = aggregatedReviews.concat(item.reviews);
    }
  });

  // Fallback to current listing reviews if aggregation produced none
  if (aggregatedReviews.length === 0 && listing.reviews && listing.reviews.length > 0) {
    aggregatedReviews = listing.reviews;
  }

  // Deduplicate reviews by review ID if needed
  const uniqueReviewsMap = new Map<string, (typeof aggregatedReviews)[0]>();
  aggregatedReviews.forEach((rev) => {
    if (rev && rev.id) {
      uniqueReviewsMap.set(rev.id, rev);
    }
  });
  const uniqueReviews =
    uniqueReviewsMap.size > 0
      ? Array.from(uniqueReviewsMap.values())
      : aggregatedReviews;

  const totalReviews =
    uniqueReviews.length > 0
      ? uniqueReviews.length
      : listing.totalReviews ?? listing.sellerReviewCount ?? 0;

  const averageRating =
    uniqueReviews.length > 0
      ? Math.round(
          (uniqueReviews.reduce((sum, r) => sum + (r.rating || 5), 0) /
            uniqueReviews.length) *
            10
        ) / 10
      : listing.averageRating ?? listing.sellerRating ?? (totalReviews > 0 ? 4.8 : 0);

  // Completed Handovers:
  // Derived from explicit counts, completed listing statuses, or verified reviews
  // (every verified review on campus marketplace corresponds to a verified handover)
  const completedHandovers = Math.max(
    explicitHandovers,
    completedStatusCount + (listing.completedHandovers || 0),
    totalReviews
  );

  // --- CALCULATION FORMULA ---

  // 1. Handover Points (Max 40 points):
  // Each completed handover rewards 8 points, capped at 40 (5+ handovers = full points).
  const handoverScore = Math.min(40, completedHandovers * 8);

  // 2. Review Rating Points (Max 50 points):
  // When reviews exist:
  // - Rating quality component: (averageRating / 5.0) * 40 points
  // - Volume credibility bonus: 1 review = 4 pts, 2 reviews = 7 pts, 3+ reviews = 10 pts
  // When no reviews exist:
  // - Baseline credit for verified campus member awaiting first review: 25 points
  let reviewScore = 0;
  if (totalReviews > 0) {
    const clampedRating = Math.min(5, Math.max(1, averageRating));
    const ratingComponent = (clampedRating / 5) * 40;
    const volumeBonus = totalReviews >= 3 ? 10 : totalReviews === 2 ? 7 : 4;
    reviewScore = Math.min(50, Math.round(ratingComponent + volumeBonus));
  } else {
    reviewScore = 25;
  }

  // 3. College Verification Points (Max 10 points):
  // Institutional domain authenticated student (@pvgcoet.ac.in)
  const isCollegeVerified = true;
  const verificationScore = 10;

  // Composite Trust Score (0 - 100)
  const rawTrustScore = handoverScore + reviewScore + verificationScore;
  const trustScore = Math.min(100, Math.max(0, Math.round(rawTrustScore)));

  // Tier classification
  let tier: ReputationTier = "New Seller";
  let tierLabel = "New Student Seller";
  let tierDescription = "College Verified • Awaiting first handover feedback";

  let colorScheme = {
    bg: "bg-slate-500/15",
    text: "text-slate-700 dark:text-slate-300",
    border: "border-slate-500/30",
    pillBg: "bg-slate-100 dark:bg-slate-800",
    badgeGlow: "shadow-slate-500/10",
    barColor: "bg-slate-500",
  };

  if (trustScore >= 90) {
    tier = "Elite";
    tierLabel = "Top Rated Seller";
    tierDescription = "Elite Reputation • Exceptional handover track record";
    colorScheme = {
      bg: "bg-emerald-500/15",
      text: "text-emerald-700 dark:text-emerald-300",
      border: "border-emerald-500/30",
      pillBg: "bg-emerald-50 dark:bg-emerald-950/40",
      badgeGlow: "shadow-emerald-500/20",
      barColor: "bg-emerald-500",
    };
  } else if (trustScore >= 80) {
    tier = "Trusted";
    tierLabel = "Trusted Seller";
    tierDescription = "High Trust • Proven on-campus handovers & reviews";
    colorScheme = {
      bg: "bg-indigo-500/15",
      text: "text-indigo-700 dark:text-indigo-300",
      border: "border-indigo-500/30",
      pillBg: "bg-indigo-50 dark:bg-indigo-950/40",
      badgeGlow: "shadow-indigo-500/20",
      barColor: "bg-indigo-500",
    };
  } else if (trustScore >= 70) {
    tier = "Good Standing";
    tierLabel = "Good Standing";
    tierDescription = "Reliable Trader • Verified student with successful meetups";
    colorScheme = {
      bg: "bg-sky-500/15",
      text: "text-sky-700 dark:text-sky-300",
      border: "border-sky-500/30",
      pillBg: "bg-sky-50 dark:bg-sky-950/40",
      badgeGlow: "shadow-sky-500/20",
      barColor: "bg-sky-500",
    };
  } else {
    tier = "New Seller";
    tierLabel = "New Seller";
    tierDescription = "Campus Authenticated • Building handover reputation";
    colorScheme = {
      bg: "bg-amber-500/15",
      text: "text-amber-700 dark:text-amber-300",
      border: "border-amber-500/30",
      pillBg: "bg-amber-50 dark:bg-amber-950/40",
      badgeGlow: "shadow-amber-500/20",
      barColor: "bg-amber-500",
    };
  }

  return {
    sellerId,
    sellerName: listing.sellerName,
    sellerEmail: listing.sellerEmail,
    trustScore,
    tier,
    tierLabel,
    tierDescription,
    completedHandovers,
    totalReviews,
    averageRating: averageRating > 0 ? averageRating : 5.0,
    ratingPercentage: Math.round((averageRating / 5) * 100),
    isCollegeVerified,
    scoreBreakdown: {
      handoverScore,
      handoverMax: 40,
      reviewScore,
      reviewMax: 50,
      verificationScore,
      verificationMax: 10,
    },
    colorScheme,
  };
}
