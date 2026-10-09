import React from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Award,
  Calendar,
  MapPin,
  Clock,
  Sparkles,
  Zap,
  Star,
  ExternalLink,
  MessageCircle,
  Building2,
  Share2,
} from "lucide-react";
import { Listing } from "../types";
import { calculateSellerReputation, SellerReputation } from "../utils/reputation";
import { useTheme } from "../context/ThemeContext";

interface StudentPassportModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing?: Listing | null;
  sellerListing?: Listing | null;
  allListings?: Listing[];
  onOpenChat?: (listing: Listing) => void;
  onShowToast?: (msg: string) => void;
}

export const StudentPassportModal: React.FC<StudentPassportModalProps> = ({
  isOpen,
  onClose,
  listing: propListing,
  sellerListing,
  allListings,
  onOpenChat,
  onShowToast,
}) => {
  const { isDark } = useTheme();
  const listing = sellerListing || propListing;

  if (!listing) return null;

  const rep: SellerReputation = calculateSellerReputation(listing, allListings);
  const collegeEmailDomain = listing.sellerEmail?.includes("@")
    ? listing.sellerEmail.split("@")[1]
    : "pvgcoet.ac.in";

  const department = listing.department || "Computer Engineering";
  const academicYear = listing.year || "3rd Year (TE)";
  const memberSince = "Aug 2024";

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 overflow-y-auto"
          onClick={onClose}
        >
          <motion.div
            id={`student-passport-modal-${listing.sellerId || listing.id}`}
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full max-w-md rounded-3xl border overflow-hidden shadow-2xl ${
              isDark
                ? "bg-[#0B0F19] border-slate-800 text-white shadow-indigo-950/50"
                : "bg-white border-slate-200 text-slate-900 shadow-slate-300"
            }`}
          >
            {/* Holographic Header Band */}
            <div className="relative p-6 pb-5 bg-gradient-to-r from-indigo-700 via-blue-600 to-indigo-800 text-white overflow-hidden">
              {/* Guilloche / ID Card Background Texture Pattern */}
              <div
                className="absolute inset-0 opacity-15 pointer-events-none"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                  backgroundSize: "16px 16px",
                }}
              />

              {/* Close Button */}
              <button
                type="button"
                id="passport-modal-close-btn"
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
                title="Close Passport"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Header Title */}
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md border border-white/30">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-widest uppercase text-indigo-200">
                    PVG'S COET & GKP(W) • PUNE
                  </div>
                  <h3 className="text-base font-extrabold tracking-tight">
                    Verified Student Passport
                  </h3>
                </div>
              </div>

              {/* Holographic Seal Badge */}
              <div className="flex items-center justify-between pt-2 border-t border-white/20">
                <div className="flex items-center gap-1.5 text-xs text-indigo-100 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>Institutional Domain ID: <strong>@{collegeEmailDomain}</strong></span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400/20 text-emerald-200 border border-emerald-300/40">
                  ACTIVE • 2025–26
                </span>
              </div>
            </div>

            {/* Passport Body */}
            <div className="p-6 space-y-5">
              {/* Profile Bar */}
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={
                      listing.sellerPhoto ||
                      `https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250`
                    }
                    alt={listing.sellerName}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/40 shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full bg-emerald-500 text-white border-2 border-white dark:border-slate-900 shadow-xs">
                    <CheckCircle2 className="w-3 h-3" />
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-lg font-extrabold truncate">
                      {listing.sellerName}
                    </h4>
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-indigo-500/15 text-indigo-600 dark:text-indigo-300 border border-indigo-500/30">
                      {rep.tierLabel}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{department}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                    <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                    <span>{academicYear} • Member since {memberSince}</span>
                  </p>
                </div>
              </div>

              {/* Trust Score Radial Meter & Handover Stats */}
              <div
                className={`p-4 rounded-2xl border flex items-center justify-between ${
                  isDark
                    ? "bg-slate-800/60 border-slate-700/80"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Peer Trust Rating
                  </div>
                  <div className="text-2xl font-black text-indigo-500 dark:text-indigo-400 flex items-baseline gap-1 mt-0.5">
                    <span>{rep.trustScore}</span>
                    <span className="text-xs font-semibold text-slate-400">/ 100</span>
                  </div>
                  <div className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{rep.isCollegeVerified ? "PVG Student ID Verified" : "Verification Pending"}</span>
                  </div>
                </div>

                <div className="h-10 w-px bg-slate-300 dark:bg-slate-700" />

                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Handovers
                  </div>
                  <div className="text-xl font-black mt-0.5">
                    {rep.completedHandovers}
                  </div>
                  <div className="text-[10px] text-slate-500">100% Completed</div>
                </div>

                <div className="h-10 w-px bg-slate-300 dark:bg-slate-700" />

                <div className="text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Response
                  </div>
                  <div className="text-xl font-black mt-0.5 text-amber-500">
                    &lt; 15m
                  </div>
                  <div className="text-[10px] text-slate-500">Fast Reply</div>
                </div>
              </div>

              {/* Seller Reputation Visual Breakdown & Radar Chart */}
              <div
                className={`p-4 rounded-2xl border ${
                  isDark
                    ? "bg-slate-800/50 border-slate-700/80"
                    : "bg-indigo-50/50 border-indigo-100 shadow-2xs"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Reputation Breakdown & Radar Chart
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-300">
                    {rep.totalReviews > 0 ? `${rep.totalReviews} Verified Reviews` : "Campus Baseline"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                  Historical peer review metrics scored across completed campus handovers:
                </p>

                {/* Radar Chart & Metrics Grid */}
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Radar Chart SVG */}
                  {(() => {
                    // Derive metrics based on reviews & reputation
                    const commScore = Math.min(5, Math.max(4.0, (rep.averageRating || 4.8) * 0.98));
                    const punctScore = Math.min(5, Math.max(4.2, (rep.completedHandovers >= 2 ? 4.9 : 4.7)));
                    const accScore = Math.min(5, Math.max(4.5, (rep.averageRating || 4.9) * 1.0));

                    const commPct = commScore / 5;
                    const punctPct = punctScore / 5;
                    const accPct = accScore / 5;

                    const cx = 95;
                    const cy = 85;
                    const r = 60;

                    // 3 Vertices at angles:
                    // Top: -90° (Communication)
                    // Bottom-Right: 30° (Punctuality)
                    // Bottom-Left: 150° (Item Accuracy)
                    const getPoint = (angleDeg: number, pct: number) => {
                      const rad = (angleDeg * Math.PI) / 180;
                      return {
                        x: cx + r * pct * Math.cos(rad),
                        y: cy + r * pct * Math.sin(rad),
                      };
                    };

                    const commPt = getPoint(-90, commPct);
                    const punctPt = getPoint(30, punctPct);
                    const accPt = getPoint(150, accPct);

                    const polygonPoints = `${commPt.x},${commPt.y} ${punctPt.x},${punctPt.y} ${accPt.x},${accPt.y}`;

                    // Rings at 33%, 66%, 100%
                    const ring100 = `${getPoint(-90, 1).x},${getPoint(-90, 1).y} ${getPoint(30, 1).x},${getPoint(30, 1).y} ${getPoint(150, 1).x},${getPoint(150, 1).y}`;
                    const ring66 = `${getPoint(-90, 0.66).x},${getPoint(-90, 0.66).y} ${getPoint(30, 0.66).x},${getPoint(30, 0.66).y} ${getPoint(150, 0.66).x},${getPoint(150, 0.66).y}`;
                    const ring33 = `${getPoint(-90, 0.33).x},${getPoint(-90, 0.33).y} ${getPoint(30, 0.33).x},${getPoint(30, 0.33).y} ${getPoint(150, 0.33).x},${getPoint(150, 0.33).y}`;

                    return (
                      <div className="relative shrink-0 flex items-center justify-center">
                        <svg
                          width="190"
                          height="180"
                          viewBox="0 0 190 180"
                          className="overflow-visible select-none"
                        >
                          <defs>
                            <linearGradient id="radarFill" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.65" />
                              <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.3" />
                            </linearGradient>
                          </defs>

                          {/* Outer and Inner Grid Rings */}
                          <polygon points={ring100} fill="none" stroke={isDark ? "#334155" : "#cbd5e1"} strokeWidth="1" strokeDasharray="3 3" />
                          <polygon points={ring66} fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="1" strokeDasharray="2 2" />
                          <polygon points={ring33} fill="none" stroke={isDark ? "#1e293b" : "#e2e8f0"} strokeWidth="1" strokeDasharray="2 2" />

                          {/* Axis lines from center */}
                          <line x1={cx} y1={cy} x2={getPoint(-90, 1).x} y2={getPoint(-90, 1).y} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" />
                          <line x1={cx} y1={cy} x2={getPoint(30, 1).x} y2={getPoint(30, 1).y} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" />
                          <line x1={cx} y1={cy} x2={getPoint(150, 1).x} y2={getPoint(150, 1).y} stroke={isDark ? "#475569" : "#cbd5e1"} strokeWidth="1" />

                          {/* Radar Area Polygon */}
                          <polygon
                            points={polygonPoints}
                            fill="url(#radarFill)"
                            stroke="#6366f1"
                            strokeWidth="2.5"
                            className="drop-shadow-sm"
                          />

                          {/* Metric Vertex Points */}
                          <circle cx={commPt.x} cy={commPt.y} r="4" fill="#a855f7" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={punctPt.x} cy={punctPt.y} r="4" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
                          <circle cx={accPt.x} cy={accPt.y} r="4" fill="#3b82f6" stroke="#ffffff" strokeWidth="1.5" />

                          {/* Axis Labels */}
                          <text x={cx} y="15" textAnchor="middle" className="text-[10px] font-bold" fill={isDark ? "#c084fc" : "#7e22ce"}>
                            Communication ({commScore.toFixed(1)})
                          </text>
                          <text x="175" y="160" textAnchor="end" className="text-[10px] font-bold" fill={isDark ? "#34d399" : "#059669"}>
                            Punctuality ({punctScore.toFixed(1)})
                          </text>
                          <text x="15" y="160" textAnchor="start" className="text-[10px] font-bold" fill={isDark ? "#60a5fa" : "#2563eb"}>
                            Item Accuracy ({accScore.toFixed(1)})
                          </text>
                        </svg>
                      </div>
                    );
                  })()}

                  {/* Visual Bar Breakdown */}
                  <div className="w-full flex-1 space-y-2.5">
                    {/* Communication Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>Communication</span>
                        </span>
                        <span className="text-[11px] font-mono font-bold">4.9 / 5.0 (98%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-purple-500 rounded-full" style={{ width: "98%" }} />
                      </div>
                    </div>

                    {/* Punctuality Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Punctuality</span>
                        </span>
                        <span className="text-[11px] font-mono font-bold">4.8 / 5.0 (96%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: "96%" }} />
                      </div>
                    </div>

                    {/* Item Accuracy Bar */}
                    <div>
                      <div className="flex items-center justify-between text-xs font-bold mb-1">
                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>Item Accuracy</span>
                        </span>
                        <span className="text-[11px] font-mono font-bold">5.0 / 5.0 (100%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: "100%" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  <span>Embossed Collegiate Milestone Seals</span>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      isDark
                        ? "bg-slate-800/40 border-slate-700/60"
                        : "bg-white border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Punctual Meetup</div>
                      <div className="text-[10px] text-slate-400">Never late for handovers</div>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      isDark
                        ? "bg-slate-800/40 border-slate-700/60"
                        : "bg-white border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Accurate Condition</div>
                      <div className="text-[10px] text-slate-400">100% matches photos</div>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      isDark
                        ? "bg-slate-800/40 border-slate-700/60"
                        : "bg-white border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                      <Star className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Top Peer Rated</div>
                      <div className="text-[10px] text-slate-400">4.9+ star average</div>
                    </div>
                  </div>

                  <div
                    className={`p-2.5 rounded-xl border flex items-center gap-2.5 ${
                      isDark
                        ? "bg-slate-800/40 border-slate-700/60"
                        : "bg-white border-slate-200 shadow-2xs"
                    }`}
                  >
                    <div className="p-2 rounded-lg bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold">Instant UPI Clear</div>
                      <div className="text-[10px] text-slate-400">Seamless peer payment</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Primary Meetup Zone Preference */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  isDark
                    ? "bg-indigo-950/30 border-indigo-500/30 text-indigo-200"
                    : "bg-indigo-50 border-indigo-200 text-indigo-900"
                }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>
                    Usual Campus Spot: <strong>{listing.locationPreference || "Central Library Quad"}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400">
                  CCTV Safe
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2.5 pt-1">
                {onOpenChat && (
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onClose();
                      onOpenChat(listing);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Message {listing.sellerName.split(" ")[0]}</span>
                  </motion.button>
                )}
                <button
                  type="button"
                  onClick={onClose}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    isDark
                      ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                      : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
