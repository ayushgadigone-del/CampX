import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useTheme } from "../context/ThemeContext";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  UserCheck,
  ShieldCheck,
  Loader2,
} from "lucide-react";
import { Listing } from "../types";
import {
  createHandoverCalendarEvent,
  GoogleCalendarEventResponse,
} from "../lib/calendar";

interface CalendarHandoverModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing;
  currentUserEmail?: string;
  currentUserName?: string;
  otherPartyName: string;
  otherPartyEmail?: string;
  onEventCreated?: (event: GoogleCalendarEventResponse, location: string, date: string, time: string) => void;
}

const CAMPUS_LOCATIONS = [
  "Central Library Quad",
  "College Main Canteen Porch",
  "Workshop Practice Shed 2",
  "Academic Block Entrance",
  "Hostel Common Lawn",
  "Sports Ground Pavilion",
  "Department Computer Lab Porch",
];

export const CalendarHandoverModal: React.FC<CalendarHandoverModalProps> = ({
  isOpen,
  onClose,
  listing,
  otherPartyName,
  otherPartyEmail,
  onEventCreated,
}) => {
  const { isDark } = useTheme();
  // Tomorrow at 11:00 AM as default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split("T")[0];

  const [date, setDate] = useState<string>(defaultDateStr);
  const [time, setTime] = useState<string>("11:00");
  const [location, setLocation] = useState<string>(
    listing.locationPreference || "Central Library Quad"
  );
  const [notes, setNotes] = useState<string>(
    "Meet to inspect condition, test functions, and complete payment/exchange."
  );

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [createdEvent, setCreatedEvent] = useState<GoogleCalendarEventResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showExplicitConfirmation, setShowExplicitConfirmation] = useState<boolean>(false);

  const handleInitiateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time || !location) {
      setError("Please specify handover date, time, and campus location.");
      return;
    }
    setError(null);
    setShowExplicitConfirmation(true);
  };

  const handleConfirmCreateEvent = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const event = await createHandoverCalendarEvent({
        itemTitle: listing.title,
        itemPrice: listing.price,
        location,
        startDate: date,
        startTime: time,
        otherPartyName: otherPartyName || listing.sellerName,
        otherPartyEmail: otherPartyEmail || listing.sellerEmail,
        notes,
      });

      setCreatedEvent(event);
      setShowExplicitConfirmation(false);
      if (onEventCreated) {
        onEventCreated(event, location, date, time);
      }
    } catch (err: any) {
      console.error("Calendar creation failed:", err);
      setError(err.message || "Failed to create Google Calendar event.");
      setShowExplicitConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            id="calendar-handover-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-6 max-h-[92vh] flex flex-col ${
              isDark
                ? "bg-[#0B0F19] text-slate-100 border-slate-800 shadow-black/70"
                : "bg-white text-slate-900 border-slate-200 shadow-slate-300/40"
            }`}
          >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b shrink-0 ${
            isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-100 bg-slate-50/80"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-sm">
              <CalendarIcon className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-lg font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Schedule Campus Handover
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    isDark
                      ? "bg-blue-950/60 text-blue-300 border-blue-800"
                      : "bg-blue-100 text-blue-800 border-blue-200"
                  }`}
                >
                  Google Calendar
                </span>
              </div>
              <p
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Synchronize an in-person item inspection & handover directly to your calendar
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {createdEvent ? (
            <div className="text-center py-6 space-y-4 animate-in fade-in duration-300">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3
                  className={`text-xl font-bold ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  Handover Scheduled on Google Calendar!
                </h3>
                <p
                  className={`text-sm mt-1 max-w-md mx-auto ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  An event has been placed in your Google Calendar with reminders set 30 and 60 minutes prior.
                </p>
              </div>

              <div
                className={`p-4 rounded-xl border text-left text-xs space-y-2 max-w-md mx-auto ${
                  isDark ? "bg-slate-900/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Event:</span>
                  <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {createdEvent.summary}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Date & Time:</span>
                  <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {date} at {time}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Location:</span>
                  <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {location}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Meeting Peer:</span>
                  <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {otherPartyName}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-col sm:flex-row gap-3 justify-center">
                {createdEvent.htmlLink && (
                  <a
                    href={createdEvent.htmlLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition-all"
                  >
                    Open in Google Calendar
                    <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={onClose}
                  className={`px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-800 text-slate-200 hover:text-white"
                      : "border-slate-300 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Done
                </button>
              </div>
            </div>
          ) : showExplicitConfirmation ? (
            /* Explicit User Confirmation Modal required by Workspace skill */
            <div className="space-y-5 animate-in fade-in duration-200">
              <div
                className={`p-4 rounded-xl border text-sm flex items-start gap-3 ${
                  isDark
                    ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
                    : "bg-amber-50 border-amber-200 text-amber-900"
                }`}
              >
                <ShieldCheck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold block">
                    Confirm Google Calendar Event Creation
                  </span>
                  <p
                    className={`text-xs leading-relaxed ${
                      isDark ? "text-amber-300/80" : "text-amber-800"
                    }`}
                  >
                    With your permission, this action will create an event on your primary Google Calendar with notifications and details:
                  </p>
                </div>
              </div>

              <div
                className={`rounded-xl border p-4 text-xs space-y-2 ${
                  isDark ? "bg-slate-900/70 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Event Title:</span>
                  <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    Campus Handover: {listing.title}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Date & Time:</span>
                  <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {date} ({time}) - 30 minutes
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Location:</span>
                  <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {location}, College Campus
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Partner:</span>
                  <span className={`font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                    {otherPartyName} ({otherPartyEmail || "Peer"})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className={isDark ? "text-slate-400" : "text-slate-500"}>Item Price:</span>
                  <span className="font-semibold text-emerald-500">₹{listing.price}</span>
                </div>
              </div>

              {error && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isDark
                      ? "bg-red-950/40 border-red-500/30 text-red-200"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmCreateEvent}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Adding to Calendar...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Confirm & Create Calendar Event
                    </>
                  )}
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setShowExplicitConfirmation(false)}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                    isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Back
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleInitiateSchedule} className="space-y-4">
              {/* Item Summary Banner */}
              <div
                className={`flex items-center gap-3 p-3 rounded-xl border ${
                  isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
                }`}
              >
                <img
                  src={listing.imageUrl}
                  alt={listing.title}
                  className="w-12 h-12 rounded-lg object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="min-w-0 flex-1">
                  <h4
                    className={`text-xs font-bold truncate ${
                      isDark ? "text-slate-200" : "text-slate-800"
                    }`}
                  >
                    {listing.title}
                  </h4>
                  <div
                    className={`flex items-center gap-2 text-xs mt-0.5 ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <span className="font-semibold text-emerald-500">₹{listing.price}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-indigo-400" />
                      {otherPartyName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center gap-1 ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    <CalendarIcon className="w-3.5 h-3.5 text-blue-500" />
                    Handover Date
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    min={new Date().toISOString().split("T")[0]}
                    onChange={(e) => setDate(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-100"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>

                <div>
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center gap-1 ${
                      isDark ? "text-slate-200" : "text-slate-700"
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    Handover Time
                  </label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-100"
                        : "bg-white border-slate-300 text-slate-900"
                    }`}
                  />
                </div>
              </div>

              {/* Campus Location Dropdown */}
              <div>
                <label
                  className={`block text-xs font-bold mb-1 flex items-center gap-1 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Selected Campus Handover Spot</span>
                </label>
                <select
                  id="calendar-handover-spot-select"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs font-medium ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100"
                      : "bg-white border-slate-300 text-slate-800"
                  }`}
                >
                  {CAMPUS_LOCATIONS.map((loc) => (
                    <option
                      key={loc}
                      value={loc}
                      className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-800"}
                    >
                      {loc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Notes */}
              <div>
                <label
                  className={`block text-xs font-bold mb-1 ${
                    isDark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Handover Notes / Inspection Checklist
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g., Bring UPI / cash, will test calculator functions on spot"
                  className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                      : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                  }`}
                />
              </div>

              {error && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    isDark
                      ? "bg-red-950/40 border-red-500/30 text-red-200"
                      : "bg-red-50 border-red-200 text-red-700"
                  }`}
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Review & Schedule on Google Calendar
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                    isDark
                      ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                      : "border-slate-300 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
