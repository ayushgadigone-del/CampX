import React, { useState, useRef } from "react";
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Lock,
  ArrowRight,
  ArrowLeft,
  Mail,
  Camera,
  Loader2,
  CheckCircle2,
  BookOpen,
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
        `Invalid Email Domain: Only emails ending with @${ALLOWED_COLLEGE_DOMAIN} are authorized to access the campus marketplace.`
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
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white"
    >
      {/* Background Decorative Ambient Highlights (GPU-safe subtle radial glow without blur-3xl flicker) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_45%_at_50%_0%,rgba(99,102,241,0.16),transparent)] pointer-events-none -z-10" />

      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        {onBackToLanding && (
          <div className="w-full flex justify-start mb-4">
            <button
              id="back-to-overview-btn"
              type="button"
              onClick={onBackToLanding}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white px-3.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-colors cursor-pointer select-none"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Overview</span>
            </button>
          </div>
        )}

        {/* College Institutional Branding Header */}
        <div className="text-center mb-6 space-y-2.5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>PVG's COET, Pune</span>
            <span className="text-indigo-400">•</span>
            <span className="text-emerald-400 font-bold">Official Campus Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Campus Resale & Exchange
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Verified student-to-student marketplace for textbooks, calculators, lab gear, and topper revision notes.
          </p>
        </div>

        {/* Mandatory Domain Restriction Notice Banner */}
        <div
          id="college-domain-restriction-banner"
          className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-amber-500/15 border border-amber-400/40 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 shrink-0 mt-0.5 border border-amber-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-black text-amber-200 tracking-wide uppercase">
                  Institutional Access Restriction
                </span>
                <span className="px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 text-[11px] font-mono font-bold border border-amber-400/30">
                  @{ALLOWED_COLLEGE_DOMAIN} only
                </span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                {COLLEGE_RESTRICTION_MESSAGE}
              </p>
            </div>
          </div>
        </div>

        {/* Error Feedback Box */}
        {activeError && (
          <div
            id="login-error-alert"
            className="w-full mb-4 p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs flex items-start gap-2.5"
          >
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-300">Authentication Warning</p>
              <p className="mt-0.5 leading-relaxed">{activeError}</p>
            </div>
          </div>
        )}

        {/* Main Authentication Card */}
        <div
          id="college-login-card"
          className="w-full bg-slate-800/95 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Method 1: Google Institutional OAuth Sign-In */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Option 1: Sign in with College Google Account
            </label>
            <button
              id="login-with-google-btn"
              type="button"
              disabled={isLoading}
              onClick={handleGoogleClick}
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md cursor-pointer select-none disabled:opacity-60 disabled:cursor-not-allowed"
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
              <span>Sign in with @{ALLOWED_COLLEGE_DOMAIN}</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center">
              Please choose your official <strong className="text-slate-200">@{ALLOWED_COLLEGE_DOMAIN}</strong> account in the Google prompt. First-time sign-ins will complete their student profile next.
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-700 w-full" />
            <span className="bg-slate-800/90 px-3 text-[11px] text-slate-400 uppercase font-semibold tracking-wider shrink-0">
              OR ENTER ANY @PVGCOET.AC.IN EMAIL
            </span>
            <div className="border-t border-slate-700 w-full" />
          </div>

          {/* Method 2: Verified College ID Direct Login with Compulsory Student Details */}
          <form onSubmit={handleCustomCollegeLogin} className="space-y-4">
            <div>
              <label
                htmlFor="college-email-input"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                College Email ID <span className="text-rose-400">*</span>
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
                  placeholder={`anyname@${ALLOWED_COLLEGE_DOMAIN}`}
                  className="w-full min-h-[44px] pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Compulsory Profile Picture Upload */}
            <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-700/80 flex items-center gap-3.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile picture"
                className={`w-14 h-14 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 cursor-pointer transition-colors ${
                  photoURL
                    ? "border-indigo-500 bg-slate-900"
                    : "border-slate-600 bg-slate-900 hover:border-indigo-400 text-slate-400"
                }`}
              >
                {isProcessingPhoto ? (
                  <Loader2 className="w-5 h-5 text-indigo-400" />
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
                <div className="text-xs font-semibold text-slate-200">
                  Profile Picture <span className="text-rose-400">*</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Compulsory photo (EXIF location stripped)
                </p>
                <div className="mt-2 flex items-center gap-2 flex-wrap">
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
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 text-xs font-semibold text-slate-100 inline-flex items-center gap-1.5 cursor-pointer transition-colors disabled:opacity-60"
                  >
                    <Camera className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{photoURL ? "Change Photo" : "Upload Photo"}</span>
                  </button>
                  {photoURL && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Compulsory Name & Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="college-first-name-input"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Name (First Name) <span className="text-rose-400">*</span>
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
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="college-surname-input"
                  className="block text-xs font-semibold text-slate-300 mb-1.5"
                >
                  Surname <span className="text-rose-400">*</span>
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
                  className="w-full min-h-[44px] px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Compulsory Year of Study & Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label
                  htmlFor="college-year-select"
                  className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Year of Study <span className="text-rose-400">*</span>
                  </span>
                </label>
                <select
                  id="college-year-select"
                  required
                  value={year}
                  onChange={(e) => {
                    setYear(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
                  className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                  <span>
                    Branch <span className="text-rose-400">*</span>
                  </span>
                </label>
                <select
                  id="college-branch-select"
                  required
                  value={branch}
                  onChange={(e) => {
                    setBranch(e.target.value);
                    if (validationError) setValidationError(null);
                  }}
                  className="w-full min-h-[44px] px-3 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
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
              className="w-full min-h-[44px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer disabled:opacity-60"
            >
              <span>Verify & Access Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer Security Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            End-to-End Verified Campus Network
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            PVG's COET Project Based Learning
          </span>
        </div>
      </div>
    </div>
  );
};
