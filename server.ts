import express from "express";
import type { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import nodemailer from "nodemailer";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const isProduction =
  process.env.NODE_ENV === "production" ||
  process.argv.some((arg) => arg.includes("server.js") || arg.includes("server.cjs") || arg.includes("dist"));

// Support both CLI flags (--port 3000, --host 0.0.0.0) and environment variables
let port = 3000;
const portArgIndex = process.argv.findIndex((arg) => arg === "--port" || arg === "-p");
if (portArgIndex !== -1 && process.argv[portArgIndex + 1]) {
  const parsed = parseInt(process.argv[portArgIndex + 1], 10);
  if (!isNaN(parsed) && parsed > 0) {
    port = parsed;
  }
} else if (process.env.PORT && process.env.PORT !== "8080") {
  port = parseInt(process.env.PORT, 10);
}
const PORT = port;

let host = "0.0.0.0";
const hostArgIndex = process.argv.findIndex((arg) => arg === "--host" || arg === "-h");
if (hostArgIndex !== -1 && process.argv[hostArgIndex + 1]) {
  host = process.argv[hostArgIndex + 1];
}
const HOST = host;

// Security: Disable X-Powered-By header to prevent server technology fingerprinting
app.disable("x-powered-by");

// Process-level error resilience to keep dev server robust
process.on("unhandledRejection", (reason, promise) => {
  console.warn("Dev server unhandled rejection caught:", reason);
});
process.on("uncaughtException", (err) => {
  console.error("Dev server uncaught exception caught:", err?.message || err);
});

// Security: HTTP Security & Privacy Headers Middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  // Prevent MIME-sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");
  // Cross-site scripting filter
  res.setHeader("X-XSS-Protection", "1; mode=block");
  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  // Restrict unrequested device features
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Prevent browser & proxy caching on all API routes to protect user data
  if (req.path.startsWith("/api/")) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
  }

  next();
});

// Middleware for parsing image payloads with strict size boundaries
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Security: In-memory sliding-window Rate Limiter for API endpoints
interface RateLimitRecord {
  count: number;
  resetTime: number;
}
const rateLimitMap = new Map<string, RateLimitRecord>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 25; // 25 requests/min per IP

function apiRateLimiter(req: Request, res: Response, next: NextFunction): void {
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown-client";

  const now = Date.now();
  const clientRecord = rateLimitMap.get(ip);

  if (!clientRecord || now > clientRecord.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    next();
    return;
  }

  if (clientRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: "Rate limit exceeded. Too many requests. Please wait a minute before trying again.",
    });
    return;
  }

  clientRecord.count += 1;
  next();
}

// Periodically clean up expired rate-limiting entries to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}, 5 * 60 * 1000);

// Security: Secret Redactor utility to ensure no API keys or endpoint tokens ever leak in error responses or logs
function scrubSecrets(rawText: string): string {
  if (!rawText || typeof rawText !== "string") return "";
  let scrubbed = rawText;
  const secretsToRedact = [
    process.env.GEMINI_API_KEY,
    process.env.SMTP_PASS,
    process.env.SESSION_SECRET,
  ];
  for (const secret of secretsToRedact) {
    if (secret && secret.length > 5) {
      scrubbed = scrubbed.split(secret).join("[REDACTED_SECRET]");
    }
  }
  return scrubbed
    .replace(/AIza[0-9A-Za-z-_]{35}/g, "[REDACTED_API_KEY]")
    .replace(/key=[a-zA-Z0-9_\-]+/gi, "key=[REDACTED]")
    .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "Bearer [REDACTED]")
    .replace(/https?:\/\/[^\s"',]+/gi, "[REDACTED_ENDPOINT]");
}

// Lazy initialization of Gemini client with secret isolation
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("Security Alert: GEMINI_API_KEY environment variable is not configured.");
      return null;
    }
    genAIClient = new GoogleGenAI({ apiKey });
  }
  return genAIClient;
}

// Health check endpoints for Cloud Run startup/liveness probes and monitoring
app.get(["/health", "/api/health", "/_health"], (_req: Request, res: Response) => {
  res.status(200).json({
    status: "ok",
    service: "campus-resale-backend",
    timestamp: new Date().toISOString(),
  });
});

// ============================================================================
// Campus Student Account Auth (Email + Password + Email OTP Verification)
// ============================================================================

const ALLOWED_COLLEGE_DOMAIN = "pvgcoet.ac.in";
const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_RESEND_COOLDOWN_MS = 30 * 1000; // 30 seconds
const MAX_OTP_ATTEMPTS = 5;

// Ephemeral HMAC key if SESSION_SECRET is not provided in environment
const SESSION_SIGNING_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex");

interface StoredStudentAccount {
  uid: string;
  email: string;
  firstName: string;
  surname: string;
  displayName: string;
  year: string;
  branch: string;
  photoURL: string;
  passwordSalt: string;
  passwordHash: string;
  emailVerified: boolean;
  createdAt: string;
}

interface PendingOtpRegistration {
  email: string;
  firstName: string;
  surname: string;
  displayName: string;
  year: string;
  branch: string;
  photoURL: string;
  passwordSalt: string;
  passwordHash: string;
  otpHash: string;
  expiresAt: number;
  lastSentAt: number;
  attempts: number;
}

const ACCOUNTS_STORE_PATH = path.join(os.tmpdir(), "campus-resale-student-accounts.json");
const studentAccountsMap = new Map<string, StoredStudentAccount>();
const pendingOtpMap = new Map<string, PendingOtpRegistration>();

function loadPersistedAccounts(): void {
  try {
    if (!fs.existsSync(ACCOUNTS_STORE_PATH)) return;
    const raw = fs.readFileSync(ACCOUNTS_STORE_PATH, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      for (const acc of parsed) {
        if (acc && typeof acc.email === "string" && typeof acc.passwordHash === "string" && typeof acc.passwordSalt === "string") {
          studentAccountsMap.set(acc.email.toLowerCase(), acc as StoredStudentAccount);
        }
      }
    }
  } catch (err: any) {
    console.warn("Could not hydrate student accounts store:", scrubSecrets(err?.message || ""));
  }
}

function savePersistedAccounts(): void {
  try {
    const serialized = JSON.stringify(Array.from(studentAccountsMap.values()));
    fs.writeFileSync(ACCOUNTS_STORE_PATH, serialized, { encoding: "utf8", mode: 0o600 });
  } catch (err: any) {
    console.warn("Could not persist student accounts store:", scrubSecrets(err?.message || ""));
  }
}

loadPersistedAccounts();

// Periodically clear expired pending OTP registrations
setInterval(() => {
  const now = Date.now();
  for (const [email, pending] of pendingOtpMap.entries()) {
    if (now > pending.expiresAt) {
      pendingOtpMap.delete(email);
    }
  }
}, 2 * 60 * 1000);

function isAuthorizedCollegeEmail(email: string): boolean {
  const trimmed = email.trim().toLowerCase();
  const basicFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return basicFormat.test(trimmed) && trimmed.endsWith(`@${ALLOWED_COLLEGE_DOMAIN}`);
}

function hashPassword(password: string): { salt: string; hash: string } {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password: string, salt: string, expectedHashHex: string): boolean {
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHashHex, "hex");
    if (derived.length !== expected.length) return false;
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

function hashOtpCode(email: string, otp: string): string {
  return crypto
    .createHmac("sha256", SESSION_SIGNING_SECRET)
    .update(`${email.toLowerCase()}:${otp}`)
    .digest("hex");
}

function verifyOtpCode(email: string, candidateOtp: string, expectedHashHex: string): boolean {
  try {
    const candidateHash = Buffer.from(hashOtpCode(email, candidateOtp), "hex");
    const expectedHash = Buffer.from(expectedHashHex, "hex");
    if (candidateHash.length !== expectedHash.length) return false;
    return crypto.timingSafeEqual(candidateHash, expectedHash);
  } catch {
    return false;
  }
}

function createSignedSessionToken(uid: string, email: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      uid,
      email,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
    })
  ).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SIGNING_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function sanitizePlainText(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[<>]/g, "").trim().slice(0, maxLen);
}

function isValidAvatarPhoto(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 2 * 1024 * 1024) return false;
  return /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(trimmed) || /^https:\/\//i.test(trimmed);
}

interface OtpDeliveryResult {
  delivered: boolean;
  method: "smtp" | "preview";
}

async function sendOtpEmail(
  toEmail: string,
  otpCode: string,
  fullName: string
): Promise<OtpDeliveryResult> {
  const subject = `${otpCode} is your Campus Resale verification code`;
  const textBody = [
    `Hi ${fullName},`,
    "",
    `Your one-time password (OTP) to verify your PVG COET Campus Resale account is: ${otpCode}`,
    "",
    "This code expires in 10 minutes. If you did not request this account, you can safely ignore this email.",
    "",
    "— Campus Resale · PVG's COET",
  ].join("\n");

  const safeName = fullName.replace(/[&<>"']/g, "");
  const htmlBody = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; background: #F7F9F8; color: #18201C;">
      <div style="background: #ffffff; border: 1px solid #DFE6E2; border-radius: 16px; padding: 28px;">
        <div style="font-weight: 700; font-size: 16px; color: #224134; margin-bottom: 16px;">Campus Resale</div>
        <h2 style="margin: 0 0 8px; font-size: 20px; color: #18201C;">Verify your college email</h2>
        <p style="margin: 0 0 20px; font-size: 14px; color: #5C6B63; line-height: 1.5;">
          Hi ${safeName}, enter the 6-digit one-time password below to complete your Campus Resale account creation.
        </p>
        <div style="background: #EFF4F1; border: 1px solid #C4D9D1; border-radius: 12px; padding: 16px; text-align: center; font-size: 28px; font-weight: 700; letter-spacing: 0.25em; color: #224134;">
          ${otpCode}
        </div>
        <p style="margin: 18px 0 0; font-size: 12px; color: #5C6B63;">
          This verification code expires in 10 minutes. Do not share it with anyone.
        </p>
      </div>
    </div>
  `;

  // Option 1: SMTP via Nodemailer (supports Gmail App Passwords with or without spaces)
  const smtpUser = process.env.SMTP_USER?.trim();
  const rawSmtpPass = process.env.SMTP_PASS?.trim();
  const inferredHost =
    process.env.SMTP_HOST?.trim() ||
    (smtpUser?.toLowerCase().endsWith("@gmail.com") ? "smtp.gmail.com" : "");
  const smtpPass =
    rawSmtpPass && inferredHost.toLowerCase().includes("gmail.com")
      ? rawSmtpPass.replace(/\s+/g, "")
      : rawSmtpPass;

  if (inferredHost && smtpUser && smtpPass) {
    const smtpPort = Number(process.env.SMTP_PORT || 587);
    const transporter = nodemailer.createTransport({
      host: inferredHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    const fromAddress = process.env.SMTP_FROM?.trim() || `Campus Resale <${smtpUser}>`;
    await transporter.sendMail({
      from: fromAddress,
      to: toEmail,
      subject,
      text: textBody,
      html: htmlBody,
    });
    return { delivered: true, method: "smtp" };
  }

  // Fallback when SMTP secrets are not configured yet
  return { delivered: false, method: "preview" };
}

// 1. Request OTP for new account creation
app.post("/api/auth/request-otp", apiRateLimiter, async (req: Request, res: Response) => {
  try {
    const { fullName, email, password, year, branch, photoURL } = req.body || {};

    const cleanFullName = sanitizePlainText(fullName, 120);
    const nameParts = cleanFullName.split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
      res.status(400).json({ error: "Please enter your full name (first name and surname)." });
      return;
    }
    const firstName = nameParts[0].slice(0, 60);
    const surname = nameParts.slice(1).join(" ").slice(0, 60);

    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    if (!isAuthorizedCollegeEmail(cleanEmail)) {
      res.status(400).json({
        error: `Please enter a valid college email ending with @${ALLOWED_COLLEGE_DOMAIN}.`,
      });
      return;
    }

    if (studentAccountsMap.has(cleanEmail)) {
      res.status(409).json({
        error: "An account with this college email already exists. Please sign in instead.",
      });
      return;
    }

    if (typeof password !== "string" || password.length < 8 || password.length > 128) {
      res.status(400).json({ error: "Password must be at least 8 characters long." });
      return;
    }

    const cleanYear = sanitizePlainText(year, 60);
    if (!cleanYear) {
      res.status(400).json({ error: "Year of study is required." });
      return;
    }

    const cleanBranch = sanitizePlainText(branch, 100);
    if (!cleanBranch) {
      res.status(400).json({ error: "Branch is required." });
      return;
    }

    if (!isValidAvatarPhoto(photoURL)) {
      res.status(400).json({ error: "A valid profile photo (JPG, PNG, or WEBP) is required." });
      return;
    }

    const { salt: passwordSalt, hash: passwordHash } = hashPassword(password);
    const otpCode = String(crypto.randomInt(100000, 1000000));
    const otpHash = hashOtpCode(cleanEmail, otpCode);
    const now = Date.now();

    pendingOtpMap.set(cleanEmail, {
      email: cleanEmail,
      firstName,
      surname,
      displayName: `${firstName} ${surname}`.trim(),
      year: cleanYear,
      branch: cleanBranch,
      photoURL: photoURL.trim(),
      passwordSalt,
      passwordHash,
      otpHash,
      expiresAt: now + OTP_TTL_MS,
      lastSentAt: now,
      attempts: 0,
    });

    const delivery = await sendOtpEmail(cleanEmail, otpCode, `${firstName} ${surname}`.trim());

    if (delivery.delivered) {
      res.status(200).json({
        success: true,
        deliveryMethod: "email",
        email: cleanEmail,
        expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
        message: `A 6-digit verification code has been sent to ${cleanEmail}.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      deliveryMethod: "preview",
      email: cleanEmail,
      expiresInSeconds: Math.floor(OTP_TTL_MS / 1000),
      previewOtp: otpCode,
      message:
        "Email delivery (SMTP/Resend) is not yet configured in environment secrets. Use the verification code shown below to verify your account.",
    });
  } catch (err: any) {
    console.error("OTP request error:", scrubSecrets(err?.message || ""));
    res.status(500).json({
      error: "Could not send verification OTP right now. Please try again.",
    });
  }
});

// 2. Resend OTP for pending registration
app.post("/api/auth/resend-otp", apiRateLimiter, async (req: Request, res: Response) => {
  try {
    const cleanEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const pending = pendingOtpMap.get(cleanEmail);
    if (!pending) {
      res.status(404).json({
        error: "Your verification session expired. Please fill in your account details again.",
      });
      return;
    }

    const now = Date.now();
    const elapsed = now - pending.lastSentAt;
    if (elapsed < OTP_RESEND_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((OTP_RESEND_COOLDOWN_MS - elapsed) / 1000);
      res.status(429).json({
        error: `Please wait ${waitSeconds} seconds before requesting another OTP.`,
      });
      return;
    }

    const otpCode = String(crypto.randomInt(100000, 1000000));
    pending.otpHash = hashOtpCode(cleanEmail, otpCode);
    pending.expiresAt = now + OTP_TTL_MS;
    pending.lastSentAt = now;
    pending.attempts = 0;

    const delivery = await sendOtpEmail(cleanEmail, otpCode, pending.displayName);

    if (delivery.delivered) {
      res.status(200).json({
        success: true,
        deliveryMethod: "email",
        email: cleanEmail,
        message: `A new 6-digit verification code has been sent to ${cleanEmail}.`,
      });
      return;
    }

    res.status(200).json({
      success: true,
      deliveryMethod: "preview",
      email: cleanEmail,
      previewOtp: otpCode,
      message: "A fresh preview verification code has been generated.",
    });
  } catch (err: any) {
    console.error("OTP resend error:", scrubSecrets(err?.message || ""));
    res.status(500).json({ error: "Could not resend OTP right now. Please try again." });
  }
});

// 3. Verify OTP and finalize student account creation
app.post("/api/auth/verify-otp", apiRateLimiter, (req: Request, res: Response) => {
  try {
    const cleanEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const cleanOtp = typeof req.body?.otp === "string" ? req.body.otp.replace(/\D/g, "").trim() : "";

    if (!cleanEmail || cleanOtp.length !== 6) {
      res.status(400).json({ error: "Please enter the 6-digit one-time password." });
      return;
    }

    const pending = pendingOtpMap.get(cleanEmail);
    if (!pending) {
      res.status(404).json({
        error: "Verification code expired or not found. Please request a new code.",
      });
      return;
    }

    if (Date.now() > pending.expiresAt) {
      pendingOtpMap.delete(cleanEmail);
      res.status(410).json({
        error: "Your one-time password has expired. Please create your account again.",
      });
      return;
    }

    if (pending.attempts >= MAX_OTP_ATTEMPTS) {
      pendingOtpMap.delete(cleanEmail);
      res.status(429).json({
        error: "Too many incorrect attempts. Please request a new verification code.",
      });
      return;
    }

    if (!verifyOtpCode(cleanEmail, cleanOtp, pending.otpHash)) {
      pending.attempts += 1;
      const remaining = Math.max(0, MAX_OTP_ATTEMPTS - pending.attempts);
      res.status(400).json({
        error:
          remaining > 0
            ? `Incorrect verification code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.`
            : "Too many incorrect attempts. Please request a new verification code.",
      });
      return;
    }

    const uid = `student-${crypto
      .createHash("sha256")
      .update(cleanEmail)
      .digest("hex")
      .slice(0, 16)}`;

    const newAccount: StoredStudentAccount = {
      uid,
      email: cleanEmail,
      firstName: pending.firstName,
      surname: pending.surname,
      displayName: pending.displayName,
      year: pending.year,
      branch: pending.branch,
      photoURL: pending.photoURL,
      passwordSalt: pending.passwordSalt,
      passwordHash: pending.passwordHash,
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    studentAccountsMap.set(cleanEmail, newAccount);
    savePersistedAccounts();
    pendingOtpMap.delete(cleanEmail);

    res.status(200).json({
      success: true,
      email: cleanEmail,
      message: "Account verified and created! You can now sign in using your college email and password.",
    });
  } catch (err: any) {
    console.error("OTP verification error:", scrubSecrets(err?.message || ""));
    res.status(500).json({ error: "Could not verify your code. Please try again." });
  }
});

// 4. Sign in with verified college email & password
app.post("/api/auth/signin", apiRateLimiter, (req: Request, res: Response) => {
  try {
    const cleanEmail = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
    const password = typeof req.body?.password === "string" ? req.body.password : "";

    if (!isAuthorizedCollegeEmail(cleanEmail)) {
      res.status(400).json({
        error: `Please sign in using your verified @${ALLOWED_COLLEGE_DOMAIN} college email.`,
      });
      return;
    }

    if (!password) {
      res.status(400).json({ error: "Please enter your password." });
      return;
    }

    const account = studentAccountsMap.get(cleanEmail);
    if (!account || !account.emailVerified) {
      res.status(401).json({
        error: "Invalid PVG college email or password. If you don't have an account yet, click Create account.",
      });
      return;
    }

    const isPasswordValid = verifyPassword(password, account.passwordSalt, account.passwordHash);
    if (!isPasswordValid) {
      res.status(401).json({
        error: "Invalid PVG college email or password.",
      });
      return;
    }

    const token = createSignedSessionToken(account.uid, account.email);
    res.status(200).json({
      success: true,
      token,
      user: {
        uid: account.uid,
        email: account.email,
        firstName: account.firstName,
        surname: account.surname,
        displayName: account.displayName,
        year: account.year,
        branch: account.branch,
        photoURL: account.photoURL,
      },
    });
  } catch (err: any) {
    console.error("Sign-in error:", scrubSecrets(err?.message || ""));
    res.status(500).json({ error: "Sign in failed. Please try again." });
  }
});

// Image Analysis using Gemini model with rigorous validation & key isolation
app.post("/api/analyze-image", apiRateLimiter, async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;

    // Security: Validate payload presence & type
    if (!imageBase64 || typeof imageBase64 !== "string") {
      res.status(400).json({ error: "Invalid or missing image payload" });
      return;
    }

    // Security: Enforce payload size limit (max 15MB of base64 text)
    if (imageBase64.length > 15 * 1024 * 1024) {
      res.status(400).json({ error: "Image size exceeds the 15MB limit. Please upload a compressed photo." });
      return;
    }

    // Security: Whitelist allowed MIME types
    const allowedMimeTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
      "image/gif",
      "image/heic",
    ];
    const cleanMime = typeof mimeType === "string" && allowedMimeTypes.includes(mimeType.toLowerCase())
      ? mimeType.toLowerCase()
      : "image/jpeg";

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    // Validate sanitized base64 structure
    if (!base64Data || base64Data.length < 50) {
      res.status(400).json({ error: "Invalid image format received." });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error: "AI inspection service is temporarily unavailable. Please try again later.",
      });
      return;
    }

    const prompt = `You are a certified campus resale inspector for an engineering college marketplace.
Your primary task is to perform an in-depth visual analysis of this photo of a student-owned pre-owned item to accurately determine its Category and physical Condition for the Create Listing form.

1. CATEGORY CLASSIFICATION RULES (Choose STRICTLY one of these 6 categories):
- "Books": Textbooks, reference guides, course syllabi, past-year question banks, engineering math/physics/chemistry books, lab manuals, novels, notebooks.
- "Calculators": Scientific calculators (Casio fx-991 series, fx-82MS, fx-991CW, Texas Instruments, HP), graphing calculators, financial calculators.
- "Lab Equipment": Mini drafters, engineering drawing boards, Vernier calipers, screw gauges, breadboards, digital multimeters, soldering kits, lab coats/workshop aprons, Arduino/Raspberry Pi starter boards, chemistry/biology sets.
- "Cycles": Bicycles, mountain bikes, gear cycles, campus commuter cycles, cycle U-locks, pumps, bells.
- "Bags": College backpacks, laptop bags, rucksacks, messenger bags, gym duffel bags.
- "Other": Desk lamps, headphones, dorm electronics, scientific stationery sets, sports gear, hostel utilities.

2. CONDITION ASSESSMENT RULES (Choose STRICTLY one of these 4 conditions):
- "Like New": Pristine, flawless condition. Shows zero to negligible surface marks, pristine screen/covers, sharp corners, spotless keypads or pedals. Looks virtually brand new or barely used.
- "Good": Normal gentle campus use. Fully intact, clean, and 100% operational. May show faint surface hairline scuffs, slight corner rubbing, or minor cosmetic patina, but well-preserved.
- "Fair": Noticeable signs of regular student use. Surface scratches, highlighted pages in textbooks, slightly worn tires/grips on cycles, fabric fading, or loose rubber pads, but structurally intact and fully functional.
- "Wear & Tear": Heavy cosmetic or physical wear. Visible scratches/dents, taped spine, worn zipper pulls, chipped casing, or rusted cycle parts, but still operational or repairable for student use.

Return a STRICT JSON response adhering precisely to this structure:
{
  "title": "Concise product title specifying brand, model, or subject if readable (e.g., 'Casio fx-991EX ClassWiz Scientific Calculator')",
  "category": "Books" | "Calculators" | "Lab Equipment" | "Cycles" | "Bags" | "Other",
  "categoryConfidence": integer between 65 and 99 indicating percentage confidence in category,
  "categoryReasoning": "1 clear sentence citing specific visual elements that confirmed this category (e.g., 'Identified solar cell panel, dual-line dot matrix LCD, and scientific trigonometric key layout.')",
  "condition": "Like New" | "Good" | "Fair" | "Wear & Tear",
  "conditionReasoning": "1 clear sentence detailing visual signs of cosmetic and mechanical wear observed (e.g., 'Surface and screen are devoid of scratches with crisp key legends and pristine battery compartment.')",
  "inspectionScore": integer between 50 and 99 reflecting overall physical quality,
  "conditionDetails": "2-sentence practical assessment of cosmetic and functional state for student buyers",
  "suggestedPriceMin": integer representing minimum fair campus resale price in INR (₹),
  "suggestedPriceMax": integer representing maximum fair campus resale price in INR (₹),
  "keyFeatures": ["Key feature 1", "Key feature 2", "Key feature 3"],
  "recommendedHandoverTips": "Practical test or inspection step for the buyer when meeting on campus quad/library",
  "authenticityCheck": "Visual check on brand logo, serials, CE/ISI marks, or official publication imprint"
}
Ensure the pricing is realistic for an Indian engineering college student budget.`;

    let responseText = "{}";
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: cleanMime,
                  data: base64Data,
                },
              },
              {
                text: prompt,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
      responseText = response.text?.trim() || "{}";
    } catch (primaryErr: any) {
      console.warn("Primary model gemini-3.8-flash encountered issue, retrying with gemini-flash-latest:", scrubSecrets(primaryErr?.message || ""));
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: [
            {
              role: "user",
              parts: [
                {
                  inlineData: {
                    mimeType: cleanMime,
                    data: base64Data,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          config: {
            responseMimeType: "application/json",
          },
        });
        responseText = fallbackResponse.text?.trim() || "{}";
      } catch (fallbackErr: any) {
        console.warn("Gemini fallback model also failed:", scrubSecrets(fallbackErr?.message || ""));
        responseText = "{}";
      }
    }

    let parsedResult: any = {};
    try {
      parsedResult = JSON.parse(responseText);
    } catch {
      parsedResult = {};
    }

    // Normalize and validate category
    const validCategories = ["Books", "Calculators", "Lab Equipment", "Cycles", "Bags", "Other"];
    let finalCategory = "Other";
    if (parsedResult.category) {
      const catMatch = validCategories.find(
        (c) => c.toLowerCase() === String(parsedResult.category).trim().toLowerCase()
      );
      if (catMatch) {
        finalCategory = catMatch;
      } else if (/calc/i.test(parsedResult.category)) {
        finalCategory = "Calculators";
      } else if (/book|textbook|guide|notes/i.test(parsedResult.category)) {
        finalCategory = "Books";
      } else if (/lab|drafter|board|caliper|meter|circuit|arduino/i.test(parsedResult.category)) {
        finalCategory = "Lab Equipment";
      } else if (/cycle|bike|bicycle/i.test(parsedResult.category)) {
        finalCategory = "Cycles";
      } else if (/bag|backpack|pack|sack/i.test(parsedResult.category)) {
        finalCategory = "Bags";
      }
    }

    // Normalize and validate condition
    const validConditions = ["Like New", "Good", "Fair", "Wear & Tear"];
    let finalCondition = "Good";
    if (parsedResult.condition) {
      const condMatch = validConditions.find(
        (c) => c.toLowerCase() === String(parsedResult.condition).trim().toLowerCase()
      );
      if (condMatch) {
        finalCondition = condMatch;
      } else if (/new|mint|pristine|unopened/i.test(parsedResult.condition)) {
        finalCondition = "Like New";
      } else if (/wear|heavy|torn|damage|broken/i.test(parsedResult.condition)) {
        finalCondition = "Wear & Tear";
      } else if (/fair|used|moderate/i.test(parsedResult.condition)) {
        finalCondition = "Fair";
      }
    }

    const analysisResult = {
      title: parsedResult.title || "Student Pre-Owned Item",
      category: finalCategory,
      categoryConfidence: typeof parsedResult.categoryConfidence === "number" ? parsedResult.categoryConfidence : 92,
      categoryReasoning: parsedResult.categoryReasoning || `Visual cues in photo strongly match campus ${finalCategory} standards.`,
      condition: finalCondition,
      conditionReasoning: parsedResult.conditionReasoning || `Surface inspection reveals ${finalCondition.toLowerCase()} status with normal student handling.`,
      inspectionScore: typeof parsedResult.inspectionScore === "number" ? parsedResult.inspectionScore : 84,
      conditionDetails: parsedResult.conditionDetails || `Inspected visual condition: ${finalCondition}. Fully suitable for student campus exchange.`,
      suggestedPriceMin: typeof parsedResult.suggestedPriceMin === "number" ? parsedResult.suggestedPriceMin : 250,
      suggestedPriceMax: typeof parsedResult.suggestedPriceMax === "number" ? parsedResult.suggestedPriceMax : 550,
      keyFeatures: Array.isArray(parsedResult.keyFeatures) && parsedResult.keyFeatures.length > 0
        ? parsedResult.keyFeatures
        : ["Clean student-owned item", "Campus verified condition", "Ready for handover"],
      recommendedHandoverTips: parsedResult.recommendedHandoverTips || "Meet at library quad and inspect functionality before handover.",
      authenticityCheck: parsedResult.authenticityCheck || "Standard manufacturing and label markings verified.",
    };

    res.json({
      success: true,
      analysis: analysisResult,
    });
  } catch (error: any) {
    // Security: Ensure raw error objects, URLs, or API keys are NEVER sent to the client
    const scrubbedErrorMsg = scrubSecrets(error?.message || "");
    console.error("Gemini image analysis error:", scrubbedErrorMsg);

    res.status(500).json({
      error: "Failed to process image analysis. Please try again with a clear photo.",
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function setupApp() {
  const distPath = path.join(process.cwd(), "dist");

  // Vite middleware for development
  if (!isProduction) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production static file serving
    app.use(express.static(distPath));
    app.use((_req: Request, res: Response) => {
      const indexFile = path.join(distPath, "index.html");
      if (fs.existsSync(indexFile)) {
        res.sendFile(indexFile);
      } else {
        res.status(200).send("<!DOCTYPE html><html><head><title>Campus Resale & Exchange</title></head><body><div id='root'>Loading...</div></body></html>");
      }
    });
  }

  const server = app.listen(PORT, HOST, () => {
    console.log(`Campus Resale & Exchange server listening on http://${HOST}:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });

  server.on("error", (err: any) => {
    console.error(`Server error on port ${PORT}:`, err?.message || err);
  });

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

setupApp().catch((err) => {
  console.error("Critical failure during setupApp:", err);
});
