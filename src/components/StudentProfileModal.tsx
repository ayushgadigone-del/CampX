import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Camera,
  UserCheck,
  ShieldCheck,
  AlertCircle,
  Loader2,
  GraduationCap,
  BookOpen,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  STUDY_YEARS,
  COLLEGE_BRANCHES,
  StudentProfileDetails,
  processProfileAvatarFile,
  persistStudentProfile,
} from "../utils/studentProfile";

interface StudentProfileModalProps {
  isOpen: boolean;
  mode: "onboarding" | "edit";
  uid: string;
  email: string;
  initialProfile?: Partial<StudentProfileDetails> | null;
  onSave: (savedProfile: StudentProfileDetails) => void;
  onClose?: () => void;
  onSwitchAccount?: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  isOpen,
  mode,
  uid,
  email,
  initialProfile,
  onSave,
  onClose,
  onSwitchAccount,
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [year, setYear] = useState("");
  const [branch, setBranch] = useState("");
  const [photoURL, setPhotoURL] = useState("");
  const [isProcessingPhoto, setIsProcessingPhoto] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setFirstName(initialProfile?.firstName || "");
    setSurname(initialProfile?.surname || "");
    setYear(initialProfile?.year || "");
    setBranch(initialProfile?.branch || "");
    setPhotoURL(initialProfile?.photoURL || "");
    setError(null);
  }, [isOpen, initialProfile]);

  useEffect(() => {
    if (!isOpen || mode !== "edit" || !onClose) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, mode, onClose]);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setIsProcessingPhoto(true);
    try {
      const processedUrl = await processProfileAvatarFile(file);
      setPhotoURL(processedUrl);
    } catch (err: any) {
      setError(err?.message || "Could not process the selected profile picture.");
    } finally {
      setIsProcessingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanFirst = firstName.trim();
    const cleanSurname = surname.trim();

    if (!photoURL.trim()) {
      setError("Profile picture is compulsory. Please upload a clear photo.");
      return;
    }
    if (!cleanFirst) {
      setError("Name is compulsory. Please enter your first name.");
      return;
    }
    if (!cleanSurname) {
      setError("Surname is compulsory. Please enter your surname.");
      return;
    }
    if (!year.trim()) {
      setError("Year of study is compulsory. Please select your current year.");
      return;
    }
    if (!branch.trim()) {
      setError("Branch is compulsory. Please select your engineering branch.");
      return;
    }

    setIsSaving(true);
    try {
      const saved = await persistStudentProfile({
        uid,
        email,
        firstName: cleanFirst,
        surname: cleanSurname,
        year,
        branch,
        photoURL,
      });
      onSave(saved);
    } catch (err: any) {
      setError(err?.message || "Failed to save your student details. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const isOnboarding = mode === "onboarding";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          if (!isOnboarding && onClose) onClose();
        }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"
      >
        <motion.div
          id="student-profile-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="student-profile-modal-title"
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          transition={{ duration: 0.18 }}
          onClick={(e) => e.stopPropagation()}
          className={`relative w-full max-w-lg rounded-2xl border shadow-2xl overflow-hidden my-6 ${
            isDark
              ? "bg-[#0B0F19] border-slate-800 text-slate-100 shadow-black/80"
              : "bg-white border-slate-200 text-slate-900 shadow-slate-300/40"
          }`}
        >
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-4 border-b ${
              isDark ? "border-slate-800 bg-slate-900/70" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h2
                  id="student-profile-modal-title"
                  className={`text-base sm:text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  {isOnboarding ? "Complete Your Student Profile" : "Edit Details"}
                </h2>
                <p
                  className={`text-xs ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  {isOnboarding
                    ? "All 5 details below are compulsory to enter the campus marketplace"
                    : "Update your name, surname, year of study, branch, or profile picture"}
                </p>
              </div>
            </div>

            {!isOnboarding && onClose && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close edit details modal"
                className={`min-w-[44px] min-h-[44px] rounded-xl flex items-center justify-center transition-colors cursor-pointer ${
                  isDark
                    ? "text-slate-400 hover:text-white hover:bg-slate-800"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-200/70"
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* Verified Email Line */}
            {email && (
              <div
                className={`px-3.5 py-2.5 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                  isDark
                    ? "bg-slate-900/80 border-slate-800 text-slate-300"
                    : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                <span className="truncate font-mono">{email}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 shrink-0">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Verified ID
                </span>
              </div>
            )}

            {/* Error Alert */}
            {error && (
              <div
                id="student-profile-error"
                role="alert"
                className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-600 dark:text-rose-300 text-xs flex items-start gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span className="font-medium leading-relaxed">{error}</span>
              </div>
            )}

            {/* Compulsory Profile Picture Upload */}
            <div
              className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center gap-4 ${
                isDark
                  ? "bg-slate-900/50 border-slate-800"
                  : "bg-slate-50/80 border-slate-200"
              }`}
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                aria-label="Upload profile picture"
                className={`relative w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden shrink-0 transition-colors cursor-pointer ${
                  photoURL
                    ? "border-indigo-500 bg-slate-900"
                    : isDark
                    ? "border-slate-700 bg-slate-900 hover:border-indigo-400 text-slate-400"
                    : "border-slate-300 bg-white hover:border-indigo-500 text-slate-500"
                }`}
              >
                {isProcessingPhoto ? (
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
                ) : photoURL ? (
                  <img
                    src={photoURL}
                    alt="Student profile preview"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <Camera className="w-6 h-6" />
                )}
              </button>

              <div className="flex-1 text-center sm:text-left space-y-1.5">
                <div className="text-xs font-bold">
                  Profile Picture <span className="text-rose-500">*</span>
                </div>
                <p
                  className={`text-[11px] leading-relaxed ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  Upload a clear student photo (JPG, PNG, or WebP). EXIF location metadata is automatically stripped.
                </p>
                <div className="pt-1 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <input
                    ref={fileInputRef}
                    id="student-profile-photo-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handlePhotoChange}
                    className="sr-only"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessingPhoto}
                    className="min-h-[38px] px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{photoURL ? "Change Photo" : "Upload Photo"}</span>
                  </button>
                  {photoURL && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Photo ready
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Name & Surname */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="student-first-name-input"
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Name (First Name) <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-first-name-input"
                  type="text"
                  required
                  maxLength={60}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Ayush"
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              <div>
                <label
                  htmlFor="student-surname-input"
                  className={`block text-xs font-bold mb-1.5 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Surname <span className="text-rose-500">*</span>
                </label>
                <input
                  id="student-surname-input"
                  type="text"
                  required
                  maxLength={60}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  placeholder="e.g. Gadigone"
                  className={`w-full min-h-[44px] px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>
            </div>

            {/* Year of Study & Branch */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label
                  htmlFor="student-year-select"
                  className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Year of Study <span className="text-rose-500">*</span>
                  </span>
                </label>
                <select
                  id="student-year-select"
                  required
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
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
                  htmlFor="student-branch-select"
                  className={`block text-xs font-bold mb-1.5 flex items-center gap-1.5 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  <span>
                    Branch <span className="text-rose-500">*</span>
                  </span>
                </label>
                <select
                  id="student-branch-select"
                  required
                  value={branch}
                  onChange={(e) => setBranch(e.target.value)}
                  className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100"
                      : "bg-white border-slate-300 text-slate-900"
                  }`}
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

            {/* Actions */}
            <div className="pt-2 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800">
              {isOnboarding ? (
                onSwitchAccount ? (
                  <button
                    type="button"
                    onClick={onSwitchAccount}
                    className={`min-h-[44px] px-3 py-2 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark
                        ? "text-slate-400 hover:text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign out / Switch account</span>
                  </button>
                ) : (
                  <span />
                )
              ) : (
                <button
                  type="button"
                  onClick={onClose}
                  className={`w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                    isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </button>
              )}

              <button
                id="save-student-profile-btn"
                type="submit"
                disabled={isSaving || isProcessingPhoto}
                className="w-full sm:w-auto min-h-[44px] px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold shadow-sm transition-colors inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving Details...</span>
                  </>
                ) : (
                  <span>{isOnboarding ? "Save & Continue" : "Save Changes"}</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
