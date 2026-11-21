import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  WifiOff,
  UserCog,
  HardDrive,
  Bell,
  ShieldCheck,
  Sparkles,
  Calendar as CalendarIcon,
  MessageSquare,
  Heart,
  GraduationCap,
} from "lucide-react";
import { User } from "firebase/auth";
import { useTheme } from "../context/ThemeContext";
import { triggerHaptic } from "../utils/haptics";
import { StudentProfileDetails } from "../utils/studentProfile";

interface NavbarProps {
  currentUser: User | null;
  onLogin: () => void;
  onDemoLogin?: () => void;
  onLogout: () => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenCreateModal: () => void;
  onOpenAIInspector: () => void;
  onOpenHandovers: () => void;
  onOpenTopperNotes: () => void;
  onOpenGoogleDrive?: () => void;
  onOpenSecurity?: () => void;
  upcomingHandoversCount: number;
  wishlistCount?: number;
  onOpenWishlist: () => void;
  chatsCount?: number;
  onOpenYourChats: () => void;
  alertsCount?: number;
  onOpenAlerts: () => void;
  isOnline?: boolean;
  isSimulatedOffline?: boolean;
  onToggleSimulateOffline?: () => void;
  onShowToast?: (msg: string) => void;
  studentProfile?: StudentProfileDetails | null;
  onEditProfileDetails?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogin,
  onDemoLogin,
  onLogout,
  onOpenCreateModal,
  onOpenAIInspector,
  onOpenHandovers,
  onOpenTopperNotes,
  onOpenGoogleDrive,
  onOpenSecurity,
  upcomingHandoversCount,
  wishlistCount = 0,
  onOpenWishlist,
  chatsCount = 0,
  onOpenYourChats,
  alertsCount = 0,
  onOpenAlerts,
  isOnline = true,
  studentProfile,
  onEditProfileDetails,
}) => {
  const { isDark, toggleTheme } = useTheme();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName =
    studentProfile?.firstName && studentProfile?.surname
      ? `${studentProfile.firstName} ${studentProfile.surname}`
      : currentUser?.displayName || "Student";

  const avatarInitial =
    (studentProfile?.firstName || currentUser?.displayName || "S").charAt(0).toUpperCase();

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b ${
        isDark
          ? "bg-[#0D1110] border-[#242E2A]"
          : "bg-white border-[#DFE6E2]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-14">
          {/* Zone 1: Clean single-line wordmark */}
          <div className="flex items-center shrink-0">
            <span
              className={`text-[15px] sm:text-base font-bold tracking-tight whitespace-nowrap ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
              title="PVG's COET Campus Resale & Exchange"
            >
              Campus Resale
            </span>
          </div>

          {/* Zone 2: Minimal single-line text links (Desktop) */}
          <nav
            aria-label="Campus Navigation"
            className="hidden lg:flex items-center gap-6 text-[13px] font-medium"
          >
            <button
              id="navbar-topper-notes-btn"
              type="button"
              onClick={onOpenTopperNotes}
              aria-keyshortcuts="N"
              className={`whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4 ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF]"
                  : "text-[#5C6B63] hover:text-[#18201C]"
              }`}
            >
              Notes
            </button>

            <button
              id="navbar-ai-inspector-btn"
              type="button"
              onClick={onOpenAIInspector}
              aria-keyshortcuts="I"
              className={`whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4 ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF]"
                  : "text-[#5C6B63] hover:text-[#18201C]"
              }`}
            >
              AI Inspector
            </button>

            <button
              id="navbar-handovers-btn"
              type="button"
              onClick={onOpenHandovers}
              aria-keyshortcuts="H"
              className={`whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4 tabular-nums ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF]"
                  : "text-[#5C6B63] hover:text-[#18201C]"
              }`}
            >
              Handovers{upcomingHandoversCount > 0 ? ` (${upcomingHandoversCount})` : ""}
            </button>

            <button
              id="navbar-your-chats-button"
              type="button"
              onClick={onOpenYourChats}
              aria-keyshortcuts="C"
              className={`whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4 tabular-nums ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF]"
                  : "text-[#5C6B63] hover:text-[#18201C]"
              }`}
            >
              Chats{chatsCount > 0 ? ` (${chatsCount})` : ""}
            </button>

            <button
              id="navbar-wishlist-button"
              type="button"
              onClick={onOpenWishlist}
              aria-keyshortcuts="W"
              className={`whitespace-nowrap shrink-0 cursor-pointer hover:underline underline-offset-4 tabular-nums ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF]"
                  : "text-[#5C6B63] hover:text-[#18201C]"
              }`}
            >
              Saved{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
            </button>
          </nav>

          {/* Zone 3: Minimal Utility & Primary Action */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {!isOnline && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-rose-500 mr-1">
                <WifiOff className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Offline</span>
              </span>
            )}

            <button
              type="button"
              onClick={() => {
                triggerHaptic("toggle");
                toggleTheme();
              }}
              aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
              title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
              className={`h-9 w-9 rounded-lg border flex items-center justify-center cursor-pointer shrink-0 ${
                isDark
                  ? "bg-[#141A18] border-[#242E2A] text-[#8FA199] hover:bg-[#1B2320] hover:text-[#ECF2EF]"
                  : "bg-white border-[#DFE6E2] text-[#5C6B63] hover:bg-[#EFF4F1] hover:text-[#18201C]"
              }`}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              id="navbar-post-item-btn"
              type="button"
              onClick={() => {
                if (!isOnline) return;
                triggerHaptic("heavy");
                onOpenCreateModal();
              }}
              disabled={!isOnline}
              aria-keyshortcuts="P"
              className={`h-9 inline-flex items-center gap-1.5 px-3.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 ${
                !isOnline
                  ? "bg-[#DFE6E2] dark:bg-[#242E2A] text-[#8FA199] cursor-not-allowed"
                  : isDark
                  ? "bg-[#387262] hover:bg-[#448573] text-white cursor-pointer"
                  : "bg-[#2F5D50] hover:bg-[#244A3F] text-white cursor-pointer"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Post Item</span>
            </button>

            {currentUser ? (
              <div className="relative shrink-0 flex items-center" ref={profileMenuRef}>
                <button
                  id="navbar-profile-menu-btn"
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="User Account Menu"
                  aria-expanded={showProfileMenu}
                  title="Profile & Edit Details"
                  className={`flex items-center gap-1 p-0.5 rounded-full cursor-pointer ${
                    isDark ? "hover:bg-[#1B2320]" : "hover:bg-[#EFF4F1]"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center shrink-0 ${
                      isDark
                        ? "border-[#242E2A] bg-[#1B2320] text-[#ECF2EF]"
                        : "border-[#DFE6E2] bg-[#2F5D50] text-white"
                    }`}
                  >
                    {studentProfile?.photoURL || currentUser.photoURL ? (
                      <img
                        src={studentProfile?.photoURL || currentUser.photoURL || ""}
                        alt={displayName}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span className="text-xs font-semibold">{avatarInitial}</span>
                    )}
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 hidden sm:block ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  />
                </button>

                {showProfileMenu && (
                  <div
                    id="navbar-profile-dropdown"
                    className={`absolute top-full right-0 mt-2 w-64 max-w-[calc(100vw-1rem)] rounded-xl border py-1.5 z-50 text-xs shadow-lg ${
                      isDark
                        ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
                        : "bg-white border-[#DFE6E2] text-[#18201C]"
                    }`}
                  >
                    {/* Clean Student Info Header (Zero badges) */}
                    <div
                      className={`px-3.5 py-2.5 border-b ${
                        isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"
                      }`}
                    >
                      <div
                        className={`font-semibold text-[13px] truncate ${
                          isDark ? "text-zinc-50" : "text-zinc-950"
                        }`}
                      >
                        {displayName}
                      </div>
                      <div
                        className={`text-[11px] truncate font-mono mt-0.5 ${
                          isDark ? "text-zinc-400" : "text-zinc-500"
                        }`}
                      >
                        {currentUser.email}
                      </div>
                      {(studentProfile?.year || studentProfile?.branch) && (
                        <div
                          className={`mt-1 text-[11px] ${
                            isDark ? "text-zinc-400" : "text-zinc-600"
                          }`}
                        >
                          {[studentProfile?.year, studentProfile?.branch]
                            .filter(Boolean)
                            .join(" · ")}
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {onEditProfileDetails && (
                        <button
                          id="navbar-edit-details-btn"
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onEditProfileDetails();
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center gap-2 font-medium cursor-pointer border-b ${
                            isDark
                              ? "text-zinc-100 hover:bg-zinc-800/80 border-zinc-800"
                              : "text-zinc-900 hover:bg-zinc-50 border-zinc-100"
                          }`}
                        >
                          <UserCog className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Edit Details</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenAIInspector();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center gap-2 cursor-pointer ${
                          isDark ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                        <span>AI Photo Inspector</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenYourChats();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between cursor-pointer ${
                          isDark ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Your Chats</span>
                        </span>
                        {chatsCount > 0 && (
                          <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                            {chatsCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenWishlist();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between cursor-pointer ${
                          isDark ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Saved Wishlist</span>
                        </span>
                        {wishlistCount > 0 && (
                          <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                            {wishlistCount}
                          </span>
                        )}
                      </button>

                      <button
                        id="navbar-alerts-button"
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenAlerts();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between cursor-pointer ${
                          isDark ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Bell className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Item Alerts</span>
                        </span>
                        {alertsCount > 0 && (
                          <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                            {alertsCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenHandovers();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between cursor-pointer ${
                          isDark ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <CalendarIcon className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Handovers</span>
                        </span>
                        {upcomingHandoversCount > 0 && (
                          <span className="text-[11px] font-mono text-zinc-400 tabular-nums">
                            {upcomingHandoversCount}
                          </span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenTopperNotes();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center gap-2 cursor-pointer ${
                          isDark ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
                        }`}
                      >
                        <GraduationCap className="w-3.5 h-3.5 text-zinc-400" />
                        <span>Topper Notes</span>
                      </button>

                      {onOpenGoogleDrive && (
                        <button
                          id="navbar-drive-docs-btn"
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenGoogleDrive();
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center gap-2 cursor-pointer ${
                            isDark ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
                          }`}
                        >
                          <HardDrive className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Drive & Docs</span>
                        </button>
                      )}

                      {onOpenSecurity && (
                        <button
                          id="navbar-security-shield-btn"
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenSecurity();
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center gap-2 cursor-pointer ${
                            isDark ? "hover:bg-zinc-800/80" : "hover:bg-zinc-50"
                          }`}
                        >
                          <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Campus Safety</span>
                        </button>
                      )}
                    </div>

                    <div
                      className={`pt-1 border-t ${
                        isDark ? "border-zinc-800" : "border-zinc-100"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center gap-2 font-medium text-rose-600 dark:text-rose-400 cursor-pointer ${
                          isDark ? "hover:bg-zinc-800/80" : "hover:bg-rose-50"
                        }`}
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={onLogin}
                  className={`h-9 px-3 rounded-lg border text-xs font-medium cursor-pointer whitespace-nowrap ${
                    isDark
                      ? "bg-zinc-900 hover:bg-zinc-800 text-zinc-100 border-zinc-700"
                      : "bg-white hover:bg-zinc-50 text-zinc-900 border-zinc-300"
                  }`}
                >
                  Sign In
                </button>
                {onDemoLogin && (
                  <button
                    type="button"
                    onClick={onDemoLogin}
                    className={`h-9 px-2.5 rounded-lg text-xs font-medium cursor-pointer whitespace-nowrap ${
                      isDark
                        ? "text-zinc-400 hover:text-zinc-100"
                        : "text-zinc-600 hover:text-zinc-950"
                    }`}
                  >
                    Demo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
