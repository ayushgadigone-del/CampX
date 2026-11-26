import { doc, getDoc, setDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import {
  auth,
  db,
  COLLEGE_USER_STORAGE_KEY,
  handleFirestoreError,
  OperationType,
} from "../lib/firebase";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  sanitizeText,
  validateFileUpload,
} from "./security";

export const STUDY_YEARS = [
  "1st Year (FE)",
  "2nd Year (SE)",
  "3rd Year (TE)",
  "4th Year (BE)",
  "M.E. / Postgraduate",
] as const;

export const COLLEGE_BRANCHES = [
  "Computer Engineering",
  "Information Technology",
  "AI & Data Science",
  "Electronics & Telecommunication (E&TC)",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Printing & Packaging Technology",
] as const;

export interface StudentProfileDetails {
  uid: string;
  email: string;
  firstName: string;
  surname: string;
  displayName: string;
  year: string;
  branch: string;
  photoURL: string;
  rollNumber?: string;
  admissionYear?: string;
  lastYearCgpa?: string;
  bio?: string;
  interests?: string;
  profileCompleted: boolean;
  updatedAt?: string;
}

const PROFILES_STORE_KEY = "campus_student_profiles_v1";

/**
 * Checks if all compulsory student profile fields are present and valid.
 */
export function isStudentProfileComplete(
  profile?: Partial<StudentProfileDetails> | null
): boolean {
  if (!profile) return false;
  return Boolean(
    profile.firstName?.trim() &&
      profile.surname?.trim() &&
      profile.year?.trim() &&
      profile.branch?.trim() &&
      profile.photoURL?.trim()
  );
}

/**
 * Validates and crops/resizes a profile image to 320x320px JPEG,
 * automatically stripping EXIF GPS/device metadata.
 */
export function processProfileAvatarFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const validation = validateFileUpload(
      file,
      ALLOWED_IMAGE_MIME_TYPES,
      MAX_IMAGE_SIZE_BYTES
    );
    if (!validation.valid) {
      reject(new Error(validation.error || "Invalid image file."));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const size = 320;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        // Center-crop square from source image
        const minSide = Math.min(img.width, img.height);
        const sx = (img.width - minSide) / 2;
        const sy = (img.height - minSide) / 2;

        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, size, size);
        const compactDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        resolve(compactDataUrl);
      };
      img.onerror = () => reject(new Error("Could not decode the selected image."));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error("Could not read the selected image file."));
    reader.readAsDataURL(file);
  });
}

function readAllLocalProfiles(): Record<string, StudentProfileDetails> {
  try {
    const raw = localStorage.getItem(PROFILES_STORE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StudentProfileDetails>;
  } catch {
    return {};
  }
}

export function loadLocalStudentProfile(
  uid?: string | null,
  email?: string | null
): StudentProfileDetails | null {
  const store = readAllLocalProfiles();
  const normalizedEmail = email?.trim().toLowerCase();

  if (normalizedEmail && store[`email:${normalizedEmail}`]) {
    return store[`email:${normalizedEmail}`];
  }
  if (uid && store[`uid:${uid}`]) {
    return store[`uid:${uid}`];
  }

  // Also inspect active session storage key
  try {
    const rawSession = localStorage.getItem(COLLEGE_USER_STORAGE_KEY);
    if (rawSession) {
      const parsed = JSON.parse(rawSession);
      if (
        (!normalizedEmail || parsed.email?.toLowerCase() === normalizedEmail) &&
        parsed.firstName &&
        parsed.surname &&
        parsed.year &&
        parsed.branch &&
        parsed.photoURL
      ) {
        return {
          uid: parsed.uid || uid || "",
          email: parsed.email || normalizedEmail || "",
          firstName: parsed.firstName,
          surname: parsed.surname,
          displayName: parsed.displayName || `${parsed.firstName} ${parsed.surname}`.trim(),
          year: parsed.year,
          branch: parsed.branch,
          photoURL: parsed.photoURL,
          rollNumber: parsed.rollNumber || "",
          admissionYear: parsed.admissionYear || "",
          lastYearCgpa: parsed.lastYearCgpa || "",
          bio: parsed.bio || "",
          interests: parsed.interests || "",
          profileCompleted: true,
          updatedAt: parsed.updatedAt,
        };
      }
    }
  } catch {
    // Ignore parse error
  }

  return null;
}

export function saveLocalStudentProfile(profile: StudentProfileDetails): void {
  try {
    const store = readAllLocalProfiles();
    const normalizedEmail = profile.email.trim().toLowerCase();
    if (normalizedEmail) {
      store[`email:${normalizedEmail}`] = profile;
    }
    if (profile.uid) {
      store[`uid:${profile.uid}`] = profile;
    }
    localStorage.setItem(PROFILES_STORE_KEY, JSON.stringify(store));
  } catch (err) {
    console.warn("Could not persist student profile in local store:", err);
  }

  // Update active college session storage key so auth re-hydration reflects updated details
  try {
    const raw = localStorage.getItem(COLLEGE_USER_STORAGE_KEY);
    const existing = raw ? JSON.parse(raw) : {};
    localStorage.setItem(
      COLLEGE_USER_STORAGE_KEY,
      JSON.stringify({
        ...existing,
        uid: profile.uid || existing.uid,
        email: profile.email || existing.email,
        firstName: profile.firstName,
        surname: profile.surname,
        displayName: profile.displayName,
        year: profile.year,
        branch: profile.branch,
        photoURL: profile.photoURL,
        rollNumber: profile.rollNumber || "",
        admissionYear: profile.admissionYear || "",
        lastYearCgpa: profile.lastYearCgpa || "",
        bio: profile.bio || "",
        interests: profile.interests || "",
        profileCompleted: profile.profileCompleted,
        updatedAt: profile.updatedAt || new Date().toISOString(),
      })
    );
  } catch (err) {
    console.warn("Could not update session storage with student profile:", err);
  }
}

export async function fetchFirestoreStudentProfile(
  uid: string
): Promise<StudentProfileDetails | null> {
  if (!uid || !auth.currentUser) return null;
  try {
    const snap = await Promise.race([
      getDoc(doc(db, "users", uid)),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 2000)),
    ]);
    if (snap && snap.exists()) {
      const data = snap.data() as Record<string, any>;
      if (data.firstName && data.surname && data.year && data.branch && data.photoURL) {
        const loaded: StudentProfileDetails = {
          uid,
          email: data.email || "",
          firstName: data.firstName,
          surname: data.surname,
          displayName: data.displayName || `${data.firstName} ${data.surname}`.trim(),
          year: data.year,
          branch: data.branch,
          photoURL: data.photoURL,
          rollNumber: data.rollNumber || "",
          admissionYear: data.admissionYear || "",
          lastYearCgpa: data.lastYearCgpa || "",
          bio: data.bio || "",
          interests: data.interests || "",
          profileCompleted: Boolean(data.profileCompleted),
          updatedAt: data.updatedAt,
        };
        saveLocalStudentProfile(loaded);
        return loaded;
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `users/${uid}`);
  }
  return null;
}

/**
 * Sanitizes, saves locally immediately, and syncs Firebase Auth & Firestore in the background
 * so sign-in and profile edits transition smoothly without stalling on network round-trips.
 */
export async function persistStudentProfile(
  input: Omit<StudentProfileDetails, "displayName" | "profileCompleted" | "updatedAt">
): Promise<StudentProfileDetails> {
  const cleanFirstName = sanitizeText(input.firstName).slice(0, 60);
  const cleanSurname = sanitizeText(input.surname).slice(0, 60);
  const cleanYear = sanitizeText(input.year).slice(0, 50);
  const cleanBranch = sanitizeText(input.branch).slice(0, 100);
  const cleanRollNumber = sanitizeText(input.rollNumber || "").slice(0, 40);
  const cleanAdmissionYear = sanitizeText(input.admissionYear || "").slice(0, 10);
  const cleanCgpa = sanitizeText(input.lastYearCgpa || "").slice(0, 10);
  const cleanBio = sanitizeText(input.bio || "").slice(0, 300);
  const cleanInterests = sanitizeText(input.interests || "").slice(0, 200);
  const cleanEmail = input.email.trim().toLowerCase();
  const displayName = `${cleanFirstName} ${cleanSurname}`.trim();
  const updatedAt = new Date().toISOString();

  const savedProfile: StudentProfileDetails = {
    uid: input.uid,
    email: cleanEmail,
    firstName: cleanFirstName,
    surname: cleanSurname,
    displayName,
    year: cleanYear,
    branch: cleanBranch,
    photoURL: input.photoURL,
    rollNumber: cleanRollNumber,
    admissionYear: cleanAdmissionYear,
    lastYearCgpa: cleanCgpa,
    bio: cleanBio,
    interests: cleanInterests,
    profileCompleted: true,
    updatedAt,
  };

  // 1. Save to localStorage immediately so UI updates in <1ms
  saveLocalStudentProfile(savedProfile);

  // 2. Sync Firebase Auth profile & Firestore users/{uid} asynchronously in background
  const currentAuthUser = auth.currentUser;
  if (currentAuthUser) {
    if (currentAuthUser.displayName !== displayName) {
      const authUpdate: { displayName?: string; photoURL?: string } = {
        displayName,
      };
      if (savedProfile.photoURL && savedProfile.photoURL.length < 1800) {
        authUpdate.photoURL = savedProfile.photoURL;
      }
      updateProfile(currentAuthUser, authUpdate).catch((err) => {
        console.warn("Firebase Auth profile sync notice:", err);
      });
    }

    setDoc(
      doc(db, "users", currentAuthUser.uid),
      {
        uid: currentAuthUser.uid,
        email: cleanEmail,
        firstName: cleanFirstName,
        surname: cleanSurname,
        displayName,
        department: cleanBranch,
        branch: cleanBranch,
        year: cleanYear,
        rollNumber: cleanRollNumber,
        admissionYear: cleanAdmissionYear,
        lastYearCgpa: cleanCgpa,
        bio: cleanBio,
        interests: cleanInterests,
        photoURL: savedProfile.photoURL,
        emailVerified: Boolean(currentAuthUser.emailVerified),
        profileCompleted: true,
        updatedAt,
      },
      { merge: true }
    ).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `users/${currentAuthUser.uid}`);
    });
  }

  return savedProfile;
}
