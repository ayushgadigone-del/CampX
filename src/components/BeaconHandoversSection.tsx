import React from "react";
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ShieldCheck,
  ExternalLink,
  Package,
} from "lucide-react";
import { Listing } from "../types";
import { useTheme } from "../context/ThemeContext";
import { CampusLiveTicker } from "./CampusLiveTicker";

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
  onSelectItem,
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
    <div id="beacon-handovers-section-container" className="w-full space-y-6">
      {/* Live Campus Beacon Ticker Bar */}
      <div
        className={`rounded-2xl overflow-hidden border ${
          isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"
        }`}
      >
        <CampusLiveTicker onSelectItem={onSelectItem} />
      </div>

      {/* Grid of Handovers & Safe Spots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Scheduled Handovers (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex flex-wrap items-end justify-between gap-2 px-1">
            <div className="space-y-0.5 text-left">
              <p
                className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
                }`}
              >
                CAMPUS MEETUPS
              </p>
              <h3
                className={`text-lg sm:text-xl font-normal tracking-tight flex items-center gap-2 ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                <span>Scheduled Student Handovers</span>
                <span
                  className={`text-xs font-mono ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  ({handovers.length})
                </span>
              </h3>
            </div>
            <span
              className={`text-xs font-medium ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
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
                    className={`p-4 rounded-2xl border cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                      isDark
                        ? "bg-[#141A18] hover:bg-[#19211E] border-[#242E2A] hover:border-[#34433D]"
                        : "bg-white hover:bg-[#F9FBFA] border-[#DFE6E2] hover:border-[#C4D1CA]"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-12 h-12 rounded-xl overflow-hidden shrink-0 border ${
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

                      <div className="space-y-1 min-w-0 text-left">
                        <h4
                          className={`text-xs sm:text-sm font-semibold truncate ${
                            isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                          }`}
                        >
                          {item.title}
                        </h4>
                        <div
                          className={`flex flex-wrap items-center gap-2 text-[11px] ${
                            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                          }`}
                        >
                          <span
                            className={`flex items-center gap-1 font-semibold ${
                              isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                            }`}
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>
                              {details.scheduledDate} at {details.scheduledTime}
                            </span>
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <MapPin
                              className={`w-3.5 h-3.5 ${
                                isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
                              }`}
                            />
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
                No Handovers Scheduled Yet
              </h4>
              <p
                className={`text-xs max-w-sm mx-auto ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                When you initiate a deal or chat with a student seller, click &ldquo;Schedule Handover&rdquo; to sync a safe campus meetup to Google Calendar.
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
