/**
 * Google Docs API Client for Campus Resale & Exchange
 * Supports creating, formatting, and reading study guides and handover agreements in Google Docs.
 */

import { TopperNote, Listing } from "../types";

export interface CreatedDocResult {
  documentId: string;
  title: string;
  url: string;
}

/**
 * Creates an empty Google Doc.
 */
export async function createGoogleDoc(
  accessToken: string,
  title: string
): Promise<CreatedDocResult> {
  const response = await fetch("https://docs.googleapis.com/v1/documents", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to create Google Doc: status ${response.status}`
    );
  }

  const data = await response.json();
  return {
    documentId: data.documentId,
    title: data.title,
    url: `https://docs.google.com/document/d/${data.documentId}/edit`,
  };
}

/**
 * Appends formatted study notes, formulas, and syllabus guidelines to a Google Doc.
 */
export async function exportTopperNoteToGoogleDoc(
  accessToken: string,
  note: TopperNote
): Promise<CreatedDocResult> {
  const docTitle = `Campus Topper Notes: ${note.subject} - ${note.title}`;
  const doc = await createGoogleDoc(accessToken, docTitle);

  // Prepare structured text content
  const headerBlock = [
    `🎓 CAMPUS TOPPER NOTES VAULT`,
    `Subject: ${note.subject} | ${note.branch} (${note.semester})`,
    `Compiled by: ${note.author} (${note.authorRank || "Class Topper"})`,
    `College: ${note.authorCollege || "Government College of Engineering"}`,
    `Last Updated: ${note.lastUpdated} | Read Time: ~${note.readTimeMinutes} mins`,
    `--------------------------------------------------------------------------------\n`,
    `OVERVIEW & STUDY STRATEGY:`,
    `${note.description}\n`,
    `--------------------------------------------------------------------------------\n`,
    `DETAILED REVISION NOTES & THEORY:`,
    `${note.content.replace(/##\s+/g, "").replace(/\*\*/g, "")}\n`,
  ].join("\n");

  const formulaBlock =
    note.chapters && note.chapters.length > 0
      ? [
          `\n--------------------------------------------------------------------------------`,
          `HIGH-YIELD EXAM FORMULAS & MODULE HIGHLIGHTS:\n`,
          ...note.chapters.flatMap((ch, idx) => [
            `Module ${idx + 1}: ${ch.title}`,
            `Summary: ${ch.summary}`,
            `Formulas/Key Tips:`,
            ...(ch.keyFormulasOrTips || []).map((tip) => `  • ${tip}`),
            "",
          ]),
        ].join("\n")
      : "";

  const fullText = headerBlock + formulaBlock + `\n\n[End of Verified Topper Notes • 100% Free Open Access for Students]`;

  // Send batchUpdate to insert text into the created Google Doc
  await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text: fullText,
          },
        },
      ],
    }),
  });

  return doc;
}

/**
 * Creates an official Handover Agreement & Receipt in Google Docs.
 */
export async function exportHandoverReceiptDoc(
  accessToken: string,
  listing: Listing,
  buyerName: string,
  sellerName: string,
  handoverDetails: { date: string; time: string; location: string }
): Promise<CreatedDocResult> {
  const title = `Campus Exchange Receipt - ${listing.title.slice(0, 30)}`;
  const doc = await createGoogleDoc(accessToken, title);

  const text = [
    `🏛️ CAMPUS RESALE & EXCHANGE • VERIFIED STUDENT HANDOVER AGREEMENT`,
    `Receipt Reference: RE-${Date.now().toString().slice(-6)}`,
    `Date Generated: ${new Date().toLocaleDateString()}`,
    `--------------------------------------------------------------------------------`,
    `ITEM DETAILS:`,
    `Title: ${listing.title}`,
    `Category: ${listing.category}`,
    `Condition: ${listing.condition}`,
    `Agreed Price: ${listing.listingType === "exchange" ? "Exchange/Swap" : `₹${listing.price}`}`,
    listing.originalPrice ? `Store Retail MRP: ₹${listing.originalPrice} (Saved ₹${listing.originalPrice - listing.price})` : "",
    `\nPARTICIPANTS:`,
    `Seller: ${sellerName} (${listing.department || "Engineering"})`,
    `Buyer: ${buyerName}`,
    `\nHANDOVER APPOINTMENT:`,
    `Scheduled Date: ${handoverDetails.date}`,
    `Scheduled Time: ${handoverDetails.time}`,
    `Location Spot: ${handoverDetails.location}`,
    `\nVERIFICATION GUARANTEE:`,
    `• AI Item Inspection Score: ${listing.aiInspection?.inspectionScore || 90}% Verified`,
    `• In-Person Physical Verification: Allowed before deal finalization`,
    `• College Verified Student Protection Policy Applied`,
    `--------------------------------------------------------------------------------\n`,
  ].filter(Boolean).join("\n");

  await fetch(`https://docs.googleapis.com/v1/documents/${doc.documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        {
          insertText: {
            location: { index: 1 },
            text,
          },
        },
      ],
    }),
  });

  return doc;
}

/**
 * Reads a Google Doc's text content.
 */
export async function fetchGoogleDoc(
  accessToken: string,
  documentId: string
): Promise<{ title: string; bodyText: string }> {
  const response = await fetch(`https://docs.googleapis.com/v1/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to read Google Doc: status ${response.status}`);
  }

  const data = await response.json();
  let bodyText = "";
  if (data.body?.content) {
    for (const element of data.body.content) {
      if (element.paragraph?.elements) {
        for (const el of element.paragraph.elements) {
          if (el.textRun?.content) {
            bodyText += el.textRun.content;
          }
        }
      }
    }
  }

  return {
    title: data.title || "Untitled Google Doc",
    bodyText,
  };
}
