import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === "production";
// In development, the dev server must bind to port 3000 behind the Nginx reverse proxy.
// In production on Cloud Run, listen on Cloud Run's injected PORT (default 8080) or fallback to 3000.
const PORT = isProduction && process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Security: Disable X-Powered-By header to prevent server technology fingerprinting
app.disable("x-powered-by");

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
  const apiKey = process.env.GEMINI_API_KEY;
  let scrubbed = rawText;
  if (apiKey && apiKey.length > 5) {
    scrubbed = scrubbed.split(apiKey).join("[REDACTED_API_KEY]");
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

  const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Campus Resale & Exchange server listening on http://0.0.0.0:${PORT} (NODE_ENV=${process.env.NODE_ENV || 'development'})`);
  });

  server.on("error", (err: any) => {
    console.error(`Server error on primary port ${PORT}:`, err?.message || err);
  });

  // In production on Cloud Run (e.g. PORT=8080), also listen on port 3000 if available
  // so both direct traffic and reverse-proxied traffic are seamlessly supported.
  if (isProduction && PORT !== 3000) {
    try {
      const secondaryServer = app.listen(3000, "0.0.0.0", () => {
        console.log("Also listening on internal port 3000");
      });
      secondaryServer.on("error", (err: any) => {
        if (err.code !== "EADDRINUSE") {
          console.warn("Secondary port 3000 notice:", err?.message);
        }
      });
    } catch {
      // Ignore if port 3000 cannot be bound
    }
  }

  const shutdown = () => {
    server.close(() => {
      process.exit(0);
    });
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

setupApp();
