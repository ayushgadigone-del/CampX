import { ItemCategory, Listing } from "../types";

export interface FAQItem {
  id: string;
  question: string;
  contextHint?: string;
}

/**
 * Returns 3 context-specific questions based on the listing category,
 * condition, title, and price to help students ask fast, relevant questions.
 */
export function getCategoryFAQs(listing: Listing): FAQItem[] {
  const category = listing.category;
  const isFree = listing.price === 0;

  switch (category) {
    case "Calculators":
      return [
        {
          id: "calc_1",
          question: "Is the screen clear without lines or missing pixels?",
          contextHint: "Display check",
        },
        {
          id: "calc_2",
          question: "Are batteries included, or will I need fresh AAA/coin cells?",
          contextHint: "Power & battery",
        },
        {
          id: "calc_3",
          question: "Is it approved for semester end exams (non-programmable check)?",
          contextHint: "Exam compliance",
        },
      ];

    case "Books":
      return [
        {
          id: "book_1",
          question: "Are there pencil/pen notes or highlighted markings inside?",
          contextHint: "Page condition",
        },
        {
          id: "book_2",
          question: "Which edition or publication year is this textbook?",
          contextHint: "Syllabus match",
        },
        {
          id: "book_3",
          question: "Does it come with any companion CD, formula sheet, or solution guide?",
          contextHint: "Included materials",
        },
      ];

    case "Lab Equipment":
      return [
        {
          id: "lab_1",
          question: "Are all probe leads, clips, and components functional?",
          contextHint: "Testing & probes",
        },
        {
          id: "lab_2",
          question: "Was this tested recently in our department lab experiments?",
          contextHint: "Lab usability",
        },
        {
          id: "lab_3",
          question: "Is the original protective carrying box/case included?",
          contextHint: "Storage case",
        },
      ];

    case "Cycles":
      return [
        {
          id: "cycle_1",
          question: "How are the brakes, tire pressure, and chain condition right now?",
          contextHint: "Road readiness",
        },
        {
          id: "cycle_2",
          question: "Does it include a campus parking lock or cable with keys?",
          contextHint: "Lock & security",
        },
        {
          id: "cycle_3",
          question: "Can I take a quick 2-minute test ride near the hostel entrance?",
          contextHint: "Inspection ride",
        },
      ];

    case "Bags":
      return [
        {
          id: "bag_1",
          question: "Are all zippers, straps, and buckles working smoothly?",
          contextHint: "Hardware check",
        },
        {
          id: "bag_2",
          question: "Does it have a padded compartment that fits a 15-inch laptop?",
          contextHint: "Laptop sleeve",
        },
        {
          id: "bag_3",
          question: "Is the fabric water-resistant or does it come with a rain cover?",
          contextHint: "Monsoon ready",
        },
      ];

    case "Other":
    default:
      return [
        {
          id: "gen_1",
          question: "Is the item in fully working condition with all essential accessories?",
          contextHint: "Functionality",
        },
        {
          id: "gen_2",
          question: isFree
            ? "When and where on campus would be most convenient for me to pick this up?"
            : "Is the price slightly negotiable for a fellow campus student?",
          contextHint: isFree ? "Pickup scheduling" : "Price flexibility",
        },
        {
          id: "gen_3",
          question: "Could we meet at the campus library or canteen for quick inspection?",
          contextHint: "Handover spot",
        },
      ];
  }
}
