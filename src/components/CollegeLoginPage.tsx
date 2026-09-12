import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  GraduationCap,
  ShieldCheck,
  AlertTriangle,
  Building2,
  Lock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  HelpCircle,
  Mail,
  UserCheck,
} from "lucide-react";
import {
  ALLOWED_COLLEGE_DOMAIN,
  COLLEGE_RESTRICTION_MESSAGE,
  isValidCollegeEmail,
} from "../utils/collegeAuth";

interface CollegeLoginPageProps {
  onGoogleSignIn: () => Promise<void>;
  onDemoCollegeSignIn: (customEmail?: string, displayName?: string) => Promise<void>;
  authErrorMessage?: string | null;
  onClearError?: () => void;
}

export const CollegeLoginPage: React.FC<CollegeLoginPageProps> = ({
  onGoogleSignIn,
  onDemoCollegeSignIn,
  authErrorMessage,
  onClearError,
}) => {
  const [inputEmail, setInputEmail] = useState("");
  const [inputName, setInputName] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showDemoProfiles, setShowDemoProfiles] = useState(false);

  const sampleProfiles = [
    {
      name: "Ayush Gadigone (App Owner / Roll 26)",
      email: "ayush.gadigone@pvgcoet.ac.in",
      role: "2nd Year CSE • App Owner",
    },
    {
      name: "Parshwa Gandhi (Student / Roll 28)",
      email: "parshwa.gandhi@pvgcoet.ac.in",
      role: "2nd Year CSE • Verified Student",
    },
    {
      name: "Omkar Ghadashi (Student / Roll 32)",
      email: "omkar.ghadashi@pvgcoet.ac.in",
      role: "2nd Year CSE • Verified Student",
    },
    {
      name: "Krishna Gopnarayan (Student / Roll 35)",
      email: "krishna.gopnarayan@pvgcoet.ac.in",
      role: "2nd Year CSE • Verified Student",
    },
    {
      name: "Engineering Student (General Student ID)",
      email: "student@pvgcoet.ac.in",
      role: "PVG's COET • Verified Student",
    },
  ];

  const handleCustomCollegeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (onClearError) onClearError();
    setValidationError(null);

    const emailToVerify = inputEmail.trim();
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

    setIsLoading(true);
    try {
      const displayName = inputName.trim() || emailToVerify.split("@")[0].replace(".", " ");
      await onDemoCollegeSignIn(emailToVerify, displayName);
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

  const handleSelectSample = (sample: { name: string; email: string }) => {
    setInputEmail(sample.email);
    setInputName(sample.name);
    setValidationError(null);
    if (onClearError) onClearError();
  };

  const activeError = validationError || authErrorMessage;

  return (
    <div
      id="college-login-container"
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-indigo-500 selection:text-white"
    >
      {/* Background Decorative Rings & Ambient Highlights */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full overflow-hidden pointer-events-none -z-10 opacity-35">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/30 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* College Institutional Branding Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="text-center mb-6 space-y-2.5"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/15 border border-indigo-400/30 text-indigo-300 text-xs font-semibold backdrop-blur-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>PVG's COET & GKPIM, Pune</span>
            <span className="text-indigo-400">•</span>
            <span className="text-emerald-400 font-bold">Official Campus Portal</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-tight">
            Campus Resale & Exchange
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
            Verified student-to-student marketplace for textbooks, calculators, lab gear, and topper revision notes.
          </p>
        </motion.div>

        {/* Mandatory Domain Restriction Notice Banner */}
        <motion.div
          id="college-domain-restriction-banner"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="w-full mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-500/15 via-indigo-500/15 to-amber-500/15 border border-amber-400/40 backdrop-blur-md shadow-lg"
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
        </motion.div>

        {/* Error Feedback Box */}
        <AnimatePresence>
          {activeError && (
            <motion.div
              id="login-error-alert"
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="w-full p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-start gap-2.5"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-bold text-rose-300">Authentication Warning</p>
                <p className="mt-0.5 leading-relaxed">{activeError}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Authentication Card */}
        <motion.div
          id="college-login-card"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="w-full bg-slate-800/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6"
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
              className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer select-none active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed"
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
              Please choose your official <strong className="text-slate-200">@{ALLOWED_COLLEGE_DOMAIN}</strong> account in the Google prompt.
            </p>
          </div>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-700 w-full" />
            <span className="bg-slate-800/90 px-3 text-[11px] text-slate-400 uppercase font-semibold tracking-wider shrink-0">
              OR ENTER ANY @PVGCOET.AC.IN EMAIL
            </span>
            <div className="border-t border-slate-700 w-full" />
          </div>

          {/* Method 2: Verified College ID Direct Login */}
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
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                  required
                />
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              </div>
              <p className="mt-1 text-[11px] text-slate-400">
                Anyone with an email ending with <strong className="text-indigo-300 font-mono">@{ALLOWED_COLLEGE_DOMAIN}</strong> can sign in.
              </p>
            </div>

            <div>
              <label
                htmlFor="college-name-input"
                className="block text-xs font-semibold text-slate-300 mb-1.5"
              >
                Full Name / Department (Optional)
              </label>
              <input
                id="college-name-input"
                type="text"
                value={inputName}
                onChange={(e) => setInputName(e.target.value)}
                placeholder="e.g. Ayush Gadigone (2nd Year CSE)"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-100 placeholder:text-slate-500 text-xs sm:text-sm focus:outline-hidden focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            <button
              id="college-id-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              <span>Verify & Access Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Pre-Configured College Accounts for Instant Testing */}
          <div className="pt-2 border-t border-slate-700/60">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                Verified Student Accounts (1-Click Test)
              </span>
              <button
                type="button"
                onClick={() => setShowDemoProfiles(!showDemoProfiles)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer underline underline-offset-2"
              >
                {showDemoProfiles ? "Hide list" : "Show accounts"}
              </button>
            </div>

            {showDemoProfiles && (
              <div className="mt-3 space-y-2 max-h-48 overflow-y-auto pr-1">
                {sampleProfiles.map((p) => (
                  <button
                    key={p.email}
                    type="button"
                    onClick={() => handleSelectSample(p)}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-700/60 hover:border-indigo-500/50 transition-all flex items-center justify-between group"
                  >
                    <div>
                      <span className="text-xs font-bold text-slate-200 block group-hover:text-indigo-300">
                        {p.name}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 block">
                        {p.email}
                      </span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-medium">
                      Fill
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Footer Security Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-slate-500 text-xs">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            End-to-End Verified Campus Network
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
            PVG's COET Problem-Based Learning Project
          </span>
        </div>
      </div>
    </div>
  );
};
