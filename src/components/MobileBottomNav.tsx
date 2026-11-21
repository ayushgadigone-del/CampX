import React from "react";
import {
  ShoppingBag,
  GraduationCap,
  Plus,
  Radio,
  Heart,
  MessageSquare,
} from "lucide-react";
import { SectionTabId } from "./SectionNavigationTabs";
import { useTheme } from "../context/ThemeContext";
import { triggerHaptic } from "../utils/haptics";

interface MobileBottomNavProps {
  activeTab: SectionTabId;
  onTabChange: (tab: SectionTabId) => void;
  onOpenCreateModal: () => void;
  wishlistCount: number;
  chatsCount: number;
  isOnline?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onTabChange,
  onOpenCreateModal,
  wishlistCount,
  chatsCount,
  isOnline = true,
}) => {
  const { isDark } = useTheme();

  const handleSelectTab = (tab: SectionTabId) => {
    triggerHaptic("light");
    onTabChange(tab);
    window.scrollTo(0, 0);
  };

  const handleCreateClick = () => {
    if (!isOnline) return;
    triggerHaptic("heavy");
    onOpenCreateModal();
  };

  const tabClass = (tab: SectionTabId) =>
    `flex-1 flex flex-col items-center justify-center py-1.5 cursor-pointer ${
      activeTab === tab
        ? isDark
          ? "text-[#7BBFA8] font-semibold"
          : "text-[#2F5D50] font-semibold"
        : isDark
        ? "text-[#8FA199] hover:text-[#ECF2EF]"
        : "text-[#5C6B63] hover:text-[#18201C]"
    }`;

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      aria-label="Mobile Bottom Navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t select-none ${
        isDark
          ? "bg-[#0D1110] border-[#242E2A] text-[#8FA199]"
          : "bg-white border-[#DFE6E2] text-[#5C6B63]"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-1 h-14 max-w-lg mx-auto">
        <button
          type="button"
          onClick={() => handleSelectTab("marketplace")}
          className={tabClass("marketplace")}
        >
          <ShoppingBag className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Market</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("topper_vault")}
          className={tabClass("topper_vault")}
        >
          <GraduationCap className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Notes</span>
        </button>

        <button
          type="button"
          onClick={handleCreateClick}
          disabled={!isOnline}
          aria-label="Post an item"
          className="flex-1 flex flex-col items-center justify-center py-1.5 cursor-pointer disabled:opacity-40"
        >
          <span
            className={`w-7 h-7 rounded-lg flex items-center justify-center mb-0.5 ${
              isDark ? "bg-[#387262] text-white" : "bg-[#2F5D50] text-white"
            }`}
          >
            <Plus className="w-4 h-4" />
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("beacon_handovers")}
          className={tabClass("beacon_handovers")}
        >
          <Radio className="w-4 h-4 mb-0.5" />
          <span className="text-[10px]">Beacon</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("chats")}
          className={tabClass("chats")}
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4 mb-0.5" />
            {chatsCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono font-semibold tabular-nums">
                {chatsCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Chats</span>
        </button>

        <button
          type="button"
          onClick={() => handleSelectTab("saved")}
          className={tabClass("saved")}
        >
          <div className="relative">
            <Heart
              className={`w-4 h-4 mb-0.5 ${
                wishlistCount > 0 ? "fill-current" : ""
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 text-[9px] font-mono font-semibold tabular-nums">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px]">Saved</span>
        </button>
      </div>
    </nav>
  );
};
