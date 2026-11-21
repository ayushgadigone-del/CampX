import React, { useState, useEffect } from "react";
import {
  X,
  Bell,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Zap,
  Tag,
  Search,
  ExternalLink,
  History,
  Sliders,
  Check,
} from "lucide-react";
import { AlertSubscription, AlertMatchEvent, ItemCategory, Listing } from "../types";
import { useTheme } from "../context/ThemeContext";

interface AlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: AlertSubscription[];
  onUpdateAlerts: (alerts: AlertSubscription[]) => void;
  onSimulateListing: (alert: AlertSubscription) => void;
  prefilledKeyword?: string;
  prefilledCategory?: ItemCategory | "All";
  onViewListing: (listing: Listing) => void;
  alertHistory: AlertMatchEvent[];
  onClearHistory: () => void;
}

const CATEGORY_OPTIONS: (ItemCategory | "All")[] = [
  "All",
  "Calculators",
  "Books",
  "Lab Equipment",
  "Cycles",
  "Bags",
  "Other",
];

const PRESET_ALERTS = [
  { keyword: "Casio Calculator", category: "Calculators" as const, maxPrice: 500 },
  { keyword: "Mini Drafter", category: "Lab Equipment" as const, maxPrice: 400 },
  { keyword: "B.S. Grewal", category: "Books" as const, maxPrice: 300 },
  { keyword: "Campus Cycle", category: "Cycles" as const, maxPrice: 1800 },
  { keyword: "Vernier Caliper", category: "Lab Equipment" as const, maxPrice: 350 },
  { keyword: "Laptop Bag", category: "Bags" as const, maxPrice: 450 },
];

export const AlertsModal: React.FC<AlertsModalProps> = ({
  isOpen,
  onClose,
  alerts,
  onUpdateAlerts,
  onSimulateListing,
  prefilledKeyword = "",
  prefilledCategory = "All",
  onViewListing,
  alertHistory,
  onClearHistory,
}) => {
  const { isDark } = useTheme();
  const [keyword, setKeyword] = useState(prefilledKeyword);
  const [category, setCategory] = useState<ItemCategory | "All">(prefilledCategory);
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"alerts" | "history">("alerts");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledKeyword) setKeyword(prefilledKeyword);
    if (prefilledCategory) setCategory(prefilledCategory);
  }, [prefilledKeyword, prefilledCategory]);

  const handleAddAlert = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanKeyword = keyword.trim();
    if (!cleanKeyword && category === "All") {
      return;
    }

    const newAlert: AlertSubscription = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      keyword: cleanKeyword,
      category,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      active: true,
      createdAt: new Date().toISOString(),
      matchCount: 0,
    };

    const updated = [newAlert, ...alerts];
    onUpdateAlerts(updated);
    setJustAddedId(newAlert.id);
    setTimeout(() => setJustAddedId(null), 3000);

    // Reset inputs
    setKeyword("");
    setMaxPrice("");
  };

  const handleApplyPreset = (preset: {
    keyword: string;
    category: ItemCategory;
    maxPrice?: number;
  }) => {
    setKeyword(preset.keyword);
    setCategory(preset.category);
    if (preset.maxPrice) {
      setMaxPrice(preset.maxPrice.toString());
    } else {
      setMaxPrice("");
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = alerts.map((a) =>
      a.id === id ? { ...a, active: !a.active } : a
    );
    onUpdateAlerts(updated);
  };

  const handleDeleteAlert = (id: string) => {
    const updated = alerts.filter((a) => a.id !== id);
    onUpdateAlerts(updated);
  };

  if (!isOpen) return null;

  return (
        <div
          id="alerts-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto"
          onClick={onClose}
        >
          <div
            id="alerts-modal-content"
            className={`relative w-full max-w-2xl rounded-3xl shadow-2xl border overflow-hidden my-6 ${
              isDark
                ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] shadow-black/60"
                : "bg-white border-[#DFE6E2] text-[#18201C] shadow-[#18201C]/10"
            }`}
            onClick={(e) => e.stopPropagation()}
          >
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-[#2F5D50] dark:bg-[#23473D] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  'Notify Me' Listing Alerts
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F4EFE6] text-[#1E3B33] uppercase tracking-wider">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-[#D5E6DF]">
                Get an instant on-screen toast notification whenever matching equipment is posted
              </p>
            </div>
          </div>
          <button
            id="close-alerts-modal-btn"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className={`flex border-b px-6 pt-3 gap-2 ${
          isDark
            ? "border-[#242E2A] bg-[#141A18]"
            : "border-[#DFE6E2] bg-[#F7F9F8]"
        }`}>
          <button
            onClick={() => setActiveTab("alerts")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "alerts"
                ? "border-[#5BA18C] text-[#7BBFA8]"
                : isDark
                ? "border-transparent text-[#8FA199] hover:text-[#ECF2EF]"
                : "border-transparent text-[#5C6B63] hover:text-[#18201C]"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Alerts ({alerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "border-[#5BA18C] text-[#7BBFA8]"
                : isDark
                ? "border-transparent text-[#8FA199] hover:text-[#ECF2EF]"
                : "border-transparent text-[#5C6B63] hover:text-[#18201C]"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Matched Alerts History</span>
            {alertHistory.length > 0 && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                isDark
                  ? "bg-[#182823] text-[#7BBFA8] border border-[#2A4A40]"
                  : "bg-[#EFF4F1] text-[#2F5D50]"
              }`}>
                {alertHistory.length}
              </span>
            )}
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === "alerts" ? (
            <>
              {/* Alert Creation Box */}
              <div className={`p-5 rounded-2xl border shadow-2xs space-y-4 ${
                isDark
                  ? "bg-[#141A18] border-[#242E2A]"
                  : "bg-[#EFF4F1] border-[#C4D9D1]"
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-1.5 text-xs font-extrabold ${
                    isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                  }`}>
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Create a New Custom Alert</span>
                  </div>
                  <span className={`text-[11px] ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                    Monitors live posts across campus
                  </span>
                </div>

                <form onSubmit={handleAddAlert} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Keyword Input */}
                    <div className="sm:col-span-6 relative">
                      <Search className="w-3.5 h-3.5 text-[#8FA199] absolute left-3 top-3" />
                      <input
                        id="alert-keyword-input"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Keyword: e.g. 'Casio Calculator', 'B.S. Grewal'..."
                        className={`w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F5D50] font-medium ${
                          isDark
                            ? "bg-[#0D1110] border-[#242E2A] text-white placeholder:text-[#5C6B63]"
                            : "bg-white border-[#C4D1CA] text-[#18201C] placeholder:text-[#8FA199]"
                        }`}
                      />
                    </div>

                    {/* Category Selector */}
                    <div className="sm:col-span-3">
                      <select
                        id="alert-category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className={`w-full px-2.5 py-2 text-xs rounded-xl border font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
                          isDark
                            ? "bg-[#0D1110] border-[#242E2A] text-[#ECF2EF]"
                            : "bg-white border-[#C4D1CA] text-[#5C6B63]"
                        }`}
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat} className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}>
                            {cat === "All" ? "All Categories" : cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Max Budget Threshold */}
                    <div className="sm:col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-[#8FA199]">
                          ₹
                        </span>
                        <input
                          id="alert-maxprice-input"
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="Max Price Threshold"
                          min={0}
                          className={`w-full pl-7 pr-3 py-2 text-xs rounded-xl border focus:outline-none focus:ring-2 focus:ring-[#2F5D50] font-medium ${
                            isDark
                              ? "bg-[#0D1110] border-[#242E2A] text-white placeholder:text-[#5C6B63]"
                              : "bg-white border-[#C4D1CA] text-[#18201C] placeholder:text-[#8FA199]"
                          }`}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Budget Quick-Select Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}>
                      Budget Threshold:
                    </span>
                    {[
                      { label: "≤ ₹300", val: "300" },
                      { label: "≤ ₹500", val: "500" },
                      { label: "≤ ₹800", val: "800" },
                      { label: "≤ ₹1,500", val: "1500" },
                    ].map((b) => (
                      <button
                        key={b.val}
                        type="button"
                        onClick={() => setMaxPrice(b.val)}
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors cursor-pointer ${
                          maxPrice === b.val
                            ? "bg-[#2F5D50] text-white border-[#5BA18C] shadow-xs"
                            : isDark
                            ? "bg-[#0D1110] text-[#C5D3CC] border-[#242E2A] hover:bg-[#182823] hover:border-[#5BA18C]"
                            : "bg-white text-[#5C6B63] border-[#DFE6E2] hover:bg-[#EFF4F1] hover:text-[#2F5D50] hover:border-[#C4D9D1]"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                    {maxPrice && (
                      <button
                        type="button"
                        onClick={() => setMaxPrice("")}
                        className="text-[10px] font-semibold text-[#8FA199] hover:text-rose-500 ml-1 cursor-pointer"
                      >
                        Clear budget
                      </button>
                    )}
                  </div>

                  {/* Preset Pills */}
                  <div className="space-y-1.5 pt-1">
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}>
                      Popular Student Presets (With Budgets):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_ALERTS.map((preset) => (
                        <button
                          key={preset.keyword}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border shadow-2xs transition-all cursor-pointer flex items-center gap-1 ${
                            isDark
                              ? "bg-[#0D1110] hover:bg-[#2F5D50] text-[#ECF2EF] hover:text-white border-[#242E2A]"
                              : "bg-white hover:bg-[#2F5D50] hover:text-white text-[#5C6B63] border-[#DFE6E2]"
                          }`}
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>
                            {preset.keyword} (≤ ₹{preset.maxPrice})
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex items-center justify-between pt-1">
                    <p className={`text-[11px] ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                      {maxPrice
                        ? `🎯 Only notify when priced ≤ ₹${maxPrice}`
                        : "🔔 Notifies for all matching items (any budget)"}
                    </p>
                    <button
                      id="submit-alert-btn"
                      type="submit"
                      disabled={!keyword.trim() && category === "All"}
                      className="px-4 py-2 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] disabled:bg-[#DFE6E2] dark:disabled:bg-[#242E2A] disabled:text-[#8FA199] text-white text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>Set Alert</span>
                    </button>
                  </div>
                </form>
              </div>

              {/* Active Alerts List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className={`text-xs font-extrabold flex items-center gap-1.5 ${
                    isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                  }`}>
                    <Tag className="w-3.5 h-3.5 text-[#2F5D50]" />
                    <span>Your Active Subscriptions ({alerts.length})</span>
                  </h3>
                  <span className={`text-[11px] ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                    Triggers on-screen toast on new post
                  </span>
                </div>

                {alerts.length === 0 ? (
                  <div className={`p-8 text-center rounded-2xl border border-dashed space-y-2 ${
                    isDark
                      ? "bg-[#141A18] border-[#242E2A]"
                      : "bg-[#F7F9F8] border-[#C4D1CA]"
                  }`}>
                    <Bell className="w-8 h-8 text-[#5C6B63] mx-auto" />
                    <p className={`text-xs font-bold ${isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"}`}>
                      No active alerts set
                    </p>
                    <p className={`text-[11px] max-w-sm mx-auto ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                      Choose a preset above or type in what you need (e.g., 'Casio Calculator') so you never miss a deal!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {alerts.map((alert) => (
                      <div
                        key={alert.id}
                        id={`alert-row-${alert.id}`}
                        className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          justAddedId === alert.id
                            ? isDark
                              ? "bg-[#182823] border-[#5BA18C] shadow-sm"
                              : "bg-[#EFF4F1] border-[#C4D9D1] shadow-sm"
                            : alert.active
                            ? isDark
                              ? "bg-[#141A18] border-[#242E2A] hover:border-[#5BA18C] shadow-2xs"
                              : "bg-white border-[#DFE6E2] hover:border-[#C4D9D1] shadow-2xs"
                            : isDark
                            ? "bg-[#141A18] border-[#242E2A] opacity-60"
                            : "bg-[#F7F9F8] border-[#DFE6E2] opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              alert.active
                                ? isDark
                                  ? "bg-amber-500/20 text-[#DFC29B]"
                                  : "bg-[#FDF6EC] text-[#9E6B43]"
                                : isDark
                                ? "bg-[#1B2320] text-[#5C6B63]"
                                : "bg-[#DFE6E2] text-[#8FA199]"
                            }`}
                          >
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={`text-sm font-bold ${isDark ? "text-white" : "text-[#18201C]"}`}>
                                {alert.keyword || "All Items in Category"}
                              </span>
                              {alert.category && (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isDark
                                    ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                                    : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                                }`}>
                                  {alert.category === "All" ? "Any Category" : alert.category}
                                </span>
                              )}
                              {alert.maxPrice !== undefined && alert.maxPrice > 0 ? (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${
                                  isDark
                                    ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                                    : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                                }`}>
                                  🎯 Budget: ≤ ₹{alert.maxPrice}
                                </span>
                              ) : (
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-medium border ${
                                  isDark
                                    ? "bg-[#1B2320] text-[#8FA199] border-[#242E2A]"
                                    : "bg-[#EFF4F1] text-[#5C6B63] border border-[#DFE6E2]"
                                }`}>
                                  Budget: Any
                                </span>
                              )}
                            </div>
                            <div className={`flex items-center gap-2 mt-1 text-[11px] ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                              <span>
                                Status:{" "}
                                <strong className={alert.active ? (isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]") : "text-[#5C6B63]"}>
                                  {alert.active ? "Listening" : "Paused"}
                                </strong>
                              </span>
                              <span>•</span>
                              <span>
                                Matches: <strong>{alert.matchCount || 0}</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action buttons on alert */}
                        <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                          {/* Test simulation button to verify toast */}
                          <button
                            type="button"
                            onClick={() => onSimulateListing(alert)}
                            title="Simulate posting a matching item to test the on-screen toast"
                            className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors shadow-2xs cursor-pointer ${
                              isDark
                                ? "bg-[#251F15] hover:bg-[#251F15] text-[#DFC29B] border-[#4A3B23]"
                                : "bg-[#FDF6EC] hover:bg-[#FDF6EC] text-[#9E6B43] border-[#EED8B8]"
                            }`}
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-500" />
                            <span>Test Alert</span>
                          </button>

                          {/* Toggle Active Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(alert.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              alert.active
                                ? isDark
                                  ? "bg-[#1B2320] text-[#ECF2EF] border-[#242E2A] hover:bg-[#222D29]"
                                  : "bg-white text-[#5C6B63] border-[#C4D1CA] hover:bg-[#EFF4F1]"
                                : isDark
                                ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                                : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                            }`}
                          >
                            {alert.active ? "Pause" : "Resume"}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-1.5 rounded-xl text-[#8FA199] hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Delete alert"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* History Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xs font-extrabold ${isDark ? "text-white" : "text-[#18201C]"}`}>
                    Recent Matched Items Triggered by Alerts
                  </h3>
                  <p className={`text-[11px] ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                    Items that satisfied your alert criteria when posted
                  </p>
                </div>
                {alertHistory.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs font-bold text-rose-500 hover:text-rose-600 cursor-pointer"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {alertHistory.length === 0 ? (
                <div className={`p-8 text-center rounded-2xl border border-dashed space-y-2 ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A]"
                    : "bg-[#F7F9F8] border-[#C4D1CA]"
                }`}>
                  <History className="w-8 h-8 text-[#5C6B63] mx-auto" />
                  <p className={`text-xs font-bold ${isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"}`}>No alert triggers yet</p>
                  <p className={`text-[11px] max-w-sm mx-auto ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                    When someone lists an item matching your keywords or you click 'Test Alert', it will show up here!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alertHistory.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 shadow-2xs ${
                        isDark
                          ? "bg-[#141A18] border-[#242E2A] hover:border-[#5BA18C]"
                          : "bg-white border-[#DFE6E2] hover:border-[#C4D9D1]"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.listing.imageUrl}
                          alt={item.listing.title}
                          className="w-12 h-12 rounded-xl object-cover border border-[#242E2A] shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isDark ? "text-white" : "text-[#18201C]"}`}>
                              {item.listing.title}
                            </span>
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                              isDark
                                ? "bg-[#251F15] text-[#DFC29B] border border-[#4A3B23]"
                                : "bg-[#FDF6EC] text-[#9E6B43]"
                            }`}>
                              Matched: "{item.alertKeyword}"
                            </span>
                          </div>
                          <div className={`flex items-center gap-2 mt-0.5 text-[11px] ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                            <span className="font-bold text-[#7BBFA8]">
                              ₹{item.listing.price}
                            </span>
                            <span>•</span>
                            <span>Seller: {item.listing.sellerName}</span>
                            <span>•</span>
                            <span>
                              {new Date(item.timestamp).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onViewListing(item.listing);
                          onClose();
                        }}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors shrink-0 cursor-pointer ${
                          isDark
                            ? "bg-[#182823] hover:bg-[#182823] text-[#7BBFA8] border border-[#2A4A40]"
                            : "bg-[#EFF4F1] hover:bg-[#EFF4F1] text-[#2F5D50]"
                        }`}
                      >
                        <span>View Item</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className={`px-6 py-4 border-t flex items-center justify-between ${
          isDark
            ? "border-[#242E2A] bg-[#141A18] text-[#8FA199]"
            : "border-[#DFE6E2] bg-[#F7F9F8] text-[#5C6B63]"
        }`}>
          <div className="flex items-center gap-1.5 text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#2F5D50] shrink-0" />
            <span>Alerts automatically check all newly posted items in real-time</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
