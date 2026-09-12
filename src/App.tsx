import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Filter,
  PlusCircle,
  Calendar as CalendarIcon,
  BookOpen,
  ArrowUpDown,
  Tag,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Search,
  Building2,
  Package,
  Clock,
  Layers,
  Heart,
  Bell,
  Calculator,
  Bike,
  Briefcase,
  FlaskConical,
  GraduationCap,
} from "lucide-react";
import { User } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDocs,
} from "firebase/firestore";

import {
  Listing,
  ItemCategory,
  ItemCondition,
  ListingType,
  AIInspectionResult,
  AlertSubscription,
  AlertMatchEvent,
  Review,
} from "./types";
import { INITIAL_SEED_LISTINGS } from "./data/seedListings";
import { db, initAuth, googleSignIn, demoStudentSignIn, logout } from "./lib/firebase";
import { GoogleCalendarEventResponse } from "./lib/calendar";

import { Navbar } from "./components/Navbar";
import { ListingCard } from "./components/ListingCard";
import { ListingDetailModal } from "./components/ListingDetailModal";
import { ListingImageLightboxModal } from "./components/ListingImageLightboxModal";
import { AIItemInspectorModal } from "./components/AIItemInspectorModal";
import { CreateListingModal } from "./components/CreateListingModal";
import { CalendarHandoverModal } from "./components/CalendarHandoverModal";
import { ChatDrawer } from "./components/ChatDrawer";
import { UpcomingHandoversModal } from "./components/UpcomingHandoversModal";
import { PBLProjectInfoModal } from "./components/PBLProjectInfoModal";
import { WishlistModal } from "./components/WishlistModal";
import { TopperNotesModal } from "./components/TopperNotesModal";
import { TopperNote } from "./types";
import {
  getStoredTopperNotes,
  saveStoredTopperNotes,
  isAppOwner,
} from "./utils/topperNotesStorage";
import { CollegeLoginPage } from "./components/CollegeLoginPage";
import {
  ALLOWED_COLLEGE_DOMAIN,
  isValidCollegeEmail,
  COLLEGE_RESTRICTION_MESSAGE,
} from "./utils/collegeAuth";
import { AlertsModal } from "./components/AlertsModal";
import { AlertToastNotification } from "./components/AlertToastNotification";
import { OfflineBanner } from "./components/OfflineBanner";
import { useOnlineStatus } from "./hooks/useOnlineStatus";
import {
  getSavedAlerts,
  saveAlerts,
  getAlertHistory,
  saveAlertHistory,
  checkListingMatchesAlert,
  playAlertNotificationSound,
} from "./utils/alertMatcher";
import {
  calculateNewExpiryDate,
  checkAndMarkInactiveListings,
} from "./utils/expiryUtils";
import { useTheme } from "./context/ThemeContext";
import { EngineeringBentoHero } from "./components/EngineeringBentoHero";

const CATEGORIES: (ItemCategory | "All")[] = [
  "All",
  "Books",
  "Calculators",
  "Lab Equipment",
  "Cycles",
  "Bags",
  "Other",
];

const getCategoryIcon = (category: ItemCategory | "All") => {
  switch (category) {
    case "All":
      return Layers;
    case "Books":
      return BookOpen;
    case "Calculators":
      return Calculator;
    case "Lab Equipment":
      return FlaskConical;
    case "Cycles":
      return Bike;
    case "Bags":
      return Briefcase;
    case "Other":
      return Package;
    default:
      return Tag;
  }
};

export default function App() {
  const { theme, isDark, toggleTheme } = useTheme();

  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Listings state
  const [listings, setListings] = useState<Listing[]>(INITIAL_SEED_LISTINGS);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "All">("All");
  const [selectedType, setSelectedType] = useState<ListingType | "all">("all");
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | "all">("all");
  const [sortBy, setSortBy] = useState<"newest" | "price_asc" | "price_desc" | "ai_score">("newest");

  // Modals state
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [lightboxListing, setLightboxListing] = useState<Listing | null>(null);

  // Wishlist state & persistence
  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("campus_marketplace_wishlist");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isWishlistModalOpen, setIsWishlistModalOpen] = useState(false);
  const [wishlistOnlyFilter, setWishlistOnlyFilter] = useState(false);

  const [isAIInspectorOpen, setIsAIInspectorOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [prefilledInspection, setPrefilledInspection] = useState<AIInspectionResult | null>(null);
  const [prefilledImage, setPrefilledImage] = useState<string | null>(null);

  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [calendarTargetListing, setCalendarTargetListing] = useState<Listing | null>(null);
  const [calendarOtherParty, setCalendarOtherParty] = useState({
    name: "",
    email: "",
  });

  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatListing, setChatListing] = useState<Listing | null>(null);
  const [chatInitialMessage, setChatInitialMessage] = useState<string>("");

  const [isHandoversModalOpen, setIsHandoversModalOpen] = useState(false);
  const [isPBLModalOpen, setIsPBLModalOpen] = useState(false);
  const [isTopperNotesModalOpen, setIsTopperNotesModalOpen] = useState(false);
  const [topperNotes, setTopperNotes] = useState<TopperNote[]>(() => getStoredTopperNotes());

  // Alerts & 'Notify Me' feature state
  const [alerts, setAlerts] = useState<AlertSubscription[]>(() => getSavedAlerts());
  const [alertHistory, setAlertHistory] = useState<AlertMatchEvent[]>(() => getAlertHistory());
  const [isAlertsModalOpen, setIsAlertsModalOpen] = useState(false);
  const [prefilledAlertKeyword, setPrefilledAlertKeyword] = useState<string>("");
  const [prefilledAlertCategory, setPrefilledAlertCategory] = useState<ItemCategory | "All">("All");
  const [currentAlertToast, setCurrentAlertToast] = useState<AlertMatchEvent | null>(null);
  const knownListingIdsRef = React.useRef<Set<string>>(new Set());
  const isInitialSnapshotRef = React.useRef<boolean>(true);

  // Network Connectivity State (window.navigator.onLine)
  const { isOnline, isSimulatedOffline, toggleSimulateOffline, reconnect } =
    useOnlineStatus();

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Initialize Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user) => {
        // Enforce @pvgcoet.ac.in college domain on re-hydration
        if (user && user.email) {
          if (!isValidCollegeEmail(user.email)) {
            console.warn("Unauthorized domain detected during session re-hydration:", user.email);
            await logout();
            setCurrentUser(null);
            setAuthErrorMessage(
              `Access Denied: The account (${user.email}) does not end with @${ALLOWED_COLLEGE_DOMAIN}. Anyone with an official college email ending with @${ALLOWED_COLLEGE_DOMAIN} can sign in.`
            );
          } else {
            setCurrentUser(user);
            setAuthErrorMessage(null);
          }
        } else {
          setCurrentUser(null);
        }
        setIsAuthLoading(false);
      },
      () => {
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Fetch and Sync Listings from Firestore with seed fallback
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const syncListings = async () => {
      try {
        const listingsCol = collection(db, "listings");

        // Check if initial seeding is needed
        const snapshot = await getDocs(listingsCol);
        if (snapshot.empty) {
          // Seed the initial representative items
          for (const item of INITIAL_SEED_LISTINGS) {
            const docRef = doc(listingsCol, item.id);
            await setDoc(docRef, item);
          }
        }

        // Live real-time sync with onSnapshot
        unsubscribe = onSnapshot(
          listingsCol,
          (querySnapshot) => {
            const fetched: Listing[] = [];
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data() as any;
              const seedMatch = INITIAL_SEED_LISTINGS.find((s) => s.id === docSnap.id);
              fetched.push({
                id: docSnap.id,
                ...data,
                reviews: data.reviews && data.reviews.length > 0 ? data.reviews : seedMatch?.reviews || [],
                averageRating: data.averageRating ?? seedMatch?.averageRating,
                totalReviews: data.totalReviews ?? (data.reviews ? data.reviews.length : seedMatch?.totalReviews || 0),
              });
            });
            if (fetched.length > 0) {
              setListings(checkAndMarkInactiveListings(fetched).updatedListings);
            } else {
              setListings(checkAndMarkInactiveListings(INITIAL_SEED_LISTINGS).updatedListings);
            }
            setIsLoadingListings(false);

            // Real-time alert check for newly added documents
            if (isInitialSnapshotRef.current) {
              fetched.forEach((item) => knownListingIdsRef.current.add(item.id));
              INITIAL_SEED_LISTINGS.forEach((item) => knownListingIdsRef.current.add(item.id));
              isInitialSnapshotRef.current = false;
            } else {
              fetched.forEach((item) => {
                if (!knownListingIdsRef.current.has(item.id)) {
                  knownListingIdsRef.current.add(item.id);
                  processNewListingForAlerts(item);
                }
              });
            }
          },
          (err) => {
            console.warn("Firestore snapshot error, using initial listings:", err);
            setListings(INITIAL_SEED_LISTINGS);
            setIsLoadingListings(false);
          }
        );
      } catch (err) {
        console.warn("Could not connect to Firestore, using offline seed:", err);
        setListings(INITIAL_SEED_LISTINGS);
        setIsLoadingListings(false);
      }
    };

    syncListings();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Wishlist Handlers & Logic
  const handleToggleWishlist = (listingId: string) => {
    setWishlistIds((prev) => {
      const exists = prev.includes(listingId);
      let updated: string[];
      if (exists) {
        updated = prev.filter((id) => id !== listingId);
        showToast("Item removed from your Wishlist.");
      } else {
        updated = [...prev, listingId];
        showToast("❤️ Saved to your personal Wishlist collection!");
      }
      try {
        localStorage.setItem("campus_marketplace_wishlist", JSON.stringify(updated));
      } catch (err) {
        console.warn("Could not save wishlist to localStorage:", err);
      }
      return updated;
    });
  };

  const handleClearWishlist = () => {
    setWishlistIds([]);
    try {
      localStorage.removeItem("campus_marketplace_wishlist");
    } catch {}
    showToast("Your Wishlist has been cleared.");
  };

  const savedWishlistListings = useMemo(() => {
    return listings.filter((item) => wishlistIds.includes(item.id));
  }, [listings, wishlistIds]);

  // Handle shared listing URL parameter (e.g. ?item=...) or ?notes=...
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("notes")) {
        setIsTopperNotesModalOpen(true);
      }
      if (listings.length === 0) return;
      const itemId = params.get("item");
      if (itemId) {
        const found = listings.find((l) => l.id === itemId);
        if (found) {
          setSelectedListing(found);
          setIsDetailModalOpen(true);
        }
      }
    } catch (err) {
      console.warn("Could not read shared URL params:", err);
    }
  }, [listings]);

  // Filter & Sort Logic
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Wishlist only filter
        if (wishlistOnlyFilter && !wishlistIds.includes(item.id)) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchSeller = item.sellerName.toLowerCase().includes(q);
          const matchTags = item.tags?.some((tag) => tag.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCat && !matchSeller && !matchTags) return false;
        }

        // Category filter
        if (selectedCategory !== "All" && item.category !== selectedCategory) {
          return false;
        }

        // Type filter
        if (selectedType !== "all") {
          if (selectedType === "sell" && item.listingType === "exchange") return false;
          if (selectedType === "exchange" && item.listingType === "sell") return false;
        }

        // Condition filter
        if (selectedCondition !== "all" && item.condition !== selectedCondition) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "ai_score") {
          const scoreA = a.aiInspection?.inspectionScore || 0;
          const scoreB = b.aiInspection?.inspectionScore || 0;
          return scoreB - scoreA;
        }
        // default newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [listings, searchQuery, selectedCategory, selectedType, selectedCondition, sortBy, wishlistOnlyFilter, wishlistIds]);

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { All: listings.length };
    listings.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [listings]);

  // Auth Handlers
  const handleLogin = async () => {
    setAuthErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        const userEmail = res.user.email;
        if (!isValidCollegeEmail(userEmail)) {
          // Immediately reject and log out
          await logout();
          setCurrentUser(null);
          setAuthErrorMessage(
            `Access Denied: The Google account (${userEmail || "unknown"}) does not end with @${ALLOWED_COLLEGE_DOMAIN}. Anyone with an email ending with @${ALLOWED_COLLEGE_DOMAIN} can sign in.`
          );
          return;
        }

        setCurrentUser(res.user);
        setAuthErrorMessage(null);
        showToast(`Welcome, ${res.user.displayName || "Student"}! College account verified (@${ALLOWED_COLLEGE_DOMAIN}).`);
      } else {
        showToast("Google sign-in popup was closed. Please try again or use direct college ID verification.");
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        console.warn("Login notice:", err?.message || err);
        setAuthErrorMessage(err?.message || "Google Sign-In could not complete. Please use Direct College ID verification.");
      }
    }
  };

  const handleDemoCollegeLogin = async (
    customEmail: string = "ayush.gadigone@pvgcoet.ac.in",
    displayName?: string
  ) => {
    setAuthErrorMessage(null);
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!isValidCollegeEmail(cleanEmail)) {
      setAuthErrorMessage(
        `Invalid Email Domain: Only accounts ending with @${ALLOWED_COLLEGE_DOMAIN} can sign in.`
      );
      return;
    }

    try {
      const res = await demoStudentSignIn(cleanEmail, displayName);
      if (res?.user) {
        setCurrentUser(res.user);
        setAuthErrorMessage(null);
        showToast(`Welcome, ${res.user.displayName || "Student"}! College account verified.`);
      }
    } catch (err: any) {
      console.warn("College login notice:", err);
      setAuthErrorMessage(err?.message || "Failed to log in with college account.");
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setAuthErrorMessage(null);
    showToast("Signed out successfully.");
  };

  // Handover Calendar Schedule Handlers
  const handleOpenCalendar = (listing: Listing) => {
    if (!currentUser) {
      // Trigger login first
      handleLogin();
      return;
    }
    setCalendarTargetListing(listing);
    const isSeller = currentUser.uid === listing.sellerId;
    setCalendarOtherParty({
      name: isSeller ? "Student Buyer" : listing.sellerName,
      email: isSeller ? "buyer@college.edu.in" : listing.sellerEmail,
    });
    setIsCalendarModalOpen(true);
  };

  const handleCalendarEventCreated = async (
    event: GoogleCalendarEventResponse,
    location: string,
    date: string,
    time: string
  ) => {
    if (!calendarTargetListing) return;

    const handoverDetails = {
      scheduledDate: date,
      scheduledTime: time,
      location,
      calendarEventId: event.id,
      calendarLink: event.htmlLink,
    };

    // Update in local state
    setListings((prev) =>
      prev.map((item) =>
        item.id === calendarTargetListing.id
          ? { ...item, status: "handover_scheduled", handoverDetails }
          : item
      )
    );

    // Update in Firestore
    try {
      const docRef = doc(db, "listings", calendarTargetListing.id);
      await updateDoc(docRef, {
        status: "handover_scheduled",
        handoverDetails,
      });
    } catch (e) {
      console.warn("Updated locally, firestore sync failed:", e);
    }

    showToast("🤝 Handover event scheduled and synced to your Google Calendar!");
  };

  // Handover Feedback & Rating Handler
  const handleAddReview = async (
    listingId: string,
    newReviewData: Omit<Review, "id" | "createdAt">
  ) => {
    const reviewId = `rev_${Date.now()}`;
    const newReview: Review = {
      ...newReviewData,
      id: reviewId,
      createdAt: new Date().toISOString(),
    };

    setListings((prevListings) =>
      prevListings.map((listing) => {
        if (listing.id !== listingId) return listing;

        const currentReviews = listing.reviews || [];
        const updatedReviews = [newReview, ...currentReviews];
        const totalReviews = updatedReviews.length;
        const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
        const averageRating = Math.round((sum / totalReviews) * 10) / 10;

        const updatedListing: Listing = {
          ...listing,
          reviews: updatedReviews,
          totalReviews,
          averageRating,
        };

        if (selectedListing?.id === listingId) {
          setSelectedListing(updatedListing);
        }

        try {
          updateDoc(doc(db, "listings", listingId), {
            reviews: updatedReviews,
            totalReviews,
            averageRating,
          }).catch((err) => {
            console.warn("Could not sync review to Firestore:", err);
          });
        } catch (e) {
          // offline fallback
        }

        return updatedListing;
      })
    );

    showToast("⭐ Handover review recorded! Thank you for rating this student transaction.");
  };

  // AI Inspection to Listing Auto-Fill
  const handleApplyAIToListing = (inspection: AIInspectionResult, imageSrc: string) => {
    setPrefilledInspection(inspection);
    setPrefilledImage(imageSrc);
    setIsCreateModalOpen(true);
    showToast("✨ Applied Gemini 3.1 Pro analysis to listing form!");
  };

  // Alerts Matching & Management Logic
  const handleUpdateAlerts = (newAlerts: AlertSubscription[]) => {
    setAlerts(newAlerts);
    saveAlerts(newAlerts);
    showToast("🔔 'Notify Me' alert preferences updated!");
  };

  const handleClearAlertHistory = () => {
    setAlertHistory([]);
    saveAlertHistory([]);
    showToast("Alerts match history cleared.");
  };

  const processNewListingForAlerts = (
    newListing: Listing,
    specificAlert?: AlertSubscription
  ) => {
    const candidateAlerts = specificAlert
      ? [specificAlert]
      : alerts.filter((a) => a.active);

    const matchedAlert = candidateAlerts.find((alert) =>
      checkListingMatchesAlert(newListing, alert)
    );

    if (matchedAlert) {
      const matchEvent: AlertMatchEvent = {
        id: `match-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        alertId: matchedAlert.id,
        alertKeyword:
          matchedAlert.keyword ||
          (matchedAlert.category !== "All" ? matchedAlert.category || "Any Item" : "Any Item"),
        alertCategory: matchedAlert.category,
        listing: newListing,
        timestamp: Date.now(),
      };

      // Update match count in alerts state & persistence
      setAlerts((prevAlerts) => {
        const updated = prevAlerts.map((a) =>
          a.id === matchedAlert.id
            ? {
                ...a,
                matchCount: (a.matchCount || 0) + 1,
                lastTriggeredAt: new Date().toISOString(),
              }
            : a
        );
        saveAlerts(updated);
        return updated;
      });

      // Append to alert history
      setAlertHistory((prevHistory) => {
        const updated = [matchEvent, ...prevHistory];
        saveAlertHistory(updated);
        return updated;
      });

      // Non-intrusive Web Audio notification chime
      playAlertNotificationSound();

      // Trigger prominent on-screen toast notification
      setCurrentAlertToast(matchEvent);
    }
  };

  const handleSimulateListing = (alert: AlertSubscription) => {
    const kw =
      alert.keyword?.trim() ||
      (alert.category !== "All" ? alert.category : "Casio Scientific Calculator");

    const categoryForSimulation: ItemCategory =
      alert.category && alert.category !== "All"
        ? alert.category
        : kw.toLowerCase().includes("calc")
        ? "Calculators"
        : kw.toLowerCase().includes("book") ||
          kw.toLowerCase().includes("math") ||
          kw.toLowerCase().includes("grewal")
        ? "Books"
        : kw.toLowerCase().includes("draft") ||
          kw.toLowerCase().includes("caliper") ||
          kw.toLowerCase().includes("lab")
        ? "Lab Equipment"
        : kw.toLowerCase().includes("cycle") || kw.toLowerCase().includes("bike")
        ? "Cycles"
        : kw.toLowerCase().includes("bag")
        ? "Bags"
        : "Other";

    const priceForSimulation = alert.maxPrice ? Math.min(alert.maxPrice, 480) : 420;

    const sampleImages: Record<ItemCategory, string> = {
      Calculators:
        "https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?auto=format&fit=crop&w=600&q=80",
      Books:
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80",
      "Lab Equipment":
        "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80",
      Cycles:
        "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=600&q=80",
      Bags:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80",
      Other:
        "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&w=600&q=80",
    };

    const simulatedItem: Listing = {
      id: `item-sim-${Date.now()}`,
      title: kw.toLowerCase().includes("casio")
        ? "Casio FX-991ES Plus Scientific Calculator (Exam Approved)"
        : `${kw} (Verified Student Listing)`,
      description: `Authentic student equipment matching alert "${kw}". Fully verified condition, tested for semester examinations and campus labs.`,
      category: categoryForSimulation,
      condition: "Like New",
      listingType: "sell",
      price: priceForSimulation,
      imageUrl: sampleImages[categoryForSimulation] || sampleImages["Other"],
      sellerId: "student-seller-sim",
      sellerName: "Aryan Sharma (Mech 3rd Yr)",
      sellerEmail: "aryan.sharma@college.edu.in",
      department: "Mechanical Engineering",
      year: "3rd Year",
      status: "available",
      locationPreference: "Central Library Lawn",
      tags: [kw.toLowerCase(), "verified student", "exam ready"],
      createdAt: new Date().toISOString(),
    };

    // Add to current listings
    setListings((prev) => [simulatedItem, ...prev]);
    knownListingIdsRef.current.add(simulatedItem.id);

    // Process alert matching & trigger on-screen toast
    processNewListingForAlerts(simulatedItem, alert);
  };

  const handleListingCreated = (newListing: Listing) => {
    setListings((prev) => [newListing, ...prev]);
    knownListingIdsRef.current.add(newListing.id);
    showToast(`✅ "${newListing.title}" posted to Campus Marketplace!`);
    processNewListingForAlerts(newListing);
  };

  const handleUpdateStatus = async (listingId: string, newStatus: Listing["status"]) => {
    setListings((prev) =>
      prev.map((item) => (item.id === listingId ? { ...item, status: newStatus } : item))
    );
    try {
      const docRef = doc(db, "listings", listingId);
      await updateDoc(docRef, { status: newStatus });
    } catch (e) {
      console.warn("Status updated locally:", e);
    }
    showToast(`Listing status updated to ${newStatus}.`);
  };

  const handleReportListing = async (
    listingId: string,
    reason: string,
    details: string
  ) => {
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId
          ? {
              ...item,
              isReported: true,
              reportReason: reason,
              reportDetails: details,
            }
          : item
      )
    );
    if (selectedListing && selectedListing.id === listingId) {
      setSelectedListing((prev) =>
        prev
          ? {
              ...prev,
              isReported: true,
              reportReason: reason,
              reportDetails: details,
            }
          : null
      );
    }
    try {
      const docRef = doc(db, "listings", listingId);
      await updateDoc(docRef, {
        isReported: true,
        reportReason: reason,
        reportDetails: details,
      });
    } catch (e) {
      console.warn("Report updated locally:", e);
    }
    showToast("⚠️ Listing reported to campus moderators for review.");
  };

  const handleRenewListing = async (listingId: string) => {
    const renewedExpiry = calculateNewExpiryDate(30);
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId
          ? {
              ...item,
              status: "available",
              expiryDate: renewedExpiry,
            }
          : item
      )
    );
    if (selectedListing && selectedListing.id === listingId) {
      setSelectedListing((prev) =>
        prev
          ? {
              ...prev,
              status: "available",
              expiryDate: renewedExpiry,
            }
          : null
      );
    }
    try {
      const docRef = doc(db, "listings", listingId);
      await updateDoc(docRef, {
        status: "available",
        expiryDate: renewedExpiry,
      });
    } catch (e) {
      console.warn("Renewal updated locally:", e);
    }
    showToast("🎉 Listing renewed! Active for another 30 days.");
  };

  const upcomingHandoversCount = listings.filter((l) => l.handoverDetails).length;
  const availableListingsCount = listings.filter((l) => l.status === "available").length;

  // Global Terminal Keyboard Shortcuts (Style 1 ergonomics)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        const searchInput = document.getElementById(
          "main-navbar-search-input"
        ) as HTMLInputElement | null;
        searchInput?.focus();
      } else if ((e.key === "n" || e.key === "N") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (isOnline) {
          setPrefilledInspection(null);
          setPrefilledImage(null);
          setIsCreateModalOpen(true);
        } else {
          showToast("⚠️ Offline: Creating listings is disabled.");
        }
      } else if ((e.key === "t" || e.key === "T") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsTopperNotesModalOpen(true);
      } else if ((e.key === "w" || e.key === "W") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsWishlistModalOpen(true);
      } else if ((e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleTheme();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOnline, toggleTheme]);

  // 1. Initial Authentication Check / Loading
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-100 p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
            Verifying College Identity...
          </p>
        </div>
      </div>
    );
  }

  // 2. First-View Enforced Gate: If not logged in with verified college email, show CollegeLoginPage
  if (!currentUser || !isValidCollegeEmail(currentUser.email)) {
    return (
      <>
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-800 flex items-center gap-2 max-w-md">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}
        <CollegeLoginPage
          onGoogleSignIn={handleLogin}
          onDemoCollegeSignIn={handleDemoCollegeLogin}
          authErrorMessage={authErrorMessage}
          onClearError={() => setAuthErrorMessage(null)}
        />
      </>
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased relative overflow-hidden transition-colors duration-200 ${
        isDark
          ? "bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white"
          : "bg-slate-50 text-slate-900 selection:bg-indigo-100 selection:text-indigo-900"
      }`}
    >
      {/* Ambient background glows matching CollegeLoginPage */}
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 ${
          isDark ? "bg-indigo-600/20" : "bg-indigo-300/30"
        }`}
      />
      <div
        className={`absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 ${
          isDark ? "bg-amber-500/10" : "bg-amber-300/20"
        }`}
      />
      <div
        className={`absolute bottom-1/3 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 ${
          isDark ? "bg-blue-600/15" : "bg-blue-300/20"
        }`}
      />
      <div
        className={`absolute -bottom-40 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 ${
          isDark ? "bg-indigo-500/15" : "bg-indigo-300/25"
        }`}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-slate-800/95 text-white text-xs font-semibold shadow-2xl border border-slate-700/80 backdrop-blur-xl flex items-center gap-2 max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onLogin={handleLogin}
        onDemoLogin={() => handleDemoCollegeLogin()}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => {
          if (!isOnline) {
            showToast("⚠️ Offline: Creating listings is disabled while disconnected to prevent data loss.");
            return;
          }
          setPrefilledInspection(null);
          setPrefilledImage(null);
          setIsCreateModalOpen(true);
        }}
        onOpenAIInspector={() => {
          if (!isOnline) {
            showToast("⚠️ Offline: AI item scanner requires an active internet connection.");
            return;
          }
          setIsAIInspectorOpen(true);
        }}
        onOpenHandovers={() => setIsHandoversModalOpen(true)}
        onOpenPBLInfo={() => setIsPBLModalOpen(true)}
        onOpenTopperNotes={() => setIsTopperNotesModalOpen(true)}
        upcomingHandoversCount={upcomingHandoversCount}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
        alertsCount={alerts.filter((a) => a.active).length}
        onOpenAlerts={() => {
          setPrefilledAlertKeyword("");
          setPrefilledAlertCategory("All");
          setIsAlertsModalOpen(true);
        }}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulateOffline={toggleSimulateOffline}
        onShowToast={showToast}
      />

      {/* Offline Status Banner */}
      <OfflineBanner
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulateOffline={toggleSimulateOffline}
        onRetry={reconnect}
      />

      {/* Engineering Bento Terminal Hero (Style 1) */}
      <EngineeringBentoHero
        totalListingsCount={listings.length}
        availableCount={availableListingsCount}
        topperNotesCount={topperNotes.length}
        upcomingHandoversCount={upcomingHandoversCount}
        isOnline={isOnline}
        onOpenCreateListing={() => {
          if (!isOnline) {
            showToast("⚠️ Offline: Creating listings is disabled while disconnected to prevent data loss.");
            return;
          }
          setPrefilledInspection(null);
          setPrefilledImage(null);
          setIsCreateModalOpen(true);
        }}
        onOpenAIInspector={() => {
          if (!isOnline) {
            showToast("⚠️ Offline: AI item scanner requires an active internet connection.");
            return;
          }
          setIsAIInspectorOpen(true);
        }}
        onOpenTopperNotes={() => setIsTopperNotesModalOpen(true)}
        onOpenPBLInfo={() => setIsPBLModalOpen(true)}
        onOpenAlerts={() => {
          setPrefilledAlertKeyword("");
          setPrefilledAlertCategory("All");
          setIsAlertsModalOpen(true);
        }}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        selectedCategory={selectedCategory}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Category Filter Pills */}
        <div
          role="tablist"
          aria-label="Filter listings by category"
          className="relative flex items-center gap-2.5 overflow-x-auto py-1.5 px-0.5 no-scrollbar scroll-smooth"
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            const Icon = getCategoryIcon(cat);
            const count = categoryCounts[cat] ?? 0;

            return (
              <motion.button
                key={cat}
                id={`category-pill-${cat.toLowerCase().replace(/\s+/g, "-")}`}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(cat)}
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                transition={{ type: "spring", stiffness: 450, damping: 28 }}
                className={`relative px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer select-none transition-[color,background-color,border-color,box-shadow] duration-200 ${
                  isSelected
                    ? "text-white shadow-lg shadow-indigo-600/30"
                    : isDark
                    ? "text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/50 shadow-xs"
                    : "text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 hover:border-indigo-400 shadow-xs"
                }`}
              >
                {/* Active Sliding Pill Background */}
                {isSelected && (
                  <motion.div
                    layoutId="activeCategoryPillHighlight"
                    className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 shadow-sm -z-10"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 32,
                    }}
                  />
                )}

                {/* Animated Category Icon */}
                <motion.span
                  animate={
                    isSelected
                      ? { scale: [1, 1.2, 1], rotate: [0, -6, 6, 0] }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative z-10 flex items-center justify-center shrink-0"
                >
                  <Icon
                    className={`w-3.5 h-3.5 transition-colors ${
                      isSelected ? "text-white" : isDark ? "text-slate-400 group-hover:text-indigo-400" : "text-slate-500 group-hover:text-indigo-600"
                    }`}
                  />
                </motion.span>

                {/* Category Label */}
                <span className="relative z-10">{cat}</span>

                {/* Item Counter Badge with Smooth Active State Transition */}
                <motion.span
                  animate={{
                    backgroundColor: isSelected
                      ? "rgba(255, 255, 255, 0.22)"
                      : isDark
                      ? "rgba(51, 65, 85, 0.8)"
                      : "rgba(226, 232, 240, 0.9)",
                    color: isSelected ? "#ffffff" : isDark ? "#94a3b8" : "#475569",
                  }}
                  transition={{ duration: 0.2 }}
                  className="relative z-10 ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-tight"
                >
                  {count}
                </motion.span>
              </motion.button>
            );
          })}
        </div>

        {/* Secondary Filter & Sorting Controls */}
        <div
          className={`p-4 rounded-2xl border shadow-md backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 text-xs ${
            isDark
              ? "bg-slate-800/90 border-slate-700/80 text-slate-200"
              : "bg-white border-slate-200 text-slate-800 shadow-slate-200/60"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3">
            {/* Listing Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className={`px-2.5 py-1.5 rounded-lg border font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark ? "border-slate-700 bg-slate-900/80 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                <option value="all">All Types (Sell & Swap)</option>
                <option value="sell">For Sale (₹ Cash)</option>
                <option value="exchange">For Exchange Only</option>
              </select>
            </div>

            {/* Condition Filter */}
            <div className="flex items-center gap-1.5">
              <span className={`font-bold ${isDark ? "text-slate-400" : "text-slate-500"}`}>Condition:</span>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value as any)}
                className={`px-2.5 py-1.5 rounded-lg border font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                  isDark ? "border-slate-700 bg-slate-900/80 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"
                }`}
              >
                <option value="all">All Conditions</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
              </select>
            </div>

            {/* Wishlist Quick Toggle */}
            <button
              id="filter-wishlist-toggle"
              onClick={() => setWishlistOnlyFilter(!wishlistOnlyFilter)}
              title="Show only items saved to your Wishlist"
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                wishlistOnlyFilter
                  ? "bg-rose-600 text-white shadow-xs border-rose-500"
                  : "bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border-rose-500/30"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlistOnlyFilter
                    ? "fill-white text-white"
                    : "fill-rose-400 text-rose-400"
                }`}
              />
              <span>Wishlist ({wishlistIds.length})</span>
            </button>

            {/* Notify Me / Alerts Filter Shortcut */}
            <button
              id="filter-notify-me-btn"
              onClick={() => {
                setPrefilledAlertKeyword(searchQuery);
                setPrefilledAlertCategory(selectedCategory);
                setIsAlertsModalOpen(true);
              }}
              title="Set an alert to notify you when items matching this criteria are posted"
              className="px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 dark:text-amber-300 border border-amber-500/30 shadow-xs cursor-pointer"
            >
              <Bell className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
              <span>
                Notify Me
                {searchQuery
                  ? ` for "${searchQuery}"`
                  : selectedCategory !== "All"
                  ? ` for ${selectedCategory}`
                  : ""}
              </span>
            </button>

            {/* Clear filters shortcut */}
            {(selectedCategory !== "All" ||
              selectedType !== "all" ||
              selectedCondition !== "all" ||
              wishlistOnlyFilter ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedType("all");
                  setSelectedCondition("all");
                  setWishlistOnlyFilter(false);
                  setSearchQuery("");
                }}
                className="text-indigo-500 dark:text-indigo-400 hover:underline font-bold ml-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className={`font-bold flex items-center gap-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
              <ArrowUpDown className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className={`px-2.5 py-1.5 rounded-lg border font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500 ${
                isDark ? "border-slate-700 bg-slate-900/80 text-slate-200" : "border-slate-200 bg-slate-50 text-slate-800"
              }`}
            >
              <option value="newest">Recently Listed</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="ai_score">AI Inspection Score</option>
            </select>
          </div>
        </div>

        {/* Listings Header & Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
              {selectedCategory === "All" ? "Campus Marketplace Items" : `${selectedCategory} Listings`}
            </h2>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                isDark
                  ? "bg-slate-800 border-slate-700 text-indigo-300"
                  : "bg-indigo-50 border-indigo-200 text-indigo-700"
              }`}
            >
              {filteredListings.length}
            </span>
          </div>

          <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
            Click on any item to view AI condition breakdown or negotiate
          </span>
        </div>

        {/* Listings Grid */}
        {isLoadingListings ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-400">
              Loading verified campus listings...
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {filteredListings.length > 0 ? (
              <motion.div
                key="listings-grid"
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
              >
                <AnimatePresence mode="popLayout">
                  {filteredListings.map((listing) => (
                    <motion.div
                      key={listing.id}
                      layout
                      initial={{ opacity: 0, scale: 0.94, y: 12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -8 }}
                      transition={{
                        opacity: { duration: 0.22 },
                        scale: { duration: 0.22 },
                        y: { duration: 0.22 },
                        layout: {
                          type: "spring",
                          stiffness: 380,
                          damping: 32,
                        },
                      }}
                      className="h-full flex flex-col"
                    >
                      <ListingCard
                        listing={listing}
                        allListings={listings}
                        isWishlisted={wishlistIds.includes(listing.id)}
                        onToggleWishlist={handleToggleWishlist}
                        onOpenDetails={(item) => {
                          setSelectedListing(item);
                          setIsDetailModalOpen(true);
                        }}
                        onOpenLightbox={(item) => {
                          setLightboxListing(item);
                        }}
                        onOpenChat={(item) => {
                          if (!isOnline) {
                            showToast("⚠️ Chat is disabled while offline to prevent data loss.");
                            return;
                          }
                          setChatListing(item);
                          setIsChatOpen(true);
                        }}
                        onOpenCalendar={handleOpenCalendar}
                        onShowToast={showToast}
                        isOnline={isOnline}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                initial={{ opacity: 0, scale: 0.96, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.25 }}
                className={`text-center py-16 p-8 rounded-2xl border shadow-xl backdrop-blur-xl space-y-4 ${
                  isDark ? "bg-slate-800/90 border-slate-700/80" : "bg-white border-slate-200 shadow-slate-200/50"
                }`}
              >
                <div
                  className={`w-14 h-14 mx-auto rounded-full border flex items-center justify-center ${
                    isDark ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                  }`}
                >
                  <Package className="w-7 h-7 text-indigo-500 dark:text-indigo-400" />
                </div>
                <div>
                  <h3 className={`text-base font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                    No items match your active filters
                  </h3>
                  <p className={`text-xs max-w-md mx-auto mt-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    Try clearing your search or switching categories. You can also set a notification alert to get notified the second a student posts a matching item!
                  </p>
                </div>
                <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                  <button
                    id="empty-state-notify-btn"
                    onClick={() => {
                      setPrefilledAlertKeyword(searchQuery);
                      setPrefilledAlertCategory(selectedCategory);
                      setIsAlertsModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5 text-slate-950" />
                    <span>
                      Notify Me When Listed {searchQuery ? `("${searchQuery}")` : ""}
                    </span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedCategory("All");
                      setSelectedType("all");
                      setSelectedCondition("all");
                      setWishlistOnlyFilter(false);
                      setSearchQuery("");
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors border cursor-pointer ${
                      isDark
                        ? "bg-slate-700/90 hover:bg-slate-700 text-slate-200 border-slate-600"
                        : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200"
                    }`}
                  >
                    Reset All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Footer with Mentorship & PBL Credits */}
      <footer
        className={`mt-16 border-t py-8 px-4 sm:px-6 lg:px-8 text-xs backdrop-blur-xl transition-colors duration-200 ${
          isDark
            ? "bg-slate-950/80 border-slate-800/90 text-slate-400"
            : "bg-white border-slate-200 text-slate-600"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}>
              PVG's COET Campus Resale & Exchange Platform
            </div>
            <p>
              Problem-Based Learning (PBL) Project • 2nd Year Computer Science & Engineering
            </p>
            <p>
              Guided by: <strong className={isDark ? "text-slate-200" : "text-slate-800"}>Prof. Snehal Kokil</strong> | Team: Ayush Gadigone (26), Parshwa Gandhi (28), Omkar Ghadashi (32), Krishna Gopnarayan (35)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPBLModalOpen(true)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors cursor-pointer ${
                isDark
                  ? "border-slate-700 hover:bg-slate-800 text-slate-300"
                  : "border-slate-200 hover:bg-slate-100 text-slate-700"
              }`}
            >
              PBL Documentation & Milestones
            </button>
            <button
              onClick={() => setIsAIInspectorOpen(true)}
              className={`px-3 py-1.5 rounded-lg border font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
                isDark
                  ? "bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 border-indigo-500/40"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
              Gemini 3.1 Pro Preview
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ListingDetailModal
        listing={selectedListing}
        allListings={listings}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedListing(null);
        }}
        onOpenChat={(item, initialQuestion) => {
          if (!isOnline) {
            showToast("⚠️ Chat is disabled while offline to prevent data loss.");
            return;
          }
          setChatListing(item);
          setChatInitialMessage(initialQuestion || "");
          setIsChatOpen(true);
        }}
        onOpenCalendar={handleOpenCalendar}
        onUpdateStatus={handleUpdateStatus}
        currentUserId={currentUser?.uid}
        currentUser={currentUser}
        onAddReview={handleAddReview}
        onReportListing={handleReportListing}
        onRenewListing={handleRenewListing}
        isWishlisted={selectedListing ? wishlistIds.includes(selectedListing.id) : false}
        onToggleWishlist={handleToggleWishlist}
        onOpenLightbox={(item) => {
          setLightboxListing(item);
        }}
        isOnline={isOnline}
      />

      <WishlistModal
        isOpen={isWishlistModalOpen}
        onClose={() => setIsWishlistModalOpen(false)}
        savedListings={savedWishlistListings}
        onRemoveFromWishlist={handleToggleWishlist}
        onClearWishlist={handleClearWishlist}
        onOpenDetails={(item) => {
          setSelectedListing(item);
          setIsDetailModalOpen(true);
        }}
        onOpenLightbox={(item) => {
          setLightboxListing(item);
        }}
        onOpenChat={(item) => {
          if (!isOnline) {
            showToast("⚠️ Chat is disabled while offline to prevent data loss.");
            return;
          }
          setChatListing(item);
          setIsChatOpen(true);
        }}
        onOpenCalendar={handleOpenCalendar}
        isOnline={isOnline}
      />

      <AIItemInspectorModal
        isOpen={isAIInspectorOpen}
        onClose={() => setIsAIInspectorOpen(false)}
        onApplyToListing={handleApplyAIToListing}
        isOnline={isOnline}
      />

      <CreateListingModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setPrefilledInspection(null);
          setPrefilledImage(null);
        }}
        onOpenAIInspector={() => setIsAIInspectorOpen(true)}
        currentUser={currentUser}
        initialInspection={prefilledInspection}
        initialImage={prefilledImage}
        onListingCreated={handleListingCreated}
        isOnline={isOnline}
      />

      {calendarTargetListing && (
        <CalendarHandoverModal
          isOpen={isCalendarModalOpen}
          onClose={() => {
            setIsCalendarModalOpen(false);
            setCalendarTargetListing(null);
          }}
          listing={calendarTargetListing}
          currentUserEmail={currentUser?.email || undefined}
          currentUserName={currentUser?.displayName || undefined}
          otherPartyName={calendarOtherParty.name}
          otherPartyEmail={calendarOtherParty.email}
          onEventCreated={handleCalendarEventCreated}
        />
      )}

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => {
          setIsChatOpen(false);
          setChatListing(null);
          setChatInitialMessage("");
        }}
        activeListing={chatListing}
        currentUser={currentUser}
        initialMessage={chatInitialMessage}
        onOpenCalendarFromChat={(item, name, email) => {
          setCalendarTargetListing(item);
          setCalendarOtherParty({ name, email: email || "" });
          setIsCalendarModalOpen(true);
        }}
        isOnline={isOnline}
      />

      <UpcomingHandoversModal
        isOpen={isHandoversModalOpen}
        onClose={() => setIsHandoversModalOpen(false)}
        listings={listings}
        onSelectListingForCalendar={handleOpenCalendar}
        onOpenDetails={(item) => {
          setSelectedListing(item);
          setIsDetailModalOpen(true);
        }}
      />

      <PBLProjectInfoModal
        isOpen={isPBLModalOpen}
        onClose={() => setIsPBLModalOpen(false)}
      />

      {/* On-Screen Toast Notification for Matched Listing Alert */}
      <AlertToastNotification
        matchEvent={currentAlertToast}
        onDismiss={() => setCurrentAlertToast(null)}
        onViewListing={(item) => {
          setSelectedListing(item);
          setIsDetailModalOpen(true);
        }}
      />

      {/* Notify Me / Alerts Modal */}
      <AlertsModal
        isOpen={isAlertsModalOpen}
        onClose={() => setIsAlertsModalOpen(false)}
        alerts={alerts}
        onUpdateAlerts={handleUpdateAlerts}
        onSimulateListing={handleSimulateListing}
        prefilledKeyword={prefilledAlertKeyword}
        prefilledCategory={prefilledAlertCategory}
        onViewListing={(item) => {
          setSelectedListing(item);
          setIsDetailModalOpen(true);
        }}
        alertHistory={alertHistory}
        onClearHistory={handleClearAlertHistory}
      />

      {/* Topper Notes Free Vault Modal */}
      <TopperNotesModal
        isOpen={isTopperNotesModalOpen}
        onClose={() => setIsTopperNotesModalOpen(false)}
        currentUserEmail={currentUser?.email}
        currentUserName={currentUser?.displayName}
        notes={topperNotes}
        onSaveNotes={(updated) => {
          setTopperNotes(updated);
          saveStoredTopperNotes(updated);
        }}
        onShowToast={showToast}
      />

      {/* Item Image Inspection Lightbox Modal */}
      <ListingImageLightboxModal
        listing={lightboxListing}
        isOpen={Boolean(lightboxListing)}
        onClose={() => setLightboxListing(null)}
        onOpenChat={(item) => {
          setLightboxListing(null);
          setChatListing(item);
          setIsChatOpen(true);
        }}
        onOpenDetails={(item) => {
          setLightboxListing(null);
          setSelectedListing(item);
          setIsDetailModalOpen(true);
        }}
        onOpenCalendar={(item) => {
          setLightboxListing(null);
          handleOpenCalendar(item);
        }}
      />
    </div>
  );
}
