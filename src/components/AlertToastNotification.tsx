import React, { useEffect } from "react";
import { Bell, X, ExternalLink, Sparkles, Tag, ArrowRight } from "lucide-react";
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

  const { listing, alertKeyword, alertCategory } = matchEvent;

  return (
    <div
      id="alert-match-toast"
      className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-5 duration-300 pointer-events-auto"
      role="alert"
    >
      <div className="relative p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white shadow-2xl border border-amber-500/40 ring-2 ring-amber-500/20 overflow-hidden">
        {/* Decorative ambient glow */}
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-amber-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-indigo-500/20 rounded-full blur-xl pointer-events-none" />

        {/* Top Header Bar */}
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs animate-bounce-subtle">
              <Bell className="w-3.5 h-3.5 fill-slate-950" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black tracking-tight text-amber-300 uppercase">
                'Notify Me' Alert Match!
              </span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-amber-400/20 text-amber-200 border border-amber-400/30">
                New Post
              </span>
            </div>
          </div>

          <button
            onClick={onDismiss}
            aria-label="Dismiss alert toast"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Match Details */}
        <div className="py-3 flex items-start gap-3">
          <img
            src={listing.imageUrl}
            alt={listing.title}
            className="w-14 h-14 rounded-xl object-cover border border-white/20 shrink-0 bg-slate-800"
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-[11px] text-amber-300 font-semibold mb-0.5">
              <Tag className="w-3 h-3" />
              <span>
                Matched: "<strong>{alertKeyword}</strong>"
              </span>
            </div>

            <h4 className="text-sm font-bold text-white truncate">
              {listing.title}
            </h4>

            <div className="flex items-center gap-2 mt-1 text-xs text-slate-300">
              <span className="font-extrabold text-emerald-400 text-sm">
                ₹{listing.price}
              </span>
              <span>•</span>
              <span className="truncate">By {listing.sellerName}</span>
              <span>•</span>
              <span className="text-[11px] text-indigo-300 bg-indigo-900/50 px-1.5 py-0.5 rounded">
                {listing.condition}
              </span>
            </div>
          </div>
        </div>

        {/* Bottom CTA Row */}
        <div className="pt-2.5 border-t border-white/10 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-400 truncate">
            {listing.locationPreference
              ? `📍 ${listing.locationPreference}`
              : "Verified College Marketplace"}
          </span>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onDismiss}
              className="px-2.5 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                onViewListing(listing);
                onDismiss();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-md hover:shadow-lg transition-all cursor-pointer font-sans"
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
