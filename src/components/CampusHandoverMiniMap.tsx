import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MapPin,
  ShieldCheck,
  Clock,
  Navigation,
  Compass,
  CheckCircle2,
  Coffee,
  BookOpen,
  Wrench,
  Building2,
  Trees,
  Bike,
  Monitor,
  Info,
  Layers,
  Sparkles,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

export interface CampusSpot {
  id: string;
  name: string;
  shortName: string;
  x: number; // percentage from left (0 - 100)
  y: number; // percentage from top (0 - 100)
  iconType: "library" | "canteen" | "workshop" | "admin" | "hostel" | "sports" | "lab";
  category: string;
  safetyFeatures: string[];
  bestTimes: string;
  directions: string;
  handoverTips: string;
  popularityPct: number;
}

export const CAMPUS_HANDOVER_SPOTS: CampusSpot[] = [
  {
    id: "library-quad",
    name: "Central Library Quad",
    shortName: "Library Quad",
    x: 32,
    y: 42,
    iconType: "library",
    category: "Academic & Quiet",
    safetyFeatures: ["CCTV Monitored", "Covered Reading Benches", "Security Desk"],
    bestTimes: "10:00 AM – 5:30 PM",
    directions: "Beside the Central Library entrance, under the shaded ficus trees.",
    handoverTips: "Ideal for inspecting textbook bindings, calculators, and study notes in a peaceful environment.",
    popularityPct: 44,
  },
  {
    id: "canteen-porch",
    name: "College Main Canteen Porch",
    shortName: "Canteen Porch",
    x: 68,
    y: 38,
    iconType: "canteen",
    category: "Social Hub",
    safetyFeatures: ["High Student Footfall", "Outdoor Tables", "Fast 5G / UPI Signal"],
    bestTimes: "11:00 AM – 4:00 PM",
    directions: "Spacious porch outside the main campus cafeteria and tea counter.",
    handoverTips: "Most popular meeting point. Great for instant UPI transactions and quick test reviews over tea.",
    popularityPct: 35,
  },
  {
    id: "workshop-shed",
    name: "Workshop Practice Shed 2",
    shortName: "Workshop Shed 2",
    x: 76,
    y: 70,
    iconType: "workshop",
    category: "Engineering & Labs",
    safetyFeatures: ["Spacious Workbenches", "Power Outlets", "Heavy Tool Safe"],
    bestTimes: "9:30 AM – 5:00 PM",
    directions: "Mechanical Workshop bay entrance, Shed 2 wide concrete pathway.",
    handoverTips: "Best spot to test vernier calipers, micrometers, mini drafters, or heavy lab kits with ample space.",
    popularityPct: 14,
  },
  {
    id: "academic-entrance",
    name: "Academic Block Entrance",
    shortName: "Academic Portico",
    x: 48,
    y: 22,
    iconType: "admin",
    category: "Main Portico",
    safetyFeatures: ["24/7 Security Guard", "Covered Portico", "Wheelchair Ramp"],
    bestTimes: "8:30 AM – 6:00 PM",
    directions: "Main entrance portico of PVG's COET administrative building, near security.",
    handoverTips: "Sheltered from sun & rain; highly visible and convenient for newcomers and first-years.",
    popularityPct: 22,
  },
  {
    id: "hostel-lawn",
    name: "Hostel Common Lawn",
    shortName: "Hostel Lawn",
    x: 22,
    y: 76,
    iconType: "hostel",
    category: "Hostel Quad",
    safetyFeatures: ["Open Visibility", "Evening Solar Lights", "Safe Resident Area"],
    bestTimes: "4:30 PM – 7:30 PM",
    directions: "Lawn between Boys Hostel Block A and the campus dining mess.",
    handoverTips: "Convenient evening meeting location for hostellers after lab hours.",
    popularityPct: 18,
  },
  {
    id: "sports-pavilion",
    name: "Sports Ground Pavilion",
    shortName: "Sports Pavilion",
    x: 52,
    y: 84,
    iconType: "sports",
    category: "Open Ground",
    safetyFeatures: ["Wide Paved Track", "Open Bleacher Seating", "Cycle Test Space"],
    bestTimes: "7:00 AM – 9:00 AM & 4:00 PM – 6:30 PM",
    directions: "Adjacent to the college basketball court and athletic track pavilion.",
    handoverTips: "The recommended spot if buying or selling a campus cycle—allows a safe test ride along the paved ring.",
    popularityPct: 20,
  },
  {
    id: "computer-lab-porch",
    name: "Department Computer Lab Porch",
    shortName: "CS/IT Lab Porch",
    x: 36,
    y: 60,
    iconType: "lab",
    category: "CS & IT Wing",
    safetyFeatures: ["Campus Wi-Fi", "Quiet Corridor", "Staff Presence"],
    bestTimes: "10:00 AM – 5:00 PM",
    directions: "2nd floor corridor outside Computer Science Lab 3 & Server Room.",
    handoverTips: "Ideal for electronic calculators, laptop bags, and USB drive / peripheral testing.",
    popularityPct: 12,
  },
];

interface CampusHandoverMiniMapProps {
  selectedLocation: string;
  onSelectLocation: (locationName: string) => void;
  className?: string;
}

export const CampusHandoverMiniMap: React.FC<CampusHandoverMiniMapProps> = ({
  selectedLocation,
  onSelectLocation,
  className = "",
}) => {
  const { isDark } = useTheme();
  const [mapMode, setMapMode] = useState<"blueprint" | "satellite">("blueprint");
  const [hoveredSpot, setHoveredSpot] = useState<CampusSpot | null>(null);

  // Find active spot based on currently selected location string
  const activeSpot =
    CAMPUS_HANDOVER_SPOTS.find(
      (s) =>
        s.name.toLowerCase() === selectedLocation.toLowerCase() ||
        selectedLocation.toLowerCase().includes(s.shortName.toLowerCase()) ||
        s.name.toLowerCase().includes(selectedLocation.toLowerCase())
    ) || CAMPUS_HANDOVER_SPOTS[0];

  const getSpotIcon = (iconType: CampusSpot["iconType"], sizeClass = "w-3.5 h-3.5") => {
    switch (iconType) {
      case "library":
        return <BookOpen className={sizeClass} />;
      case "canteen":
        return <Coffee className={sizeClass} />;
      case "workshop":
        return <Wrench className={sizeClass} />;
      case "admin":
        return <Building2 className={sizeClass} />;
      case "hostel":
        return <Trees className={sizeClass} />;
      case "sports":
        return <Bike className={sizeClass} />;
      case "lab":
      default:
        return <Monitor className={sizeClass} />;
    }
  };

  return (
    <div
      id="campus-handover-mini-map-container"
      className={`rounded-2xl border overflow-hidden transition-all duration-200 ${
        isDark
          ? "bg-slate-900/90 border-slate-700/80 text-slate-200"
          : "bg-slate-50/90 border-slate-200 text-slate-800"
      } ${className}`}
    >
      {/* Mini-Map Header Controls */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200/80 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded-lg bg-indigo-500/15 text-indigo-600 dark:text-indigo-400">
            <Navigation className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <span>Campus Handover Spots</span>
              <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                PVG's COET Pune
              </span>
            </h4>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">
              Tap any safe landmark pin to set your meeting location
            </p>
          </div>
        </div>

        {/* View Switcher: Blueprint vs Satellite */}
        <div className="flex items-center p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold">
          <button
            type="button"
            onClick={() => setMapMode("blueprint")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              mapMode === "blueprint"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Blueprint
          </button>
          <button
            type="button"
            onClick={() => setMapMode("satellite")}
            className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
              mapMode === "satellite"
                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            }`}
          >
            Satellite
          </button>
        </div>
      </div>

      {/* Interactive Campus Canvas */}
      <div className="relative w-full h-56 sm:h-64 overflow-hidden select-none bg-slate-950">
        {/* Background Visual Layer */}
        {mapMode === "blueprint" ? (
          /* Stylized Engineering Campus Blueprint SVG */
          <svg
            className="w-full h-full object-cover"
            viewBox="0 0 500 300"
            preserveAspectRatio="xMidYMid slice"
          >
            <defs>
              <pattern
                id="grid-pattern"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke={isDark ? "#1e293b" : "#334155"}
                  strokeWidth="0.5"
                  opacity="0.6"
                />
              </pattern>
            </defs>

            {/* Base Canvas */}
            <rect width="500" height="300" fill={isDark ? "#0b1120" : "#111827"} />
            <rect width="500" height="300" fill="url(#grid-pattern)" />

            {/* Campus Boundary Road (Sahakar Nagar / Mukund Nagar) */}
            <path
              d="M 10 20 Q 250 15 490 25"
              stroke="#3b82f6"
              strokeWidth="4"
              fill="none"
              strokeDasharray="6 3"
              opacity="0.7"
            />
            <text x="20" y="16" fill="#93c5fd" fontSize="9" fontWeight="bold">
              Main Campus Road • Sahakar Nagar Gate 1 ➔
            </text>

            {/* Pathways & Walkways */}
            <path
              d="M 240 25 L 240 130 L 150 130 L 150 250 M 240 130 L 370 130 L 370 230 M 150 130 L 110 230"
              stroke="#64748b"
              strokeWidth="5"
              fill="none"
              strokeLinecap="round"
              opacity="0.5"
            />
            <path
              d="M 240 130 L 260 250"
              stroke="#64748b"
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              opacity="0.4"
            />

            {/* Building 1: Academic Block & Admin Portico */}
            <rect
              x="180"
              y="40"
              width="120"
              height="50"
              rx="4"
              fill="#1e293b"
              stroke="#38bdf8"
              strokeWidth="1.5"
            />
            <text x="240" y="70" fill="#f1f5f9" fontSize="9" fontWeight="bold" textAnchor="middle">
              Academic Block
            </text>

            {/* Building 2: Central Library & Quad */}
            <rect
              x="80"
              y="100"
              width="90"
              height="55"
              rx="4"
              fill="#1e293b"
              stroke="#818cf8"
              strokeWidth="1.5"
            />
            <circle cx="160" cy="125" r="14" fill="#065f46" opacity="0.6" />
            <text x="125" y="132" fill="#e2e8f0" fontSize="9" fontWeight="bold" textAnchor="middle">
              Library Quad
            </text>

            {/* Building 3: Main Canteen */}
            <rect
              x="300"
              y="90"
              width="95"
              height="45"
              rx="4"
              fill="#1e293b"
              stroke="#fb923c"
              strokeWidth="1.5"
            />
            <text x="348" y="118" fill="#ffedd5" fontSize="9" fontWeight="bold" textAnchor="middle">
              Main Canteen
            </text>

            {/* Building 4: Mechanical Workshop Sheds */}
            <rect
              x="320"
              y="180"
              width="110"
              height="60"
              rx="4"
              fill="#1e293b"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <line x1="320" y1="210" x2="430" y2="210" stroke="#78350f" strokeWidth="1" strokeDasharray="3" />
            <text x="375" y="215" fill="#fef3c7" fontSize="9" fontWeight="bold" textAnchor="middle">
              Workshop Shed 2
            </text>

            {/* Building 5: Hostels & Common Lawn */}
            <rect
              x="50"
              y="190"
              width="80"
              height="65"
              rx="4"
              fill="#1e293b"
              stroke="#34d399"
              strokeWidth="1.5"
            />
            <circle cx="110" cy="230" r="16" fill="#047857" opacity="0.6" />
            <text x="90" y="235" fill="#d1fae5" fontSize="9" fontWeight="bold" textAnchor="middle">
              Hostel Lawn
            </text>

            {/* Area 6: Sports Pavilion & Ground */}
            <ellipse
              cx="260"
              cy="255"
              rx="60"
              ry="25"
              fill="#064e3b"
              stroke="#a7f3d0"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <text x="260" y="260" fill="#ecfdf5" fontSize="9" fontWeight="bold" textAnchor="middle">
              Sports Pavilion
            </text>

            {/* Decorative Trees / Green Patches */}
            <circle cx="210" cy="110" r="8" fill="#10b981" opacity="0.4" />
            <circle cx="270" cy="110" r="8" fill="#10b981" opacity="0.4" />
            <circle cx="180" cy="170" r="10" fill="#10b981" opacity="0.4" />
            <circle cx="300" cy="160" r="9" fill="#10b981" opacity="0.4" />
          </svg>
        ) : (
          /* Satellite Campus View with Street References */
          <div className="w-full h-full relative overflow-hidden bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1524813686514-a57563d77d61?auto=format&fit=crop&w=1000&q=80"
              alt="PVG's COET Campus Aerial Satellite View"
              className="w-full h-full object-cover brightness-75 contrast-125 saturate-125"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40" />

            {/* Road Overlay */}
            <div className="absolute top-2 left-3 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm border border-white/20 text-[9px] text-white font-mono flex items-center gap-1">
              <Compass className="w-3 h-3 text-sky-400" />
              <span>18.4899° N, 73.8548° E • Sahakar Nagar, Pune</span>
            </div>
          </div>
        )}

        {/* Orientation Indicator */}
        <div className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/80 text-white shadow-md flex flex-col items-center select-none pointer-events-none">
          <Compass className="w-3.5 h-3.5 text-rose-500 animate-spin-slow" />
          <span className="text-[8px] font-black text-rose-400 -mt-0.5">N</span>
        </div>

        {/* Interactive Spot Pins Layer */}
        {CAMPUS_HANDOVER_SPOTS.map((spot) => {
          const isSelected = activeSpot.id === spot.id;
          const isHovered = hoveredSpot?.id === spot.id;

          return (
            <div
              key={spot.id}
              style={{
                left: `${spot.x}%`,
                top: `${spot.y}%`,
                transform: "translate(-50%, -50%)",
              }}
              className="absolute z-20"
            >
              {/* Pulsing Beacon Ring for Selected Spot */}
              {isSelected && (
                <span className="absolute -inset-2 rounded-full bg-indigo-500 animate-ping opacity-60 pointer-events-none" />
              )}

              {/* Pin Marker Button with Framer Motion */}
              <motion.button
                type="button"
                id={`campus-spot-pin-${spot.id}`}
                whileHover={{ scale: 1.25 }}
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 450, damping: 20 }}
                onClick={() => onSelectLocation(spot.name)}
                onMouseEnter={() => setHoveredSpot(spot)}
                onMouseLeave={() => setHoveredSpot(null)}
                aria-label={`Select ${spot.name}`}
                className={`relative flex items-center justify-center rounded-full transition-colors duration-200 shadow-xl cursor-pointer ${
                  isSelected
                    ? "w-8 h-8 bg-indigo-600 text-white border-2 border-white ring-4 ring-indigo-500/40 z-30"
                    : isHovered
                    ? "w-7 h-7 bg-amber-500 text-slate-950 border-2 border-white z-25"
                    : "w-6 h-6 bg-slate-800/90 text-slate-200 border border-slate-600 hover:bg-slate-700 z-10"
                }`}
              >
                {getSpotIcon(spot.iconType, isSelected ? "w-4 h-4" : "w-3 h-3")}
              </motion.button>

              {/* Pin Tag Label */}
              <div
                className={`absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold whitespace-nowrap shadow-md pointer-events-none transition-all ${
                  isSelected
                    ? "bg-indigo-600 text-white border border-indigo-400 opacity-100 scale-100 z-30"
                    : "bg-slate-900/90 text-slate-200 border border-slate-700/80 opacity-90 scale-95"
                }`}
              >
                {spot.shortName}
              </div>
            </div>
          );
        })}

        {/* Hover / Active Spot Floating Info Tooltip with AnimatePresence */}
        <AnimatePresence>
          {(hoveredSpot || activeSpot) && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="absolute bottom-2 left-2 right-2 sm:right-auto sm:max-w-xs p-2.5 rounded-xl bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white text-xs shadow-2xl z-40"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  <span className="font-bold text-[11px] truncate">
                    {(hoveredSpot || activeSpot).name}
                  </span>
                </div>
                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 shrink-0">
                  {(hoveredSpot || activeSpot).popularityPct}% students meet here
                </span>
              </div>
              <p className="text-[10px] text-slate-300 mt-1 leading-tight line-clamp-1">
                {(hoveredSpot || activeSpot).directions}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Spot Quick Carousel & Selection Details */}
      <div className="p-3.5 space-y-3">
        {/* Quick Location Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CAMPUS_HANDOVER_SPOTS.map((spot) => {
            const isSelected = activeSpot.id === spot.id;
            return (
              <motion.button
                key={spot.id}
                type="button"
                id={`quick-spot-pill-${spot.id}`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectLocation(spot.name)}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? "bg-indigo-600 text-white shadow-sm ring-1 ring-indigo-400"
                    : isDark
                    ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/80"
                    : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 shadow-2xs"
                }`}
              >
                {getSpotIcon(spot.iconType, "w-3 h-3")}
                <span>{spot.shortName}</span>
                {isSelected && <CheckCircle2 className="w-3 h-3 ml-0.5" />}
              </motion.button>
            );
          })}
        </div>

        {/* Selected Spot Deep Dive Card */}
        <div
          className={`p-3 rounded-xl border text-xs transition-colors ${
            isDark
              ? "bg-slate-800/60 border-slate-700/80"
              : "bg-white border-slate-200"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
            <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>{activeSpot.name}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400">
              <Clock className="w-3 h-3 text-blue-500" />
              <span>Recommended: {activeSpot.bestTimes}</span>
            </div>
          </div>

          {/* Safety & Convenience Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {activeSpot.safetyFeatures.map((feat) => (
              <span
                key={feat}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              >
                <CheckCircle2 className="w-2.5 h-2.5 text-emerald-500" />
                {feat}
              </span>
            ))}
          </div>

          {/* Handover Tip */}
          <div className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-900/60 p-2 rounded-lg border border-slate-200/60 dark:border-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
            <p>
              <strong className="font-semibold text-slate-900 dark:text-white">
                Peer Coordination Tip:
              </strong>{" "}
              {activeSpot.handoverTips}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
