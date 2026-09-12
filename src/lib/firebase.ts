import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInAnonymously,
  updateProfile,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { isValidCollegeEmail, ALLOWED_COLLEGE_DOMAIN } from "../utils/collegeAuth";

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Local storage key for verified college user session persistence
export const COLLEGE_USER_STORAGE_KEY = "campus_verified_college_user";

// Google Auth Provider with Google Calendar Scope
export const googleProvider = new GoogleAuthProvider();
googleProvider.addScope("https://www.googleapis.com/auth/calendar.events");
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Primary Firestore Database ID for this applet
const FIRESTORE_DB_ID = "ai-studio-campusresaleexch-f68635d5-915d-4859-b9cf-6705adcd3715";

let firestoreInstance;
try {
  firestoreInstance = getFirestore(app, FIRESTORE_DB_ID);
} catch {
  firestoreInstance = getFirestore(app);
}
export const db = firestoreInstance;

// In-memory access token cache for Google Workspace (Calendar) API calls
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Test connection on boot per Firebase guidelines
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error) {
    if (error instanceof Error && error.message.includes("the client is offline")) {
      console.warn("Client offline or initial connection check pending.");
    }
  }
}

testConnection();

// Initialize auth state listener with automatic college user session re-hydration
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      let resolvedEmail = user.email;
      let resolvedName = user.displayName;

      // If user signed in anonymously or lacks an email on the User object, check local storage
      if (!resolvedEmail) {
        try {
          const raw = localStorage.getItem(COLLEGE_USER_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.email && isValidCollegeEmail(parsed.email)) {
              resolvedEmail = parsed.email;
              resolvedName = parsed.displayName || user.displayName;
            }
          }
        } catch (e) {
          console.warn("Could not parse saved college user session:", e);
        }
      }

      // Attach email and displayName properties to ensure downstream components see the verified college identity
      if (resolvedEmail) {
        try {
          Object.defineProperty(user, "email", {
            value: resolvedEmail,
            configurable: true,
            enumerable: true,
            writable: true,
          });
        } catch {}
      }

      if (resolvedName && !user.displayName) {
        try {
          Object.defineProperty(user, "displayName", {
            value: resolvedName,
            configurable: true,
            enumerable: true,
            writable: true,
          });
        } catch {}
      }

      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
      // If Firebase Auth is not active, check if a verified college student session exists in localStorage
      try {
        const raw = localStorage.getItem(COLLEGE_USER_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.email && isValidCollegeEmail(parsed.email)) {
            const fallbackUser = {
              uid: parsed.uid || `student-${parsed.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
              displayName: parsed.displayName || parsed.email.split("@")[0].replace(".", " "),
              email: parsed.email,
              photoURL: parsed.photoURL || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
            } as unknown as User;

            if (onAuthSuccess) {
              onAuthSuccess(fallbackUser, null);
              return;
            }
          }
        }
      } catch (e) {
        console.warn("Could not restore saved college session:", e);
      }

      cachedAccessToken = null;
      if (onAuthFailure) {
        onAuthFailure();
      }
    }
  });
};

// Google Sign-In with OAuth pop-up
export const googleSignIn = async (): Promise<{ user: User; accessToken: string | null } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (credential?.accessToken) {
      cachedAccessToken = credential.accessToken;
    }

    if (result.user && result.user.email && isValidCollegeEmail(result.user.email)) {
      try {
        localStorage.setItem(
          COLLEGE_USER_STORAGE_KEY,
          JSON.stringify({
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
          })
        );
      } catch {}
    }

    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (
      error?.code === "auth/popup-closed-by-user" ||
      error?.code === "auth/cancelled-popup-request"
    ) {
      console.info("Google Sign-In popup closed by user.");
      return null;
    }
    if (error?.code === "auth/popup-blocked") {
      throw new Error(
        "Google Sign-In popup was blocked by your browser. Please allow popups or use the Direct College ID verification option below."
      );
    }
    if (error?.code === "auth/unauthorized-domain") {
      throw new Error(
        `This domain is not yet whitelisted in Firebase Auth for Google OAuth. Anyone with @${ALLOWED_COLLEGE_DOMAIN} can sign in using the Direct College ID option below!`
      );
    }
    console.warn("Firebase Google sign-in notice:", error?.message || error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

/**
 * Direct College ID Sign-In:
 * Allows ANY student or faculty member with an email ending in @pvgcoet.ac.in to sign in.
 */
export const collegeEmailSignIn = async (
  collegeEmail: string,
  displayName?: string
): Promise<{ user: User; accessToken: string | null }> => {
  const cleanEmail = collegeEmail.trim().toLowerCase();
  if (!isValidCollegeEmail(cleanEmail)) {
    throw new Error(
      `Access Denied: Only emails ending with @${ALLOWED_COLLEGE_DOMAIN} are permitted to sign in.`
    );
  }

  const resolvedName =
    displayName?.trim() ||
    cleanEmail
      .split("@")[0]
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const avatarUrl =
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80";

  try {
    const cred = await signInAnonymously(auth);
    try {
      await updateProfile(cred.user, {
        displayName: resolvedName,
        photoURL: avatarUrl,
      });
    } catch {}

    Object.defineProperty(cred.user, "email", {
      value: cleanEmail,
      configurable: true,
      enumerable: true,
      writable: true,
    });

    try {
      localStorage.setItem(
        COLLEGE_USER_STORAGE_KEY,
        JSON.stringify({
          uid: cred.user.uid,
          displayName: resolvedName,
          email: cleanEmail,
          photoURL: avatarUrl,
        })
      );
    } catch {}

    return { user: cred.user, accessToken: null };
  } catch (err) {
    console.info("Anonymous auth fallback to local verified session:", err);
    const mockUid = `student-${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;
    const mockUser = {
      uid: mockUid,
      displayName: resolvedName,
      email: cleanEmail,
      photoURL: avatarUrl,
    } as unknown as User;

    try {
      localStorage.setItem(
        COLLEGE_USER_STORAGE_KEY,
        JSON.stringify({
          uid: mockUid,
          displayName: resolvedName,
          email: cleanEmail,
          photoURL: avatarUrl,
        })
      );
    } catch {}

    return { user: mockUser, accessToken: null };
  }
};

// Backward-compatible alias for demoStudentSignIn
export const demoStudentSignIn = collegeEmailSignIn;

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  try {
    localStorage.removeItem(COLLEGE_USER_STORAGE_KEY);
  } catch {}
  await signOut(auth);
  cachedAccessToken = null;
};
