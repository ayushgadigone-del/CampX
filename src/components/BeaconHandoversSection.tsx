import React, { useMemo, useState } from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Package,
  CheckCircle2,
  Users,
  ArrowRight,
  Search,
  X,
} from "lucide-react";
import { Listing } from "../types";
import { useTheme } from "../context/ThemeContext";

type HandoverFilter = "all" | "scheduled" | "completed";

interface BeaconHandoversSectionProps {
  listings: Listing[];
  onOpenDetails: (listing: Listing) => void;
  onOpenCalendar: (listing: Listing) => void;
  onSelectItem?: (query: string) => void;
  isOnline?: boolean;
}

const formatDisplayDate = (dateStr?: string, fallbackIso?: string): string => {
  const raw = dateStr || fallbackIso;
  if (!raw) return "Campus Meetup";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatDisplayTime = (timeStr?: string): string => {
  if (!timeStr) return "";
  const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return timeStr;
  const h = Number(match[1]);
  const m = match[2];
  const suffix = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${m} ${suffix}`;
};

export const BeaconHandoversSection: React.FC<BeaconHandoversSectionProps> = ({
  listings,
  onOpenDetails,
}) => {
  const { isDark } = useTheme();
  const [statusFilter, setStatusFilter] = useState<HandoverFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Gather ALL scheduled and completed handovers across all students on campus
  const allCampusHandovers = useMemo(() => {
    return listings
      .filter(
        (l) =>
          l.status === "handover_scheduled" ||
          l.status === "completed" ||
          Boolean(l.handoverDetails)
      )
      .sort((a, b) => {
        const aIsScheduled = a.status !== "completed";
        const bIsScheduled = b.status !== "completed";
        if (aIsScheduled !== bIsScheduled) return aIsScheduled ? -1 : 1;

        const aTime = new Date(
          a.handoverDetails?.scheduledDate ||
            a.handoverDetails?.completedAt ||
            a.createdAt
        ).getTime();
        const bTime = new Date(
          b.handoverDetails?.scheduledDate ||
            b.handoverDetails?.completedAt ||
            b.createdAt
        ).getTime();
        return bTime - aTime;
      });
  }, [listings]);

  const counts = useMemo(() => {
    let scheduled = 0;
    let completed = 0;
    for (const item of allCampusHandovers) {
      if (item.status === "completed") {
        completed += 1;
      } else {
        scheduled += 1;
      }
    }
    return {
      all: allCampusHandovers.length,
      scheduled,
      completed,
    };
  }, [allCampusHandovers]);

  const filteredHandovers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allCampusHandovers.filter((item) => {
      if (statusFilter === "scheduled" && item.status === "completed") {
        return false;
      }
      if (statusFilter === "completed" && item.status !== "completed") {
        return false;
      }
      if (q) {
        const buyer =
          item.handoverDetails?.buyerName ||
          item.reviews?.[0]?.reviewerName ||
          "";
        const spot =
          item.handoverDetails?.location || item.locationPreference || "";
        const haystack = [
          item.title,
          item.sellerName,
          buyer,
          spot,
          item.category,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [allCampusHandovers, statusFilter, searchQuery]);

  const SAFE_CAMPUS_SPOTS = [
    {
      name: "Central Library Quad",
      timing: "9:00 AM - 6:00 PM",
      desc: "High footfall, security cameras, benches for inspection.",
      recommendedFor: "Books & Scientific Calculators",
    },
    {
      name: "Mechanical Workshop Practice Shed",
      timing: "10:00 AM - 5:00 PM",
      desc: "Open area with test tables for drafters and kits.",
      recommendedFor: "Engineering Drafters & Hardware",
    },
    {
      name: "Main Building Foyer / Ground Floor",
      timing: "8:30 AM - 7:00 PM",
      desc: "Well-lit security checkpoint near administrative office.",
      recommendedFor: "Cycles, Bags & Lab Equipment",
    },
    {
      name: "College Canteen Plaza",
      timing: "11:00 AM - 4:30 PM",
      desc: "Casual daytime rendezvous with peer presence.",
      recommendedFor: "Quick Barter & Notes Exchange",
    },
  ];

  const filterTabs: { id: HandoverFilter; label: string; count: number }[] = [
    { id: "all", label: "All Handovers", count: counts.all },
    { id: "scheduled", label: "Scheduled", count: counts.scheduled },
    { id: "completed", label: "Completed", count: counts.completed },
  ];

  return (
    <div id="beacon-handovers-section-container" className="w-full space-y-6">

      {/* Grid of Handovers & Safe Spots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Campus-Wide Scheduled & Completed Handovers (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2 px-1">
            <div className="space-y-0.5 text-left">
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
                }`}
              >
                CAMPUS MEETUPS · ALL STUDENTS
              </p>
              <h3
                className={`text-lg sm:text-xl font-normal tracking-tight flex items-center gap-2 ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                <span>Campus Handovers</span>
                <span
                  className={`text-xs font-mono ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  ({counts.all})
                </span>
              </h3>
            </div>
            <span
              className={`text-xs font-medium ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Scheduled &amp; completed across campus
            </span>
          </div>

          {/* Filter Tabs + Search Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Filter campus handovers by status"
              className="flex flex-wrap items-center gap-2"
            >
              {filterTabs.map((tab) => {
                const isActive = statusFilter === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`handovers-filter-${tab.id}`}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`h-9 px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? isDark
                          ? "bg-[#387262] text-white border-[#387262]"
                          : "bg-[#2F5D50] text-white border-[#2F5D50]"
                        : isDark
                        ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A] hover:bg-[#1B2320] hover:border-[#34433D]"
                        : "bg-white text-[#18201C] border-[#DFE6E2] hover:bg-[#EFF4F1] hover:border-[#C4D1CA]"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span
                      className={`min-w-[18px] h-4 px-1 rounded-full text-[10px] font-mono tabular-nums inline-flex items-center justify-center ${
                        isActive
                          ? "bg-white/20 text-white"
                          : isDark
                          ? "bg-[#1B2320] text-[#8FA199]"
                          : "bg-[#EFF4F1] text-[#5C6B63]"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative sm:w-60">
              <Search
                className={`w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${
                  isDark ? "text-[#8FA199]" : "text-[#7C8B83]"
                }`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search item, student, spot..."
                className={`w-full h-9 pl-8 pr-7 rounded-xl border text-xs focus:outline-none ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#73847D]"
                    : "bg-white border-[#DFE6E2] focus:border-[#2F5D50] text-[#18201C] placeholder:text-[#7C8B83]"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  aria-label="Clear handover search"
                  className={`absolute right-2 top-1/2 -translate-y-1/2 p-0.5 cursor-pointer ${
                    isDark ? "text-[#8FA199] hover:text-[#ECF2EF]" : "text-[#5C6B63] hover:text-[#18201C]"
                  }`}
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>

          {filteredHandovers.length > 0 ? (
            <div className="space-y-3">
              {filteredHandovers.map((item) => {
                const details = item.handoverDetails;
                const isCompleted = item.status === "completed";
                const buyerName =
                  details?.buyerName ||
                  item.reviews?.[0]?.reviewerName ||
                  "Campus Student";
                const handoverLocation =
                  details?.location ||
                  item.reviews?.[0]?.handoverLocation ||
                  item.locationPreference ||
                  "Central Library Quad";
                const displayDate = formatDisplayDate(
                  details?.scheduledDate || details?.completedAt,
                  item.reviews?.[0]?.createdAt || item.createdAt
                );
                const displayTime = formatDisplayTime(details?.scheduledTime);

                return (
                  <div
                    key={item.id}
                    id={`campus-handover-card-${item.id}`}
                    onClick={() => onOpenDetails(item)}
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDark
                        ? "bg-[#141A18] hover:bg-[#19211E] border-[#242E2A] hover:border-[#34433D]"
                        : "bg-white hover:bg-[#F9FBFA] border-[#DFE6E2] hover:border-[#C4D1CA]"
                    }`}
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      <div
                        className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border ${
                          isDark
                            ? "bg-[#1B2320] border-[#242E2A]"
                            : "bg-[#EFF4F1] border-[#DFE6E2]"
                        }`}
                      >
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className={`w-full h-full flex items-center justify-center ${
                              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                            }`}
                          >
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 min-w-0 text-left">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                              isCompleted
                                ? isDark
                                  ? "bg-[#251F15] text-[#DFC29B] border-[#4A3B23]"
                                  : "bg-[#FDF6EC] text-[#9E6B43] border-[#EED8B8]"
                                : isDark
                                ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                                : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3" />
                            )}
                            <span>{isCompleted ? "Completed" : "Scheduled"}</span>
                          </span>

                          <span
                            className={`text-xs font-mono font-semibold ${
                              isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                            }`}
                          >
                            {item.listingType === "exchange"
                              ? "Campus Swap"
                              : `₹${item.price.toLocaleString("en-IN")}`}
                          </span>
                        </div>

                        <h4
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                          }`}
                        >
                          {item.title}
                        </h4>

                        {/* Participants: Seller -> Buyer */}
                        <div
                          className={`flex flex-wrap items-center gap-1.5 text-[11px] ${
                            isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                          }`}
                        >
                          <Users
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                            }`}
                          />
                          <span className="font-medium">{item.sellerName}</span>
                          <ArrowRight
                            className={`w-3 h-3 shrink-0 ${
                              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                            }`}
                          />
                          <span className="font-medium">{buyerName}</span>
                          {details?.buyerDepartment && (
                            <span
                              className={`text-[10px] ${
                                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                              }`}
                            >
                              ({details.buyerDepartment})
                            </span>
                          )}
                        </div>

                        {/* Date, Time & Campus Spot */}
                        <div
                          className={`flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] ${
                            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                          }`}
                        >
                          <span
                            className={`flex items-center gap-1 font-medium ${
                              isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                            }`}
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                            <span>
                              {displayDate}
                              {displayTime ? ` · ${displayTime}` : ""}
                            </span>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin
                              className={`w-3.5 h-3.5 ${
                                isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
                              }`}
                            />
                            <span>{handoverLocation}</span>
                          </span>
                        </div>

                        {details?.notes && (
                          <p
                            className={`text-[11px] leading-snug line-clamp-1 ${
                              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                            }`}
                          >
                            {details.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {!isCompleted && details?.calendarLink ? (
                        <a
                          href={details.calendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-semibold inline-flex items-center gap-1.5 ${
                            isDark
                              ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40] hover:bg-[#1F352E]"
                              : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1] hover:bg-[#E5EEE9]"
                          }`}
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Google Cal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenDetails(item);
                          }}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                            isDark
                              ? "bg-[#1B2320] text-[#ECF2EF] border-[#242E2A] hover:bg-[#222D29]"
                              : "bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2] hover:bg-[#E5EEE9]"
                          }`}
                        >
                          View Item
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`p-8 text-center rounded-2xl border space-y-2 ${
                isDark
                  ? "bg-[#141A18] border-[#242E2A]"
                  : "bg-white border-[#DFE6E2]"
              }`}
            >
              <CalendarIcon
                className={`w-8 h-8 mx-auto ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              />
              <h4
                className={`text-sm font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                No matching handovers found
              </h4>
              <p
                className={`text-xs max-w-sm mx-auto ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                Try switching between Scheduled and Completed tabs or clearing your search.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Safe Campus Meetup Locations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span
              className={`p-1.5 rounded-lg ${
                isDark
                  ? "bg-[#182823] text-[#7BBFA8]"
                  : "bg-[#EFF4F1] text-[#2F5D50]"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3
              className={`text-sm sm:text-base font-semibold ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Safe Campus Meetup Spots
            </h3>
          </div>

          <div className="space-y-2.5">
            {SAFE_CAMPUS_SPOTS.map((spot, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-xl border text-xs space-y-1.5 text-left ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A] text-[#8FA199]"
                    : "bg-white border-[#DFE6E2] text-[#5C6B63]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`font-semibold flex items-center gap-1.5 ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  >
                    <MapPin
                      className={`w-3.5 h-3.5 shrink-0 ${
                        isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                      }`}
                    />
                    <span>{spot.name}</span>
                  </span>
                  <span
                    className={`text-[10px] font-mono font-semibold shrink-0 ${
                      isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                    }`}
                  >
                    {spot.timing}
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed">{spot.desc}</p>
                <div className="pt-0.5">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                      isDark
                        ? "bg-[#1B2320] text-[#ECF2EF] border-[#242E2A]"
                        : "bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2]"
                    }`}
                  >
                    Best for: {spot.recommendedFor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
