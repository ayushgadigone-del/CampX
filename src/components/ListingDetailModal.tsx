import React, { useState } from "react";
import {
  X,
  Sparkles,
  MapPin,
  Calendar as CalendarIcon,
  MessageCircle,
  ShieldCheck,
  CheckCircle2,
  Tag,
  Repeat,
  BadgeCheck,
  Zap,
  ExternalLink,
  Heart,
  Share2,
  Check,
  ZoomIn,
  Star,
  MessageSquarePlus,
  Flag,
  Clock,
  AlertTriangle,
  WifiOff,
  HelpCircle,
  ArrowRight,
  Eye,
  Flame,
} from "lucide-react";
import { Listing, Review } from "../types";
import { formatExpiryInfo } from "../utils/expiryUtils";
import { getCategoryFAQs } from "../utils/faqQuestions";
import { SellerReputationBadge } from "./SellerReputationBadge";

interface ListingDetailModalProps {
  listing: Listing | null;
  allListings?: Listing[];
  isOpen: boolean;
  onClose: () => void;
  onOpenChat: (listing: Listing, initialQuestion?: string) => void;
  onOpenCalendar: (listing: Listing) => void;
  onUpdateStatus?: (listingId: string, newStatus: Listing["status"]) => void;
  currentUserId?: string;
  currentUser?: { uid?: string; displayName?: string | null; email?: string | null } | null;
  isWishlisted?: boolean;
  onToggleWishlist?: (listingId: string) => void;
  onOpenLightbox?: (listing: Listing) => void;
  onAddReview?: (listingId: string, review: Omit<Review, "id" | "createdAt">) => void;
  onReportListing?: (listingId: string, reason: string, details: string) => void;
  onRenewListing?: (listingId: string) => void;
  isOnline?: boolean;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  allListings,
  isOpen,
  onClose,
  onOpenChat,
  onOpenCalendar,
  onUpdateStatus,
  currentUserId,
  currentUser,
  isWishlisted = false,
  onToggleWishlist,
  onOpenLightbox,
  onAddReview,
  onReportListing,
  onRenewListing,
  isOnline = true,
}) => {
  if (!isOpen || !listing) return null;

  const isSeller = currentUserId === listing.sellerId;
  const [isShared, setIsShared] = useState(false);

  // Reporting state
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState<string>("Suspicious pricing or potential scam");
  const [reportDetails, setReportDetails] = useState<string>("");
  const [isReportSubmitted, setIsReportSubmitted] = useState<boolean>(false);
  const [reportSuccessToast, setReportSuccessToast] = useState<string | null>(null);
  const isReported = Boolean(listing.isReported || isReportSubmitted);
  const expiryInfo = formatExpiryInfo(listing);

  // Review submission state
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewerNameInput, setReviewerNameInput] = useState<string>(
    currentUser?.displayName || "Verified Student"
  );
  const [departmentInput, setDepartmentInput] = useState<string>(
    currentUser?.email?.includes("mech")
      ? "Mechanical Engineering"
      : currentUser?.email?.includes("it")
      ? "Information Technology"
      : "Computer Science"
  );
  const [yearInput, setYearInput] = useState<string>("2nd Year");
  const [handoverLocationInput, setHandoverLocationInput] = useState<string>(
    listing.handoverDetails?.location || listing.locationPreference || "Central Library Quad"
  );
  const [conditionMatchedInput, setConditionMatchedInput] = useState<boolean>(true);
  const [commentInput, setCommentInput] = useState<string>("");
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);
  const [reviewSuccessMessage, setReviewSuccessMessage] = useState<string | null>(null);

  const reviewsList = listing.reviews || [];
  const totalReviewsCount = reviewsList.length || listing.totalReviews || 0;
  const calculatedAverage =
    reviewsList.length > 0
      ? Math.round(
          (reviewsList.reduce((acc, r) => acc + r.rating, 0) / reviewsList.length) * 10
        ) / 10
      : (listing.averageRating || 0);

  const conditionMatchedCount = reviewsList.filter((r) => r.conditionMatched !== false).length;
  const conditionMatchedPercent =
    reviewsList.length > 0
      ? Math.round((conditionMatchedCount / reviewsList.length) * 100)
      : 100;

  // Generate 3 category-specific dynamic FAQs to ask the seller
  const dynamicFaqs = getCategoryFAQs(listing);

  const getRatingLabel = (stars: number) => {
    switch (stars) {
      case 5:
        return "5 Stars — Excellent item & seamless handover";
      case 4:
        return "4 Stars — Very good condition, met as agreed";
      case 3:
        return "3 Stars — Fair / average condition";
      case 2:
        return "2 Stars — Minor issues or condition delay";
      case 1:
        return "1 Star — Poor condition / inaccurate listing";
      default:
        return "Select star rating";
    }
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) {
      return;
    }
    setIsSubmittingReview(true);

    const newReviewData: Omit<Review, "id" | "createdAt"> = {
      listingId: listing.id,
      reviewerId: currentUser?.uid || `student_${Date.now()}`,
      reviewerName: reviewerNameInput.trim() || "Student Buyer",
      reviewerEmail: currentUser?.email || undefined,
      reviewerDepartment: departmentInput.trim() || undefined,
      reviewerYear: yearInput.trim() || undefined,
      rating: ratingInput,
      comment: commentInput.trim(),
      handoverLocation: handoverLocationInput.trim() || undefined,
      conditionMatched: conditionMatchedInput,
    };

    if (onAddReview) {
      onAddReview(listing.id, newReviewData);
    }

    setIsSubmittingReview(false);
    setReviewSuccessMessage("Thank you! Your handover review has been submitted.");
    setCommentInput("");
    setShowReviewForm(false);
  };

  const handleShare = async () => {
    const priceText =
      listing.listingType === "exchange"
        ? "Available for Exchange"
        : listing.listingType === "both"
        ? `₹${listing.price} (or Swap)`
        : `₹${listing.price}`;

    const locationText = listing.locationPreference
      ? ` Handover spot: ${listing.locationPreference}.`
      : "";

    const customMessage = `🎓 Check out this verified student listing on Campus Marketplace: "${listing.title}" for ${priceText} (Condition: ${listing.condition}) by ${listing.sellerName}.${locationText}`;
    const shareUrl = `${window.location.origin}${window.location.pathname}?item=${listing.id}#listing-${listing.id}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title: `${listing.title} | Campus Marketplace`,
          text: customMessage,
          url: shareUrl,
        });
        setIsShared(true);
        setTimeout(() => setIsShared(false), 2500);
      } catch (err: any) {
        if (err.name !== "AbortError") {
          fallbackCopy(shareUrl, customMessage);
        }
      }
    } else {
      fallbackCopy(shareUrl, customMessage);
    }
  };

  const fallbackCopy = async (shareUrl: string, message: string) => {
    try {
      const shareContent = `${message}\n\nView listing: ${shareUrl}`;
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareContent);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareContent;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setIsShared(true);
      setTimeout(() => setIsShared(false), 2500);
    } catch (err) {
      console.warn("Clipboard copy notice:", err);
    }
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsReportSubmitted(true);
    setShowReportModal(false);
    setReportSuccessToast("Listing flagged and submitted for campus moderator review.");
    if (onReportListing) {
      onReportListing(listing.id, reportReason, reportDetails);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div
        id={`listing-detail-${listing.id}`}
        className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden my-8"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
              {listing.category}
            </span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-200 text-slate-800">
              {listing.condition}
            </span>
            {listing.status !== "available" && (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${
                  listing.status === "completed"
                    ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                    : "bg-amber-100 text-amber-900 border-amber-300"
                }`}
              >
                {listing.status === "reserved"
                  ? "Reserved"
                  : listing.status === "handover_scheduled"
                  ? "Handover Scheduled"
                  : listing.status === "inactive"
                  ? "Inactive (Expired)"
                  : "Sold / Handover Done"}
              </span>
            )}
            {/* Views counter chip in modal header */}
            <span
              id={`detail-header-views-${listing.id}`}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 border select-none ${
                (listing.views || 0) >= 100
                  ? "bg-amber-50 text-amber-900 border-amber-300 shadow-2xs"
                  : "bg-slate-100 text-slate-700 border-slate-200"
              }`}
              title={`${listing.views || 0} students have viewed this item on campus`}
            >
              {(listing.views || 0) >= 100 ? (
                <Flame className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
              ) : (
                <Eye className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>{(listing.views || 0).toLocaleString()} views</span>
            </span>
            {/* Reported Badge */}
            {isReported && (
              <span
                id={`detail-reported-badge-${listing.id}`}
                className="px-2.5 py-1 rounded-lg text-xs font-extrabold bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1 shadow-2xs animate-pulse"
                title="This listing has been reported for campus moderator review"
              >
                <Flag className="w-3.5 h-3.5 fill-rose-600 text-rose-600" />
                <span>Reported for Review</span>
              </span>
            )}
            {/* Expiry Badge */}
            {listing.expiryDate && (
              <span
                className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1 ${
                  listing.status === "inactive" || expiryInfo.isExpired
                    ? "bg-slate-200 text-slate-700"
                    : expiryInfo.isUrgent
                    ? "bg-amber-100 text-amber-900 border border-amber-300"
                    : "bg-slate-100 text-slate-600"
                }`}
                title={`Valid until ${new Date(listing.expiryDate).toLocaleDateString()}`}
              >
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>{expiryInfo.label}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Report Button */}
            <button
              id={`detail-report-btn-${listing.id}`}
              type="button"
              onClick={() => setShowReportModal(true)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                isReported
                  ? "bg-rose-50 text-rose-700 border-rose-200"
                  : "bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50/60 border-slate-200"
              }`}
              title="Report suspicious listing or inappropriate content"
            >
              <Flag className={`w-4 h-4 ${isReported ? "text-rose-600 fill-rose-600" : "text-slate-400"}`} />
              <span className="hidden sm:inline">{isReported ? "Reported" : "Report"}</span>
            </button>

            <button
              id={`detail-share-btn-${listing.id}`}
              type="button"
              onClick={handleShare}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                isShared
                  ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                  : "bg-white text-slate-700 hover:text-indigo-600 hover:bg-slate-50 border-slate-200"
              }`}
              title="Share listing with classmates"
            >
              {isShared ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Shared</span>
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 text-slate-500" />
                  <span>Share</span>
                </>
              )}
            </button>

            {onToggleWishlist && (
              <button
                id={`detail-wishlist-toggle-${listing.id}`}
                onClick={() => onToggleWishlist(listing.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border shadow-2xs cursor-pointer ${
                  isWishlisted
                    ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100"
                    : "bg-white text-slate-700 hover:text-rose-600 hover:bg-rose-50 border-slate-200"
                }`}
                title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? "fill-rose-500 text-rose-500" : "text-slate-400"
                  }`}
                />
                <span className="hidden sm:inline">
                  {isWishlisted ? "Saved" : "Save"}
                </span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Report Success Toast */}
          {reportSuccessToast && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reportSuccessToast}</span>
              </div>
              <button
                type="button"
                onClick={() => setReportSuccessToast(null)}
                className="text-emerald-700 hover:text-emerald-900 text-xs font-bold cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Reported Notice Banner */}
          {isReported && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Listing Under Campus Moderator Review</strong>
                <span>
                  This item has been flagged by students ({reportReason || listing.reportReason || "Suspicious listing or inaccurate details"}). Campus moderators have been notified to verify student authenticity.
                </span>
              </div>
            </div>
          )}

          {/* Inactive / Expired Notice Banner with Renewal Action */}
          {(listing.status === "inactive" || expiryInfo.isExpired) && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block font-bold">Listing Inactive (Past 30-Day Validity)</strong>
                  <span>
                    This listing was marked inactive after 30 days to keep the campus marketplace clean and fresh.
                  </span>
                </div>
              </div>
              {onRenewListing && (
                <button
                  type="button"
                  id={`renew-listing-btn-${listing.id}`}
                  onClick={() => onRenewListing(listing.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 cursor-pointer"
                >
                  Renew for 30 Days
                </button>
              )}
            </div>
          )}
          {/* Main Grid: Image + Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <div
              className="relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-inner group cursor-pointer"
              onClick={() => onOpenLightbox && onOpenLightbox(listing)}
              title="Click to zoom and inspect item condition in lightbox"
            >
              <img
                src={listing.imageUrl}
                alt={listing.title}
                className="w-full h-72 object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-xs text-white px-3 py-1 rounded-lg text-xs flex items-center gap-1.5 z-10">
                <MapPin className="w-3.5 h-3.5 text-red-400" />
                <span>{listing.locationPreference || "Campus Handover"}</span>
              </div>
              {onOpenLightbox && (
                <button
                  type="button"
                  id={`detail-zoom-btn-${listing.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenLightbox(listing);
                  }}
                  className="absolute bottom-3 right-3 z-10 px-2.5 py-1.5 rounded-xl bg-black/70 hover:bg-black/90 text-white backdrop-blur-md text-xs font-bold flex items-center gap-1.5 border border-white/10 transition-transform hover:scale-105 shadow-md"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Zoom Condition</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900 leading-snug">
                  {listing.title}
                </h1>
                <div className="flex items-baseline gap-2 mt-2">
                  {listing.listingType === "exchange" ? (
                    <span className="text-lg font-bold text-purple-700">
                      Exchange Only
                    </span>
                  ) : (
                    <>
                      <span className="text-2xl font-extrabold text-slate-950">
                        ₹{listing.price}
                      </span>
                      {listing.listingType === "both" && (
                        <span className="text-xs font-semibold text-slate-500">
                          (or Open to Swap)
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Rating & Social Proof Views Pill */}
                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      const el = document.getElementById("detail-reviews-section");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100/90 text-amber-900 border border-amber-200/80 transition-colors text-xs font-bold shadow-2xs cursor-pointer"
                    title="View verified student handover reviews"
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500 shrink-0" />
                    <span>{totalReviewsCount > 0 ? calculatedAverage.toFixed(1) : "New"}</span>
                    <span className="text-[11px] font-medium text-amber-800/80">
                      ({totalReviewsCount} {totalReviewsCount === 1 ? "review" : "reviews"})
                    </span>
                  </button>

                  <span
                    id={`detail-views-social-proof-${listing.id}`}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold border select-none ${
                      (listing.views || 0) >= 100
                        ? "bg-amber-50 text-amber-900 border-amber-300 shadow-2xs"
                        : "bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                    title={`${listing.views || 0} campus students viewed this listing`}
                  >
                    {(listing.views || 0) >= 100 ? (
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500 shrink-0" />
                    ) : (
                      <Eye className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    )}
                    <span>{(listing.views || 0).toLocaleString()} views</span>
                    {(listing.views || 0) >= 100 && (
                      <span className="text-[10px] font-black uppercase text-amber-700 tracking-wider">
                        • Trending
                      </span>
                    )}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(true);
                      setTimeout(() => {
                        const el = document.getElementById("detail-review-form");
                        if (el) el.scrollIntoView({ behavior: "smooth" });
                      }, 50);
                    }}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline flex items-center gap-1 transition-colors"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Leave Feedback</span>
                  </button>
                </div>
              </div>

              {listing.exchangeFor && (
                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-900 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <Repeat className="w-3.5 h-3.5 text-purple-600" />
                    Looking to Exchange For:
                  </div>
                  <p>{listing.exchangeFor}</p>
                </div>
              )}

              {/* Seller info card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 group/seller">
                <div className="flex items-center justify-between">
                  <span
                    id={`detail-verified-student-badge-${listing.id}`}
                    className="badge-shimmer-hover relative inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200/90 overflow-hidden select-none transition-colors group-hover/seller:bg-blue-100 group-hover/seller:border-blue-300"
                    title="Verified University Student Seller • Enrolled Campus Student"
                  >
                    <span className="animate-shimmer-hover" aria-hidden="true" />
                    <BadgeCheck className="w-3 h-3 text-blue-600 shrink-0" />
                    <span>Verified Student Seller</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">Campus Authenticated</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                    {listing.sellerName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-900 flex-wrap">
                      <span>{listing.sellerName}</span>
                      <BadgeCheck className="w-4 h-4 text-blue-600" />
                      <SellerReputationBadge
                        listing={listing}
                        allListings={allListings}
                        variant="badge"
                        onViewReviews={() => {
                          const reviewsTabBtn = document.getElementById("tab-reviews-btn");
                          if (reviewsTabBtn) {
                            reviewsTabBtn.click();
                          }
                        }}
                      />
                    </div>
                    <span className="text-xs text-slate-500 block">
                      {listing.sellerEmail} • {listing.department || "Engineering"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Completed Deal Banner */}
              {listing.status === "completed" && (
                <div
                  id="detail-completed-notice"
                  className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2.5 shadow-xs"
                >
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div>
                    <strong className="font-bold">Deal Completed:</strong> This item has already been sold and handed over between students. You are viewing this record from campus transaction history.
                  </div>
                </div>
              )}

              {/* Offline Warning Notice */}
              {!isOnline && (
                <div
                  id="detail-offline-notice"
                  className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5"
                >
                  <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>
                    <strong>Offline Mode:</strong> Live chat and negotiations are temporarily disabled while disconnected to protect your messages from being lost.
                  </span>
                </div>
              )}

              {/* Primary Call to actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  id="detail-chat-negotiate-btn"
                  disabled={!isOnline}
                  onClick={() => {
                    if (!isOnline) return;
                    onClose();
                    onOpenChat(listing);
                  }}
                  title={
                    !isOnline
                      ? "Chat is disabled while offline to prevent data loss"
                      : "Chat & negotiate with student seller"
                  }
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all select-none ${
                    !isOnline
                      ? "bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed shadow-none"
                      : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-md cursor-pointer"
                  }`}
                >
                  {!isOnline ? (
                    <WifiOff className="w-4 h-4 shrink-0 text-slate-400" />
                  ) : (
                    <MessageCircle className="w-4 h-4 shrink-0" />
                  )}
                  <span>{!isOnline ? "Chat Disabled (Offline)" : "Chat & Negotiate"}</span>
                </button>
                <button
                  onClick={() => {
                    onClose();
                    onOpenCalendar(listing);
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition-all cursor-pointer"
                >
                  <CalendarIcon className="w-4 h-4" />
                  Schedule Handover
                </button>
              </div>

              {/* Ask Seller: Dynamic Category FAQs */}
              {!isSeller && dynamicFaqs.length > 0 && (
                <div
                  id="ask-seller-faq-section"
                  className="mt-3 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100/90 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <div className="p-1 rounded-lg bg-indigo-600 text-white">
                        <HelpCircle className="w-3.5 h-3.5" />
                      </div>
                      <h4 className="text-xs font-bold text-slate-900">
                        Ask Seller ({listing.category} FAQs)
                      </h4>
                    </div>
                    <span className="text-[10px] text-indigo-700 font-medium hidden sm:inline">
                      Click to auto-populate chat
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {dynamicFaqs.map((faq, idx) => (
                      <button
                        key={faq.id || idx}
                        id={`ask-seller-faq-btn-${idx}`}
                        type="button"
                        disabled={!isOnline}
                        onClick={() => {
                          if (!isOnline) return;
                          onClose();
                          onOpenChat(listing, faq.question);
                        }}
                        className={`w-full group text-left px-3 py-2 rounded-xl border text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${
                          !isOnline
                            ? "bg-white/60 border-slate-200 text-slate-400 cursor-not-allowed"
                            : "bg-white hover:bg-indigo-50/80 border-indigo-100 hover:border-indigo-300 text-slate-700 hover:text-indigo-900 shadow-2xs hover:shadow-xs"
                        }`}
                        title={
                          !isOnline
                            ? "Chat is disabled while offline"
                            : `Ask seller: "${faq.question}"`
                        }
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="w-4 h-4 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-medium truncate">{faq.question}</span>
                          {faq.contextHint && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 font-semibold shrink-0 hidden md:inline">
                              {faq.contextHint}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-indigo-600 opacity-80 group-hover:opacity-100 shrink-0 text-[11px] font-semibold">
                          <span className="hidden sm:inline">Ask</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-500" />
              Item Description
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
              {listing.description || "No additional description provided."}
            </p>
          </div>

          {/* Tags & Search Keywords */}
          {listing.tags && listing.tags.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-indigo-600" />
                <span>Search Keywords & Tags</span>
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {listing.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Inspection Details if available */}
          {listing.aiInspection && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50/70 via-purple-50/50 to-white border border-indigo-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-indigo-600 text-white">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Gemini 3.1 Pro Preview Inspection Report
                    </h4>
                    <span className="text-xs text-indigo-700 font-medium">
                      Automated physical condition analysis & fair price estimation
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-600 text-white text-xs font-bold shadow-xs">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Inspection Score: {listing.aiInspection.inspectionScore}/100
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-slate-800 block mb-1">
                    Visual Condition Audit:
                  </span>
                  <p className="bg-white/80 p-3 rounded-xl border border-indigo-100/60 text-slate-700 leading-relaxed">
                    {listing.aiInspection.conditionDetails}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-800 block mb-1">
                    Student Economy Valuation:
                  </span>
                  <div className="bg-white/80 p-3 rounded-xl border border-indigo-100/60 space-y-1.5">
                    <div className="flex items-center justify-between text-indigo-950 font-semibold">
                      <span>Fair Campus Resale Range:</span>
                      <span className="text-emerald-700 font-bold">
                        ₹{listing.aiInspection.suggestedPriceMin} – ₹{listing.aiInspection.suggestedPriceMax}
                      </span>
                    </div>
                    {listing.aiInspection.authenticityCheck && (
                      <p className="text-slate-500 text-[11px] pt-1 border-t border-slate-100">
                        {listing.aiInspection.authenticityCheck}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {listing.aiInspection.keyFeatures && (
                <div>
                  <span className="font-bold text-slate-800 block mb-1 text-xs">
                    Identified Product Specifications:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {listing.aiInspection.keyFeatures.map((feat, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg text-xs bg-white text-slate-700 border border-slate-200 shadow-2xs"
                      >
                        ✓ {feat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {listing.aiInspection.recommendedHandoverTips && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Handover Verification Advice:</span>
                    <span>{listing.aiInspection.recommendedHandoverTips}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Active Handover details if scheduled */}
          {listing.handoverDetails && (
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CalendarIcon className="w-4 h-4 text-blue-600" />
                  Scheduled Campus Handover
                </span>
                {listing.handoverDetails.calendarLink && (
                  <a
                    href={listing.handoverDetails.calendarLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
                  >
                    Google Calendar Event
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
              <div className="text-blue-800 space-y-0.5">
                <div>Date & Time: <strong>{listing.handoverDetails.scheduledDate} at {listing.handoverDetails.scheduledTime}</strong></div>
                <div>Location: <strong>{listing.handoverDetails.location}</strong></div>
              </div>
            </div>
          )}

          {/* Handover Reviews & Feedback Section */}
          <div id="detail-reviews-section" className="pt-3 space-y-4 border-t border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-500 shrink-0" />
                  <span>Student Handover Feedback & Ratings</span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {totalReviewsCount} {totalReviewsCount === 1 ? "Review" : "Reviews"}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified student feedback submitted after physical item inspection and campus handover
                </p>
              </div>

              <button
                type="button"
                id="toggle-review-form-btn"
                onClick={() => {
                  setShowReviewForm((prev) => !prev);
                  setReviewSuccessMessage(null);
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{showReviewForm ? "Close Form" : "Leave Handover Review"}</span>
              </button>
            </div>

            {/* Success toast / message */}
            {reviewSuccessMessage && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{reviewSuccessMessage}</span>
              </div>
            )}

            {/* Rating Summary Overview Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              {/* Big Score */}
              <div className="flex items-center gap-3">
                <div className="text-3xl font-extrabold text-slate-950">
                  {totalReviewsCount > 0 ? calculatedAverage.toFixed(1) : "—"}
                </div>
                <div>
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map((starIdx) => (
                      <Star
                        key={starIdx}
                        className={`w-4 h-4 ${
                          starIdx <= Math.round(calculatedAverage)
                            ? "fill-amber-400 text-amber-500"
                            : "text-slate-300 fill-slate-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-slate-500 block mt-0.5">
                    {totalReviewsCount > 0
                      ? `Based on ${totalReviewsCount} campus ${totalReviewsCount === 1 ? "handover" : "handovers"}`
                      : "No handover reviews yet"}
                  </span>
                </div>
              </div>

              {/* Verified Trust Stats */}
              <div className="text-xs space-y-1 border-t md:border-t-0 md:border-l border-slate-200 pt-2 md:pt-0 md:pl-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Condition Matched:</span>
                  <span className="font-bold text-emerald-700">
                    {totalReviewsCount > 0 ? `${conditionMatchedPercent}%` : "100% Verified"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Student Authenticity:</span>
                  <span className="font-bold text-blue-700">Campus Verified</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 font-medium">Handover Spot:</span>
                  <span className="font-medium text-slate-800 truncate max-w-[130px]">
                    {listing.handoverDetails?.location || listing.locationPreference || "Campus Quad"}
                  </span>
                </div>
              </div>

              {/* Prompt Callout */}
              <div className="bg-white p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Campus Trust Guarantee</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Rating physical condition and punctuality keeps the student exchange safe and reliable.
                </p>
              </div>
            </div>

            {/* Expandable Review Form */}
            {showReviewForm && (
              <form
                id="detail-review-form"
                onSubmit={handleSubmitReview}
                className="p-4 rounded-2xl bg-indigo-50/60 border border-indigo-200 shadow-xs space-y-4"
              >
                <div className="flex items-center justify-between border-b border-indigo-100 pb-2">
                  <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    <MessageSquarePlus className="w-4 h-4 text-indigo-600" />
                    <span>Leave Handover Feedback for {listing.sellerName}</span>
                  </h4>
                  <span className="text-[11px] text-indigo-700 font-medium">
                    Verified Student Form
                  </span>
                </div>

                {/* Interactive Star Selection */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Your Overall Experience & Item Rating:
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const activeStar = (hoverRating || ratingInput) >= star;
                        return (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setRatingInput(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            onMouseLeave={() => setHoverRating(0)}
                            className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
                            title={`Rate ${star} star${star > 1 ? "s" : ""}`}
                          >
                            <Star
                              className={`w-6 h-6 ${
                                activeStar
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-slate-300 fill-slate-100"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100/90 px-2 py-0.5 rounded-md">
                      {getRatingLabel(hoverRating || ratingInput)}
                    </span>
                  </div>
                </div>

                {/* Reviewer Details Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Your Name / Display:
                    </label>
                    <input
                      type="text"
                      required
                      value={reviewerNameInput}
                      onChange={(e) => setReviewerNameInput(e.target.value)}
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Department / Branch:
                    </label>
                    <input
                      type="text"
                      value={departmentInput}
                      onChange={(e) => setDepartmentInput(e.target.value)}
                      placeholder="e.g. Mechanical / CSE"
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Year of Study:
                    </label>
                    <select
                      value={yearInput}
                      onChange={(e) => setYearInput(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                      <option value="M.Tech / Postgrad">M.Tech / Postgrad</option>
                    </select>
                  </div>
                </div>

                {/* Handover Spot & Condition Matched Toggle */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">
                      Campus Handover Location:
                    </label>
                    <div className="relative">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                      <input
                        type="text"
                        value={handoverLocationInput}
                        onChange={(e) => setHandoverLocationInput(e.target.value)}
                        placeholder="e.g. Central Library Quad"
                        className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs"
                      />
                    </div>
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={conditionMatchedInput}
                        onChange={(e) => setConditionMatchedInput(e.target.checked)}
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="text-xs font-semibold text-slate-800">
                        Item condition matched the listing description
                      </span>
                    </label>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="text-xs font-bold text-slate-800 block mb-1">
                    Your Review & Handover Notes:
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={commentInput}
                    onChange={(e) => setCommentInput(e.target.value)}
                    placeholder="Describe the handover experience: Was the item test-functional? Was the seller punctual at the campus spot?"
                    className="w-full p-3 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  />
                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingReview || !commentInput.trim()}
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>{isSubmittingReview ? "Submitting..." : "Submit Review"}</span>
                  </button>
                </div>
              </form>
            )}

            {/* List of Student Reviews */}
            <div className="space-y-3">
              {reviewsList.length > 0 ? (
                reviewsList.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2.5"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {rev.reviewerName.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900">
                              {rev.reviewerName}
                            </span>
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                              <BadgeCheck className="w-2.5 h-2.5 text-blue-600" />
                              <span>Verified Student</span>
                            </span>
                          </div>
                          {(rev.reviewerDepartment || rev.reviewerYear) && (
                            <span className="text-[11px] text-slate-400 block">
                              {[rev.reviewerDepartment, rev.reviewerYear].filter(Boolean).join(" • ")}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="flex items-center text-amber-400">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${
                                s <= rev.rating
                                  ? "fill-amber-400 text-amber-500"
                                  : "text-slate-200 fill-slate-100"
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-xs font-bold text-slate-800">
                          {rev.rating.toFixed(1)}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          • {new Date(rev.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                            })}
                        </span>
                      </div>
                    </div>

                    {/* Metadata Badges: Location + Condition */}
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      {rev.handoverLocation && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span>Handover at {rev.handoverLocation}</span>
                        </span>
                      )}
                      {rev.conditionMatched !== false ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200/60">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Condition as described</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-200/60">
                          <span>Condition discrepancy noted</span>
                        </span>
                      )}
                    </div>

                    {/* Comment text */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/60 p-3 rounded-lg border border-slate-100">
                      "{rev.comment}"
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center space-y-2 bg-slate-50/50">
                  <div className="w-10 h-10 mx-auto rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Star className="w-5 h-5" />
                  </div>
                  <h4 className="text-xs font-bold text-slate-800">
                    No student reviews yet for this listing
                  </h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Have you met with {listing.sellerName} or completed a handover? Share your experience to help fellow students shop with confidence.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(true)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-2xs mt-1 cursor-pointer"
                  >
                    <MessageSquarePlus className="w-3.5 h-3.5" />
                    <span>Be the First to Review</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Seller controls */}
          {isSeller && onUpdateStatus && (
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 space-y-2">
              <span className="text-xs font-bold text-slate-700 block">
                Manage Listing Status (Seller Controls):
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => onUpdateStatus(listing.id, "available")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    listing.status === "available"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Mark Available
                </button>
                <button
                  onClick={() => onUpdateStatus(listing.id, "reserved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    listing.status === "reserved"
                      ? "bg-amber-600 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Mark Reserved
                </button>
                <button
                  onClick={() => onUpdateStatus(listing.id, "completed")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    listing.status === "completed"
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Mark Sold / Completed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Report Listing Modal Dialog */}
        {showReportModal && (
          <div
            id="report-modal-backdrop"
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4"
            onClick={() => setShowReportModal(false)}
          >
            <div
              id="report-modal-dialog"
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                    <Flag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Report Listing
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Campus moderation & trust review
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleReportSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Reason for Report *
                  </label>
                  <select
                    id="report-reason-select"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
                  >
                    <option value="Suspicious pricing or potential scam">
                      Suspicious pricing or potential scam
                    </option>
                    <option value="Inaccurate condition or misleading photos">
                      Inaccurate condition or misleading photos
                    </option>
                    <option value="Prohibited item or university policy violation">
                      Prohibited item or university policy violation
                    </option>
                    <option value="Unresponsive or fraudulent student seller">
                      Unresponsive or fraudulent student seller
                    </option>
                    <option value="Expired item or already sold elsewhere">
                      Expired item or already sold elsewhere
                    </option>
                    <option value="Other safety concern">
                      Other safety concern
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Additional Details / Observations (Optional)
                  </label>
                  <textarea
                    id="report-details-textarea"
                    rows={3}
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Provide details to help student moderators verify this listing..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 placeholder:text-slate-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
                  <span className="font-semibold text-slate-800 block">
                    Campus Trust & Safety Policy:
                  </span>
                  <p>
                    Reports are confidential and reviewed by campus moderators. Flagged items display an advisory badge so fellow students remain informed.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowReportModal(false)}
                    className="px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-report-modal-btn"
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flag className="w-3.5 h-3.5 fill-white" />
                    <span>Submit Report</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
