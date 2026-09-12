import React from "react";
import { useTheme } from "../context/ThemeContext";

interface ListingCardSkeletonProps {
  count?: number;
}

export const ListingCardSkeleton: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div
      className={`flex flex-col rounded-2xl border-2 overflow-hidden h-full animate-pulse transition-all ${
        isDark
          ? "bg-slate-800/95 border-slate-700/90 shadow-2xl"
          : "bg-white border-slate-200/90 shadow-md"
      }`}
      aria-hidden="true"
    >
      {/* Image Skeleton with Badges Layout */}
      <div
        className={`relative h-48 w-full overflow-hidden ${
          isDark ? "bg-slate-900" : "bg-slate-100"
        }`}
      >
        {/* Shimmer overlay gradient */}
        <div
          className={`absolute inset-0 bg-gradient-to-r ${
            isDark
              ? "from-slate-900 via-slate-800/60 to-slate-900"
              : "from-slate-100 via-slate-200/60 to-slate-100"
          } animate-pulse`}
        />

        {/* Top-left Badges Placeholder */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 max-w-[75%]">
          <div
            className={`h-5 w-24 rounded-full ${
              isDark ? "bg-slate-700/80" : "bg-slate-200"
            }`}
          />
          <div
            className={`h-5 w-18 rounded-full ${
              isDark ? "bg-slate-700/70" : "bg-slate-200"
            }`}
          />
          <div
            className={`h-5 w-14 rounded-full ${
              isDark ? "bg-slate-700/70" : "bg-slate-200"
            }`}
          />
        </div>

        {/* Top-right Action Buttons Placeholder */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <div
            className={`w-8 h-8 rounded-full ${
              isDark ? "bg-slate-800/80 border border-slate-700" : "bg-white/80 border border-slate-200"
            }`}
          />
          <div
            className={`w-8 h-8 rounded-full ${
              isDark ? "bg-slate-800/80 border border-slate-700" : "bg-white/80 border border-slate-200"
            }`}
          />
        </div>

        {/* Bottom-left AI Tag Placeholder */}
        <div className="absolute bottom-2.5 left-3">
          <div
            className={`h-5 w-24 rounded-full ${
              isDark ? "bg-slate-800/90 border border-slate-700/60" : "bg-white/90 border border-slate-200"
            }`}
          />
        </div>

        {/* Bottom-right Zoom Button Placeholder */}
        <div className="absolute bottom-2.5 right-3">
          <div
            className={`h-5 w-12 rounded-lg ${
              isDark ? "bg-slate-800/90 border border-slate-700" : "bg-white/90 border border-slate-200"
            }`}
          />
        </div>
      </div>

      {/* Card Content Skeleton */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {/* Category & Expiry row */}
          <div className="flex items-center justify-between mb-2">
            <div
              className={`h-3.5 w-20 rounded ${
                isDark ? "bg-slate-700/80" : "bg-slate-200"
              }`}
            />
            <div className="flex items-center gap-2">
              <div
                className={`h-3 w-16 rounded ${
                  isDark ? "bg-slate-700/60" : "bg-slate-200"
                }`}
              />
              <div
                className={`h-3 w-14 rounded ${
                  isDark ? "bg-slate-700/60" : "bg-slate-200"
                }`}
              />
            </div>
          </div>

          {/* Title Placeholder (2 lines) */}
          <div className="space-y-1.5 mt-2">
            <div
              className={`h-4 w-5/6 rounded ${
                isDark ? "bg-slate-700" : "bg-slate-200"
              }`}
            />
            <div
              className={`h-4 w-1/2 rounded ${
                isDark ? "bg-slate-700/80" : "bg-slate-200"
              }`}
            />
          </div>

          {/* Description Placeholder (2 lines) */}
          <div className="space-y-1.5 mt-3">
            <div
              className={`h-3 w-full rounded ${
                isDark ? "bg-slate-700/50" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-3 w-3/4 rounded ${
                isDark ? "bg-slate-700/50" : "bg-slate-100"
              }`}
            />
          </div>

          {/* Tag Chips Placeholder */}
          <div className="flex items-center gap-1.5 mt-3">
            <div
              className={`h-4.5 w-14 rounded-md ${
                isDark ? "bg-slate-700/60" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-4.5 w-16 rounded-md ${
                isDark ? "bg-slate-700/60" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-4.5 w-12 rounded-md ${
                isDark ? "bg-slate-700/60" : "bg-slate-100"
              }`}
            />
          </div>

          {/* Rating Summary Box Placeholder */}
          <div
            className={`mt-3 py-2 px-2.5 rounded-lg border flex items-center justify-between ${
              isDark
                ? "bg-slate-900/60 border-slate-700/60"
                : "bg-slate-50 border-slate-200/80"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <div
                className={`w-3.5 h-3.5 rounded-sm ${
                  isDark ? "bg-slate-700" : "bg-slate-200"
                }`}
              />
              <div
                className={`h-3 w-8 rounded ${
                  isDark ? "bg-slate-700" : "bg-slate-200"
                }`}
              />
              <div
                className={`h-2.5 w-14 rounded ${
                  isDark ? "bg-slate-700/60" : "bg-slate-200"
                }`}
              />
            </div>
            <div
              className={`h-2.5 w-20 rounded ${
                isDark ? "bg-slate-700/60" : "bg-slate-200"
              }`}
            />
          </div>
        </div>

        {/* Footer: Price, Seller & Actions */}
        <div
          className={`pt-2.5 border-t space-y-3 ${
            isDark ? "border-slate-700/60" : "border-slate-200"
          }`}
        >
          {/* Price & Seller */}
          <div className="flex items-center justify-between">
            <div className="flex items-baseline gap-1">
              <div
                className={`h-6 w-16 rounded ${
                  isDark ? "bg-slate-700" : "bg-slate-200"
                }`}
              />
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`w-6 h-6 rounded-full shrink-0 ${
                  isDark ? "bg-slate-700" : "bg-slate-200"
                }`}
              />
              <div className="space-y-1">
                <div
                  className={`h-3 w-16 rounded ${
                    isDark ? "bg-slate-700" : "bg-slate-200"
                  }`}
                />
                <div
                  className={`h-2.5 w-10 rounded ${
                    isDark ? "bg-slate-700/60" : "bg-slate-200"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons Grid (Details, Chat, Meet, Share) */}
          <div className="grid grid-cols-4 gap-1.5">
            <div
              className={`h-7 rounded-xl ${
                isDark ? "bg-slate-700/60" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-7 rounded-xl ${
                isDark ? "bg-slate-700/60" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-7 rounded-xl ${
                isDark ? "bg-slate-700/60" : "bg-slate-100"
              }`}
            />
            <div
              className={`h-7 rounded-xl ${
                isDark ? "bg-slate-700/60" : "bg-slate-100"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ListingGridSkeleton: React.FC<ListingCardSkeletonProps> = ({
  count = 8,
}) => {
  return (
    <div
      id="marketplace-skeleton-grid"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6"
      aria-label="Loading campus marketplace items..."
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={`listing-skeleton-${index}`} className="h-full flex flex-col">
          <ListingCardSkeleton />
        </div>
      ))}
    </div>
  );
};
