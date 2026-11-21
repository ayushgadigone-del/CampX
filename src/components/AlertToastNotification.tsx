import React, { useEffect } from "react";
import { Bell, X, Tag, ArrowRight } from "lucide-react";
import { AlertMatchEvent, Listing } from "../types";

interface AlertToastNotificationProps {
  matchEvent: AlertMatchEvent | null;
  onDismiss: () => void;
  onViewListing: (listing: Listing) => void;
}

export const AlertToastNotification: React.FC<AlertToastNotificationProps> = ({
  matchEvent,
  onDismiss,
  onViewListing,
}) => {
  useEffect(() => {
    if (!matchEvent) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 8000);
    return () => clearTimeout(timer);
  }, [matchEvent, onDismiss]);

  if (!matchEvent) return null;

  const { listing, alertKeyword } = matchEvent;

  return (
    <div
      id="alert-match-toast"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full pointer-events-auto"
      role="alert"
    >
      <div className="relative p-4 rounded-2xl bg-[#2F5D50] dark:bg-[#141A18] text-white shadow-xl border border-[#244A3F] dark:border-[#2A4A40] overflow-hidden">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/15 dark:border-[#242E2A]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-[#F4EFE6] text-[#18201C] flex items-center justify-center">
              <Bell className="w-3.5 h-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold tracking-[0.1em] text-[#DFC29B] uppercase">
                Alert Match
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-white/15 text-white">
                New Post
              </span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            aria-label="Dismiss alert toast"
            className="p-1 rounded-lg text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Match Details */}
        <div className="py-3 flex items-start gap-3">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-14 h-14 rounded-xl object-cover border border-white/20 shrink-0 bg-[#1B2320]"
          />

          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center gap-1.5 text-[11px] text-[#DFC29B] font-medium mb-0.5">
              <Tag className="w-3 h-3" />
              <span>
                Matched: &ldquo;<strong>{alertKeyword}</strong>&rdquo;
              </span>
            </div>

            <h4 className="text-sm font-semibold text-white truncate">
              {listing.title}
            </h4>

            <div className="flex items-center gap-2 mt-1 text-xs text-white/80">
              <span className="font-mono font-bold text-[#F4EFE6] text-sm">
                ₹{listing.price}
              </span>
              <span>·</span>
              <span className="truncate">By {listing.sellerName}</span>
              <span>·</span>
              <span className="text-[11px] text-white bg-white/15 px-1.5 py-0.5 rounded">
                {listing.condition}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="pt-2.5 border-t border-white/15 dark:border-[#242E2A] flex items-center justify-between gap-3">
          <span className="text-[11px] text-white/75 truncate">
            {listing.locationPreference || "PVG's COET Campus Marketplace"}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onDismiss}
              className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-white/75 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                onViewListing(listing);
                onDismiss();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#F4EFE6] hover:bg-white text-[#18201C] cursor-pointer"
            >
              <span>View Item</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
