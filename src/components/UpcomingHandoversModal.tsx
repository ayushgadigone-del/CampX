import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  ExternalLink,
  X,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Package,
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
  onSelectListingForCalendar,
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

  // Filter listings that have local scheduled handovers
  const listingsWithHandover = listings.filter((l) => l.handoverDetails);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <motion.div
            id="upcoming-handovers-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-8 ${
              isDark
                ? "bg-[#0B0F19] border-slate-800 text-slate-100"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Header */}
            <div
              className={`flex items-center justify-between px-6 py-4 border-b ${
                isDark
                  ? "border-slate-800 bg-slate-900/80"
                  : "border-slate-100 bg-slate-50/80"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
                  <CalendarIcon className="w-5 h-5" />
                </div>
                <div>
                  <h2
                    className={`text-lg font-bold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                  >
                    Campus Handovers
                  </h2>
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
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
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
                  }`}
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                </button>
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    isDark
                      ? "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                      : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
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
                        className={`p-4 rounded-xl border transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isDark
                            ? "border-blue-900/40 bg-blue-950/20 hover:bg-blue-950/30"
                            : "border-blue-100 bg-blue-50/40 hover:bg-blue-50"
                        }`}
                      >
                        <div className="space-y-1">
                          <h4
                            className={`text-sm font-bold flex items-center gap-1.5 ${
                              isDark ? "text-slate-100" : "text-slate-900"
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
                            {evt.summary}
                          </h4>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
                            <span
                              className={`flex items-center gap-1 ${
                                isDark ? "text-slate-400" : "text-slate-600"
                              }`}
                            >
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {startTime}
                            </span>
                            {evt.location && (
                              <span
                                className={`flex items-center gap-1 ${
                                  isDark ? "text-slate-400" : "text-slate-600"
                                }`}
                              >
                                <MapPin className="w-3.5 h-3.5 text-rose-500" />
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
                            className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shrink-0 shadow-2xs ${
                              isDark
                                ? "bg-blue-600 hover:bg-blue-500 text-white"
                                : "bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white"
                            }`}
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
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Item Handover Appointments
                  </span>
                  {listingsWithHandover.map((l) => (
                    <div
                      key={l.id}
                      className={`p-4 rounded-xl border flex items-center justify-between gap-3 ${
                        isDark
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={l.imageUrl}
                          alt={l.title}
                          className="w-12 h-12 rounded-lg object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <h4
                            className={`text-sm font-bold ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            {l.title}
                          </h4>
                          <span
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-slate-500"
                            }`}
                          >
                            {l.handoverDetails?.scheduledDate} at{" "}
                            {l.handoverDetails?.scheduledTime} •{" "}
                            {l.handoverDetails?.location}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {onOpenDetails && (
                          <button
                            onClick={() => {
                              onClose();
                              onOpenDetails(l);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                              isDark
                                ? "bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
                            }`}
                            title="Leave student feedback or review this handover"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                            <span>Rate / Review</span>
                          </button>
                        )}
                        {l.handoverDetails?.calendarLink && (
                          <a
                            href={l.handoverDetails.calendarLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1"
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
                        ? "bg-slate-800 text-slate-400"
                        : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <h3
                    className={`text-sm font-bold ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    No Handovers Scheduled Yet
                  </h3>
                  <p
                    className={`text-xs max-w-sm mx-auto ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    When you or another student schedule an item inspection & handover, it will appear here and sync directly to Google Calendar.
                  </p>
                </div>
              )}

              {error && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isDark
                      ? "bg-amber-950/40 border-amber-800/60 text-amber-300"
                      : "bg-amber-50 border-amber-200 text-amber-900"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
