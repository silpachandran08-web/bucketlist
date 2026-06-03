# 🌴 Our Bucket List — Setup Guide

A beautiful bucket list app for you and your wife, powered by Next.js + Upstash + Vercel.

---

## Step 1: Create an Upstash Redis database

1. Go to [console.upstash.com](https://console.upstash.com) → Sign up (free)
2. Click **Create Database** → choose a region close to you (e.g. `ap-south-1` for India)
3. After creation, click on your database → go to **REST API** tab
4. Copy:
   - **UPSTASH_REDIS_REST_URL**
   - **UPSTASH_REDIS_REST_TOKEN**

---

## Step 2: Deploy to Vercel

1. Push this folder to a GitHub repository
   ```
   git init
   git add .
   git commit -m "Initial commit"
   # Create a repo on github.com, then:
   git remote add origin https://github.com/YOUR_USERNAME/bucket-list-app.git
   git push -u origin main
   ```

2. Go to [vercel.com](https://vercel.com) → Sign in with GitHub
3. Click **Add New Project** → import your repository
4. In the **Environment Variables** section, add:

   | Key | Value |
   |-----|-------|
   | `UPSTASH_REDIS_REST_URL` | (paste from Upstash) |
   | `UPSTASH_REDIS_REST_TOKEN` | (paste from Upstash) |
   | `APP_PASSWORD` | `your-chosen-password` (share this with your wife) |
   | `AUTH_SECRET` | any random 32+ character string |

5. Click **Deploy** — done! 🎉

---

## Step 3: Use the app

- Open your Vercel URL on phone or laptop
- Enter the shared password
- Start adding your dreams together! 💑

---

## Features

- **4 Categories:** Travel ✈️ · Shopping 🛍️ · Experiences 🎯 · Food 🍽️
- **Savings tracker:** Shared pot + per-item savings with progress bars
- **Status tracking:** Dreaming → Planned → Saving → Done!
- **Priority levels:** Low / Medium / High
- **Target dates & locations**
- **Beautiful tropical design** — works on phone and laptop
- **Shared access** — one password for both of you

---

## Local development (optional)

```bash
cp .env.example .env.local
# Fill in your values in .env.local

npm install
npm run dev
# Open http://localhost:3000
```
