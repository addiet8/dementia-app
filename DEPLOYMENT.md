# Deploying MindMate to Vercel

This guide walks you through deploying the MindMate application to Vercel.

---

## 1. Quick Deployment Steps

### Option A: Via GitHub (Recommended)

1. **Commit and Push Changes to GitHub**:
   ```bash
   git add .
   git commit -m "feat: complete MindMate with Caregiver Dashboard, Check-ins, Notifications, and Vercel setup"
   git push origin main
   ```

2. **Import Project into Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new).
   - Select your GitHub repository (`addiet8/dementia-app`).
   - Leave the Framework Preset as **Next.js**.
   - Root directory should remain `./`.

3. **Configure Environment Variables in Vercel**:
   In the **Environment Variables** section during project setup (or under **Project Settings → Environment Variables**), add the following:

   | Variable Name | Value | Required? | Description |
   | :--- | :--- | :--- | :--- |
   | `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | **Yes** | Your Supabase Project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJh...` | **Yes** | Your Supabase Project Public Anon Key |
   | `GROQ_API_KEY` | `gsk_...` | Optional | Groq API Key for AI companion |
   | `NEXT_PUBLIC_GROQ_API_KEY` | `gsk_...` | Optional | Groq API Key client fallback |

4. **Click Deploy**:
   - Vercel will automatically run `npm run build` and deploy your application.

---

## 2. Supabase Auth Redirect Configuration

After deploying, you will receive your production URL (e.g. `https://dementia-app.vercel.app`).
You must configure Supabase to allow authentication redirects to this domain:

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard).
2. Select your project and navigate to **Authentication → URL Configuration**.
3. Set **Site URL** to:
   ```text
   https://your-vercel-domain.vercel.app
   ```
4. In **Redirect URLs**, add:
   ```text
   https://your-vercel-domain.vercel.app/**
   https://your-vercel-domain.vercel.app/auth/login
   https://your-vercel-domain.vercel.app/dashboard
   https://your-vercel-domain.vercel.app/caregiver
   ```
5. Click **Save**.

---

## 3. Storage Bucket Setup (for Memory Photos)

Ensure the public storage bucket for photos is created:
1. In Supabase Dashboard, go to **Storage → Buckets**.
2. If `memory-photos` does not exist:
   - Click **New bucket**.
   - Name: `memory-photos`.
   - Toggle **Public bucket** to **ON**.
   - Click **Save bucket**.

---

## 4. Verification Checklist

After deployment completes:
- [ ] Open your live Vercel URL.
- [ ] Verify the landing page loads.
- [ ] Test signing in or creating an account.
- [ ] Go to `/profile` and click **"Load 30-Day Demo Data"** to verify database connectivity.
- [ ] Verify both Patient Portal (`/dashboard`) and Caregiver Portal (`/caregiver`) display data correctly.
