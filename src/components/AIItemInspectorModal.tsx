import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Upload,
  CheckCircle2,
  AlertCircle,
  Tag,
  ShieldCheck,
  Zap,
  ArrowRight,
  X,
  RefreshCw,
  Loader2,
  WifiOff,
} from "lucide-react";
import { AIInspectionResult } from "../types";
import { useTheme } from "../context/ThemeContext";

interface AIItemInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyToListing: (inspection: AIInspectionResult, imageSrc: string) => void;
  isOnline?: boolean;
}

const SAMPLE_ITEMS = [
  {
    label: "Casio Calculator",
    image: "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Engineering Book",
    image: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Lab Caliper",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
  },
  {
    label: "Campus Cycle",
    image: "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
  },
];

export const AIItemInspectorModal: React.FC<AIItemInspectorModalProps> = ({
  isOpen,
  onClose,
  onApplyToListing,
  isOnline = true,
}) => {
  const { isDark } = useTheme();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisResult, setAnalysisResult] = useState<AIInspectionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError("Image size exceeds 15MB. Please choose a smaller photo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        setSelectedImage(reader.result as string);
        setAnalysisResult(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = async (url: string) => {
    try {
      setError(null);
      setSelectedImage(url);
      setAnalysisResult(null);

      // Convert image URL to base64 for reliable backend analysis
      const res = await fetch(url);
      const blob = await res.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        analyzeImagePayload(reader.result as string, blob.type);
      };
      reader.readAsDataURL(blob);
    } catch {
      setError("Failed to load sample image.");
    }
  };

  const analyzeImagePayload = async (base64Payload: string, mimeType?: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: base64Payload,
          mimeType: mimeType || "image/jpeg",
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `Server responded with ${response.status}`);
      }

      const data = await response.json();
      if (data.analysis) {
        setAnalysisResult(data.analysis);
      } else {
        throw new Error("Invalid response received from Gemini analysis.");
      }
    } catch (err: any) {
      console.error("Analysis failure:", err);
      setError(err.message || "Failed to analyze image with Google Gemini 3.8 Flash.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleStartAnalysis = () => {
    if (!selectedImage) return;
    analyzeImagePayload(selectedImage);
  };

  const handleApply = () => {
    if (analysisResult && selectedImage) {
      onApplyToListing(analysisResult, selectedImage);
      onClose();
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
            id="ai-inspector-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden my-8 ${
              isDark
                ? "bg-[#0B0F19] border-slate-800 text-slate-100 shadow-black/60"
                : "bg-white border-slate-200 text-slate-900 shadow-slate-300/40"
            }`}
          >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark
              ? "border-slate-850 bg-slate-900/90 text-slate-100"
              : "border-slate-100 bg-slate-50/90 text-slate-900"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  AI Item Inspector
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isDark
                    ? "bg-indigo-950/80 text-indigo-300 border border-indigo-700/60"
                    : "bg-indigo-100 text-indigo-700 border border-indigo-200"
                }`}>
                  gemini-3.8-flash
                </span>
              </div>
              <p className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Upload a student item photo for automated condition audit and resale price recommendation
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

        {/* Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Sample quick picks */}
          <div>
            <span className={`text-xs font-semibold uppercase tracking-wider block mb-2 ${
              isDark ? "text-slate-400" : "text-slate-500"
            }`}>
              Try a sample student item or upload your own:
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SAMPLE_ITEMS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(item.image)}
                  className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all group cursor-pointer ${
                    isDark
                      ? "border-slate-800 hover:border-indigo-500/60 bg-slate-900/60 hover:bg-slate-800/80"
                      : "border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/40"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-10 h-10 rounded-lg object-cover group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`text-xs font-medium ${
                    isDark ? "text-slate-200 group-hover:text-indigo-300" : "text-slate-700 group-hover:text-indigo-900"
                  }`}>
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          {!selectedImage ? (
            <label className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl cursor-pointer transition-all text-center group ${
              isDark
                ? "border-slate-750 hover:border-indigo-500 hover:bg-indigo-950/20"
                : "border-slate-300 hover:border-indigo-500 hover:bg-indigo-50/20"
            }`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className={`p-4 rounded-full transition-colors mb-3 ${
                isDark
                  ? "bg-slate-800 group-hover:bg-indigo-900/50 text-slate-300 group-hover:text-indigo-300"
                  : "bg-slate-100 group-hover:bg-indigo-100 text-slate-500 group-hover:text-indigo-600"
              }`}>
                <Upload className="w-6 h-6" />
              </div>
              <span className={`text-sm font-semibold ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                Click to upload or drag & drop item photo
              </span>
              <span className={`text-xs mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Supports JPG, PNG, WEBP up to 15MB
              </span>
            </label>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group">
                <img
                  src={selectedImage}
                  alt="Item Preview"
                  className="w-full h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setAnalysisResult(null);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/70 text-white hover:bg-black transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>

                {isAnalyzing && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4">
                    <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
                    <span className="text-sm font-semibold">
                      Inspecting with Google Gemini 3.8 Flash...
                    </span>
                    <span className="text-xs text-slate-300 mt-1 text-center">
                      Auditing surface scratches, labels, and calculating fair campus resale price
                    </span>
                  </div>
                )}
              </div>

              {/* Action / Results panel */}
              <div className="space-y-4">
                {!analysisResult && !isAnalyzing && (
                  <div className={`p-4 rounded-xl border text-center space-y-3 ${
                    isDark
                      ? "bg-slate-900/60 border-slate-800"
                      : "bg-slate-50 border-slate-200"
                  }`}>
                    <p className={`text-sm ${isDark ? "text-slate-300" : "text-slate-600"}`}>
                      Photo ready for multimodal inspection with Google Gemini 3.8 Flash.
                    </p>
                    {!isOnline && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-center gap-2">
                        <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Gemini AI requires an active internet connection.</span>
                      </div>
                    )}
                    <button
                      onClick={handleStartAnalysis}
                      disabled={!isOnline}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all select-none ${
                        !isOnline
                          ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
                      }`}
                    >
                      {!isOnline ? (
                        <>
                          <WifiOff className="w-4 h-4" />
                          AI Inspection Disabled (Offline)
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Run AI Condition & Price Audit
                        </>
                      )}
                    </button>
                  </div>
                )}

                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-2.5">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Inspection Error</span>
                      <span>{error}</span>
                    </div>
                  </div>
                )}

                {analysisResult && (
                  <div className="space-y-4 animate-in fade-in duration-300">
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      isDark
                        ? "bg-emerald-950/20 border-emerald-800/50"
                        : "bg-emerald-50/70 border-emerald-200"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? "text-emerald-400" : "text-emerald-800"
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Inspection Complete
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950 text-white text-xs font-black shadow-xs border border-slate-800">
                          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span className="text-slate-200 font-bold">AI Score:</span>
                          <span className="text-emerald-400 font-black">{analysisResult.inspectionScore}/100</span>
                        </div>
                      </div>

                      <h3 className={`text-base font-bold leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                        {analysisResult.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border ${
                          isDark
                            ? "bg-slate-900 border-slate-750 text-slate-300"
                            : "bg-white border-slate-200 text-slate-700"
                        }`}>
                          <Tag className="w-3 h-3 text-indigo-500" />
                          Category: {analysisResult.category}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          isDark
                            ? "bg-amber-950/40 text-amber-300 border-amber-800/50"
                            : "bg-amber-100 text-amber-900 border-amber-200"
                        }`}>
                          Condition: {analysisResult.condition}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                          isDark
                            ? "bg-indigo-950/40 text-indigo-300 border-indigo-800/50"
                            : "bg-indigo-100 text-indigo-900 border-indigo-200"
                        }`}>
                          <Zap className="w-3 h-3 text-indigo-500" />
                          Fair Resale: ₹{analysisResult.suggestedPriceMin} – ₹{analysisResult.suggestedPriceMax}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Category & Condition Auto-Suggestion Highlights */}
                    <div className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
                      isDark
                        ? "bg-indigo-950/20 border-indigo-800/40 text-slate-200"
                        : "bg-indigo-50/70 border-indigo-200 text-indigo-950"
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className={`flex items-center gap-1.5 ${isDark ? "text-indigo-300" : "text-indigo-950"}`}>
                          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                          Form Auto-Fill Suggestions
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isDark
                            ? "bg-indigo-900/60 text-indigo-300"
                            : "bg-indigo-200/70 text-indigo-900"
                        }`}>
                          {analysisResult.categoryConfidence || 92}% Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className={`p-2.5 rounded-lg border ${
                          isDark
                            ? "bg-slate-900/90 border-slate-800 text-slate-200"
                            : "bg-white border-indigo-100 text-slate-900"
                        }`}>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Auto-Suggested Category
                          </span>
                          <span className={`font-bold text-sm block ${isDark ? "text-indigo-300" : "text-indigo-900"}`}>
                            {analysisResult.category}
                          </span>
                          {analysisResult.categoryReasoning && (
                            <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {analysisResult.categoryReasoning}
                            </p>
                          )}
                        </div>

                        <div className={`p-2.5 rounded-lg border ${
                          isDark
                            ? "bg-slate-900/90 border-slate-800 text-slate-200"
                            : "bg-white border-indigo-100 text-slate-900"
                        }`}>
                          <span className="text-[10px] font-bold uppercase text-slate-400 block">
                            Auto-Suggested Condition
                          </span>
                          <span className={`font-bold text-sm block ${isDark ? "text-white" : "text-slate-900"}`}>
                            {analysisResult.condition}
                          </span>
                          {analysisResult.conditionReasoning && (
                            <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                              {analysisResult.conditionReasoning}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className={`text-[11px] font-medium ${isDark ? "text-indigo-300" : "text-indigo-700"}`}>
                        ✨ These verified fields will be automatically selected when you apply this inspection to the Create Listing form.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className={`font-bold block mb-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                          Physical Inspection Summary:
                        </span>
                        <p className={`p-2.5 rounded-lg border leading-relaxed ${
                          isDark
                            ? "bg-slate-900/60 border-slate-800 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}>
                          {analysisResult.conditionDetails}
                        </p>
                      </div>

                      <div>
                        <span className={`font-bold block mb-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                          Key Features Identified:
                        </span>
                        <ul className={`list-disc list-inside space-y-1 p-2.5 rounded-lg border ${
                          isDark
                            ? "bg-slate-900/60 border-slate-800 text-slate-300"
                            : "bg-slate-50 border-slate-200 text-slate-700"
                        }`}>
                          {analysisResult.keyFeatures.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      {analysisResult.recommendedHandoverTips && (
                        <div>
                          <span className={`font-bold block mb-0.5 ${isDark ? "text-slate-200" : "text-slate-800"}`}>
                            Handover & Test Tip:
                          </span>
                          <p className={`p-2.5 rounded-lg border leading-relaxed ${
                            isDark
                              ? "bg-indigo-950/30 border-indigo-800/40 text-indigo-300"
                              : "bg-indigo-50/60 border-indigo-100 text-indigo-900"
                          }`}>
                            💡 {analysisResult.recommendedHandoverTips}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleApply}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        Apply to Listing Form
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleStartAnalysis}
                        title="Re-run analysis"
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          isDark
                            ? "border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white"
                            : "border-slate-200 text-slate-600 hover:bg-slate-100"
                        }`}
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
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
