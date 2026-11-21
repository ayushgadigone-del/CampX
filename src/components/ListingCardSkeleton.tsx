import React from "react";
import { useTheme } from "../context/ThemeContext";

interface ListingCardSkeletonProps {
  count?: number;
  layoutMode?: "grid" | "detailed";
}

export const ListingCardSkeleton: React.FC<{ layoutMode?: "grid" | "detailed" }> = ({
  layoutMode = "grid",
}) => {
  const { isDark } = useTheme();
  const block = isDark ? "bg-zinc-800" : "bg-zinc-200";
  const soft = isDark ? "bg-zinc-900" : "bg-zinc-100";

  if (layoutMode === "detailed") {
    return (
      <div
        className={`flex flex-col md:flex-row rounded-xl border overflow-hidden h-full ${
          isDark ? "bg-[#111113] border-zinc-800" : "bg-white border-zinc-200"
        }`}
        aria-hidden="true"
      >
        <div className={`md:w-64 lg:w-72 shrink-0 aspect-[4/3] md:aspect-auto ${soft}`} />
        <div className="p-5 flex-1 flex flex-col justify-between gap-4">
          <div className="space-y-2.5">
            <div className={`h-3 w-40 rounded ${soft}`} />
            <div className={`h-5 w-3/4 rounded ${block}`} />
            <div className={`h-3.5 w-full rounded ${soft}`} />
            <div className={`h-3.5 w-2/3 rounded ${soft}`} />
          </div>
          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
            <div className={`h-4 w-28 rounded ${soft}`} />
            <div className={`h-8 w-36 rounded-lg ${block}`} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col rounded-xl border overflow-hidden h-full ${
        isDark ? "bg-[#111113] border-zinc-800" : "bg-white border-zinc-200"
      }`}
      aria-hidden="true"
    >
      <div className={`aspect-[4/3] w-full ${soft}`} />
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div className="space-y-2">
          <div className={`h-3 w-28 rounded ${soft}`} />
          <div className={`h-4 w-5/6 rounded ${block}`} />
          <div className={`h-5 w-20 rounded ${block}`} />
        </div>
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
          <div className={`h-3 w-24 rounded ${soft}`} />
          <div className={`h-8 w-full rounded-lg ${soft}`} />
        </div>
      </div>
    </div>
  );
};

export const ListingGridSkeleton: React.FC<ListingCardSkeletonProps> = ({
  count = 8,
  layoutMode = "grid",
}) => {
  return (
    <div
      id="marketplace-skeleton-grid"
      className={
        layoutMode === "detailed"
          ? "grid grid-cols-1 lg:grid-cols-2 gap-5"
          : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
      }
      aria-label="Loading campus marketplace items"
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={`listing-skeleton-${index}`} className="h-full flex flex-col">
          <ListingCardSkeleton layoutMode={layoutMode} />
        </div>
      ))}
    </div>
  );
};
