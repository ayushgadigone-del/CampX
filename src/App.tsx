import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  getInitialRestoredUser,
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
import { CurrentlyNegotiatingSection } from "./components/CurrentlyNegotiatingSection";
import { SectionNavigationTabs, SectionTabId } from "./components/SectionNavigationTabs";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { TopperVaultSection } from "./components/TopperVaultSection";
import { BeaconHandoversSection } from "./components/BeaconHandoversSection";
import { SavedSection } from "./components/SavedSection";
import { triggerHaptic } from "./utils/haptics";
import {
  getStoredChats,
  deleteStoredChat,
  clearAllStoredChats,
  recordChatMessage,
  CHATS_UPDATED_EVENT,
} from "./utils/chatStorage";
import { TopperNotesModal } from "./components/TopperNotesModal";
import { GoogleDriveModal } from "./components/GoogleDriveModal";
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
import { BarterComparisonDrawer } from "./components/BarterComparisonDrawer";
import { CampusSecurityCenterModal } from "./components/CampusSecurityCenterModal";
import { RecentlyViewedSection } from "./components/RecentlyViewedSection";
import { HorizontalSlider } from "./components/HorizontalSlider";
import { calculateSmartSortScore } from "./utils/smartSort";
import { StudentProfileModal } from "./components/StudentProfileModal";
import { LoginProfilePayload } from "./components/CollegeLoginPage";
import {
  StudentProfileDetails,
  isStudentProfileComplete,
  loadLocalStudentProfile,
  fetchFirestoreStudentProfile,
  persistStudentProfile,
} from "./utils/studentProfile";

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

  // Auth & Student Profile state (synchronously initialized from localStorage for zero initial flash)
  const [currentUser, setCurrentUser] = useState<User | null>(() => getInitialRestoredUser());
  const [studentProfile, setStudentProfile] = useState<StudentProfileDetails | null>(() => {
    const restored = getInitialRestoredUser();
    if (!restored?.email) return null;
    return loadLocalStudentProfile(restored.uid, restored.email);
  });
  const [profileModalMode, setProfileModalMode] = useState<"onboarding" | "edit" | null>(() => {
    const restored = getInitialRestoredUser();
    if (!restored?.email) return null;
    const local = loadLocalStudentProfile(restored.uid, restored.email);
    return isStudentProfileComplete(local) ? null : "onboarding";
  });
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState<string | null>(null);

  // Listings state (automatically purges any expired items on load; never flashes skeleton over existing catalog)
  const [listings, setListings] = useState<Listing[]>(() => purgeExpiredListings(INITIAL_SEED_LISTINGS).activeListings);
  const [isLoadingListings, setIsLoadingListings] = useState(false);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ItemCategory | "All">("All");
  const [selectedType, setSelectedType] = useState<ListingType | "all">("all");
  const [selectedCondition, setSelectedCondition] = useState<ItemCondition | "all">("all");
  const [includeSoldItems, setIncludeSoldItems] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<"smart_sort" | "newest" | "views_desc" | "price_asc" | "price_desc" | "ai_score">("smart_sort");
  const [layoutMode, setLayoutMode] = useState<"grid" | "detailed">("grid");
  const [isFullScreenMode, setIsFullScreenMode] = useState<boolean>(false);

  // Section Navigation Tab State (Marketplace, Topper Vault, Beacon & Handovers, Chats, Saved)
  const [activeSectionTab, setActiveSectionTab] = useState<SectionTabId>("marketplace");

  // Performance Optimization: Mobile-optimized pagination to eliminate scroll lag
  const [visibleListingsCount, setVisibleListingsCount] = useState<number>(12);
  const [showScrollTop, setShowScrollTop] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = () => {
      const next = window.scrollY > 400;
      setShowScrollTop((prev) => (prev === next ? prev : next));
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Reset pagination when search / filter changes
  useEffect(() => {
    setVisibleListingsCount(12);
  }, [searchQuery, selectedCategory, selectedType, selectedCondition, sortBy, includeSoldItems]);

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
  const [isSecurityCenterOpen, setIsSecurityCenterOpen] = useState(false);

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
  const [bundleOnlyFilter, setBundleOnlyFilter] = useState(false);
  const [myListingsOnlyFilter, setMyListingsOnlyFilter] = useState(false);

  // Success Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = React.useRef<number | null>(null);
  const hasHandledUrlParamsRef = React.useRef<boolean>(false);
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 4500);
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
  const [authGateView, setAuthGateView] = useState<"landing" | "login">("landing");
  const [isTopperNotesModalOpen, setIsTopperNotesModalOpen] = useState(false);
  const [isGoogleDriveModalOpen, setIsGoogleDriveModalOpen] = useState(false);
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

  // Barter Comparison State
  const [isBarterDrawerOpen, setIsBarterDrawerOpen] = useState(false);
  const [barterListing, setBarterListing] = useState<Listing | null>(null);

  // Hydrate full student profile from localStorage / Firestore and enforce compulsory onboarding if incomplete
  const hydrateAndVerifyStudentProfile = useCallback(async (user: User) => {
    const email = user.email || "";
    const localProfile = loadLocalStudentProfile(user.uid, email);
    let resolvedProfile: StudentProfileDetails | null = localProfile;

    if (!isStudentProfileComplete(resolvedProfile)) {
      const firestoreProfile = await fetchFirestoreStudentProfile(user.uid);
      if (isStudentProfileComplete(firestoreProfile)) {
        resolvedProfile = firestoreProfile;
      }
    }

    if (resolvedProfile && isStudentProfileComplete(resolvedProfile)) {
      setStudentProfile(resolvedProfile);
      setProfileModalMode((prev) => (prev === "edit" ? "edit" : null));
      setCurrentUser((prev) => {
        const base = prev || user;
        if (
          base.displayName === resolvedProfile!.displayName &&
          base.photoURL === resolvedProfile!.photoURL
        ) {
          return base;
        }
        try {
          return Object.assign(Object.create(Object.getPrototypeOf(base)), base, {
            displayName: resolvedProfile!.displayName,
            photoURL: resolvedProfile!.photoURL,
          }) as User;
        } catch {
          return {
            ...base,
            displayName: resolvedProfile!.displayName,
            photoURL: resolvedProfile!.photoURL,
          } as User;
        }
      });
    } else {
      // Pre-fill any available name parts from OAuth/session, keeping compulsory modal open until all 5 fields are saved
      const nameParts = (user.displayName || "").trim().split(/\s+/).filter(Boolean);
      const prefillFirst = localProfile?.firstName || nameParts[0] || "";
      const prefillSurname = localProfile?.surname || (nameParts.length > 1 ? nameParts.slice(1).join(" ") : "");
      setStudentProfile({
        uid: user.uid,
        email,
        firstName: prefillFirst,
        surname: prefillSurname,
        displayName: user.displayName || "",
        year: localProfile?.year || "",
        branch: localProfile?.branch || "",
        photoURL: localProfile?.photoURL || user.photoURL || "",
        profileCompleted: false,
      });
      setProfileModalMode("onboarding");
    }
  }, []);

  // 1. Initialize Auth (with equality guards to prevent flicker / redundant re-renders)
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user) => {
        // Enforce @pvgcoet.ac.in college domain on re-hydration
        if (user && user.email) {
          if (!isValidCollegeEmail(user.email)) {
            console.warn("Unauthorized domain detected during session re-hydration:", user.email);
            await logout();
            setCurrentUser(null);
            setStudentProfile(null);
            setProfileModalMode(null);
            setAuthErrorMessage(
              `Access Denied: The account (${user.email}) does not end with @${ALLOWED_COLLEGE_DOMAIN}. Anyone with an official college email ending with @${ALLOWED_COLLEGE_DOMAIN} can sign in.`
            );
          } else {
            setCurrentUser((prev) => {
              if (
                prev &&
                prev.uid === user.uid &&
                prev.email === user.email &&
                prev.displayName === user.displayName &&
                prev.photoURL === user.photoURL
              ) {
                return prev;
              }
              return user;
            });
            setAuthErrorMessage((prev) => (prev === null ? prev : null));
            await hydrateAndVerifyStudentProfile(user);
          }
        } else {
          setCurrentUser((prev) => (prev === null ? prev : null));
          setStudentProfile((prev) => (prev === null ? prev : null));
          setProfileModalMode((prev) => (prev === null ? prev : null));
        }
        setIsAuthLoading(false);
      },
      () => {
        setCurrentUser((prev) => (prev === null ? prev : null));
        setStudentProfile((prev) => (prev === null ? prev : null));
        setProfileModalMode((prev) => (prev === null ? prev : null));
        setIsAuthLoading(false);
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [hydrateAndVerifyStudentProfile]);

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
              setListings((prev) =>
                prev.length === activeListings.length &&
                prev.every((item, i) => item.id === activeListings[i].id)
                  ? prev
                  : activeListings
              );
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
            setListings((prev) =>
              prev.length === activeListings.length &&
              JSON.stringify(prev) === JSON.stringify(activeListings)
                ? prev
                : activeListings
            );

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
            const { activeListings } = purgeExpiredListings(INITIAL_SEED_LISTINGS);
            setListings((prev) =>
              prev.length === activeListings.length &&
              prev.every((item, i) => item.id === activeListings[i].id)
                ? prev
                : activeListings
            );
            setIsLoadingListings(false);
          }
        );
      } catch (err) {
        handleFirestoreError(err, OperationType.GET, "listings");
        const { activeListings } = purgeExpiredListings(INITIAL_SEED_LISTINGS);
        setListings((prev) =>
          prev.length === activeListings.length &&
          prev.every((item, i) => item.id === activeListings[i].id)
            ? prev
            : activeListings
        );
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

  // Handle shared listing URL parameter (e.g. ?item=...) or ?notes=... once
  useEffect(() => {
    if (hasHandledUrlParamsRef.current) return;
    try {
      const params = new URLSearchParams(window.location.search);
      const hasNotes = Boolean(params.get("notes"));
      const itemId = params.get("item");
      if (!hasNotes && !itemId) {
        hasHandledUrlParamsRef.current = true;
        return;
      }
      if (hasNotes) {
        setIsTopperNotesModalOpen(true);
      }
      if (!itemId) {
        hasHandledUrlParamsRef.current = true;
        return;
      }
      if (listings.length === 0) return;
      const found = listings.find((l) => l.id === itemId);
      if (found) {
        handleOpenDetails(found);
      }
      hasHandledUrlParamsRef.current = true;
    } catch (err) {
      console.warn("Could not read shared URL params:", err);
      hasHandledUrlParamsRef.current = true;
    }
  }, [listings]);

  const isCurrentUserListing = useCallback(
    (item: Listing) => {
      if (!currentUser) return false;
      if (currentUser.uid && item.sellerId === currentUser.uid) return true;
      if (
        currentUser.email &&
        item.sellerEmail &&
        currentUser.email.toLowerCase() === item.sellerEmail.toLowerCase()
      ) {
        return true;
      }
      return false;
    },
    [currentUser]
  );

  // Filter & Sort Logic
  const filteredListings = useMemo(() => {
    return listings
      .filter((item) => {
        // Sold items filter: By default hide completed listings to keep marketplace clean,
        // unless 'Include Sold Items' or 'My listings' toggle is active.
        if (!includeSoldItems && !myListingsOnlyFilter && item.status === "completed") {
          return false;
        }

        // My listings filter (Seller management view)
        if (myListingsOnlyFilter && !isCurrentUserListing(item)) {
          return false;
        }

        // Semester-End Bundle Packs filter
        if (bundleOnlyFilter && !item.isBundle) {
          return false;
        }

        // Wishlist only filter
        if (wishlistOnlyFilter && !wishlistIds.includes(item.id)) {
          return false;
        }

        // Search query (also searches included bundle items)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchDesc = item.description?.toLowerCase().includes(q);
          const matchCat = item.category.toLowerCase().includes(q);
          const matchSeller = item.sellerName.toLowerCase().includes(q);
          const matchTags = item.tags?.some((tag) => tag.toLowerCase().includes(q));
          const matchBundle = item.bundleItems?.some((b) => b.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchCat && !matchSeller && !matchTags && !matchBundle) {
            return false;
          }
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
  }, [
    listings,
    includeSoldItems,
    myListingsOnlyFilter,
    bundleOnlyFilter,
    isCurrentUserListing,
    searchQuery,
    selectedCategory,
    selectedType,
    selectedCondition,
    sortBy,
    wishlistOnlyFilter,
    wishlistIds,
  ]);

  // Performance-optimized pagination slice for smooth rendering without lag
  const displayedListings = useMemo(() => {
    return filteredListings.slice(0, visibleListingsCount);
  }, [filteredListings, visibleListingsCount]);

  const soldItemsCount = useMemo(() => {
    return listings.filter((item) => item.status === "completed").length;
  }, [listings]);

  const bundlePacksCount = useMemo(() => {
    return listings.filter((item) => item.isBundle && item.status !== "completed").length;
  }, [listings]);

  const myListingsCount = useMemo(() => {
    return listings.filter((item) => isCurrentUserListing(item)).length;
  }, [listings, isCurrentUserListing]);

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
  const handleLogin = async (): Promise<boolean> => {
    setAuthErrorMessage(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        const userEmail = res.user.email;
        if (!isValidCollegeEmail(userEmail)) {
          // Immediately reject and log out
          await logout();
          setCurrentUser(null);
          setStudentProfile(null);
          setProfileModalMode(null);
          setAuthErrorMessage(
            `Access Denied: The Google account (${userEmail || "unknown"}) does not end with @${ALLOWED_COLLEGE_DOMAIN}. Anyone with an email ending with @${ALLOWED_COLLEGE_DOMAIN} can sign in.`
          );
          return false;
        }

        setCurrentUser(res.user);
        setAuthErrorMessage(null);
        await hydrateAndVerifyStudentProfile(res.user);
        showToast(`Welcome, ${res.user.displayName || "Student"}! College account verified (@${ALLOWED_COLLEGE_DOMAIN}).`);
        return true;
      } else {
        showToast("Google sign-in popup was closed. Please try again or use direct college ID verification.");
        return false;
      }
    } catch (err: any) {
      if (err?.code !== "auth/popup-closed-by-user" && err?.code !== "auth/cancelled-popup-request") {
        console.warn("Login notice:", err?.message || err);
        setAuthErrorMessage(err?.message || "Google Sign-In could not complete. Please use Direct College ID verification.");
      }
      return false;
    }
  };

  const handleDemoCollegeLogin = async (
    customEmail: string = "ayush.gadigone@pvgcoet.ac.in",
    displayName?: string,
    profileData?: LoginProfilePayload
  ): Promise<boolean> => {
    setAuthErrorMessage(null);
    const cleanEmail = customEmail.trim().toLowerCase();
    if (!isValidCollegeEmail(cleanEmail)) {
      setAuthErrorMessage(
        `Invalid Email Domain: Only accounts ending with @${ALLOWED_COLLEGE_DOMAIN} can sign in.`
      );
      return false;
    }

    try {
      const res = await demoStudentSignIn(
        cleanEmail,
        displayName,
        profileData ? { ...profileData, profileCompleted: true } : undefined
      );
      if (res?.user) {
        setCurrentUser(res.user);
        setAuthErrorMessage(null);

        if (profileData) {
          const saved = await persistStudentProfile({
            uid: res.user.uid,
            email: cleanEmail,
            firstName: profileData.firstName,
            surname: profileData.surname,
            year: profileData.year,
            branch: profileData.branch,
            photoURL: profileData.photoURL,
          });
          setStudentProfile(saved);
          setProfileModalMode(null);
          setCurrentUser((prev) => {
            const base = prev || res.user;
            if (base.displayName === saved.displayName && base.photoURL === saved.photoURL) {
              return base;
            }
            try {
              return Object.assign(Object.create(Object.getPrototypeOf(base)), base, {
                displayName: saved.displayName,
                photoURL: saved.photoURL,
              }) as User;
            } catch {
              return {
                ...base,
                displayName: saved.displayName,
                photoURL: saved.photoURL,
              } as User;
            }
          });
          showToast(`Welcome, ${saved.displayName}! Profile verified and saved.`);
        } else {
          await hydrateAndVerifyStudentProfile(res.user);
          showToast(`Welcome, ${res.user.displayName || "Student"}! College account verified.`);
        }
        return true;
      }
      return false;
    } catch (err: any) {
      console.warn("College login notice:", err);
      setAuthErrorMessage(err?.message || "Failed to log in with college account.");
      return false;
    }
  };

  const handleLogout = async () => {
    await logout();
    setCurrentUser(null);
    setStudentProfile(null);
    setProfileModalMode(null);
    setAuthErrorMessage(null);
    setAuthGateView("landing");
    showToast("Signed out successfully.");
  };

  const handleStudentProfileSaved = (saved: StudentProfileDetails) => {
    setStudentProfile(saved);
    const wasOnboarding = profileModalMode === "onboarding";
    setProfileModalMode(null);
    setCurrentUser((prev) => {
      if (!prev) return prev;
      try {
        return Object.assign(Object.create(Object.getPrototypeOf(prev)), prev, {
          displayName: saved.displayName,
          photoURL: saved.photoURL,
        }) as User;
      } catch {
        return {
          ...prev,
          displayName: saved.displayName,
          photoURL: saved.photoURL,
        } as User;
      }
    });
    showToast(
      wasOnboarding
        ? `Welcome, ${saved.displayName}! Your student profile is complete.`
        : "Student details updated successfully."
    );
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
        : `${kw} (Campus Listing)`,
      description: `Student equipment matching alert "${kw}". Tested for semester examinations and campus labs.`,
      category: categoryForSimulation,
      condition: "Like New",
      listingType: "sell",
      price: priceForSimulation,
      imageUrl: sampleImages[categoryForSimulation] || sampleImages["Other"],
      sellerId: "student-seller-sim",
      sellerName: "Aryan Sharma (Mech 3rd Yr)",
      sellerEmail: "aryan.sharma@pvgcoet.ac.in",
      department: "Mechanical Engineering",
      year: "3rd Year",
      status: "available",
      locationPreference: "Central Library Lawn",
      tags: [kw.toLowerCase(), "campus", "exam ready"],
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
    const updatedStock = newStatus === "completed" ? 0 : 1;
    setListings((prev) =>
      prev.map((item) =>
        item.id === listingId
          ? { ...item, status: newStatus, availableStock: updatedStock }
          : item
      )
    );
    if (selectedListing && selectedListing.id === listingId) {
      setSelectedListing((prev) =>
        prev ? { ...prev, status: newStatus, availableStock: updatedStock } : null
      );
    }
    try {
      const docRef = doc(db, "listings", listingId);
      await updateDoc(docRef, { status: newStatus, availableStock: updatedStock });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `listings/${listingId}`);
    }
    const label =
      newStatus === "completed"
        ? "Sold"
        : newStatus === "reserved"
        ? "Reserved"
        : "Available";
    showToast(`Listing marked as ${label}.`);
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

  // Global Terminal Keyboard Shortcuts (Style 1 ergonomics with mobile haptic feedback)
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

      // Safe haptic feedback trigger using Web Vibration API
      const vibrate = (pattern: number | number[]) => {
        try {
          if (typeof navigator !== "undefined" && "vibrate" in navigator && typeof navigator.vibrate === "function") {
            navigator.vibrate(pattern);
          }
        } catch {
          // Benign ignore if permission denied or unsupported
        }
      };

      // Instant Section Tab Switching via Keys 1 - 5
      if (e.key === "1" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(15);
        setActiveSectionTab("marketplace");
        window.scrollTo(0, 0);
      } else if (e.key === "2" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(15);
        setActiveSectionTab("topper_vault");
        window.scrollTo(0, 0);
      } else if (e.key === "3" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(15);
        setActiveSectionTab("beacon_handovers");
        window.scrollTo(0, 0);
      } else if (e.key === "4" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(15);
        setActiveSectionTab("chats");
        window.scrollTo(0, 0);
      } else if (e.key === "5" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(15);
        setActiveSectionTab("saved");
        window.scrollTo(0, 0);
      } else if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(15);
        setActiveSectionTab("marketplace");
        const searchInput = document.getElementById(
          "dedicated-search-bar-input"
        ) as HTMLInputElement | null;
        searchInput?.focus();
      } else if ((e.key === "p" || e.key === "P") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(30);
        if (isOnline) {
          setPrefilledInspection(null);
          setPrefilledImage(null);
          setIsCreateModalOpen(true);
        } else {
          showToast("⚠️ Offline: Creating listings is disabled.");
        }
      } else if ((e.key === "n" || e.key === "N") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(22);
        setIsTopperNotesModalOpen(true);
      } else if ((e.key === "w" || e.key === "W") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(20);
        setIsWishlistModalOpen(true);
      } else if ((e.key === "c" || e.key === "C") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(20);
        setIsYourChatsModalOpen(true);
      } else if ((e.key === "m" || e.key === "M") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(20);
        toggleTheme();
      } else if ((e.key === "f" || e.key === "F") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(18);
        toggleFullScreen();
      } else if ((e.key === "i" || e.key === "I") && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        vibrate(25);
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
        <p className="text-xs text-slate-400 font-semibold tracking-wider uppercase">
          Verifying College Identity...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated Entry Flow: App Explanation Landing Page -> College Login Page
  if (!currentUser) {
    if (authGateView === "login") {
      return (
        <CollegeLoginPage
          onGoogleSignIn={async () => {
            await handleLogin();
          }}
          onDemoCollegeSignIn={async (email, name, profileData) => {
            await handleDemoCollegeLogin(email, name, profileData);
          }}
          authErrorMessage={authErrorMessage}
          onClearError={() => setAuthErrorMessage(null)}
          onBackToLanding={() => {
            setAuthErrorMessage(null);
            setAuthGateView("landing");
          }}
        />
      );
    }

    return (
      <LandingPage
        onProceedToSignIn={() => {
          setAuthErrorMessage(null);
          setAuthGateView("login");
        }}
      />
    );
  }

  // Optional Full Landing Page View (can be opened via footer About App button when signed in)
  if (showLandingPage) {
    return (
      <LandingPage
        onProceedToSignIn={() => {
          setShowLandingPage(false);
        }}
      />
    );
  }

  return (
    <div
      className={`min-h-screen flex flex-col font-sans antialiased relative overflow-x-clip ${
        isDark
          ? "bg-[#0D1110] text-[#ECF2EF] selection:bg-[#387262] selection:text-white"
          : "bg-[#F7F9F8] text-[#18201C] selection:bg-[#2F5D50] selection:text-white"
      }`}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50">
          <div className="px-4 py-2.5 rounded-lg bg-[#18201C] dark:bg-[#141A18] text-white text-xs font-medium shadow-lg border border-[#242E2A] flex items-center gap-2 max-w-md">
            <CheckCircle2 className="w-4 h-4 text-[#5BA18C] shrink-0" />
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
        onOpenHandovers={() => {
          triggerHaptic("medium");
          setActiveSectionTab("beacon_handovers");
          window.scrollTo(0, 0);
        }}
        onOpenTopperNotes={() => {
          triggerHaptic("medium");
          setActiveSectionTab("topper_vault");
          window.scrollTo(0, 0);
        }}
        onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
        upcomingHandoversCount={upcomingHandoversCount}
        wishlistCount={wishlistIds.length}
        onOpenWishlist={() => {
          triggerHaptic("medium");
          setActiveSectionTab("saved");
          window.scrollTo(0, 0);
        }}
        chatsCount={storedChats.length}
        onOpenYourChats={() => {
          triggerHaptic("medium");
          setActiveSectionTab("chats");
          window.scrollTo(0, 0);
        }}
        alertsCount={alerts.filter((a) => a.active).length}
        onOpenAlerts={() => {
          triggerHaptic("medium");
          setActiveSectionTab("saved");
          window.scrollTo(0, 0);
        }}
        onOpenSecurity={() => {
          triggerHaptic("medium");
          setIsSecurityCenterOpen(true);
        }}
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulateOffline={toggleSimulateOffline}
        onShowToast={showToast}
        studentProfile={studentProfile}
        onEditProfileDetails={() => setProfileModalMode("edit")}
      />

      {/* Offline Status Banner */}
      <OfflineBanner
        isOnline={isOnline}
        isSimulatedOffline={isSimulatedOffline}
        onToggleSimulateOffline={toggleSimulateOffline}
        onRetry={reconnect}
      />

      {/* Engineering Bento Terminal Hero (Style 1 - visible on Marketplace tab) */}
      {activeSectionTab === "marketplace" && (
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
          onOpenTopperNotes={() => {
            triggerHaptic("medium");
            setActiveSectionTab("topper_vault");
            window.scrollTo(0, 0);
          }}
          onOpenWishlist={() => {
            triggerHaptic("medium");
            setActiveSectionTab("saved");
            window.scrollTo(0, 0);
          }}
          onOpenYourChats={() => {
            triggerHaptic("medium");
            setActiveSectionTab("chats");
            window.scrollTo(0, 0);
          }}
          onFocusSearch={() => {
            const input = document.getElementById("dedicated-search-bar-input") as HTMLInputElement | null;
            input?.focus();
          }}
          onOpenAlerts={() => {
            triggerHaptic("medium");
            setActiveSectionTab("saved");
            window.scrollTo(0, 0);
          }}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          selectedCategory={selectedCategory}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-24 md:pb-14">
        {/* Section Navigation Tabs (Marketplace, Topper Vault, Beacon & Handovers, Chats, Saved & Alerts) */}
        <SectionNavigationTabs
          activeTab={activeSectionTab}
          onTabChange={(tab) => {
            setActiveSectionTab(tab);
            window.scrollTo(0, 0);
          }}
          listingsCount={filteredListings.length}
          topperNotesCount={topperNotes.length}
          chatsCount={storedChats.length}
          wishlistCount={wishlistIds.length}
          alertsCount={alerts.filter((a) => a.active).length}
          upcomingHandoversCount={upcomingHandoversCount}
          onOpenCreateModal={() => {
            if (!currentUser) {
              setIsLoginModalOpen(true);
              return;
            }
            if (!isOnline) {
              showToast("⚠️ Offline: Creating listings is disabled.");
              return;
            }
            setPrefilledInspection(null);
            setPrefilledImage(null);
            setIsCreateModalOpen(true);
          }}
        />

        {/* TAB 1: MARKETPLACE FEED */}
        {activeSectionTab === "marketplace" && (
          <div id="tab-panel-marketplace" role="tabpanel" className="space-y-6">
            {/* Dedicated Search Bar Section with History & Quick Tags */}
            <DedicatedSearchBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          totalResultsCount={filteredListings.length}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => setSelectedCategory(cat)}
          categoryStockCounts={categoryStockCounts}
        />

        {/* Secondary Filter & Sorting Controls */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 py-3 border-y text-xs ${
            isDark
              ? "border-[#242E2A] text-[#ECF2EF]"
              : "border-[#DFE6E2] text-[#18201C]"
          }`}
        >
          <div className="flex flex-wrap items-center gap-2">
            {/* Listing Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              aria-label="Filter by listing type"
              className={`h-8 px-2.5 rounded-lg border text-xs font-medium focus:outline-none cursor-pointer ${
                isDark
                  ? "border-[#242E2A] bg-[#141A18] text-[#ECF2EF] focus:border-[#5BA18C]"
                  : "border-[#DFE6E2] bg-white text-[#18201C] focus:border-[#2F5D50]"
              }`}
            >
              <option value="all">All types</option>
              <option value="sell">For sale</option>
              <option value="exchange">For exchange</option>
            </select>

            {/* Condition Filter */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value as any)}
              aria-label="Filter by item condition"
              className={`h-8 px-2.5 rounded-lg border text-xs font-medium focus:outline-none cursor-pointer ${
                isDark
                  ? "border-[#242E2A] bg-[#141A18] text-[#ECF2EF] focus:border-[#5BA18C]"
                  : "border-[#DFE6E2] bg-white text-[#18201C] focus:border-[#2F5D50]"
              }`}
            >
              <option value="all">All conditions</option>
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
            </select>

            {/* Semester-End Bundle Packs Toggle */}
            <button
              id="filter-bundle-packs-toggle"
              type="button"
              onClick={() => setBundleOnlyFilter(!bundleOnlyFilter)}
              className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                bundleOnlyFilter
                  ? isDark
                    ? "bg-[#387262] text-white border-[#387262]"
                    : "bg-[#2F5D50] text-white border-[#2F5D50]"
                  : isDark
                  ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A] hover:border-[#34433D] hover:bg-[#1B2320]"
                  : "bg-white text-[#18201C] border-[#DFE6E2] hover:border-[#C4D1CA] hover:bg-[#EFF4F1]"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Bundles ({bundlePacksCount})</span>
            </button>

            {/* My Listings (Seller Management) Toggle */}
            {currentUser && (
              <button
                id="filter-my-listings-toggle"
                type="button"
                onClick={() => setMyListingsOnlyFilter(!myListingsOnlyFilter)}
                className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  myListingsOnlyFilter
                    ? isDark
                      ? "bg-[#387262] text-white border-[#387262]"
                      : "bg-[#2F5D50] text-white border-[#2F5D50]"
                    : isDark
                    ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A] hover:border-[#34433D] hover:bg-[#1B2320]"
                    : "bg-white text-[#18201C] border-[#DFE6E2] hover:border-[#C4D1CA] hover:bg-[#EFF4F1]"
                }`}
              >
                <span>My listings ({myListingsCount})</span>
              </button>
            )}

            {/* Saved Quick Toggle */}
            <button
              id="filter-wishlist-toggle"
              type="button"
              onClick={() => setWishlistOnlyFilter(!wishlistOnlyFilter)}
              className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                wishlistOnlyFilter
                  ? isDark
                    ? "bg-[#387262] text-white border-[#387262]"
                    : "bg-[#2F5D50] text-white border-[#2F5D50]"
                  : isDark
                  ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A] hover:border-[#34433D] hover:bg-[#1B2320]"
                  : "bg-white text-[#18201C] border-[#DFE6E2] hover:border-[#C4D1CA] hover:bg-[#EFF4F1]"
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${wishlistOnlyFilter ? "fill-current" : ""}`} />
              <span>Saved ({wishlistIds.length})</span>
            </button>

            {/* Include Sold Items Toggle */}
            <button
              id="filter-include-sold-toggle"
              type="button"
              onClick={() => setIncludeSoldItems(!includeSoldItems)}
              className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                includeSoldItems
                  ? isDark
                    ? "bg-[#387262] text-white border-[#387262]"
                    : "bg-[#2F5D50] text-white border-[#2F5D50]"
                  : isDark
                  ? "bg-[#141A18] text-[#8FA199] border-[#242E2A] hover:text-[#ECF2EF] hover:border-[#34433D]"
                  : "bg-white text-[#5C6B63] border-[#DFE6E2] hover:text-[#18201C] hover:border-[#C4D1CA]"
              }`}
            >
              <Archive className="w-3.5 h-3.5" />
              <span>Sold ({soldItemsCount})</span>
            </button>

            {/* Notify Me Shortcut */}
            <button
              id="filter-notify-me-btn"
              type="button"
              onClick={() => {
                setPrefilledAlertKeyword(searchQuery);
                setPrefilledAlertCategory(selectedCategory);
                setIsAlertsModalOpen(true);
              }}
              className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? "bg-[#141A18] text-[#ECF2EF] border-[#242E2A] hover:border-[#34433D] hover:bg-[#1B2320]"
                  : "bg-white text-[#18201C] border-[#DFE6E2] hover:border-[#C4D1CA] hover:bg-[#EFF4F1]"
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Alert me</span>
            </button>

            {/* Reset Filters */}
            {(selectedCategory !== "All" ||
              selectedType !== "all" ||
              selectedCondition !== "all" ||
              wishlistOnlyFilter ||
              bundleOnlyFilter ||
              myListingsOnlyFilter ||
              includeSoldItems ||
              searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory("All");
                  setSelectedType("all");
                  setSelectedCondition("all");
                  setWishlistOnlyFilter(false);
                  setBundleOnlyFilter(false);
                  setMyListingsOnlyFilter(false);
                  setIncludeSoldItems(false);
                  setSearchQuery("");
                }}
                className={`h-8 px-2 text-xs font-medium underline underline-offset-4 cursor-pointer ${
                  isDark ? "text-[#7BBFA8] hover:text-[#ECF2EF]" : "text-[#2F5D50] hover:text-[#244A3F]"
                }`}
              >
                Reset
              </button>
            )}
          </div>

          {/* View Mode & Sort */}
          <div className="flex items-center gap-2">
            {/* Layout Switcher */}
            <div
              className={`p-0.5 rounded-lg border flex items-center ${
                isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-[#EFF4F1] border-[#DFE6E2]"
              }`}
              role="group"
              aria-label="Listing card layout mode"
            >
              <button
                type="button"
                id="view-mode-grid-btn"
                onClick={() => setLayoutMode("grid")}
                title="Grid view"
                className={`h-7 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === "grid"
                    ? isDark
                      ? "bg-[#1B2320] text-[#ECF2EF] border border-[#34433D]"
                      : "bg-white text-[#18201C] shadow-2xs"
                    : isDark
                    ? "text-[#8FA199] hover:text-[#ECF2EF]"
                    : "text-[#5C6B63] hover:text-[#18201C]"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grid</span>
              </button>

              <button
                type="button"
                id="view-mode-detailed-btn"
                onClick={() => setLayoutMode("detailed")}
                title="Detailed view"
                className={`h-7 px-2.5 rounded-md text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                  layoutMode === "detailed"
                    ? isDark
                      ? "bg-[#1B2320] text-[#ECF2EF] border border-[#34433D]"
                      : "bg-white text-[#18201C] shadow-2xs"
                    : isDark
                    ? "text-[#8FA199] hover:text-[#ECF2EF]"
                    : "text-[#5C6B63] hover:text-[#18201C]"
                }`}
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Detailed</span>
              </button>
            </div>

            {/* Sort By Dropdown */}
            <div
              id="marketplace-sort-container"
              className={`h-8 px-2.5 rounded-lg border flex items-center gap-1.5 ${
                isDark
                  ? "bg-[#141A18] border-[#242E2A] text-[#ECF2EF]"
                  : "bg-white border-[#DFE6E2] text-[#18201C]"
              }`}
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#5C6B63] dark:text-[#8FA199] shrink-0" />
              <select
                id="marketplace-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                aria-label="Sort listings"
                className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer pr-1"
              >
                <option value="smart_sort" className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}>
                  Recommended
                </option>
                <option value="newest" className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}>
                  Newest first
                </option>
                <option value="views_desc" className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}>
                  Most viewed
                </option>
                <option value="price_asc" className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}>
                  Price: Low to High
                </option>
                <option value="price_desc" className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}>
                  Price: High to Low
                </option>
                <option value="ai_score" className={isDark ? "bg-[#141A18] text-[#ECF2EF]" : "bg-white text-[#18201C]"}>
                  AI inspection score
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Currently Negotiating Section (items where buying talks have already started) */}
        <CurrentlyNegotiatingSection
          chats={storedChats}
          allListings={listings}
          onOpenChat={handleOpenChat}
          onOpenDetails={handleOpenDetails}
          onOpenCalendar={handleOpenCalendar}
          onViewAllChats={() => {
            setActiveSectionTab("chats");
            window.scrollTo(0, 0);
          }}
          isOnline={isOnline}
        />

        {/* Campus Marketplace Items Section */}
        <section id="campus-marketplace-items-section" className="space-y-5">
          {/* Listings Header & Count */}
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <div className="flex flex-wrap items-baseline gap-2.5">
              <h2 className={`text-base font-semibold tracking-tight ${isDark ? "text-[#ECF2EF]" : "text-[#18201C]"}`}>
                {selectedCategory === "All" ? "All listings" : selectedCategory}
              </h2>
              <span className="text-xs font-mono tabular-nums text-[#5C6B63] dark:text-[#8FA199]">
                {filteredListings.length} {filteredListings.length === 1 ? "item" : "items"}
                {includeSoldItems ? " · including sold" : ""}
              </span>
            </div>

            {storedChats.length > 0 && (
              <button
                type="button"
                onClick={() => setActiveSectionTab("chats")}
                className="text-xs font-medium text-[#2F5D50] dark:text-[#7BBFA8] hover:text-[#244A3F] dark:hover:text-[#ECF2EF] flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{storedChats.length} active {storedChats.length === 1 ? "chat" : "chats"}</span>
              </button>
            )}
          </div>

          {/* Recently Viewed Strip (renders only when user has viewed items) */}
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
            <>
              <div
                className={
                  layoutMode === "detailed"
                    ? "grid grid-cols-1 lg:grid-cols-2 gap-5"
                    : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
                }
              >
                {displayedListings.map((listing, index) => (
                  <div
                    key={listing.id}
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
                      onOpenBarter={(item) => {
                        setBarterListing(item);
                        setIsBarterDrawerOpen(true);
                      }}
                      isOnline={isOnline}
                      layoutMode={layoutMode}
                      isFullScreen={isFullScreenMode}
                      onTagClick={(tag) => setSearchQuery(tag)}
                      isOwner={isCurrentUserListing(listing)}
                      onUpdateStatus={handleUpdateStatus}
                    />
                  </div>
                ))}
              </div>

              {/* Load More Pagination Button */}
              {filteredListings.length > visibleListingsCount && (
                <div className="flex items-center justify-center pt-6 pb-2">
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic("light");
                      setVisibleListingsCount((prev) => prev + 12);
                    }}
                    className={`h-9 px-5 rounded-lg font-medium text-xs cursor-pointer flex items-center gap-2 border ${
                      isDark
                        ? "bg-[#141A18] hover:bg-[#1B2320] text-[#ECF2EF] border-[#242E2A] hover:border-[#34433D]"
                        : "bg-white hover:bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2] hover:border-[#C4D1CA]"
                    }`}
                  >
                    <span>Load more</span>
                    <span className="font-mono text-[11px] text-[#5C6B63] dark:text-[#8FA199]">
                      {displayedListings.length}/{filteredListings.length}
                    </span>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div
              key="empty-state"
              className={`text-center py-16 px-6 rounded-xl border space-y-4 ${
                isDark ? "bg-[#141A18] border-[#242E2A]" : "bg-white border-[#DFE6E2]"
              }`}
            >
              <div
                className={`w-11 h-11 mx-auto rounded-lg border flex items-center justify-center ${
                  isDark ? "bg-[#1B2320] border-[#242E2A] text-[#8FA199]" : "bg-[#EFF4F1] border-[#DFE6E2] text-[#5C6B63]"
                }`}
              >
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className={`text-sm font-semibold ${isDark ? "text-[#ECF2EF]" : "text-[#18201C]"}`}>
                  No listings found
                </h3>
                <p className="text-xs text-[#5C6B63] dark:text-[#8FA199] max-w-sm mx-auto mt-1">
                  Try clearing your search or switching categories, or set an alert to be notified when a matching item is posted.
                </p>
              </div>
              <div className="pt-1 flex flex-wrap items-center justify-center gap-2">
                <button
                  id="empty-state-notify-btn"
                  type="button"
                  onClick={() => {
                    setPrefilledAlertKeyword(searchQuery);
                    setPrefilledAlertCategory(selectedCategory);
                    setIsAlertsModalOpen(true);
                  }}
                  className="h-9 px-4 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>
                    Notify me {searchQuery ? `for "${searchQuery}"` : "when listed"}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedType("all");
                    setSelectedCondition("all");
                    setWishlistOnlyFilter(false);
                    setBundleOnlyFilter(false);
                    setMyListingsOnlyFilter(false);
                    setSearchQuery("");
                  }}
                  className={`h-9 px-4 rounded-lg text-xs font-medium border cursor-pointer ${
                    isDark
                      ? "bg-[#141A18] hover:bg-[#1B2320] text-[#ECF2EF] border-[#242E2A]"
                      : "bg-white hover:bg-[#EFF4F1] text-[#18201C] border-[#DFE6E2]"
                  }`}
                >
                  Reset filters
                </button>
              </div>
            </div>
          )}
        </section>
          </div>
        )}

        {/* TAB 2: TOPPER NOTES VAULT */}
        {activeSectionTab === "topper_vault" && (
          <div id="tab-panel-topper_vault" role="tabpanel">
            <TopperVaultSection
              notes={topperNotes}
              onOpenNotesModal={() => setIsTopperNotesModalOpen(true)}
              onOpenGoogleDrive={() => setIsGoogleDriveModalOpen(true)}
              onShowToast={showToast}
              isOnline={isOnline}
            />
          </div>
        )}

        {/* TAB 3: CAMPUS BEACON & HANDOVERS */}
        {activeSectionTab === "beacon_handovers" && (
          <div id="tab-panel-beacon_handovers" role="tabpanel">
            <BeaconHandoversSection
              listings={listings}
              onOpenDetails={handleOpenDetails}
              onOpenCalendar={handleOpenCalendar}
              onSelectItem={(query) => {
                setSearchQuery(query);
                setActiveSectionTab("marketplace");
              }}
              isOnline={isOnline}
            />
          </div>
        )}

        {/* TAB 4: YOUR CHATS */}
        {activeSectionTab === "chats" && (
          <div id="tab-panel-chats" role="tabpanel">
            <YourChatsSection
              chats={storedChats}
              allListings={listings}
              onOpenChat={handleOpenChat}
              onOpenDetails={handleOpenDetails}
              onOpenCalendar={handleOpenCalendar}
              onOpenFullModal={() => setIsYourChatsModalOpen(true)}
            />
          </div>
        )}

        {/* TAB 5: SAVED & ALERTS */}
        {activeSectionTab === "saved" && (
          <div id="tab-panel-saved" role="tabpanel">
            <SavedSection
              wishlistListings={savedWishlistListings}
              allListings={listings}
              wishlistIds={wishlistIds}
              onToggleWishlist={handleToggleWishlist}
              onClearWishlist={handleClearWishlist}
              onOpenDetails={handleOpenDetails}
              onOpenLightbox={(item) => setLightboxListing(item)}
              onOpenChat={handleOpenChat}
              onOpenCalendar={handleOpenCalendar}
              onShowToast={showToast}
              alerts={alerts}
              alertHistory={alertHistory}
              onOpenAlertsModal={() => setIsAlertsModalOpen(true)}
              recentlyViewed={recentlyViewed}
              onClearRecentlyViewed={handleClearRecentlyViewed}
              isOnline={isOnline}
            />
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer
        className={`mt-16 border-t py-8 px-4 sm:px-6 lg:px-8 text-xs ${
          isDark
            ? "bg-[#0D1110] border-[#242E2A] text-[#8FA199]"
            : "bg-white border-[#DFE6E2] text-[#5C6B63]"
        }`}
      >
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-center md:text-left">
            <div className={`font-semibold text-sm ${isDark ? "text-[#ECF2EF]" : "text-[#18201C]"}`}>
              Campus Resale
            </div>
            <p className="mt-0.5 text-[#5C6B63] dark:text-[#8FA199]">
              PVG's COET Student-to-Student Exchange · Pune
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            <ThemeSelector variant="segmented" />
            <button
              type="button"
              onClick={() => setIsAIInspectorOpen(true)}
              className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? "border-[#242E2A] bg-[#141A18] text-[#ECF2EF] hover:border-[#34433D] hover:bg-[#1B2320]"
                  : "border-[#DFE6E2] bg-white text-[#18201C] hover:border-[#C4D1CA] hover:bg-[#EFF4F1]"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Inspector</span>
            </button>
            <button
              type="button"
              onClick={() => setIsSecurityCenterOpen(true)}
              className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? "border-[#242E2A] bg-[#141A18] text-[#ECF2EF] hover:border-[#34433D] hover:bg-[#1B2320]"
                  : "border-[#DFE6E2] bg-white text-[#18201C] hover:border-[#C4D1CA] hover:bg-[#EFF4F1]"
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Campus Safety</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setShowLandingPage(true);
                window.scrollTo(0, 0);
              }}
              className={`h-8 px-3 rounded-lg border text-xs font-medium flex items-center gap-1.5 cursor-pointer ${
                isDark
                  ? "border-[#242E2A] bg-[#141A18] text-[#ECF2EF] hover:border-[#34433D] hover:bg-[#1B2320]"
                  : "border-[#DFE6E2] bg-white text-[#18201C] hover:border-[#C4D1CA] hover:bg-[#EFF4F1]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>About</span>
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
        userBranch={studentProfile?.branch}
        userYear={studentProfile?.year}
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

      {/* Google Drive, Picker & Docs Modal */}
      <GoogleDriveModal
        isOpen={isGoogleDriveModalOpen}
        onClose={() => setIsGoogleDriveModalOpen(false)}
        currentUserEmail={currentUser?.email}
        onShowToast={showToast}
        onSelectDocForTopperVault={(doc) => {
          const newDocNote: TopperNote = {
            id: `note-drive-${Date.now()}`,
            title: doc.title,
            subject: "Google Drive Study Notes",
            branch: "Computer Science",
            semester: "Sem 4",
            author: currentUser?.displayName || "Campus Student",
            authorRank: "Verified Contributor",
            authorCollege: "Government College of Engineering",
            description: `Imported directly from Google Drive: ${doc.fileName}`,
            isFree: true,
            pagesCount: 18,
            readTimeMinutes: 20,
            tags: ["Google Drive", "Study Guide", "Imported"],
            lastUpdated: new Date().toISOString().split("T")[0],
            content: `## 📄 ${doc.title}\n\n**File Name:** ${doc.fileName}\n**Source:** Google Drive\n\n*Click the 'Download Document' button above to access this document offline or in Google Drive.*`,
            chapters: [
              {
                title: "Google Drive Document",
                summary: `Synced with Google Drive file: ${doc.fileName}`,
                keyFormulasOrTips: ["Saved to campus cloud vault for easy revision"],
              },
            ],
            fileUrl: doc.fileUrl,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            uploadedByEmail: currentUser?.email || undefined,
          };
          const updated = [newDocNote, ...topperNotes];
          setTopperNotes(updated);
          saveStoredTopperNotes(updated);
          setIsTopperNotesModalOpen(true);
        }}
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

      {/* Campus Safety Center Modal */}
      <CampusSecurityCenterModal
        isOpen={isSecurityCenterOpen}
        onClose={() => setIsSecurityCenterOpen(false)}
        onShowToast={showToast}
      />

      {/* College Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl shadow-xl border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18]">
            <button
              onClick={() => setIsLoginModalOpen(false)}
              className="absolute top-4 right-4 z-10 w-8 h-8 rounded-lg bg-[#EFF4F1] dark:bg-[#1B2320] text-[#5C6B63] dark:text-[#8FA199] hover:text-[#18201C] dark:hover:text-[#ECF2EF] flex items-center justify-center cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
            <CollegeLoginPage
              onGoogleSignIn={async () => {
                const ok = await handleLogin();
                if (ok) {
                  setIsLoginModalOpen(false);
                }
              }}
              onDemoCollegeSignIn={async (email, name, profileData) => {
                const ok = await handleDemoCollegeLogin(email, name, profileData);
                if (ok) {
                  setIsLoginModalOpen(false);
                }
              }}
              authErrorMessage={authErrorMessage}
              onClearError={() => setAuthErrorMessage(null)}
              onBackToLanding={() => setIsLoginModalOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Compulsory Login Onboarding & Edit Details Profile Modal */}
      {currentUser && profileModalMode && (
        <StudentProfileModal
          isOpen={Boolean(profileModalMode)}
          mode={profileModalMode}
          uid={currentUser.uid}
          email={currentUser.email || ""}
          initialProfile={studentProfile}
          onSave={handleStudentProfileSaved}
          onClose={() => {
            if (profileModalMode === "edit") {
              setProfileModalMode(null);
            }
          }}
          onSwitchAccount={async () => {
            await handleLogout();
            setIsLoginModalOpen(true);
          }}
        />
      )}

      {/* Mobile Bottom Sticky Navigation Bar */}
      <MobileBottomNav
        activeTab={activeSectionTab}
        onTabChange={(tab) => {
          setActiveSectionTab(tab);
        }}
        onOpenCreateModal={() => {
          if (!currentUser) {
            setIsLoginModalOpen(true);
            return;
          }
          if (!isOnline) {
            showToast("⚠️ Offline: Creating listings is disabled.");
            return;
          }
          setPrefilledInspection(null);
          setPrefilledImage(null);
          setIsCreateModalOpen(true);
        }}
        wishlistCount={wishlistIds.length}
        chatsCount={storedChats.length}
        isOnline={isOnline}
      />

      {/* Floating Scroll to Top Action Button */}
      {showScrollTop && (
        <button
          type="button"
          onClick={() => {
            triggerHaptic("light");
            window.scrollTo(0, 0);
          }}
          aria-label="Scroll to top"
          title="Back to Top"
          className="fixed bottom-20 md:bottom-8 right-4 md:right-8 z-30 w-10 h-10 rounded-full bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white shadow-md border border-[#244A3F] dark:border-[#448573] flex items-center justify-center cursor-pointer"
        >
          <ArrowUpNarrowWide className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
