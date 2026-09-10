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

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

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

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (onAuthSuccess) {
        onAuthSuccess(user, cachedAccessToken);
      }
    } else {
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
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    if (
      error?.code === "auth/popup-closed-by-user" ||
      error?.code === "auth/cancelled-popup-request"
    ) {
      // Benign: User intentionally closed the popup or clicked outside
      console.info("Google Sign-In popup closed by user.");
      return null;
    }
    if (error?.code === "auth/popup-blocked") {
      console.warn("Google Sign-In popup was blocked by browser. Please allow popups or use Demo Student login.");
      return null;
    }
    console.warn("Firebase Google sign-in notice:", error?.message || error);
    return null;
  } finally {
    isSigningIn = false;
  }
};

// 1-Click Demo Student Sign-In for environments where popups are blocked/cancelled
export const demoStudentSignIn = async (): Promise<{ user: User; accessToken: string | null }> => {
  try {
    const cred = await signInAnonymously(auth);
    try {
      await updateProfile(cred.user, {
        displayName: "Ayush G. (Student Verified)",
        photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      });
    } catch {}
    return { user: cred.user, accessToken: null };
  } catch (err) {
    console.info("Anonymous auth fallback to verified mock user:", err);
    const mockUser = {
      uid: "student-demo-verified-01",
      displayName: "Ayush G. (Student Verified)",
      email: "ayushgadigone@gmail.com",
      photoURL: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
    } as unknown as User;
    return { user: mockUser, accessToken: null };
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
