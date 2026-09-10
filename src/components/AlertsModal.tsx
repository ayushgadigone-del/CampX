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
  const [keyword, setKeyword] = useState(prefilledKeyword);
  const [category, setCategory] = useState<ItemCategory | "All">(prefilledCategory);
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"alerts" | "history">("alerts");
  const [justAddedId, setJustAddedId] = useState<string | null>(null);

  useEffect(() => {
    if (prefilledKeyword) setKeyword(prefilledKeyword);
    if (prefilledCategory) setCategory(prefilledCategory);
  }, [prefilledKeyword, prefilledCategory]);

  if (!isOpen) return null;

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

  return (
    <div
      id="alerts-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="alerts-modal-content"
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-amber-500 via-indigo-600 to-indigo-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Bell className="w-5 h-5 text-white animate-bounce-subtle" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  'Notify Me' Listing Alerts
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400 text-slate-950 uppercase tracking-wider">
                  Real-time
                </span>
              </div>
              <p className="text-xs text-indigo-100">
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
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-3 gap-2">
          <button
            onClick={() => setActiveTab("alerts")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "alerts"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Manage Alerts ({alerts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === "history"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Matched Alerts History</span>
            {alertHistory.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold">
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
              <div className="p-5 rounded-2xl bg-indigo-50/60 border border-indigo-100/90 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-extrabold text-indigo-950">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span>Create a New Custom Alert</span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Monitors live posts across campus
                  </span>
                </div>

                <form onSubmit={handleAddAlert} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                    {/* Keyword Input */}
                    <div className="sm:col-span-6 relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="alert-keyword-input"
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="Keyword: e.g. 'Casio Calculator', 'B.S. Grewal'..."
                        className="w-full pl-8.5 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder:text-slate-400"
                      />
                    </div>

                    {/* Category Selector */}
                    <div className="sm:col-span-3">
                      <select
                        id="alert-category-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as any)}
                        className="w-full px-2.5 py-2 text-xs rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {CATEGORY_OPTIONS.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat === "All" ? "All Categories" : cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Max Budget Threshold */}
                    <div className="sm:col-span-3">
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">
                          ₹
                        </span>
                        <input
                          id="alert-maxprice-input"
                          type="number"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                          placeholder="Max Price Threshold"
                          min={0}
                          className="w-full pl-7 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium placeholder:text-slate-400"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Budget Quick-Select Chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300"
                        }`}
                      >
                        {b.label}
                      </button>
                    ))}
                    {maxPrice && (
                      <button
                        type="button"
                        onClick={() => setMaxPrice("")}
                        className="text-[10px] font-semibold text-slate-400 hover:text-rose-600 ml-1 cursor-pointer"
                      >
                        Clear budget
                      </button>
                    )}
                  </div>

                  {/* Preset Pills */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Popular Student Presets (With Budgets):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_ALERTS.map((preset) => (
                        <button
                          key={preset.keyword}
                          type="button"
                          onClick={() => handleApplyPreset(preset)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-white hover:bg-indigo-600 hover:text-white text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1"
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
                    <p className="text-[11px] text-slate-400">
                      {maxPrice
                        ? `🎯 Only notify when priced ≤ ₹${maxPrice}`
                        : "🔔 Notifies for all matching items (any budget)"}
                    </p>
                    <button
                      id="submit-alert-btn"
                      type="submit"
                      disabled={!keyword.trim() && category === "All"}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
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
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Your Active Subscriptions ({alerts.length})</span>
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Triggers on-screen toast on new post
                  </span>
                </div>

                {alerts.length === 0 ? (
                  <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                    <Bell className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-700">
                      No active alerts set
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
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
                            ? "bg-emerald-50/70 border-emerald-300 shadow-sm"
                            : alert.active
                            ? "bg-white border-slate-200 hover:border-indigo-200 shadow-2xs"
                            : "bg-slate-50/70 border-slate-200 opacity-60"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                              alert.active
                                ? "bg-amber-100 text-amber-700"
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-sm font-bold text-slate-900">
                                {alert.keyword || "All Items in Category"}
                              </span>
                              {alert.category && (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                  {alert.category === "All" ? "Any Category" : alert.category}
                                </span>
                              )}
                              {alert.maxPrice !== undefined && alert.maxPrice > 0 ? (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
                                  🎯 Budget: ≤ ₹{alert.maxPrice}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                                  Budget: Any
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500">
                              <span>
                                Status:{" "}
                                <strong className={alert.active ? "text-emerald-600" : "text-slate-400"}>
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
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 transition-colors shadow-2xs cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-600" />
                            <span>Test Alert</span>
                          </button>

                          {/* Toggle Active Switch */}
                          <button
                            type="button"
                            onClick={() => handleToggleActive(alert.id)}
                            className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                              alert.active
                                ? "bg-white text-slate-700 border-slate-300 hover:bg-slate-100"
                                : "bg-indigo-50 text-indigo-700 border-indigo-200"
                            }`}
                          >
                            {alert.active ? "Pause" : "Resume"}
                          </button>

                          {/* Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteAlert(alert.id)}
                            className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
                  <h3 className="text-xs font-extrabold text-slate-900">
                    Recent Matched Items Triggered by Alerts
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Items that satisfied your alert criteria when posted
                  </p>
                </div>
                {alertHistory.length > 0 && (
                  <button
                    onClick={onClearHistory}
                    className="text-xs font-bold text-rose-600 hover:text-rose-700"
                  >
                    Clear History
                  </button>
                )}
              </div>

              {alertHistory.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-slate-50 border border-dashed border-slate-300 space-y-2">
                  <History className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-700">No alert triggers yet</p>
                  <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                    When someone lists an item matching your keywords or you click 'Test Alert', it will show up here!
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {alertHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-200 transition-all flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.listing.imageUrl}
                          alt={item.listing.title}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              {item.listing.title}
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800">
                              Matched: "{item.alertKeyword}"
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                            <span className="font-bold text-indigo-600">
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold transition-colors shrink-0"
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
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Alerts automatically check all newly posted items in real-time</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
