# Free Deployment Guide — GitHub + Render (No Credit Card Required)

Deploy **Campus Resale** (React frontend + Express API + Firebase HTTPS Email Verification + Gemini AI inspection + Firebase Firestore) for **$0/month** with no billing card and **no SMTP setup** needed.

---

## Step 1: Push Your Code to GitHub
1. In Google AI Studio, click **Save to GitHub** (or download the project ZIP and push it to your GitHub repository).
2. `.gitignore` automatically excludes `.env*`, `node_modules/`, `dist/`, and `server.js`.

---

## Step 2: Deploy for Free on Render (Zero Card Required)
1. Go to [render.com](https://render.com) and sign in with your **GitHub** account.
2. Click **New +** → **Blueprint** (this automatically reads `render.yaml` from your repo).
3. Select your Campus Resale GitHub repository and click **Connect**.
4. Render will prompt you for only **1 secret**:
   - `GEMINI_API_KEY` — Your Gemini API key from Google AI Studio
   *(No SMTP variables needed—Firebase Auth sends verification and password-reset emails directly over HTTPS, which Render never blocks.)*
5. Click **Apply** and wait ~2–4 minutes for the build to finish.
6. Copy your live URL from Render (for example: `https://campus-resale.onrender.com`).

---

## Step 3: One-Time Firebase Console Setup
1. **Enable Email/Password Sign-In:**
   - Open [Firebase Authentication → Sign-in method](https://console.firebase.google.com/project/gen-lang-client-0698009436/authentication/providers).
   - Enable **Email/Password** (keep "Email link (passwordless sign-in)" off) and click **Save**.
2. **Allowlist Your Render Domain:**
   - Open [Firebase Authentication → Settings → Authorized domains](https://console.firebase.google.com/project/gen-lang-client-0698009436/authentication/settings).
   - Click **Add domain**, paste only the hostname (e.g. `campus-resale.onrender.com`, without `https://`), and click **Add**.

---

## What to Expect on the 100% Free Stack
- **Render Free Web Service:** Sleeps after 15 minutes of zero traffic and takes ~30–50 seconds to wake up on the next visit. Every GitHub push auto-redeploys.
- **Firebase Auth & Spark Plan (Free):** Built-in HTTPS email verification + password reset + 1 GiB Firestore storage that persists permanently across Render restarts.
