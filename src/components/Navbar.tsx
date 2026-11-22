import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  WifiOff,
  User as UserIcon,
  MessageSquare,
  Heart,
  Package,
  Settings as SettingsIcon,
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
  onGoHome?: () => void;
  onOpenMyListings?: () => void;
  myListingsCount?: number;
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
  onOpenSettings?: () => void;
  activeTab?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onLogin,
  onDemoLogin,
  onLogout,
  onGoHome,
  onOpenMyListings,
  myListingsCount = 0,
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
  onOpenSettings,
  activeTab = "marketplace",
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

  const navItems = [
    {
      id: "navbar-topper-notes-btn",
      label: "Notes",
      keyShortcut: "N",
      active: activeTab === "topper_vault",
      onClick: onOpenTopperNotes,
      count: 0,
    },
    {
      id: "navbar-ai-inspector-btn",
      label: "AI Inspector",
      keyShortcut: "I",
      active: false,
      onClick: onOpenAIInspector,
      count: 0,
    },
    {
      id: "navbar-handovers-btn",
      label: "Handovers",
      keyShortcut: "H",
      active: activeTab === "beacon_handovers",
      onClick: onOpenHandovers,
      count: upcomingHandoversCount,
    },
    {
      id: "navbar-your-chats-button",
      label: "Messages",
      keyShortcut: "C",
      active: activeTab === "chats",
      onClick: onOpenYourChats,
      count: chatsCount,
    },
    {
      id: "navbar-wishlist-button",
      label: "Saved",
      keyShortcut: "W",
      active: activeTab === "saved",
      onClick: onOpenWishlist,
      count: wishlistCount,
    },
  ];

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b ${
        isDark
          ? "bg-[#0D1110] border-[#242E2A]"
          : "bg-white border-[#DFE6E2]"
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 h-14 sm:h-16">
          {/* Zone 1: Clean Brand Mark & Wordmark */}
          <div className="flex items-center shrink-0 min-w-0">
            <button
              type="button"
              onClick={onGoHome}
              className="inline-flex items-center gap-2 sm:gap-2.5 cursor-pointer group min-w-0"
              title="PVG's COET Campus Resale & Exchange"
            >
              <span
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center shrink-0 ${
                  isDark
                    ? "bg-[#346858] text-white"
                    : "bg-[#274C3F] text-white"
                }`}
              >
                C
              </span>
              <span
                className={`text-sm sm:text-base font-bold tracking-tight whitespace-nowrap ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Campus Resale
              </span>
            </button>
          </div>

          {/* Zone 2: Evenly Spaced Navigation Links (Desktop / Fullscreen) */}
          <nav
            aria-label="Campus Navigation"
            className="hidden lg:flex items-center justify-center gap-1.5 xl:gap-2.5 text-[13px] font-medium"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                id={item.id}
                type="button"
                onClick={item.onClick}
                aria-keyshortcuts={item.keyShortcut}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                  item.active
                    ? isDark
                      ? "bg-[#182823] text-[#7BBFA8] font-semibold"
                      : "bg-[#EFF4F1] text-[#224134] font-semibold"
                    : isDark
                    ? "text-[#9EB0A8] hover:text-[#ECF2EF] hover:bg-[#161E1B]"
                    : "text-[#53625A] hover:text-[#18201C] hover:bg-[#F3F6F4]"
                }`}
              >
                <span>{item.label}</span>
                {item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono font-semibold leading-none tabular-nums ${
                      item.active
                        ? isDark
                          ? "bg-[#223B33] text-[#7BBFA8]"
                          : "bg-[#DCE8E2] text-[#224134]"
                        : isDark
                        ? "bg-[#1B2320] text-[#9EB0A8]"
                        : "bg-[#EEF2F0] text-[#53625A]"
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Zone 3: Balanced Utility & Primary Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3.5 lg:gap-5 shrink-0">
            {!isOnline && (
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-rose-500">
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
              className={`h-8 w-8 sm:h-9 sm:w-9 lg:h-10 lg:w-10 rounded-lg border flex items-center justify-center cursor-pointer shrink-0 ${
                isDark
                  ? "bg-[#141A18] border-[#242E2A] text-[#9EB0A8] hover:bg-[#1B2320] hover:text-[#ECF2EF]"
                  : "bg-white border-[#DFE6E2] text-[#53625A] hover:bg-[#F3F6F4] hover:text-[#18201C]"
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
              className={`h-8 sm:h-9 lg:h-10 inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 lg:px-5 rounded-lg text-xs sm:text-[13px] font-semibold whitespace-nowrap shrink-0 ${
                !isOnline
                  ? "bg-[#DFE6E2] dark:bg-[#242E2A] text-[#8FA199] cursor-not-allowed"
                  : isDark
                  ? "bg-[#387262] hover:bg-[#448573] text-white cursor-pointer"
                  : "bg-[#274C3F] hover:bg-[#1E3B31] text-white cursor-pointer"
              }`}
            >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
              <span>Post Item</span>
            </button>

            <div
              className={`hidden sm:block h-5 lg:h-6 w-px mx-0.5 lg:mx-1 ${
                isDark ? "bg-[#242E2A]" : "bg-[#DFE6E2]"
              }`}
              aria-hidden="true"
            />

            {currentUser ? (
              <div className="relative shrink-0 flex items-center" ref={profileMenuRef}>
                <button
                  id="navbar-profile-menu-btn"
                  type="button"
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  aria-label="User Account Menu"
                  aria-expanded={showProfileMenu}
                  title="My Profile & Account"
                  className={`h-8 sm:h-9 lg:h-10 flex items-center gap-1.5 sm:gap-2 lg:gap-2.5 pl-0.5 pr-1.5 sm:pl-1.5 sm:pr-3 rounded-full border cursor-pointer ${
                    isDark
                      ? "border-[#242E2A] bg-[#141A18] hover:bg-[#1B2320] hover:border-[#34433D]"
                      : "border-[#DFE6E2] bg-white hover:bg-[#F3F6F4] hover:border-[#C4D1CA]"
                  }`}
                >
                  <div
                    className={`w-7 h-7 lg:w-8 lg:h-8 rounded-full overflow-hidden flex items-center justify-center shrink-0 ${
                      isDark
                        ? "bg-[#1B2320] text-[#ECF2EF]"
                        : "bg-[#274C3F] text-white"
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
                    className={`w-3.5 h-3.5 shrink-0 ${
                      isDark ? "text-[#9EB0A8]" : "text-[#53625A]"
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
                          isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                        }`}
                      >
                        {displayName}
                      </div>
                      <div
                        className={`text-[11px] truncate font-mono mt-0.5 ${
                          isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                        }`}
                      >
                        {currentUser.email}
                      </div>
                      {(studentProfile?.year || studentProfile?.branch) && (
                        <div
                          className={`mt-1 text-[11px] ${
                            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
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
                      {onOpenMyListings && (
                        <button
                          id="navbar-my-listings-btn"
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenMyListings();
                          }}
                          className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between font-semibold cursor-pointer border-b ${
                            isDark
                              ? "text-[#7BBFA8] hover:bg-[#182823] border-[#242E2A]"
                              : "text-[#2F5D50] hover:bg-[#EFF4F1] border-[#DFE6E2]"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <Package className="w-3.5 h-3.5" />
                            <span>My Listings</span>
                          </span>
                          <span
                            className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono tabular-nums ${
                              isDark
                                ? "bg-[#182823] text-[#7BBFA8]"
                                : "bg-[#EFF4F1] text-[#2F5D50]"
                            }`}
                          >
                            {myListingsCount}
                          </span>
                        </button>
                      )}

                      {onEditProfileDetails && (
                        <button
                          id="navbar-my-profile-btn"
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onEditProfileDetails();
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center gap-2 font-medium cursor-pointer border-b ${
                            isDark
                              ? "text-[#ECF2EF] hover:bg-[#1B2320] border-[#242E2A]"
                              : "text-[#18201C] hover:bg-[#EFF4F1] border-[#DFE6E2]"
                          }`}
                        >
                          <UserIcon className="w-3.5 h-3.5 text-[#5C6B63] dark:text-[#8FA199]" />
                          <span>My Profile</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenYourChats();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between cursor-pointer ${
                          isDark ? "hover:bg-[#1B2320]" : "hover:bg-[#EFF4F1]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 text-[#5C6B63] dark:text-[#8FA199]" />
                          <span>Messages</span>
                        </span>
                        {chatsCount > 0 && (
                          <span className="text-[11px] font-mono text-[#5C6B63] dark:text-[#8FA199] tabular-nums">
                            {chatsCount}
                          </span>
                        )}
                      </button>

                      <button
                        id="navbar-saved-alerts-button"
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onOpenWishlist();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center justify-between cursor-pointer ${
                          isDark ? "hover:bg-[#1B2320]" : "hover:bg-[#EFF4F1]"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <Heart className="w-3.5 h-3.5 text-[#5C6B63] dark:text-[#8FA199]" />
                          <span>Saved &amp; Alerts</span>
                        </span>
                        {wishlistCount + alertsCount > 0 && (
                          <span className="text-[11px] font-mono text-[#5C6B63] dark:text-[#8FA199] tabular-nums">
                            {wishlistCount + alertsCount}
                          </span>
                        )}
                      </button>

                      {onOpenSettings && (
                        <button
                          id="navbar-settings-btn"
                          type="button"
                          onClick={() => {
                            setShowProfileMenu(false);
                            onOpenSettings();
                          }}
                          className={`w-full text-left px-3.5 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                            isDark ? "hover:bg-[#1B2320]" : "hover:bg-[#EFF4F1]"
                          }`}
                        >
                          <SettingsIcon className="w-3.5 h-3.5 text-[#5C6B63] dark:text-[#8FA199]" />
                          <span>Settings</span>
                        </button>
                      )}
                    </div>

                    <div
                      className={`pt-1 border-t ${
                        isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setShowProfileMenu(false);
                          onLogout();
                        }}
                        className={`w-full text-left px-3.5 py-2 flex items-center gap-2 font-medium cursor-pointer ${
                          isDark
                            ? "text-[#E58989] hover:bg-[#261617]"
                            : "text-[#A63A3A] hover:bg-[#FDF2F2]"
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
                      ? "bg-[#141A18] hover:bg-[#1B2320] text-[#ECF2EF] border-[#242E2A]"
                      : "bg-white hover:bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2]"
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
                        ? "text-[#8FA199] hover:text-[#ECF2EF]"
                        : "text-[#5C6B63] hover:text-[#18201C]"
                    }`}
                  >
                    Demo
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Mobile & Tablet Completely Visible Navigation Row */}
        <nav
          aria-label="Mobile Campus Navigation"
          className={`flex lg:hidden flex-wrap items-center justify-center sm:justify-start gap-x-1.5 gap-y-1.5 py-2 border-t text-xs font-medium ${
            isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"
          }`}
        >
          {navItems.map((item) => (
            <button
              key={`mobile-${item.id}`}
              type="button"
              onClick={item.onClick}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg whitespace-nowrap shrink-0 cursor-pointer ${
                item.active
                  ? isDark
                    ? "bg-[#182823] text-[#7BBFA8] font-semibold"
                    : "bg-[#EFF4F1] text-[#224134] font-semibold"
                  : isDark
                  ? "text-[#9EB0A8] hover:text-[#ECF2EF] hover:bg-[#161E1B]"
                  : "text-[#53625A] hover:text-[#18201C] hover:bg-[#F3F6F4]"
              }`}
            >
              <span>{item.label}</span>
              {item.count > 0 && (
                <span
                  className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-semibold leading-none tabular-nums ${
                    item.active
                      ? isDark
                        ? "bg-[#223B33] text-[#7BBFA8]"
                        : "bg-[#DCE8E2] text-[#224134]"
                      : isDark
                      ? "bg-[#1B2320] text-[#9EB0A8]"
                      : "bg-[#EEF2F0] text-[#53625A]"
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
