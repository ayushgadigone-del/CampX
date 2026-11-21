import React, { useState, useMemo } from "react";
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
  ShieldCheck,
  Package,
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
import {
  sanitizeText,
  validateFileUpload,
  sanitizeImageForPrivacy,
  rateLimiter,
  ALLOWED_IMAGE_MIME_TYPES,
  MAX_IMAGE_SIZE_BYTES,
} from "../utils/security";

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
  userBranch?: string;
  userYear?: string;
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

interface BundleTemplate {
  id: string;
  label: string;
  title: string;
  category: ItemCategory;
  condition: ItemCondition;
  price: number;
  originalPrice: number;
  description: string;
  imageUrl: string;
  tags: string[];
  items: string[];
}

const SEMESTER_BUNDLE_TEMPLATES: BundleTemplate[] = [
  {
    id: "fe-kit",
    label: "Complete FE Kit",
    title: "Complete FE Engineering Starter Kit (4-Item Bundle)",
    category: "Lab Equipment",
    condition: "Good",
    price: 950,
    originalPrice: 2600,
    description:
      "Complete First Year engineering pack ready for Sem 1 & 2 classes and labs. Save over 60% in a single campus handover.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    tags: ["Semester Bundle", "FE Kit", "Mini Drafter", "Calculator", "B.S. Grewal"],
    items: [
      "Omega Mini Drafter + Carry Tube",
      "Casio FX-991ES Plus Scientific Calculator",
      "Higher Engineering Mathematics (B.S. Grewal)",
      "White Cotton Lab Coat / Apron",
    ],
  },
  {
    id: "se-comp-books",
    label: "SE Comp Book Set",
    title: "SE Computer Engineering Full Book Set (Sem 3 & 4)",
    category: "Books",
    condition: "Good",
    price: 750,
    originalPrice: 2400,
    description:
      "Complete Second Year Computer / IT core textbooks covering SPPU Sem 3 & 4 syllabus. Clean pages, firm bindings.",
    imageUrl:
      "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80",
    tags: ["Semester Bundle", "SE Comp", "Book Set", "DSA", "Discrete Math"],
    items: [
      "Data Structures & Algorithms (Mark Allen Weiss)",
      "Discrete Mathematics (Kenneth Rosen)",
      "Digital Logic Design (Morris Mano)",
      "Computer Organization & Architecture (Stallings)",
    ],
  },
  {
    id: "entc-lab-pack",
    label: "E&TC Lab Kit",
    title: "E&TC Practical & Breadboard Electronics Bundle",
    category: "Lab Equipment",
    condition: "Like New",
    price: 520,
    originalPrice: 1350,
    description:
      "Tested electronics lab bundle for BEE, Digital Circuits, and mini-projects. Ready to use immediately.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    tags: ["Semester Bundle", "E&TC Lab", "Multimeter", "Breadboard", "Soldering"],
    items: [
      "Digital Multimeter with Continuity Probes",
      "25W Soldering Iron + Stand & Solder Wire",
      "Dual 830-Point Breadboards + Jumper Wire Box",
      "Component Organizer (Resistors, LEDs, Logic ICs)",
    ],
  },
  {
    id: "mech-drafting",
    label: "Mech Drafting Pack",
    title: "Mechanical Workshop & Drawing Complete Bundle",
    category: "Lab Equipment",
    condition: "Good",
    price: 680,
    originalPrice: 1750,
    description:
      "All drawing and workshop measurement gear needed for Mechanical Engineering labs in one clean kit.",
    imageUrl:
      "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=800&q=80",
    tags: ["Semester Bundle", "Mechanical", "Vernier Caliper", "Mini Drafter"],
    items: [
      "Stainless Steel 150mm Vernier Caliper",
      "0-25mm Micrometer Screw Gauge",
      "Mini Drafter + Roller Scale & Sheet Clips",
      "Blue Workshop Boiler Apron",
    ],
  },
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
  userBranch,
  userYear,
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
  const [originalPrice, setOriginalPrice] = useState<number | "">("");
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

  // Semester-End Bundle Pack state
  const [isBundle, setIsBundle] = useState<boolean>(false);
  const [bundleItems, setBundleItems] = useState<string[]>([]);
  const [newBundleItemInput, setNewBundleItemInput] = useState<string>("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [analysisNotice, setAnalysisNotice] = useState<string | null>(null);

  const applyBundleTemplate = (tpl: BundleTemplate) => {
    setIsBundle(true);
    setTitle(tpl.title);
    setCategory(tpl.category);
    setCondition(tpl.condition);
    setListingType("sell");
    setPrice(tpl.price);
    setOriginalPrice(tpl.originalPrice);
    setDescription(tpl.description);
    setImageUrl(tpl.imageUrl);
    setTags(tpl.tags);
    setBundleItems(tpl.items);
    setError(null);
  };

  const handleAddBundleItem = () => {
    const clean = newBundleItemInput.trim();
    if (clean && !bundleItems.includes(clean)) {
      setBundleItems((prev) => [...prev, clean]);
      setNewBundleItemInput("");
      setIsBundle(true);
    }
  };

  const handleRemoveBundleItem = (itemToRemove: string) => {
    setBundleItems((prev) => prev.filter((item) => item !== itemToRemove));
  };

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

  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateFileUpload(file, ALLOWED_IMAGE_MIME_TYPES, MAX_IMAGE_SIZE_BYTES);
    if (!validation.valid) {
      setError(validation.error || "Invalid image file format or size.");
      return;
    }

    try {
      // Strip EXIF / GPS metadata locally before storing to safeguard student privacy
      const sanitizedBase64 = await sanitizeImageForPrivacy(file);
      setImageUrl(sanitizedBase64);
      if (isOnline) {
        analyzeImageAndSuggestFields(sanitizedBase64);
      }
    } catch (err) {
      console.warn("Privacy strip fallback:", err);
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

    // Rate limiting check to prevent listing spam / bot submissions
    const rateCheck = rateLimiter.checkRateLimit(
      `create_listing_${currentUser?.uid || "anon"}`,
      5,
      60000
    );
    if (!rateCheck.allowed) {
      setError(
        `🛡️ Security rate limit active: Please wait ${Math.ceil(
          rateCheck.retryAfterMs / 1000
        )}s before publishing another listing.`
      );
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Sanitize user text inputs to prevent XSS and script injections
    const sanitizedTitle = sanitizeText(title.trim()).slice(0, 150);
    const sanitizedDesc = sanitizeText(description.trim()).slice(0, 3000);
    const sanitizedExchange = exchangeFor ? sanitizeText(exchangeFor.trim()).slice(0, 150) : undefined;
    const sanitizedTags = tags.map((t) => sanitizeText(t.trim())).filter(Boolean).slice(0, 10);
    const sanitizedBundleItems = isBundle
      ? bundleItems.map((b) => sanitizeText(b.trim())).filter(Boolean).slice(0, 10)
      : undefined;

    const newListingData: Omit<Listing, "id"> = {
      title: sanitizedTitle,
      category,
      condition,
      listingType,
      price: listingType === "exchange" ? 0 : Number(price),
      originalPrice:
        listingType !== "exchange" && originalPrice && Number(originalPrice) > 0
          ? Number(originalPrice)
          : undefined,
      exchangeFor: listingType !== "sell" ? sanitizedExchange : undefined,
      description: sanitizedDesc,
      imageUrl,
      sellerId: currentUser?.uid || "student-pvgcoet-id",
      sellerName: currentUser?.displayName || "Campus Student",
      sellerEmail: currentUser?.email || "student@pvgcoet.ac.in",
      sellerPhoto: currentUser?.photoURL || undefined,
      department: userBranch || "Engineering Student",
      year: userYear || "Student",
      status: "available",
      availableStock: 1,
      locationPreference,
      tags: sanitizedTags.length > 0 ? sanitizedTags : undefined,
      isBundle: isBundle && Boolean(sanitizedBundleItems && sanitizedBundleItems.length > 0),
      bundleItems:
        isBundle && sanitizedBundleItems && sanitizedBundleItems.length > 0
          ? sanitizedBundleItems
          : undefined,
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
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto"
        >
          <div
            id="create-listing-modal"
            className={`relative w-full max-w-2xl rounded-2xl shadow-2xl border overflow-hidden my-8 ${
              isDark
                ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A]"
                : "bg-white text-[#18201C] border-[#DFE6E2]"
            }`}
          >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b ${
            isDark ? "border-[#242E2A] bg-[#0D1110]" : "border-[#DFE6E2] bg-[#F7F9F8]"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-[#2F5D50] dark:bg-[#387262] text-white">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2
                className={`text-lg font-bold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Post Pre-Owned Item or Bundle
              </h2>
              <p
                className={`text-xs ${
                  isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                }`}
              >
                List individual gear or a one-click Semester-End Bundle Pack for PVG&apos;s COET students
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#2F5D50] dark:text-[#7BBFA8] bg-[#EFF4F1] dark:bg-[#1B2320] px-2.5 py-1 rounded-md border border-[#DFE6E2] dark:border-[#242E2A]">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>EXIF Stripped</span>
            </span>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg cursor-pointer ${
                isDark
                  ? "text-[#8FA199] hover:text-[#ECF2EF] hover:bg-[#1B2320]"
                  : "text-[#5C6B63] hover:text-[#18201C] hover:bg-[#EFF4F1]"
              }`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Scanner Banner */}
        <div
          className={`mx-6 mt-5 p-3.5 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
            isDark
              ? "bg-[#0D1110] border-[#242E2A] text-[#ECF2EF]"
              : "bg-[#F7F9F8] border-[#DFE6E2] text-[#18201C]"
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[#2F5D50] dark:bg-[#387262] text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold block">
                Have a photo? Auto-fill with AI Inspector
              </span>
              <p className="text-xs text-[#5C6B63] dark:text-[#8FA199]">
                Grades cosmetic condition and suggests a realistic student price range.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAIInspector();
            }}
            className="shrink-0 h-8 px-3.5 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Scan with AI
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Semester-End Bundle Pack One-Click Presets */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 ${
              isDark ? "bg-[#0D1110] border-[#242E2A]" : "bg-[#F7F9F8] border-[#DFE6E2]"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#2F5D50] dark:text-[#7BBFA8]" />
                <span className="text-xs font-semibold">
                  Semester-End Bundle Pack (One-Click Templates)
                </span>
              </div>
              <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#5C6B63] dark:text-[#8FA199] cursor-pointer">
                <input
                  type="checkbox"
                  checked={isBundle}
                  onChange={(e) => setIsBundle(e.target.checked)}
                  className="rounded accent-[#2F5D50]"
                />
                <span>List as Bundle Pack</span>
              </label>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {SEMESTER_BUNDLE_TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => applyBundleTemplate(tpl)}
                  className={`px-2.5 py-2 rounded-lg border text-left text-xs font-medium cursor-pointer ${
                    isDark
                      ? "bg-[#141A18] border-[#242E2A] hover:border-[#5BA18C] text-[#ECF2EF]"
                      : "bg-white border-[#DFE6E2] hover:border-[#2F5D50] text-[#18201C]"
                  }`}
                >
                  <div className="font-semibold truncate">{tpl.label}</div>
                  <div className="text-[11px] text-[#5C6B63] dark:text-[#8FA199] font-mono">
                    {tpl.items.length} items · ₹{tpl.price}
                  </div>
                </button>
              ))}
            </div>

            {isBundle && (
              <div className="pt-2 border-t border-[#DFE6E2] dark:border-[#242E2A] space-y-2">
                <div className="text-[11px] font-semibold text-[#5C6B63] dark:text-[#8FA199]">
                  Included items in this bundle ({bundleItems.length}):
                </div>
                {bundleItems.length > 0 && (
                  <ul className="space-y-1.5">
                    {bundleItems.map((bItem) => (
                      <li
                        key={bItem}
                        className={`flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg border text-xs ${
                          isDark
                            ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
                            : "bg-white border-[#DFE6E2] text-[#18201C]"
                        }`}
                      >
                        <span className="truncate">{bItem}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBundleItem(bItem)}
                          className="text-[#5C6B63] hover:text-rose-500 cursor-pointer shrink-0"
                          aria-label={`Remove ${bItem}`}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Add item to bundle (e.g., Roller Scale, Lab Manual)..."
                    value={newBundleItemInput}
                    onChange={(e) => setNewBundleItemInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddBundleItem();
                      }
                    }}
                    className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none ${
                      isDark
                        ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#5C6B63] focus:border-[#5BA18C]"
                        : "bg-white border-[#DFE6E2] text-[#18201C] placeholder:text-[#83928A] focus:border-[#2F5D50]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={handleAddBundleItem}
                    disabled={!newBundleItemInput.trim()}
                    className="px-3 py-1.5 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] disabled:opacity-40 text-white text-xs font-semibold cursor-pointer shrink-0"
                  >
                    Add Item
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Title */}
          <div>
            <label
              className={`block text-xs font-semibold mb-1 ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Item Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Casio FX-991ES Plus Calculator or Complete FE Starter Kit"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none ${
                isDark
                  ? "bg-[#0D1110] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#5C6B63] focus:border-[#5BA18C]"
                  : "bg-white border-[#DFE6E2] text-[#18201C] placeholder:text-[#83928A] focus:border-[#2F5D50]"
              }`}
            />
          </div>

          {/* AI Visual Inspection Recommendations Banner */}
          {aiInspectionData && (
            <div
              id="ai-category-condition-suggestion-banner"
              className={`p-3.5 rounded-2xl border shadow-2xs space-y-2.5 ${
                isDark
                  ? "bg-[#141A18] border-[#5BA18C]"
                  : "bg-[#F3F5F2] border-[#C4D9D1]"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-lg bg-[#2F5D50] text-white">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <span
                      className={`text-xs font-bold block ${
                        isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                      }`}
                    >
                      AI Visual Analysis Suggestions
                    </span>
                    <span
                      className={`text-[11px] font-medium ${
                        isDark ? "text-[#7BBFA8]/80" : "text-[#2F5D50]"
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
                        ? "bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                        : "bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
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
                        isDark ? "text-[#7BBFA8] hover:text-[#7BBFA8]" : "text-[#2F5D50] hover:text-[#2F5D50]"
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
                      ? "bg-[#141A18]/90 border-[#242E2A]"
                      : "bg-white/80 border-[#C4D9D1]"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    <span>Suggested Category</span>
                    {category === aiInspectionData.category ? (
                      <span className="text-[#2F5D50] font-bold text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-[#2F5D50]" /> Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCategory(aiInspectionData.category)}
                        className="text-[#7BBFA8] hover:text-[#7BBFA8] font-bold text-[10px] underline cursor-pointer"
                      >
                        Apply "{aiInspectionData.category}"
                      </button>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-1.5 pt-1 text-sm font-bold ${
                      isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5 text-[#2F5D50] shrink-0" />
                    <span>{aiInspectionData.category}</span>
                  </div>
                  {aiInspectionData.categoryReasoning && (
                    <p
                      className={`text-[11px] mt-1 leading-tight ${
                        isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
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
                      ? "bg-[#141A18]/90 border-[#242E2A]"
                      : "bg-white/80 border-[#C4D9D1]"
                  }`}
                >
                  <div
                    className={`flex items-center justify-between text-[11px] font-bold uppercase tracking-wider ${
                      isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                    }`}
                  >
                    <span>Audited Condition</span>
                    {condition === aiInspectionData.condition ? (
                      <span className="text-[#2F5D50] font-bold text-[10px] flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3 text-[#2F5D50]" /> Selected
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setCondition(aiInspectionData.condition)}
                        className="text-[#7BBFA8] hover:text-[#7BBFA8] font-bold text-[10px] underline cursor-pointer"
                      >
                        Apply "{aiInspectionData.condition}"
                      </button>
                    )}
                  </div>
                  <div
                    className={`flex items-center gap-1.5 pt-1 text-sm font-bold ${
                      isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-[#2F5D50] shrink-0" />
                    <span>{aiInspectionData.condition}</span>
                  </div>
                  {aiInspectionData.conditionReasoning && (
                    <p
                      className={`text-[11px] mt-1 leading-tight ${
                        isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
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
                  ? "bg-[#182823] border-[#5BA18C] text-[#7BBFA8]"
                  : "bg-[#EFF4F1] border-[#C4D9D1] text-[#2F5D50]"
              }`}
            >
              <Loader2 className="w-4 h-4 text-[#2F5D50] shrink-0" />
              <span>
                <strong>Gemini AI Visual Analysis:</strong> Scanning photo to automatically classify and suggest the most accurate Category & Condition...
              </span>
            </div>
          )}

          {analysisNotice && !isAnalyzingImage && (
            <div
              className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                isDark
                  ? "bg-[#182823] border-[#5BA18C] text-[#7BBFA8]"
                  : "bg-[#EFF4F1] border-[#C4D9D1] text-[#2F5D50]"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#2F5D50] shrink-0" />
              <span>{analysisNotice}</span>
            </div>
          )}

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                className={`block text-xs font-bold mb-1 flex items-center justify-between ${
                  isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
                }`}
              >
                <span>Category *</span>
                {aiInspectionData?.category && (
                  <span className="text-[10px] font-semibold text-[#7BBFA8] flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI: {aiInspectionData.category}
                  </span>
                )}
              </label>
              <select
                id="create-listing-category-select"
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50] transition-colors ${
                  isDark
                    ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A]"
                    : "bg-white text-[#18201C] border-[#C4D1CA]"
                } ${
                  aiInspectionData?.category === category
                    ? "border-[#5BA18C] ring-1 ring-[#2F5D50]/30 dark:ring-[#5BA18C]/40"
                    : ""
                }`}
              >
                {CATEGORIES.map((cat) => (
                  <option
                    key={cat}
                    value={cat}
                    className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}
                  >
                    {cat} {aiInspectionData?.category === cat ? "✨ (AI Recommended)" : ""}
                  </option>
                ))}
              </select>

              {aiInspectionData?.category && (
                <div
                  className={`mt-1 flex items-center justify-between text-[11px] ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#7BBFA8]" />
                    <span>
                      Visual Match: <strong>{aiInspectionData.category}</strong>
                      {aiInspectionData.categoryConfidence ? ` (${aiInspectionData.categoryConfidence}%)` : ""}
                    </span>
                  </span>
                  {category !== aiInspectionData.category && (
                    <button
                      type="button"
                      onClick={() => setCategory(aiInspectionData.category)}
                      className="text-[#7BBFA8] font-bold hover:underline cursor-pointer"
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
                  isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
                }`}
              >
                <span>Item Condition *</span>
                {aiInspectionData?.condition && (
                  <span className="text-[10px] font-semibold text-[#7BBFA8] flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> AI: {aiInspectionData.condition}
                  </span>
                )}
              </label>
              <select
                id="create-listing-condition-select"
                value={condition}
                onChange={(e) => setCondition(e.target.value as ItemCondition)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50] transition-colors ${
                  isDark
                    ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A]"
                    : "bg-white text-[#18201C] border-[#C4D1CA]"
                } ${
                  aiInspectionData?.condition === condition
                    ? "border-[#5BA18C] ring-1 ring-[#2F5D50]/30 dark:ring-[#5BA18C]/40"
                    : ""
                }`}
              >
                {CONDITIONS.map((c) => (
                  <option
                    key={c}
                    value={c}
                    className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}
                  >
                    {c} {aiInspectionData?.condition === c ? "✨ (AI Detected)" : ""}
                  </option>
                ))}
              </select>

              {aiInspectionData?.condition && (
                <div
                  className={`mt-1 flex items-center justify-between text-[11px] ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
                  }`}
                >
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#7BBFA8]" />
                    <span>Visual Audit: <strong>{aiInspectionData.condition}</strong></span>
                  </span>
                  {condition !== aiInspectionData.condition && (
                    <button
                      type="button"
                      onClick={() => setCondition(aiInspectionData.condition)}
                      className="text-[#7BBFA8] font-bold hover:underline cursor-pointer"
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
              isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#EFF4F1] border-[#C4D9D1]"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                <Tag className="w-3.5 h-3.5 text-[#2F5D50]" />
                <span>Search Tags & Keywords</span>
                <span
                  className={`text-[11px] font-medium ${
                    isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
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
                    isDark ? "text-[#7BBFA8] hover:text-[#7BBFA8]" : "text-[#2F5D50] hover:text-[#2F5D50]"
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
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2F5D50] text-white shadow-2xs"
                  >
                    <span>#{t}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      className="hover:bg-[#244A3F] rounded-full p-0.5 transition-colors cursor-pointer"
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
                  isDark ? "text-[#5C6B63]" : "text-[#5C6B63]"
                }`}
              >
                No tags added yet. Choose from suggestions below or type custom tags to make your listing easy to find in campus search.
              </p>
            )}

            {/* Auto-suggested Pills */}
            {suggestedTags.length > 0 ? (
              <div
                className={`space-y-1.5 pt-1.5 border-t ${
                  isDark ? "border-[#242E2A]" : "border-[#C4D9D1]"
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 text-[11px] font-semibold ${
                    isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
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
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border shadow-2xs cursor-pointer group ${
                        isDark
                          ? "bg-[#1B2320] hover:bg-[#2F5D50] text-[#ECF2EF] hover:text-white border-[#242E2A] hover:border-[#5BA18C]"
                          : "bg-white hover:bg-[#2F5D50] text-[#5C6B63] hover:text-white border-[#DFE6E2] hover:border-[#5BA18C]"
                      }`}
                    >
                      <Plus className="w-3 h-3 text-[#2F5D50] group-hover:text-white" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : title.trim().length > 0 ? (
              <div
                className={`text-[11px] font-medium flex items-center gap-1 pt-1 border-t ${
                  isDark ? "border-[#242E2A] text-[#7BBFA8]" : "border-[#C4D9D1] text-[#2F5D50]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>All key tags matching "{title}" have been added!</span>
              </div>
            ) : null}

            {/* Manual Tag Input */}
            <div
              className={`flex items-center gap-2 pt-1 border-t ${
                isDark ? "border-[#242E2A]" : "border-[#C4D9D1]"
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
                className={`flex-1 px-3 py-1.5 text-xs rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#5C6B63]"
                    : "bg-white border-[#C4D1CA] text-[#18201C] placeholder:text-[#8FA199]"
                }`}
              />
              <button
                type="button"
                onClick={handleAddCustomTag}
                disabled={!customTagInput.trim()}
                className="px-3 py-1.5 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] disabled:bg-[#242E2A] text-white disabled:text-[#5C6B63] text-xs font-bold transition-colors cursor-pointer shrink-0"
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
                  isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
                }`}
              >
                Listing Type *
              </label>
              <div
                className={`grid grid-cols-3 gap-1.5 p-1 rounded-xl ${
                  isDark ? "bg-[#141A18] border border-[#242E2A]" : "bg-[#EFF4F1]"
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
                          ? "bg-[#2F5D50] text-white shadow-xs"
                          : "bg-white text-[#2F5D50] shadow-xs"
                        : isDark
                        ? "text-[#8FA199] hover:text-white"
                        : "text-[#5C6B63] hover:text-[#18201C]"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Price inputs: Actual/Original MRP vs Resale Price */}
            <div className="space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Resale Price */}
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center justify-between ${
                      isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
                    }`}
                  >
                    <span>Resale Price (₹) *</span>
                    {aiInspectionData && (
                      <span className="text-[10px] text-[#7BBFA8] font-semibold">
                        AI: ₹{aiInspectionData.suggestedPriceMin}–₹{aiInspectionData.suggestedPriceMax}
                      </span>
                    )}
                  </label>
                  <div className="relative">
                    <span
                      className={`absolute left-3 top-2.5 font-bold text-sm ${
                        isDark ? "text-[#5C6B63]" : "text-[#8FA199]"
                      }`}
                    >
                      ₹
                    </span>
                    <input
                      id="listing-resale-price-input"
                      type="number"
                      min="0"
                      disabled={listingType === "exchange"}
                      value={listingType === "exchange" ? 0 : price}
                      onChange={(e) => setPrice(Number(e.target.value))}
                      placeholder="e.g. 350"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
                        isDark
                          ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] disabled:bg-[#0D1110] disabled:text-[#5C6B63]"
                          : "bg-white border-[#C4D1CA] text-[#18201C] disabled:bg-[#EFF4F1] disabled:text-[#8FA199]"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] block mt-0.5 ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                    Amount student buyer pays
                  </span>
                </div>

                {/* Actual / Original MRP Price */}
                <div>
                  <label
                    className={`block text-xs font-bold mb-1 flex items-center justify-between ${
                      isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
                    }`}
                  >
                    <span>Actual / Original Price (₹)</span>
                    <span className="text-[10px] text-[#8FA199] font-normal">Optional MRP</span>
                  </label>
                  <div className="relative">
                    <span
                      className={`absolute left-3 top-2.5 font-bold text-sm ${
                        isDark ? "text-[#5C6B63]" : "text-[#8FA199]"
                      }`}
                    >
                      ₹
                    </span>
                    <input
                      id="listing-original-price-input"
                      type="number"
                      min="0"
                      disabled={listingType === "exchange"}
                      value={originalPrice}
                      onChange={(e) =>
                        setOriginalPrice(e.target.value === "" ? "" : Number(e.target.value))
                      }
                      placeholder="e.g. 899 (Store MRP)"
                      className={`w-full pl-8 pr-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
                        isDark
                          ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] disabled:bg-[#0D1110] disabled:text-[#5C6B63] placeholder:text-[#5C6B63]"
                          : "bg-white border-[#C4D1CA] text-[#18201C] disabled:bg-[#EFF4F1] disabled:text-[#8FA199] placeholder:text-[#8FA199]"
                      }`}
                    />
                  </div>
                  <span className={`text-[10px] block mt-0.5 ${isDark ? "text-[#8FA199]" : "text-[#5C6B63]"}`}>
                    Original retail/purchase MRP for comparison
                  </span>
                </div>
              </div>

              {/* Live Price Comparison & Student Savings Banner */}
              {listingType !== "exchange" &&
                originalPrice &&
                Number(originalPrice) > Number(price) &&
                Number(price) > 0 && (
                  <div
                    className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-medium ${
                      isDark
                        ? "bg-[#182823] border-[#2A4A40] text-[#7BBFA8]"
                        : "bg-[#EFF4F1] border-[#C4D9D1] text-[#2F5D50]"
                    }`}
                  >
                    <span className="flex items-center gap-1.5 font-bold">
                      <Sparkles className="w-3.5 h-3.5 text-[#2F5D50]" />
                      Student Deal: Save ₹{Number(originalPrice) - Number(price)}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#2F5D50] text-white font-black text-[11px] shadow-xs">
                      {Math.round(((Number(originalPrice) - Number(price)) / Number(originalPrice)) * 100)}% OFF
                    </span>
                  </div>
                )}
            </div>
          </div>

          {/* Exchange details if applicable */}
          {listingType !== "sell" && (
            <div>
              <label
                className={`block text-xs font-bold mb-1 flex items-center gap-1 ${
                  isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
                }`}
              >
                <Repeat className="w-3.5 h-3.5 text-[#2F5D50]" />
                Looking to exchange for:
              </label>
              <input
                type="text"
                placeholder="e.g., Workshop Lab coat (Size L) or Engineering Graphics sheet tube"
                value={exchangeFor}
                onChange={(e) => setExchangeFor(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
                  isDark
                    ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#5C6B63]"
                    : "bg-white border-[#C4D1CA] text-[#18201C] placeholder:text-[#8FA199]"
                }`}
              />
            </div>
          )}

          {/* Listing Validity / Expiry Date (30-day auto-inactive) */}
          <div
            className={`p-3.5 rounded-xl border space-y-2 ${
              isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#F7F9F8] border-[#DFE6E2]"
            }`}
          >
            <div className="flex items-center justify-between">
              <label
                className={`text-xs font-bold flex items-center gap-1.5 ${
                  isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
                }`}
              >
                <Clock className="w-3.5 h-3.5 text-[#2F5D50]" />
                <span>Listing Validity / Expiry Period</span>
              </label>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                  isDark
                    ? "text-[#7BBFA8] bg-[#182823] border-[#2A4A40]"
                    : "text-[#2F5D50] bg-[#EFF4F1] border-[#C4D9D1]"
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
                        ? "bg-[#182823] border-[#5BA18C] ring-2 ring-[#2F5D50] text-[#7BBFA8] shadow-xs"
                        : "bg-white border-[#5BA18C] ring-2 ring-[#2F5D50] shadow-xs text-[#2F5D50]"
                      : isDark
                      ? "bg-[#141A18] border-[#242E2A] hover:bg-[#1B2320] text-[#8FA199]"
                      : "bg-white/60 border-[#DFE6E2] hover:bg-white text-[#5C6B63]"
                  }`}
                >
                  <span className="block text-xs font-bold">{opt.label}</span>
                  <span
                    className={`block text-[10px] font-medium ${
                      isDark ? "text-[#5C6B63]" : "text-[#5C6B63]"
                    }`}
                  >
                    {opt.desc}
                  </span>
                </button>
              ))}
            </div>
            <p
              className={`text-[11px] leading-relaxed ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              🕒 Older listings automatically become <strong>inactive</strong> after 30 days to keep student marketplace searches fresh. You can re-activate or renew anytime.
            </p>
          </div>

          {/* Preferred Handover Location */}
          <div>
            <label
              className={`block text-xs font-bold mb-1 flex items-center gap-1 ${
                isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-red-500" />
              Preferred Campus Handover Location
            </label>
            <select
              value={locationPreference}
              onChange={(e) => setLocationPreference(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
                isDark
                  ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A]"
                  : "bg-white text-[#18201C] border-[#C4D1CA]"
              }`}
            >
              {CAMPUS_SPOTS.map((spot) => (
                <option
                  key={spot}
                  value={spot}
                  className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}
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
                isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#8FA199]" />
              Item Description & Observations
            </label>
            <textarea
              rows={3}
              placeholder="State syllabus semester, condition of pages/screens, accessories included..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50] ${
                isDark
                  ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#5C6B63]"
                  : "bg-white border-[#C4D1CA] text-[#18201C] placeholder:text-[#8FA199]"
              }`}
            />
          </div>

          {/* Photo & Preview */}
          <div>
            <label
              className={`block text-xs font-bold mb-1 ${
                isDark ? "text-[#ECF2EF]" : "text-[#5C6B63]"
              }`}
            >
              Item Photo
            </label>
            <div className="flex items-center gap-4">
              <div
                className={`relative w-20 h-20 rounded-xl overflow-hidden border shrink-0 ${
                  isDark ? "border-[#242E2A] bg-[#141A18]" : "border-[#DFE6E2] bg-[#EFF4F1]"
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
                        ? "border-[#242E2A] hover:bg-[#1B2320] text-[#ECF2EF]"
                        : "border-[#C4D1CA] hover:bg-[#F7F9F8] text-[#5C6B63]"
                    }`}
                  >
                    <Upload className="w-3.5 h-3.5 text-[#8FA199]" />
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
                        ? "bg-[#182823] hover:bg-[#182823] text-[#7BBFA8] border-[#2A4A40]"
                        : "bg-[#EFF4F1] hover:bg-[#EFF4F1] text-[#2F5D50] border-[#C4D9D1]"
                    }`}
                    title="Run Gemini AI visual analysis on this photo to suggest Category and Condition"
                  >
                    {isAnalyzingImage ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 text-[#2F5D50]" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-[#2F5D50]" />
                        Auto-Detect Category & Condition
                      </>
                    )}
                  </button>
                </div>
                <p
                  className={`text-[11px] ${
                    isDark ? "text-[#5C6B63]" : "text-[#8FA199]"
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
                        ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF] placeholder:text-[#5C6B63]"
                        : "border-[#DFE6E2] bg-white text-[#18201C]"
                    }`}
                  />
                  {imageUrl && imageUrl.startsWith("http") && (
                    <button
                      type="button"
                      onClick={() => analyzeImageAndSuggestFields(imageUrl)}
                      disabled={!isOnline || isAnalyzingImage}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 cursor-pointer ${
                        isDark
                          ? "bg-[#1B2320] hover:bg-[#242E2A] text-[#ECF2EF]"
                          : "bg-[#EFF4F1] hover:bg-[#DFE6E2] text-[#5C6B63]"
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
                  ? "bg-[#251F15] border-amber-500/30 text-[#DFC29B]"
                  : "bg-[#FDF6EC] border-[#EED8B8] text-[#9E6B43]"
              }`}
            >
              <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="leading-tight">
                <span className="font-bold block">Offline Mode Active</span>
                <span
                  className={`text-[11px] ${
                    isDark ? "text-[#DFC29B]/80" : "text-[#9E6B43]"
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
              isDark ? "border-[#242E2A]" : "border-[#DFE6E2]"
            }`}
          >
            <button
              id="create-modal-submit-btn"
              type="submit"
              disabled={isSubmitting || !isOnline}
              title={
                !isOnline
                  ? "Publishing is disabled while disconnected to prevent data loss"
                  : "Publish item listing to campus marketplace"
              }
              className={`flex-1 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg font-semibold text-sm select-none ${
                !isOnline
                  ? isDark
                    ? "bg-[#1B2320] text-[#5C6B63] border border-[#242E2A] cursor-not-allowed"
                    : "bg-[#EFF4F1] text-[#83928A] border border-[#DFE6E2] cursor-not-allowed"
                  : "bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white cursor-pointer disabled:opacity-50"
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4" />
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
                  {isBundle ? "Publish Semester Bundle Pack" : "Publish Item Listing"}
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer ${
                isDark
                  ? "border-[#242E2A] text-[#ECF2EF] hover:bg-[#1B2320]"
                  : "border-[#DFE6E2] text-[#18201C] hover:bg-[#EFF4F1]"
              }`}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
