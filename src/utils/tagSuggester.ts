import { ItemCategory } from "../types";

// Common stop words to exclude from raw keyword extraction
const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "from",
  "this",
  "that",
  "good",
  "used",
  "sale",
  "item",
  "edition",
  "very",
  "condition",
  "like",
  "original",
  "best",
  "available",
]);

interface KeywordMapping {
  keywords: string[];
  suggestedTags: string[];
}

const KEYWORD_RULES: KeywordMapping[] = [
  // Calculators & Math Gear
  {
    keywords: ["casio", "fx-991", "fx991", "991es", "991ms", "991cw"],
    suggestedTags: [
      "Casio",
      "Scientific Calculator",
      "FX-991ES",
      "Exam Approved",
      "Engineering Math",
    ],
  },
  {
    keywords: ["calculator", "calc", "scientific"],
    suggestedTags: [
      "Scientific Calculator",
      "Engineering Essential",
      "Matrix & Stats",
      "Semester 1",
    ],
  },
  {
    keywords: ["texas", "ti-84", "ti84", "graphing"],
    suggestedTags: ["Texas Instruments", "Graphing Calc", "Engineering"],
  },

  // Books & Subjects
  {
    keywords: ["grewal", "bs grewal", "higher engineering"],
    suggestedTags: [
      "B.S. Grewal",
      "Engineering Mathematics",
      "Sem 1 & 2",
      "Textbook",
      "Calculus",
    ],
  },
  {
    keywords: ["math", "mathematics", "calculus", "differential"],
    suggestedTags: [
      "Engineering Mathematics",
      "Calculus",
      "FE Syllabus",
      "Standard Textbook",
    ],
  },
  {
    keywords: ["physics", "engineering physics"],
    suggestedTags: ["Applied Physics", "Sem 1", "Engineering Science"],
  },
  {
    keywords: ["chemistry", "engineering chemistry"],
    suggestedTags: ["Applied Chemistry", "Sem 2", "Lab Reference"],
  },
  {
    keywords: ["mechanics", "engineering mechanics"],
    suggestedTags: ["Engineering Mechanics", "Statics & Dynamics", "FE Core"],
  },
  {
    keywords: ["dsa", "data structures", "algorithms", "cormen"],
    suggestedTags: ["Data Structures", "Algorithms", "CSE / IT", "Coding Prep"],
  },
  {
    keywords: ["python", "java", "c++", "programming", "coding"],
    suggestedTags: ["Computer Science", "Programming", "Lab Exercises"],
  },
  {
    keywords: ["gate", "previous years", "pyq", "made easy", "ace"],
    suggestedTags: ["GATE Prep", "Competitive Exam", "Solved Papers"],
  },
  {
    keywords: ["notes", "handwritten", "summary"],
    suggestedTags: ["Handwritten Notes", "Exam Revision", "Formula Sheet"],
  },

  // Lab Equipment & Workshop
  {
    keywords: ["drafter", "mini drafter", "drawing"],
    suggestedTags: [
      "Mini Drafter",
      "Engineering Graphics",
      "First Year Lab",
      "Drawing Board",
    ],
  },
  {
    keywords: ["sheet tube", "tube", "holder", "chart tube"],
    suggestedTags: ["Sheet Holder", "Engineering Graphics", "Drawing Tube"],
  },
  {
    keywords: ["lab coat", "apron", "white coat"],
    suggestedTags: [
      "Lab Coat",
      "Chemistry Lab",
      "Workshop Practice",
      "100% Cotton",
    ],
  },
  {
    keywords: ["goggles", "safety glasses"],
    suggestedTags: ["Safety Goggles", "Lab Safety", "Chemistry Practical"],
  },
  {
    keywords: ["multimeter", "tester", "voltmeter"],
    suggestedTags: ["Digital Multimeter", "Electrical Lab", "Hardware Testing"],
  },
  {
    keywords: ["breadboard", "arduino", "raspberry", "sensor", "iot"],
    suggestedTags: [
      "Arduino & IoT",
      "Breadboard Circuit",
      "Electronics Lab",
      "Project Component",
    ],
  },

  // Cycles & Commute
  {
    keywords: ["cycle", "bicycle", "bike", "cycl"],
    suggestedTags: [
      "Campus Bicycle",
      "Hostel Commute",
      "Eco Friendly",
      "Campus Ride",
    ],
  },
  {
    keywords: ["hero", "sprint"],
    suggestedTags: ["Hero Sprint", "Campus Bicycle", "Easy Maintenance"],
  },
  {
    keywords: ["hercules", "roadeo", "btwin", "decathlon"],
    suggestedTags: ["Decathlon / Btwin", "Geared Cycle", "Hostel Commute"],
  },
  {
    keywords: ["gear", "geared", "shimano", "speed"],
    suggestedTags: ["Geared Bicycle", "Multi Speed", "Smooth Ride"],
  },

  // Bags & Accessories
  {
    keywords: ["bag", "backpack", "rucksack"],
    suggestedTags: [
      "College Backpack",
      "Laptop Bag",
      "Daily Campus Bag",
      "Water Resistant",
    ],
  },
  {
    keywords: ["sleeve", "laptop sleeve", "case"],
    suggestedTags: ["Laptop Sleeve", "Padded Protection", "15.6 Inch"],
  },
];

const CATEGORY_DEFAULTS: Record<ItemCategory, string[]> = {
  Calculators: ["Scientific Calculator", "Approved For Exams", "Math Tools"],
  Books: ["Textbook", "Reference Book", "Syllabus Standard"],
  "Lab Equipment": ["Lab Essential", "Workshop Practice", "First Year Lab"],
  Cycles: ["Hostel Commute", "Campus Ride", "Student Bicycle"],
  Bags: ["College Backpack", "Daily Carry", "Durable"],
  Other: ["Campus Gear", "Student Deal"],
};

/**
 * Generates an array of suggested search tags based on item title, category, and existing tags.
 */
export function generateSuggestedTags(
  title: string,
  category?: ItemCategory,
  existingTags: string[] = []
): string[] {
  const existingSet = new Set(existingTags.map((t) => t.toLowerCase().trim()));
  const suggestions = new Set<string>();

  const cleanTitle = title.trim().toLowerCase();

  // 1. Check keyword rules
  if (cleanTitle) {
    for (const rule of KEYWORD_RULES) {
      const matched = rule.keywords.some((kw) => {
        // match word boundary or contains
        const regex = new RegExp(`\\b${kw}`, "i");
        return regex.test(cleanTitle) || cleanTitle.includes(kw);
      });

      if (matched) {
        for (const tag of rule.suggestedTags) {
          if (!existingSet.has(tag.toLowerCase())) {
            suggestions.add(tag);
          }
        }
      }
    }

    // 2. Extract capitalized or prominent tokens from title (e.g. brand names, model IDs)
    const rawWords = title
      .replace(/[^a-zA-Z0-9\s-+]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3 && !STOP_WORDS.has(w.toLowerCase()));

    for (const word of rawWords) {
      // capitalize nicely if all lowercase
      const formatted =
        word.length <= 4 && word.toUpperCase() === word
          ? word // like DSA, FX, TI
          : word.charAt(0).toUpperCase() + word.slice(1);

      if (!existingSet.has(formatted.toLowerCase()) && suggestions.size < 12) {
        // Avoid adding generic numbers unless model-like (e.g. 991, 44th)
        if (!/^\d+$/.test(word) || word.length >= 3) {
          suggestions.add(formatted);
        }
      }
    }
  }

  // 3. Supplement with Category defaults if suggestions are low
  if (category && CATEGORY_DEFAULTS[category]) {
    for (const defaultTag of CATEGORY_DEFAULTS[category]) {
      if (!existingSet.has(defaultTag.toLowerCase()) && suggestions.size < 10) {
        suggestions.add(defaultTag);
      }
    }
  }

  // Limit to top 10 relevant suggestions
  return Array.from(suggestions).slice(0, 10);
}
