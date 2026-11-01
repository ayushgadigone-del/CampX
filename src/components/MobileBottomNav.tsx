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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCreateClick = () => {
    if (!isOnline) return;
    triggerHaptic("heavy");
    onOpenCreateModal();
  };

  return (
    <nav
      id="mobile-bottom-navigation-bar"
      aria-label="Mobile Bottom Navigation"
      className={`md:hidden fixed bottom-0 left-0 right-0 z-40 border-t backdrop-blur-xl transition-colors select-none shadow-[0_-4px_20px_rgba(0,0,0,0.1)] ${
        isDark
          ? "bg-[#0A0E17]/95 border-slate-800 text-slate-300"
          : "bg-white/95 border-slate-200 text-slate-700"
      }`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="flex items-center justify-around px-2 py-1.5 h-14 max-w-lg mx-auto">
        {/* 1. Market Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab("marketplace")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
            activeTab === "marketplace"
              ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] tracking-tight">Market</span>
          {activeTab === "marketplace" && (
            <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
          )}
        </button>

        {/* 2. Notes Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab("topper_vault")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
            activeTab === "topper_vault"
              ? "text-emerald-600 dark:text-emerald-400 font-extrabold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <GraduationCap className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-1 -right-2 px-1 text-[7.5px] font-black rounded-full bg-emerald-500 text-white leading-none py-0.5">
              Free
            </span>
          </div>
          <span className="text-[10px] tracking-tight">Notes</span>
          {activeTab === "topper_vault" && (
            <span className="w-1 h-1 rounded-full bg-emerald-600 dark:bg-emerald-400 mt-0.5" />
          )}
        </button>

        {/* 3. Center Action: Post Item Button (Raised CTA with Haptics) */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleCreateClick}
            disabled={!isOnline}
            aria-label="Post an item for sale or swap (Shortcut: P)"
            title="Post an item (Shortcut: P)"
            className={`w-11 h-11 -mt-5 rounded-full flex items-center justify-center text-white shadow-lg transition-transform active:scale-95 cursor-pointer relative ${
              !isOnline
                ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                : "bg-gradient-to-tr from-indigo-600 to-purple-600 shadow-indigo-600/40 ring-4 ring-white dark:ring-slate-900"
            }`}
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
            <kbd className="absolute -bottom-1 text-[7px] font-mono font-bold px-1 rounded-full bg-slate-900/90 text-white border border-white/30">
              P
            </kbd>
          </button>
          <span className="text-[9px] font-bold mt-1 text-indigo-600 dark:text-indigo-400">
            Post
          </span>
        </div>

        {/* 4. Beacon & Handovers Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab("beacon_handovers")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
            activeTab === "beacon_handovers"
              ? "text-amber-600 dark:text-amber-400 font-extrabold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Radio className="w-5 h-5 mb-0.5" />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </div>
          <span className="text-[10px] tracking-tight">Beacon</span>
          {activeTab === "beacon_handovers" && (
            <span className="w-1 h-1 rounded-full bg-amber-600 dark:bg-amber-400 mt-0.5" />
          )}
        </button>

        {/* 5. Chats & Messages Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab("chats")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
            activeTab === "chats"
              ? "text-indigo-600 dark:text-indigo-400 font-extrabold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            {chatsCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[8px] font-black rounded-full bg-indigo-600 text-white leading-none py-0.5">
                {chatsCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Chats</span>
          {activeTab === "chats" && (
            <span className="w-1 h-1 rounded-full bg-indigo-600 dark:bg-indigo-400 mt-0.5" />
          )}
        </button>

        {/* 6. Saved & Alerts Tab */}
        <button
          type="button"
          onClick={() => handleSelectTab("saved")}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors relative cursor-pointer ${
            activeTab === "saved"
              ? "text-rose-600 dark:text-rose-400 font-extrabold"
              : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
          }`}
        >
          <div className="relative">
            <Heart
              className={`w-5 h-5 mb-0.5 ${
                wishlistCount > 0 ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-2 px-1 text-[8px] font-black rounded-full bg-rose-600 text-white leading-none py-0.5">
                {wishlistCount}
              </span>
            )}
          </div>
          <span className="text-[10px] tracking-tight">Saved</span>
          {activeTab === "saved" && (
            <span className="w-1 h-1 rounded-full bg-rose-600 dark:bg-rose-400 mt-0.5" />
          )}
        </button>
      </div>
    </nav>
  );
};
