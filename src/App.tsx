import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  Eye,
  Archive,
  Flame,
  LayoutGrid,
  SlidersHorizontal,
  Maximize2,
  Minimize2,
  X,
  ArrowUpNarrowWide,
  ArrowDownWideNarrow,
  MessageSquare,
  History,
} from "lucide-react";
import { User } from "firebase/auth";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  setDoc,
  getDocs,
  increment,
  deleteDoc,
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
  Conversation,
} from "./types";
import { INITIAL_SEED_LISTINGS } from "./data/seedListings";
import {
  db,
  initAuth,
  googleSignIn,
  demoStudentSignIn,
  logout,
  handleFirestoreError,
  OperationType,
} from "./lib/firebase";
import { GoogleCalendarEventResponse } from "./lib/calendar";

import { Navbar } from "./components/Navbar";
import { ThemeSelector } from "./components/ThemeSelector";
import { ListingCard } from "./components/ListingCard";
import { ListingGridSkeleton } from "./components/ListingCardSkeleton";
import { ListingDetailModal } from "./components/ListingDetailModal";
import { ListingImageLightboxModal } from "./components/ListingImageLightboxModal";
import { AIItemInspectorModal } from "./components/AIItemInspectorModal";
import { CreateListingModal } from "./components/CreateListingModal";
import { CalendarHandoverModal } from "./components/CalendarHandoverModal";
import { ChatDrawer } from "./components/ChatDrawer";
import { UpcomingHandoversModal } from "./components/UpcomingHandoversModal";
import { WishlistModal } from "./components/WishlistModal";
import { YourChatsModal } from "./components/YourChatsModal";
import { YourChatsSection } from "./components/YourChatsSection";
import {
  getStoredChats,
  deleteStoredChat,
  clearAllStoredChats,
  recordChatMessage,
  CHATS_UPDATED_EVENT,
} from "./utils/chatStorage";
import { TopperNotesModal } from "./components/TopperNotesModal";
import { TopperNote } from "./types";
import {
  getStoredTopperNotes,
  saveStoredTopperNotes,
  isAppOwner,
} from "./utils/topperNotesStorage";
import { CollegeLoginPage } from "./components/CollegeLoginPage";
import { LandingPage } from "./components/LandingPage";
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
  purgeExpiredListings,
  isListingExpired,
} from "./utils/expiryUtils";
import { useTheme } from "./context/ThemeContext";
import { EngineeringBentoHero } from "./components/EngineeringBentoHero";
import { DedicatedSearchBar } from "./components/DedicatedSearchBar";
import { CampusLiveTicker } from "./components/CampusLiveTicker";
import { BarterComparisonDrawer } from "./components/BarterComparisonDrawer";
import { StudentPassportModal } from "./components/StudentPassportModal";
import { RecentlyViewedSection } from "./components/RecentlyViewedSection";
import { HorizontalSlider } from "./components/HorizontalSlider";
import { calculateSmartSortScore } from "./utils/smartSort";

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

  // Listings state (automatically purges any expired items on load)
  const [listings, setListings] = useState<Listing[]>(() => purgeExpiredListings(INITIAL_SEED_LISTINGS).activeListings);
  const [isLoadingListings, setIsLoadingListings] = useState(true);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "All">("All");
  const [selectedType, setSelectedType] = useState<ListingType | "all">("all");
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | "all">("all");
  const [includeSoldItems, setIncludeSoldItems] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"smart_sort" | "newest" | "views_desc" | "price_asc" | "price_desc" | "ai_score">("smart_sort");
  const [layoutMode, setLayoutMode] = useState<"grid" | "detailed">("grid");
  const [isFullScreenMode, setIsFullScreenMode] = useState<boolean>(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullScreenMode(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch((err) => {
        console.warn("Fullscreen request error:", err);
      });
      setIsFullScreenMode(true);
    } else {
      document.exitFullscreen?.().catch((err) => {
        console.warn("Exit fullscreen error:", err);
      });
      setIsFullScreenMode(false);
    }
  };

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

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  }, []);

  // Recently Viewed state & persistence (tracks last 5 clicked listings)
  const [recentlyViewed, setRecentlyViewed] = useState<Listing[]>(() => {
    try {
      const saved = localStorage.getItem("campus_marketplace_recently_viewed");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Track clicked listing into Recently Viewed (max 5 items, newest at index 0)
  const trackRecentlyViewed = useCallback((item: Listing) => {
    setRecentlyViewed((prev) => {
      const filtered = prev.filter((i) => i.id !== item.id);
      const updated = [item, ...filtered].slice(0, 5);
      try {
        localStorage.setItem(
          "campus_marketplace_recently_viewed",
          JSON.stringify(updated)
        );
      } catch (e) {
        console.warn("Could not save recently viewed item to localStorage:", e);
      }
      return updated;
    });
  }, []);

  const handleClearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem("campus_marketplace_recently_viewed");
      showToast("🗑️ Recently viewed history cleared");
    } catch (e) {
      console.warn("Could not clear recently viewed items:", e);
    }
  }, [showToast]);

  const handleRemoveRecentlyViewedItem = useCallback((itemId: string) => {
    setRecentlyViewed((prev) => {
      const updated = prev.filter((i) => i.id !== itemId);
      try {
        localStorage.setItem(
          "campus_marketplace_recently_viewed",
          JSON.stringify(updated)
        );
      } catch (e) {
        console.warn("Could not update recently viewed items:", e);
      }
      return updated;
    });
  }, []);

  // Sync recently viewed items with updated live data from listings
  useEffect(() => {
    if (listings.length === 0) return;
    setRecentlyViewed((prev) => {
      let hasUpdate = false;
      const synced = prev.map((item) => {
        const live = listings.find((l) => l.id === item.id);
        if (
          live &&
          (live.price !== item.price ||
            live.status !== item.status ||
            live.title !== item.title ||
            live.imageUrl !== item.imageUrl)
        ) {
          hasUpdate = true;
          return { ...item, ...live };
        }
        return item;
      });
      if (hasUpdate) {
        try {
          localStorage.setItem(
            "campus_marketplace_recently_viewed",
            JSON.stringify(synced)
          );
        } catch (e) {
          console.warn("Could not sync recently viewed storage:", e);
        }
        return synced;
      }
      return prev;
    });
  }, [listings]);

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

  // "Your Chats" state & reactive persistence
  const [isYourChatsModalOpen, setIsYourChatsModalOpen] = useState(false);
  const [storedChats, setStoredChats] = useState<Conversation[]>(() => getStoredChats());

  // Listen for chat storage updates across components and tabs
  useEffect(() => {
    const handleChatUpdate = () => {
      setStoredChats(getStoredChats());
    };
    window.addEventListener(CHATS_UPDATED_EVENT, handleChatUpdate);
    window.addEventListener("storage", handleChatUpdate);
    return () => {
      window.removeEventListener(CHATS_UPDATED_EVENT, handleChatUpdate);
      window.removeEventListener("storage", handleChatUpdate);
    };
  }, []);

  const [isHandoversModalOpen, setIsHandoversModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState(false);
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

  // Visual Innovation States
  const [isBarterDrawerOpen, setIsBarterDrawerOpen] = useState(false);
  const [barterListing, setBarterListing] = useState<Listing | null>(null);
  const [isPassportModalOpen, setIsPassportModalOpen] = useState(false);
  const [passportListing, setPassportListing] = useState<Listing | null>(null);

  // 1. Initialize Auth
  useEffect(() => {
    const safetyTimer = setTimeout(() => {
      setIsAuthLoading(false);
    }, 300);

    const unsubscribe = initAuth(
      async (user) => {
        clearTimeout(safetyTimer);
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
        clearTimeout(safetyTimer);
        setCurrentUser(null);
        setIsAuthLoading(false);
      }
    );
    return () => {
      clearTimeout(safetyTimer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Fetch and Sync Listings from Firestore with seed fallback
  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const syncListings = () => {
      try {
        const listingsCol = collection(db, "listings");

        // Live real-time sync with onSnapshot (resilient to offline / reconnect)
        unsubscribe = onSnapshot(
          listingsCol,
          (querySnapshot) => {
            if (querySnapshot.empty) {
              const { activeListings } = purgeExpiredListings(INITIAL_SEED_LISTINGS);
              setListings(activeListings);
              setIsLoadingListings(false);
              return;
            }

            const fetched: Listing[] = [];
            querySnapshot.forEach((docSnap) => {
              const data = docSnap.data() as any;
              const seedMatch = INITIAL_SEED_LISTINGS.find((s) => s.id === docSnap.id);
              fetched.push({
                id: docSnap.id,
                ...data,
                views: typeof data.views === "number" ? data.views : seedMatch?.views ?? 0,
                reviews: data.reviews && data.reviews.length > 0 ? data.reviews : seedMatch?.reviews || [],
                averageRating: data.averageRating ?? seedMatch?.averageRating,
                totalReviews: data.totalReviews ?? (data.reviews ? data.reviews.length : seedMatch?.totalReviews || 0),
              });
            });

            const sourceList = fetched.length > 0 ? fetched : INITIAL_SEED_LISTINGS;
            const { activeListings, purgedIds } = purgeExpiredListings(sourceList);
            setListings(activeListings);

            // Automatically delete expired listings from Firestore
            if (purgedIds.length > 0) {
              purgedIds.forEach(async (id) => {
                try {
                  await deleteDoc(doc(db, "listings", id));
                  console.info(`Auto-deleted expired listing from database: ${id}`);
                } catch {
                  // Benign ignore if already removed or operating offline
                }
              });
            }

            setIsLoadingListings(false);

            // Real-time alert check for newly added documents
            if (isInitialSnapshotRef.current) {
              activeListings.forEach((item) => knownListingIdsRef.current.add(item.id));
              INITIAL_SEED_LISTINGS.forEach((item) => knownListingIdsRef.current.add(item.id));
              isInitialSnapshotRef.current = false;
            } else {
              activeListings.forEach((item) => {
                if (!knownListingIdsRef.current.has(item.id)) {
                  knownListingIdsRef.current.add(item.id);
                  processNewListingForAlerts(item);
                }
              });
            }
          },
          (err) => {
            handleFirestoreError(err, OperationType.GET, "listings");
            console.info("Firestore live listener operating in offline mode, showing local catalog.");
            setListings(purgeExpiredListings(INITIAL_SEED_LISTINGS).activeListings);
            setIsLoadingListings(false);
          }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "listings");
        setListings(purgeExpiredListings(INITIAL_SEED_LISTINGS).activeListings);
        setIsLoadingListings(false);
      }
    };

    syncListings();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Regularly check and permanently delete any listings that pass their expiry date
  useEffect(() => {
    const purgeInterval = setInterval(() => {
      setListings((currentListings) => {
        const { activeListings, purgedIds } = purgeExpiredListings(currentListings);
        if (purgedIds.length > 0) {
          purgedIds.forEach(async (id) => {
            try {
              await deleteDoc(doc(db, "listings", id));
              console.info(`Auto-deleted expired listing during interval check: ${id}`);
            } catch {
              // Benign
            }
          });
          return activeListings;
        }
        return currentListings;
      });
    }, 30000);

    return () => clearInterval(purgeInterval);
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

  // Listing Details and View Tracking Handler
  const handleOpenDetails = (item: Listing) => {
    // 1. Session tracking to prevent false view flooding within the same session
    const sessionKey = `viewed_item_${item.id}`;
    const alreadyViewed = sessionStorage.getItem(sessionKey);

    let updatedItem = item;

    if (!alreadyViewed) {
      sessionStorage.setItem(sessionKey, "true");
      const updatedViews = (item.views || 0) + 1;
      updatedItem = { ...item, views: updatedViews };

      // Local optimistic state update
      setListings((prev) =>
        prev.map((l) => (l.id === item.id ? { ...l, views: updatedViews } : l))
      );

      // Async Firestore increment
      try {
        const docRef = doc(db, "listings", item.id);
        updateDoc(docRef, {
          views: increment(1),
        }).catch((err) => {
          handleFirestoreError(err, OperationType.UPDATE, `listings/${item.id}`);
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.UPDATE, `listings/${item.id}`);
      }
    }

    // Track listing in Recently Viewed (max 5 items, latest clicked at the front)
    trackRecentlyViewed(updatedItem);

    setSelectedListing(updatedItem);
    setIsDetailModalOpen(true);
  };

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
          handleOpenDetails(found);
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
        // Sold items filter: By default hide completed listings to keep marketplace clean,
        // unless 'Include Sold Items' toggle is active for browsing transaction history.
        if (!includeSoldItems && item.status === "completed") {
          return false;
        }

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
        if (sortBy === "smart_sort") {
          const scoreA = calculateSmartSortScore(a, listings);
          const scoreB = calculateSmartSortScore(b, listings);
          if (scoreB !== scoreA) {
            return scoreB - scoreA;
          }
          // Tie-breaker: Recency
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "views_desc") {
          const viewsA = a.views || 0;
          const viewsB = b.views || 0;
          return viewsB - viewsA;
        }
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
  }, [listings, includeSoldItems, searchQuery, selectedCategory, selectedType, selectedCondition, sortBy, wishlistOnlyFilter, wishlistIds]);

  const soldItemsCount = useMemo(() => {
    return listings.filter((item) => item.status === "completed").length;
  }, [listings]);

  // Dynamic counts for each category
  const categoryCounts = useMemo(() => {
    const visibleListings = includeSoldItems
      ? listings
      : listings.filter((item) => item.status !== "completed");

    const counts: Record<string, number> = { All: visibleListings.length };
    visibleListings.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [listings, includeSoldItems]);

  // Dynamic available stock inventory for each category
  const categoryStockCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Cycles: 0,
      Books: 0,
      Calculators: 0,
      "Lab Equipment": 0,
      Bags: 0,
      Other: 0,
    };
    listings.forEach((item) => {
      if (item.status === "available") {
        const stock = typeof item.availableStock === "number" ? item.availableStock : 1;
        if (counts[item.category] !== undefined) {
          counts[item.category] += stock;
        } else {
          counts["Other"] += stock;
        }
      }
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

  const handleOpenChat = (item: Listing, initialMessage?: string) => {
    if (!isOnline) {
      showToast("⚠️ Chat is disabled while offline to prevent data loss.");
      return;
    }
    if (initialMessage) {
      recordChatMessage(
        item,
        {
          id: `msg_init_${Date.now()}`,
          conversationId: `conv_${item.id}_${currentUser?.uid || "guest"}`,
          senderId: currentUser?.uid || "current-user",
          senderName: currentUser?.displayName || "You",
          senderEmail: currentUser?.email || "student@college.edu.in",
          text: initialMessage,
          type: "text",
          timestamp: Date.now(),
        },
        currentUser
      );
    }
    setChatListing(item);
    setChatInitialMessage(initialMessage || "");
    setIsChatOpen(true);
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
      handleFirestoreError(e, OperationType.UPDATE, `listings/${calendarTargetListing.id}`);
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
            handleFirestoreError(err, OperationType.UPDATE, `listings/${listingId}`);
          });
        } catch (e) {
          handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`);
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
    showToast("✨ Applied Gemini 3.8 Flash analysis to listing form!");
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
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`);
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
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`);
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
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`);
    }
    showToast("🎉 Listing renewed! Active for another 30 days.");
  };

  const upcomingHandoversCount = listings.filter((l) => l.handoverDetails).length;
  const availableListingsCount = listings.filter((l) => l.status === "available").length;
  const totalActiveStock = useMemo(() => {
    return listings.reduce((sum, item) => {
      if (item.status === "available") {
        const stock = typeof item.availableStock === "number" ? item.availableStock : 1;
        return sum + stock;
      }
      return sum;
    }, 0);
  }, [listings]);

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
          "dedicated-search-bar-input"
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
      } else if ((e.key === "c" || e.key === "C") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setIsYourChatsModalOpen(true);
      } else if ((e.key === "d" || e.key === "D") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleTheme();
      } else if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        toggleFullScreen();
      } else if ((e.key === "i" || e.key === "I") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (isOnline) {
          setIsAIInspectorOpen(true);
        } else {
          showToast("⚠️ Offline: AI item scanner requires an active internet connection.");
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOnline, toggleTheme, toggleFullScreen]);

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

  // Optional Full Landing Page View (can be opened via footer / about action)
  if (showLandingPage) {
    return (
      <LandingPage
        onProceedToSignIn={() => {
          setShowLandingPage(false);
          setIsLoginModalOpen(true);
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased relative overflow-hidden transition-colors duration-500 ease-in-out ${
        isDark
          ? "bg-[#0B0F19] text-slate-100 selection:bg-indigo-500 selection:text-white"
          : "bg-[#F4F5F9] text-slate-800 selection:bg-purple-100 selection:text-purple-900"
      }`}
    >
      {/* Ambient background glows matching CollegeLoginPage */}
      <div
        className={`absolute -top-40 -left-40 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-500 ease-in-out ${
          isDark ? "bg-indigo-600/20" : "bg-indigo-300/30"
        }`}
      />
      <div
        className={`absolute top-1/4 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-500 ease-in-out ${
          isDark ? "bg-amber-500/10" : "bg-amber-300/20"
        }`}
      />
      <div
        className={`absolute bottom-1/3 -left-32 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-500 ease-in-out ${
          isDark ? "bg-blue-600/15" : "bg-blue-300/20"
        }`}
      />
      <div
        className={`absolute -bottom-40 right-1/4 w-96 h-96 rounded-full blur-3xl pointer-events-none -z-10 transition-colors duration-500 ease-in-out ${
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
        onLogin={() => setIsLoginModalOpen(true)}
        onDemoLogin={() => handleDemoCollegeLogin()}
        onLogout={handleLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onOpenCreateModal={() => {
          if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
          }
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
        onOpenTopperNotes={() => setIsTopperNotesModalOpen(true)}
        upcomingHandoversCount={upcomingHandoversCount}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
        chatsCount={storedChats.length}
        onOpenYourChats={() => setIsYourChatsModalOpen(true)}
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

      {/* Live Campus Ticker & Hot-Drop Beacon */}
      <CampusLiveTicker
        onSelectItem={(query) => {
          if (query) setSearchQuery(query);
        }}
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
        totalListingsCount={totalActiveStock}
        totalActiveStock={totalActiveStock}
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
        onOpenWishlist={() => setIsWishlistModalOpen(true)}
        onOpenYourChats={() => setIsYourChatsModalOpen(true)}
        onFocusSearch={() => {
          const input = document.getElementById("dedicated-search-bar-input") as HTMLInputElement | null;
          input?.focus();
        }}
        onOpenAlerts={() => {
          setPrefilledAlertKeyword("");
          setPrefilledAlertCategory("All");
          setIsAlertsModalOpen(true);
        }}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
        selectedCategory={selectedCategory}
      />

      {/* Main Container (Full Width Responsive) */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 py-6 space-y-6">
        {/* Dedicated Search Bar Section with History & Quick Tags */}
        <DedicatedSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalResultsCount={filteredListings.length}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          categoryStockCounts={categoryStockCounts}
        />

        {/* Category Filter Pills (Slideable on mobile) */}
        <div
          role="tablist"
          aria-label="Filter listings by category"
          className="w-full"
        >
          <HorizontalSlider
            id="category-pills-slider"
            showArrows={true}
            showProgress={true}
            showMobileHint={true}
            scrollStep={220}
            itemSnap={true}
            ariaLabel="Category Filter Tabs Slider"
            trackClassName="gap-2.5 py-1.5 px-0.5"
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
                  className={`relative px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 cursor-pointer select-none transition-all duration-200 overflow-hidden shrink-0 snap-start ${
                    isSelected
                      ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white shadow-lg shadow-purple-600/40 ring-2 ring-purple-400 border border-purple-400"
                      : isDark
                      ? "text-slate-300 hover:text-white bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.55)] hover:ring-2 hover:ring-purple-400/40 shadow-xs"
                      : "text-slate-700 hover:text-purple-950 bg-white hover:bg-purple-50/60 border border-slate-200 hover:border-purple-400 hover:shadow-[0_0_20px_rgba(168,85,247,0.45)] hover:ring-2 hover:ring-purple-400/40 shadow-xs"
                  }`}
                >
                  {/* Active Sliding Pill Background */}
                  {isSelected && (
                    <motion.div
                      layoutId="activeCategoryPillHighlight"
                      className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 shadow-md shadow-purple-600/30 z-0"
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

                  {/* Category Label (shows Total: for All) */}
                  <span className={`relative z-10 font-bold ${isSelected ? "text-white font-extrabold" : ""}`}>
                    {cat === "All" ? "Total:" : cat}
                  </span>

                  {/* Item Counter Badge */}
                  <span
                    className={`relative z-10 ml-0.5 px-2 py-0.5 rounded-full text-[10px] font-black tracking-tight ${
                      count === 0
                        ? isSelected
                          ? "bg-rose-500 text-white ring-1 ring-white/40 shadow-xs"
                          : isDark
                          ? "bg-rose-950/80 text-rose-300 border border-rose-800/80"
                          : "bg-rose-100 text-rose-700 border border-rose-200"
                        : isSelected
                        ? "bg-emerald-500 text-white ring-1 ring-white/40 shadow-xs"
                        : isDark
                        ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                        : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    }`}
                  >
                    {count}
                  </span>
                </motion.button>
              );
            })}
          </HorizontalSlider>
        </div>

        {/* Secondary Filter & Sorting Controls */}
        <div
          className={`p-3 sm:p-4 rounded-2xl border shadow-md backdrop-blur-xl text-xs overflow-hidden ${
            isDark
              ? "bg-slate-800/90 border-slate-700/80 text-slate-200"
              : "bg-white border-slate-200 text-slate-800 shadow-slate-200/60"
          }`}
        >
          <HorizontalSlider
            id="marketplace-filters-slider"
            showArrows={true}
            showProgress={true}
            showMobileHint={true}
            scrollStep={280}
            ariaLabel="Marketplace Filters & Sorting Slider"
            trackClassName="gap-4 py-1 items-center justify-between min-w-full"
          >
            <div className="flex items-center gap-3 shrink-0">
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
              aria-keyshortcuts="W"
              title="Show only items saved to your Wishlist (Shortcut: W)"
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
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
              <kbd
                className={`hidden sm:inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-mono font-bold rounded border select-none ${
                  wishlistOnlyFilter
                    ? "bg-white/25 text-white border-white/30"
                    : "bg-rose-500/20 text-rose-300 border-rose-500/30"
                }`}
              >
                W
              </kbd>
            </button>

            {/* Your Chats Quick Access */}
            <button
              id="filter-your-chats-toggle"
              onClick={() => setIsYourChatsModalOpen(true)}
              aria-keyshortcuts="C"
              title="View Your Chats with sellers (Shortcut: C)"
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                isDark
                  ? "bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border-indigo-500/30"
                  : "bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200 shadow-2xs"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-indigo-500" />
              <span>Your Chats ({storedChats.length})</span>
              <kbd
                className={`hidden sm:inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-mono font-bold rounded border select-none ${
                  isDark
                    ? "bg-indigo-950/60 text-indigo-300 border-indigo-700/50"
                    : "bg-indigo-100 text-indigo-700 border-indigo-200"
                }`}
              >
                C
              </kbd>
            </button>

            {/* Include Sold Items Toggle */}
            <button
              id="filter-include-sold-toggle"
              type="button"
              onClick={() => setIncludeSoldItems(!includeSoldItems)}
              title={
                includeSoldItems
                  ? "Currently showing all items including sold transactions. Click to hide sold items and keep marketplace clean."
                  : "Include completed transactions to browse historical student sales, prices, and handovers."
              }
              className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 border cursor-pointer select-none ${
                includeSoldItems
                  ? isDark
                    ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-xs"
                    : "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs"
                  : isDark
                  ? "bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-700/80 hover:border-slate-600"
                  : "bg-slate-50 text-slate-600 hover:text-slate-900 border-slate-200 hover:border-slate-300"
              }`}
            >
              <Archive className={`w-3.5 h-3.5 ${includeSoldItems ? "text-emerald-400" : "text-slate-400"}`} />
              <span>Include Sold Items</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${
                  includeSoldItems
                    ? isDark
                      ? "bg-emerald-400/20 text-emerald-300"
                      : "bg-emerald-200 text-emerald-900"
                    : isDark
                    ? "bg-slate-800 text-slate-400"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {soldItemsCount}
              </span>
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
              includeSoldItems ||
              searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedType("all");
                  setSelectedCondition("all");
                  setWishlistOnlyFilter(false);
                  setIncludeSoldItems(false);
                  setSearchQuery("");
                }}
                className="text-indigo-500 dark:text-indigo-400 hover:underline font-bold ml-1 cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* View Mode Switcher & Full Screen Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Segmented Control */}
            <div
              className={`p-1 rounded-xl border flex items-center gap-1 ${
                isDark ? "bg-slate-900/90 border-slate-700" : "bg-slate-100 border-slate-200"
              }`}
              role="group"
              aria-label="Listing card layout mode"
            >
              <button
                type="button"
                id="view-mode-grid-btn"
                onClick={() => setLayoutMode("grid")}
                title="Grid layout view with expandable details"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === "grid"
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-indigo-700 shadow-xs border border-slate-200"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                type="button"
                id="view-mode-detailed-btn"
                onClick={() => setLayoutMode("detailed")}
                title="Detailed full-specs layout view"
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === "detailed"
                    ? isDark
                      ? "bg-indigo-600 text-white shadow-xs"
                      : "bg-white text-indigo-700 shadow-xs border border-slate-200"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Full Specs</span>
              </button>
            </div>

            {/* Full Screen Mode Toggle */}
            <motion.button
              type="button"
              id="fullscreen-toggle-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleFullScreen}
              aria-keyshortcuts="F"
              title={
                isFullScreenMode
                  ? "Exit Fullscreen Theater View (Shortcut: F)"
                  : "Enter Fullscreen Theater View - Every Detail Visible (Shortcut: F)"
              }
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs select-none ${
                isFullScreenMode
                  ? "bg-indigo-600 text-white border-indigo-500 shadow-md"
                  : isDark
                  ? "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  : "bg-white hover:bg-slate-50 text-slate-700 border-slate-200"
              }`}
            >
              {isFullScreenMode ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5 text-indigo-200" />
                  <span className="hidden md:inline">Exit Fullscreen</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="hidden md:inline">Fullscreen Mode</span>
                </>
              )}
              <kbd
                className={`hidden md:inline-flex items-center justify-center min-w-[16px] h-[16px] px-1 text-[10px] font-mono font-bold rounded border select-none ${
                  isFullScreenMode
                    ? "bg-white/25 text-white border-white/30"
                    : isDark
                    ? "bg-slate-700 text-slate-300 border-slate-600"
                    : "bg-slate-100 text-slate-600 border-slate-300"
                }`}
              >
                F
              </kbd>
            </motion.button>

            {/* Sort By Dropdown with Animated Visual Indicator & Icon Transition */}
            <div
              id="marketplace-sort-container"
              className={`flex items-center gap-1.5 ml-1 px-2.5 py-1 rounded-xl border transition-all select-none ${
                sortBy === "smart_sort"
                  ? isDark
                    ? "bg-purple-950/70 border-purple-500/50 shadow-xs ring-1 ring-purple-500/30"
                    : "bg-purple-50/90 border-purple-300 shadow-xs ring-1 ring-purple-200"
                  : sortBy !== "newest"
                  ? isDark
                    ? "bg-indigo-950/70 border-indigo-500/50 shadow-xs ring-1 ring-indigo-500/30"
                    : "bg-indigo-50/90 border-indigo-300 shadow-xs ring-1 ring-indigo-200"
                  : isDark
                  ? "bg-slate-900/80 border-slate-700"
                  : "bg-slate-50 border-slate-200"
              }`}
            >
              {/* Dynamic Icon Transition signaling active sort state */}
              <div className="relative flex items-center justify-center w-4 h-4 shrink-0">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={sortBy}
                    initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.4, rotate: 30, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                    className="flex items-center justify-center"
                  >
                    {sortBy === "smart_sort" && (
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 fill-purple-400/30" />
                    )}
                    {sortBy === "newest" && (
                      <Clock className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-500"}`} />
                    )}
                    {sortBy === "views_desc" && (
                      <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />
                    )}
                    {sortBy === "price_asc" && (
                      <ArrowUpNarrowWide className="w-3.5 h-3.5 text-emerald-500" />
                    )}
                    {sortBy === "price_desc" && (
                      <ArrowDownWideNarrow className="w-3.5 h-3.5 text-blue-500" />
                    )}
                    {sortBy === "ai_score" && (
                      <Sparkles className="w-3.5 h-3.5 text-purple-500" />
                    )}
                  </motion.div>
                </AnimatePresence>

                {/* Steady indicator when a non-default sorting state is active */}
                {sortBy !== "newest" && (
                  <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className={`inline-flex rounded-full h-2 w-2 ${
                      sortBy === "smart_sort" ? "bg-purple-500" : "bg-indigo-500"
                    }`}></span>
                  </span>
                )}
              </div>

              <span
                className={`text-xs font-bold hidden sm:inline ${
                  sortBy === "smart_sort"
                    ? isDark
                      ? "text-purple-300"
                      : "text-purple-700"
                    : sortBy !== "newest"
                    ? isDark
                      ? "text-indigo-300"
                      : "text-indigo-700"
                    : isDark
                    ? "text-slate-400"
                    : "text-slate-500"
                }`}
              >
                Sort:
              </span>

              <select
                id="marketplace-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort listings"
                className={`bg-transparent text-xs font-bold focus:outline-none cursor-pointer pr-1 ${
                  sortBy === "smart_sort"
                    ? isDark
                      ? "text-purple-200"
                      : "text-purple-900"
                    : sortBy !== "newest"
                    ? isDark
                      ? "text-indigo-200"
                      : "text-indigo-900"
                    : isDark
                    ? "text-slate-200"
                    : "text-slate-800"
                }`}
              >
                <option value="smart_sort" className={isDark ? "bg-slate-900 text-purple-300 font-bold" : "bg-white text-purple-700 font-bold"}>
                  ✨ Smart Sort (Recency + AI + Trust)
                </option>
                <option value="newest" className={isDark ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>
                  Recently Listed
                </option>
                <option value="views_desc" className={isDark ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>
                  🔥 Most Popular (Views)
                </option>
                <option value="price_asc" className={isDark ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>
                  Price: Low to High
                </option>
                <option value="price_desc" className={isDark ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>
                  Price: High to Low
                </option>
                <option value="ai_score" className={isDark ? "bg-slate-900 text-slate-200" : "bg-white text-slate-800"}>
                  AI Inspection Score
                </option>
              </select>

              {/* Quick Reset Button when an active sort filter is selected */}
              {sortBy !== "smart_sort" && (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => setSortBy("smart_sort")}
                  title="Switch to Smart Sort"
                  className={`p-0.5 rounded-full cursor-pointer transition-colors ${
                    isDark
                      ? "hover:bg-purple-900/80 text-purple-300"
                      : "hover:bg-purple-200 text-purple-700"
                  }`}
                >
                  <X className="w-3 h-3" />
                </motion.button>
              )}
            </div>
          </div>
        </HorizontalSlider>
      </div>

        {/* Dedicated "Your Chats" Section */}
        {storedChats.length > 0 && (
          <YourChatsSection
            chats={storedChats}
            allListings={listings}
            onOpenChat={handleOpenChat}
            onOpenDetails={(item) => {
              handleOpenDetails(item);
            }}
            onOpenCalendar={handleOpenCalendar}
            onOpenFullModal={() => setIsYourChatsModalOpen(true)}
          />
        )}

        {/* Campus Marketplace Items Section */}
        <section
          id="campus-marketplace-items-section"
          className={`p-6 sm:p-8 rounded-3xl border-2 transition-colors ${
            isDark
              ? "bg-slate-950/80 border-slate-800/90 shadow-2xl"
              : "bg-white border-slate-200/90 shadow-sm"
          }`}
        >
          {/* Full Screen Notice Banner */}
          {isFullScreenMode && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-6 p-3 px-4 rounded-2xl border flex items-center justify-between shadow-lg ${
                isDark
                  ? "bg-indigo-950/70 border-indigo-500/40 text-indigo-200"
                  : "bg-indigo-50 border-indigo-200 text-indigo-900"
              }`}
            >
              <div className="flex items-center gap-2 text-xs font-semibold">
                <Maximize2 className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>
                  <strong>Theater Mode Active:</strong> Wide multi-column inspection view with AI scores, condition metrics, swap conditions, and seller credentials visible simultaneously.
                </span>
              </div>
              <button
                type="button"
                onClick={toggleFullScreen}
                className="px-3 py-1 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-sm transition-colors flex items-center gap-1.5 shrink-0 ml-3"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen</span>
              </button>
            </motion.div>
          )}

          {/* Listings Header & Count */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-6">
            <div className="flex flex-wrap items-center gap-2">
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

              {includeSoldItems && (
                <span
                  id="header-history-badge"
                  className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 animate-in fade-in"
                >
                  <Archive className="w-3 h-3 text-emerald-400" />
                  <span>Transaction History Included</span>
                </span>
              )}

              {sortBy === "smart_sort" && (
                <span
                  id="header-smart-sort-badge"
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 animate-in fade-in ${
                    isDark
                      ? "bg-purple-950/60 text-purple-300 border-purple-500/40"
                      : "bg-purple-50 text-purple-800 border-purple-200"
                  }`}
                  title="Smart Sort: Ranking by Recency, AI Inspection Score, and Seller Trust Rating"
                >
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  <span>Smart Ranked (AI + Trust + Recency)</span>
                </span>
              )}

              {recentlyViewed.length > 0 && (
                <span
                  id="header-recently-viewed-badge"
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1.5 animate-in fade-in ${
                    isDark
                      ? "bg-indigo-950/60 text-indigo-300 border-indigo-500/40"
                      : "bg-indigo-50 text-indigo-800 border-indigo-200"
                  }`}
                  title={`${recentlyViewed.length} recently viewed items tracked`}
                >
                  <History className="w-3 h-3 text-indigo-400" />
                  <span>{recentlyViewed.length} Recently Viewed</span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                {layoutMode === "detailed" || isFullScreenMode
                  ? "Displaying comprehensive full-screen specs for all items"
                  : "Click 'Quick Specs' or switch to 'Full Specs' to inspect every detail"}
              </span>
            </div>
          </div>

          {/* 'Recently Viewed' Section in the marketplace header */}
          <RecentlyViewedSection
            recentlyViewed={recentlyViewed}
            onOpenDetails={handleOpenDetails}
            onClearHistory={handleClearRecentlyViewed}
            onRemoveItem={handleRemoveRecentlyViewedItem}
            isDark={isDark}
          />

          {/* Listings Grid */}
          {isLoadingListings ? (
            <ListingGridSkeleton
              count={8}
              layoutMode={layoutMode}
            />
          ) : filteredListings.length > 0 ? (
            <div
              className={
                  layoutMode === "detailed"
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-6"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-4 gap-5 sm:gap-6"
                }
              >
                    {filteredListings.map((listing, index) => (
                      <motion.div
                        key={listing.id}
                        layout
                        transition={{
                          layout: {
                            type: "spring",
                            stiffness: 350,
                            damping: 30,
                          },
                        }}
                        className="h-full flex flex-col"
                      >
                        <ListingCard
                          index={index}
                          listing={listing}
                          allListings={listings}
                          isWishlisted={wishlistIds.includes(listing.id)}
                          onToggleWishlist={handleToggleWishlist}
                          onOpenDetails={(item) => {
                            handleOpenDetails(item);
                          }}
                          onOpenLightbox={(item) => {
                            setLightboxListing(item);
                          }}
                          onOpenChat={handleOpenChat}
                          onOpenCalendar={handleOpenCalendar}
                          onShowToast={showToast}
                          onOpenPassport={(item) => {
                            setPassportListing(item);
                            setIsPassportModalOpen(true);
                          }}
                          onOpenBarter={(item) => {
                            setBarterListing(item);
                            setIsBarterDrawerOpen(true);
                          }}
                          isOnline={isOnline}
                          layoutMode={layoutMode}
                          isFullScreen={isFullScreenMode}
                          onTagClick={(tag) => setSearchQuery(tag)}
                        />
                      </motion.div>
                    ))}
              </div>
            ) : (
                <motion.div
                  key="empty-state"
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className={`text-center py-16 p-8 rounded-2xl border shadow-xs space-y-4 ${
                    isDark ? "bg-slate-800/90 border-slate-700/80" : "bg-slate-50 border-slate-200/90"
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
        </section>
      </main>

      {/* Footer with Mentorship & PBL Credits (Full Width) */}
      <footer
        className={`mt-16 border-t-2 py-10 px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-12 text-xs transition-colors duration-200 ${
          isDark
            ? "bg-[#060911] border-slate-800/90 text-slate-400 shadow-2xl"
            : "bg-slate-900 border-slate-800 text-slate-300 shadow-inner"
        }`}
      >
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <div className="font-bold text-sm text-white">
              PVG's COET Campus Resale & Exchange Platform
            </div>
            <p className={isDark ? "text-slate-400" : "text-slate-300"}>
              Official Student-to-Student Resale & Exchange • Pune Campus
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeSelector variant="segmented" />
            <button
              onClick={() => setIsAIInspectorOpen(true)}
              className="px-3 py-1.5 rounded-lg border border-indigo-500/40 bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 font-semibold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Gemini 3.8 Flash
            </button>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <ListingDetailModal
        listing={selectedListing ? (listings.find((l) => l.id === selectedListing.id) || selectedListing) : null}
        allListings={listings}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setTimeout(() => setSelectedListing(null), 300);
        }}
        onOpenChat={handleOpenChat}
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
        onOpenPassport={(item) => {
          setPassportListing(item);
          setIsPassportModalOpen(true);
        }}
        onOpenBarter={(item) => {
          setBarterListing(item);
          setIsBarterDrawerOpen(true);
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
          handleOpenDetails(item);
        }}
        onOpenLightbox={(item) => {
          setLightboxListing(item);
        }}
        onOpenChat={handleOpenChat}
        onOpenCalendar={handleOpenCalendar}
        isOnline={isOnline}
      />

      {/* Dedicated Your Chats Modal */}
      <YourChatsModal
        isOpen={isYourChatsModalOpen}
        onClose={() => setIsYourChatsModalOpen(false)}
        chats={storedChats}
        allListings={listings}
        onOpenChat={handleOpenChat}
        onOpenDetails={(item) => {
          handleOpenDetails(item);
        }}
        onOpenCalendar={(item, otherPartyName, otherPartyEmail) => {
          setCalendarTargetListing(item);
          setCalendarOtherParty({
            name: otherPartyName || item.sellerName || "Campus Seller",
            email: otherPartyEmail || item.sellerEmail || "",
          });
          setIsCalendarModalOpen(true);
        }}
        onDeleteChat={(conversationId) => {
          deleteStoredChat(conversationId);
          showToast("Chat thread removed from Your Chats");
        }}
        onClearAllChats={() => {
          clearAllStoredChats();
          showToast("All chats cleared from Your Chats");
        }}
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
            setTimeout(() => setCalendarTargetListing(null), 300);
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
          handleOpenDetails(item);
        }}
      />

      {/* On-Screen Toast Notification for Matched Listing Alert */}
      <AlertToastNotification
        matchEvent={currentAlertToast}
        onDismiss={() => setCurrentAlertToast(null)}
        onViewListing={(item) => {
          handleOpenDetails(item);
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
          handleOpenDetails(item);
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

      {/* Barter Flow Split Comparison Drawer */}
      <BarterComparisonDrawer
        isOpen={isBarterDrawerOpen}
        onClose={() => {
          setIsBarterDrawerOpen(false);
          setBarterListing(null);
        }}
        listing={barterListing}
        userListings={listings.filter((l) => l.sellerEmail === currentUser?.email || l.sellerName.includes("Ayush") || l.sellerName.includes("Priya"))}
        onSendBarterProposal={(listing, proposalText) => {
          showToast(`🤝 Barter proposal sent to ${listing.sellerName}! Direct message thread initialized.`);
          setChatListing(listing);
          setChatInitialMessage(
            `Hi ${listing.sellerName}! I submitted a barter proposal for your "${listing.title}": ${proposalText}`
          );
          setIsChatOpen(true);
        }}
      />

      {/* Verified Student Digital ID Passport Modal */}
      <StudentPassportModal
        isOpen={isPassportModalOpen}
        onClose={() => {
          setIsPassportModalOpen(false);
          setPassportListing(null);
        }}
        sellerListing={passportListing}
        allListings={listings}
        onOpenChat={(item) => {
          if (!isOnline) {
            showToast("⚠️ Chat is disabled while offline to prevent data loss.");
            return;
          }
          setChatListing(item);
          setIsChatOpen(true);
        }}
        onShowToast={showToast}
      />

      {/* College Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl shadow-2xl border border-slate-700 bg-slate-900">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <CollegeLoginPage
              onGoogleSignIn={async () => {
                await handleLogin();
                setIsLoginModalOpen(false);
              }}
              onDemoCollegeSignIn={async (email, name) => {
                await handleDemoCollegeLogin(email, name);
                setIsLoginModalOpen(false);
              }}
              authErrorMessage={authErrorMessage}
              onClearError={() => setAuthErrorMessage(null)}
              onBackToLanding={() => setIsLoginModalOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
