import React from "react";
import {
  Radio,
  Flame,
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Package,
} from "lucide-react";
import { Listing } from "../types";
import { useTheme } from "../context/ThemeContext";
import { CampusLiveTicker } from "./CampusLiveTicker";
import { triggerHaptic } from "../utils/haptics";

interface BeaconHandoversSectionProps {
  listings: Listing[];
  onOpenDetails: (listing: Listing) => void;
  onOpenCalendar: (listing: Listing) => void;
  onSelectItem?: (query: string) => void;
  isOnline?: boolean;
}

export const BeaconHandoversSection: React.FC<BeaconHandoversSectionProps> = ({
  listings,
  onOpenDetails,
  onOpenCalendar,
  onSelectItem,
  isOnline = true,
}) => {
  const { isDark } = useTheme();

  // Find all listings with upcoming handover events scheduled
  const handovers = listings.filter((l) => l.handoverDetails);

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

  return (
    <div
      id="beacon-handovers-section-container"
      className="w-full space-y-6 animate-in fade-in duration-200"
    >
      {/* Live Campus Beacon Ticker Bar */}
      <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
        <CampusLiveTicker onSelectItem={onSelectItem} />
      </div>

      {/* Grid of Handovers & Safe Spots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Handovers (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <CalendarIcon className="w-4 h-4" />
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                Scheduled Student Handovers ({handovers.length})
              </h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Google Calendar Synced
            </span>
          </div>

          {handovers.length > 0 ? (
            <div className="space-y-3">
              {handovers.map((item) => {
                const details = item.handoverDetails!;
                return (
                  <div
                    key={item.id}
                    onClick={() => onOpenDetails(item)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md ${
                      isDark
                        ? "bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-indigo-500/40"
                        : "bg-white hover:bg-slate-50 border-slate-200 hover:border-indigo-300 shadow-xs"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <Package className="w-5 h-5" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {item.title}
                        </h4>
                        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="flex items-center gap-1 font-semibold text-indigo-600 dark:text-indigo-400">
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {details.scheduledDate} at {details.scheduledTime}
                            </span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-rose-500" />
                            <span>{details.location}</span>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      {details.calendarLink && (
                        <a
                          href={details.calendarLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-colors ${
                            isDark
                              ? "bg-blue-500/15 text-blue-300 border-blue-500/30 hover:bg-blue-500/25"
                              : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                          }`}
                        >
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>Google Cal</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className={`p-8 text-center rounded-2xl border space-y-2 ${
                isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
              }`}
            >
              <CalendarIcon className="w-8 h-8 mx-auto text-slate-400" />
              <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                No Handovers Scheduled Yet
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you initiate a deal or chat with a student seller, click &ldquo;Schedule Handover&rdquo; to sync a safe campus meetup to Google Calendar.
              </p>
            </div>
          )}
        </div>

        {/* Right Column: Safe Campus Meetup Locations */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Safe Campus Meetup Spots
            </h3>
          </div>

          <div className="space-y-2.5">
            {SAFE_CAMPUS_SPOTS.map((spot, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                  isDark
                    ? "bg-slate-900/70 border-slate-800 text-slate-300"
                    : "bg-white border-slate-200 text-slate-700 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{spot.name}</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                    {spot.timing}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  {spot.desc}
                </p>
                <div className="pt-1">
                  <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-semibold bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20">
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
