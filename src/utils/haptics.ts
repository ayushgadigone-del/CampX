/**
 * Universal Mobile Haptics Helper using Web Vibration API (navigator.vibrate)
 * Provides subtle tactile feedback for mobile interactions and keyboard shortcuts.
 */

export type HapticType = "light" | "medium" | "heavy" | "success" | "toggle" | "warning";

const HAPTIC_PATTERNS: Record<HapticType, number | number[]> = {
  light: 12,        // Quick tap, e.g. search focus, tab change
  medium: 22,       // Standard action, e.g. opening modal, topper vault
  heavy: 35,        // Primary action, e.g. create listing, post
  toggle: 18,       // Mode switches, e.g. dark/light toggle
  success: [15, 40, 20], // Multi-pulse success confirmation
  warning: [25, 50, 25], // Warning notification
};

/**
 * Trigger subtle haptic confirmation on supporting mobile devices.
 * Safely checks if navigator.vibrate is available and non-intrusively degrades on unsupported hardware.
 */
export function triggerHaptic(typeOrDuration: HapticType | number | number[] = "light"): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  try {
    if ("vibrate" in navigator && typeof navigator.vibrate === "function") {
      let pattern: number | number[];
      if (typeof typeOrDuration === "number" || Array.isArray(typeOrDuration)) {
        pattern = typeOrDuration;
      } else {
        pattern = HAPTIC_PATTERNS[typeOrDuration] ?? 15;
      }
      return navigator.vibrate(pattern);
    }
  } catch (err) {
    // Vibration API may throw or be disabled by user agent permissions policy
    console.debug("Haptic vibration suppressed:", err);
  }

  return false;
}
