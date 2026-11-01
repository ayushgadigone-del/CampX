import React from "react";
import {
  ShoppingBag,
  GraduationCap,
  Radio,
  MessageSquare,
  Heart,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Bell,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { triggerHaptic } from "../utils/haptics";

export type SectionTabId =
  | "marketplace"
  | "topper_vault"
  | "beacon_handovers"
  | "chats"
  | "saved";

export interface SectionTabItem {
  id: SectionTabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeType?: "accent" | "emerald" | "amber" | "rose" | "indigo";
  shortcut: string;
  description: string;
}

interface SectionNavigationTabsProps {
  activeTab: SectionTabId;
  onTabChange: (tab: SectionTabId) => void;
  listingsCount: number;
  topperNotesCount: number;
  chatsCount: number;
  wishlistCount: number;
  alertsCount: number;
  upcomingHandoversCount: number;
  onOpenCreateModal: () => void;
}

export const SectionNavigationTabs: React.FC<SectionNavigationTabsProps> = ({
  activeTab,
  onTabChange,
  listingsCount,
  topperNotesCount,
  chatsCount,
  wishlistCount,
  alertsCount,
  upcomingHandoversCount,
  onOpenCreateModal,
}) => {
  const { isDark } = useTheme();

  const TABS: SectionTabItem[] = [
    {
      id: "marketplace",
      label: "Marketplace Feed",
      shortLabel: "Marketplace",
      icon: ShoppingBag,
      badge: listingsCount > 0 ? listingsCount : undefined,
      badgeType: "indigo",
      shortcut: "1",
      description: "Browse student listings, buy & exchange",
    },
    {
      id: "topper_vault",
      label: "Topper Notes Vault",
      shortLabel: "Topper Vault",
      icon: GraduationCap,
      badge: "Free",
      badgeType: "emerald",
      shortcut: "2",
      description: "Verified handwritten notes & PYQ papers",
    },
    {
      id: "beacon_handovers",
      label: "Beacon & Handovers",
      shortLabel: "Beacon & Handovers",
      icon: Radio,
      badge: upcomingHandoversCount > 0 ? `${upcomingHandoversCount} Active` : "Live",
      badgeType: "amber",
      shortcut: "3",
      description: "Campus drops, live events & safe meetups",
    },
    {
      id: "chats",
      label: "Your Chats",
      shortLabel: "Chats",
      icon: MessageSquare,
      badge: chatsCount > 0 ? chatsCount : undefined,
      badgeType: "indigo",
      shortcut: "4",
      description: "Inquiries & negotiation threads",
    },
    {
      id: "saved",
      label: "Saved & Alerts",
      shortLabel: "Saved & Alerts",
      icon: Heart,
      badge: wishlistCount > 0 ? wishlistCount : alertsCount > 0 ? `${alertsCount} 🔔` : undefined,
      badgeType: "rose",
      shortcut: "5",
      description: "Wishlist collection & price notifications",
    },
  ];

  const currentIndex = TABS.findIndex((t) => t.id === activeTab);

  const handlePrevTab = () => {
    const nextIdx = (currentIndex - 1 + TABS.length) % TABS.length;
    triggerHaptic("light");
    onTabChange(TABS[nextIdx].id);
  };

  const handleNextTab = () => {
    const nextIdx = (currentIndex + 1) % TABS.length;
    triggerHaptic("light");
    onTabChange(TABS[nextIdx].id);
  };

  const handleSelectTab = (tabId: SectionTabId) => {
    if (tabId !== activeTab) {
      triggerHaptic("medium");
      onTabChange(tabId);
    }
  };

  const getBadgeClass = (type?: SectionTabItem["badgeType"], isActive?: boolean) => {
    if (isActive) {
      return "bg-white text-slate-900 font-extrabold shadow-2xs";
    }
    switch (type) {
      case "emerald":
        return isDark
          ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/60"
          : "bg-emerald-100 text-emerald-800 border border-emerald-200";
      case "amber":
        return isDark
          ? "bg-amber-950/80 text-amber-300 border border-amber-800/60"
          : "bg-amber-100 text-amber-900 border border-amber-200";
      case "rose":
        return isDark
          ? "bg-rose-950/80 text-rose-300 border border-rose-800/60"
          : "bg-rose-100 text-rose-800 border border-rose-200";
      default:
        return isDark
          ? "bg-indigo-950/80 text-indigo-300 border border-indigo-800/60"
          : "bg-indigo-100 text-indigo-800 border border-indigo-200";
    }
  };

  return (
    <div
      id="section-navigation-tabs-container"
      className="w-full mb-6 select-none"
    >
      {/* Top Header Row with Title, Current Tab summary & Prev/Next Arrows */}
      <div className="flex items-center justify-between gap-3 mb-2 px-1">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              isDark ? "text-slate-400" : "text-slate-700"
            }`}
          >
            Campus Sections
          </span>
          <span
            className={`text-xs font-mono hidden sm:inline ${
              isDark ? "text-slate-400" : "text-slate-600"
            }`}
          >
            • {TABS[currentIndex]?.description}
          </span>
        </div>

        {/* Prev & Next Navigation Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrevTab}
            aria-label="Previous Section Tab"
            title="Go to previous section (or press Left Arrow)"
            className={`h-7 px-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isDark
                ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
                : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Prev</span>
          </button>

          <span
            className={`text-[11px] font-mono font-bold px-1.5 py-0.5 rounded ${
              isDark
                ? "bg-slate-800 text-slate-300"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            {currentIndex + 1} / {TABS.length}
          </span>

          <button
            type="button"
            onClick={handleNextTab}
            aria-label="Next Section Tab"
            title="Go to next section (or press Right Arrow)"
            className={`h-7 px-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              isDark
                ? "bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800"
                : "bg-white hover:bg-slate-100 text-slate-800 border-slate-200 shadow-2xs"
            }`}
          >
            <span className="hidden xs:inline">Next</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Section Tabs Slider Bar */}
      <div
        role="tablist"
        aria-label="Campus Sections Navigation"
        className={`p-1.5 sm:p-2 rounded-2xl border transition-colors flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar shadow-xs ${
          isDark
            ? "bg-[#0B1120]/90 border-slate-800"
            : "bg-white border-slate-200 shadow-slate-200/50"
        }`}
      >
        {TABS.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-button-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tab-panel-${tab.id}`}
              onClick={() => handleSelectTab(tab.id)}
              className={`relative flex-1 min-w-[130px] sm:min-w-0 py-2 sm:py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 sm:gap-2 transition-all cursor-pointer whitespace-nowrap select-none ${
                isActive
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/30"
                  : isDark
                  ? "bg-slate-900/50 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800/80"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? "scale-110 text-white" : ""
                }`}
              />
              <span className="truncate">{tab.shortLabel}</span>

              {tab.badge !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono shrink-0 transition-colors ${getBadgeClass(
                    tab.badgeType,
                    isActive
                  )}`}
                >
                  {tab.badge}
                </span>
              )}

              {/* Number Shortcut Badge (1-5) */}
              <kbd
                className={`hidden md:inline-flex items-center justify-center min-w-[15px] h-[15px] px-1 text-[8px] font-mono font-bold rounded select-none ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isDark
                    ? "bg-slate-800 text-slate-400"
                    : "bg-slate-200 text-slate-600"
                }`}
                title={`Press ${tab.shortcut} to jump here`}
              >
                {tab.shortcut}
              </kbd>
            </button>
          );
        })}
      </div>
    </div>
  );
};
