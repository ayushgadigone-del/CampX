import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  MapPin,
  ShieldCheck,
  Clock,
  Compass,
  CheckCircle2,
  Navigation,
  Eye,
  Sparkles,
  Building2,
  Layers,
  Coffee,
  BookOpen,
  Wrench,
  Bike,
  Filter,
  Info,
} from "lucide-react";
import { CAMPUS_HANDOVER_SPOTS, CampusSpot } from "./CampusHandoverMiniMap";
import { useTheme } from "../context/ThemeContext";

interface CampusHandoverBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterByLocation?: (locationName: string) => void;
  onSelectMeetingPoint?: (spotName: string) => void;
}

export const CampusHandoverBlueprintModal: React.FC<CampusHandoverBlueprintModalProps> = ({
  isOpen,
  onClose,
  onFilterByLocation,
  onSelectMeetingPoint,
}) => {
  const { isDark } = useTheme();
  const [selectedSpotId, setSelectedSpotId] = useState<string>("library-quad");
  const [hoveredSpotId, setHoveredSpotId] = useState<string | null>(null);

  const activeSpot =
    CAMPUS_HANDOVER_SPOTS.find((s) => s.id === (hoveredSpotId || selectedSpotId)) ||
    CAMPUS_HANDOVER_SPOTS[0];

  const handleApplyFilter = (spot: CampusSpot) => {
    if (onFilterByLocation) {
      onFilterByLocation(spot.shortName);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-6 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            id="campus-blueprint-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ type: "spring", damping: 26, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
            className={`w-full max-w-4xl rounded-3xl border-2 shadow-2xl overflow-hidden flex flex-col max-h-[94vh] ${
              isDark
                ? "bg-[#090D16] border-cyan-500/30 text-white shadow-cyan-950/40"
                : "bg-slate-900 border-indigo-400 text-white shadow-2xl"
            }`}
          >
            {/* Architectural Blueprint Header */}
            <div className="px-6 py-4 border-b border-cyan-500/20 bg-slate-950/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
                  <Compass className="w-5 h-5 animate-spin-slow" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-400 uppercase">
                      SECURE CAMPUS EXCHANGE MATRIX • PVG COET
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      LIVE CCTV RADAR
                    </span>
                  </div>
                  <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-2">
                    <span>Interactive Campus Handover Blueprint</span>
                  </h3>
                </div>
              </div>

              <button
                type="button"
                id="blueprint-close-btn"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close Blueprint"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Area: Blueprint Canvas + Spot Specs Drawer */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-y-auto">
              {/* Left 7 Columns: Architectural Blueprint Map with Radar Grid */}
              <div className="lg:col-span-7 relative min-h-[380px] p-6 bg-[#0B132B] flex flex-col justify-between overflow-hidden select-none border-b lg:border-b-0 lg:border-r border-cyan-500/20">
                {/* Engineering Blueprint Grid Lines */}
                <div
                  className="absolute inset-0 pointer-events-none opacity-25"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, rgba(6, 182, 212, 0.2) 1px, transparent 1px),
                      linear-gradient(to bottom, rgba(6, 182, 212, 0.2) 1px, transparent 1px)
                    `,
                    backgroundSize: "32px 32px",
                  }}
                />

                {/* Corner Architectural Coordinate Markers */}
                <div className="absolute top-2 left-3 font-mono text-[9px] text-cyan-500/60">
                  LAT: 18.4901° N / LONG: 73.8524° E [CAD-REV 4.2]
                </div>
                <div className="absolute top-2 right-3 font-mono text-[9px] text-cyan-500/60">
                  SCALE: 1:500 • SAFE CAMPUS ZONES
                </div>

                {/* Campus Landmark Vector Outlines */}
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none opacity-20"
                  viewBox="0 0 500 350"
                  preserveAspectRatio="none"
                >
                  {/* Central Academic Complex */}
                  <rect x="180" y="60" width="140" height="90" rx="10" fill="none" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 4" />
                  <text x="200" y="110" fill="#38bdf8" fontSize="12" fontFamily="monospace">MAIN ACADEMIC</text>

                  {/* Library Quad Outline */}
                  <circle cx="150" cy="160" r="50" fill="none" stroke="#22d3ee" strokeWidth="1.5" />
                  <text x="120" y="165" fill="#22d3ee" fontSize="10" fontFamily="monospace">LIBRARY QUAD</text>

                  {/* Canteen Courtyard */}
                  <rect x="300" y="120" width="110" height="70" rx="8" fill="none" stroke="#34d399" strokeWidth="1.5" strokeDasharray="2 2" />
                  <text x="320" y="155" fill="#34d399" fontSize="10" fontFamily="monospace">CAFETERIA</text>

                  {/* Tech Labs & Workshop Bay */}
                  <rect x="330" y="230" width="130" height="80" rx="6" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
                  <text x="350" y="275" fill="#f59e0b" fontSize="10" fontFamily="monospace">WORKSHOP SHED</text>

                  {/* Hostel Lawns */}
                  <path d="M 60 220 Q 90 280 150 270" fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5 5" />
                  <text x="70" y="260" fill="#a78bfa" fontSize="10" fontFamily="monospace">HOSTEL GROUNDS</text>
                </svg>

                {/* Interactive Radar Pins */}
                <div className="relative w-full h-full min-h-[300px]">
                  {CAMPUS_HANDOVER_SPOTS.map((spot) => {
                    const isSelected = selectedSpotId === spot.id;
                    const isHovered = hoveredSpotId === spot.id;

                    return (
                      <div
                        key={spot.id}
                        className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        onClick={() => setSelectedSpotId(spot.id)}
                        onMouseEnter={() => setHoveredSpotId(spot.id)}
                        onMouseLeave={() => setHoveredSpotId(null)}
                      >
                        {/* Radar Pulse Rings for Active Spot */}
                        {(isSelected || isHovered) && (
                          <div className="absolute -inset-4 rounded-full bg-cyan-400/25 animate-ping pointer-events-none" />
                        )}

                        <motion.div
                          whileHover={{ scale: 1.25 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative p-2 rounded-2xl flex items-center justify-center border-2 transition-all shadow-lg ${
                            isSelected
                              ? "bg-cyan-500 text-slate-950 border-white shadow-cyan-400/50 ring-4 ring-cyan-400/30"
                              : "bg-slate-900/90 text-cyan-400 border-cyan-500/60 hover:border-cyan-300 shadow-slate-950"
                          }`}
                        >
                          <MapPin className="w-4 h-4 shrink-0" />
                        </motion.div>

                        {/* Pin Tag Label */}
                        <div
                          className={`mt-1 text-center font-mono text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shadow-md transition-all ${
                            isSelected
                              ? "bg-cyan-400 text-slate-950"
                              : "bg-slate-900/80 text-cyan-300 border border-cyan-500/40"
                          }`}
                        >
                          {spot.shortName}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Blueprint Bottom Instructions */}
                <div className="relative z-10 pt-2 flex items-center justify-between text-xs text-cyan-300/80 font-mono">
                  <span>💡 Click any beacon on the blueprint to view safety metrics</span>
                  <span>100% On-Campus Safe Zones</span>
                </div>
              </div>

              {/* Right 5 Columns: Selected Safe-Zone Intelligence Sheet */}
              <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-4 bg-slate-950 text-white">
                <div className="space-y-4">
                  {/* Spot Title & Category */}
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                        {activeSpot.category}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {activeSpot.popularityPct}% Campus Preference
                      </span>
                    </div>
                    <h4 className="text-xl font-extrabold text-white mt-1">
                      {activeSpot.name}
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {activeSpot.directions}
                    </p>
                  </div>

                  {/* Safety & CCTV Features */}
                  <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-cyan-500/30 space-y-2">
                    <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5 font-mono">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Verified Safety Protections</span>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {activeSpot.safetyFeatures.map((feat) => (
                        <span
                          key={feat}
                          className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-400" />
                          {feat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Timings */}
                  <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5 text-xs text-slate-300">
                    <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-slate-400 block text-[10px] font-mono">PEAK SAFE WINDOW</span>
                      <strong className="text-white font-bold">{activeSpot.bestTimes}</strong>
                    </div>
                  </div>

                  {/* Peer Handover Tip */}
                  <div className="p-3 rounded-2xl bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
                    <div className="flex items-center gap-1.5 font-bold mb-1 text-cyan-300">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Student Coordination Tip</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-300">
                      {activeSpot.handoverTips}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  {onFilterByLocation && (
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleApplyFilter(activeSpot)}
                      className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 transition-all cursor-pointer"
                    >
                      <Filter className="w-4 h-4" />
                      <span>Filter Listings at {activeSpot.shortName}</span>
                    </motion.button>
                  )}

                  {onSelectMeetingPoint && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectMeetingPoint(activeSpot.name);
                        onClose();
                      }}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold border border-slate-700 transition-colors cursor-pointer"
                    >
                      Choose as My Meeting Spot
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
