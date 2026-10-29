# 🎓 Campus Resale & Exchange

> **A verified peer-to-peer college marketplace for student gear, textbooks, lab equipment, and bicycles with multimodal Gemini AI item inspection and Google Calendar handover coordination.**

[![React](https://img.shields.io/badge/React-19.0-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4.1-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-ffca28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Gemini API](https://img.shields.io/badge/Google%20GenAI-Gemini%20API-4285f4?logo=google&logoColor=white)](https://ai.google.dev/)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)

---

## 🌟 Overview

**Campus Resale & Exchange** is a production-ready full-stack college marketplace built for students at **PVG's COET & GKP(W) Pune**. It addresses the friction of campus peer handovers by combining institutional email authentication, automated condition inspection via Google Gemini AI, peer seller reputation scoring, and direct Google Calendar handover scheduling.

---

## ✨ Key Features

- 🤖 **AI Item Condition Inspector**: Upload photos to automatically detect categories, assess surface wear, generate fair campus price ranges (₹), and verify authenticity markers powered by the `@google/genai` SDK.
- 🛡️ **Verified Student Identity & Digital Passport**: Enforces institutional domain authentication (`@pvgcoet.ac.in`) with holographic verification seals and department badges.
- 📊 **Seller Reputation & Radar Chart**: Visual breakdown of seller historical reviews featuring an interactive SVG Radar Chart graphing **Communication**, **Punctuality**, and **Item Accuracy**.
- 📅 **Google Calendar Handover Sync**: Schedule on-campus handovers (Library Quad, Workshop Shed, Canteen Porch) directly into Google Calendar via Google Calendar API scopes.
- 🤝 **Dual Mode: Cash (₹) & Peer Barter**: Post items for direct sale or proposal-based barter exchange with side-by-side spec comparison drawers.
- 📱 **Fully Responsive with Mobile Sliders**: Custom touch-swiping horizontal sliders for category filters, micro-stats, search console shortcuts, and chat cards on mobile devices.
- 👁️ **Recently Viewed Carousel**: Tracks the last 5 inspected listings with quick removal and offline-safe indicators.
- ⚡ **Framer Motion Micro-Interactions**: Smooth staggered entrance animations for listing cards, animated modal transitions, and 3D card tilt on desktop hover.
- 🔒 **Production Hardening**: In-memory rate limiting, security headers (`nosniff`, `X-XSS-Protection`, `Referrer-Policy`), automated API key secret redaction, and strict input validation.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Framer Motion, Lucide Icons, Recharts |
| **Backend** | Express.js, Node.js (v20+ / v22+), `@google/genai` TypeScript SDK, esbuild |
| **Database & Auth** | Firebase Firestore (Realtime DB), Firebase Authentication (Google Auth Provider) |
| **Integrations** | Google Gemini Multimodal Vision API, Google Calendar API |

---

## 📂 Project Structure

```
├── .env.example                # Template for environment variables
├── firebase-applet-config.json # Firebase project and credentials config
├── firebase-blueprint.json    # Firestore schema & security definitions
├── firestore.rules            # Firestore security rules
├── index.html                 # Main HTML entry point
├── metadata.json              # App metadata & AI Studio capabilities
├── package.json               # Dependencies, scripts, and build pipeline
├── server.ts                  # Production & dev Express server (API proxy + SSR/SPA)
├── tsconfig.json              # TypeScript compilation rules
├── vite.config.ts             # Vite configuration with Tailwind CSS v4 plugin
└── src/
    ├── App.tsx                # Main marketplace view & state orchestration
    ├── main.tsx               # Client React DOM entry point
    ├── types.ts               # Shared TypeScript data contracts
    ├── components/            # UI components
    │   ├── AIItemInspectorModal.tsx     # Gemini AI image analysis interface
    │   ├── CalendarHandoverModal.tsx    # Google Calendar scheduling
    │   ├── CampusLiveTicker.tsx         # Real-time campus drops ticker
    │   ├── DedicatedSearchBar.tsx       # Search bar with filter chips
    │   ├── EngineeringBentoHero.tsx     # Bento-style stats and hero
    │   ├── HorizontalSlider.tsx         # Reusable mobile touch slider
    │   ├── ListingCard.tsx              # Animated listing card with 3D tilt
    │   ├── StudentPassportModal.tsx     # Seller passport & radar chart
    │   ├── YourChatsSection.tsx         # Negotiation threads & chats
    │   └── ...
    ├── context/               # Global context (Theme, Auth, etc.)
    ├── data/                  # Initial seed listings & topper notes data
    ├── lib/                   # Firebase client initialization
    └── utils/                 # Reputation formulas, expiry, & validation helpers
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v20.0.0 or higher (v22 recommended)
- **npm** or **bun** / **pnpm**
- A **Gemini API Key** from [Google AI Studio](https://aistudio.google.com/apikey)

### 2. Clone the Repository
```bash
git clone https://github.com/YOUR_USERNAME/campus-resale-exchange.git
cd campus-resale-exchange
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Environment Variables
Copy the example environment file:
```bash
cp .env.example .env
```

Open `.env` and fill in your keys:
```env
# Google Gemini API Key for AI item condition inspection
GEMINI_API_KEY="your-gemini-api-key-here"

# Application URL (for local dev)
APP_URL="http://localhost:3000"

# Optional: custom port (defaults to 3000)
PORT=3000
```

### 5. Start Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

### Quick Fix: Deploying to GitHub Pages (`ayushgadigone-del.github.io/CampX`)

If your site at `https://ayushgadigone-del.github.io/CampX/` shows a **blank white page**, it is caused by two common GitHub Pages configuration issues:

1. **Asset Base Path 404 (Fixed)**: 
   - By default, Vite generates asset links starting with `/assets/...`. When hosted under a repository subfolder (`/CampX/`), the browser tries to fetch `https://ayushgadigone-del.github.io/assets/...` (which doesn't exist) instead of `https://ayushgadigone-del.github.io/CampX/assets/...`.
   - **Fix applied**: `vite.config.ts` has been configured with `base: './'`, ensuring all scripts and stylesheets load relative to the `/CampX/` folder.

2. **GitHub Pages Source Setting (Needs 1-click update on GitHub)**:
   - If GitHub Pages is set to **"Deploy from a branch (main / root)"**, GitHub Pages serves raw files directly from the repository, including unbundled `<script src="/src/main.tsx">`, which browsers cannot execute.
   - **How to fix in 30 seconds**:
     1. Go to your repository: **`https://github.com/ayushgadigone-del/CampX`**
     2. Click **Settings** (top navigation tab) &rarr; **Pages** (in the left sidebar).
     3. Under **Build and deployment &rarr; Source**, click the dropdown and change it from *"Deploy from a branch"* to **"GitHub Actions"**.
     4. Push the latest code (including the `.github/workflows/deploy.yml` workflow provided in this repository):
        ```bash
        git add .
        git commit -m "Configure GitHub Pages workflow with relative base"
        git push origin main
        ```
     5. Go to the **Actions** tab on your repository to watch the build finish (~60 seconds). Once the checkmark turns green, refresh `https://ayushgadigone-del.github.io/CampX/` and the marketplace will appear!

> **Note on Static Hosting vs Backend Services**: GitHub Pages is a static file host (runs HTML, CSS, JavaScript in the browser). All marketplace features, listings, filters, local state, and UI work directly on GitHub Pages. For the multimodal Gemini AI inspection (`/api/analyze-item`), which uses a secure server-side Node.js environment to protect your Gemini API key, use **Option 1 (Render)** or **Option 2 (Railway)** below.

---

### Option 1: Deploy on Render (Recommended • Full-Stack Web Service)

Render runs both the Express backend API and serves the compiled React frontend from a single service.

1. **Push to GitHub**:
   Push your code to your GitHub repository:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. **Create a New Web Service on Render**:
   - Go to [dashboard.render.com](https://dashboard.render.com/) and click **New +** > **Web Service**.
   - Connect your GitHub repository (`campus-resale-exchange`).
3. **Configure Settings**:
   - **Name**: `campus-resale-exchange`
   - **Region**: Choose the closest region (e.g., Singapore, Frankfurt, Oregon)
   - **Branch**: `main`
   - **Root Directory**: *(leave blank)*
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server.js`
4. **Set Environment Variables**:
   Under the **Environment Variables** tab, add:
   - `GEMINI_API_KEY`: *(Your Google Gemini API Key)*
   - `NODE_ENV`: `production`
   - `PORT`: `10000` *(Render sets this automatically, but configuring it ensures consistency)*
5. **Click "Create Web Service"**:
   Render will automatically pull from GitHub, run the build, and deploy your live URL (e.g. `https://campus-resale-exchange.onrender.com`).

---

### Option 2: Deploy on Railway

Railway automatically detects Node.js projects and provides instant deployments on Git push.

1. Go to [railway.app](https://railway.app/) and click **New Project** > **Deploy from GitHub repo**.
2. Select your repository.
3. In **Settings** > **Build**:
   - **Build Command**: `npm run build`
   - **Start Command**: `node server.js`
4. In **Variables**:
   - Add `GEMINI_API_KEY` = `your-gemini-api-key`
   - Add `NODE_ENV` = `production`
5. Generate a public domain under **Networking** > **Generate Domain**.

---

### Option 3: Deploy to Google Cloud Run (from GitHub)

Because this repository contains a self-contained Express server and compiled production bundle, you can deploy it directly via Google Cloud Run:

1. **Connect GitHub in Google Cloud Console**:
   - Navigate to **Cloud Run** > **Create Service**.
   - Choose **"Continuously deploy from a repository"** and connect your GitHub account.
   - Select your repository and the `main` branch.
   - Select **Build Type**: `Google Cloud's buildpack` or use the included `Dockerfile`.
2. **Configure Service**:
   - **Authentication**: Allow unauthenticated invocations (public web app).
   - **Port**: `3000` (or `8080`)
   - **Environment Variables**: Add `GEMINI_API_KEY`.
3. Click **Create** to deploy.

---

### Option 4: Deploy with Docker (Any VPS / DigitalOcean / Fly.io / AWS ECS)

Build and run anywhere with Docker:

```bash
# Build the Docker image
docker build -t campus-resale-exchange .

# Run the container locally or on a VPS
docker run -p 3000:3000 -e GEMINI_API_KEY="your-api-key" campus-resale-exchange
```

---

## 🔐 Firebase & Google OAuth Configuration for Production

When deploying to a custom domain (e.g., `https://campus-resale.onrender.com` or `https://resale.yourcollege.edu`):

1. **Add Production Domain to Firebase Auth**:
   - Open the [Firebase Console](https://console.firebase.google.com/).
   - Select your project (`gen-lang-client-0698009436` or your own project).
   - Go to **Authentication** > **Settings** > **Authorized domains**.
   - Click **Add domain** and enter your production hostname (e.g., `campus-resale.onrender.com`).

2. **Add Production Domain to Google Cloud Console (Calendar & Google Auth)**:
   - Go to [Google Cloud Console > Credentials](https://console.cloud.google.com/apis/credentials).
   - Click on your OAuth 2.0 Client ID.
   - Under **Authorized JavaScript origins**, add your live URL (e.g., `https://campus-resale.onrender.com`).
   - Under **Authorized redirect URIs**, add `https://campus-resale.onrender.com/__/auth/handler`.
   - Save changes.

---

## 📜 Available NPM Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Runs the full-stack development server with Vite HMR + Express on port 3000 |
| `npm run build` | Builds the client SPA (`dist/`) and bundles `server.ts` into `server.js` |
| `npm run start` | Runs the compiled server in production mode (`node server.js`) |
| `npm run lint` | Runs TypeScript type checking (`tsc --noEmit`) |
| `npm run preview` | Previews the production Vite build locally |
| `npm run clean` | Removes the `dist/` build directory |

---

## 🤝 Contributing

Contributions are welcome! If you want to add features like UPI peer escrow, QR-code handovers, or hostel delivery pins:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/CampusFeature`)
3. Commit your Changes (`git commit -m 'Add awesome campus feature'`)
4. Push to the Branch (`git push origin feature/CampusFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. Built with ❤️ for the student community at **PVG's COET Pune**.
