import { TopperNote } from "../types";
import { initialTopperNotes, APP_OWNER_EMAIL } from "../data/topperNotesData";
import { uploadFileToDrive } from "../lib/googleDrive";
import { getAccessToken, googleSignIn } from "../lib/firebase";

const STORAGE_KEY = "campus_topper_notes_vault_v2";

const FALLBACK_CONTRIBUTORS: Record<string, string> = {
  "note-dsa-trees-graphs": "Rohan Deshmukh",
  "note-engg-maths-transform": "Sneha Kulkarni",
  "note-thermodynamics-ic-engines": "Aditya Joshi",
  "note-dbms-sql-normalization": "Meera Patwardhan",
  "note-aids-deep-learning": "Vikram Patil",
  "note-etc-signals-systems": "Ananya Deshpande",
  "note-electrical-machines": "Pranav Kulkarni",
};

/**
 * Strips any legacy "App Owner" attribution from stored notes so no owner name is exposed.
 */
function sanitizeTopperNote(note: TopperNote): TopperNote {
  const authorLower = (note.author || "").toLowerCase();
  if (authorLower.includes("app owner") || authorLower.startsWith("ayush g")) {
    return {
      ...note,
      author: FALLBACK_CONTRIBUTORS[note.id] || "Department Topper",
    };
  }
  return note;
}

/**
 * Returns whether a given user email has curator edit permissions.
 */
export function isAppOwner(userEmail?: string | null): boolean {
  if (!userEmail) return false;
  const clean = userEmail.trim().toLowerCase();
  return (
    clean === APP_OWNER_EMAIL.trim().toLowerCase() ||
    clean === "ayush.gadigone@pvgcoet.ac.in" ||
    clean.startsWith("ayushgadigone")
  );
}

/**
 * Loads topper notes from localStorage, falling back to pre-uploaded notes.
 */
export function getStoredTopperNotes(): TopperNote[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map(sanitizeTopperNote);
      }
    }
  } catch (err) {
    console.warn("Could not read stored topper notes:", err);
  }
  return initialTopperNotes;
}

/**
 * Saves topper notes list to localStorage.
 */
export function saveStoredTopperNotes(notes: TopperNote[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes.map(sanitizeTopperNote)));
  } catch (err) {
    console.warn("Could not save topper notes to localStorage:", err);
  }
}

/**
 * Resets topper notes back to initial pre-uploaded state.
 */
export function resetStoredTopperNotes(): TopperNote[] {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn("Notice resetting topper notes:", err);
  }
  return initialTopperNotes;
}

/**
 * Builds a clean printable Markdown/text document for notes that don't have a binary attachment.
 */
export function buildTopperNoteDocumentText(note: TopperNote): string {
  const lines: string[] = [
    `# ${note.title}`,
    "",
    `Subject: ${note.subject}`,
    `Branch: ${note.branch} | Semester: ${note.semester}`,
    `Contributor: ${note.author}${note.authorRank ? ` (${note.authorRank})` : ""}`,
    `Last Updated: ${note.lastUpdated}`,
    "",
    "## Overview",
    note.description || "",
    "",
    "## Study Guide Notes",
    note.content || "",
  ];

  if (note.chapters && note.chapters.length > 0) {
    lines.push("", "## Modules & Key Formula Cards");
    note.chapters.forEach((ch, idx) => {
      lines.push("", `### Module ${idx + 1}: ${ch.title}`);
      if (ch.summary) lines.push(ch.summary);
      if (ch.keyFormulasOrTips && ch.keyFormulasOrTips.length > 0) {
        ch.keyFormulasOrTips.forEach((tip) => lines.push(`- ${tip}`));
      }
    });
  }

  return lines.join("\n");
}

/**
 * Converts a TopperNote (attached file OR rich study guide) into a downloadable Blob + filename.
 */
export async function buildTopperNoteBlob(
  note: TopperNote
): Promise<{ blob: Blob; fileName: string; mimeType: string }> {
  const safeSlug = note.title
    .replace(/[^a-zA-Z0-9\s-_]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .slice(0, 80);

  if (note.fileUrl && note.fileUrl.startsWith("data:")) {
    const res = await fetch(note.fileUrl);
    const blob = await res.blob();
    return {
      blob,
      fileName: note.fileName || `${safeSlug || "Topper_Note"}.pdf`,
      mimeType: note.fileType || blob.type || "application/octet-stream",
    };
  }

  const docText = buildTopperNoteDocumentText(note);
  const blob = new Blob([docText], { type: "text/markdown;charset=utf-8" });
  return {
    blob,
    fileName: note.fileName || `${safeSlug || "Topper_Note"}_${note.semester.replace(/\s+/g, "")}.md`,
    mimeType: "text/markdown",
  };
}

/**
 * Downloads ANY topper note document locally to the user's device.
 */
export async function downloadTopperNoteLocally(note: TopperNote): Promise<string> {
  if (note.fileUrl && (note.fileUrl.startsWith("http://") || note.fileUrl.startsWith("https://"))) {
    const link = document.createElement("a");
    link.href = note.fileUrl;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.download = note.fileName || `${note.title.replace(/\s+/g, "_")}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return note.fileName || note.title;
  }

  const { blob, fileName } = await buildTopperNoteBlob(note);
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  return fileName;
}

/**
 * Shares ANY topper note using Web Share API when available, falling back to clipboard copy.
 */
export async function shareTopperNote(note: TopperNote): Promise<"shared" | "copied"> {
  const shareUrl = `${window.location.origin}${window.location.pathname}?notes=${encodeURIComponent(
    note.id
  )}`;
  const shareText = `${note.title} (${note.subject} · ${note.semester}) — Free PVG's COET Topper Notes Vault`;

  if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
    try {
      await navigator.share({
        title: note.title,
        text: shareText,
        url: shareUrl,
      });
      return "shared";
    } catch (err: any) {
      if (err?.name === "AbortError") {
        throw err;
      }
      // Fall through to clipboard copy if share fails
    }
  }

  await navigator.clipboard.writeText(`${shareText}\n${shareUrl}`);
  return "copied";
}

/**
 * Uploads / saves ANY topper note document directly to the user's Google Drive.
 */
export async function saveTopperNoteToGoogleDrive(
  note: TopperNote
): Promise<{ name: string; webViewLink?: string }> {
  let token = await getAccessToken();
  if (!token) {
    const signinRes = await googleSignIn();
    token = signinRes?.accessToken || null;
  }
  if (!token) {
    throw new Error("Please connect your Google account to save notes to Google Drive.");
  }

  const { blob, fileName } = await buildTopperNoteBlob(note);
  const uploaded = await uploadFileToDrive(token, blob, fileName, {
    description: `${note.subject} (${note.branch} · ${note.semester}) — Campus Topper Notes Vault`,
  });

  return {
    name: uploaded.name || fileName,
    webViewLink: uploaded.webViewLink,
  };
}
