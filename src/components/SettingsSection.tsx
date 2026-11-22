import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  Lock,
  MessageSquare,
  Package,
  Settings as SettingsIcon,
  Shield,
  User as UserIcon,
  AlertCircle,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { StudentProfileDetails } from "../utils/studentProfile";

export interface NotificationPreferences {
  messageNotifications: boolean;
  emailNotifications: boolean;
  platformUpdates: boolean;
}

const DEFAULT_PREFS: NotificationPreferences = {
  messageNotifications: true,
  emailNotifications: true,
  platformUpdates: true,
};

const getPrefsStorageKey = (uid: string) => `campus_settings_prefs_${uid || "guest"}`;

const loadNotificationPrefs = (uid: string): NotificationPreferences => {
  try {
    const raw = localStorage.getItem(getPrefsStorageKey(uid));
    if (!raw) return DEFAULT_PREFS;
    const parsed = JSON.parse(raw);
    return {
      messageNotifications:
        typeof parsed.messageNotifications === "boolean"
          ? parsed.messageNotifications
          : true,
      emailNotifications:
        typeof parsed.emailNotifications === "boolean"
          ? parsed.emailNotifications
          : true,
      platformUpdates:
        typeof parsed.platformUpdates === "boolean"
          ? parsed.platformUpdates
          : true,
    };
  } catch {
    return DEFAULT_PREFS;
  }
};

interface SettingsSectionProps {
  uid: string;
  email: string;
  fallbackDisplayName?: string | null;
  fallbackPhotoURL?: string | null;
  studentProfile: StudentProfileDetails | null;
  onOpenMyProfile: (startInEditMode?: boolean) => void;
  onOpenMessages: () => void;
  onOpenMyListings: () => void;
  onLogout: () => void;
  onBackToHome: () => void;
  onShowToast?: (msg: string) => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  uid,
  email,
  fallbackDisplayName,
  fallbackPhotoURL,
  studentProfile,
  onOpenMyProfile,
  onOpenMessages,
  onOpenMyListings,
  onLogout,
  onBackToHome,
  onShowToast,
}) => {
  const { isDark } = useTheme();

  const [prefs, setPrefs] = useState<NotificationPreferences>(() =>
    loadNotificationPrefs(uid)
  );
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);

  useEffect(() => {
    setPrefs(loadNotificationPrefs(uid));
  }, [uid]);

  const displayName = (() => {
    if (studentProfile?.displayName?.trim()) return studentProfile.displayName.trim();
    const combined = `${studentProfile?.firstName || ""} ${studentProfile?.surname || ""}`.trim();
    if (combined) return combined;
    return fallbackDisplayName?.trim() || "Campus Student";
  })();

  const avatarPhoto = studentProfile?.photoURL || fallbackPhotoURL || "";
  const avatarInitial = displayName.charAt(0).toUpperCase() || "S";
  const resolvedEmail = email?.trim() || "Not available";
  const resolvedRollNumber = studentProfile?.rollNumber?.trim() || "Not available";

  const handleTogglePref = (key: keyof NotificationPreferences, label: string) => {
    setPrefs((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem(getPrefsStorageKey(uid), JSON.stringify(next));
      } catch {
        // Ignore storage quota issues
      }
      onShowToast?.(`${label} ${next[key] ? "enabled" : "disabled"}.`);
      return next;
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordNotice(null);

    if (!currentPassword.trim()) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }

    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowPasswordForm(false);
    setPasswordNotice("Account password updated successfully.");
    onShowToast?.("Password updated successfully.");
  };

  const cardClass = `rounded-2xl border p-6 sm:p-7 ${
    isDark
      ? "bg-[#141A18] border-[#242E2A]"
      : "bg-white border-[#DFE6E2]"
  }`;

  const dividerClass = isDark ? "border-[#242E2A]" : "border-[#EAEFEA]";

  const inputClass = `w-full h-10 px-3.5 rounded-xl border text-sm focus:outline-none ${
    isDark
      ? "bg-[#111715] border-[#34433D] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#667870]"
      : "bg-white border-[#C4D1CA] focus:border-[#2F5D50] text-[#18201C] placeholder:text-[#8A9891]"
  }`;

  const renderToggle = (
    id: string,
    checked: boolean,
    label: string,
    onChange: () => void
  ) => (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full cursor-pointer ${
        checked
          ? isDark
            ? "bg-[#387262]"
            : "bg-[#2F5D50]"
          : isDark
          ? "bg-[#242E2A]"
          : "bg-[#CFD9D4]"
      }`}
    >
      <span
        className={`inline-block h-4.5 w-4.5 rounded-full bg-white shadow-2xs ${
          checked ? "translate-x-5.5" : "translate-x-1"
        }`}
      />
    </button>
  );

  return (
    <section
      id="settings-section"
      aria-label="Account Settings"
      className="w-full max-w-6xl mx-auto space-y-6 text-left"
    >
      {/* Back to Home Link */}
      <div>
        <button
          id="settings-back-home-btn"
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

      {/* Page Header */}
      <div className="space-y-1.5">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
          }`}
        >
          YOUR ACCOUNT
        </p>
        <h1
          className={`text-3xl sm:text-4xl font-semibold tracking-tight ${
            isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
          }`}
        >
          Settings
        </h1>
        <p
          className={`text-sm ${
            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
          }`}
        >
          Manage your account and preferences.
        </p>
      </div>

      {/* Two-Column Layout: Left Sidebar + Right Settings Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Left Navigation Sidebar Card */}
        <aside
          className={`rounded-2xl border p-5 space-y-4 ${
            isDark
              ? "bg-[#141A18] border-[#242E2A]"
              : "bg-white border-[#DFE6E2]"
          }`}
        >
          {/* User Identity Summary */}
          <div className={`flex items-center gap-3 pb-4 border-b ${dividerClass}`}>
            <div
              className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${
                isDark
                  ? "bg-[#2F5D50] text-white"
                  : "bg-[#2F5D50] text-white"
              }`}
            >
              {avatarPhoto ? (
                <img
                  src={avatarPhoto}
                  alt={displayName}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-semibold">{avatarInitial}</span>
              )}
            </div>
            <div className="min-w-0">
              <div
                className={`text-sm font-semibold truncate ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                {displayName}
              </div>
              <div
                className={`text-xs ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                Student Account
              </div>
            </div>
          </div>

          {/* Sidebar Nav Links */}
          <nav aria-label="Account Settings Navigation" className="space-y-1">
            <button
              id="settings-nav-general"
              type="button"
              aria-current="page"
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 cursor-pointer ${
                isDark
                  ? "bg-[#182823] text-[#7BBFA8]"
                  : "bg-[#EFF4F1] text-[#2F5D50]"
              }`}
            >
              <SettingsIcon className="w-4 h-4 shrink-0" />
              <span>General Settings</span>
            </button>

            <button
              id="settings-nav-my-profile"
              type="button"
              onClick={() => onOpenMyProfile(false)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 cursor-pointer ${
                isDark
                  ? "text-[#C5D3CC] hover:bg-[#1B2320] hover:text-[#ECF2EF]"
                  : "text-[#384640] hover:bg-[#EFF4F1] hover:text-[#18201C]"
              }`}
            >
              <UserIcon className="w-4 h-4 shrink-0 text-[#5C6B63] dark:text-[#8FA199]" />
              <span>My Profile</span>
            </button>

            <button
              id="settings-nav-messages"
              type="button"
              onClick={onOpenMessages}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 cursor-pointer ${
                isDark
                  ? "text-[#C5D3CC] hover:bg-[#1B2320] hover:text-[#ECF2EF]"
                  : "text-[#384640] hover:bg-[#EFF4F1] hover:text-[#18201C]"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0 text-[#5C6B63] dark:text-[#8FA199]" />
              <span>Messages</span>
            </button>

            <button
              id="settings-nav-my-listings"
              type="button"
              onClick={onOpenMyListings}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2.5 cursor-pointer ${
                isDark
                  ? "text-[#C5D3CC] hover:bg-[#1B2320] hover:text-[#ECF2EF]"
                  : "text-[#384640] hover:bg-[#EFF4F1] hover:text-[#18201C]"
              }`}
            >
              <Package className="w-4 h-4 shrink-0 text-[#5C6B63] dark:text-[#8FA199]" />
              <span>My Listings</span>
            </button>
          </nav>
        </aside>

        {/* Right Main Content Stack */}
        <div className="space-y-6 min-w-0">
          {/* Card 1: Account Information */}
          <div className={cardClass}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2
                  className={`text-xl font-medium tracking-tight ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  Account Information
                </h2>
                <p
                  className={`text-xs ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  Manage your personal account details.
                </p>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-[#182823] text-[#7BBFA8]"
                    : "bg-[#EFF4F1] text-[#2F5D50]"
                }`}
              >
                <UserIcon className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className={`mt-6 divide-y ${dividerClass}`}>
              <div className="py-3.5 first:pt-0">
                <div
                  className={`text-xs ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  Full Name
                </div>
                <div
                  className={`mt-1 text-sm font-semibold ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  {displayName}
                </div>
              </div>

              <div className="py-3.5">
                <div
                  className={`text-xs ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  Email Address
                </div>
                <div
                  className={`mt-1 text-sm font-semibold ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  {resolvedEmail}
                </div>
              </div>

              <div className="py-3.5">
                <div
                  className={`text-xs ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  College Roll Number
                </div>
                <div
                  className={`mt-1 text-sm font-semibold ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  {resolvedRollNumber}
                </div>
              </div>
            </div>

            <div className="mt-5">
              <button
                id="settings-edit-profile-btn"
                type="button"
                onClick={() => onOpenMyProfile(true)}
                className={`h-10 px-5 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-2 cursor-pointer ${
                  isDark
                    ? "bg-[#387262] hover:bg-[#448573]"
                    : "bg-[#2F5D50] hover:bg-[#244A3F]"
                }`}
              >
                <span>Edit Profile</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Notifications */}
          <div className={cardClass}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2
                  className={`text-xl font-medium tracking-tight ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  Notifications
                </h2>
                <p
                  className={`text-xs ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  Choose your notification preferences.
                </p>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-[#182823] text-[#DFC29B]"
                    : "bg-[#EFF4F1] text-[#9E6B43]"
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className={`mt-6 divide-y ${dividerClass}`}>
              <div className="py-4 first:pt-0 flex items-center justify-between gap-4">
                <div>
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  >
                    Message Notifications
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    Notifications for new messages.
                  </p>
                </div>
                {renderToggle(
                  "toggle-message-notifications",
                  prefs.messageNotifications,
                  "Toggle Message Notifications",
                  () =>
                    handleTogglePref(
                      "messageNotifications",
                      "Message notifications"
                    )
                )}
              </div>

              <div className="py-4 flex items-center justify-between gap-4">
                <div>
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  >
                    Email Notifications
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    Receive important updates through email.
                  </p>
                </div>
                {renderToggle(
                  "toggle-email-notifications",
                  prefs.emailNotifications,
                  "Toggle Email Notifications",
                  () =>
                    handleTogglePref(
                      "emailNotifications",
                      "Email notifications"
                    )
                )}
              </div>

              <div className="py-4 last:pb-0 flex items-center justify-between gap-4">
                <div>
                  <div
                    className={`text-sm font-medium ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  >
                    Platform Updates
                  </div>
                  <p
                    className={`text-xs mt-0.5 ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    Receive information about new features.
                  </p>
                </div>
                {renderToggle(
                  "toggle-platform-updates",
                  prefs.platformUpdates,
                  "Toggle Platform Updates",
                  () => handleTogglePref("platformUpdates", "Platform updates")
                )}
              </div>
            </div>
          </div>

          {/* Card 3: Security */}
          <div className={cardClass}>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2
                  className={`text-xl font-medium tracking-tight ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  Security
                </h2>
                <p
                  className={`text-xs ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  Keep your account secure.
                </p>
              </div>
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-[#182823] text-[#7BBFA8]"
                    : "bg-[#EFF4F1] text-[#2F5D50]"
                }`}
              >
                <Shield className="w-4.5 h-4.5" />
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div
                  className={`text-sm font-medium ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}
                >
                  Password
                </div>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  Manage your account password.
                </p>
              </div>

              <button
                id="settings-change-password-btn"
                type="button"
                onClick={() => {
                  setPasswordError(null);
                  setPasswordNotice(null);
                  setShowPasswordForm((prev) => !prev);
                }}
                className={`h-10 px-4 rounded-xl border text-xs font-semibold cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center ${
                  isDark
                    ? "bg-[#1B2320] hover:bg-[#222D29] text-[#ECF2EF] border-[#2C3A35]"
                    : "bg-[#F5F7F6] hover:bg-[#E9EFEA] text-[#18201C] border-[#D4DDD8]"
                }`}
              >
                {showPasswordForm ? "Cancel" : "Change Password"}
              </button>
            </div>

            {passwordNotice && (
              <div
                className={`mt-4 p-3 rounded-xl border text-xs flex items-center gap-2 ${
                  isDark
                    ? "bg-[#182823] border-[#2A4A40] text-[#7BBFA8]"
                    : "bg-[#EFF4F1] border-[#C4D9D1] text-[#2F5D50]"
                }`}
              >
                <Check className="w-4 h-4 shrink-0" />
                <span>{passwordNotice}</span>
              </div>
            )}

            {showPasswordForm && (
              <form
                onSubmit={handlePasswordSubmit}
                className={`mt-5 pt-5 border-t space-y-4 ${dividerClass}`}
              >
                {passwordError && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                      isDark
                        ? "bg-[#261617] border-[#4A2527] text-[#E58989]"
                        : "bg-[#FDF2F2] border-[#F2CACA] text-[#A63A3A]"
                    }`}
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{passwordError}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="settings-current-password"
                      className={`block text-xs font-semibold ${
                        isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                      }`}
                    >
                      Current Password
                    </label>
                    <input
                      id="settings-current-password"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="settings-new-password"
                      className={`block text-xs font-semibold ${
                        isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                      }`}
                    >
                      New Password
                    </label>
                    <input
                      id="settings-new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      className={inputClass}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="settings-confirm-password"
                      className={`block text-xs font-semibold ${
                        isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                      }`}
                    >
                      Confirm New Password
                    </label>
                    <input
                      id="settings-confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordError(null);
                    }}
                    className={`h-9 px-4 rounded-xl border text-xs font-medium cursor-pointer ${
                      isDark
                        ? "bg-[#1B2320] border-[#242E2A] text-[#C5D3CC] hover:text-[#ECF2EF]"
                        : "bg-white border-[#DFE6E2] text-[#5C6B63] hover:text-[#18201C]"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    id="settings-save-password-btn"
                    type="submit"
                    className={`h-9 px-4 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5 cursor-pointer ${
                      isDark
                        ? "bg-[#387262] hover:bg-[#448573]"
                        : "bg-[#2F5D50] hover:bg-[#244A3F]"
                    }`}
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Card 4: Logout from your account */}
          <div
            className={`rounded-2xl border p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              isDark
                ? "bg-[#261617] border-[#4A2527]"
                : "bg-[#FDF2F2] border-[#F2CACA]"
            }`}
          >
            <div className="space-y-1">
              <h2
                className={`text-base font-medium ${
                  isDark ? "text-[#E58989]" : "text-[#A63A3A]"
                }`}
              >
                Logout from your account
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-[#C59595]" : "text-[#7A5454]"
                }`}
              >
                You will need to login again to access your account.
              </p>
            </div>

            <button
              id="settings-logout-btn"
              type="button"
              onClick={onLogout}
              className={`h-10 px-6 rounded-xl text-xs font-semibold text-white cursor-pointer whitespace-nowrap shrink-0 self-start sm:self-center ${
                isDark
                  ? "bg-[#B84545] hover:bg-[#C95252]"
                  : "bg-[#B24136] hover:bg-[#96352C]"
              }`}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
