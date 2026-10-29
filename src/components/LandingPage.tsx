import React, { useState } from "react";
import {
  Building2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  BookOpen,
  Calculator,
  Compass,
  Bike,
  ShoppingBag,
  FileText,
  Calendar,
  MapPin,
  Users,
  Award,
  CheckCircle2,
  ChevronDown,
  Lock,
  ArrowDown,
  HelpCircle,
  Clock,
  Scan,
  Repeat,
  HeartHandshake,
  GraduationCap,
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
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const categories = [
    {
      icon: BookOpen,
      name: "Engineering Textbooks & Notes",
      desc: "SPPU reference books, course syllabus question banks, and handwritten topper revision notes for FE through BE.",
      color: "from-blue-500/20 to-indigo-500/20 text-blue-400 border-blue-500/30",
    },
    {
      icon: Calculator,
      name: "Scientific Calculators",
      desc: "Casio fx-991EX ClassWiz, fx-82MS, fx-991CW with verified dot-matrix screens and battery longevity.",
      color: "from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/30",
    },
    {
      icon: Compass,
      name: "Mini Drafters & Lab Equipment",
      desc: "Engineering drawing boards, clamps, Vernier calipers, screw gauges, breadboards, workshop aprons & Arduino boards.",
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30",
    },
    {
      icon: Bike,
      name: "Campus Cycles & Commute",
      desc: "Pre-owned student bicycles, sturdy U-locks, air pumps, and campus commuter gear.",
      color: "from-cyan-500/20 to-blue-500/20 text-cyan-400 border-cyan-500/30",
    },
    {
      icon: ShoppingBag,
      name: "Bags & Hostel Utilities",
      desc: "Durable laptop backpacks, study lamps, scientific stationary organizers, and hostel essentials.",
      color: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    },
    {
      icon: FileText,
      name: "Topper Notes Vault (100% Free)",
      desc: "Curated PDF revision notes prepared by department semester toppers, free for all PVG's COET students.",
      color: "from-rose-500/20 to-amber-500/20 text-rose-400 border-rose-500/30",
    },
  ];

  const steps = [
    {
      stepNumber: "01",
      icon: Lock,
      title: "Authenticate with College ID",
      summary: "Strictly @pvgcoet.ac.in Verified",
      desc: "Sign in with your official PVG's COET Google Workspace email. External accounts and unauthorized commercial sellers are blocked at the institutional perimeter.",
    },
    {
      stepNumber: "02",
      icon: Scan,
      title: "List or Browse with AI Inspection",
      summary: "Instant Gemini AI Condition Analysis",
      desc: "Selling an item? Snap a photo. Gemini AI inspects cosmetic wear, assigns a condition score ('Like New', 'Good', 'Fair'), and recommends fair student price bounds.",
    },
    {
      stepNumber: "03",
      icon: Repeat,
      title: "Barter Flow or Direct Buy",
      summary: "Side-by-Side Trade Value Parity",
      desc: "Exchange last semester's drafter for this semester's calculator. Use the built-in Barter Drawer to calculate condition differentials and fair cash adjustments.",
    },
    {
      stepNumber: "04",
      icon: MapPin,
      title: "Meet at Campus Landmarks",
      summary: "Zero Shipping Fees, Safe Handovers",
      desc: "Schedule in-person exchanges at designated campus checkpoints like Central Library, Reading Hall, Canteen Plaza, or Workshop. Sync to Google Calendar with 1 click.",
    },
  ];

  const faqs = [
    {
      q: "Who is eligible to use this platform?",
      a: "This marketplace is exclusively restricted to students, faculty, and research scholars possessing an active official @pvgcoet.ac.in email address. Any outside commercial accounts or spam listings are strictly prevented by institutional authentication.",
    },
    {
      q: "How do transactions and payments work?",
      a: "Handovers happen in-person at safe campus checkpoints (such as the Central Library steps, Canteen Plaza, or Workshop entrance). Payment is made directly between students via UPI or cash upon physical verification of the item. There are zero platform cuts, commissions, or shipping fees.",
    },
    {
      q: "Can I trade items without paying cash (Barter)?",
      a: "Yes! The platform includes a dedicated Barter Flow engine. You can select an item you own from your inventory, compare condition ratings side-by-side with the seller's listing, and propose an item-for-item exchange with or without a small cash adjustment.",
    },
    {
      q: "How does the Gemini AI Condition Inspector work?",
      a: "When you upload an item photo, our backend passes it securely to the Gemini model. The model identifies product make/model numbers, grades cosmetic wear into standardized tiers (Like New, Good, Fair, Wear & Tear), and provides realistic price recommendations tailored to student budgets.",
    },
    {
      q: "What is the Topper Notes Vault?",
      a: "The Topper Notes Vault is a free peer-to-peer repository where high-scoring students share comprehensive handwritten notes, solved university question sets, and practical viva guides across all engineering branches.",
    },
    {
      q: "Is this platform exclusively for PVG's COET students?",
      a: "Yes, this application is restricted to verified institutional domain accounts (@pvgcoet.ac.in) to guarantee safe and authenticated on-campus peer-to-peer exchanges.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0A0E17] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white relative overflow-x-hidden font-sans">
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[130px]" />
        <div className="absolute bottom-10 left-1/3 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>

      {/* Top Floating Navigation Bar */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-[#0A0E17]/80 border-b border-slate-800/80 px-4 sm:px-8 py-3.5 transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-sm font-bold text-white tracking-tight">
                  PVG's COET
                </span>
                <span className="text-xs px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-500/30">
                  Campus Resale
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Official Student-to-Student Exchange
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button
              onClick={() => scrollToSection("about")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              What It Is
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              How To Use
            </button>
            <button
              onClick={() => scrollToSection("categories")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Categories
            </button>
            <button
              onClick={() => scrollToSection("faq")}
              className="hover:text-white transition-colors cursor-pointer"
            >
              FAQ
            </button>
          </div>

          <button
            id="landing-header-signin-btn"
            onClick={onProceedToSignIn}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-bold text-xs shadow-md shadow-indigo-600/30 transition-all cursor-pointer select-none"
          >
            <span>Sign In with College ID</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* Main Hero Section */}
      <main className="flex-1">
        <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col items-center text-center">
          {/* Institutional Badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 shadow-md text-slate-300 text-xs font-semibold mb-6 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Exclusively for verified <strong className="text-white">@{ALLOWED_COLLEGE_DOMAIN}</strong> students</span>
            <span className="text-slate-500">•</span>
            <span className="text-indigo-400 font-bold">Pune Campus</span>
          </div>

          {/* Hero Headline */}
          <h1
            className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-400"
          >
            The Verified Campus Resale & Barter Network for{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-amber-300">
              PVG's COET Students
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className="mt-6 text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-3 duration-400"
          >
            Buy, barter, or pass down engineering textbooks, mini-drafters, scientific calculators, lab gear, and cycles. Handover directly between lectures at the Central Library, Canteen Plaza, or Workshop.
          </p>

          {/* Core CTAs */}
          <div
            className="mt-8 flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-4 duration-400"
          >
            <button
              id="landing-hero-cta-btn"
              onClick={onProceedToSignIn}
              className="w-full sm:w-auto flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/30 transition-all cursor-pointer active:scale-98"
            >
              <span>Access Campus Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection("how-it-works")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/80 border border-slate-700/80 text-slate-200 font-semibold text-sm transition-all cursor-pointer active:scale-98"
            >
              <span>See How It Works</span>
              <ArrowDown className="w-4 h-4" />
            </button>
          </div>

          {/* Value Proof Badges Strip */}
          <div
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-4xl text-left animate-in fade-in duration-500"
          >
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <ShieldCheck className="w-4 h-4" />
                <span>Zero Outsiders</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Restricted to verified @pvgcoet.ac.in student emails only.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
                <Sparkles className="w-4 h-4" />
                <span>AI Photo Inspector</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Gemini model auto-detects condition & realistic student prices.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <MapPin className="w-4 h-4" />
                <span>Campus Handovers</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Meet at Library or Canteen with zero shipping costs.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                <Repeat className="w-4 h-4" />
                <span>Barter Value Parity</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Trade items semester-to-semester with fair balance calculations.
              </p>
            </div>
          </div>
        </section>

        {/* Section: What the App is About */}
        <section id="about" className="py-16 px-4 sm:px-8 border-t border-slate-800/80 bg-slate-900/40">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Purpose & Philosophy
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Built specifically to solve engineering campus resale friction
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Every semester at PVG's COET, hundreds of students purchase expensive drawing drafters, calculators, and SPPU reference books brand new, only to leave them idling after exams. Meanwhile, juniors scramble to purchase the exact same items. Campus Resale connects seniors and juniors in a safe, transparent, and verified ecosystem.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-3xl bg-slate-800/70 border border-slate-700/70 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Trust & Institutional Security</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  No strangers from generic classified portals. Every user is authenticated via Google Workspace with their college roll number or department email ID, ensuring full accountability.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-800/70 border border-slate-700/70 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Gemini AI Optical Inspection</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Eliminates condition disputes before meeting. The AI model checks photos for scratches, worn screen segments, or missing drafter knobs, recommending fair, realistic prices.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-800/70 border border-slate-700/70 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-white">Circularity & Campus Sustainability</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Reduces e-waste and paper waste across our college campus. Gives durable engineering equipment a lifespan across multiple student generations.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: How to Use It (Step-by-Step) */}
        <section id="how-it-works" className="py-16 px-4 sm:px-8 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Simple 4-Step Workflow
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                How you can use Campus Resale & Exchange
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Whether you are looking to save money on textbooks or sell equipment you no longer need, our platform guides you in minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.stepNumber}
                    className="p-6 rounded-3xl bg-slate-800/50 border border-slate-700/70 relative group hover:border-indigo-500/50 transition-all duration-200"
                  >
                    <div className="text-3xl font-black text-slate-700 group-hover:text-indigo-400/40 transition-colors font-mono mb-4">
                      {step.stepNumber}
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mb-3">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">
                      {step.title}
                    </h3>
                    <div className="text-[11px] font-semibold text-indigo-400 mb-2">
                      {step.summary}
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <button
                onClick={onProceedToSignIn}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Ready to start? Sign In Now</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Section: Supported Categories */}
        <section id="categories" className="py-16 px-4 sm:px-8 border-t border-slate-800/80 bg-slate-900/40">
          <div className="max-w-7xl mx-auto space-y-12">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                Marketplace Inventory
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Everything you need for your semester
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Organized strictly around the curriculum and practical laboratory requirements of engineering courses.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <div
                    key={cat.name}
                    className="p-6 rounded-3xl bg-slate-800/60 border border-slate-700/60 hover:bg-slate-800/90 transition-all duration-200 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${cat.color} flex items-center justify-center border`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h3 className="text-base font-bold text-white">
                        {cat.name}
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {cat.desc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section: Campus Handover Checkpoints */}
        <section className="py-16 px-4 sm:px-8 border-t border-slate-800/80">
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Safe Campus Locations
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Designated Handover Checkpoints
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Meet comfortably in well-lit, public spots on the PVG's COET campus. Zero delivery waits, immediate physical inspection.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {[
                { name: "Central Library", desc: "Front Reception Counter" },
                { name: "Reading Hall", desc: "Entrance Porch & Steps" },
                { name: "Main Building", desc: "Ground Floor Foyer" },
                { name: "Canteen Plaza", desc: "Outdoor Seating Area" },
                { name: "Mech Workshop", desc: "Carpentry Section Gate" },
                { name: "Basketball Court", desc: "Quad Benches" },
              ].map((spot) => (
                <div
                  key={spot.name}
                  className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-center space-y-1"
                >
                  <MapPin className="w-4 h-4 text-indigo-400 mx-auto" />
                  <div className="text-xs font-bold text-white">{spot.name}</div>
                  <div className="text-[10px] text-slate-400">{spot.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Section: Frequently Asked Questions */}
        <section id="faq" className="py-16 px-4 sm:px-8 border-t border-slate-800/80">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-3">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Common Inquiries
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl bg-slate-800/60 border border-slate-700/60 overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-200 hover:text-white cursor-pointer"
                    >
                      <span className="flex items-center gap-2.5">
                        <HelpCircle className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{faq.q}</span>
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-indigo-400" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-700/40 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom Banner Call To Action */}
        <section className="py-16 px-4 sm:px-8 border-t border-slate-800/80 bg-gradient-to-b from-indigo-900/30 to-[#0A0E17]">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to trade with your fellow PVG's COET students?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Log in with your official college account now to explore active items, chat with sellers, and schedule handovers.
            </p>
            <div className="pt-2">
              <button
                id="landing-bottom-signin-btn"
                onClick={onProceedToSignIn}
                className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white font-extrabold text-sm shadow-xl shadow-indigo-600/40 transition-all cursor-pointer select-none"
              >
                <span>Sign In with @{ALLOWED_COLLEGE_DOMAIN}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-slate-400">
            <Building2 className="w-4 h-4 text-indigo-400" />
            <span>PVG's COET Campus Resale & Exchange</span>
          </div>
          <div>
            Official Student-to-Student Resale & Exchange Network • Pune
          </div>
        </div>
      </footer>
    </div>
  );
};
