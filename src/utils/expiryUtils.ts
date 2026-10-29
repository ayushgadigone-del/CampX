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
 * Automatically purges and deletes listings that have passed their expiry date.
 * Returns the filtered active listings, count of deleted items, and the list of deleted IDs.
 */
export const purgeExpiredListings = (
  listings: Listing[]
): { activeListings: Listing[]; purgedCount: number; purgedIds: string[] } => {
  const purgedIds: string[] = [];
  const activeListings = listings.filter((listing) => {
    // A listing is deleted if it has expired past its validity date or is marked inactive due to expiry
    if (isListingExpired(listing) || listing.status === "inactive") {
      purgedIds.push(listing.id);
      return false;
    }
    return true;
  });

  return { activeListings, purgedCount: purgedIds.length, purgedIds };
};

/**
 * Automatically deletes listings older than their expiry threshold to keep the marketplace clean.
 * Backwards compatible with checkAndMarkInactiveListings: updatedListings now only contains valid, non-expired listings.
 */
export const checkAndMarkInactiveListings = (
  listings: Listing[]
): { updatedListings: Listing[]; newlyExpiredCount: number; deletedIds: string[] } => {
  const { activeListings, purgedCount, purgedIds } = purgeExpiredListings(listings);
  return {
    updatedListings: activeListings,
    newlyExpiredCount: purgedCount,
    deletedIds: purgedIds,
  };
};
