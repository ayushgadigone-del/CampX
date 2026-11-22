import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ImagePlus,
  Package,
  X,
  AlertCircle,
  WifiOff,
  Loader2,
} from "lucide-react";
import {
  AIInspectionResult,
  ItemCategory,
  ItemCondition,
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

interface PostItemSectionProps {
  currentUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL?: string | null;
  } | null;
  initialInspection?: AIInspectionResult | null;
  initialImage?: string | null;
  onListingCreated: (newListing: Listing) => void;
  onCancel: () => void;
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

const MAX_PHOTOS = 4;

export const PostItemSection: React.FC<PostItemSectionProps> = ({
  currentUser,
  initialInspection,
  initialImage,
  onListingCreated,
  onCancel,
  isOnline = true,
  userBranch,
  userYear,
}) => {
  const { isDark } = useTheme();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState(initialInspection?.title || "");
  const [category, setCategory] = useState<ItemCategory | "">(
    initialInspection?.category || ""
  );
  const [description, setDescription] = useState(
    initialInspection
      ? `${initialInspection.conditionDetails} Verified condition: ${initialInspection.condition}.`.slice(
          0,
          1500
        )
      : ""
  );
  const [originalPrice, setOriginalPrice] = useState<string>("");
  const [sellingPrice, setSellingPrice] = useState<string>(
    initialInspection?.suggestedPriceMin
      ? String(initialInspection.suggestedPriceMin)
      : ""
  );
  const [condition, setCondition] = useState<ItemCondition>(
    initialInspection?.condition || "Good"
  );
  const [photos, setPhotos] = useState<string[]>(() =>
    initialImage ? [initialImage] : []
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialInspection) {
      setTitle(initialInspection.title);
      setCategory(initialInspection.category);
      setCondition(initialInspection.condition);
      if (initialInspection.suggestedPriceMin) {
        setSellingPrice(String(initialInspection.suggestedPriceMin));
      }
      setDescription(
        `${initialInspection.conditionDetails} Features: ${initialInspection.keyFeatures.join(
          ", "
        )}`.slice(0, 1500)
      );
    }
    if (initialImage) {
      setPhotos((prev) =>
        prev.includes(initialImage) ? prev : [initialImage, ...prev].slice(0, MAX_PHOTOS)
      );
    }
  }, [initialInspection, initialImage]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    const remainingSlots = MAX_PHOTOS - photos.length;
    if (remainingSlots <= 0) {
      setError(`You can upload up to ${MAX_PHOTOS} images.`);
      return;
    }

    const filesToProcess = selectedFiles.slice(0, remainingSlots);
    setError(null);
    setIsProcessingPhotos(true);

    const processed: string[] = [];
    for (const file of filesToProcess) {
      const validation = validateFileUpload(
        file,
        ALLOWED_IMAGE_MIME_TYPES,
        MAX_IMAGE_SIZE_BYTES
      );
      if (!validation.valid) {
        setError(validation.error || "Invalid image format or file exceeds 5 MB.");
        continue;
      }
      try {
        const sanitizedBase64 = await sanitizeImageForPrivacy(file);
        processed.push(sanitizedBase64);
      } catch {
        const fallbackBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
        processed.push(fallbackBase64);
      }
    }

    if (processed.length > 0) {
      setPhotos((prev) => [...prev, ...processed].slice(0, MAX_PHOTOS));
    }

    setIsProcessingPhotos(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = (indexToRemove: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Please enter a product name.");
      return;
    }
    if (!category) {
      setError("Please select a category.");
      return;
    }
    if (!originalPrice.trim() || Number(originalPrice) < 0) {
      setError("Please enter a valid original price.");
      return;
    }
    if (!sellingPrice.trim() || Number(sellingPrice) < 0) {
      setError("Please enter a valid selling price.");
      return;
    }
    if (photos.length === 0) {
      setError("Please upload at least one product photo.");
      return;
    }
    if (!isOnline) {
      setError("Cannot publish listing while offline. Please reconnect to submit.");
      return;
    }

    const rateCheck = rateLimiter.checkRateLimit(
      `create_listing_${currentUser?.uid || "anon"}`,
      5,
      60000
    );
    if (!rateCheck.allowed) {
      setError(
        `Please wait ${Math.ceil(
          rateCheck.retryAfterMs / 1000
        )}s before publishing another listing.`
      );
      return;
    }

    setIsSubmitting(true);

    const sanitizedTitle = sanitizeText(title.trim()).slice(0, 150);
    const sanitizedDesc = sanitizeText(description.trim()).slice(0, 1500);
    const autoTags = generateSuggestedTags(sanitizedTitle, category).slice(0, 5);

    const newListingData: Omit<Listing, "id"> = {
      title: sanitizedTitle,
      category,
      condition,
      listingType: "sell",
      price: Number(sellingPrice),
      originalPrice: Number(originalPrice) > 0 ? Number(originalPrice) : undefined,
      description: sanitizedDesc,
      imageUrl: photos[0],
      sellerId: currentUser?.uid || "student-pvgcoet-id",
      sellerName: currentUser?.displayName || "Campus Student",
      sellerEmail: currentUser?.email || "student@pvgcoet.ac.in",
      sellerPhoto: currentUser?.photoURL || undefined,
      department: userBranch || "Engineering Student",
      year: userYear || "Student",
      status: "available",
      availableStock: 1,
      tags: autoTags.length > 0 ? autoTags : undefined,
      aiInspection: initialInspection || undefined,
      expiryDate: calculateNewExpiryDate(DEFAULT_EXPIRY_DAYS),
      sellerRating: 5.0,
      sellerReviewCount: 0,
      createdAt: new Date().toISOString(),
    };

    try {
      const docRef = await addDoc(collection(db, "listings"), newListingData);
      onListingCreated({
        ...newListingData,
        id: docRef.id,
      });
    } catch (err: any) {
      handleFirestoreError(err, OperationType.CREATE, "listings");
      onListingCreated({
        ...newListingData,
        id: `listing-${Date.now()}`,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const fieldInputClass = `w-full h-11 px-4 rounded-xl border text-sm focus:outline-none ${
    isDark
      ? "bg-[#111715] border-[#242E2A] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#667870]"
      : "bg-[#FAFBF9] border-[#E2E8E4] focus:border-[#2F5D50] focus:bg-white text-[#18201C] placeholder:text-[#8A9891]"
  }`;

  return (
    <section
      id="post-item-page-section"
      className="w-full max-w-4xl mx-auto space-y-6 text-left"
    >
      {/* Subtle Back Navigation */}
      <div>
        <button
          id="post-item-back-btn"
          type="button"
          onClick={onCancel}
          className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-pointer hover:underline underline-offset-4 ${
            isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>

      {/* Editorial Header */}
      <div className="space-y-2">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.14em] ${
            isDark ? "text-[#C89B6E]" : "text-[#9E6B43]"
          }`}
        >
          SELL ON CAMPUS
        </p>
        <h1
          className={`text-3xl sm:text-4xl font-bold tracking-tight ${
            isDark ? "text-[#ECF2EF]" : "text-[#1E3B33]"
          }`}
        >
          Give your item a new home.
        </h1>
        <p
          className={`text-sm ${
            isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
          }`}
        >
          List your pre-loved items and connect with students on your campus.
        </p>
      </div>

      {/* Main Form Card */}
      <form
        onSubmit={handleSubmit}
        className={`rounded-2xl border p-6 sm:p-10 space-y-9 ${
          isDark
            ? "bg-[#141A18] border-[#242E2A]"
            : "bg-white border-[#DFE6E2]"
        }`}
      >
        {/* 01. Item Information */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h2
              className={`text-lg font-bold tracking-tight ${
                isDark ? "text-[#ECF2EF]" : "text-[#1E3B33]"
              }`}
            >
              01. Item Information
            </h2>
            <p
              className={`text-xs ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Tell students what you are selling.
            </p>
          </div>

          <div className="space-y-5">
            {/* Product Name */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-item-name"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Product Name *
              </label>
              <input
                id="post-item-name"
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Casio Scientific Calculator"
                className={fieldInputClass}
              />
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-item-category"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Category *
              </label>
              <select
                id="post-item-category"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value as ItemCategory | "")}
                className={`${fieldInputClass} cursor-pointer`}
              >
                <option value="">Select a category</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-item-description"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Description
              </label>
              <textarea
                id="post-item-description"
                rows={5}
                maxLength={1500}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your item's condition, features and other useful details..."
                className={`w-full p-4 rounded-xl border text-sm focus:outline-none resize-y ${
                  isDark
                    ? "bg-[#111715] border-[#242E2A] focus:border-[#5BA18C] text-[#ECF2EF] placeholder:text-[#667870]"
                    : "bg-[#FAFBF9] border-[#E2E8E4] focus:border-[#2F5D50] focus:bg-white text-[#18201C] placeholder:text-[#8A9891]"
                }`}
              />
              <div
                className={`text-right text-[11px] ${
                  isDark ? "text-[#73847D]" : "text-[#7C8B83]"
                }`}
              >
                {description.length}/1500 characters
              </div>
            </div>
          </div>
        </div>

        <hr className={isDark ? "border-[#242E2A]" : "border-[#EAEFEA]"} />

        {/* 02. Pricing */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h2
              className={`text-lg font-bold tracking-tight ${
                isDark ? "text-[#ECF2EF]" : "text-[#1E3B33]"
              }`}
            >
              02. Pricing
            </h2>
            <p
              className={`text-xs ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Set a fair price for your item.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Original Price */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-item-original-price"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Original Price (₹) *
              </label>
              <input
                id="post-item-original-price"
                type="number"
                min="0"
                required
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="1000"
                className={fieldInputClass}
              />
            </div>

            {/* Selling Price */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-item-selling-price"
                className={`block text-xs font-semibold ${
                  isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
                }`}
              >
                Selling Price (₹) *
              </label>
              <input
                id="post-item-selling-price"
                type="number"
                min="0"
                required
                value={sellingPrice}
                onChange={(e) => setSellingPrice(e.target.value)}
                placeholder="500"
                className={fieldInputClass}
              />
            </div>
          </div>

          {/* Item Condition */}
          <div className="space-y-1.5">
            <label
              htmlFor="post-item-condition"
              className={`block text-xs font-semibold ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              Item Condition *
            </label>
            <select
              id="post-item-condition"
              required
              value={condition}
              onChange={(e) => setCondition(e.target.value as ItemCondition)}
              className={`${fieldInputClass} cursor-pointer`}
            >
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>
        </div>

        <hr className={isDark ? "border-[#242E2A]" : "border-[#EAEFEA]"} />

        {/* 03. Product Photos */}
        <div className="space-y-5">
          <div className="space-y-1">
            <h2
              className={`text-lg font-bold tracking-tight ${
                isDark ? "text-[#ECF2EF]" : "text-[#1E3B33]"
              }`}
            >
              03. Product Photos
            </h2>
            <p
              className={`text-xs ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Upload clear photographs. At least one image is required.
            </p>
          </div>

          <input
            ref={fileInputRef}
            id="post-item-photos-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={handleFilesSelected}
          />

          {/* Dropzone Upload Box */}
          <button
            id="post-item-upload-zone"
            type="button"
            disabled={isProcessingPhotos || photos.length >= MAX_PHOTOS}
            onClick={() => fileInputRef.current?.click()}
            className={`w-full rounded-2xl border border-dashed py-12 px-6 flex flex-col items-center justify-center text-center space-y-2 ${
              photos.length >= MAX_PHOTOS
                ? isDark
                  ? "bg-[#111715] border-[#242E2A] opacity-60 cursor-not-allowed"
                  : "bg-[#F7F9F8] border-[#DFE6E2] opacity-60 cursor-not-allowed"
                : isDark
                ? "bg-[#18221F] border-[#5BA18C]/60 hover:bg-[#1C2A26] cursor-pointer"
                : "bg-[#F2F6F3] border-[#2F5D50]/55 hover:bg-[#EAF1EC] cursor-pointer"
            }`}
          >
            <ImagePlus
              className={`w-8 h-8 stroke-[1.75] ${
                isDark ? "text-[#7BBFA8]" : "text-[#2F5D50]"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                isDark ? "text-[#ECF2EF]" : "text-[#18201C]"
              }`}
            >
              {isProcessingPhotos
                ? "Processing images..."
                : "Upload product images"}
            </span>
            <span
              className={`text-xs ${
                isDark ? "text-[#8FA199]" : "text-[#5C6B63]"
              }`}
            >
              Click to browse your photos
            </span>
            <span
              className={`text-[11px] pt-1 ${
                isDark ? "text-[#73847D]" : "text-[#7C8B83]"
              }`}
            >
              JPG, PNG or WEBP · Maximum 5 MB each · Up to {MAX_PHOTOS} images
            </span>
          </button>

          {/* Uploaded Photo Thumbnails */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {photos.map((photoSrc, idx) => (
                <div
                  key={`${idx}-${photoSrc.slice(0, 24)}`}
                  className={`relative aspect-square rounded-xl overflow-hidden border ${
                    isDark
                      ? "border-[#242E2A] bg-[#111715]"
                      : "border-[#DFE6E2] bg-[#F7F9F8]"
                  }`}
                >
                  <img
                    src={photoSrc}
                    alt={`Product upload ${idx + 1}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  {idx === 0 && (
                    <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#2F5D50] text-white">
                      Cover
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemovePhoto(idx)}
                    aria-label={`Remove photo ${idx + 1}`}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/65 hover:bg-black/80 text-white flex items-center justify-center cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Offline / Error Feedback */}
        {!isOnline && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2.5 ${
              isDark
                ? "bg-[#251F15] border-[#4A3B23] text-[#DFC29B]"
                : "bg-[#FDF6EC] border-[#EED8B8] text-[#9E6B43]"
            }`}
          >
            <WifiOff className="w-4 h-4 shrink-0" />
            <span>
              You are currently offline. Reconnect to publish your item.
            </span>
          </div>
        )}

        {error && (
          <div
            className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
              isDark
                ? "bg-[#261617] border-[#4A2527] text-[#E58989]"
                : "bg-[#FDF2F2] border-[#F2CACA] text-[#A63A3A]"
            }`}
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <hr className={isDark ? "border-[#242E2A]" : "border-[#EAEFEA]"} />

        {/* Publish Item Primary CTA */}
        <div>
          <button
            id="post-item-publish-btn"
            type="submit"
            disabled={isSubmitting || !isOnline}
            className={`w-full h-12 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-2 text-white ${
              !isOnline
                ? "bg-[#DFE6E2] dark:bg-[#242E2A] text-[#8FA199] cursor-not-allowed"
                : isDark
                ? "bg-[#387262] hover:bg-[#448573] cursor-pointer disabled:opacity-60"
                : "bg-[#2F5D50] hover:bg-[#244A3F] cursor-pointer disabled:opacity-60"
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4" />
                <span>Publishing Item...</span>
              </>
            ) : (
              <>
                <Package className="w-4 h-4" />
                <span>Publish Item</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};
