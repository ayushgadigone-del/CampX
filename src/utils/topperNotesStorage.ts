import { TopperNote } from "../types";
import { initialTopperNotes, APP_OWNER_EMAIL } from "../data/topperNotesData";

const STORAGE_KEY = "campus_topper_notes_vault_v1";

/**
 * Returns whether a given user email is the authorized App Owner.
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
        return parsed;
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
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
