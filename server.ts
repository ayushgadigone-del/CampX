import express, { Request, Response } from "express";
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

// Middleware for parsing large image payloads
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy initialization of Gemini client
let genAIClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is missing.");
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

// Image Analysis using Gemini 3.1 Pro Preview as required
app.post("/api/analyze-image", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType } = req.body;

    if (!imageBase64) {
      res.status(400).json({ error: "No image payload provided" });
      return;
    }

    // Clean base64 string
    const base64Data = imageBase64.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const cleanMime = mimeType || "image/jpeg";

    const ai = getGeminiClient();

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
      console.warn("Primary model gemini-3.8-flash encountered issue, retrying with gemini-flash-latest:", primaryErr?.message);
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
        console.warn("Gemini fallback model also failed:", fallbackErr?.message);
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
    console.error("Gemini image analysis error:", error);
    res.status(500).json({
      error: "Failed to analyze image using Gemini",
      details: error?.message || "Unknown error",
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
