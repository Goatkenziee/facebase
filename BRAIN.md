# BRAIN.md — FaceBase

## What this app does
Real-time face detection platform with webcam, image upload, and smart glasses connectivity. Detects faces, recognizes names, and connects with compatible smart glasses for hands-free field use.

## Current state — v0.2.0
**What I built** — Added three new pages (Dashboard, Smart Glasses, Upload) and wired real face-api.js detection into the camera loop. The app now has a complete multi-page navigation flow with live camera detection, image upload with drag-drop, dashboard with detection history/stats, and a smart glasses connection management page.

**Pages:**
- **Landing** (`/`) — Hero section with feature cards, Start Camera / Upload buttons
- **Camera** (`/` → camera mode) — Live webcam feed with real face-api.js detection, bounding box overlay, face count badge
- **Upload** (`/upload`) — Drag-drop image upload with face detection processing
- **Dashboard** (`/dashboard`) — Detection history table, stats cards (total detections, faces found, avg confidence), real-time cam preview
- **Glasses** (`/glasses`) — Smart glasses connection management (connect/disconnect, status, device info)

**Tech stack:** Next.js 14 App Router · TypeScript · Tailwind CSS · face-api.js + TensorFlow.js · Prisma (PostgreSQL) · Framer Motion · Lucide icons

**GitHub:** https://github.com/Goatkenziee/facebase
**Live preview:** https://3000-ism8wzx18fj9jg5sogy29.e2b.app

## Run it locally
```bash
git clone https://github.com/Goatkenziee/facebase
cd facebase
cp .env.example .env.local
npm install
npm run dev
```

## What's been built (41 files)
- Full design system: components/ui (Button, Card, Badge, Input, Tabs, Dialog, Table, Toast, Skeleton, Spinner, StatCard, CommandPalette)
- Layout: AppShell (sidebar nav), Container, PageHeader
- States: Loading, EmptyState, ErrorState
- Auth: AuthForm component (Clerk-ready)
- Face detection engine: lib/face-detection.ts (real face-api.js integration), hooks/use-face-detection.ts (React hook)
- Pages: Landing/Camera, Upload, Dashboard, Smart Glasses
- Database: Prisma schema (User, Detection models)
- Config: next.config.mjs, tailwind.config.ts, tsconfig.json, postcss.config.js

## What's pending
- Deploy to Vercel (needs Vercel integration reconnected)
- Wire Prisma to a real PostgreSQL database (set DATABASE_URL)
- Wire name recognition against saved profiles
- Smart glasses real API integration
- Authentication (Clerk or custom)

## Latest verification
- ✅ Build compiles clean (`npm run build` exits 0)
- ✅ Preview serves at port 3000
- ✅ Page renders without runtime errors (verified in browser)
- ⚠️ Prisma schema validation fails without DATABASE_URL (expected — needs real DB)

## User preferences
- Keep changes focused, modern, production-ready
- On-device processing for privacy
- Dark theme with amber accent
