import React, { useState } from "react";
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

  if (!isOpen) return null;

  return (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 overflow-y-auto"
        >
          <div
            id="ai-inspector-modal"
            className={`relative w-full max-w-3xl rounded-3xl shadow-2xl border overflow-hidden my-8 ${
              isDark
                ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] shadow-black/60"
                : "bg-white border-[#DFE6E2] text-[#18201C] shadow-[#18201C]/10"
            }`}
          >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark
              ? "border-[#242E2A] bg-[#141A18] text-[#ECF2EF]"
              : "border-[#DFE6E2] bg-[#F7F9F8] text-[#18201C]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2F5D50] text-white shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-[#18201C]"}`}>
                  AI Item Inspector
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isDark
                    ? "bg-[#182823] text-[#7BBFA8] border border-[#2A4A40]"
                    : "bg-[#EFF4F1] text-[#2F5D50] border border-[#C4D9D1]"
                }`}>
                  gemini-3.8-flash
                </span>
              </div>
              <p className={`text-xs ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                Upload a student item photo for automated condition audit and resale price recommendation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                : "text-[#8FA199] hover:text-[#5C6B63] hover:bg-[#DFE6E2]"
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
              isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
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
                      ? "border-[#242E2A] hover:border-[#5BA18C] bg-[#141A18] hover:bg-[#1B2320]"
                      : "border-[#DFE6E2] hover:border-[#5BA18C] bg-[#F7F9F8] hover:bg-[#EFF4F1]"
                  }`}
                >
                  <img
                    src={item.image}
                    alt={item.label}
                    className="w-10 h-10 rounded-lg object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <span className={`text-xs font-medium ${
                    isDark ? "text-[#ECF2EF] group-hover:text-[#7BBFA8]" : "text-[#5C6B63] group-hover:text-[#2F5D50]"
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
                ? "border-[#242E2A] hover:border-[#5BA18C] hover:bg-[#182823]"
                : "border-[#C4D1CA] hover:border-[#5BA18C] hover:bg-[#EFF4F1]"
            }`}>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className={`p-4 rounded-full transition-colors mb-3 ${
                isDark
                  ? "bg-[#1B2320] group-hover:bg-[#182823] text-[#C5D3CC] group-hover:text-[#7BBFA8]"
                  : "bg-[#EFF4F1] group-hover:bg-[#EFF4F1] text-[#5C6B63] group-hover:text-[#2F5D50]"
              }`}>
                <Upload className="w-6 h-6" />
              </div>
              <span className={`text-sm font-semibold ${isDark ? "text-[#ECF2EF]" : "text-[#18201C]"}`}>
                Click to upload or drag & drop item photo
              </span>
              <span className={`text-xs mt-1 ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                Supports JPG, PNG, WEBP up to 15MB
              </span>
            </label>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              {/* Image Preview */}
              <div className="relative rounded-2xl overflow-hidden border border-[#DFE6E2] bg-[#141A18] shadow-inner group">
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
                  <div className="absolute inset-0 bg-[#0D1110] flex flex-col items-center justify-center text-white p-4">
                    <Loader2 className="w-8 h-8 text-[#7BBFA8] mb-3" />
                    <span className="text-sm font-semibold">
                      Inspecting with Google Gemini 3.8 Flash...
                    </span>
                    <span className="text-xs text-[#C5D3CC] mt-1 text-center">
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
                      ? "bg-[#141A18] border-[#242E2A]"
                      : "bg-[#F7F9F8] border-[#DFE6E2]"
                  }`}>
                    <p className={`text-sm ${isDark ? "text-[#C5D3CC]" : "text-[#5C6B63]"}`}>
                      Photo ready for multimodal inspection with Google Gemini 3.8 Flash.
                    </p>
                    {!isOnline && (
                      <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-[#DFC29B] text-xs flex items-center justify-center gap-2">
                        <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
                        <span>Gemini AI requires an active internet connection.</span>
                      </div>
                    )}
                    <button
                      onClick={handleStartAnalysis}
                      disabled={!isOnline}
                      className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium shadow-sm transition-all select-none ${
                        !isOnline
                          ? "bg-[#1B2320] text-[#5C6B63] border border-[#242E2A] cursor-not-allowed"
                          : "bg-[#2F5D50] hover:bg-[#244A3F] text-white cursor-pointer"
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
                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border space-y-2 ${
                      isDark
                        ? "bg-[#182823] border-[#2A4A40]"
                        : "bg-[#EFF4F1] border-[#C4D9D1]"
                    }`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 ${
                          isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                        }`}>
                          <CheckCircle2 className="w-4 h-4 text-[#2F5D50]" />
                          Inspection Complete
                        </span>
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#0D1110] text-white text-xs font-black shadow-xs border border-[#242E2A]">
                          <ShieldCheck className="w-4 h-4 text-[#7BBFA8] shrink-0" />
                          <span className="text-[#ECF2EF] font-bold">AI Score:</span>
                          <span className="text-[#7BBFA8] font-black">{analysisResult.inspectionScore}/100</span>
                        </div>
                      </div>

                      <h3 className={`text-base font-bold leading-tight ${isDark ? "text-white" : "text-[#18201C]"}`}>
                        {analysisResult.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 pt-1">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 border ${
                          isDark
                            ? "bg-[#141A18] border-[#242E2A] text-[#C5D3CC]"
                            : "bg-white border-[#DFE6E2] text-[#5C6B63]"
                        }`}>
                          <Tag className="w-3 h-3 text-[#2F5D50]" />
                          Category: {analysisResult.category}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                          isDark
                            ? "bg-[#251F15] text-[#DFC29B] border-[#4A3B23]"
                            : "bg-[#FDF6EC] text-[#9E6B43] border-[#EED8B8]"
                        }`}>
                          Condition: {analysisResult.condition}
                        </span>
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 border ${
                          isDark
                            ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                            : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                        }`}>
                          <Zap className="w-3 h-3 text-[#2F5D50]" />
                          Fair Resale: ₹{analysisResult.suggestedPriceMin} – ₹{analysisResult.suggestedPriceMax}
                        </span>
                      </div>
                    </div>

                    {/* Dedicated Category & Condition Auto-Suggestion Highlights */}
                    <div className={`p-3.5 rounded-xl border space-y-2.5 text-xs ${
                      isDark
                        ? "bg-[#182823] border-[#2A4A40] text-[#ECF2EF]"
                        : "bg-[#EFF4F1] border-[#C4D9D1] text-[#2F5D50]"
                    }`}>
                      <div className="flex items-center justify-between font-bold">
                        <span className={`flex items-center gap-1.5 ${isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"}`}>
                          <Sparkles className="w-3.5 h-3.5 text-[#2F5D50]" />
                          Form Auto-Fill Suggestions
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isDark
                            ? "bg-[#182823] text-[#7BBFA8]"
                            : "bg-[#DFE9E4] text-[#2F5D50]"
                        }`}>
                          {analysisResult.categoryConfidence || 92}% Confidence
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className={`p-2.5 rounded-lg border ${
                          isDark
                            ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
                            : "bg-white border-[#C4D9D1] text-[#18201C]"
                        }`}>
                          <span className="text-[10px] font-bold uppercase text-[#8FA199] block">
                            Auto-Suggested Category
                          </span>
                          <span className={`font-bold text-sm block ${isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"}`}>
                            {analysisResult.category}
                          </span>
                          {analysisResult.categoryReasoning && (
                            <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                              {analysisResult.categoryReasoning}
                            </p>
                          )}
                        </div>

                        <div className={`p-2.5 rounded-lg border ${
                          isDark
                            ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
                            : "bg-white border-[#C4D9D1] text-[#18201C]"
                        }`}>
                          <span className="text-[10px] font-bold uppercase text-[#8FA199] block">
                            Auto-Suggested Condition
                          </span>
                          <span className={`font-bold text-sm block ${isDark ? "text-white" : "text-[#18201C]"}`}>
                            {analysisResult.condition}
                          </span>
                          {analysisResult.conditionReasoning && (
                            <p className={`text-[11px] mt-0.5 leading-snug ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                              {analysisResult.conditionReasoning}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className={`text-[11px] font-medium ${isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"}`}>
                        ✨ These verified fields will be automatically selected when you apply this inspection to the Create Listing form.
                      </p>
                    </div>

                    <div className="space-y-2 text-xs">
                      <div>
                        <span className={`font-bold block mb-0.5 ${isDark ? "text-[#ECF2EF]" : "text-[#18201C]"}`}>
                          Physical Inspection Summary:
                        </span>
                        <p className={`p-2.5 rounded-lg border leading-relaxed ${
                          isDark
                            ? "bg-[#141A18] border-[#242E2A] text-[#C5D3CC]"
                            : "bg-[#F7F9F8] border-[#DFE6E2] text-[#5C6B63]"
                        }`}>
                          {analysisResult.conditionDetails}
                        </p>
                      </div>

                      <div>
                        <span className={`font-bold block mb-0.5 ${isDark ? "text-[#ECF2EF]" : "text-[#18201C]"}`}>
                          Key Features Identified:
                        </span>
                        <ul className={`list-disc list-inside space-y-1 p-2.5 rounded-lg border ${
                          isDark
                            ? "bg-[#141A18] border-[#242E2A] text-[#C5D3CC]"
                            : "bg-[#F7F9F8] border-[#DFE6E2] text-[#5C6B63]"
                        }`}>
                          {analysisResult.keyFeatures.map((f, i) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>

                      {analysisResult.recommendedHandoverTips && (
                        <div>
                          <span className={`font-bold block mb-0.5 ${isDark ? "text-[#ECF2EF]" : "text-[#18201C]"}`}>
                            Handover & Test Tip:
                          </span>
                          <p className={`p-2.5 rounded-lg border leading-relaxed ${
                            isDark
                              ? "bg-[#182823] border-[#2A4A40] text-[#7BBFA8]"
                              : "bg-[#EFF4F1] border-[#C4D9D1] text-[#2F5D50]"
                          }`}>
                            💡 {analysisResult.recommendedHandoverTips}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleApply}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#2F5D50] hover:bg-[#244A3F] text-white text-sm font-semibold shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        Apply to Listing Form
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={handleStartAnalysis}
                        title="Re-run analysis"
                        className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                          isDark
                            ? "border-[#242E2A] text-[#8FA199] hover:bg-[#1B2320] hover:text-white"
                            : "border-[#DFE6E2] text-[#5C6B63] hover:bg-[#EFF4F1]"
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
      </div>
    </div>
  );
};
