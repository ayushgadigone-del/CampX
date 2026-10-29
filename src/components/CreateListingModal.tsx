import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Sparkles,
  Upload,
  Tag,
  DollarSign,
  MapPin,
  FileText,
  Repeat,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  Clock,
  WifiOff,
} from "lucide-react";
import {
  ItemCategory,
  ItemCondition,
  ListingType,
  AIInspectionResult,
  Listing,
} from "../types";
import { db, handleFirestoreError, OperationType } from "../lib/firebase";
import { collection, addDoc } from "firebase/firestore";
import { generateSuggestedTags } from "../utils/tagSuggester";
import { calculateNewExpiryDate, DEFAULT_EXPIRY_DAYS } from "../utils/expiryUtils";
import { useTheme } from "../context/ThemeContext";

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAIInspector: () => void;
  currentUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL?: string | null;
  } | null;
  initialInspection?: AIInspectionResult | null;
  initialImage?: string | null;
  onListingCreated: (newListing: Listing) => void;
  isOnline?: boolean;
}

const CATEGORIES: ItemCategory[] = [
  "Books",
  "Calculators",
  "Lab Equipment",
  "Cycles",
  "Bags",
  "Other",
];

const CONDITIONS: ItemCondition[] = [
  "Like New",
  "Good",
  "Fair",
  "Wear & Tear",
];

const CAMPUS_SPOTS = [
  "Central Library Quad",
  "College Main Canteen Porch",
  "Workshop Practice Shed 2",
  "Academic Block Entrance",
  "Hostel Common Lawn",
  "Sports Ground Pavilion",
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onOpenAIInspector,
  currentUser,
  initialInspection,
  initialImage,
  onListingCreated,
  isOnline = true,
}) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState(initialInspection?.title || "");
  const [category, setCategory] = useState<ItemCategory>(
    initialInspection?.category || "Calculators"
  );
  const [condition, setCondition] = useState<ItemCondition>(
    initialInspection?.condition || "Good"
  );
  const [listingType, setListingType] = useState<ListingType>("sell");
  const [price, setPrice] = useState<number>(
    initialInspection?.suggestedPriceMin || 350
  );
  const [exchangeFor, setExchangeFor] = useState<string>("");
  const [locationPreference, setLocationPreference] = useState<string>(
    "Central Library Quad"
  );
  const [description, setDescription] = useState<string>(
    initialInspection
      ? `${initialInspection.conditionDetails} Verified condition: ${initialInspection.condition}.`
      : ""
  );
  const [imageUrl, setImageUrl] = useState<string>(
    initialImage ||
      "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=800&q=80"
  );
  const [aiInspectionData, setAiInspectionData] =
    useState<AIInspectionResult | null>(initialInspection || null);

  // Tags auto-suggest & state
  const [tags, setTags] = useState<string[]>(() => {
    if (initialInspection?.title) {
      return generateSuggestedTags(
        initialInspection.title,
        initialInspection.category
      ).slice(0, 4);
    }
    return [];
  });
  const [customTagInput, setCustomTagInput] = useState<string>("");
  const [validityDays, setValidityDays] = useState<number>(30);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);

  const analyzeImageAndSuggestFields = async (imageBase64OrUrl: string) => {
    if (!isOnline) {
      setError("Cannot run AI inspection while offline. Please reconnect.");
      return;
    }
    setIsAnalyzingImage(true);
    setAnalysisNotice(null);
    try {
      let payload = imageBase64OrUrl;
      let mime = "image/jpeg";

      if (imageBase64OrUrl.startsWith("http://") || imageBase64OrUrl.startsWith("https://")) {
        try {
          const res = await fetch(imageBase64OrUrl);
          const blob = await res.blob();
          mime = blob.type || "image/jpeg";
          payload = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          });
        } catch {
          // If remote fetch fails due to CORS, use existing payload
        }
      }

      const response = await fetch("/api/analyze-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: payload,
          mimeType: mime,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image with Gemini AI.");
      }

      const data = await response.json();
      if (data.analysis) {
        const res: AIInspectionResult = data.analysis;
        setAiInspectionData(res);

        // Automatically set suggested Category & Condition
        setCategory(res.category);
        setCondition(res.condition);

        // Auto-fill title if empty or default
        if (!title.trim() || title === "Student Pre-Owned Item") {
          setTitle(res.title);
        }

        // Auto-suggest price if at initial default
        if (price === 350 && res.suggestedPriceMin) {
          setPrice(res.suggestedPriceMin);
        }

        // Auto-populate description if empty
        if (!description.trim()) {
          setDescription(
            `${res.conditionDetails} Verified condition: ${res.condition}. ${res.conditionReasoning || ""}`.trim()
          );
        }

        // Suggest new tags based on title & category
        const newTags = generateSuggestedTags(res.title, res.category).slice(0, 4);
        setTags(newTags);

        setAnalysisNotice(
          `✨ AI Visual Analysis: Selected Category "${res.category}" (${res.categoryConfidence || 92}% confidence) and Condition "${res.condition}".`
        );
        setTimeout(() => setAnalysisNotice(null), 7000);
      }
    } catch (err: any) {
      console.error("AI photo analysis error:", err);
      setError("AI photo analysis encountered an issue. You can still choose Category and Condition manually.");
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // Sync if initialInspection changes
  React.useEffect(() => {
    if (initialInspection) {
      setTitle(initialInspection.title);
      setCategory(initialInspection.category);
      setCondition(initialInspection.condition);
      setPrice(initialInspection.suggestedPriceMin);
      setDescription(
        `${initialInspection.conditionDetails} Features: ${initialInspection.keyFeatures.join(", ")}`
      );
      setAiInspectionData(initialInspection);
      // Auto-suggest initial tags from inspected item
      const initialTags = generateSuggestedTags(
        initialInspection.title,
        initialInspection.category
      ).slice(0, 4);
      setTags(initialTags);
    }
    if (initialImage) {
      setImageUrl(initialImage);
    }
  }, [initialInspection, initialImage]);

  // Compute live auto-suggested tags based on item title, category, and existing tags
  const suggestedTags = useMemo(() => {
    return generateSuggestedTags(title, category, tags);
  }, [title, category, tags]);

  const handleSelectTag = (tagToAdd: string) => {
    if (!tags.includes(tagToAdd)) {
      setTags((prev) => [...prev, tagToAdd]);
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags((prev) => prev.filter((t) => t !== tagToRemove));
  };

  const handleAddCustomTag = () => {
    const clean = customTagInput.trim().replace(/^#/, "");
    if (
      clean &&
      !tags.some((t) => t.toLowerCase() === clean.toLowerCase())
    ) {
      setTags((prev) => [...prev, clean]);
      setCustomTagInput("");
    }
  };

  const handleAddAllSuggestions = () => {
    setTags((prev) => {
      const merged = new Set(prev);
      for (const st of suggestedTags) {
        merged.add(st);
      }
      return Array.from(merged);
    });
  };

  if (!isOpen) return null;

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 15 * 1024 * 1024) {
        setError("Image exceeds 15MB limit. Please choose a smaller photo.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setImageUrl(base64);
        if (isOnline) {
          analyzeImageAndSuggestFields(base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please provide a title for your item.");
      return;
    }
    if (price < 0) {
      setError("Price must be 0 or greater.");
      return;
    }
    if (!isOnline) {
      setError("Cannot publish listing while offline. Please reconnect to the network to prevent data loss.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const newListingData: Omit<Listing, "id"> = {
      title: title.trim(),
      category,
      condition,
      listingType,
      price: listingType === "exchange" ? 0 : Number(price),
      exchangeFor: listingType !== "sell" ? exchangeFor : undefined,
      description: description.trim(),
      imageUrl,
      sellerId: currentUser?.uid || "student-pvgcoet-id",
      sellerName: currentUser?.displayName || "Verified Student",
      sellerEmail: currentUser?.email || "student@pvgcoet.ac.in",
      sellerPhoto: currentUser?.photoURL || undefined,
      department: "Engineering Student",
      year: "Student",
      status: "available",
      locationPreference,
      tags: tags.length > 0 ? tags : undefined,
      aiInspection: aiInspectionData || undefined,
      expiryDate: calculateNewExpiryDate(validityDays),
      sellerRating: 5.0,
      sellerReviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      // Save directly into Firestore collection
      const docRef = await addDoc(collection(db, "listings"), newListingData);
      const createdItem: Listing = {
        ...newListingData,
        id: docRef.id,
      };

      onListingCreated(createdItem);
      onClose();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, "listings");
      console.info("Firestore listing saved to local catalog fallback:", err?.message || err);
      // Fallback local persistence if offline or unauthenticated
      const localId = `listing-${Date.now()}`;
      const fallbackItem: Listing = {
        ...newListingData,
        id: localId,
      };
      onListingCreated(fallbackItem);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto"
        >
          <motion.div
            id="create-listing-modal"
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-8 ${
              isDark
                ? "bg-[#0B0F19] text-slate-100 border-slate-800 shadow-black/70"
                : "bg-white text-slate-900 border-slate-200 shadow-slate-300/40"
            }`}
          >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "border-slate-800 bg-slate-900/80" : "border-slate-100 bg-slate-50/80"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-lg font-bold ${
                  isDark ? "text-white" : "text-slate-900"
                }`}
              >
                Post Pre-Owned Item
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                List books, calculators, lab gear, cycles, or bags for campus exchange
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors cursor-pointer ${
              isDark
                ? "text-slate-400 hover:text-white hover:bg-slate-800"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            }`}
          >
            <X className="w-5 h-5" />
          </motion.button>
        </div>

        {/* AI Scanner Banner */}
        <div
          className={`mx-6 mt-6 p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark
              ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-200"
              : "bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-100 text-indigo-950"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`text-xs font-bold block ${
                  isDark ? "text-indigo-200" : "text-indigo-950"
                }`}
              >
                Have a photo? Use Gemini 3.8 Flash
              </span>
              <p
                className={`text-xs ${
                  isDark ? "text-indigo-300/90" : "text-indigo-700"
                }`}
              >
                AI scans your item, detects scratches, assesses condition, and suggests fair campus pricing.
              </p>
            </div>
          </div>
          <motion.button
            type="button"
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => {
              onClose();
              onOpenAIInspector();
            }}
            className="shrink-0 px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Scan Item with AI
          </motion.button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Title */}
          <div>
            <label
              className={`block text-xs font-bold mb-1 ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              Item Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Casio FX-991ES Plus Calculator or B.S. Grewal Math Book"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? "bg-slate-900/90 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          {/* AI Visual Inspection Recommendations Banner */}
          {aiInspectionData && (
            <div
              id="ai-category-condition-suggestion-banner"
              className={`p-3.5 rounded-2xl border shadow-2xs space-y-2.5 ${
                isDark
                  ? "bg-slate-900/80 border-indigo-500/30"
                  : "bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-indigo-50/90 border-indigo-200/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-indigo-600 text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        isDark ? "text-indigo-200" : "text-indigo-950"
                      }`}
                    >
                      AI Visual Analysis Suggestions
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        isDark ? "text-indigo-300/80" : "text-indigo-700"
                      }`}
                    >
                      Automatically calculated from item photo inspection
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isDark
                        ? "bg-indigo-900/60 text-indigo-300 border-indigo-700"
                        : "bg-indigo-100 text-indigo-800 border-indigo-200"
                    }`}
                  >
                    {aiInspectionData.categoryConfidence || 92}% Match
                  </span>
                  {(category !== aiInspectionData.category || condition !== aiInspectionData.condition) && (
                    <button
                      type="button"
                      onClick={() => {
                        setCategory(aiInspectionData.category);
                        setCondition(aiInspectionData.condition);
                      }}
                      className={`text-[11px] font-bold underline cursor-pointer ${
                        isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-700 hover:text-indigo-900"
                      }`}
                    >
                      Re-apply AI Suggestions
                    </button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {/* Suggested Category Card */}
                <div
                  className={`p-2.5 rounded-xl border shadow-2xs ${
                    isDark
                      ? "bg-[#0B0F19]/90 border-slate-800"
                      : "bg-white/80 border-indigo-100/80"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <span>Suggested Category</span>
                    {category === aiInspectionData.category ? (
                      <span className="text-emerald-500 font-bold text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCategory(aiInspectionData.category)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold text-[10px] underline cursor-pointer"
                      >
                        Apply "{aiInspectionData.category}"
                      </button>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-1.5 pt-1 text-sm font-bold ${
                      isDark ? "text-indigo-300" : "text-indigo-900"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{aiInspectionData.category}</span>
                  </div>
                  {aiInspectionData.categoryReasoning && (
                    <p
                      className={`text-[11px] mt-1 leading-tight ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {aiInspectionData.categoryReasoning}
                    </p>
                  )}
                </div>

                {/* Detected Condition Card */}
                <div
                  className={`p-2.5 rounded-xl border shadow-2xs ${
                    isDark
                      ? "bg-[#0B0F19]/90 border-slate-800"
                      : "bg-white/80 border-indigo-100/80"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    <span>Audited Condition</span>
                    {condition === aiInspectionData.condition ? (
                      <span className="text-emerald-500 font-bold text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCondition(aiInspectionData.condition)}
                        className="text-indigo-400 hover:text-indigo-300 font-bold text-[10px] underline cursor-pointer"
                      >
                        Apply "{aiInspectionData.condition}"
                      </button>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-1.5 pt-1 text-sm font-bold ${
                      isDark ? "text-slate-100" : "text-slate-900"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span>{aiInspectionData.condition}</span>
                  </div>
                  {aiInspectionData.conditionReasoning && (
                    <p
                      className={`text-[11px] mt-1 leading-tight ${
                        isDark ? "text-slate-400" : "text-slate-600"
                      }`}
                    >
                      {aiInspectionData.conditionReasoning}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {isAnalyzingImage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                isDark
                  ? "bg-indigo-950/40 border-indigo-500/30 text-indigo-200"
                  : "bg-indigo-50 border-indigo-200 text-indigo-900"
              }`}
            >
              <Loader2 className="w-4 h-4 text-indigo-500 animate-spin shrink-0" />
              <span>
                <strong>Gemini AI Visual Analysis:</strong> Scanning photo to automatically classify and suggest the most accurate Category & Condition...
              </span>
            </div>
          )}

          {analysisNotice && !isAnalyzingImage && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                isDark
                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-200"
                  : "bg-emerald-50 border-emerald-200 text-emerald-900"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{analysisNotice}</span>
            </div>
          )}

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-bold mb-1 flex items-center justify-between ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                <span>Category *</span>
                {aiInspectionData?.category && (
                  <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI: {aiInspectionData.category}
                  </span>
                )}
              </label>
              <select
                id="create-listing-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  isDark
                    ? "bg-slate-900 text-slate-100 border-slate-700"
                    : "bg-white text-slate-900 border-slate-300"
                } ${
                  aiInspectionData?.category === category
                    ? "border-indigo-400 ring-1 ring-indigo-200/60"
                    : ""
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}
                  >
                    {cat} {aiInspectionData?.category === cat ? "✨ (AI Recommended)" : ""}
                  </option>
                ))}
              </select>

              {aiInspectionData?.category && (
                <div
                  className={`mt-1 flex items-center justify-between text-[11px] ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>
                      Visual Match: <strong>{aiInspectionData.category}</strong>
                      {aiInspectionData.categoryConfidence ? ` (${aiInspectionData.categoryConfidence}%)` : ""}
                    </span>
                  </span>
                  {category !== aiInspectionData.category && (
                    <button
                      type="button"
                      onClick={() => setCategory(aiInspectionData.category)}
                      className="text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Restore AI Category
                    </button>
                  )}
                </div>
              )}
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 flex items-center justify-between ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                <span>Item Condition *</span>
                {aiInspectionData?.condition && (
                  <span className="text-[10px] font-semibold text-indigo-400 flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI: {aiInspectionData.condition}
                  </span>
                )}
              </label>
              <select
                id="create-listing-condition-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors ${
                  isDark
                    ? "bg-slate-900 text-slate-100 border-slate-700"
                    : "bg-white text-slate-900 border-slate-300"
                } ${
                  aiInspectionData?.condition === condition
                    ? "border-indigo-400 ring-1 ring-indigo-200/60"
                    : ""
                }`}
              >
                {CONDITIONS.map((c) => (
                  <option
                    key={c}
                    value={c}
                    className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}
                  >
                    {c} {aiInspectionData?.condition === c ? "✨ (AI Detected)" : ""}
                  </option>
                ))}
              </select>

              {aiInspectionData?.condition && (
                <div
                  className={`mt-1 flex items-center justify-between text-[11px] ${
                    isDark ? "text-slate-400" : "text-slate-500"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-indigo-400" />
                    <span>Visual Audit: <strong>{aiInspectionData.condition}</strong></span>
                  </span>
                  {condition !== aiInspectionData.condition && (
                    <button
                      type="button"
                      onClick={() => setCondition(aiInspectionData.condition)}
                      className="text-indigo-400 font-bold hover:underline cursor-pointer"
                    >
                      Restore AI Condition
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Tags & Search Keywords with Auto-Suggestions based on Title */}
          <div
            className={`space-y-2.5 p-4 rounded-xl border ${
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-indigo-50/50 border-indigo-100"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isDark ? "text-slate-200" : "text-slate-800"
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-indigo-500" />
                <span>Search Tags & Keywords</span>
                <span
                  className={`text-[11px] font-medium ${
                    isDark ? "text-indigo-400" : "text-indigo-600"
                  }`}
                >
                  (Auto-suggested from title)
                </span>
              </label>
              {suggestedTags.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddAllSuggestions}
                  className={`text-xs font-bold transition-colors flex items-center gap-1 hover:underline cursor-pointer ${
                    isDark ? "text-indigo-400 hover:text-indigo-300" : "text-indigo-600 hover:text-indigo-800"
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Add all suggestions ({suggestedTags.length})
                </button>
              )}
            </div>

            {/* Selected Tags Chips */}
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white shadow-2xs"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:bg-indigo-700/80 rounded-full p-0.5 transition-colors cursor-pointer"
                      title="Remove tag"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            ) : (
              <p
                className={`text-[11px] italic ${
                  isDark ? "text-slate-500" : "text-slate-500"
                }`}
              >
                No tags added yet. Choose from suggestions below or type custom tags to make your listing easy to find in campus search.
              </p>
            )}

            {/* Auto-suggested Pills */}
            {suggestedTags.length > 0 ? (
              <div
                className={`space-y-1.5 pt-1.5 border-t ${
                  isDark ? "border-slate-800" : "border-indigo-100/70"
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                    isDark ? "text-slate-400" : "text-slate-600"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>
                    Suggested based on "{title || "your item title"}":
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {suggestedTags.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSelectTag(suggestion)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs transition-all hover:scale-105 active:scale-95 cursor-pointer group ${
                        isDark
                          ? "bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white border-slate-700 hover:border-indigo-500"
                          : "bg-white hover:bg-indigo-600 text-slate-700 hover:text-white border-slate-200 hover:border-indigo-600"
                      }`}
                    >
                      <Plus className="w-3 h-3 text-indigo-500 group-hover:text-white" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : title.trim().length > 0 ? (
              <div
                className={`text-[11px] font-medium flex items-center gap-1 pt-1 border-t ${
                  isDark ? "border-slate-800 text-emerald-400" : "border-indigo-100/70 text-emerald-700"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All key tags matching "{title}" have been added!</span>
              </div>
            ) : null}

            {/* Manual Tag Input */}
            <div
              className={`flex items-center gap-2 pt-1 border-t ${
                isDark ? "border-slate-800" : "border-indigo-100/70"
              }`}
            >
              <input
                type="text"
                placeholder="Type custom tag & press Enter (e.g., '1st Year', 'Urgent')..."
                value={customTagInput}
                onChange={(e) => setCustomTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomTag();
                  }
                }}
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTagInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 text-white disabled:text-slate-500 text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Add Tag
              </button>
            </div>
          </div>

          {/* Listing Type & Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-bold mb-1 ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                Listing Type *
              </label>
              <div
                className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl ${
                  isDark ? "bg-slate-900/90 border border-slate-800" : "bg-slate-100"
                }`}
              >
                {(["sell", "exchange", "both"] as ListingType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setListingType(t)}
                    className={`py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                      listingType === t
                        ? isDark
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "bg-white text-indigo-700 shadow-xs"
                        : isDark
                        ? "text-slate-400 hover:text-white"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                className={`block text-xs font-bold mb-1 flex items-center justify-between ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                <span>Price (₹ INR) *</span>
                {aiInspectionData && (
                  <span className="text-[10px] text-indigo-400 font-semibold">
                    AI Suggested: ₹{aiInspectionData.suggestedPriceMin}–₹{aiInspectionData.suggestedPriceMax}
                  </span>
                )}
              </label>
              <div className="relative">
                <span
                  className={`absolute left-3 top-2.5 font-bold text-sm ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  disabled={listingType === "exchange"}
                  value={listingType === "exchange" ? 0 : price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className={`w-full pl-8 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? "bg-slate-900 border-slate-700 text-slate-100 disabled:bg-slate-950 disabled:text-slate-600"
                      : "bg-white border-slate-300 text-slate-900 disabled:bg-slate-100 disabled:text-slate-400"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Exchange details if applicable */}
          {listingType !== "sell" && (
            <div>
              <label
                className={`block text-xs font-bold mb-1 flex items-center gap-1 ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                <Repeat className="w-3.5 h-3.5 text-indigo-500" />
                Looking to exchange for:
              </label>
              <input
                type="text"
                placeholder="e.g., Workshop Lab coat (Size L) or Engineering Graphics sheet tube"
                value={exchangeFor}
                onChange={(e) => setExchangeFor(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                    : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
                }`}
              />
            </div>
          )}

          {/* Listing Validity / Expiry Date (30-day auto-inactive) */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isDark ? "bg-slate-900/60 border-slate-800" : "bg-slate-50 border-slate-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isDark ? "text-slate-200" : "text-slate-700"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-indigo-500" />
                <span>Listing Validity / Expiry Period</span>
              </label>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isDark
                    ? "text-indigo-300 bg-indigo-950/60 border-indigo-700/60"
                    : "text-indigo-600 bg-indigo-50 border-indigo-200"
                }`}
              >
                Auto-Inactive after 30 days
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { days: 30, label: "30 Days", desc: "Campus Standard" },
                { days: 15, label: "15 Days", desc: "Urgent / Exam Week" },
                { days: 60, label: "60 Days", desc: "Full Semester" },
              ].map((opt) => (
                <button
                  key={opt.days}
                  type="button"
                  onClick={() => setValidityDays(opt.days)}
                  className={`p-2 rounded-xl text-left border transition-all cursor-pointer ${
                    validityDays === opt.days
                      ? isDark
                        ? "bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/30 text-indigo-200 shadow-xs"
                        : "bg-white border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs text-indigo-900"
                      : isDark
                      ? "bg-slate-900/80 border-slate-800 hover:bg-slate-800 text-slate-400"
                      : "bg-white/60 border-slate-200 hover:bg-white text-slate-600"
                  }`}
                >
                  <span className="block text-xs font-bold">{opt.label}</span>
                  <span
                    className={`block text-[10px] font-medium ${
                      isDark ? "text-slate-500" : "text-slate-500"
                    }`}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
            <p
              className={`text-[11px] leading-relaxed ${
                isDark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              🕒 Older listings automatically become <strong>inactive</strong> after 30 days to keep student marketplace searches fresh. You can re-activate or renew anytime.
            </p>
          </div>

          {/* Preferred Handover Location */}
          <div>
            <label
              className={`block text-xs font-bold mb-1 flex items-center gap-1 ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              Preferred Campus Handover Location
            </label>
            <select
              value={locationPreference}
              onChange={(e) => setLocationPreference(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? "bg-slate-900 text-slate-100 border-slate-700"
                  : "bg-white text-slate-900 border-slate-300"
              }`}
            >
              {CAMPUS_SPOTS.map((spot) => (
                <option
                  key={spot}
                  value={spot}
                  className={isDark ? "bg-slate-900 text-slate-100" : "bg-white text-slate-900"}
                >
                  {spot}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label
              className={`block text-xs font-bold mb-1 flex items-center gap-1 ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              Item Description & Observations
            </label>
            <textarea
              rows={3}
              placeholder="State syllabus semester, condition of pages/screens, accessories included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                  : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400"
              }`}
            />
          </div>

          {/* Photo & Preview */}
          <div>
            <label
              className={`block text-xs font-bold mb-1 ${
                isDark ? "text-slate-200" : "text-slate-700"
              }`}
            >
              Item Photo
            </label>
            <div className="flex items-center gap-4">
              <div
                className={`relative w-20 h-20 rounded-xl overflow-hidden border shrink-0 ${
                  isDark ? "border-slate-800 bg-slate-900" : "border-slate-200 bg-slate-100"
                }`}
              >
                <img
                  src={imageUrl}
                  alt="Listing preview"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label
                    className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${
                      isDark
                        ? "border-slate-700 hover:bg-slate-800 text-slate-200"
                        : "border-slate-300 hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-slate-400" />
                    Upload Photo & Auto-Detect
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFile}
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => analyzeImageAndSuggestFields(imageUrl)}
                    disabled={!isOnline || isAnalyzingImage || !imageUrl}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer ${
                      isDark
                        ? "bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border-indigo-700/60"
                        : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200"
                    }`}
                    title="Run Gemini AI visual analysis on this photo to suggest Category and Condition"
                  >
                    {isAnalyzingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                        Auto-Detect Category & Condition
                      </>
                    )}
                  </button>
                </div>
                <p
                  className={`text-[11px] ${
                    isDark ? "text-slate-500" : "text-slate-400"
                  }`}
                >
                  Uploading or analyzing a photo automatically selects the most accurate Category & Condition.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Or paste an image URL directly: https://..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className={`flex-1 px-2.5 py-1 text-xs rounded-lg border ${
                      isDark
                        ? "bg-slate-900 border-slate-700 text-slate-100 placeholder:text-slate-500"
                        : "border-slate-200 bg-white text-slate-900"
                    }`}
                  />
                  {imageUrl && imageUrl.startsWith("http") && (
                    <button
                      type="button"
                      onClick={() => analyzeImageAndSuggestFields(imageUrl)}
                      disabled={!isOnline || isAnalyzingImage}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                        isDark
                          ? "bg-slate-800 hover:bg-slate-700 text-slate-200"
                          : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                      }`}
                    >
                      Scan URL
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Offline Mode Warning */}
          {!isOnline && (
            <div
              id="create-modal-offline-notice"
              className={`p-3 rounded-xl border text-xs flex items-center gap-2.5 ${
                isDark
                  ? "bg-amber-950/40 border-amber-500/30 text-amber-200"
                  : "bg-amber-50 border-amber-200 text-amber-900"
              }`}
            >
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold block">Offline Mode Active</span>
                <span
                  className={`text-[11px] ${
                    isDark ? "text-amber-300/80" : "text-amber-800"
                  }`}
                >
                  Publishing listings is disabled while disconnected to prevent data loss. Please reconnect to submit.
                </span>
              </div>
            </div>
          )}

          {error && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                isDark
                  ? "bg-red-950/40 border-red-500/30 text-red-200"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Footer Submit */}
          <div
            className={`pt-3 border-t flex items-center gap-3 ${
              isDark ? "border-slate-800" : "border-slate-100"
            }`}
          >
            <motion.button
              id="create-modal-submit-btn"
              type="submit"
              whileHover={isOnline && !isSubmitting ? { scale: 1.02 } : {}}
              whileTap={isOnline && !isSubmitting ? { scale: 0.98 } : {}}
              disabled={isSubmitting || !isOnline}
              title={
                !isOnline
                  ? "Publishing is disabled while disconnected to prevent data loss"
                  : "Publish item listing to campus marketplace"
              }
              className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all select-none ${
                !isOnline
                  ? isDark
                    ? "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed shadow-none"
                    : "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                  : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer disabled:opacity-50"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving to Campus Marketplace...
                </>
              ) : !isOnline ? (
                <>
                  <WifiOff className="w-4 h-4" />
                  Publish Disabled (Offline)
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Publish Item Listing
                </>
              )}
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className={`px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors cursor-pointer ${
                isDark
                  ? "border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                  : "border-slate-300 text-slate-700 hover:bg-slate-100"
              }`}
            >
              Cancel
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
};
