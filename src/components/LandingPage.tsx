import React, { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  Search,
  Check,
  Recycle,
} from "lucide-react";
import { ALLOWED_COLLEGE_DOMAIN } from "../utils/collegeAuth";
import { MarketplaceCategoryGrid } from "./MarketplaceCategoryGrid";
import { SellerPromoBanner } from "./SellerPromoBanner";

interface LandingPageProps {
  onProceedToSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onProceedToSignIn,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [previewQuery, setPreviewQuery] = useState("");

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "auto" });
    }
  };

  const steps = [
    {
      stepNumber: "01",
      title: "Sign in with College ID",
      desc: `Use your official @${ALLOWED_COLLEGE_DOMAIN} email and complete your student profile so every buyer and seller is a real peer on campus.`,
    },
    {
      stepNumber: "02",
      title: "Post an item or bundle",
      desc: "List single gear or a one-click Semester-End Bundle Pack, with optional AI condition grading and fair price suggestions.",
    },
    {
      stepNumber: "03",
      title: "Negotiate or swap directly",
      desc: "Chat in-app, track active deals in Currently Negotiating, or propose a semester-to-semester barter swap.",
    },
    {
      stepNumber: "04",
      title: "Handover on campus",
      desc: "Meet at Central Library, Reading Hall, Canteen Plaza, or Workshop and mark the item sold with zero fees.",
    },
  ];

  const faqs = [
    {
      q: "Who can use this platform?",
      a: `Only students and faculty with an official @${ALLOWED_COLLEGE_DOMAIN} email address can access the marketplace.`,
    },
    {
      q: "How do payments and handovers work?",
      a: "Students meet in person at public campus spots (Central Library, Canteen Plaza, Reading Hall, or Workshop) and pay directly via UPI or cash after inspecting the item. There are zero platform commissions.",
    },
    {
      q: "Can I swap items instead of paying cash?",
      a: "Yes. Select any exchange-enabled listing to open the barter flow and propose an item-for-item swap with or without a cash difference.",
    },
    {
      q: "How does the AI Photo Inspector work?",
      a: "When you upload a photo, the inspector grades cosmetic wear (Like New, Good, Fair) and suggests a realistic student resale price range.",
    },
    {
      q: "Are Topper Notes free?",
      a: "Yes. All handwritten revision notes and question sets inside the Topper Notes Vault are completely free to browse and download.",
    },
  ];

  const handlePreviewSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProceedToSignIn();
  };

  return (
    <div className="min-h-screen bg-[#F7F9F8] dark:bg-[#0D1110] text-[#18201C] dark:text-[#ECF2EF] flex flex-col font-sans">
      {/* Minimal 3-Zone Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0D1110] border-b border-[#DFE6E2] dark:border-[#242E2A]">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-8">
          <span className="text-[15px] font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF] whitespace-nowrap shrink-0">
            Campus Resale
          </span>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#5C6B63] dark:text-[#8FA199]">
            <button
              type="button"
              onClick={() => scrollToSection("categories")}
              className="hover:text-[#18201C] dark:hover:text-[#ECF2EF] cursor-pointer whitespace-nowrap"
            >
              Categories
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-[#18201C] dark:hover:text-[#ECF2EF] cursor-pointer whitespace-nowrap"
            >
              How it works
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="hover:text-[#18201C] dark:hover:text-[#ECF2EF] cursor-pointer whitespace-nowrap"
            >
              About
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("faq")}
              className="hover:text-[#18201C] dark:hover:text-[#ECF2EF] cursor-pointer whitespace-nowrap"
            >
              FAQ
            </button>
          </nav>

          <button
            id="landing-header-signin-btn"
            type="button"
            onClick={onProceedToSignIn}
            className="h-9 px-4 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
          >
            <span>Sign In</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section matching Screenshot 1 */}
        <section className="w-full bg-[#F3F5F2] dark:bg-[#111715] border-b border-[#DFE6E2] dark:border-[#242E2A]">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20 lg:py-24">
            <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-8">
              {/* Left Column */}
              <div className="lg:col-span-7 text-left space-y-6">
                <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9E6B43] dark:text-[#C89B6E]">
                  <span aria-hidden="true" className="text-sm leading-none">
                    ✳
                  </span>
                  <span>MADE FOR CAMPUS LIFE</span>
                </div>

                <h1 className="text-4xl sm:text-5xl lg:text-[64px] font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF] leading-[1.05]">
                  <span className="block">Good finds.</span>
                  <span className="block text-[#2F5D50] dark:text-[#7BBFA8]">
                    Great campus
                  </span>
                  <span className="block">stories.</span>
                </h1>

                <p className="text-sm sm:text-base text-[#5C6B63] dark:text-[#8FA199] max-w-lg leading-relaxed">
                  Buy, sell and exchange the things you need with students from your own college community.
                </p>

                {/* Preview Search Box (routes to College Sign-In) */}
                <form
                  onSubmit={handlePreviewSearchSubmit}
                  className="max-w-lg w-full pt-1 flex items-center gap-2 p-1.5 rounded-xl border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] shadow-sm"
                >
                  <Search className="w-4 h-4 ml-3 shrink-0 text-[#5C6B63] dark:text-[#8FA199]" />
                  <input
                    type="text"
                    value={previewQuery}
                    onChange={(e) => setPreviewQuery(e.target.value)}
                    placeholder="What are you looking for?"
                    className="w-full bg-transparent text-sm text-[#18201C] dark:text-[#ECF2EF] placeholder:text-[#7C8B83] dark:placeholder:text-[#73847D] focus:outline-none py-2.5"
                  />
                  <button
                    id="landing-hero-cta-btn"
                    type="submit"
                    className="h-10 px-5 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white text-sm font-semibold shrink-0 cursor-pointer"
                  >
                    Search
                  </button>
                </form>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5C6B63] dark:text-[#8FA199]">
                  <span className="inline-flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#2F5D50] dark:text-[#7BBFA8] shrink-0" />
                    <span>
                      Exclusively for your college community (@{ALLOWED_COLLEGE_DOMAIN})
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={onProceedToSignIn}
                    className="font-semibold text-[#2F5D50] dark:text-[#7BBFA8] hover:underline underline-offset-4 cursor-pointer"
                  >
                    Sign in with College ID →
                  </button>
                </div>
              </div>

              {/* Right Column: Static Campus Community Visual */}
              <div className="lg:col-span-5 flex items-center justify-center lg:justify-end">
                <div className="relative flex items-center justify-center py-6 px-6 sm:px-12">
                  <div className="w-60 h-60 sm:w-72 sm:h-72 rounded-full bg-[#DDE6E0] dark:bg-[#192621] flex items-center justify-center">
                    <div className="w-40 h-40 sm:w-44 sm:h-44 rounded-full bg-[#2F5D50] dark:bg-[#244A3F] flex flex-col items-center justify-center text-center shadow-sm">
                      <span className="text-white text-sm sm:text-[15px] font-bold tracking-[0.14em] uppercase leading-relaxed">
                        CAMPUS
                        <br />
                        COMMUNITY
                      </span>
                    </div>
                  </div>

                  {/* Top-Left Static Card */}
                  <div className="absolute top-2 left-0 sm:-left-2 rounded-xl border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] px-3.5 py-3 shadow-sm flex items-center gap-3 w-52 sm:w-56">
                    <div className="shrink-0">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 28 28"
                        fill="none"
                        aria-hidden="true"
                      >
                        <rect x="3" y="5" width="7" height="16" rx="1.5" fill="#4CAF50" />
                        <rect x="9.5" y="7" width="7" height="15" rx="1.5" fill="#E53935" />
                        <rect x="16" y="9" width="7" height="14" rx="1.5" fill="#3B82F6" />
                      </svg>
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold leading-tight text-[#18201C] dark:text-[#ECF2EF]">
                        Pass it on.
                      </p>
                      <p className="text-[11px] leading-snug mt-0.5 text-[#5C6B63] dark:text-[#8FA199]">
                        Give your books a new life
                      </p>
                    </div>
                  </div>

                  {/* Bottom-Right Static Card */}
                  <div className="absolute bottom-2 right-0 sm:-right-2 rounded-xl border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] px-3.5 py-3 shadow-sm flex items-center gap-3 w-48 sm:w-52">
                    <div className="shrink-0">
                      <Recycle className="w-5 h-5 text-[#18201C] dark:text-[#ECF2EF]" />
                    </div>
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold leading-tight text-[#18201C] dark:text-[#ECF2EF]">
                        Buy smarter.
                      </p>
                      <p className="text-[11px] leading-snug mt-0.5 text-[#5C6B63] dark:text-[#8FA199]">
                        Spend less, do more
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Explore Categories 3x2 Grid matching Screenshot 3 */}
        <section
          id="categories"
          className="py-14 sm:py-16"
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            <MarketplaceCategoryGrid
              selectedCategory="All"
              onSelectCategory={() => onProceedToSignIn()}
              sectionId="landing-category-grid"
            />

            {/* Handover Checkpoints */}
            <div className="pt-6 border-t border-[#DFE6E2] dark:border-[#242E2A]">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#5C6B63] dark:text-[#8FA199]">
                <span className="font-semibold text-[#18201C] dark:text-[#ECF2EF] inline-flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#2F5D50] dark:text-[#7BBFA8]" />
                  Campus handover spots:
                </span>
                <span>Central Library</span>
                <span aria-hidden="true">·</span>
                <span>Reading Hall</span>
                <span aria-hidden="true">·</span>
                <span>Main Building Foyer</span>
                <span aria-hidden="true">·</span>
                <span>Canteen Plaza</span>
                <span aria-hidden="true">·</span>
                <span>Mech Workshop</span>
                <span aria-hidden="true">·</span>
                <span>Basketball Court</span>
              </div>
            </div>
          </div>
        </section>

        {/* About Strip */}
        <section
          id="about"
          className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-14 sm:py-16"
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-[#18201C] dark:text-[#ECF2EF]">
                Campus-only access
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                Restricted to @{ALLOWED_COLLEGE_DOMAIN} accounts so every buyer and seller is a fellow student on campus.
              </p>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-[#18201C] dark:text-[#ECF2EF]">
                Semester kits &amp; fair pricing
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                Pass down complete semester bundles in one handover or use the optional AI inspector to grade condition and price.
              </p>
            </div>
            <div className="space-y-1.5">
              <h2 className="text-sm font-semibold text-[#18201C] dark:text-[#ECF2EF]">
                Zero shipping, zero fees
              </h2>
              <p className="text-xs sm:text-sm text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                Meet directly between lectures at the Central Library, Reading Hall, Canteen Plaza, or Workshop.
              </p>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section
          id="how-it-works"
          className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-14 sm:py-16"
        >
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
            <div className="max-w-xl space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#9E6B43] dark:text-[#C89B6E]">
                HOW IT WORKS
              </p>
              <h2 className="text-2xl sm:text-3xl font-normal tracking-tight text-[#18201C] dark:text-[#ECF2EF]">
                Four simple steps.
              </h2>
              <p className="text-sm text-[#5C6B63] dark:text-[#8FA199]">
                From signing in to handing over your gear between lectures.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-5 rounded-2xl border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] space-y-2.5"
                >
                  <div className="text-xs font-mono text-[#2F5D50] dark:text-[#7BBFA8]">
                    {step.stepNumber}
                  </div>
                  <h3 className="text-sm font-semibold text-[#18201C] dark:text-[#ECF2EF]">
                    {step.title}
                  </h3>
                  <p className="text-xs text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Seller CTA Banner matching Screenshot 2 */}
        <section className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-14 sm:py-16">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SellerPromoBanner
              id="landing-seller-promo-banner"
              onStartSelling={onProceedToSignIn}
              buttonLabel="Start selling"
            />
          </div>
        </section>

        {/* FAQ */}
        <section
          id="faq"
          className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-14 sm:py-16"
        >
          <div className="w-full max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
            <h2 className="text-xl sm:text-2xl font-normal tracking-tight text-[#18201C] dark:text-[#ECF2EF]">
              Frequently asked questions
            </h2>

            <div className="divide-y divide-[#DFE6E2] dark:divide-[#242E2A] border-t border-b border-[#DFE6E2] dark:border-[#242E2A]">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div key={faq.q}>
                    <button
                      type="button"
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left py-4 flex items-center justify-between gap-4 text-sm font-medium text-[#18201C] dark:text-[#ECF2EF] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#5C6B63] dark:text-[#8FA199] shrink-0 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <p className="pb-4 text-xs sm:text-sm text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                        {faq.a}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-6 px-4 sm:px-6 lg:px-8 text-xs text-[#5C6B63] dark:text-[#8FA199]">
        <div className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-[#18201C] dark:text-[#ECF2EF]">
            PVG&apos;s COET Campus Resale &amp; Exchange
          </span>
          <span>Pune Campus · Student-to-Student Marketplace</span>
        </div>
      </footer>
    </div>
  );
};
