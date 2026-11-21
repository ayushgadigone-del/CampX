import React, { useState, useRef } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Mail,
  Camera,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  ALLOWED_COLLEGE_DOMAIN,
  COLLEGE_RESTRICTION_MESSAGE,
  isValidCollegeEmail,
} from "../utils/collegeAuth";
import {
  STUDY_YEARS,
  COLLEGE_BRANCHES,
  processProfileAvatarFile,
} from "../utils/studentProfile";

export interface LoginProfilePayload {
  firstName: string;
  surname: string;
  year: string;
  branch: string;
  photoURL: string;
}

interface CollegeLoginPageProps {
  onGoogleSignIn: () => Promise<void>;
  onDemoCollegeSignIn: (
    customEmail?: string,
    displayName?: string,
    profileData?: LoginProfilePayload
  ) => Promise<void>;
  authErrorMessage?: string | null;
  onClearError?: () => void;
  onBackToLanding?: () => void;
}

export const CollegeLoginPage: React.FC<CollegeLoginPageProps> = ({
  onGoogleSignIn,
  onDemoCollegeSignIn,
  authErrorMessage,
  onClearError,
  onBackToLanding,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputEmail, setInputEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValidationError(null);
    setIsProcessingPhoto(true);
    try {
      const processedUrl = await processProfileAvatarFile(file);
      setPhotoURL(processedUrl);
    } catch (err: any) {
      setValidationError(err?.message || "Could not process the selected profile picture.");
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleCustomCollegeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onClearError) onClearError();
    setValidationError(null);

    const emailToVerify = inputEmail.trim();
    const cleanFirst = firstName.trim();
    const cleanSurname = surname.trim();

    if (!emailToVerify) {
      setValidationError("Please enter your college email address.");
      return;
    }

    if (!isValidCollegeEmail(emailToVerify)) {
      setValidationError(
        `Only emails ending with @${ALLOWED_COLLEGE_DOMAIN} are authorized to access the campus marketplace.`
      );
      return;
    }

    if (!photoURL) {
      setValidationError("Profile picture is compulsory. Please upload your photo before signing in.");
      return;
    }

    if (!cleanFirst) {
      setValidationError("Name is compulsory. Please enter your first name.");
      return;
    }

    if (!cleanSurname) {
      setValidationError("Surname is compulsory. Please enter your surname.");
      return;
    }

    if (!year) {
      setValidationError("Year of study is compulsory. Please select your current year.");
      return;
    }

    if (!branch) {
      setValidationError("Branch is compulsory. Please select your engineering branch.");
      return;
    }

    setIsLoading(true);
    try {
      const displayName = `${cleanFirst} ${cleanSurname}`.trim();
      await onDemoCollegeSignIn(emailToVerify, displayName, {
        firstName: cleanFirst,
        surname: cleanSurname,
        year,
        branch,
        photoURL,
      });
    } catch (err: any) {
      setValidationError(err?.message || "Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    if (onClearError) onClearError();
    setValidationError(null);
    setIsLoading(true);
    try {
      await onGoogleSignIn();
    } finally {
      setIsLoading(false);
    }
  };

  const activeError = validationError || authErrorMessage;

  return (
    <div
      id="college-login-container"
      className="min-h-screen bg-[#F7F9F8] dark:bg-[#0D1110] text-[#18201C] dark:text-[#ECF2EF] flex flex-col justify-center items-center px-4 py-10 font-sans"
    >
      <div className="w-full max-w-lg mx-auto space-y-6">
        {onBackToLanding && (
          <div>
            <button
              id="back-to-overview-btn"
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C6B63] hover:text-[#18201C] dark:text-[#8FA199] dark:hover:text-[#ECF2EF] cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          </div>
        )}

        {/* Header */}
        <div className="space-y-1.5">
          <p className="text-xs font-medium text-[#5C6B63] dark:text-[#8FA199]">
            PVG&apos;s COET · @{ALLOWED_COLLEGE_DOMAIN} only
          </p>
          <h1 className="text-2xl font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF]">
            Sign in to Campus Resale
          </h1>
          <p className="text-xs sm:text-sm text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
            {COLLEGE_RESTRICTION_MESSAGE}
          </p>
        </div>

        {/* Error Feedback */}
        {activeError && (
          <div
            id="login-error-alert"
            className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">Authentication notice</p>
              <p className="mt-0.5 leading-relaxed">{activeError}</p>
            </div>
          </div>
        )}

        {/* Main Card */}
        <div
          id="college-login-card"
          className="w-full bg-white dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] rounded-2xl p-6 sm:p-7 space-y-6"
        >
          {/* Option 1: Google OAuth */}
          <div className="space-y-2.5">
            <button
              id="login-with-google-btn"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleClick}
              className="w-full h-11 flex items-center justify-center gap-2.5 px-4 rounded-lg border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#1B2320] hover:bg-[#EFF4F1] dark:hover:bg-[#242E2A] text-[#18201C] dark:text-[#ECF2EF] font-semibold text-xs sm:text-sm cursor-pointer disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with @{ALLOWED_COLLEGE_DOMAIN}</span>
            </button>
            <p className="text-[11px] text-[#5C6B63] text-center">
              First-time Google sign-ins will complete their student profile next.
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#DFE6E2] dark:border-[#242E2A] w-full" />
            <span className="bg-white dark:bg-[#141A18] px-3 text-[11px] text-[#8FA199] shrink-0">
              or enter your college email &amp; details
            </span>
            <div className="border-t border-[#DFE6E2] dark:border-[#242E2A] w-full" />
          </div>

          {/* Option 2: Direct College Email + Compulsory Profile Details */}
          <form onSubmit={handleCustomCollegeLogin} className="space-y-4">
            <div>
              <label
                htmlFor="college-email-input"
                className="block text-xs font-medium text-[#5C6B63] dark:text-[#C5D3CC] mb-1.5"
              >
                College Email <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  id="college-email-input"
                  type="email"
                  value={inputEmail}
                  onChange={(e) => {
                    setInputEmail(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder={`name@${ALLOWED_COLLEGE_DOMAIN}`}
                  className="w-full h-11 pl-9 pr-3.5 rounded-lg bg-[#F7F9F8] dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] text-[#18201C] dark:text-[#ECF2EF] placeholder:text-[#8FA199] text-xs sm:text-sm focus:outline-none focus:border-[#242E2A] dark:focus:border-[#5BA18C] font-mono"
                  required
                />
                <Mail className="w-4 h-4 text-[#8FA199] absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Compulsory Profile Picture */}
            <div className="p-3.5 rounded-xl bg-[#F7F9F8] dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile picture"
                className="w-13 h-13 rounded-full border border-dashed border-[#C4D1CA] dark:border-[#242E2A] bg-white dark:bg-[#141A18] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer text-[#8FA199]"
              >
                {isProcessingPhoto ? (
                  <Loader2 className="w-5 h-5 text-[#5C6B63]" />
                ) : photoURL ? (
                  <img
                    src={photoURL}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-[#18201C] dark:text-[#ECF2EF]">
                  Profile Picture <span className="text-rose-500">*</span>
                </div>
                <p className="text-[11px] text-[#5C6B63] mt-0.5">
                  Required · EXIF location data automatically removed
                </p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    id="login-profile-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoUpload}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingPhoto}
                    className="px-3 py-1.5 rounded-lg border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] hover:bg-[#F7F9F8] dark:hover:bg-[#1B2320] text-xs font-medium text-[#18201C] dark:text-[#ECF2EF] cursor-pointer disabled:opacity-60"
                  >
                    {photoURL ? "Change Photo" : "Upload Photo"}
                  </button>
                  {photoURL && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#2F5D50] dark:text-[#7BBFA8]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Name & Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="college-first-name-input"
                  className="block text-xs font-medium text-[#5C6B63] dark:text-[#C5D3CC] mb-1.5"
                >
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  id="college-first-name-input"
                  type="text"
                  required
                  maxLength={60}
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. Ayush"
                  className="w-full h-11 px-3.5 rounded-lg bg-[#F7F9F8] dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] text-[#18201C] dark:text-[#ECF2EF] placeholder:text-[#8FA199] text-xs sm:text-sm focus:outline-none focus:border-[#242E2A] dark:focus:border-[#5BA18C]"
                />
              </div>

              <div>
                <label
                  htmlFor="college-surname-input"
                  className="block text-xs font-medium text-[#5C6B63] dark:text-[#C5D3CC] mb-1.5"
                >
                  Surname <span className="text-rose-500">*</span>
                </label>
                <input
                  id="college-surname-input"
                  type="text"
                  required
                  maxLength={60}
                  value={surname}
                  onChange={(e) => {
                    setSurname(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  placeholder="e.g. Gadigone"
                  className="w-full h-11 px-3.5 rounded-lg bg-[#F7F9F8] dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] text-[#18201C] dark:text-[#ECF2EF] placeholder:text-[#8FA199] text-xs sm:text-sm focus:outline-none focus:border-[#242E2A] dark:focus:border-[#5BA18C]"
                />
              </div>
            </div>

            {/* Year of Study & Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="college-year-select"
                  className="block text-xs font-medium text-[#5C6B63] dark:text-[#C5D3CC] mb-1.5"
                >
                  Year of Study <span className="text-rose-500">*</span>
                </label>
                <select
                  id="college-year-select"
                  required
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full h-11 px-3 rounded-lg bg-[#F7F9F8] dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] text-[#18201C] dark:text-[#ECF2EF] text-xs sm:text-sm focus:outline-none focus:border-[#242E2A] dark:focus:border-[#5BA18C]"
                >
                  <option value="">Select Year...</option>
                  {STUDY_YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="college-branch-select"
                  className="block text-xs font-medium text-[#5C6B63] dark:text-[#C5D3CC] mb-1.5"
                >
                  Branch <span className="text-rose-500">*</span>
                </label>
                <select
                  id="college-branch-select"
                  required
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full h-11 px-3 rounded-lg bg-[#F7F9F8] dark:bg-[#141A18] border border-[#DFE6E2] dark:border-[#242E2A] text-[#18201C] dark:text-[#ECF2EF] text-xs sm:text-sm focus:outline-none focus:border-[#242E2A] dark:focus:border-[#5BA18C]"
                >
                  <option value="">Select Branch...</option>
                  {COLLEGE_BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              id="college-id-submit-btn"
              type="submit"
              disabled={isLoading || isProcessingPhoto}
              className="w-full h-11 flex items-center justify-center gap-2 px-4 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white font-semibold text-xs sm:text-sm cursor-pointer disabled:opacity-60"
            >
              <span>Continue to Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
