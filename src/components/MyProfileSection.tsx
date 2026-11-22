import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Check,
  Mail,
  Pencil,
  User as UserIcon,
  Save,
  X,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import {
  COLLEGE_BRANCHES,
  STUDY_YEARS,
  StudentProfileDetails,
  isStudentProfileComplete,
  persistStudentProfile,
  processProfileAvatarFile,
} from "../utils/studentProfile";

interface MyProfileSectionProps {
  uid: string;
  email: string;
  fallbackDisplayName?: string | null;
  fallbackPhotoURL?: string | null;
  studentProfile: StudentProfileDetails | null;
  onProfileSaved: (saved: StudentProfileDetails) => void;
  onBackToHome: () => void;
  initialEditMode?: boolean;
}

interface ProfileFieldErrors {
  photoURL?: string;
  firstName?: string;
  surname?: string;
  year?: string;
  branch?: string;
}

function splitNameParts(nameStr?: string | null): {
  firstName: string;
  surname: string;
} {
  const parts = (nameStr || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", surname: "" };
  if (parts.length === 1) return { firstName: parts[0], surname: "" };
  return {
    firstName: parts[0],
    surname: parts.slice(1).join(" "),
  };
}

export const MyProfileSection: React.FC<MyProfileSectionProps> = ({
  uid,
  email,
  fallbackDisplayName,
  fallbackPhotoURL,
  studentProfile,
  onProfileSaved,
  onBackToHome,
  initialEditMode = false,
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const deriveInitialName = () => {
    if (studentProfile?.firstName?.trim() || studentProfile?.surname?.trim()) {
      return {
        firstName: studentProfile.firstName?.trim() || "",
        surname: studentProfile.surname?.trim() || "",
      };
    }
    return splitNameParts(studentProfile?.displayName || fallbackDisplayName);
  };

  const initialName = deriveInitialName();
  const initialPhoto = (studentProfile?.photoURL || fallbackPhotoURL || "").trim();
  const initialBranch = (studentProfile?.branch || "").trim();
  const initialYear = (studentProfile?.year || "").trim();
  const initialComplete = isStudentProfileComplete({
    firstName: initialName.firstName,
    surname: initialName.surname,
    year: initialYear,
    branch: initialBranch,
    photoURL: initialPhoto,
  });

  const [isEditing, setIsEditing] = useState(initialEditMode || !initialComplete);
  const [firstName, setFirstName] = useState(initialName.firstName);
  const [surname, setSurname] = useState(initialName.surname);
  const [rollNumber, setRollNumber] = useState(studentProfile?.rollNumber || "");
  const [branch, setBranch] = useState(initialBranch);
  const [year, setYear] = useState(initialYear);
  const [admissionYear, setAdmissionYear] = useState(studentProfile?.admissionYear || "");
  const [lastYearCgpa, setLastYearCgpa] = useState(studentProfile?.lastYearCgpa || "");
  const [bio, setBio] = useState(studentProfile?.bio || "");
  const [interests, setInterests] = useState(studentProfile?.interests || "");
  const [photoURL, setPhotoURL] = useState(initialPhoto);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<ProfileFieldErrors>({});
  const [savedNotice, setSavedNotice] = useState<string | null>(null);

  useEffect(() => {
    const derived = deriveInitialName();
    const nextPhoto = (studentProfile?.photoURL || fallbackPhotoURL || "").trim();
    const nextBranch = (studentProfile?.branch || "").trim();
    const nextYear = (studentProfile?.year || "").trim();

    setFirstName(derived.firstName);
    setSurname(derived.surname);
    setRollNumber(studentProfile?.rollNumber || "");
    setBranch(nextBranch);
    setYear(nextYear);
    setAdmissionYear(studentProfile?.admissionYear || "");
    setLastYearCgpa(studentProfile?.lastYearCgpa || "");
    setBio(studentProfile?.bio || "");
    setInterests(studentProfile?.interests || "");
    setPhotoURL(nextPhoto);

    if (
      !isStudentProfileComplete({
        firstName: derived.firstName,
        surname: derived.surname,
        year: nextYear,
        branch: nextBranch,
        photoURL: nextPhoto,
      })
    ) {
      setIsEditing(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentProfile, fallbackDisplayName, fallbackPhotoURL]);

  const displayFullName = `${firstName.trim()} ${surname.trim()}`.trim();

  const validateRequiredFields = (candidate?: {
    photoURL?: string;
    firstName?: string;
    surname?: string;
    year?: string;
    branch?: string;
  }) => {
    const targetPhoto = (candidate?.photoURL ?? photoURL).trim();
    const targetFirst = (candidate?.firstName ?? firstName).trim();
    const targetSurname = (candidate?.surname ?? surname).trim();
    const targetYear = (candidate?.year ?? year).trim();
    const targetBranch = (candidate?.branch ?? branch).trim();

    const errors: ProfileFieldErrors = {};
    const missingLabels: string[] = [];

    if (!targetPhoto) {
      errors.photoURL = "Profile photo is required.";
      missingLabels.push("Profile Photo");
    }
    if (!targetFirst) {
      errors.firstName = "Name is required.";
      missingLabels.push("Name");
    }
    if (!targetSurname) {
      errors.surname = "Surname is required.";
      missingLabels.push("Surname");
    }
    if (!targetYear) {
      errors.year = "Year of study is required.";
      missingLabels.push("Year of Study");
    }
    if (!targetBranch) {
      errors.branch = "Branch is required.";
      missingLabels.push("Branch");
    }

    return {
      isValid: missingLabels.length === 0,
      errors,
      missingLabels,
    };
  };

  const isCurrentProfileComplete = isStudentProfileComplete({
    firstName,
    surname,
    year,
    branch,
    photoURL,
  });

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setSavedNotice(null);
    setIsUploadingPhoto(true);
    try {
      const processedPhoto = await processProfileAvatarFile(file);
      setPhotoURL(processedPhoto);
      setFieldErrors((prev) => ({ ...prev, photoURL: undefined }));

      // Persist immediately only if all other compulsory fields are already valid
      const check = validateRequiredFields({ photoURL: processedPhoto });
      if (check.isValid) {
        const saved = await persistStudentProfile({
          uid,
          email,
          firstName: firstName.trim(),
          surname: surname.trim(),
          year: year.trim(),
          branch: branch.trim(),
          photoURL: processedPhoto,
          rollNumber: rollNumber.trim(),
          admissionYear: admissionYear.trim(),
          lastYearCgpa: lastYearCgpa.trim(),
          bio: bio.slice(0, 300),
          interests: interests.trim(),
        });
        onProfileSaved(saved);
        setSavedNotice("Profile photo updated.");
        setTimeout(() => setSavedNotice(null), 3000);
      } else {
        setIsEditing(true);
        setSavedNotice(
          "Profile photo selected. Complete the remaining compulsory fields and click Save Changes."
        );
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Could not process the selected photo.");
    } finally {
      setIsUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSavedNotice(null);

    const validation = validateRequiredFields();
    if (!validation.isValid) {
      setFieldErrors(validation.errors);
      setErrorMsg(
        `Please complete all compulsory fields: ${validation.missingLabels.join(", ")}.`
      );
      return;
    }

    setFieldErrors({});
    setIsSaving(true);
    try {
      const saved = await persistStudentProfile({
        uid,
        email,
        firstName: firstName.trim(),
        surname: surname.trim(),
        year: year.trim(),
        branch: branch.trim(),
        photoURL: photoURL.trim(),
        rollNumber: rollNumber.trim(),
        admissionYear: admissionYear.trim(),
        lastYearCgpa: lastYearCgpa.trim(),
        bio: bio.slice(0, 300),
        interests: interests.trim(),
      });
      onProfileSaved(saved);
      setIsEditing(false);
      setSavedNotice("Profile information saved.");
      setTimeout(() => setSavedNotice(null), 3000);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save profile details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    const derived = deriveInitialName();
    setFirstName(derived.firstName);
    setSurname(derived.surname);
    setRollNumber(studentProfile?.rollNumber || "");
    setBranch((studentProfile?.branch || "").trim());
    setYear((studentProfile?.year || "").trim());
    setAdmissionYear(studentProfile?.admissionYear || "");
    setLastYearCgpa(studentProfile?.lastYearCgpa || "");
    setBio(studentProfile?.bio || "");
    setInterests(studentProfile?.interests || "");
    setPhotoURL((studentProfile?.photoURL || fallbackPhotoURL || "").trim());
    setFieldErrors({});
    setErrorMsg(null);
    setIsEditing(false);
  };

  const inputBaseClass = (editable: boolean, hasError = false) =>
    `w-full h-11 px-3.5 rounded-xl border text-sm focus:outline-none ${
      hasError
        ? isDark
          ? "bg-[#111715] border-[#D96B6B] focus:border-[#E58989] text-[#ECF2EF] placeholder:text-[#667870]"
          : "bg-white border-[#C04A4A] focus:border-[#A63A3A] text-[#18201C] placeholder:text-[#8A9891]"
        : isDark
        ? editable
          ? "bg-[#111715] border-[#34433D] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#667870]"
          : "bg-[#1B2320] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#667870]"
        : editable
        ? "bg-white border-[#C4D1CA] focus:border-[#2F5D50] text-[#18201C] placeholder:text-[#8A9891]"
        : "bg-[#F5F6F4] border-[#E7ECE9] text-[#4B5851] placeholder:text-[#98A49E]"
    }`;

  const branchOptions = React.useMemo(() => {
    const base = [...COLLEGE_BRANCHES] as string[];
    if (branch.trim() && !base.includes(branch.trim())) {
      return [branch.trim(), ...base];
    }
    return base;
  }, [branch]);

  return (
    <section
      id="my-profile-section"
      className="w-full max-w-5xl mx-auto space-y-6 text-left"
    >
      {/* Top Back Link */}
      <div>
        <button
          id="my-profile-back-home-btn"
          type="button"
          onClick={onBackToHome}
          className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:underline underline-offset-4 ${
            isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Header */}
      <div className="space-y-1.5">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
            isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
          }`}
        >
          STUDENT ACCOUNT
        </p>
        <h1
          className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
          }`}
        >
          My Profile
        </h1>
        <p
          className={`text-sm ${
            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
          }`}
        >
          Manage your student information and campus identity. Fields marked with{" "}
          <span className="text-[#C04A4A] dark:text-[#E58989] font-semibold">*</span>{" "}
          are compulsory.
        </p>
      </div>

      {/* Compulsory Fields Notice when incomplete */}
      {!isCurrentProfileComplete && !errorMsg && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            isDark
              ? "bg-[#221E15] border-[#4A3B1F] text-[#E6C07B]"
              : "bg-[#FEF9EC] border-[#F0DCAD] text-[#8A5A12]"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>
            Profile Photo, Name, Surname, Year of Study, and Branch are compulsory to complete your student profile.
          </span>
        </div>
      )}

      {/* Status Notices */}
      {errorMsg && (
        <div
          role="alert"
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            isDark
              ? "bg-[#261617] border-[#4A2527] text-[#E58989]"
              : "bg-[#FDF2F2] border-[#F2CACA] text-[#A63A3A]"
          }`}
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {savedNotice && (
        <div
          className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
            isDark
              ? "bg-[#182823] border-[#2A4A40] text-[#7BBFA8]"
              : "bg-[#EFF4F1] border-[#C4D9D1] text-[#2F5D50]"
          }`}
        >
          <Check className="w-4 h-4 shrink-0" />
          <span>{savedNotice}</span>
        </div>
      )}

      {/* Main Profile Card */}
      <form
        noValidate
        onSubmit={handleSaveProfile}
        className={`rounded-2xl border p-6 sm:p-8 space-y-8 ${
          isDark
            ? "bg-[#141A18] border-[#242E2A]"
            : "bg-white border-[#DFE6E2]"
        }`}
      >
        {/* Top Identity Row */}
        <div
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b ${
            isDark ? "border-[#242E2A]" : "border-[#EAEFEA]"
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar & Change Photo (Compulsory) */}
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div
                className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full border-2 overflow-hidden flex items-center justify-center ${
                  fieldErrors.photoURL
                    ? isDark
                      ? "bg-[#261617] border-[#D96B6B] text-[#E58989]"
                      : "bg-[#FDF2F2] border-[#C04A4A] text-[#A63A3A]"
                    : isDark
                    ? "bg-[#1B2320] border-[#2A4A40] text-[#7BBFA8]"
                    : "bg-[#E9EFEA] border-[#D7E2DC] text-[#2F5D50]"
                }`}
              >
                {photoURL ? (
                  <img
                    src={photoURL}
                    alt={displayFullName || "Student profile photo"}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <UserIcon className="w-11 h-11 stroke-[1.6]" />
                )}
              </div>

              <span
                className={`text-[11px] font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Profile Photo{" "}
                <span className="text-[#C04A4A] dark:text-[#E58989]">*</span>
              </span>

              <input
                ref={fileInputRef}
                id="my-profile-photo-input"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handlePhotoChange}
              />

              <button
                id="my-profile-change-photo-btn"
                type="button"
                disabled={isUploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className={`h-9 px-3.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer border ${
                  fieldErrors.photoURL
                    ? isDark
                      ? "bg-[#261617] hover:bg-[#311B1D] text-[#E58989] border-[#D96B6B]"
                      : "bg-[#FDF2F2] hover:bg-[#FCE6E6] text-[#A63A3A] border-[#C04A4A]"
                    : isDark
                    ? "bg-[#1B2320] hover:bg-[#222D29] text-[#ECF2EF] border-[#242E2A]"
                    : "bg-[#EFF4F1] hover:bg-[#E4ECE7] text-[#18201C] border-[#DFE6E2]"
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>
                  {isUploadingPhoto
                    ? "Updating..."
                    : photoURL
                    ? "Change Photo"
                    : "Upload Photo"}
                </span>
              </button>

              {fieldErrors.photoURL ? (
                <p className="text-[11px] font-medium text-[#C04A4A] dark:text-[#E58989] text-center">
                  {fieldErrors.photoURL}
                </p>
              ) : (
                <p
                  className={`text-[11px] text-center ${
                    isDark ? "text-[#73847D]" : "text-[#7C8B83]"
                  }`}
                >
                  JPG, PNG or WEBP. Maximum 5 MB.
                </p>
              )}
            </div>

            {/* Name, Email, Verified Student */}
            <div className="space-y-2 text-left">
              <h2
                className={`text-2xl font-bold tracking-tight ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                {displayFullName || "Campus Student"}
              </h2>

              <div
                className={`flex items-center gap-2 text-sm ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span>{email}</span>
              </div>

              {(year || branch) && (
                <p
                  className={`text-xs ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  {[year, branch].filter(Boolean).join(" · ")}
                </p>
              )}

              <div className="pt-1">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    isDark
                      ? "bg-[#182823] text-[#7BBFA8] border border-[#2A4A40]"
                      : "bg-[#EBF2EE] text-[#2F5D50]"
                  }`}
                >
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Verified Student</span>
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Button: Edit Profile / Save + Cancel */}
          <div className="flex items-center gap-2.5 self-start sm:self-center shrink-0">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className={`h-10 px-4 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                    isDark
                      ? "bg-[#1B2320] hover:bg-[#222D29] text-[#ECF2EF] border-[#242E2A]"
                      : "bg-white hover:bg-[#EFF4F1] text-[#5C6B63] border-[#DFE6E2]"
                  }`}
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Cancel</span>
                </button>
                <button
                  id="my-profile-save-btn"
                  type="submit"
                  disabled={isSaving}
                  className={`h-10 px-4 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 text-white cursor-pointer disabled:opacity-60 ${
                    isDark
                      ? "bg-[#387262] hover:bg-[#448573]"
                      : "bg-[#2F5D50] hover:bg-[#244A3F]"
                  }`}
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                </button>
              </>
            ) : (
              <button
                id="my-profile-edit-btn"
                type="button"
                onClick={() => setIsEditing(true)}
                className={`h-10 px-4 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? "bg-[#141A18] hover:bg-[#1B2320] text-[#7BBFA8] border-[#5BA18C]"
                    : "bg-white hover:bg-[#EFF4F1] text-[#2F5D50] border-[#2F5D50]"
                }`}
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>

        {/* Section 1: Personal & Academic Information */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h3
              className={`text-lg font-bold tracking-tight ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Personal &amp; Academic Information
            </h3>
            <p
              className={`text-xs ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Your college identity and academic details. Name, Surname, Year of Study, Branch, and Profile Photo are compulsory.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
            {/* Name (First Name) - Compulsory */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-first-name"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Name <span className="text-[#C04A4A] dark:text-[#E58989]">*</span>
              </label>
              <input
                id="profile-first-name"
                type="text"
                required
                value={firstName}
                readOnly={!isEditing}
                onChange={(e) => {
                  setFirstName(e.target.value);
                  if (fieldErrors.firstName && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                  }
                }}
                placeholder="Enter your first name"
                className={inputBaseClass(isEditing, Boolean(fieldErrors.firstName))}
              />
              {fieldErrors.firstName && (
                <p className="text-[11px] font-medium text-[#C04A4A] dark:text-[#E58989]">
                  {fieldErrors.firstName}
                </p>
              )}
            </div>

            {/* Surname - Compulsory */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-surname"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Surname <span className="text-[#C04A4A] dark:text-[#E58989]">*</span>
              </label>
              <input
                id="profile-surname"
                type="text"
                required
                value={surname}
                readOnly={!isEditing}
                onChange={(e) => {
                  setSurname(e.target.value);
                  if (fieldErrors.surname && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, surname: undefined }));
                  }
                }}
                placeholder="Enter your surname"
                className={inputBaseClass(isEditing, Boolean(fieldErrors.surname))}
              />
              {fieldErrors.surname && (
                <p className="text-[11px] font-medium text-[#C04A4A] dark:text-[#E58989]">
                  {fieldErrors.surname}
                </p>
              )}
            </div>

            {/* Year of Study - Compulsory */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-academic-year"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Year of Study{" "}
                <span className="text-[#C04A4A] dark:text-[#E58989]">*</span>
              </label>
              <select
                id="profile-academic-year"
                required
                value={year}
                disabled={!isEditing}
                onChange={(e) => {
                  setYear(e.target.value);
                  if (fieldErrors.year && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, year: undefined }));
                  }
                }}
                className={`${inputBaseClass(isEditing, Boolean(fieldErrors.year))} ${
                  isEditing ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <option value="">Select year of study</option>
                {STUDY_YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
              {fieldErrors.year && (
                <p className="text-[11px] font-medium text-[#C04A4A] dark:text-[#E58989]">
                  {fieldErrors.year}
                </p>
              )}
            </div>

            {/* Branch - Compulsory */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-branch"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Branch <span className="text-[#C04A4A] dark:text-[#E58989]">*</span>
              </label>
              <select
                id="profile-branch"
                required
                value={branch}
                disabled={!isEditing}
                onChange={(e) => {
                  setBranch(e.target.value);
                  if (fieldErrors.branch && e.target.value.trim()) {
                    setFieldErrors((prev) => ({ ...prev, branch: undefined }));
                  }
                }}
                className={`${inputBaseClass(isEditing, Boolean(fieldErrors.branch))} ${
                  isEditing ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <option value="">Select branch</option>
                {branchOptions.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
              {fieldErrors.branch && (
                <p className="text-[11px] font-medium text-[#C04A4A] dark:text-[#E58989]">
                  {fieldErrors.branch}
                </p>
              )}
            </div>

            {/* College Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-college-email"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                College Email
              </label>
              <input
                id="profile-college-email"
                type="email"
                value={email}
                readOnly
                className={inputBaseClass(false)}
              />
            </div>

            {/* Roll Number */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-roll-number"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Roll Number
              </label>
              <input
                id="profile-roll-number"
                type="text"
                value={rollNumber}
                readOnly={!isEditing}
                onChange={(e) => setRollNumber(e.target.value)}
                placeholder="e.g. 25120151"
                className={inputBaseClass(isEditing)}
              />
            </div>

            {/* Admission Year */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-admission-year"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Admission Year
              </label>
              <input
                id="profile-admission-year"
                type="text"
                value={admissionYear}
                readOnly={!isEditing}
                onChange={(e) => setAdmissionYear(e.target.value)}
                placeholder="e.g. 2025"
                className={inputBaseClass(isEditing)}
              />
            </div>

            {/* Last Year CGPA (Optional) */}
            <div className="space-y-1.5">
              <label
                htmlFor="profile-cgpa"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Last Year CGPA (Optional)
              </label>
              <input
                id="profile-cgpa"
                type="text"
                value={lastYearCgpa}
                readOnly={!isEditing}
                onChange={(e) => setLastYearCgpa(e.target.value)}
                placeholder="e.g. 8.5"
                className={inputBaseClass(isEditing)}
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr
          className={
            isDark ? "border-[#242E2A]" : "border-[#EAEFEA]"
          }
        />

        {/* Section 2: About Me */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h3
              className={`text-lg font-bold tracking-tight ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              About Me
            </h3>
            <p
              className={`text-xs ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Introduce yourself to the campus community.
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-bio"
              className={`block text-xs font-semibold ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Bio
            </label>
            <textarea
              id="profile-bio"
              rows={4}
              maxLength={300}
              value={bio}
              readOnly={!isEditing}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write something about yourself..."
              className={`w-full p-3.5 rounded-xl border text-sm focus:outline-none resize-y ${
                isDark
                  ? isEditing
                    ? "bg-[#111715] border-[#34433D] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#667870]"
                    : "bg-[#1B2320] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#667870]"
                  : isEditing
                  ? "bg-white border-[#C4D1CA] focus:border-[#2F5D50] text-[#18201C] placeholder:text-[#8A9891]"
                  : "bg-[#F5F6F4] border-[#E7ECE9] text-[#4B5851] placeholder:text-[#98A49E]"
              }`}
            />
            <p
              className={`text-[11px] ${
                isDark ? "text-[#73847D]" : "text-[#7C8B83]"
              }`}
            >
              {bio.length}/300 characters
            </p>
          </div>

          {/* Interests & Skills */}
          <div className="space-y-1.5">
            <label
              htmlFor="profile-interests"
              className={`block text-xs font-semibold ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Interests &amp; Skills
            </label>
            <input
              id="profile-interests"
              type="text"
              value={interests}
              readOnly={!isEditing}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="e.g. DSA, Embedded Systems, Web Development, CAD"
              className={inputBaseClass(isEditing)}
            />
          </div>
        </div>
      </form>
    </section>
  );
};
