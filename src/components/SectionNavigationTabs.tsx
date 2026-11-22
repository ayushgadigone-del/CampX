import React from "react";
import {
  ShoppingBag,
  GraduationCap,
  Radio,
  MessageSquare,
  Heart,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { triggerHaptic } from "../utils/haptics";

export type SectionTabId =
  | "marketplace"
  | "topper_vault"
  | "beacon_handovers"
  | "chats"
  | "saved"
  | "my_listings"
  | "my_profile"
  | "post_item"
  | "settings";

export interface SectionTabItem {
  id: SectionTabId;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  count?: number;
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
}) => {
  const { isDark } = useTheme();

  const TABS: SectionTabItem[] = [
    {
      id: "marketplace",
      label: "Marketplace",
      shortLabel: "Marketplace",
      icon: ShoppingBag,
      count: listingsCount > 0 ? listingsCount : undefined,
      shortcut: "1",
      description: "Browse student listings, buy & exchange",
    },
    {
      id: "topper_vault",
      label: "Topper Notes",
      shortLabel: "Topper Notes",
      icon: GraduationCap,
      count: topperNotesCount > 0 ? topperNotesCount : undefined,
      shortcut: "2",
      description: "Free handwritten notes & PYQ papers",
    },
    {
      id: "beacon_handovers",
      label: "Beacon & Handovers",
      shortLabel: "Handovers",
      icon: Radio,
      count: upcomingHandoversCount > 0 ? upcomingHandoversCount : undefined,
      shortcut: "3",
      description: "Campus drops & safe meetups",
    },
    {
      id: "chats",
      label: "Messages",
      shortLabel: "Messages",
      icon: MessageSquare,
      count: chatsCount > 0 ? chatsCount : undefined,
      shortcut: "4",
      description: "Buyer & seller threads",
    },
    {
      id: "saved",
      label: "Saved & Alerts",
      shortLabel: "Saved",
      icon: Heart,
      count: wishlistCount + alertsCount > 0 ? wishlistCount + alertsCount : undefined,
      shortcut: "5",
      description: "Wishlist & price alerts",
    },
  ];

  const currentIndex = TABS.findIndex((t) => t.id === activeTab);

  const handlePrevTab = () => {
    const base = currentIndex === -1 ? 0 : currentIndex;
    const nextIdx = (base - 1 + TABS.length) % TABS.length;
    triggerHaptic("light");
    onTabChange(TABS[nextIdx].id);
  };

  const handleNextTab = () => {
    const base = currentIndex === -1 ? -1 : currentIndex;
    const nextIdx = (base + 1) % TABS.length;
    triggerHaptic("light");
    onTabChange(TABS[nextIdx].id);
  };

  const handleSelectTab = (tabId: SectionTabId) => {
    if (tabId !== activeTab) {
      triggerHaptic("medium");
      onTabChange(tabId);
    }
  };

  return (
    <div
      id="section-navigation-tabs-container"
      className="w-full select-none"
    >
      <div
        className={`flex items-center justify-between gap-3 border-b ${
          isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"
        }`}
      >
        {/* Clean Minimal Underline Tabs */}
        <div
          role="tablist"
          aria-label="Campus Sections Navigation"
          className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar -mb-px"
        >
          {TABS.map((tab) => {
            const isActive = tab.id === activeTab;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                role="tab"
                id={`tab-button-${tab.id}`}
                type="button"
                aria-selected={isActive}
                aria-controls={`tab-panel-${tab.id}`}
                onClick={() => handleSelectTab(tab.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-2.5 text-xs sm:text-[13px] font-medium border-b-2 whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? isDark
                      ? "border-[#5BA18C] text-[#ECF2EF] font-semibold"
                      : "border-[#2F5D50] text-[#18201C] font-semibold"
                    : isDark
                    ? "border-transparent text-[#8FA199] hover:text-[#ECF2EF]"
                    : "border-transparent text-[#5C6B63] hover:text-[#18201C]"
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    isActive
                      ? isDark
                        ? "text-[#7BBFA8]"
                        : "text-[#2F5D50]"
                      : ""
                  }`}
                />
                <span>{tab.shortLabel}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[11px] font-mono tabular-nums ${
                      isActive
                        ? isDark
                          ? "text-[#7BBFA8]"
                          : "text-[#2F5D50]"
                        : isDark
                        ? "text-[#6D7E76]"
                        : "text-[#83928A]"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Subtle Prev / Next arrows for quick tab navigation */}
        <div className="hidden sm:flex items-center gap-1 pb-1.5 shrink-0">
          <button
            type="button"
            onClick={handlePrevTab}
            aria-label="Previous section"
            title="Previous section"
            className={`h-7 w-7 rounded-md border flex items-center justify-center cursor-pointer ${
              isDark
                ? "border-[#242E2A] bg-[#141A18] text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                : "border-[#DFE6E2] bg-white text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
            }`}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleNextTab}
            aria-label="Next section"
            title="Next section"
            className={`h-7 w-7 rounded-md border flex items-center justify-center cursor-pointer ${
              isDark
                ? "border-[#242E2A] bg-[#141A18] text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                : "border-[#DFE6E2] bg-white text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
            }`}
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
