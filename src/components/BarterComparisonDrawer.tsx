import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Repeat,
  Sparkles,
  ArrowLeftRight,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Plus,
  Minus,
  MessageCircle,
  HelpCircle,
  Scale,
  DollarSign,
  Package,
  Layers,
} from "lucide-react";
import { Listing } from "../types";
import { useTheme } from "../context/ThemeContext";

interface BarterComparisonDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
  userListings?: Listing[];
  onSendBarterProposal: (listing: Listing, proposalText: string) => void;
}

const POPULAR_CAMPUS_TRADE_ITEMS = [
  {
    id: "trade-calc",
    name: "Casio fx-991CW Calculator (Like New)",
    category: "Calculators",
    estValue: 850,
  },
  {
    id: "trade-drafter",
    name: "Engineering Mini Drafter + Board Clips",
    category: "Lab Equipment",
    estValue: 400,
  },
  {
    id: "trade-book-mechanics",
    name: "Engineering Mechanics (Beer & Johnston 12th Ed)",
    category: "Books",
    estValue: 550,
  },
  {
    id: "trade-arduino",
    name: "Arduino Uno R3 + Sensor Expansion Kit",
    category: "Lab Equipment",
    estValue: 750,
  },
  {
    id: "trade-notes",
    name: "Semester 3 SPPU Topper Handwritten Notes Set",
    category: "Books",
    estValue: 250,
  },
];

export const BarterComparisonDrawer: React.FC<BarterComparisonDrawerProps> = ({
  isOpen,
  onClose,
  listing,
  userListings = [],
  onSendBarterProposal,
}) => {
  const { isDark } = useTheme();

  const [selectedOfferType, setSelectedOfferType] = useState<"preset" | "custom">("preset");
  const [selectedPresetId, setSelectedPresetId] = useState<string>(POPULAR_CAMPUS_TRADE_ITEMS[0].id);
  const [customItemName, setCustomItemName] = useState<string>("");
  const [customItemValue, setCustomItemValue] = useState<number>(300);
  const [cashDifference, setCashDifference] = useState<number>(0);
  const [tradeNotes, setTradeNotes] = useState<string>(
    "Happy to meet at Central Library Quad or Canteen Porch to test before finalizing!"
  );

  if (!listing) return null;

  const targetItemValue = listing.price || 500;

  const selectedPreset = POPULAR_CAMPUS_TRADE_ITEMS.find((item) => item.id === selectedPresetId);
  const offeredItemValue =
    selectedOfferType === "preset"
      ? (selectedPreset?.estValue || 400)
      : (customItemValue || 0);

  const totalOfferedValue = offeredItemValue + cashDifference;
  const valueDelta = totalOfferedValue - targetItemValue;

  // Parity status calculation
  let parityLabel = "Fair & Balanced Trade";
  let parityColor = "text-emerald-500 bg-emerald-500/10 border-emerald-500/30";
  let parityAngle = 0;

  if (Math.abs(valueDelta) <= 50) {
    parityLabel = "⚖️ Perfectly Balanced Fair Swap";
    parityColor = "text-emerald-500 bg-emerald-500/15 border-emerald-500/30";
    parityAngle = 0;
  } else if (valueDelta > 50) {
    parityLabel = `✨ Generous Offer (Seller gains +₹${valueDelta} in value)`;
    parityColor = "text-indigo-500 bg-indigo-500/15 border-indigo-500/30";
    parityAngle = Math.min(15, (valueDelta / targetItemValue) * 20);
  } else {
    parityLabel = `⚠️ Gap of ₹${Math.abs(valueDelta)} (Consider adding cash to balance)`;
    parityColor = "text-amber-500 bg-amber-500/15 border-amber-500/30";
    parityAngle = Math.max(-15, (valueDelta / targetItemValue) * 20);
  }

  const handleProposeTrade = () => {
    const itemName =
      selectedOfferType === "preset"
        ? (selectedPreset?.name || "My trade item")
        : (customItemName || "My proposed trade item");

    const cashClause =
      cashDifference > 0
        ? ` + ₹${cashDifference} cash differential`
        : "";

    const proposalText = `🤝 [Barter Proposal for "${listing.title}"]\nI would love to offer: ${itemName} (est. ₹${offeredItemValue})${cashClause}.\nTotal proposed valuation: ₹${totalOfferedValue} vs your ₹${targetItemValue}.\n\nNote: ${tradeNotes}`;

    onSendBarterProposal(listing, proposalText);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-md p-0 sm:p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            id="barter-flow-drawer"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.95 }}
            transition={{ type: "spring", damping: 28, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-3xl rounded-t-3xl sm:rounded-3xl border-2 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col ${
              isDark
                ? "bg-slate-900 border-slate-700/80 text-white"
                : "bg-white border-slate-200 text-slate-900"
            }`}
          >
            {/* Drawer Top Header */}
            <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-indigo-600/10 via-purple-600/10 to-indigo-600/10 border-slate-700/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-indigo-600 text-white shadow-md">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold flex items-center gap-1.5">
                    <span>Dynamic Campus Barter Flow</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-indigo-500/20 text-indigo-400 border border-indigo-400/30">
                      Split Inspection
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Compare items side-by-side and balance peer exchange parity with cash or gear
                  </p>
                </div>
              </div>

              <button
                type="button"
                id="barter-drawer-close-btn"
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Interactive Comparison Grid */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Dynamic Animated Parity Meter / Scale */}
              <div
                className={`p-4 rounded-2xl border text-center relative overflow-hidden ${
                  isDark ? "bg-slate-800/60 border-slate-700/80" : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Scale className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Trade Equilibrium Meter
                  </span>
                </div>

                <div className="text-sm font-extrabold flex items-center justify-center gap-2 mt-1">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border ${parityColor}`}>
                    {parityLabel}
                  </span>
                </div>

                {/* Animated Balance Visualizer Bar */}
                <div className="relative mt-3 h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden max-w-md mx-auto">
                  <motion.div
                    className="absolute top-0 bottom-0 bg-gradient-to-r from-emerald-500 via-indigo-500 to-purple-500 rounded-full"
                    animate={{
                      left: `${Math.max(10, Math.min(80, 50 + (valueDelta / (targetItemValue || 1)) * 30))}%`,
                      width: "18px",
                      marginLeft: "-9px",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </div>
                <div className="flex justify-between max-w-md mx-auto text-[10px] text-slate-400 font-bold mt-1 px-1">
                  <span>Seller Advantaged</span>
                  <span>Perfect Balance</span>
                  <span>Buyer Advantaged</span>
                </div>
              </div>

              {/* Side-by-Side Comparison Columns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: Seller's Item */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDark
                      ? "bg-slate-800/40 border-slate-700/80"
                      : "bg-slate-50/80 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Target Item (Seller)
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                        ₹{targetItemValue}
                      </span>
                    </div>

                    <div className="flex gap-3">
                      <img
                        src={listing.imageUrl}
                        alt={listing.title}
                        className="w-16 h-16 rounded-xl object-cover border border-slate-300 dark:border-slate-700 shadow-sm shrink-0"
                      />
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold truncate">{listing.title}</h4>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          <span>{listing.category}</span>
                          <span>•</span>
                          <span className="text-emerald-500 font-semibold">{listing.condition}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                          {listing.description}
                        </p>
                      </div>
                    </div>

                    {/* Seller's Swap Preference */}
                    <div className="mt-3 p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                        <Repeat className="w-3.5 h-3.5" />
                        <span>Seller's Desired Exchange:</span>
                      </div>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {listing.exchangeFor || "Open to relevant engineering books, calculators, or lab kits."}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-300 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Seller: <strong>{listing.sellerName}</strong></span>
                    <span>{listing.locationPreference || "Central Library"}</span>
                  </div>
                </div>

                {/* Right Column: Your Offer Tray */}
                <div
                  className={`p-4 rounded-2xl border flex flex-col justify-between ${
                    isDark
                      ? "bg-slate-800/40 border-slate-700/80"
                      : "bg-slate-50/80 border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                        Your Proposed Offer
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                        ₹{totalOfferedValue} Total
                      </span>
                    </div>

                    {/* Mode Toggle: Campus Preset vs Custom Gear */}
                    <div className="flex rounded-xl p-1 bg-slate-200 dark:bg-slate-800 mb-3 text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setSelectedOfferType("preset")}
                        className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                          selectedOfferType === "preset"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        Popular Campus Gear
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedOfferType("custom")}
                        className={`flex-1 py-1 rounded-lg transition-colors cursor-pointer ${
                          selectedOfferType === "custom"
                            ? "bg-indigo-600 text-white shadow-xs"
                            : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
                        }`}
                      >
                        Custom Item
                      </button>
                    </div>

                    {selectedOfferType === "preset" ? (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-400">
                          Select Item to Exchange:
                        </label>
                        <select
                          value={selectedPresetId}
                          onChange={(e) => setSelectedPresetId(e.target.value)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                            isDark
                              ? "bg-slate-900 border-slate-700 text-white"
                              : "bg-white border-slate-200 text-slate-900"
                          }`}
                        >
                          {POPULAR_CAMPUS_TRADE_ITEMS.map((item) => (
                            <option key={item.id} value={item.id}>
                              {item.name} — est. ₹{item.estValue}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] font-bold text-slate-400">
                            Your Item Name:
                          </label>
                          <input
                            type="text"
                            value={customItemName}
                            onChange={(e) => setCustomItemName(e.target.value)}
                            placeholder="e.g. Workshop Tool Kit or Book"
                            className={`w-full px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                              isDark
                                ? "bg-slate-900 border-slate-700 text-white"
                                : "bg-white border-slate-200 text-slate-900"
                            }`}
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-bold text-slate-400">
                            Estimated Value (₹):
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="5000"
                            step="50"
                            value={customItemValue}
                            onChange={(e) => setCustomItemValue(Number(e.target.value))}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                              isDark
                                ? "bg-slate-900 border-slate-700 text-white"
                                : "bg-white border-slate-200 text-slate-900"
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    {/* Cash Differential Adjustment */}
                    <div className="mt-3 p-3 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                      <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Sweeten Deal with Cash:</span>
                        </span>
                        <span className="text-emerald-500 font-extrabold">+₹{cashDifference}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="50"
                        value={cashDifference}
                        onChange={(e) => setCashDifference(Number(e.target.value))}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
                        <span>+₹0</span>
                        <span>+₹250</span>
                        <span>+₹500</span>
                        <span>+₹1,000</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-300 dark:border-slate-700/60 flex items-center justify-between text-xs text-slate-400 font-medium">
                    <span>Valuation: Item (₹{offeredItemValue}) + Cash (+₹{cashDifference})</span>
                  </div>
                </div>
              </div>

              {/* Proposal Note Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  Custom Negotiation Message to Seller:
                </label>
                <textarea
                  rows={2}
                  value={tradeNotes}
                  onChange={(e) => setTradeNotes(e.target.value)}
                  className={`w-full p-3 rounded-2xl text-xs border focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-slate-800/60 border-slate-700 text-white"
                      : "bg-slate-50 border-slate-200 text-slate-900"
                  }`}
                  placeholder="Mention handover timing or test details..."
                />
              </div>
            </div>

            {/* Footer Action Bar */}
            <div
              className={`p-4 sm:p-5 border-t flex flex-col sm:flex-row items-center justify-between gap-3 ${
                isDark ? "bg-slate-950/80 border-slate-800" : "bg-slate-100 border-slate-200"
              }`}
            >
              <div className="text-xs text-slate-500">
                Peer proposals open directly in encrypted campus chat with structured terms.
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer w-1/2 sm:w-auto ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                      : "border-slate-200 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  Cancel
                </button>
                <motion.button
                  type="button"
                  id="send-barter-proposal-btn"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleProposeTrade}
                  className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 cursor-pointer transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Barter Proposal</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
