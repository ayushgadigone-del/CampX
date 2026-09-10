import { Listing } from "../types";

export const DEFAULT_EXPIRY_DAYS = 30;

/**
 * Computes or retrieves the expiry date for a listing.
 * If listing has an explicit expiryDate, uses it; otherwise defaults to createdAt + 30 days.
 */
export const getListingExpiryDate = (listing: Listing): Date => {
  if (listing.expiryDate) {
    const parsed = new Date(listing.expiryDate);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  const created = new Date(listing.createdAt || Date.now());
  const validCreated = isNaN(created.getTime()) ? new Date() : created;
  return new Date(validCreated.getTime() + DEFAULT_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
};

/**
 * Determines whether a listing has expired past its 30-day threshold
 */
export const isListingExpired = (listing: Listing): boolean => {
  const expiry = getListingExpiryDate(listing);
  return Date.now() > expiry.getTime();
};

/**
 * Returns the days remaining before the listing expires
 */
export const getDaysUntilExpiry = (listing: Listing): number => {
  const expiry = getListingExpiryDate(listing);
  const diffMs = expiry.getTime() - Date.now();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
};

/**
 * Human-readable expiry status and UI styling hints
 */
export const formatExpiryInfo = (listing: Listing) => {
  const expiry = getListingExpiryDate(listing);
  const daysLeft = getDaysUntilExpiry(listing);
  const isExpired = Date.now() > expiry.getTime();
  const isUrgent = !isExpired && daysLeft <= 4;

  const formattedDate = expiry.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  let label = "";
  if (isExpired || listing.status === "inactive") {
    label = "Expired (Inactive)";
  } else if (daysLeft === 0) {
    label = "Expires today";
  } else if (daysLeft === 1) {
    label = "Expires tomorrow";
  } else {
    label = `Expires in ${daysLeft} days`;
  }

  return {
    label,
    daysLeft,
    isExpired: isExpired || listing.status === "inactive",
    isUrgent,
    formattedDate,
  };
};

/**
 * Helper to compute an ISO date string for newly created or renewed listings
 */
export const calculateNewExpiryDate = (days: number = DEFAULT_EXPIRY_DAYS): string => {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
};

/**
 * Automatically marks listings older than 30 days as 'inactive' to keep marketplace fresh
 */
export const checkAndMarkInactiveListings = (
  listings: Listing[]
): { updatedListings: Listing[]; newlyExpiredCount: number } => {
  let newlyExpiredCount = 0;

  const updatedListings = listings.map((listing) => {
    // Only auto-mark as inactive if currently available and past expiry
    if (listing.status === "available" && isListingExpired(listing)) {
      newlyExpiredCount++;
      return {
        ...listing,
        status: "inactive" as const,
      };
    }
    return listing;
  });

  return { updatedListings, newlyExpiredCount };
};
