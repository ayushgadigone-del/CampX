import React from "react";
import { X, Tag } from "lucide-react";
import { Listing } from "../types";

interface RecentlyViewedSectionProps {
  recentlyViewed: Listing[];
  onOpenDetails: (listing: Listing) => void;
  onClearHistory: () => void;
  onRemoveItem: (listingId: string) => void;
  isDark: boolean;
}

export const RecentlyViewedSection: React.FC<RecentlyViewedSectionProps> = ({
  recentlyViewed,
  onOpenDetails,
  onClearHistory,
  onRemoveItem,
  isDark,
}) => {
  if (recentlyViewed.length === 0) {
    return null;
  }

  return (
    <div
      id="marketplace-recently-viewed-section"
      className={`pb-5 border-b ${isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"}`}
    >
      <div className="flex items-center justify-between gap-3 mb-3">
        <span className={`text-xs font-medium ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
          Recently viewed ({recentlyViewed.length})
        </span>
        <button
          type="button"
          onClick={onClearHistory}
          className={`text-xs cursor-pointer ${
            isDark ? "text-[#8FA199] hover:text-[#ECF2EF]" : "text-[#5C6B63] hover:text-[#18201C]"
          }`}
        >
          Clear
        </button>
      </div>

      <div className="flex items-stretch gap-3 overflow-x-auto pb-1 no-scrollbar">
        {recentlyViewed.map((item) => (
          <div
            key={item.id}
            className="relative w-44 sm:w-48 shrink-0 group"
          >
            <div
              onClick={() => onOpenDetails(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenDetails(item);
                }
              }}
              className={`w-full text-left rounded-lg border p-2 flex items-center gap-2.5 cursor-pointer ${
                isDark
                  ? "bg-[#141A18] border-[#242E2A] hover:border-[#34433D]"
                  : "bg-white border-[#DFE6E2] hover:border-[#C4D1CA]"
              }`}
            >
              <div className="w-11 h-11 rounded-md overflow-hidden bg-zinc-100 dark:bg-zinc-800 shrink-0">
                {item.imageUrl ? (
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=300";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-400">
                    <Tag className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1 pr-3">
                <p
                  className={`text-xs font-medium truncate ${
                    isDark ? "text-zinc-100" : "text-zinc-900"
                  }`}
                  title={item.title}
                >
                  {item.title}
                </p>
                <p className="text-xs font-mono tabular-nums text-zinc-500 mt-0.5">
                  {item.listingType === "exchange"
                    ? "Swap"
                    : item.price === 0
                    ? "Free"
                    : `₹${item.price.toLocaleString("en-IN")}`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveItem(item.id);
              }}
              aria-label={`Remove ${item.title} from recently viewed`}
              className={`absolute top-1.5 right-1.5 p-0.5 rounded text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
