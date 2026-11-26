import React, { useState, useRef, useEffect } from "react";
import {
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Camera,
  Loader2,
  CheckCircle2,
  Eye,
  EyeOff,
  MailCheck,
  RefreshCw,
} from "lucide-react";
import {
  ALLOWED_COLLEGE_DOMAIN,
  isValidCollegeEmail,
} from "../utils/collegeAuth";
import {
  STUDY_YEARS,
  COLLEGE_BRANCHES,
  processProfileAvatarFile,
} from "../utils/studentProfile";
import {
  registerFirebaseCollegeAccount,
  signInFirebaseCollegeAccount,
  resendFirebaseVerificationEmail,
  sendFirebasePasswordReset,
} from "../lib/firebase";

export interface LoginProfilePayload {
  firstName: string;
  surname: string;
  year: string;
  branch: string;
  photoURL: string;
}

export interface AuthenticatedAccountPayload {
  uid: string;
  email: string;
  firstName: string;
  surname: string;
  displayName: string;
  year: string;
  branch: string;
  photoURL: string;
}

interface CollegeLoginPageProps {
  onGoogleSignIn?: () => Promise<void>;
  onDemoCollegeSignIn: (
    customEmail?: string,
    displayName?: string,
    profileData?: LoginProfilePayload,
    sessionToken?: string
  ) => Promise<void>;
  authErrorMessage?: string | null;
  onClearError?: () => void;
  onBackToLanding?: () => void;
  isModal?: boolean;
}

type AuthViewMode = "signin" | "signup" | "verify_email";

export const CollegeLoginPage: React.FC<CollegeLoginPageProps> = ({
  onDemoCollegeSignIn,
  authErrorMessage,
  onClearError,
  onBackToLanding,
  isModal = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [viewMode, setViewMode] = useState<AuthViewMode>("signin");

  // Sign-In state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [unverifiedSignInEmail, setUnverifiedSignInEmail] = useState<string | null>(null);
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Create Account state
  const [fullName, setFullName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);

  // Email Verification Link state
  const [pendingEmail, setPendingEmail] = useState("");
  const [pendingPassword, setPendingPassword] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  // Feedback & loading state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cooldown timer for verification email resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setResendCooldown((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [resendCooldown]);

  const clearFeedback = () => {
    setValidationError(null);
    setSuccessNotice(null);
    setUnverifiedSignInEmail(null);
    if (onClearError) onClearError();
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setValidationError(null);
    setIsProcessingPhoto(true);
    try {
      const processedUrl = await processProfileAvatarFile(file);
      setPhotoURL(processedUrl);
    } catch (err: any) {
      setValidationError(err?.message || "Could not process the selected profile photo.");
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Sign In with verified PVG college email + password via Firebase Auth (HTTPS)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const cleanEmail = signInEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setValidationError("Please enter your PVG college email.");
      return;
    }
    if (!isValidCollegeEmail(cleanEmail)) {
      setValidationError(
        `Only verified emails ending with @${ALLOWED_COLLEGE_DOMAIN} can sign in.`
      );
      return;
    }
    if (!signInPassword) {
      setValidationError("Please enter your password.");
      return;
    }

    setIsLoading(true);
    try {
      const firebaseSignIn = await signInFirebaseCollegeAccount(cleanEmail, signInPassword);

      if (firebaseSignIn.status === "signed_in") {
        const fbProfile = firebaseSignIn.profile;
        await onDemoCollegeSignIn(
          cleanEmail,
          fbProfile?.displayName || firebaseSignIn.user.displayName || undefined,
          fbProfile
            ? {
                firstName: fbProfile.firstName,
                surname: fbProfile.surname,
                year: fbProfile.year,
                branch: fbProfile.branch,
                photoURL: fbProfile.photoURL,
              }
            : undefined
        );
        return;
      }

      if (firebaseSignIn.status === "email_not_verified") {
        setUnverifiedSignInEmail(cleanEmail);
        setValidationError(
          `Please verify ${cleanEmail} first. Click the verification link in your college inbox (check Spam/Junk too), then sign in again.`
        );
        return;
      }

      if (
        firebaseSignIn.status === "provider_disabled" ||
        firebaseSignIn.status === "too_many_requests"
      ) {
        setValidationError(firebaseSignIn.message);
        return;
      }

      setValidationError(
        "Invalid PVG college email or password. If you don't have an account yet, click Create account."
      );
    } catch (err: any) {
      setValidationError(err?.message || "Unable to sign in right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Firebase verification link directly from the Sign In card when unverified
  const handleResendFromSignIn = async () => {
    if (resendCooldown > 0 || !unverifiedSignInEmail || !signInPassword) return;
    setValidationError(null);
    setSuccessNotice(null);
    setIsLoading(true);
    try {
      const res = await resendFirebaseVerificationEmail(unverifiedSignInEmail, signInPassword);
      if (res.status === "sent") {
        setResendCooldown(60);
        setSuccessNotice(
          `A fresh verification link has been sent to ${unverifiedSignInEmail}. Check your inbox and Spam folder, click the link, then sign in.`
        );
      } else if (res.status === "already_verified") {
        setUnverifiedSignInEmail(null);
        setSuccessNotice("Your email is already verified! Click Sign in to continue.");
      } else {
        setValidationError(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Send Firebase HTTPS password reset link
  const handleForgotPassword = async () => {
    setValidationError(null);
    setSuccessNotice(null);
    if (onClearError) onClearError();

    const cleanEmail = signInEmail.trim().toLowerCase();
    if (!cleanEmail || !isValidCollegeEmail(cleanEmail)) {
      setValidationError(
        `Enter your @${ALLOWED_COLLEGE_DOMAIN} email above first, then click Forgot password.`
      );
      return;
    }

    setIsSendingReset(true);
    try {
      const res = await sendFirebasePasswordReset(cleanEmail);
      if (res.status === "sent") {
        setSuccessNotice(
          `Password reset link sent to ${cleanEmail}. Check your inbox (and Spam/Junk folder) to set a new password.`
        );
      } else {
        setValidationError(res.message);
      }
    } finally {
      setIsSendingReset(false);
    }
  };

  // Create Account -> Register in Firebase Auth + Firestore & Send HTTPS Verification Link
  const handleCreateAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearFeedback();

    const trimmedName = fullName.trim();
    const nameParts = trimmedName.split(/\s+/).filter(Boolean);
    const cleanEmail = signUpEmail.trim().toLowerCase();

    if (!photoURL) {
      setValidationError("Profile photo is compulsory. Please upload a photo.");
      return;
    }
    if (nameParts.length < 2) {
      setValidationError("Please enter your full name (both first name and surname).");
      return;
    }
    if (!cleanEmail) {
      setValidationError("Please enter your PVG college email.");
      return;
    }
    if (!isValidCollegeEmail(cleanEmail)) {
      setValidationError(
        `Only college emails ending with @${ALLOWED_COLLEGE_DOMAIN} are allowed.`
      );
      return;
    }
    if (!year) {
      setValidationError("Year of study is compulsory. Please select your year.");
      return;
    }
    if (!branch) {
      setValidationError("Branch is compulsory. Please select your engineering branch.");
      return;
    }
    if (createPassword.length < 8) {
      setValidationError("Password must be at least 8 characters long.");
      return;
    }
    if (createPassword !== confirmPassword) {
      setValidationError("Passwords do not match. Please re-enter your password.");
      return;
    }

    const firstName = nameParts[0].slice(0, 60);
    const surname = nameParts.slice(1).join(" ").slice(0, 60);

    setIsLoading(true);
    try {
      const fbResult = await registerFirebaseCollegeAccount({
        email: cleanEmail,
        password: createPassword,
        firstName,
        surname,
        year,
        branch,
        photoURL,
      });

      if (fbResult.status === "verification_sent") {
        setPendingEmail(cleanEmail);
        setPendingPassword(createPassword);
        setCreatePassword("");
        setConfirmPassword("");
        setResendCooldown(60);
        setSuccessNotice(
          `Verification link sent to ${cleanEmail}. Open your inbox and click the link to activate your account.`
        );
        setViewMode("verify_email");
        return;
      }

      if (fbResult.status === "already_exists") {
        setSignInEmail(cleanEmail);
        setSignInPassword("");
        setCreatePassword("");
        setConfirmPassword("");
        setSuccessNotice(
          "An account with this PVG college email already exists. Sign in below (or use Forgot password if needed)."
        );
        setViewMode("signin");
        return;
      }

      setValidationError(fbResult.message);
    } catch (err: any) {
      setValidationError(err?.message || "Could not create your account right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Resend Verification Link from View 3
  const handleResendVerificationLink = async () => {
    if (resendCooldown > 0 || !pendingEmail || !pendingPassword) return;
    setValidationError(null);
    setSuccessNotice(null);
    setIsLoading(true);
    try {
      const res = await resendFirebaseVerificationEmail(pendingEmail, pendingPassword);
      if (res.status === "sent") {
        setResendCooldown(60);
        setSuccessNotice(
          `A fresh verification link was sent to ${pendingEmail}. Please check your inbox and Spam folder.`
        );
      } else if (res.status === "already_verified") {
        setSignInEmail(pendingEmail);
        setSignInPassword("");
        setPendingPassword("");
        setSuccessNotice("Your email is already verified! Sign in below with your password.");
        setViewMode("signin");
      } else {
        setValidationError(res.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleProceedToSignIn = () => {
    const emailToPrefill = pendingEmail || signUpEmail.trim().toLowerCase();
    setSignInEmail(emailToPrefill);
    setSignInPassword("");
    setPendingPassword("");
    setValidationError(null);
    setUnverifiedSignInEmail(null);
    setSuccessNotice(
      "Once you have clicked the verification link in your email, sign in below with your password."
    );
    setViewMode("signin");
  };

  const activeError = validationError || authErrorMessage;

  const inputClass =
    "w-full h-12 px-4 rounded-xl bg-white dark:bg-[#111715] border border-[#DFE6E2] dark:border-[#242E2A] text-[#18201C] dark:text-[#ECF2EF] placeholder:text-[#8A9891] dark:placeholder:text-[#667870] text-sm focus:outline-none focus:border-[#2F5D50] dark:focus:border-[#5BA18C]";

  const renderBrandHeader = () => (
    <div className="flex items-center gap-3 mb-7">
      <div className="w-10 h-10 rounded-xl bg-[#274C3F] dark:bg-[#346858] text-white font-bold text-lg flex items-center justify-center shrink-0">
        C
      </div>
      <span className="text-[19px] font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF]">
        Campus Resale
      </span>
    </div>
  );

  return (
    <div
      id="college-login-container"
      className={`${
        isModal ? "py-6 px-4 sm:px-6" : "min-h-screen flex flex-col"
      } bg-[#F7F9F8] dark:bg-[#0D1110] text-[#18201C] dark:text-[#ECF2EF] font-sans`}
    >
      {/* Topmost Announcement Header when full-page */}
      {!isModal && (
        <div
          id="auth-top-announcement-bar"
          className="w-full py-2.5 px-4 text-center text-xs sm:text-[13px] font-medium tracking-wide bg-[#224134] dark:bg-[#162C24] text-white dark:text-[#ECF2EF] dark:border-b dark:border-[#242E2A]"
        >
          A smarter way to buy, sell &amp; exchange on campus.
        </div>
      )}

      <div
        className={`flex-1 flex flex-col justify-center items-center ${
          isModal ? "" : "px-4 py-10"
        }`}
      >
        <div className="w-full max-w-[468px] mx-auto space-y-4">
          {onBackToLanding && !isModal && (
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

          {/* Main Auth Card */}
          <div
            id="college-login-card"
            className="w-full bg-white dark:bg-[#141A18] border border-[#E4EAE6] dark:border-[#242E2A] rounded-2xl p-7 sm:p-9 shadow-[0_6px_28px_rgba(24,32,28,0.05)]"
          >
            {renderBrandHeader()}

            {/* Success Notice */}
            {successNotice && (
              <div
                id="auth-success-alert"
                className="mb-5 p-3.5 rounded-xl bg-[#EFF4F1] dark:bg-[#182823] border border-[#C4D9D1] dark:border-[#2A4A40] text-[#224134] dark:text-[#7BBFA8] text-xs flex items-start gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed font-medium">{successNotice}</p>
              </div>
            )}

            {/* Error Feedback */}
            {activeError && (
              <div
                id="login-error-alert"
                role="alert"
                className="mb-5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/70 text-rose-800 dark:text-rose-200 text-xs space-y-2.5"
              >
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">{activeError}</p>
                </div>
                {unverifiedSignInEmail && viewMode === "signin" && (
                  <div className="pl-6">
                    <button
                      id="signin-resend-verification-btn"
                      type="button"
                      disabled={isLoading || resendCooldown > 0}
                      onClick={handleResendFromSignIn}
                      className="inline-flex items-center gap-1.5 font-semibold text-rose-700 dark:text-rose-300 hover:underline underline-offset-4 cursor-pointer disabled:opacity-50 disabled:no-underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>
                        {resendCooldown > 0
                          ? `Resend verification link in ${resendCooldown}s`
                          : "Resend verification email"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 1: SIGN IN                                              */}
            {/* ============================================================ */}
            {viewMode === "signin" && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9E6B43] dark:text-[#C89B6E]">
                  WELCOME BACK
                </p>
                <h1 className="mt-2 text-3xl sm:text-[32px] font-normal tracking-tight text-[#18201C] dark:text-[#ECF2EF] leading-tight">
                  Good to see you again.
                </h1>
                <p className="mt-2.5 text-sm text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                  Sign in to discover, buy, sell and exchange items within your campus.
                </p>

                <form onSubmit={handleSignInSubmit} noValidate className="mt-7 space-y-5">
                  <div>
                    <label
                      htmlFor="signin-college-email"
                      className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF] mb-2"
                    >
                      PVG college email
                    </label>
                    <input
                      id="signin-college-email"
                      type="email"
                      autoComplete="email"
                      value={signInEmail}
                      onChange={(e) => {
                        setSignInEmail(e.target.value);
                        if (validationError) setValidationError(null);
                        if (unverifiedSignInEmail) setUnverifiedSignInEmail(null);
                      }}
                      placeholder={`yourname@${ALLOWED_COLLEGE_DOMAIN}`}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <label
                        htmlFor="signin-password"
                        className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF]"
                      >
                        Password
                      </label>
                      <button
                        id="forgot-password-btn"
                        type="button"
                        disabled={isSendingReset || isLoading}
                        onClick={handleForgotPassword}
                        className="text-xs font-medium text-[#224134] dark:text-[#7BBFA8] hover:underline underline-offset-4 cursor-pointer disabled:opacity-50"
                      >
                        {isSendingReset ? "Sending reset link..." : "Forgot password?"}
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        id="signin-password"
                        type={showSignInPassword ? "text" : "password"}
                        autoComplete="current-password"
                        value={signInPassword}
                        onChange={(e) => {
                          setSignInPassword(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="Enter your password"
                        className={`${inputClass} pr-11`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword((prev) => !prev)}
                        aria-label={showSignInPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6D7C75] hover:text-[#18201C] dark:text-[#8FA199] dark:hover:text-[#ECF2EF] cursor-pointer"
                      >
                        {showSignInPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    id="signin-submit-btn"
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 flex items-center justify-center gap-2 px-4 rounded-xl bg-[#274C3F] hover:bg-[#1E3B31] dark:bg-[#356C5B] dark:hover:bg-[#3F7D6A] text-white font-semibold text-[15px] cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4" />
                        <span>Signing in...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign in</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center space-y-3">
                  <p className="text-[13px] text-[#5C6B63] dark:text-[#8FA199]">
                    Don&apos;t have an account?{" "}
                    <button
                      id="switch-to-create-account-btn"
                      type="button"
                      onClick={() => {
                        clearFeedback();
                        setViewMode("signup");
                      }}
                      className="font-bold text-[#224134] dark:text-[#7BBFA8] hover:underline underline-offset-4 cursor-pointer"
                    >
                      Create account
                    </button>
                  </p>
                  <p className="text-xs text-[#808E87] dark:text-[#73847D]">
                    Sign in using your verified PVG COET college email.
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 2: CREATE ACCOUNT                                       */}
            {/* ============================================================ */}
            {viewMode === "signup" && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9E6B43] dark:text-[#C89B6E]">
                  JOIN YOUR CAMPUS
                </p>
                <h1 className="mt-2 text-3xl sm:text-[32px] font-normal tracking-tight text-[#18201C] dark:text-[#ECF2EF] leading-tight">
                  Make campus life more circular.
                </h1>
                <p className="mt-2.5 text-sm text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                  Create your account and start buying, selling and exchanging.
                </p>

                <form
                  onSubmit={handleCreateAccountSubmit}
                  noValidate
                  className="mt-6 space-y-4"
                >
                  {/* Compulsory Profile Photo */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF] mb-2">
                      Profile photo <span className="text-rose-500">*</span>
                    </label>
                    <div className="p-3.5 rounded-xl bg-[#F7F9F8] dark:bg-[#111715] border border-[#DFE6E2] dark:border-[#242E2A] flex items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        aria-label="Upload profile photo"
                        className="w-14 h-14 rounded-full border border-dashed border-[#C4D1CA] dark:border-[#34433D] bg-white dark:bg-[#141A18] flex items-center justify-center overflow-hidden shrink-0 cursor-pointer text-[#8FA199]"
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
                        <p className="text-xs text-[#5C6B63] dark:text-[#8FA199]">
                          JPG, PNG or WEBP · Max 5 MB
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <input
                            ref={fileInputRef}
                            id="signup-profile-photo-input"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoUpload}
                            className="sr-only"
                          />
                          <button
                            id="signup-upload-photo-btn"
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isProcessingPhoto}
                            className="px-3 py-1.5 rounded-lg border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#1B2320] text-xs font-semibold text-[#18201C] dark:text-[#ECF2EF] cursor-pointer disabled:opacity-60"
                          >
                            {photoURL ? "Change photo" : "Upload photo"}
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
                  </div>

                  {/* Full name */}
                  <div>
                    <label
                      htmlFor="signup-full-name"
                      className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF] mb-1.5"
                    >
                      Full name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="signup-full-name"
                      type="text"
                      autoComplete="name"
                      maxLength={120}
                      value={fullName}
                      onChange={(e) => {
                        setFullName(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder="Enter your full name"
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* PVG college email */}
                  <div>
                    <label
                      htmlFor="signup-college-email"
                      className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF] mb-1.5"
                    >
                      PVG college email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="signup-college-email"
                      type="email"
                      autoComplete="email"
                      value={signUpEmail}
                      onChange={(e) => {
                        setSignUpEmail(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      placeholder={`yourname@${ALLOWED_COLLEGE_DOMAIN}`}
                      className={inputClass}
                      required
                    />
                  </div>

                  {/* Year of study & Branch */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label
                        htmlFor="signup-year-select"
                        className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF] mb-1.5"
                      >
                        Year of study <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="signup-year-select"
                        value={year}
                        onChange={(e) => {
                          setYear(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        className={`${inputClass} px-3 cursor-pointer`}
                        required
                      >
                        <option value="">Select year</option>
                        {STUDY_YEARS.map((y) => (
                          <option key={y} value={y}>
                            {y}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="signup-branch-select"
                        className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF] mb-1.5"
                      >
                        Branch <span className="text-rose-500">*</span>
                      </label>
                      <select
                        id="signup-branch-select"
                        value={branch}
                        onChange={(e) => {
                          setBranch(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        className={`${inputClass} px-3 cursor-pointer`}
                        required
                      >
                        <option value="">Select branch</option>
                        {COLLEGE_BRANCHES.map((b) => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Create password */}
                  <div>
                    <label
                      htmlFor="signup-password"
                      className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF] mb-1.5"
                    >
                      Create password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="signup-password"
                        type={showCreatePassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={createPassword}
                        onChange={(e) => {
                          setCreatePassword(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="At least 8 characters"
                        className={`${inputClass} pr-11`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCreatePassword((prev) => !prev)}
                        aria-label={showCreatePassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6D7C75] hover:text-[#18201C] dark:text-[#8FA199] dark:hover:text-[#ECF2EF] cursor-pointer"
                      >
                        {showCreatePassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm password */}
                  <div>
                    <label
                      htmlFor="signup-confirm-password"
                      className="block text-[13px] font-semibold text-[#18201C] dark:text-[#ECF2EF] mb-1.5"
                    >
                      Confirm password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="signup-confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (validationError) setValidationError(null);
                        }}
                        placeholder="Enter your password again"
                        className={`${inputClass} pr-11`}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#6D7C75] hover:text-[#18201C] dark:text-[#8FA199] dark:hover:text-[#ECF2EF] cursor-pointer"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    id="create-account-submit-btn"
                    type="submit"
                    disabled={isLoading || isProcessingPhoto}
                    className="w-full h-12 mt-2 flex items-center justify-center gap-2 px-4 rounded-xl bg-[#274C3F] hover:bg-[#1E3B31] dark:bg-[#356C5B] dark:hover:bg-[#3F7D6A] text-white font-semibold text-[15px] cursor-pointer disabled:opacity-60"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4" />
                        <span>Creating account &amp; sending link...</span>
                      </>
                    ) : (
                      <>
                        <span>Create account</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-6 text-center space-y-2.5">
                  <p className="text-[13px] text-[#5C6B63] dark:text-[#8FA199]">
                    Already have an account?{" "}
                    <button
                      id="switch-to-signin-btn"
                      type="button"
                      onClick={() => {
                        clearFeedback();
                        setViewMode("signin");
                      }}
                      className="font-bold text-[#224134] dark:text-[#7BBFA8] hover:underline underline-offset-4 cursor-pointer"
                    >
                      Sign in
                    </button>
                  </p>
                  <p className="text-xs text-[#808E87] dark:text-[#73847D]">
                    We will send a secure verification link to your PVG college inbox.
                  </p>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* VIEW 3: VERIFY EMAIL VIA FIREBASE HTTPS LINK                 */}
            {/* ============================================================ */}
            {viewMode === "verify_email" && (
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9E6B43] dark:text-[#C89B6E]">
                  VERIFY YOUR EMAIL
                </p>
                <h1 className="mt-2 text-2xl sm:text-[28px] font-normal tracking-tight text-[#18201C] dark:text-[#ECF2EF] leading-tight">
                  Check your PVG inbox.
                </h1>
                <p className="mt-2.5 text-sm text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                  We sent a verification link to{" "}
                  <span className="font-semibold text-[#18201C] dark:text-[#ECF2EF] break-all">
                    {pendingEmail}
                  </span>
                  . Click the link in that email to verify your student account.
                </p>

                <div className="mt-5 p-4 rounded-xl bg-[#EFF4F1] dark:bg-[#182823] border border-[#C4D9D1] dark:border-[#2A4A40] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#224134] dark:text-[#7BBFA8]">
                    <MailCheck className="w-4 h-4 shrink-0" />
                    <span>Next steps</span>
                  </div>
                  <ol className="text-xs text-[#224134] dark:text-[#CDE4DC] space-y-2 list-decimal list-inside leading-relaxed">
                    <li>Open your PVG college email inbox (check Spam or Junk if needed).</li>
                    <li>Click the verification link from Campus Resale.</li>
                    <li>Come back here and sign in with your email and password.</li>
                  </ol>
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    id="proceed-to-signin-btn"
                    type="button"
                    onClick={handleProceedToSignIn}
                    className="w-full h-12 flex items-center justify-center gap-2 px-4 rounded-xl bg-[#274C3F] hover:bg-[#1E3B31] dark:bg-[#356C5B] dark:hover:bg-[#3F7D6A] text-white font-semibold text-[15px] cursor-pointer"
                  >
                    <span>I&apos;ve verified my email — Sign in</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-6 flex items-center justify-between gap-3 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      clearFeedback();
                      setViewMode("signin");
                    }}
                    className="inline-flex items-center gap-1 font-medium text-[#5C6B63] hover:text-[#18201C] dark:text-[#8FA199] dark:hover:text-[#ECF2EF] cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Sign in</span>
                  </button>

                  <button
                    id="resend-verification-link-btn"
                    type="button"
                    disabled={isLoading || resendCooldown > 0 || !pendingPassword}
                    onClick={handleResendVerificationLink}
                    className="inline-flex items-center gap-1.5 font-semibold text-[#224134] dark:text-[#7BBFA8] hover:underline underline-offset-4 cursor-pointer disabled:opacity-50 disabled:no-underline"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>
                      {resendCooldown > 0
                        ? `Resend link in ${resendCooldown}s`
                        : "Resend verification link"}
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
