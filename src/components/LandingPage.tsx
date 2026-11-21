import React, { useState } from "react";
import {
  ArrowRight,
  ChevronDown,
  MapPin,
  BookOpen,
  Calculator,
  Compass,
  Bike,
  ShoppingBag,
  FileText,
} from "lucide-react";
import { ALLOWED_COLLEGE_DOMAIN } from "../utils/collegeAuth";

interface LandingPageProps {
  onProceedToSignIn: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onProceedToSignIn,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "auto" });
    }
  };

  const categories = [
    {
      icon: BookOpen,
      name: "Textbooks & Notes",
      desc: "SPPU reference books, syllabus question banks, and topper notes from FE to BE.",
    },
    {
      icon: Calculator,
      name: "Scientific Calculators",
      desc: "Casio fx-991EX, fx-82MS, and fx-991CW calculators ready for university exams.",
    },
    {
      icon: Compass,
      name: "Drafters & Lab Gear",
      desc: "Mini drafters, drawing boards, Vernier calipers, breadboards, and workshop aprons.",
    },
    {
      icon: Bike,
      name: "Campus Cycles",
      desc: "Pre-owned bicycles, sturdy locks, pumps, and daily campus commute essentials.",
    },
    {
      icon: ShoppingBag,
      name: "Bags & Hostel Essentials",
      desc: "Laptop backpacks, study lamps, desk organizers, and everyday hostel gear.",
    },
    {
      icon: FileText,
      name: "Semester Bundles & Topper Notes",
      desc: "One-handover FE/SE kit bundles plus peer-shared PDF revision guides free for every student.",
    },
  ];

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

  return (
    <div className="min-h-screen bg-[#F7F9F8] dark:bg-[#0D1110] text-[#18201C] dark:text-[#ECF2EF] flex flex-col font-sans">
      {/* Minimal 3-Zone Header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-[#0D1110] border-b border-[#DFE6E2] dark:border-[#242E2A]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          <span className="text-[15px] font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF] whitespace-nowrap shrink-0">
            Campus Resale
          </span>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-[#5C6B63] dark:text-[#8FA199]">
            <button
              type="button"
              onClick={() => scrollToSection("about")}
              className="hover:text-[#18201C] dark:hover:text-[#ECF2EF] cursor-pointer whitespace-nowrap"
            >
              About
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
              onClick={() => scrollToSection("categories")}
              className="hover:text-[#18201C] dark:hover:text-[#ECF2EF] cursor-pointer whitespace-nowrap"
            >
              Categories
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
        {/* Clean Minimal Hero */}
        <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-16 sm:pt-24 pb-16 sm:pb-20 text-center space-y-6">
          <p className="text-xs font-medium text-[#5C6B63] dark:text-[#8FA199]">
            PVG&apos;s COET, Pune · Exclusively for @{ALLOWED_COLLEGE_DOMAIN}
          </p>

          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF] leading-[1.12] max-w-3xl mx-auto">
            Buy, sell, and exchange student gear on campus.
          </h1>

          <p className="text-sm sm:text-base text-[#5C6B63] dark:text-[#8FA199] max-w-xl mx-auto leading-relaxed">
            A calm, zero-commission marketplace for PVG&apos;s COET students to pass down textbooks, scientific calculators, mini drafters, semester-end bundle kits, cycles, and free topper notes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="landing-hero-cta-btn"
              type="button"
              onClick={onProceedToSignIn}
              className="w-full sm:w-auto h-11 px-6 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Sign in with College ID</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto h-11 px-6 rounded-lg border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] hover:bg-[#EFF4F1] dark:hover:bg-[#1B2320] text-[#18201C] dark:text-[#ECF2EF] text-sm font-medium inline-flex items-center justify-center cursor-pointer"
            >
              How it works
            </button>
          </div>
        </section>

        {/* About Strip */}
        <section
          id="about"
          className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-14 sm:py-16"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
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
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="max-w-xl space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF]">
                How it works
              </h2>
              <p className="text-sm text-[#5C6B63] dark:text-[#8FA199]">
                From signing in to handing over your gear in four simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => (
                <div
                  key={step.stepNumber}
                  className="p-5 rounded-xl border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] space-y-2.5"
                >
                  <div className="text-xs font-mono text-[#2F5D50] dark:text-[#7BBFA8]">{step.stepNumber}</div>
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

        {/* Categories */}
        <section
          id="categories"
          className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-14 sm:py-16"
        >
          <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-10">
            <div className="max-w-xl space-y-2">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF]">
                Built for engineering semesters
              </h2>
              <p className="text-sm text-[#5C6B63] dark:text-[#8FA199]">
                Everything you need for classes, practicals, and campus life.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.name}
                    className="p-5 rounded-xl border border-[#DFE6E2] dark:border-[#242E2A] bg-white dark:bg-[#141A18] space-y-2.5"
                  >
                    <Icon className="w-4 h-4 text-[#2F5D50] dark:text-[#7BBFA8]" />
                    <h3 className="text-sm font-semibold text-[#18201C] dark:text-[#ECF2EF]">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#5C6B63] dark:text-[#8FA199] leading-relaxed">
                      {cat.desc}
                    </p>
                  </div>
                );
              })}
            </div>

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

        {/* FAQ */}
        <section
          id="faq"
          className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-14 sm:py-16"
        >
          <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF]">
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

        {/* Bottom CTA */}
        <section className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-16">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-[#18201C] dark:text-[#ECF2EF]">
              Ready to explore active campus listings?
            </h2>
            <p className="text-sm text-[#5C6B63] dark:text-[#8FA199]">
              Sign in with your @{ALLOWED_COLLEGE_DOMAIN} account to browse, message sellers, and post items.
            </p>
            <div className="pt-2">
              <button
                id="landing-bottom-signin-btn"
                type="button"
                onClick={onProceedToSignIn}
                className="h-11 px-6 rounded-lg bg-[#2F5D50] hover:bg-[#244A3F] dark:bg-[#387262] dark:hover:bg-[#448573] text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>Sign In with @{ALLOWED_COLLEGE_DOMAIN}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#DFE6E2] dark:border-[#242E2A] py-6 px-4 sm:px-6 text-xs text-[#5C6B63] dark:text-[#8FA199]">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="font-medium text-[#18201C] dark:text-[#ECF2EF]">
            PVG&apos;s COET Campus Resale &amp; Exchange
          </span>
          <span>Pune Campus · Student-to-Student Marketplace</span>
        </div>
      </footer>
    </div>
  );
};
