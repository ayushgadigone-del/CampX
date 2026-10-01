import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Users,
  Award,
  BookOpen,
  Server,
  Cloud,
  Layers,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Key,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface PBLProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PBLProjectInfoModal: React.FC<PBLProjectInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"team" | "pbl" | "deploy">("team");

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
            id="pbl-project-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-3xl rounded-2xl shadow-2xl border overflow-hidden my-8 ${
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
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2
                      className={`text-lg font-bold ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Campus Resale & Exchange Platform
                    </h2>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isDark
                          ? "bg-emerald-900/40 text-emerald-300 border border-emerald-800/60"
                          : "bg-emerald-100 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      PBL 2nd Year CSE
                    </span>
                  </div>
                  <p
                    className={`text-xs ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    Project Based Learning • Guided by Prof. Snehal Kokil
                  </p>
                </div>
              </div>
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

            {/* Tab Navigation */}
            <div
              className={`flex border-b px-6 ${
                isDark
                  ? "border-slate-800 bg-slate-900/40"
                  : "border-slate-100 bg-slate-50/50"
              }`}
            >
              <button
                onClick={() => setActiveTab("team")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "team"
                    ? isDark
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-600 text-indigo-700"
                    : isDark
                    ? "border-transparent text-slate-400 hover:text-slate-200"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Users className="w-4 h-4" />
                Team & Mentorship
              </button>
              <button
                onClick={() => setActiveTab("pbl")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "pbl"
                    ? isDark
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-600 text-indigo-700"
                    : isDark
                    ? "border-transparent text-slate-400 hover:text-slate-200"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                PBL Weeks 1–7 Scope
              </button>
              <button
                onClick={() => setActiveTab("deploy")}
                className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "deploy"
                    ? isDark
                      ? "border-indigo-400 text-indigo-400"
                      : "border-indigo-600 text-indigo-700"
                    : isDark
                    ? "border-transparent text-slate-400 hover:text-slate-200"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Cloud className="w-4 h-4" />
                Deployment & Production Guide
              </button>
            </div>

            {/* Body Content */}
            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {activeTab === "team" && (
                <div className="space-y-5 animate-in fade-in duration-200">
                  {/* Mentor card */}
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-4 ${
                      isDark
                        ? "bg-indigo-950/30 border-indigo-900/50"
                        : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100"
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                      SK
                    </div>
                    <div>
                      <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
                        Project Guide & Mentor
                      </span>
                      <h3
                        className={`text-base font-bold ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        Prof. Snehal Kokil
                      </h3>
                      <span
                        className={`text-xs ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        Department of Computer Science & Engineering
                      </span>
                    </div>
                  </div>

                  {/* Student Team Grid */}
                  <div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">
                      Student Development Team (2nd Year CS)
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        className={`p-4 rounded-xl border transition-colors ${
                          isDark
                            ? "border-slate-800 bg-slate-900/60 hover:border-indigo-500/50"
                            : "border-slate-200 bg-white hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-bold ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            Ayush Gadigone
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDark
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            Roll No. 26
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400 block mt-0.5">
                          Server & Core Logic
                        </span>
                        <p
                          className={`text-xs mt-1 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Backend Development, Listing & Search Engine, Express API Design & Gemini integration.
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-xl border transition-colors ${
                          isDark
                            ? "border-slate-800 bg-slate-900/60 hover:border-indigo-500/50"
                            : "border-slate-200 bg-white hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-bold ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            Parshwa Gandhi
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDark
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            Roll No. 28
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400 block mt-0.5">
                          User Interface & Design
                        </span>
                        <p
                          className={`text-xs mt-1 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Frontend React components, Tailwind styling, real-time chat interface & responsive layouts.
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-xl border transition-colors ${
                          isDark
                            ? "border-slate-800 bg-slate-900/60 hover:border-indigo-500/50"
                            : "border-slate-200 bg-white hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-bold ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            Omkar Ghadashi
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDark
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            Roll No. 32
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400 block mt-0.5">
                          Data & Security
                        </span>
                        <p
                          className={`text-xs mt-1 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Firestore database architecture, college domain authentication, image pipeline & ABAC security rules.
                        </p>
                      </div>

                      <div
                        className={`p-4 rounded-xl border transition-colors ${
                          isDark
                            ? "border-slate-800 bg-slate-900/60 hover:border-indigo-500/50"
                            : "border-slate-200 bg-white hover:border-indigo-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4
                            className={`text-sm font-bold ${
                              isDark ? "text-white" : "text-slate-900"
                            }`}
                          >
                            Krishna Gopnarayan
                          </h4>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              isDark
                                ? "bg-slate-800 text-slate-300"
                                : "bg-slate-100 text-slate-700"
                            }`}
                          >
                            Roll No. 35
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-indigo-400 block mt-0.5">
                          Quality & Deployment
                        </span>
                        <p
                          className={`text-xs mt-1 ${
                            isDark ? "text-slate-400" : "text-slate-500"
                          }`}
                        >
                          Testing & verification, Google Calendar OAuth integration, build pipelines & documentation.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "pbl" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      isDark
                        ? "bg-slate-900/80 border-slate-800"
                        : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <span
                      className={`font-bold block text-sm ${
                        isDark ? "text-white" : "text-slate-900"
                      }`}
                    >
                      Problem Statement (Week 1)
                    </span>
                    <p
                      className={`leading-relaxed ${
                        isDark ? "text-slate-300" : "text-slate-600"
                      }`}
                    >
                      Students often have unused books, calculators, lab equipment, cycles, and bags that could be useful to peers. Scattered WhatsApp groups and open marketplaces lack verified student identities, search structure, and safe campus handover mechanisms.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        isDark
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`font-bold block ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        Week 2: Literature Survey
                      </span>
                      <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                        Reviewed 12 research papers on C2C secondhand marketplaces, trust models, and circular campus economy.
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        isDark
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`font-bold block ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        Week 3: Problem Formulation
                      </span>
                      <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                        Defined exact scope: College-restricted marketplace, item listing & filter engine, in-app negotiation, and safe on-campus handovers.
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        isDark
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`font-bold block ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        Week 4: Software / Hardware
                      </span>
                      <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                        React.js, Tailwind CSS, Express backend, Google Gemini AI inspection, Google Calendar, and Cloud Firestore.
                      </p>
                    </div>

                    <div
                      className={`p-3 rounded-xl border space-y-1 ${
                        isDark
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <span
                        className={`font-bold block ${
                          isDark ? "text-slate-200" : "text-slate-800"
                        }`}
                      >
                        Week 5 & 6: System Design
                      </span>
                      <p className={isDark ? "text-slate-400" : "text-slate-500"}>
                        Three-tier architecture (Client – App – Firestore & Gemini), DFD Level 0 & 1, Sequence Diagram for Search → Chat → Handover.
                      </p>
                    </div>
                  </div>

                  <div
                    className={`p-4 rounded-xl border space-y-1 ${
                      isDark
                        ? "bg-emerald-950/30 border-emerald-900/50 text-emerald-200"
                        : "bg-emerald-50 border-emerald-200 text-emerald-900"
                    }`}
                  >
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      Week 7: Data Collection & Seed Dataset
                    </span>
                    <p className={isDark ? "text-slate-300" : "text-slate-600"}>
                      Pre-seeded with authentic engineering textbooks (B.S. Grewal, Silberschatz), Casio FX-991ES calculators, Workshop calipers, and campus bicycles with full AI condition assessments.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "deploy" && (
                <div className="space-y-4 animate-in fade-in duration-200 text-xs">
                  <div
                    className={`p-4 rounded-xl border space-y-2 ${
                      isDark
                        ? "bg-indigo-950/30 border-indigo-900/50"
                        : "bg-indigo-50 border-indigo-200"
                    }`}
                  >
                    <span
                      className={`font-bold text-sm block ${
                        isDark ? "text-indigo-200" : "text-indigo-950"
                      }`}
                    >
                      How This App Is Built & Deployed
                    </span>
                    <p
                      className={`leading-relaxed ${
                        isDark ? "text-slate-300" : "text-slate-700"
                      }`}
                    >
                      The application is a full-stack Node.js + Express backend serving a React 19 + Tailwind CSS frontend, compiled with esbuild and Vite into a single containerized service.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div
                      className={`p-4 rounded-xl border space-y-2 ${
                        isDark
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span
                        className={`font-bold block flex items-center gap-1.5 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        <Cloud className="w-4 h-4 text-indigo-500" />
                        1. Cloud Run / AI Studio Deployment (Active)
                      </span>
                      <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                        The build system automatically runs <code>npm run build</code> which executes <code>vite build</code> and packages <code>server.ts</code> into <code>dist/server.cjs</code>. To deploy, click <strong>Deploy</strong> in the AI Studio menu.
                      </p>
                      <div className="bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] border border-slate-800">
                        npm run build && npm start
                      </div>
                    </div>

                    <div
                      className={`p-4 rounded-xl border space-y-2 ${
                        isDark
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span
                        className={`font-bold block flex items-center gap-1.5 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        <Server className="w-4 h-4 text-emerald-500" />
                        2. Deploying to Render / Railway / Heroku
                      </span>
                      <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                        Connect your GitHub repository. Set the build command to <code>npm run build</code> and the production start command to <code>npm start</code>. The platform handles backend containerization automatically.
                      </p>
                    </div>

                    <div
                      className={`p-4 rounded-xl border space-y-2 ${
                        isDark
                          ? "border-slate-800 bg-slate-900/60"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <span
                        className={`font-bold block flex items-center gap-1.5 ${
                          isDark ? "text-white" : "text-slate-900"
                        }`}
                      >
                        <Key className="w-4 h-4 text-amber-500" />
                        3. Environment and variables
                      </span>
                      <p className={isDark ? "text-slate-400" : "text-slate-600"}>
                        Set up your sensitive runtime secrets in your hosting dashboard or container environment. The server uses <code>GEMINI_API_KEY</code> on the backend to authenticate Google Gemini AI services without exposing keys to client browsers.
                      </p>
                      <div className="bg-slate-950 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] border border-slate-800">
                        GEMINI_API_KEY=your_gemini_api_key_here
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
