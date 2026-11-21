import React, { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
  X,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Star,
} from "lucide-react";
import {
  fetchUpcomingHandoverEvents,
  GoogleCalendarEventResponse,
} from "../lib/calendar";
import { Listing } from "../types";
import { useTheme } from "../context/ThemeContext";

interface UpcomingHandoversModalProps {
  isOpen: boolean;
  onClose: () => void;
  listings: Listing[];
  onSelectListingForCalendar: (listing: Listing) => void;
  onOpenDetails?: (listing: Listing) => void;
}

export const UpcomingHandoversModal: React.FC<UpcomingHandoversModalProps> = ({
  isOpen,
  onClose,
  listings,
  onOpenDetails,
}) => {
  const { isDark } = useTheme();
  const [events, setEvents] = useState<GoogleCalendarEventResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await fetchUpcomingHandoverEvents();
      setEvents(items);
    } catch (e: any) {
      setError(e.message || "Failed to load Google Calendar events.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadEvents();
    }
  }, [isOpen]);

  const listingsWithHandover = listings.filter((l) => l.handoverDetails);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto">
      <div
        id="upcoming-handovers-modal"
        className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-8 ${
          isDark
            ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
            : "bg-white border-[#DFE6E2] text-[#18201C]"
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark
              ? "border-[#242E2A] bg-[#111715]"
              : "border-[#DFE6E2] bg-[#F3F5F2]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#2F5D50] dark:bg-[#387262] text-white">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div className="text-left">
              <h2
                className={`text-base sm:text-lg font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Campus Handovers
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                Scheduled buyer-seller meetups synced with Google Calendar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadEvents}
              disabled={loading}
              title="Refresh events from Google Calendar"
              className={`p-2 rounded-lg cursor-pointer ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                  : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
              }`}
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg cursor-pointer ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                  : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {events.length > 0 ? (
            <div className="space-y-3">
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.12em] block text-left ${
                  isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
                }`}
              >
                Google Calendar Events ({events.length})
              </span>
              {events.map((evt) => {
                const startTime = evt.start?.dateTime
                  ? new Date(evt.start.dateTime).toLocaleString([], {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "Scheduled Handover";

                return (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isDark
                        ? "border-[#2A4A40] bg-[#182823]"
                        : "border-[#C4D9D1] bg-[#EFF4F1]"
                    }`}
                  >
                    <div className="space-y-1 text-left">
                      <h4
                        className={`text-sm font-semibold flex items-center gap-1.5 ${
                          isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                        }`}
                      >
                        <CheckCircle2
                          className={`w-4 h-4 shrink-0 ${
                            isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                          }`}
                        />
                        {evt.summary}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                        <span
                          className={`flex items-center gap-1 ${
                            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                          }`}
                        >
                          <Clock className="w-3.5 h-3.5" />
                          {startTime}
                        </span>
                        {evt.location && (
                          <span
                            className={`flex items-center gap-1 ${
                              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                            }`}
                          >
                            <MapPin className="w-3.5 h-3.5" />
                            {evt.location}
                          </span>
                        )}
                      </div>
                    </div>

                    {evt.htmlLink && (
                      <a
                        href={evt.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white"
                      >
                        View in Calendar
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                );
              })}
            </div>
          ) : listingsWithHandover.length > 0 ? (
            <div className="space-y-3">
              <span
                className={`text-[11px] font-semibold uppercase tracking-[0.12em] block text-left ${
                  isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
                }`}
              >
                Item Handover Appointments
              </span>
              {listingsWithHandover.map((l) => (
                <div
                  key={l.id}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isDark
                      ? "border-[#242E2A] bg-[#111715]"
                      : "border-[#DFE6E2] bg-[#F7F9F8]"
                  }`}
                >
                  <div className="flex items-center gap-3 text-left">
                    <img
                      src={l.imageUrl}
                      alt={l.title}
                      className="w-12 h-12 rounded-lg object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4
                        className={`text-sm font-semibold ${
                          isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                        }`}
                      >
                        {l.title}
                      </h4>
                      <span
                        className={`text-xs ${
                          isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                        }`}
                      >
                        {l.handoverDetails?.scheduledDate} at{" "}
                        {l.handoverDetails?.scheduledTime} ·{" "}
                        {l.handoverDetails?.location}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenDetails && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenDetails(l);
                        }}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer border ${
                          isDark
                            ? "bg-[#251F15] hover:bg-[#31281B] text-[#DFC29B] border-[#4A3B23]"
                            : "bg-[#FDF6EC] hover:bg-[#F7EAD5] text-[#9E6B43] border-[#EED8B8]"
                        }`}
                        title="Leave student feedback or review this handover"
                      >
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>Rate / Review</span>
                      </button>
                    )}
                    {l.handoverDetails?.calendarLink && (
                      <a
                        href={l.handoverDetails.calendarLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white text-xs font-semibold flex items-center gap-1"
                      >
                        Calendar Link
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 space-y-3">
              <div
                className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center ${
                  isDark
                    ? "bg-[#1B2320] text-[#7BBFA8]"
                    : "bg-[#EFF4F1] text-[#2F5D50]"
                }`}
              >
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3
                className={`text-sm font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                No Handovers Scheduled Yet
              </h3>
              <p
                className={`text-xs max-w-sm mx-auto ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                When you or another student schedule an item inspection &amp; handover, it will appear here and sync directly to Google Calendar.
              </p>
            </div>
          )}

          {error && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isDark
                  ? "bg-[#251F15] border-[#4A3B23] text-[#DFC29B]"
                  : "bg-[#FDF6EC] border-[#EED8B8] text-[#9E6B43]"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
