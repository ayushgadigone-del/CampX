import { AlertSubscription, AlertMatchEvent, Listing, ItemCategory } from "../types";

export const DEFAULT_ALERTS: AlertSubscription[] = [
  {
    id: "alert-casio-calc",
    keyword: "Casio Calculator",
    category: "Calculators",
    active: true,
    createdAt: new Date().toISOString(),
    matchCount: 1,
  },
  {
    id: "alert-mini-drafter",
    keyword: "Mini Drafter",
    category: "Lab Equipment",
    active: true,
    createdAt: new Date().toISOString(),
    matchCount: 1,
  },
];

const STORAGE_KEY = "campus_marketplace_alerts";
const HISTORY_KEY = "campus_marketplace_alert_history";

export const getSavedAlerts = (): AlertSubscription[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ALERTS));
      return DEFAULT_ALERTS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_ALERTS;
  } catch (err) {
    console.warn("Could not load alerts from localStorage:", err);
    return DEFAULT_ALERTS;
  }
};

export const saveAlerts = (alerts: AlertSubscription[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(alerts));
  } catch (err) {
    console.warn("Could not save alerts to localStorage:", err);
  }
};

export const getAlertHistory = (): AlertMatchEvent[] => {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const saveAlertHistory = (history: AlertMatchEvent[]) => {
  try {
    // Keep last 25 matches
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 25)));
  } catch {}
};

/**
 * Checks whether a listing matches an active alert subscription
 */
export const checkListingMatchesAlert = (
  listing: Listing,
  alert: AlertSubscription
): boolean => {
  if (!alert.active) return false;

  // 1. Category check
  if (alert.category && alert.category !== "All") {
    if (listing.category !== alert.category) {
      return false;
    }
  }

  // 2. Keyword check
  if (alert.keyword && alert.keyword.trim().length > 0) {
    const kw = alert.keyword.trim().toLowerCase();
    const titleMatch = listing.title.toLowerCase().includes(kw);
    const descMatch = listing.description?.toLowerCase().includes(kw) || false;
    const catMatch = listing.category.toLowerCase().includes(kw);
    const tagsMatch = listing.tags?.some((t) => t.toLowerCase().includes(kw)) || false;

    // Check individual tokens if full phrase didn't match directly
    const tokens = kw.split(/\s+/).filter((t) => t.length > 2);
    const tokensMatch =
      tokens.length > 1 &&
      tokens.every(
        (token) =>
          listing.title.toLowerCase().includes(token) ||
          listing.description?.toLowerCase().includes(token) ||
          listing.tags?.some((t) => t.toLowerCase().includes(token))
      );

    if (!titleMatch && !descMatch && !catMatch && !tagsMatch && !tokensMatch) {
      return false;
    }
  }

  // 3. Max Price check
  if (alert.maxPrice !== undefined && alert.maxPrice > 0) {
    if (listing.price > alert.maxPrice) {
      return false;
    }
  }

  return true;
};

/**
 * Play a polite, non-intrusive alert chime via Web Audio API
 */
export const playAlertNotificationSound = () => {
  try {
    const AudioContextClass =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    // First tone (E5 - 659Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.08, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.25);

    // Second tone (G#5 - 830.6Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(830.61, now + 0.12);
    gain2.gain.setValueAtTime(0.1, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (err) {
    // Audio contexts may be blocked by autoplay policies until user gesture
  }
};
