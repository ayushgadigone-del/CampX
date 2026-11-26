# Free Deployment Guide — GitHub + Render (No Credit Card Required)

Deploy **Campus Resale** (React frontend + Express API + Google SMTP OTP + Gemini AI inspection + Firebase Firestore) for **$0/month** with no billing card needed.

---

## Step 1: Push Your Code to GitHub
1. In Google AI Studio, click **Save to GitHub** (or download the project ZIP and push it to a new GitHub repository).
2. Double-check that `.env` is **not** committed (`.gitignore` already excludes `.env*`, `node_modules/`, `dist/`, and `server.js`).

---

## Step 2: Deploy for Free on Render (Zero Card Required)
1. Go to [render.com](https://render.com) and sign in with your **GitHub** account.
2. Click **New +** → **Blueprint** (this automatically reads `render.yaml` from your repo).
3. Select your Campus Resale GitHub repository and click **Connect**.
4. Render will prompt you for the 4 secret values marked `sync: false`:
   - `GEMINI_API_KEY` — Your Gemini API key from Google AI Studio
   - `SMTP_USER` — Your Gmail address (e.g. `yourname@gmail.com`)
   - `SMTP_PASS` — Your 16-character **Google App Password** (Google Account → Security → 2-Step Verification → App passwords)
   - `SMTP_FROM` — Sender display name & email (e.g. `Campus Resale <yourname@gmail.com>`)
   *(Note: `NODE_ENV=production`, `NODE_VERSION=22`, `SMTP_HOST=smtp.gmail.com`, and `SMTP_PORT=587` are already pre-filled by `render.yaml`.)*
5. Click **Apply** and wait ~2–4 minutes for the first build to finish.
6. Copy your live URL from the top of the Render dashboard (for example: `https://campus-resale.onrender.com`).

---

## Step 3: One-Time Firebase Console Setup
1. **Enable Email/Password Sign-In:**
   - Open [Firebase Authentication → Sign-in method](https://console.firebase.google.com/project/gen-lang-client-0698009436/authentication/providers).
   - Enable **Email/Password** (keep "Email link" off) and click **Save**.
2. **Allowlist Your Render Domain:**
   - Open [Firebase Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/gen-lang-client-0698009436/authentication/settings).
   - Click **Add domain**, paste only the hostname (e.g. `campus-resale.onrender.com`, without `https://`), and click **Add**.

---

## What to Expect on the 100% Free Stack
- **Render Free Web Service:** Sleeps after 15 minutes of zero traffic and takes ~30–50 seconds to wake up on the next visit. Every GitHub push auto-redeploys.
- **Firebase Spark Plan (Free):** 1 GiB Firestore storage + persistent student accounts/listings/chats that never reset when Render sleeps.
- **Google SMTP (Free Gmail):** Up to ~500 OTP verification emails per day using an App Password.
