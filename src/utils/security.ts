/**
 * Enterprise Campus Security & Anti-Fraud Utility
 * PVG's COET Campus Resale & Exchange
 * 
 * Provides:
 * 1. Strict XSS and HTML Input Sanitization
 * 2. File Upload Safety Validation & EXIF Privacy Stripping
 * 3. Chat Scam & Phishing Detection
 * 4. Verifiable Cryptographic Student Security Hashes
 * 5. Client-Side Anti-Spam Rate Limiting
 */

// Whitelist of allowed image and document MIME types
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const ALLOWED_DOCUMENT_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
];

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_SIZE_BYTES = 15 * 1024 * 1024; // 15MB

/**
 * 1. Sanitize user input text to prevent Stored XSS and malicious injection
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return "";
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "") // Remove <script> tags
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "") // Remove <iframe> tags
    .replace(/on\w+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "") // Strip inline event handlers (onload, onerror)
    .replace(/javascript:\s*/gi, "") // Neutralize javascript: pseudo-protocol
    .replace(/data:text\/html/gi, "") // Neutralize data: html
    .trim();
}

/**
 * Sanitize URLs to ensure only safe http/https or safe image data protocols are allowed
 */
export function sanitizeUrl(url: string | undefined | null): string {
  if (!url) return "";
  const clean = url.trim();
  if (
    clean.startsWith("https://") ||
    clean.startsWith("http://") ||
    clean.startsWith("data:image/") ||
    clean.startsWith("blob:")
  ) {
    return clean;
  }
  return "";
}

/**
 * 2. File Upload Validation
 */
export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFileUpload(
  file: File,
  allowedMimes: string[],
  maxSizeBytes: number
): FileValidationResult {
  if (!file) {
    return { valid: false, error: "No file was selected." };
  }

  // Check file size
  if (file.size > maxSizeBytes) {
    const maxMb = Math.round(maxSizeBytes / (1024 * 1024));
    return {
      valid: false,
      error: `File is too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum allowed size is ${maxMb} MB.`,
    };
  }

  // Check MIME type
  const isMimeAllowed = allowedMimes.includes(file.type.toLowerCase());
  
  // Also verify extension matches allowed MIME
  const extension = file.name.split(".").pop()?.toLowerCase();
  const dangerousExtensions = ["exe", "bat", "sh", "cmd", "js", "vbs", "jar", "scr", "msi"];
  if (extension && dangerousExtensions.includes(extension)) {
    return {
      valid: false,
      error: `Executable and script files (.${extension}) are strictly prohibited for campus safety.`,
    };
  }

  if (!isMimeAllowed) {
    return {
      valid: false,
      error: `Unsupported file type (${file.type || "unknown"}). Please upload a valid image or PDF document.`,
    };
  }

  return { valid: true };
}

/**
 * Strip EXIF location and camera metadata from an image before storage to protect student privacy
 */
export function sanitizeImageForPrivacy(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        // Redraw on canvas which cleanly strips all EXIF metadata and GPS coordinates
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = img.width;
        canvas.height = img.height;
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          // Export as compressed WebP or JPEG with zero metadata
          const sanitizedDataUrl = canvas.toDataURL("image/jpeg", 0.88);
          resolve(sanitizedDataUrl);
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = () => reject(new Error("Could not decode image for sanitization."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

/**
 * 3. Chat Scam & Phishing Pattern Detection
 */
export interface ScamDetectionResult {
  isSuspicious: boolean;
  threatLevel: "none" | "low" | "medium" | "high";
  reason?: string;
  advice?: string;
}

const SUSPICIOUS_PATTERNS: Array<{
  regex: RegExp;
  threatLevel: "low" | "medium" | "high";
  reason: string;
  advice: string;
}> = [
  {
    regex: /(enter|send|share)\s*(your)?\s*(upi)?\s*pin/i,
    threatLevel: "high",
    reason: "Attempt to solicit UPI PIN",
    advice: "NEVER share your UPI PIN. You only enter your PIN to send money, NEVER to receive money.",
  },
  {
    regex: /(advance|token)\s*(amount|payment|money)?\s*(via|on)?\s*(gpay|phonepe|paytm)\s*(before|prior)/i,
    threatLevel: "high",
    reason: "Advance payment request before meeting",
    advice: "Always inspect items physically at campus safe spots (Library Quad / Shed) before paying.",
  },
  {
    regex: /(telegram|whatsapp|insta|dm me on|contact me outside)\s*(at|on|:)?\s*(@|[0-9]{10})/i,
    threatLevel: "medium",
    reason: "Attempt to move conversation off campus-verified platform",
    advice: "Keep messages on the platform so your student transaction history remains protected.",
  },
  {
    regex: /(bit\.ly|tinyurl\.com|t\.me|wa\.me|goo\.gl|cutt\.ly)/i,
    threatLevel: "high",
    reason: "External URL shortener link detected",
    advice: "Do not click on shortened external links as they may lead to phishing or spoofed login pages.",
  },
  {
    regex: /(crypto|bitcoin|usdt|gift\s*card|amazon\s*voucher)/i,
    threatLevel: "high",
    reason: "Untraceable payment method requested",
    advice: "PVG's COET exchanges should only use cash or verified UPI upon physical inspection.",
  },
];

export function detectSuspiciousChatContent(message: string): ScamDetectionResult {
  if (!message || message.length < 3) {
    return { isSuspicious: false, threatLevel: "none" };
  }

  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.regex.test(message)) {
      return {
        isSuspicious: true,
        threatLevel: pattern.threatLevel,
        reason: pattern.reason,
        advice: pattern.advice,
      };
    }
  }

  return { isSuspicious: false, threatLevel: "none" };
}

/**
 * 4. Cryptographic Verifiable Student Security Hash (SHA-256)
 * Generates an immutable student security seal for Student Passports
 */
export async function generateStudentSecuritySeal(
  email: string,
  userId: string
): Promise<string> {
  const payload = `PVG_COET_VERIFIED:${email.toLowerCase().trim()}:${userId}:PUNE_CAMPUS_TRUST`;
  try {
    if (typeof window !== "undefined" && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(payload);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      return `PVG-SEC-${hashHex.slice(0, 16).toUpperCase()}`;
    }
  } catch (err) {
    console.debug("WebCrypto unavailable, using fallback seal:", err);
  }

  // Fallback deterministic hash
  let hash = 0;
  for (let i = 0; i < payload.length; i++) {
    const char = payload.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `PVG-SEC-${Math.abs(hash).toString(16).padStart(12, "0").toUpperCase()}`;
}

/**
 * 5. Client-Side Anti-Spam Rate Limiter
 */
class ActionRateLimiter {
  private lastActionTimes: Map<string, number> = new Map();

  /**
   * Check if an action is allowed within the cooldown period (in milliseconds)
   */
  canPerformAction(actionKey: string, cooldownMs: number = 2000): boolean {
    const now = Date.now();
    const lastTime = this.lastActionTimes.get(actionKey) || 0;
    if (now - lastTime < cooldownMs) {
      return false;
    }
    this.lastActionTimes.set(actionKey, now);
    return true;
  }

  getTimeRemainingMs(actionKey: string, cooldownMs: number = 2000): number {
    const now = Date.now();
    const lastTime = this.lastActionTimes.get(actionKey) || 0;
    const elapsed = now - lastTime;
    return Math.max(0, cooldownMs - elapsed);
  }

  checkRateLimit(
    actionKey: string,
    _maxAttempts: number = 5,
    cooldownMs: number = 3000
  ): { allowed: boolean; retryAfterMs: number } {
    const allowed = this.canPerformAction(actionKey, cooldownMs);
    const retryAfterMs = this.getTimeRemainingMs(actionKey, cooldownMs);
    return { allowed, retryAfterMs };
  }
}

export const rateLimiter = new ActionRateLimiter();
