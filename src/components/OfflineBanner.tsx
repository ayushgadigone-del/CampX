import React, { useEffect, useState } from "react";
import { WifiOff, Wifi, ShieldCheck, RefreshCw, X } from "lucide-react";

interface OfflineBannerProps {
  isOnline: boolean;
  isNavigatorOnline?: boolean;
  isSimulatedOffline: boolean;
  wasOffline?: boolean;
  onToggleSimulateOffline: () => void;
  onResetWasOffline?: () => void;
  onRetry?: () => void;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({
  isOnline,
  wasOffline = false,
  onResetWasOffline = () => {},
  onRetry,
}) => {
  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(false);

  useEffect(() => {
    if (wasOffline && isOnline) {
      setShowRestoredBanner(true);
      const timer = setTimeout(() => {
        setShowRestoredBanner(false);
        onResetWasOffline();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [wasOffline, isOnline, onResetWasOffline]);

  if (isOnline && !showRestoredBanner) {
    return null;
  }

  if (isOnline && showRestoredBanner) {
    return (
      <div
        id="online-restored-banner"
        role="status"
        aria-live="polite"
        className="w-full bg-[#2F5D50] dark:bg-[#1E3B33] text-white border-b border-[#244A3F] dark:border-[#2A4E43]"
      >
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-medium">
          <div className="flex items-center gap-2.5">
            <Wifi className="w-4 h-4 text-[#DFC29B] shrink-0" />
            <span>
              <strong>Connection Restored:</strong> You are back online. Create Listing, live negotiation chat, and cloud sync are active.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowRestoredBanner(false);
              onResetWasOffline();
            }}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer shrink-0"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      id="offline-banner"
      role="alert"
      aria-live="assertive"
      className="w-full bg-[#7A4B23] dark:bg-[#3A2714] text-white border-b border-[#5E3818] dark:border-[#5C4124]"
    >
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black/20 border border-white/15 flex items-center justify-center shrink-0">
              <WifiOff className="w-4 h-4 text-[#F4EFE6]" />
            </div>

            <div className="space-y-0.5 text-left">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm tracking-tight text-white">
                  Offline Mode Active
                </span>
                <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-md bg-black/20 text-[#F4EFE6] border border-white/15">
                  No Internet Connection
                </span>
              </div>
              <p className="text-xs text-[#F4EFE6]/90 leading-normal">
                Cached listings remain viewable, while <strong>Create Listing</strong> and <strong>Live Chat</strong> are paused until you reconnect.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-white/90 text-[11px] font-medium border border-white/15">
              <ShieldCheck className="w-3.5 h-3.5 text-[#DFC29B]" />
              <span>Data Protection</span>
            </div>

            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F4EFE6] hover:bg-white text-[#18201C] text-xs font-semibold cursor-pointer select-none"
                title="Re-check network connectivity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
