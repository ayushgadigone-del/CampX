import { TopperNote } from "../types";

export const APP_OWNER_EMAIL = "ayushgadigone@gmail.com";

export const initialTopperNotes: TopperNote[] = [
  {
    id: "note-dsa-trees-graphs",
    title: "Data Structures & Algorithms: Complete Graph & Tree Traversal Guide",
    subject: "Data Structures & Algorithms",
    branch: "Computer Science",
    semester: "Sem 3",
    author: "Ayush G. (App Owner)",
    authorRank: "Branch Rank 1 (9.88 CGPA)",
    authorCollege: "Government College of Engineering",
    description: "Ultra-condensed exam prep notes covering BFS, DFS, Dijkstra, AVL rotations, and dynamic programming on trees with interview hand-sketched flowcharts.",
    isFree: true,
    pagesCount: 38,
    readTimeMinutes: 25,
    tags: ["DSA", "Graphs", "Trees", "Sem 3 Exams", "Placements"],
    lastUpdated: "2026-08-28",
    featured: true,
    chapters: [
      {
        title: "Module 1: Binary Search Trees & AVL Balance Rotations",
        summary: "Step-by-step balance factors calculation with LL, RR, LR, and RL rotation shortcuts. Guaranteed 10-mark semester exam question.",
        keyFormulasOrTips: [
          "Balance Factor = Height(Left Subtree) - Height(Right Subtree) must be in {-1, 0, 1}",
          "LR rotation = Left rotation on left child, then Right rotation on root",
          "Inorder traversal of any BST yields strictly sorted keys in O(N)",
        ],
      },
      {
        title: "Module 2: Graph Representations & Shortest Path (Dijkstra vs Bellman-Ford)",
        summary: "Adjacency matrix vs list memory tradeoffs. Priority-Queue Dijkstra implementation nuances and edge-relaxation proofs.",
        keyFormulasOrTips: [
          "Dijkstra Time Complexity with Min-Heap: O((V + E) log V)",
          "Dijkstra fails on negative edge weights; use Bellman-Ford with O(V*E)",
          "Topological sort requires Directed Acyclic Graph (DAG) using in-degree array (Kahn's algo)",
        ],
      },
      {
        title: "Module 3: Dynamic Programming on Trees & Memoization",
        summary: "Solving Tree Diameter and Maximum Path Sum without redundant tree traversals.",
        keyFormulasOrTips: [
          "Post-order traversal allows bottom-up evaluation of tree DP subproblems",
          "Store (max_ending_at_node, max_overall_diameter) at every recursive step",
        ],
      },
    ],
    content: `## 📌 Executive Summary
These handwritten master notes were compiled during semester 3 midterms and end-semesters. Follow this exact template for university theory papers: State definition -> Draw state transition -> Write pseudo-code -> Show time & space complexity table.

---

### 1. AVL Tree Rotations Cheat Sheet
When inserting into an AVL tree, check balance factor $(BF = H_L - H_R)$ bottom-up from insertion node:
- **LL Case**: Node inserted into left subtree of left child $\\rightarrow$ Single **Right Rotate(A)**
- **RR Case**: Node inserted into right subtree of right child $\\rightarrow$ Single **Left Rotate(A)**
- **LR Case**: Node inserted into right subtree of left child $\\rightarrow$ **Left Rotate(Left Child)** followed by **Right Rotate(A)**
- **RL Case**: Node inserted into left subtree of right child $\\rightarrow$ **Right Rotate(Right Child)** followed by **Left Rotate(A)**

### 2. Standard Exam Mistakes to Avoid:
1. Forgetting to recompute heights after rotation.
2. In graph traversal questions, always initialize \`visited[]\` to all \`false\` before calling BFS/DFS.
3. In connected components count, loop $1 \\dots V$ and trigger DFS for every unvisited node.`,
  },
  {
    id: "note-engg-maths-transform",
    title: "Engineering Mathematics III: Laplace, Fourier & Z-Transforms Quick Master",
    subject: "Engineering Mathematics III",
    branch: "Common 1st Year",
    semester: "Sem 3",
    author: "Ayush G. (App Owner)",
    authorRank: "University Gold Medalist (10.0 in M3)",
    authorCollege: "Department of Applied Mathematics",
    description: "Formula sheets, shifting theorem derivations, convolution integrals, and step-by-step differential equation solving by Laplace transform.",
    isFree: true,
    pagesCount: 44,
    readTimeMinutes: 30,
    tags: ["Maths", "Laplace", "Fourier", "Formula Sheet", "End-Sem"],
    lastUpdated: "2026-09-02",
    featured: true,
    chapters: [
      {
        title: "Unit 1: Laplace Transform Essentials & First/Second Shifting",
        summary: "Standard elementary transform pairs and proof shortcuts for unit step and Dirac delta functions.",
        keyFormulasOrTips: [
          "L{t^n} = n! / s^(n+1)",
          "L{e^(at) f(t)} = F(s - a) (First Shifting Property)",
          "L{f'(t)} = s F(s) - f(0)",
          "L{f''(t)} = s^2 F(s) - s f(0) - f'(0)",
        ],
      },
      {
        title: "Unit 2: Inverse Laplace & Convolution Theorem",
        summary: "Partial fraction decompositions and convolution integral evaluations without complex contour integrals.",
        keyFormulasOrTips: [
          "L^-1{F(s) G(s)} = ∫ from 0 to t of f(u) g(t - u) du",
          "Heaviside unit step function u(t - a): L{u(t - a)} = e^(-as) / s",
        ],
      },
      {
        title: "Unit 3: Fourier Transforms & Half-Range Expansions",
        summary: "Fourier sine/cosine transforms, Dirichlet conditions checklist, and Parseval's theorem applications.",
        keyFormulasOrTips: [
          "Dirichlet conditions: f(t) is single-valued, bounded, with finite discontinuities in (-L, L)",
          "For even functions, Fourier Sine coefficients Bn = 0",
        ],
      },
    ],
    content: `## 📐 Engineering Mathematics III Formula Bank
Every question in paper Section A can be solved in under 4 minutes if you master the shifting properties and partial fraction patterns.

---

### Key Laplace Transforms:
- $\\mathcal{L}\\{\\sin(at)\\} = \\frac{a}{s^2 + a^2}$
- $\\mathcal{L}\\{\\cos(at)\\} = \\frac{s}{s^2 + a^2}$
- $\\mathcal{L}\\{\\sinh(at)\\} = \\frac{a}{s^2 - a^2}$
- $\\mathcal{L}\\{\\cosh(at)\\} = \\frac{s}{s^2 - a^2}$
- $\\mathcal{L}\\{t^n e^{at}\\} = \\frac{n!}{(s - a)^{n+1}}$

### ⚠️ Common Trap:
When finding inverse transform of $\\frac{s}{(s^2 + 4)^2}$, rewrite using differentiation property $\\mathcal{L}\\{t \\sin(2t)\\} = -\\frac{d}{ds}\\left(\\frac{2}{s^2 + 4}\\right) = \\frac{4s}{(s^2 + 4)^2}$.`,
  },
  {
    id: "note-thermodynamics-ic-engines",
    title: "Applied Thermodynamics: Steam Tables, Cycles & Refrigeration Cheat Sheet",
    subject: "Applied Thermodynamics",
    branch: "Mechanical",
    semester: "Sem 4",
    author: "Ayush G. (App Owner)",
    authorRank: "9.92 CGPA • GATE Top 100 Scorer",
    authorCollege: "Department of Mechanical Engineering",
    description: "Hand-drawn P-v, T-s, and h-s (Mollier) diagrams for Otto, Diesel, Dual, Rankine, and Vapour Compression Refrigeration (VCR) cycles.",
    isFree: true,
    pagesCount: 52,
    readTimeMinutes: 35,
    tags: ["Thermodynamics", "Mollier Diagram", "Rankine", "Otto Cycle", "Mechanical"],
    lastUpdated: "2026-08-15",
    featured: false,
    chapters: [
      {
        title: "Chapter 1: Air Standard Cycles (Otto, Diesel, Dual Comparison)",
        summary: "Clear comparison on basis of maximum pressure, temperature, and compression ratio.",
        keyFormulasOrTips: [
          "Efficiency of Otto Cycle: η = 1 - (1 / r^(γ - 1))",
          "For same compression ratio r: η_Otto > η_Dual > η_Diesel",
          "For same maximum pressure & peak temperature: η_Diesel > η_Dual > η_Otto",
        ],
      },
      {
        title: "Chapter 2: Rankine Cycle with Reheat & Regeneration",
        summary: "Turbine work calculation, pump work corrections, and feed-water heater energy balance.",
        keyFormulasOrTips: [
          "W_net = W_turbine - W_pump = (h1 - h2) - v_f (P_boiler - P_condenser)",
          "Reheating increases steam dryness fraction at condenser inlet, avoiding turbine blade erosion",
        ],
      },
      {
        title: "Chapter 3: VCR Refrigeration & Psychrometric Charts",
        summary: "COP calculations, subcooling, superheating effects on evaporator capacity and compressor work.",
        keyFormulasOrTips: [
          "COP = Desired Effect / Work Input = (h1 - h4) / (h2 - h1)",
          "Subcooling increases refrigerating effect without increasing compressor work",
        ],
      },
    ],
    content: `## 🔥 Thermodynamics High-Scoring Guide
Examiners award full marks when you draw corresponding **P-v** and **T-s** diagrams side-by-side with properly numbered states and arrows indicating process directions.

---

### Step-by-Step Rankine Cycle Numerical Method:
1. Look up state 1 (Boiler Exit) from steam tables using $(P_{boiler}, T_{boiler})$. Note $h_1, s_1$.
2. Isentropic expansion to condenser: $s_2 = s_1$. If $s_2 < s_g$ at $P_{cond}$, calculate dryness factor $x_2 = \\frac{s_2 - s_f}{s_{fg}}$.
3. Compute enthalpy $h_2 = h_f + x_2 h_{fg}$.
4. Pump work $W_p = v_f (P_{boiler} - P_{cond}) \\approx 0.001008 \\times \\Delta P$.`,
  },
  {
    id: "note-dbms-sql-normalization",
    title: "Database Management Systems: Normalization, ER Diagrams & ACID Transactions",
    subject: "Database Management Systems",
    branch: "Computer Science",
    semester: "Sem 4",
    author: "Ayush G. (App Owner)",
    authorRank: "Branch Rank 1 • DBMS Lab Topper",
    authorCollege: "Department of Computer Science & Engineering",
    description: "Guaranteed rules for 1NF, 2NF, 3NF, BCNF decomposition without losing lossless-join or dependency preservation. Complete SQL queries & indexing.",
    isFree: true,
    pagesCount: 36,
    readTimeMinutes: 22,
    tags: ["DBMS", "SQL", "Normalization", "BCNF", "Transactions"],
    lastUpdated: "2026-09-05",
    featured: false,
    chapters: [
      {
        title: "Unit 1: Functional Dependencies & Normal Forms (1NF to BCNF)",
        summary: "Systematic algorithm to test candidate keys and classify highest normal form.",
        keyFormulasOrTips: [
          "1NF: Atomic attribute values only (no repeating groups/multivalued sets)",
          "2NF: In 1NF and no non-prime attribute is partially dependent on any candidate key",
          "3NF: In 2NF and for every non-trivial X -> A, either X is super key or A is prime attribute",
          "BCNF: In 3NF and for every non-trivial X -> A, X must strictly be a super key",
        ],
      },
      {
        title: "Unit 2: Lossless Join & Dependency Preservation Test",
        summary: "Table decomposition validation rules for university exams.",
        keyFormulasOrTips: [
          "R1 ∩ R2 -> R1 or R1 ∩ R2 -> R2 must hold for a 2-table decomposition to be lossless",
          "Every 3NF decomposition can guarantee both Lossless Join AND Dependency Preservation",
          "BCNF guarantees Lossless Join, but might NOT always preserve all functional dependencies",
        ],
      },
      {
        title: "Unit 3: ACID Properties & Conflict Serializability",
        summary: "Precedence graph (serialization graph) loop detection method.",
        keyFormulasOrTips: [
          "Conflict operations: Read-Write, Write-Read, Write-Write on SAME data item by different transactions",
          "If the Precedence Graph has NO cycles, the schedule is Conflict Serializable",
        ],
      },
    ],
    content: `## 💾 DBMS End-Semester Rapid Revision
Master the candidate key closure algorithm: to find candidate keys, compute attribute closures $(X^+)$ using Armstrong axioms until all attributes of relation $R$ are derived.

---

### Quick Normal Form Checklist:
- Does relation have composite key? If NO composite key exists, it is automatically in **2NF**!
- Is every determinant a super key? If YES, relation is in **BCNF**!
- Are there transitive dependencies? If NO, relation is in **3NF**!`,
  },
];
