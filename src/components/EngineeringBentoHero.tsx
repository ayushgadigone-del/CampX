import React from "react";
import { Plus, Sparkles, GraduationCap } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface EngineeringBentoHeroProps {
  totalListingsCount: number;
  totalActiveStock?: number;
  availableCount?: number;
  topperNotesCount?: number;
  upcomingHandoversCount?: number;
  isOnline?: boolean;
  onOpenCreateListing?: () => void;
  onOpenCreateModal?: () => void;
  onOpenAIInspector: () => void;
  onOpenTopperNotes: () => void;
  onOpenWishlist?: () => void;
  onOpenYourChats?: () => void;
  onOpenAlerts?: () => void;
  onFocusSearch?: () => void;
  onSelectCategory: (cat: any) => void;
  selectedCategory?: string;
}

export const EngineeringBentoHero: React.FC<EngineeringBentoHeroProps> = ({
  totalListingsCount,
  totalActiveStock,
  onOpenCreateListing,
  onOpenCreateModal,
  onOpenAIInspector,
  onOpenTopperNotes,
}) => {
  const { isDark } = useTheme();
  const handleCreate = onOpenCreateListing || onOpenCreateModal || (() => {});
  const activeCount = totalActiveStock !== undefined ? totalActiveStock : totalListingsCount;

  return (
    <section
      id="pvg-engineering-resale-section"
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-2"
    >
      <div
        className={`w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b ${
          isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"
        }`}
      >
        <div className="space-y-2 max-w-2xl text-left">
          <div
            className={`text-xs font-medium flex flex-wrap items-center gap-2 ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          >
            <span>PVG&apos;s COET, Pune</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{activeCount} items available</span>
            <span aria-hidden="true">·</span>
            <span>@pvgcoet.ac.in</span>
          </div>

          <h1
            className={`text-2xl sm:text-3xl font-bold tracking-tight ${
              isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
            }`}
          >
            Student-to-student campus resale
          </h1>

          <p
            className={`text-sm leading-relaxed ${
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
            }`}
          >
            Buy, sell, or swap engineering textbooks, calculators, drafters, lab equipment, and cycles directly on campus with zero commission.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCreate}
            className={`h-9 px-4 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isDark
                ? "bg-[#387262] hover:bg-[#448573] text-white"
                : "bg-[#2F5D50] hover:bg-[#244A3F] text-white"
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Item</span>
          </button>

          <button
            type="button"
            onClick={onOpenAIInspector}
            className={`h-9 px-3.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isDark
                ? "bg-[#141A18] hover:bg-[#1B2320] text-[#ECF2EF] border-[#242E2A]"
                : "bg-white hover:bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2]"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`} />
            <span>AI Inspector</span>
          </button>

          <button
            type="button"
            onClick={onOpenTopperNotes}
            className={`h-9 px-3.5 rounded-lg border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              isDark
                ? "bg-[#141A18] hover:bg-[#1B2320] text-[#ECF2EF] border-[#242E2A]"
                : "bg-white hover:bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2]"
            }`}
          >
            <GraduationCap className={`w-3.5 h-3.5 ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`} />
            <span>Topper Notes</span>
          </button>
        </div>
      </div>
    </section>
  );
};
