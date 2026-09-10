import React, { useState } from "react";
import {
  X,
  Users,
  Award,
  BookOpen,
  Server,
  Cloud,
  Layers,
  Terminal,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

interface PBLProjectInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PBLProjectInfoModal: React.FC<PBLProjectInfoModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<"team" | "pbl" | "deploy">("team");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        id="pbl-project-modal"
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  Campus Resale & Exchange Platform
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  PBL 2nd Year CSE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Problem-Based Learning Project • Guided by Prof. Snehal Kokil
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-100 px-6 bg-slate-50/50">
          <button
            onClick={() => setActiveTab("team")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "team"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <Users className="w-4 h-4" />
            Team & Mentorship
          </button>
          <button
            onClick={() => setActiveTab("pbl")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "pbl"
                ? "border-indigo-600 text-indigo-700"
                : "border-transparent text-slate-600 hover:text-slate-900"
            }`}
          >
            <BookOpen className="w-4 h-4" />
            PBL Weeks 1–7 Scope
          </button>
          <button
            onClick={() => setActiveTab("deploy")}
            className={`py-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "deploy"
                ? "border-indigo-600 text-indigo-700"
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
              <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white font-bold flex items-center justify-center text-lg shadow-sm">
                  SK
                </div>
                <div>
                  <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider block">
                    Project Guide & Mentor
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Prof. Snehal Kokil
                  </h3>
                  <span className="text-xs text-slate-600">
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
                  <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Ayush Gadigone</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Roll No. 26
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 block mt-0.5">
                      Server & Core Logic
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Backend Development, Listing & Search Engine, Express API Design & Gemini 3.1 Pro integration.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Parshwa Gandhi</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Roll No. 28
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 block mt-0.5">
                      User Interface & Design
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Frontend React components, Tailwind styling, real-time chat interface & responsive layouts.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Omkar Ghadashi</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Roll No. 32
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 block mt-0.5">
                      Data & Security
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Firestore database architecture, college domain authentication, image pipeline & ABAC security rules.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition-colors">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-slate-900">Krishna Gopnarayan</h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        Roll No. 35
                      </span>
                    </div>
                    <span className="text-xs font-semibold text-indigo-600 block mt-0.5">
                      Quality & Deployment
                    </span>
                    <p className="text-xs text-slate-500 mt-1">
                      Testing & verification, Google Calendar OAuth integration, build pipelines & documentation.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "pbl" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block text-sm">
                  Problem Statement (Week 1)
                </span>
                <p className="text-slate-600 leading-relaxed">
                  Students often have unused books, calculators, lab equipment, cycles, and bags that could be useful to peers. Scattered WhatsApp groups and open marketplaces lack verified student identities, search structure, and safe campus handover mechanisms.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 block">Week 2: Literature Survey</span>
                  <p className="text-slate-500">
                    Reviewed 12 research papers (arXiv, MDPI, IEEE, Springer) on C2C secondhand marketplaces, trust models (Karrot, OLX), and circular campus economy.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 block">Week 3: Problem Formulation</span>
                  <p className="text-slate-500">
                    Defined exact scope: College-restricted marketplace, item listing & filter engine, in-app negotiation, and safe on-campus handovers.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 block">Week 4: Software / Hardware</span>
                  <p className="text-slate-500">
                    React.js, Tailwind CSS, Express backend, Google Gemini 3.1 Pro for AI inspection, Google Calendar for handover appointments, and Cloud Firestore.
                  </p>
                </div>

                <div className="p-3 rounded-xl border border-slate-200 bg-white space-y-1">
                  <span className="font-bold text-slate-800 block">Week 5 & 6: System Design</span>
                  <p className="text-slate-500">
                    Three-tier architecture (Client – App – Firestore & Gemini), DFD Level 0 & 1, Sequence Diagram for Search → Chat → Handover.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <span className="font-bold text-xs flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Week 7: Data Collection & Seed Dataset
                </span>
                <p className="text-slate-600">
                  Pre-seeded with authentic engineering textbooks (B.S. Grewal, Silberschatz), Casio FX-991ES calculators, Workshop calipers, and campus bicycles with full AI condition assessments.
                </p>
              </div>
            </div>
          )}

          {activeTab === "deploy" && (
            <div className="space-y-4 animate-in fade-in duration-200 text-xs">
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 space-y-2">
                <span className="font-bold text-indigo-950 text-sm block">
                  How This App Is Built & Deployed
                </span>
                <p className="text-slate-700 leading-relaxed">
                  The application is a full-stack Node.js + Express backend serving a React 19 + Tailwind CSS frontend, compiled with esbuild and Vite into a single containerized service.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Cloud className="w-4 h-4 text-indigo-600" />
                    1. Cloud Run / AI Studio Deployment (Active)
                  </span>
                  <p className="text-slate-600">
                    The build system automatically runs <code>npm run build</code> which executes <code>vite build</code> and packages <code>server.ts</code> into <code>dist/server.cjs</code>. To deploy, click <strong>Deploy</strong> in the AI Studio menu.
                  </p>
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px]">
                    npm run build && npm start
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-emerald-600" />
                    2. Deploying to Render / Railway / Heroku
                  </span>
                  <p className="text-slate-600">
                    Connect your GitHub repository. Set the build command to <code>npm run build</code> and the start command to <code>npm start</code>. Add <code>GEMINI_API_KEY</code> in the Environment Variables dashboard.
                  </p>
                </div>

                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                  <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                    <Terminal className="w-4 h-4 text-purple-600" />
                    3. Required Environment Variables
                  </span>
                  <div className="bg-slate-900 text-slate-200 p-2.5 rounded-lg font-mono text-[11px] space-y-1">
                    <div>GEMINI_API_KEY="Your-Google-Gemini-Key"</div>
                    <div>APP_URL="https://your-domain.run.app"</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
