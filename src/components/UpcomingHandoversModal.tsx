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
  Package,
  Star,
} from "lucide-react";
import {
  fetchUpcomingHandoverEvents,
  GoogleCalendarEventResponse,
} from "../lib/calendar";
import { Listing } from "../types";

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

  if (!isOpen) return null;

  // Filter listings that have local scheduled handovers
  const listingsWithHandover = listings.filter((l) => l.handoverDetails);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        id="upcoming-handovers-modal"
        className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                My Campus Handovers
              </h2>
              <p className="text-xs text-slate-500">
                Scheduled buyer-seller meetups synced with Google Calendar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={loadEvents}
              disabled={loading}
              title="Refresh events from Google Calendar"
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
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
                    className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 hover:bg-blue-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        {evt.summary}
                      </h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {startTime}
                        </span>
                        {evt.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-red-400" />
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
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-blue-200 text-blue-700 hover:bg-blue-600 hover:text-white text-xs font-bold transition-colors shrink-0 shadow-2xs"
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
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={l.imageUrl}
                      alt={l.title}
                      className="w-12 h-12 rounded-lg object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{l.title}</h4>
                      <span className="text-xs text-slate-500">
                        {l.handoverDetails?.scheduledDate} at {l.handoverDetails?.scheduledTime} • {l.handoverDetails?.location}
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
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
                        className="p-2 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold flex items-center gap-1 hover:bg-blue-200"
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
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                No Handovers Scheduled Yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When you or another student schedule an item inspection & handover, it will appear here and sync directly to Google Calendar.
              </p>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
