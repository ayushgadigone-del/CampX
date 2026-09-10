import { useState, useEffect, useCallback } from "react";

export interface OnlineStatus {
  isOnline: boolean;
  isNavigatorOnline: boolean;
  isSimulatedOffline: boolean;
  wasOffline: boolean;
  toggleSimulateOffline: () => void;
  resetWasOffline: () => void;
  reconnect: () => void;
}

/**
 * Custom hook providing robust online/offline status using window.navigator.onLine API,
 * window online/offline event listeners, and an interactive simulation toggle for testability.
 */
export function useOnlineStatus(): OnlineStatus {
  // Initialize with browser navigator.onLine if available
  const [isNavigatorOnline, setIsNavigatorOnline] = useState<boolean>(() => {
    if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
      return window.navigator.onLine;
    }
    return true;
  });

  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [wasOffline, setWasOffline] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleOnline = () => {
      setIsNavigatorOnline(true);
      // Mark that we transitioned from offline to online
      setWasOffline(true);
    };

    const handleOffline = () => {
      setIsNavigatorOnline(false);
      setWasOffline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Sync with actual navigator state on mount
    if (typeof window.navigator !== "undefined") {
      setIsNavigatorOnline(window.navigator.onLine);
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Effective online status combines navigator.onLine and simulation mode
  const isOnline = isNavigatorOnline && !isSimulatedOffline;

  const toggleSimulateOffline = useCallback(() => {
    setIsSimulatedOffline((prev) => {
      const next = !prev;
      if (!next && isNavigatorOnline) {
        // Transitioning back to online
        setWasOffline(true);
      }
      return next;
    });
  }, [isNavigatorOnline]);

  const resetWasOffline = useCallback(() => {
    setWasOffline(false);
  }, []);

  const reconnect = useCallback(() => {
    setIsSimulatedOffline(false);
    if (typeof window !== "undefined" && typeof window.navigator !== "undefined") {
      setIsNavigatorOnline(window.navigator.onLine);
    }
  }, []);

  return {
    isOnline,
    isNavigatorOnline,
    isSimulatedOffline,
    wasOffline,
    toggleSimulateOffline,
    resetWasOffline,
    reconnect,
  };
}
