import React from "react";
import { ArrowUpRight } from "lucide-react";
import { ItemCategory } from "../types";
import { useTheme } from "../context/ThemeContext";

interface MarketplaceCategoryGridProps {
  selectedCategory?: ItemCategory | "All";
  onSelectCategory: (category: ItemCategory | "All") => void;
  categoryStockCounts?: Record<string, number>;
  isDark?: boolean;
  sectionId?: string;
}

interface CategoryTileConfig {
  id: ItemCategory;
  title: string;
  subtitle: string;
  renderIcon: () => React.ReactNode;
}

const CATEGORY_TILES: CategoryTileConfig[] = [
  {
    id: "Books",
    title: "Books",
    subtitle: "Textbooks & notes",
    renderIcon: () => (
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect x="3" y="5" width="7" height="16" rx="1.5" fill="#4CAF50" />
        <rect x="4.5" y="7" width="4" height="2" rx="0.5" fill="#C8E6C9" />
        <rect x="9.5" y="7" width="7" height="15" rx="1.5" fill="#E53935" />
        <rect x="11" y="9" width="4" height="2" rx="0.5" fill="#FFCDD2" />
        <rect x="16" y="9" width="7" height="14" rx="1.5" fill="#3B82F6" />
        <rect x="17.5" y="11" width="4" height="2" rx="0.5" fill="#DBEAFE" />
      </svg>
    ),
  },
  {
    id: "Calculators",
    title: "Calculators",
    subtitle: "Scientific & more",
    renderIcon: () => (
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect
          x="4"
          y="5"
          width="20"
          height="18"
          rx="3"
          fill="#FFF3E0"
          stroke="#E65100"
          strokeWidth="2"
        />
        <line x1="6" y1="10" x2="22" y2="10" stroke="#94A3B8" strokeWidth="1.4" />
        <line x1="6" y1="14" x2="22" y2="14" stroke="#94A3B8" strokeWidth="1.4" />
        <line x1="6" y1="18" x2="22" y2="18" stroke="#94A3B8" strokeWidth="1.4" />
        <circle cx="9.5" cy="10" r="1.6" fill="#2563EB" />
        <circle cx="13.5" cy="10" r="1.6" fill="#2563EB" />
        <circle cx="18.5" cy="10" r="1.6" fill="#F59E0B" />
        <circle cx="9.5" cy="14" r="1.6" fill="#10B981" />
        <circle cx="15" cy="14" r="1.6" fill="#10B981" />
        <circle cx="18.5" cy="14" r="1.6" fill="#EF4444" />
        <circle cx="10.5" cy="18" r="1.6" fill="#8B5CF6" />
        <circle cx="14.5" cy="18" r="1.6" fill="#8B5CF6" />
        <circle cx="18.5" cy="18" r="1.6" fill="#0EA5E9" />
      </svg>
    ),
  },
  {
    id: "Lab Equipment",
    title: "Lab Equipment",
    subtitle: "Tools & instruments",
    renderIcon: () => (
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <rect x="6" y="21" width="16" height="3" rx="1.5" fill="#64748B" />
        <path
          d="M16 11C19 11 21 13.5 21 16.5C21 19 19 21 16 21"
          stroke="#475569"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <rect
          x="12.5"
          y="4.5"
          width="4.5"
          height="10.5"
          rx="1.2"
          transform="rotate(20 12.5 4.5)"
          fill="#7C3AED"
        />
        <rect x="8.5" y="16.5" width="7.5" height="2" rx="1" fill="#334155" />
      </svg>
    ),
  },
  {
    id: "Cycles",
    title: "Cycles",
    subtitle: "Ride around campus",
    renderIcon: () => (
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="8" cy="18.5" r="4.2" stroke="#334155" strokeWidth="2" />
        <circle cx="20" cy="18.5" r="4.2" stroke="#334155" strokeWidth="2" />
        <path
          d="M8 18.5L12.5 11.5H17.5L20 18.5M12.5 11.5L15 18.5H8"
          stroke="#DC2626"
          strokeWidth="1.9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M11 9.5H14M17.5 11.5L18.5 9H21"
          stroke="#475569"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "Bags",
    title: "Bags",
    subtitle: "Everyday essentials",
    renderIcon: () => (
      <svg
        width="26"
        height="26"
        viewBox="0 0 28 28"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M11 8V6.5C11 5.1 12.1 4 13.5 4H14.5C15.9 4 17 5.1 17 6.5V8"
          stroke="#BE123C"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="6.5" y="7.5" width="15" height="16.5" rx="4.5" fill="#F43F5E" />
        <rect x="9.5" y="14.5" width="9" height="6.5" rx="2" fill="#E11D48" />
        <line
          x1="11"
          y1="16.8"
          x2="17"
          y2="16.8"
          stroke="#FDA4AF"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    ),
  },
  {
    id: "Other",
    title: "Other",
    subtitle: "Find something useful",
    renderIcon: () => (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M12 2.5L14.4 9.6L21.5 12L14.4 14.4L12 21.5L9.6 14.4L2.5 12L9.6 9.6L12 2.5Z"
          className="fill-[#18201C] dark:fill-[#ECF2EF]"
        />
      </svg>
    ),
  },
];

export const MarketplaceCategoryGrid: React.FC<MarketplaceCategoryGridProps> = ({
  selectedCategory = "All",
  onSelectCategory,
  categoryStockCounts,
  isDark: isDarkProp,
  sectionId = "explore-categories-section",
}) => {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp !== undefined ? isDarkProp : themeIsDark;

  return (
    <section id={sectionId} className="w-full space-y-5">
      {/* Editorial Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
        <div className="space-y-1 text-left">
          <p
            className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
              isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
            }`}
          >
            EXPLORE THE MARKETPLACE
          </p>
          <div className="flex flex-wrap items-baseline gap-3">
            <h2
              className={`text-2xl sm:text-[32px] font-normal tracking-tight leading-tight ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Find your category.
            </h2>
            {selectedCategory !== "All" && (
              <button
                type="button"
                onClick={() => onSelectCategory("All")}
                className={`text-xs font-medium underline underline-offset-4 cursor-pointer ${
                  isDark
                    ? "text-[#7BBFA8] hover:text-[#ECF2EF]"
                    : "text-[#2F5D50] hover:text-[#244A3F]"
                }`}
              >
                Show all
              </button>
            )}
          </div>
        </div>

        <p
          className={`text-xs sm:text-sm ${
            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
          }`}
        >
          A little bit of everything.
        </p>
      </div>

      {/* 3x2 Category Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORY_TILES.map((tile) => {
          const isSelected = selectedCategory === tile.id;
          const count = categoryStockCounts ? categoryStockCounts[tile.id] : undefined;

          return (
            <button
              key={tile.id}
              id={`category-tile-${tile.id.toLowerCase().replace(/\s+/g, "-")}`}
              type="button"
              onClick={() =>
                onSelectCategory(isSelected ? "All" : tile.id)
              }
              aria-pressed={isSelected}
              className={`w-full text-left rounded-2xl border p-5 sm:p-6 flex flex-col justify-between gap-5 cursor-pointer ${
                isSelected
                  ? isDark
                    ? "bg-[#182420] border-[#5BA18C]"
                    : "bg-[#EFF4F1] border-[#2F5D50]"
                  : isDark
                  ? "bg-[#141A18] border-[#242E2A] hover:border-[#34433D] hover:bg-[#19211E]"
                  : "bg-white border-[#DFE6E2] hover:border-[#C4D1CA] hover:bg-[#F9FBFA]"
              }`}
            >
              <div className="flex items-start justify-between gap-3 w-full">
                <div className="w-8 h-8 flex items-center justify-start">
                  {tile.renderIcon()}
                </div>
                <ArrowUpRight
                  className={`w-4 h-4 shrink-0 ${
                    isSelected
                      ? isDark
                        ? "text-[#7BBFA8]"
                        : "text-[#2F5D50]"
                      : isDark
                      ? "text-[#C89B6E]"
                      : "text-[#9E6B43]"
                  }`}
                />
              </div>

              <div className="flex items-end justify-between gap-2 w-full">
                <div className="space-y-0.5">
                  <h3
                    className={`text-[15px] font-semibold tracking-tight ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  >
                    {tile.title}
                  </h3>
                  <p
                    className={`text-xs ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    {tile.subtitle}
                  </p>
                </div>

                {typeof count === "number" && (
                  <span
                    className={`text-[11px] font-mono tabular-nums shrink-0 ${
                      isSelected
                        ? isDark
                          ? "text-[#7BBFA8] font-semibold"
                          : "text-[#2F5D50] font-semibold"
                        : isDark
                        ? "text-[#8FA199]"
                        : "text-[#5C6B63]"
                    }`}
                  >
                    {count} {count === 1 ? "item" : "items"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
