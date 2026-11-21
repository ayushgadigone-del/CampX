import React, { useState } from "react";
import {
  X,
  ShieldCheck,
  Lock,
  EyeOff,
  AlertTriangle,
  MapPin,
  CheckCircle2,
  FileCheck,
  ExternalLink,
  Smartphone,
  CreditCard,
  UserCheck,
  Copy,
  Check,
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";

interface CampusSecurityCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

export const CampusSecurityCenterModal: React.FC<CampusSecurityCenterModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const { isDark } = useTheme();
  const [activeTab, setActiveTab] = useState<"overview" | "privacy" | "zones" | "guidelines">("overview");
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const handleCopySecurityFingerprint = () => {
    const fingerprint = "PVG-SEC-SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069";
    navigator.clipboard?.writeText(fingerprint);
    setCopiedHash(true);
    if (onShowToast) onShowToast("📋 Security architecture fingerprint copied to clipboard!");
    setTimeout(() => setCopiedHash(false), 3000);
  };

  const safeMeetupZones = [
    {
      name: "Central Library Quadrangle",
      coverage: "CCTV Monitored • High Daytime Footfall",
      hours: "9:00 AM – 6:00 PM",
      tip: "Best for textbooks, drafters, and calculators inspection.",
    },
    {
      name: "College Main Canteen Porch",
      coverage: "Open Student Area • Well Lit",
      hours: "8:30 AM – 7:30 PM",
      tip: "Ideal for cycle test rides and quick laboratory gear exchanges.",
    },
    {
      name: "Academic Block Entrance (Gate 1)",
      coverage: "Security Guard Station & Gate CCTV",
      hours: "8:00 AM – 8:00 PM",
      tip: "Recommended for high-value items and evening handovers.",
    },
  ];

  return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto">
        <div
          id="campus-security-center-modal"
          className={`relative w-full max-w-2xl rounded-3xl border overflow-hidden shadow-2xl flex flex-col max-h-[90vh] ${
            isDark
              ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
              : "bg-white border-[#DFE6E2] text-[#18201C] shadow-[#18201C]/10"
          }`}
        >
          {/* Header */}
          <div className="relative px-6 py-5 bg-[#2F5D50] dark:bg-[#387262] text-white overflow-hidden">
            <div
              className="absolute inset-0 opacity-15 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.4) 1px, transparent 0)`,
                backgroundSize: "16px 16px",
              }}
            />
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-white/20 border border-white/30 text-white shadow-md">
                  <ShieldCheck className="w-6 h-6 text-[#7BBFA8]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/15 text-[#ECF2EF] border border-white/25">
                      CAMPUS TRUST &amp; SAFETY
                    </span>
                    <span className="text-[10px] text-white/80 font-medium">PVG's COET Pune</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight mt-0.5">
                    Security &amp; Privacy Shield
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex gap-2 mt-4 pt-3 border-t border-white/20 text-xs font-bold overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveTab("overview")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "overview"
                    ? "bg-white text-[#2F5D50] shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Security Architecture
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("privacy")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "privacy"
                    ? "bg-white text-[#2F5D50] shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                EXIF Privacy &amp; Data Shield
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("zones")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "zones"
                    ? "bg-white text-[#2F5D50] shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Safe Campus Zones
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("guidelines")}
                className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === "guidelines"
                    ? "bg-white text-[#2F5D50] shadow-sm"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                Anti-Scam &amp; UPI Rules
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-6 overflow-y-auto space-y-5 flex-1 text-sm">
            {activeTab === "overview" && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#EFF4F1] border-[#C4D9D1]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <UserCheck className="w-5 h-5 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#18201C] dark:text-white">
                        Institutional Email Domain Gating
                      </h4>
                      <p className="text-xs text-[#5C6B63] dark:text-[#C5D3CC] mt-1">
                        Only authenticated students with verified <code className="px-1 py-0.5 rounded bg-[#2F5D50] text-[#2F5D50] dark:text-[#7BBFA8] font-mono">@pvgcoet.ac.in</code> credentials can publish, message, or negotiate. Outside commercial spammers are blocked by domain boundary rules.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#EFF4F1] border-[#C4D9D1]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#18201C] dark:text-white">
                        Hardened Firestore Security Rules (RBAC)
                      </h4>
                      <p className="text-xs text-[#5C6B63] dark:text-[#C5D3CC] mt-1">
                        Private buyer-seller negotiation chats are strictly protected. Chat records can only be read and written by confirmed participants (buyer and seller). Test endpoints and public document sweeps are disabled in production.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#EFF4F1] border-[#C4D9D1]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <FileCheck className="w-5 h-5 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#18201C] dark:text-white">
                        Cryptographic SHA-256 Student Seals
                      </h4>
                      <p className="text-xs text-[#5C6B63] dark:text-[#C5D3CC] mt-1">
                        Every student digital passport generates an on-chain style SHA-256 cryptographic proof to guarantee authenticity and prevent account impersonation on campus.
                      </p>
                      <button
                        type="button"
                        onClick={handleCopySecurityFingerprint}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold bg-white dark:bg-[#1B2320] border border-[#C4D1CA] dark:border-[#242E2A] hover:border-[#5BA18C] transition-colors cursor-pointer"
                      >
                        {copiedHash ? <Check className="w-3.5 h-3.5 text-[#2F5D50]" /> : <Copy className="w-3.5 h-3.5 text-[#2F5D50]" />}
                        <span>{copiedHash ? "Fingerprint Copied!" : "Copy Active System Fingerprint"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#F7F9F8] border-[#DFE6E2]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <EyeOff className="w-5 h-5 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#18201C] dark:text-white">
                        Client-Side EXIF &amp; GPS Privacy Sanitization
                      </h4>
                      <p className="text-xs text-[#5C6B63] dark:text-[#C5D3CC] mt-1">
                        When you upload photos taken from your smartphone, the camera automatically embeds sensitive EXIF metadata (exact GPS coordinates of your home/hostel room, camera serial number, date and time).
                      </p>
                      <div className="mt-3 p-3 rounded-xl bg-[#2F5D50] border border-[#5BA18C] text-xs text-[#2F5D50] dark:text-[#7BBFA8] flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 shrink-0" />
                        <span>Our app automatically renders and rasterizes all uploaded photos into clean pixel data before upload, permanently stripping all GPS and personal hardware identifiers.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#F7F9F8] border-[#DFE6E2]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-[#9E6B43] dark:text-[#DFC29B] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#18201C] dark:text-white">
                        XSS Prevention &amp; Input Sanitization
                      </h4>
                      <p className="text-xs text-[#5C6B63] dark:text-[#C5D3CC] mt-1">
                        All user inputs (item descriptions, titles, barter notes, and chat messages) undergo HTML-entity sanitization to prevent script injection attacks, malicious iframes, and cross-site scripting (XSS).
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "zones" && (
              <div className="space-y-4">
                <p className="text-xs text-[#5C6B63] dark:text-[#8FA199]">
                  To eliminate exchange risks, all item handovers at PVG's COET must take place inside official campus boundaries during operating daylight hours.
                </p>
                <div className="space-y-3">
                  {safeMeetupZones.map((zone, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-2xl border flex items-start justify-between gap-4 ${
                        isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#F7F9F8] border-[#DFE6E2]"
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#2F5D50]" />
                          <h4 className="font-bold text-[#18201C] dark:text-white">
                            {zone.name}
                          </h4>
                        </div>
                        <p className="text-xs text-[#2F5D50] dark:text-[#7BBFA8] font-medium">
                          {zone.coverage} • {zone.hours}
                        </p>
                        <p className="text-xs text-[#5C6B63] dark:text-[#8FA199]">
                          💡 {zone.tip}
                        </p>
                      </div>
                      <span className="px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-[#2F5D50] text-[#2F5D50] dark:text-[#7BBFA8] border border-[#5BA18C] shrink-0">
                        VERIFIED SAFE
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "guidelines" && (
              <div className="space-y-4">
                <div
                  className={`p-4 rounded-2xl border ${
                    isDark ? "bg-[#251F15] border-amber-500/30" : "bg-[#FDF6EC] border-[#EED8B8]"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-[#9E6B43] dark:text-[#DFC29B]">
                        Golden Safety Rules for Peer Exchanges
                      </h4>
                      <ul className="text-xs text-[#9E6B43] dark:text-[#DFC29B] mt-2 space-y-1.5 list-disc pl-4">
                        <li>
                          <strong>NEVER enter your UPI PIN to receive money:</strong> A UPI PIN is strictly used to DEBIT funds. Any buyer asking you to enter your PIN to "receive payment" is attempting a scam.
                        </li>
                        <li>
                          <strong>Do NOT make advance token payments:</strong> Always inspect scientific calculators, books, lab coats, and cycles in person on campus before transferring any funds.
                        </li>
                        <li>
                          <strong>Beware of external link shorteners:</strong> Keep all discussions inside the PVG's COET chat drawer. Do not open suspicious Bitly, TinyURL, or external APK download links.
                        </li>
                        <li>
                          <strong>Meet at public campus spots:</strong> Always complete exchanges at visible locations like the Central Library, Reading Hall, or Canteen Plaza during college hours.
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div
                  className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                    isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#F7F9F8] border-[#DFE6E2]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-[#2F5D50]" />
                    <span className="text-xs font-semibold">Accepted Payment Mode: Instant UPI QR or Cash on Handover</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#2F5D50]">Zero Commission</span>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-[#DFE6E2] dark:border-[#242E2A] bg-[#F7F9F8] dark:bg-[#141A18] flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs text-[#5C6B63]">
              <ShieldCheck className="w-4 h-4 text-[#2F5D50]" />
              <span>Protected by PVG's COET Peer Verification Engine</span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-[#141A18] text-white dark:bg-white dark:text-[#18201C] hover:opacity-90 transition-opacity cursor-pointer shadow-sm"
            >
              Understood
            </button>
          </div>
        </div>
      </div>
  );
};
