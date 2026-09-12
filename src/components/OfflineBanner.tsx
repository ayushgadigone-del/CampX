import React, { useEffect, useState } from "react";
import {
  WifiOff,
  Wifi,
  AlertTriangle,
  ShieldCheck,
  RefreshCw,
  X,
  Info,
} from "lucide-react";

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
  isNavigatorOnline,
  isSimulatedOffline,
  wasOffline = false,
  onToggleSimulateOffline,
  onResetWasOffline = () => {},
  onRetry,
}) => {
  const [showRestoredBanner, setShowRestoredBanner] = useState<boolean>(false);

  // When connection transitions from offline to online, show reassurance banner for 5 seconds
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

  // If online and restored banner is not showing, don't show the offline banner
  if (isOnline && !showRestoredBanner) {
    return null;
  }

  // Connection Restored Banner
  if (isOnline && showRestoredBanner) {
    return (
      <div
        id="online-restored-banner"
        role="status"
        aria-live="polite"
        className="w-full bg-emerald-600 text-white px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-2.5 shadow-md border-b border-emerald-700 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
      >
        <div className="w-full flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-100"></span>
            </span>
            <Wifi className="w-4 h-4 text-emerald-100 shrink-0" />
            <span>
              <strong>Connection Restored:</strong> You are back online! Create Listing, live negotiation chat, and cloud sync are fully active.
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowRestoredBanner(false);
              onResetWasOffline();
            }}
            className="p-1 rounded-lg text-emerald-100 hover:text-white hover:bg-emerald-700/60 transition-colors cursor-pointer shrink-0"
            title="Dismiss notification"
            aria-label="Dismiss notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Disconnected / Offline Banner
  return (
    <div
      id="offline-banner"
      role="alert"
      aria-live="assertive"
      className="w-full bg-gradient-to-r from-amber-600 via-amber-700 to-rose-700 text-white shadow-lg border-b border-amber-800 transition-all duration-300 animate-in fade-in slide-in-from-top-2"
    >
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-3">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Main Status Information */}
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-black/20 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <WifiOff className="w-5 h-5 text-amber-200" />
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-400"></span>
                </span>
                <span className="font-extrabold text-sm tracking-tight text-white">
                  Offline Mode Active
                </span>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-black/25 text-amber-200 border border-amber-300/30">
                  {isSimulatedOffline ? "Simulated Disconnect" : "window.navigator.onLine: false"}
                </span>
              </div>
              <p className="text-xs text-amber-100/90 leading-normal">
                You are currently disconnected from the campus network. Cached listings remain viewable, but{" "}
                <strong className="text-white underline decoration-amber-300 decoration-1 underline-offset-2">
                  Create Listing
                </strong>{" "}
                and{" "}
                <strong className="text-white underline decoration-amber-300 decoration-1 underline-offset-2">
                  Live Chat
                </strong>{" "}
                are disabled to prevent data loss.
              </p>
            </div>
          </div>

          {/* Controls & Badges */}
          <div className="flex items-center gap-2.5 self-end sm:self-center shrink-0">
            <div
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/20 text-white/90 text-[11px] font-semibold border border-white/10"
              title="Data protection prevents partial writes to Firestore or lost messages"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Data Protection</span>
            </div>

            {onRetry && !isSimulatedOffline && (
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/25 hover:bg-black/35 text-white border border-white/20 text-xs font-bold transition-all cursor-pointer select-none"
                title="Re-check network connectivity"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retry Connection</span>
              </button>
            )}

            <button
              id="toggle-offline-simulation-btn"
              type="button"
              onClick={onToggleSimulateOffline}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-900 hover:bg-amber-50 text-xs font-bold shadow-sm transition-all cursor-pointer select-none"
              title={isSimulatedOffline ? "Switch back to online mode" : "Simulate reconnecting online"}
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isSimulatedOffline ? "Resume Online Mode" : "Simulate Online"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
