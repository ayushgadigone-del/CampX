import React, { useMemo, useState } from "react";
import { Plus, Search, X, ArrowLeft } from "lucide-react";
import { ItemCategory, Listing, ListingStatus } from "../types";
import { useTheme } from "../context/ThemeContext";
import { ListingCard } from "./ListingCard";

type SellerStatusFilter = "all" | "available" | "reserved" | "sold";
type SellerSortOption = "newest" | "oldest" | "price_asc" | "price_desc";

const CATEGORIES: (ItemCategory | "All")[] = [
  "All",
  "Books",
  "Calculators",
  "Lab Equipment",
  "Cycles",
  "Bags",
  "Other",
];

interface MyListingsSectionProps {
  myListings: Listing[];
  allListings: Listing[];
  wishlistIds: string[];
  onToggleWishlist: (id: string) => void;
  onOpenCreateListing: () => void;
  onOpenDetails: (listing: Listing) => void;
  onOpenLightbox?: (listing: Listing) => void;
  onOpenChat: (listing: Listing) => void;
  onOpenCalendar: (listing: Listing) => void;
  onOpenBarter?: (listing: Listing) => void;
  onShowToast: (msg: string) => void;
  onUpdateStatus: (listingId: string, newStatus: ListingStatus) => void;
  onBackToMarketplace?: () => void;
  isOnline?: boolean;
}

export const MyListingsSection: React.FC<MyListingsSectionProps> = ({
  myListings,
  allListings,
  wishlistIds,
  onToggleWishlist,
  onOpenCreateListing,
  onOpenDetails,
  onOpenLightbox,
  onOpenChat,
  onOpenCalendar,
  onOpenBarter,
  onShowToast,
  onUpdateStatus,
  onBackToMarketplace,
  isOnline = true,
}) => {
  const { isDark } = useTheme();
  const [statusFilter, setStatusFilter] = useState<SellerStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "All">("All");
  const [sortBy, setSortBy] = useState<SellerSortOption>("newest");

  const counts = useMemo(() => {
    let available = 0;
    let reserved = 0;
    let sold = 0;

    for (const item of myListings) {
      if (item.status === "completed") {
        sold += 1;
      } else if (
        item.status === "reserved" ||
        item.status === "handover_scheduled"
      ) {
        reserved += 1;
      } else {
        available += 1;
      }
    }

    return {
      all: myListings.length,
      available,
      reserved,
      sold,
    };
  }, [myListings]);

  const filteredListings = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return myListings
      .filter((item) => {
        if (statusFilter === "available") {
          if (
            item.status === "reserved" ||
            item.status === "handover_scheduled" ||
            item.status === "completed"
          ) {
            return false;
          }
        } else if (statusFilter === "reserved") {
          if (
            item.status !== "reserved" &&
            item.status !== "handover_scheduled"
          ) {
            return false;
          }
        } else if (statusFilter === "sold") {
          if (item.status !== "completed") {
            return false;
          }
        }

        if (selectedCategory !== "All" && item.category !== selectedCategory) {
          return false;
        }

        if (q) {
          const matchesTitle = item.title.toLowerCase().includes(q);
          const matchesDesc = item.description.toLowerCase().includes(q);
          const matchesCat = item.category.toLowerCase().includes(q);
          const matchesTags = item.tags?.some((t) =>
            t.toLowerCase().includes(q)
          );
          if (!matchesTitle && !matchesDesc && !matchesCat && !matchesTags) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "oldest") {
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        }
        if (sortBy === "price_asc") {
          return a.price - b.price;
        }
        if (sortBy === "price_desc") {
          return b.price - a.price;
        }
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [myListings, statusFilter, selectedCategory, searchQuery, sortBy]);

  const hasActiveFilters =
    statusFilter !== "all" ||
    selectedCategory !== "All" ||
    searchQuery.trim().length > 0;

  const statusTabs: { id: SellerStatusFilter; label: string; count: number }[] = [
    { id: "all", label: "All Listings", count: counts.all },
    { id: "available", label: "Available", count: counts.available },
    { id: "reserved", label: "Reserved / Booked", count: counts.reserved },
    { id: "sold", label: "Sold", count: counts.sold },
  ];

  return (
    <section
      id="my-listings-dashboard-section"
      className="w-full space-y-6 text-left"
    >
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-3">
            <p
              className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              SELLER DASHBOARD
            </p>
            {onBackToMarketplace && (
              <button
                type="button"
                onClick={onBackToMarketplace}
                className={`inline-flex items-center gap-1 text-[11px] font-medium cursor-pointer hover:underline underline-offset-4 ${
                  isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                }`}
              >
                <ArrowLeft className="w-3 h-3" />
                <span>Back to Marketplace</span>
              </button>
            )}
          </div>
          <h1
            className={`text-3xl sm:text-4xl font-bold tracking-tight ${
              isDark ? "text-[#ECF2EF]" : "text-[#1E3B33]"
            }`}
          >
            My Listings
          </h1>
          <p
            className={`text-sm ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          >
            Manage and track the items you have posted.
          </p>
        </div>

        <button
          id="my-listings-add-new-btn"
          type="button"
          onClick={onOpenCreateListing}
          disabled={!isOnline}
          className={`h-11 px-5 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 self-start ${
            !isOnline
              ? "bg-[#DFE6E2] dark:bg-[#242E2A] text-[#8FA199] cursor-not-allowed"
              : isDark
              ? "bg-[#387262] hover:bg-[#448573] text-white cursor-pointer"
              : "bg-[#2F5D50] hover:bg-[#244A3F] text-white cursor-pointer"
          }`}
        >
          <Plus className="w-4 h-4 stroke-[2.25]" />
          <span>Add New Listing</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div
        role="tablist"
        aria-label="Filter your listings by status"
        className="flex flex-wrap items-center gap-2.5"
      >
        {statusTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              id={`my-listings-status-tab-${tab.id}`}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setStatusFilter(tab.id)}
              className={`h-10 px-4 rounded-xl border text-xs sm:text-[13px] font-semibold inline-flex items-center gap-2 cursor-pointer ${
                isActive
                  ? isDark
                    ? "bg-[#387262] text-white border-[#387262]"
                    : "bg-[#2F5D50] text-white border-[#2F5D50]"
                  : isDark
                  ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A] hover:bg-[#1B2320] hover:border-[#34433D]"
                  : "bg-white text-[#18201C] border-[#DFE6E2] hover:bg-[#EFF4F1] hover:border-[#C4D1CA]"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`min-w-[20px] h-5 px-1.5 rounded-full text-[11px] font-mono tabular-nums inline-flex items-center justify-center ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isDark
                    ? "bg-[#1B2320] text-[#8FA199]"
                    : "bg-[#EFF4F1] text-[#5C6B63]"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Category + Sort Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-6 relative">
          <Search
            className={`w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none ${
              isDark ? "text-[#8FA199]" : "text-[#7C8B83]"
            }`}
          />
          <input
            id="my-listings-search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your products..."
            className={`w-full h-11 pl-10 pr-9 rounded-xl border text-sm focus:outline-none ${
              isDark
                ? "bg-[#141A18] border-[#242E2A] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#73847D]"
                : "bg-white border-[#DFE6E2] focus:border-[#2F5D50] text-[#18201C] placeholder:text-[#7C8B83]"
            }`}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md cursor-pointer ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF]"
                  : "text-[#5C6B63] hover:text-[#18201C]"
              }`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="md:col-span-3">
          <select
            id="my-listings-category-select"
            value={selectedCategory}
            onChange={(e) =>
              setSelectedCategory(e.target.value as ItemCategory | "All")
            }
            aria-label="Filter your products by category"
            className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium focus:outline-none cursor-pointer ${
              isDark
                ? "bg-[#141A18] border-[#242E2A] focus:border-[#5BA18C] text-[#ECF2EF]"
                : "bg-white border-[#DFE6E2] focus:border-[#2F5D50] text-[#18201C]"
            }`}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="md:col-span-3">
          <select
            id="my-listings-sort-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SellerSortOption)}
            aria-label="Sort your products"
            className={`w-full h-11 px-3.5 rounded-xl border text-sm font-medium focus:outline-none cursor-pointer ${
              isDark
                ? "bg-[#141A18] border-[#242E2A] focus:border-[#5BA18C] text-[#ECF2EF]"
                : "bg-white border-[#DFE6E2] focus:border-[#2F5D50] text-[#18201C]"
            }`}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Listings Grid or Empty State */}
      {filteredListings.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredListings.map((listing, index) => (
            <div key={listing.id} className="h-full flex flex-col">
              <ListingCard
                index={index}
                listing={listing}
                allListings={allListings}
                isWishlisted={wishlistIds.includes(listing.id)}
                onToggleWishlist={onToggleWishlist}
                onOpenDetails={onOpenDetails}
                onOpenLightbox={onOpenLightbox}
                onOpenChat={onOpenChat}
                onOpenCalendar={onOpenCalendar}
                onShowToast={onShowToast}
                onOpenBarter={onOpenBarter}
                isOnline={isOnline}
                isOwner={true}
                onUpdateStatus={onUpdateStatus}
              />
            </div>
          ))}
        </div>
      ) : (
        <div
          id="my-listings-empty-state"
          className={`w-full rounded-2xl border py-20 px-6 text-center flex flex-col items-center justify-center space-y-2.5 ${
            isDark
              ? "bg-[#141A18] border-[#242E2A]"
              : "bg-white border-[#DFE6E2]"
          }`}
        >
          <h3
            className={`text-base font-semibold ${
              isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
            }`}
          >
            No listings found
          </h3>
          <p
            className={`text-sm max-w-md ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          >
            Try changing your filters or add a new product.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
            <button
              id="my-listings-empty-cta-btn"
              type="button"
              onClick={onOpenCreateListing}
              disabled={!isOnline}
              className={`h-10 px-5 rounded-xl text-sm font-semibold inline-flex items-center justify-center cursor-pointer ${
                !isOnline
                  ? "bg-[#DFE6E2] dark:bg-[#242E2A] text-[#8FA199] cursor-not-allowed"
                  : isDark
                  ? "bg-[#387262] hover:bg-[#448573] text-white"
                  : "bg-[#2F5D50] hover:bg-[#244A3F] text-white"
              }`}
            >
              {myListings.length === 0
                ? "Add Your First Listing"
                : "Add New Listing"}
            </button>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={() => {
                  setStatusFilter("all");
                  setSelectedCategory("All");
                  setSearchQuery("");
                }}
                className={`h-10 px-4 rounded-xl border text-sm font-medium cursor-pointer ${
                  isDark
                    ? "bg-[#1B2320] hover:bg-[#222D29] text-[#ECF2EF] border-[#242E2A]"
                    : "bg-[#EFF4F1] hover:bg-[#E5EEE9] text-[#18201C] border-[#DFE6E2]"
                }`}
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
