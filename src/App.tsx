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
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
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

  // Handle shared listing URL parameter (e.g. ?item=...)
  useEffect(() => {
    if (listings.length === 0) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const itemId = params.get("item");
      if (itemId) {
        const found = listings.find((l) => l.id === itemId);
        if (found) {
          setSelectedListing(found);
          setIsDetailModalOpen(true);
        }
      }
    } catch (err) {
      console.warn("Could not read shared listing param:", err);
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
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        showToast(`Welcome, ${res.user.displayName || "Student"}! College student account verified.`);
      } else {
        showToast("Google sign-in popup was closed. You can retry or click 'Demo Student'.");
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        console.warn("Login notice:", err?.message || err);
      }
      showToast("Sign in was cancelled or closed.");
    }
  };

  const handleDemoLogin = async () => {
    try {
      const res = await demoStudentSignIn();
      if (res?.user) {
        setCurrentUser(res.user);
        showToast(`Welcome, ${res.user.displayName}! College student account active.`);
      }
    } catch (err: any) {
      console.warn("Demo login notice:", err);
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-100/60 text-slate-900 font-sans antialiased">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="px-4 py-3 rounded-2xl bg-slate-900 text-white text-xs font-semibold shadow-2xl border border-slate-800 flex items-center gap-2 max-w-md">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Navigation Header */}
      <Navbar
        currentUser={currentUser}
        onLogin={handleLogin}
        onDemoLogin={handleDemoLogin}
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

      {/* Hero / Information Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-blue-900 text-white py-8 px-4 sm:px-6 lg:px-8 border-b border-indigo-950 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-semibold backdrop-blur-xs border border-white/15">
              <Building2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Campus Resale & Exchange Network</span>
              <span>•</span>
              <span className="text-emerald-300">Verified College Access</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Buy, Sell & Swap Student Equipment on Campus
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
              Safe student-to-student transactions for calculators, engineering books, workshop tools, cycles, and bags. Inspected with <strong>Gemini 3.1 Pro Preview</strong> and synchronized to <strong>Google Calendar</strong> for safe campus handovers.
            </p>
          </div>

          {/* Quick Action Metrics & CTAs */}
          <div className="flex flex-wrap gap-2.5 shrink-0">
            <button
              id="hero-scan-gemini-btn"
              disabled={!isOnline}
              onClick={() => {
                if (!isOnline) {
                  showToast("⚠️ Offline: AI item scanner requires an active internet connection.");
                  return;
                }
                setIsAIInspectorOpen(true);
              }}
              title={
                !isOnline
                  ? "AI scanning requires an active internet connection"
                  : "Scan item with Gemini 3.1 Pro Preview"
              }
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all select-none ${
                !isOnline
                  ? "bg-white/40 text-indigo-950/60 border border-white/20 cursor-not-allowed"
                  : "bg-white text-indigo-900 hover:bg-indigo-50 cursor-pointer"
              }`}
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Scan Item with Gemini AI</span>
            </button>
            <button
              id="hero-post-preowned-btn"
              disabled={!isOnline}
              onClick={() => {
                if (!isOnline) {
                  showToast("⚠️ Offline: Creating listings is disabled while disconnected to prevent data loss.");
                  return;
                }
                setPrefilledInspection(null);
                setPrefilledImage(null);
                setIsCreateModalOpen(true);
              }}
              title={
                !isOnline
                  ? "Creating listings is disabled while offline to prevent data loss"
                  : "Post a pre-owned item on campus"
              }
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs shadow-md border transition-all select-none ${
                !isOnline
                  ? "bg-indigo-950/70 text-indigo-300/60 border-indigo-900 cursor-not-allowed opacity-75"
                  : "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/40 cursor-pointer"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>{!isOnline ? "Post Disabled (Offline)" : "Post Pre-Owned Item"}</span>
            </button>
            <button
              onClick={() => setIsPBLModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-all"
            >
              <BookOpen className="w-4 h-4 text-indigo-200" />
              PBL Scope & Team
            </button>
          </div>
        </div>
      </div>

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
                    ? "text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-600 hover:text-indigo-600 bg-white hover:bg-slate-50/90 border border-slate-200/90 hover:border-indigo-200 shadow-2xs"
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
                      isSelected ? "text-white" : "text-slate-400 group-hover:text-indigo-500"
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
                      : "rgba(241, 245, 249, 1)",
                    color: isSelected ? "#ffffff" : "#64748b",
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
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-3">
            {/* Listing Type Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Type:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">All Types (Sell & Swap)</option>
                <option value="sell">For Sale (₹ Cash)</option>
                <option value="exchange">For Exchange Only</option>
              </select>
            </div>

            {/* Condition Filter */}
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-slate-500">Condition:</span>
              <select
                value={selectedCondition}
                onChange={(e) => setSelectedCondition(e.target.value as any)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                wishlistOnlyFilter
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  wishlistOnlyFilter
                    ? "fill-white text-white"
                    : "fill-rose-500 text-rose-500"
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
              className="px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 shadow-2xs"
            >
              <Bell className="w-3.5 h-3.5 text-amber-600" />
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
                className="text-indigo-600 hover:text-indigo-800 font-bold ml-1"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-500 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
            <h2 className="text-base font-bold text-slate-900">
              {selectedCategory === "All" ? "Campus Marketplace Items" : `${selectedCategory} Listings`}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-200 text-slate-700">
              {filteredListings.length}
            </span>
          </div>

          <span className="text-xs text-slate-500">
            Click on any item to view AI condition breakdown or negotiate
          </span>
        </div>

        {/* Listings Grid */}
        {isLoadingListings ? (
          <div className="text-center py-16 space-y-3">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">
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
                className="text-center py-16 p-8 rounded-2xl bg-white border border-slate-200 space-y-4"
              >
                <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Package className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    No items match your active filters
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto mt-1">
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
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-colors shadow-xs flex items-center gap-1.5"
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
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
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
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-bold text-slate-800 text-sm">
              Campus Resale & Exchange Platform
            </div>
            <p>
              Problem-Based Learning (PBL) Project • 2nd Year Computer Science & Engineering
            </p>
            <p>
              Guided by: <strong className="text-slate-700">Prof. Snehal Kokil</strong> | Team: Ayush Gadigone (26), Parshwa Gandhi (28), Omkar Ghadashi (32), Krishna Gopnarayan (35)
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsPBLModalOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 font-semibold text-slate-700 transition-colors"
            >
              PBL Documentation & Milestones
            </button>
            <button
              onClick={() => setIsAIInspectorOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              Gemini 3.1 Pro Preview
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ListingDetailModal
        listing={selectedListing}
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
