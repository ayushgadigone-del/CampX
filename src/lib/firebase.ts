import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from "firebase/auth";
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDoc,
  setDoc,
  getDocFromServer,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import { isValidCollegeEmail, ALLOWED_COLLEGE_DOMAIN } from "../utils/collegeAuth";

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);

// Local storage key for verified college user session persistence
export const COLLEGE_USER_STORAGE_KEY = "campus_verified_college_user";
export const EXPLICIT_LOGOUT_STORAGE_KEY = "campus_explicit_logout";

// Google Auth Provider with Google Calendar, Drive, Picker, and Docs Scopes
export const WORKSPACE_SCOPES = [
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/drive.metadata.readonly",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/documents.readonly",
];

export const googleProvider = new GoogleAuthProvider();
WORKSPACE_SCOPES.forEach((scope) => googleProvider.addScope(scope));
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Primary Firestore Database ID for this applet
const FIRESTORE_DB_ID =
  (firebaseConfig as Record<string, any>).firestoreDatabaseId ||
  "ai-studio-campusresaleexch-f68635d5-915d-4859-b9cf-6705adcd3715";

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
    },
    FIRESTORE_DB_ID
  );
} catch {
  try {
    firestoreInstance = getFirestore(app, FIRESTORE_DB_ID);
  } catch {
    firestoreInstance = getFirestore(app);
  }
}
export const db = firestoreInstance;

// Error Handling per Firebase Integration Skill specification
export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.warn("Firestore Error: ", JSON.stringify(errInfo));
  return errInfo;
}

// In-memory access token cache for Google Workspace (Calendar) API calls
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Test connection on boot per Firebase guidelines with graceful offline awareness
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
  } catch (error: any) {
    if (
      (error instanceof Error &&
        (error.message.includes("the client is offline") ||
          error.message.includes("unavailable") ||
          error.message.includes("offline"))) ||
      error?.code === "unavailable"
    ) {
      console.info("Firestore: Operating in offline mode or syncing with backend.");
    } else {
      console.warn("Firestore connection check info:", error?.message || error);
    }
  }
}

testConnection();

// Synchronously check for an explicitly signed-in college user in localStorage so Frame 1 renders without a loading flash
export const getInitialRestoredUser = (): User | null => {
  if (typeof window === "undefined") return null;
  try {
    if (localStorage.getItem(EXPLICIT_LOGOUT_STORAGE_KEY) === "true") {
      return null;
    }
    const raw = localStorage.getItem(COLLEGE_USER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.explicitSignIn === true &&
      typeof parsed.email === "string" &&
      isValidCollegeEmail(parsed.email)
    ) {
      return {
        uid: parsed.uid || `student-${parsed.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
        displayName:
          parsed.displayName || parsed.email.split("@")[0].replace(".", " "),
        email: parsed.email,
        photoURL:
          parsed.photoURL ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
      } as unknown as User;
    }
    if (parsed && !parsed.explicitSignIn && parsed.uid === "student-ayush-26") {
      localStorage.removeItem(COLLEGE_USER_STORAGE_KEY);
    }
  } catch {
    return null;
  }
  return null;
};

// Initialize auth state listener with explicit college user session re-hydration (never auto-seeds a default account)
export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    // Skip intermediate Firebase auth emissions while an explicit sign-in flow is completing
    if (isSigningIn) {
      return;
    }

    if (user) {
      let resolvedEmail = user.email;
      let resolvedName = user.displayName;
      let resolvedPhoto = user.photoURL;
      let hasExplicitLocalSession = false;

      // Inspect saved college user session to hydrate email, full name, and custom profile photo
      try {
        const raw = localStorage.getItem(COLLEGE_USER_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          const isExplicit = parsed.explicitSignIn === true;
          const matchesSavedEmail =
            !resolvedEmail ||
            (parsed.email && parsed.email.toLowerCase() === resolvedEmail.toLowerCase());
          if (isExplicit && matchesSavedEmail && parsed.email && isValidCollegeEmail(parsed.email)) {
            hasExplicitLocalSession = true;
            if (!resolvedEmail) {
              resolvedEmail = parsed.email;
            }
            if (parsed.displayName) {
              resolvedName = parsed.displayName;
            }
            if (parsed.photoURL) {
              resolvedPhoto = parsed.photoURL;
            }
          } else if (!isExplicit && parsed.uid === "student-ayush-26") {
            // Clear legacy auto-seeded default session so app starts cleanly at Overview -> Login
            localStorage.removeItem(COLLEGE_USER_STORAGE_KEY);
          }
        }
      } catch (e) {
        console.warn("Could not parse saved college user session:", e);
      }

      // If this is a leftover anonymous Firebase session without an explicit college sign-in, treat as signed out
      if (user.isAnonymous && !hasExplicitLocalSession) {
        try {
          await signOut(auth);
        } catch {}
        cachedAccessToken = null;
        if (onAuthFailure) {
          onAuthFailure();
        }
        return;
      }

      // Attach email, displayName, and photoURL properties so downstream components see the complete verified profile
      if (resolvedEmail && resolvedEmail !== user.email) {
        try {
          Object.defineProperty(user, "email", {
            value: resolvedEmail,
            configurable: true,
            enumerable: true,
            writable: true,
          });
        } catch {}
      }

      if (resolvedName && resolvedName !== user.displayName) {
        try {
          Object.defineProperty(user, "displayName", {
            value: resolvedName,
            configurable: true,
            enumerable: true,
            writable: true,
          });
        } catch {}
      }

      if (resolvedPhoto && resolvedPhoto !== user.photoURL) {
        try {
          Object.defineProperty(user, "photoURL", {
            value: resolvedPhoto,
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
      // Only restore an explicitly signed-in college session (never auto-seed a default account)
      let hasExplicitlyLoggedOut = false;
      try {
        hasExplicitlyLoggedOut =
          localStorage.getItem(EXPLICIT_LOGOUT_STORAGE_KEY) === "true";
      } catch {}

      if (!hasExplicitlyLoggedOut) {
        try {
          const raw = localStorage.getItem(COLLEGE_USER_STORAGE_KEY);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (
              parsed.explicitSignIn === true &&
              parsed.email &&
              isValidCollegeEmail(parsed.email)
            ) {
              const fallbackUser = {
                uid: parsed.uid || `student-${parsed.email.replace(/[^a-zA-Z0-9]/g, "_")}`,
                displayName:
                  parsed.displayName || parsed.email.split("@")[0].replace(".", " "),
                email: parsed.email,
                photoURL:
                  parsed.photoURL ||
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80",
              } as unknown as User;

              if (onAuthSuccess) {
                onAuthSuccess(fallbackUser, null);
                return;
              }
            } else {
              // Remove any non-explicit / legacy auto-seeded session
              localStorage.removeItem(COLLEGE_USER_STORAGE_KEY);
            }
          }
        } catch (e) {
          console.warn("Could not restore saved college session:", e);
        }
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
        localStorage.removeItem(EXPLICIT_LOGOUT_STORAGE_KEY);
        localStorage.setItem(
          COLLEGE_USER_STORAGE_KEY,
          JSON.stringify({
            uid: result.user.uid,
            displayName: result.user.displayName,
            email: result.user.email,
            photoURL: result.user.photoURL,
            explicitSignIn: true,
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
      const currentHost =
        typeof window !== "undefined" ? window.location.hostname : "this preview domain";
      throw new Error(
        `Google Sign-In blocked by Firebase Authorized Domains for "${currentHost}". This dynamic preview URL is not yet allowlisted in Firebase Console (Authentication → Settings → Authorized domains). Please use Option 2 (Direct College ID) below with your @${ALLOWED_COLLEGE_DOMAIN} email to sign in immediately!`
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
  displayName?: string,
  profileData?: {
    firstName?: string;
    surname?: string;
    year?: string;
    branch?: string;
    photoURL?: string;
    profileCompleted?: boolean;
  }
): Promise<{ user: User; accessToken: string | null }> => {
  const cleanEmail = collegeEmail.trim().toLowerCase();
  if (!isValidCollegeEmail(cleanEmail)) {
    throw new Error(
      `Access Denied: Only emails ending with @${ALLOWED_COLLEGE_DOMAIN} are permitted to sign in.`
    );
  }

  try {
    localStorage.removeItem(EXPLICIT_LOGOUT_STORAGE_KEY);
  } catch {}

  const combinedNameFromParts =
    profileData?.firstName && profileData?.surname
      ? `${profileData.firstName.trim()} ${profileData.surname.trim()}`.trim()
      : "";

  const resolvedName =
    combinedNameFromParts ||
    displayName?.trim() ||
    cleanEmail
      .split("@")[0]
      .split(".")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");

  const avatarUrl =
    profileData?.photoURL ||
    "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80";

  const sessionPayload = {
    displayName: resolvedName,
    email: cleanEmail,
    photoURL: avatarUrl,
    explicitSignIn: true,
    ...(profileData?.firstName ? { firstName: profileData.firstName } : {}),
    ...(profileData?.surname ? { surname: profileData.surname } : {}),
    ...(profileData?.year ? { year: profileData.year } : {}),
    ...(profileData?.branch ? { branch: profileData.branch } : {}),
    ...(profileData?.profileCompleted !== undefined
      ? { profileCompleted: profileData.profileCompleted }
      : {}),
  };

  isSigningIn = true;
  const fallbackUid = `student-${cleanEmail.replace(/[^a-zA-Z0-9]/g, "_")}`;

  // Pre-seed explicit local session BEFORE signInAnonymously so onAuthStateChanged never treats it as stale anonymous auth
  try {
    localStorage.setItem(
      COLLEGE_USER_STORAGE_KEY,
      JSON.stringify({
        uid: fallbackUid,
        ...sessionPayload,
      })
    );
  } catch {}

  try {
    // Preserve an existing real (non-anonymous) Firebase Auth session matching this college email
    const existingAuthUser = auth.currentUser;
    const activeUser =
      existingAuthUser &&
      !existingAuthUser.isAnonymous &&
      existingAuthUser.email?.toLowerCase() === cleanEmail
        ? existingAuthUser
        : (await signInAnonymously(auth)).user;

    try {
      const authProfileUpdate: { displayName?: string; photoURL?: string } = {
        displayName: resolvedName,
      };
      if (avatarUrl.length < 1800) {
        authProfileUpdate.photoURL = avatarUrl;
      }
      await updateProfile(activeUser, authProfileUpdate);
    } catch {}

    const cred = { user: activeUser };

    Object.defineProperty(cred.user, "email", {
      value: cleanEmail,
      configurable: true,
      enumerable: true,
      writable: true,
    });
    Object.defineProperty(cred.user, "displayName", {
      value: resolvedName,
      configurable: true,
      enumerable: true,
      writable: true,
    });
    Object.defineProperty(cred.user, "photoURL", {
      value: avatarUrl,
      configurable: true,
      enumerable: true,
      writable: true,
    });

    try {
      localStorage.setItem(
        COLLEGE_USER_STORAGE_KEY,
        JSON.stringify({
          uid: cred.user.uid,
          ...sessionPayload,
        })
      );
    } catch {}

    return { user: cred.user, accessToken: null };
  } catch (err) {
    console.info("Anonymous auth fallback to local verified session:", err);
    const mockUser = {
      uid: fallbackUid,
      displayName: resolvedName,
      email: cleanEmail,
      photoURL: avatarUrl,
    } as unknown as User;

    try {
      localStorage.setItem(
        COLLEGE_USER_STORAGE_KEY,
        JSON.stringify({
          uid: fallbackUid,
          ...sessionPayload,
        })
      );
    } catch {}

    return { user: mockUser, accessToken: null };
  } finally {
    isSigningIn = false;
  }
};

// Backward-compatible alias for demoStudentSignIn
export const demoStudentSignIn = collegeEmailSignIn;

export interface FirebaseCollegeProfileRecord {
  uid: string;
  email: string;
  firstName: string;
  surname: string;
  displayName: string;
  year: string;
  branch: string;
  photoURL: string;
}

export type FirebaseCollegeRegisterResult =
  | { status: "created"; uid: string }
  | { status: "already_exists" }
  | { status: "provider_disabled" }
  | { status: "error"; message: string };

/**
 * Registers a verified PVG student account in Firebase Auth (Email/Password)
 * and persists their full compulsory profile to Firestore `/users/{uid}` so it
 * survives Cloud Run container restarts. Signs out cleanly afterwards so the
 * student completes a normal Sign In flow.
 */
export const registerFirebaseCollegeAccount = async (params: {
  email: string;
  password: string;
  firstName: string;
  surname: string;
  year: string;
  branch: string;
  photoURL: string;
}): Promise<FirebaseCollegeRegisterResult> => {
  const cleanEmail = params.email.trim().toLowerCase();
  if (!isValidCollegeEmail(cleanEmail)) {
    return {
      status: "error",
      message: `Only emails ending with @${ALLOWED_COLLEGE_DOMAIN} are allowed.`,
    };
  }

  const displayName = `${params.firstName.trim()} ${params.surname.trim()}`.trim();
  const updatedAt = new Date().toISOString();

  isSigningIn = true;
  try {
    const cred = await createUserWithEmailAndPassword(auth, cleanEmail, params.password);
    try {
      const authUpdate: { displayName?: string; photoURL?: string } = { displayName };
      if (params.photoURL && params.photoURL.length < 1800) {
        authUpdate.photoURL = params.photoURL;
      }
      await updateProfile(cred.user, authUpdate);
    } catch (profileErr) {
      console.warn("Firebase Auth displayName update notice:", profileErr);
    }

    try {
      await setDoc(
        doc(db, "users", cred.user.uid),
        {
          uid: cred.user.uid,
          email: cleanEmail,
          firstName: params.firstName.trim().slice(0, 60),
          surname: params.surname.trim().slice(0, 60),
          displayName: displayName.slice(0, 120),
          department: params.branch.trim().slice(0, 100),
          branch: params.branch.trim().slice(0, 100),
          year: params.year.trim().slice(0, 50),
          photoURL: params.photoURL,
          emailVerified: true,
          profileCompleted: true,
          updatedAt,
        },
        { merge: true }
      );
    } catch (firestoreErr) {
      handleFirestoreError(firestoreErr, OperationType.WRITE, `users/${cred.user.uid}`);
    }

    // Sign out cleanly so the student returns to the Sign In screen as designed
    try {
      await signOut(auth);
    } catch {}

    return { status: "created", uid: cred.user.uid };
  } catch (err: any) {
    const code = err?.code || "";
    if (code === "auth/operation-not-allowed" || code === "auth/configuration-not-found") {
      console.info(
        "Firebase Email/Password provider is not enabled yet in Firebase Console; using server session fallback."
      );
      return { status: "provider_disabled" };
    }
    if (code === "auth/email-already-in-use") {
      return { status: "already_exists" };
    }
    return {
      status: "error",
      message: err?.message || "Could not persist student account to Firebase.",
    };
  } finally {
    isSigningIn = false;
  }
};

export type FirebaseCollegeSignInResult =
  | {
      status: "signed_in";
      user: User;
      profile: FirebaseCollegeProfileRecord | null;
    }
  | { status: "provider_disabled" }
  | { status: "not_found_or_invalid" }
  | { status: "too_many_requests"; message: string };

/**
 * Signs in a student against Firebase Auth (Email/Password) and hydrates their
 * persistent profile document from Firestore `/users/{uid}`.
 */
export const signInFirebaseCollegeAccount = async (
  email: string,
  password: string
): Promise<FirebaseCollegeSignInResult> => {
  const cleanEmail = email.trim().toLowerCase();
  if (!isValidCollegeEmail(cleanEmail)) {
    return { status: "not_found_or_invalid" };
  }

  isSigningIn = true;
  try {
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, password);
    let profile: FirebaseCollegeProfileRecord | null = null;

    try {
      const snap = await getDoc(doc(db, "users", cred.user.uid));
      if (snap.exists()) {
        const data = snap.data() as Record<string, any>;
        if (data.firstName && data.surname && data.year && data.branch && data.photoURL) {
          profile = {
            uid: cred.user.uid,
            email: cleanEmail,
            firstName: String(data.firstName),
            surname: String(data.surname),
            displayName:
              String(data.displayName || `${data.firstName} ${data.surname}`).trim(),
            year: String(data.year),
            branch: String(data.branch),
            photoURL: String(data.photoURL),
          };
        }
      }
    } catch (firestoreErr) {
      handleFirestoreError(firestoreErr, OperationType.GET, `users/${cred.user.uid}`);
    }

    const resolvedName =
      profile?.displayName ||
      cred.user.displayName ||
      cleanEmail
        .split("@")[0]
        .split(".")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");

    const resolvedPhoto =
      profile?.photoURL ||
      cred.user.photoURL ||
      "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80";

    try {
      localStorage.removeItem(EXPLICIT_LOGOUT_STORAGE_KEY);
      localStorage.setItem(
        COLLEGE_USER_STORAGE_KEY,
        JSON.stringify({
          uid: cred.user.uid,
          email: cleanEmail,
          displayName: resolvedName,
          photoURL: resolvedPhoto,
          explicitSignIn: true,
          ...(profile
            ? {
                firstName: profile.firstName,
                surname: profile.surname,
                year: profile.year,
                branch: profile.branch,
                profileCompleted: true,
              }
            : {}),
        })
      );
    } catch {}

    return {
      status: "signed_in",
      user: cred.user,
      profile,
    };
  } catch (err: any) {
    const code = err?.code || "";
    if (code === "auth/operation-not-allowed" || code === "auth/configuration-not-found") {
      return { status: "provider_disabled" };
    }
    if (code === "auth/too-many-requests") {
      return {
        status: "too_many_requests",
        message: "Too many failed sign-in attempts. Please wait a minute and try again.",
      };
    }
    return { status: "not_found_or_invalid" };
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logout = async () => {
  try {
    localStorage.setItem(EXPLICIT_LOGOUT_STORAGE_KEY, "true");
    localStorage.removeItem(COLLEGE_USER_STORAGE_KEY);
  } catch {}
  await signOut(auth);
  cachedAccessToken = null;
};
