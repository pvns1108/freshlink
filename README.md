# 🌿 FreshLink — AI Food Freshness & Donation Automation

> **Turn Food Waste Into Food Impact.**
> FreshLink uses AI-assisted food screening, expiry intelligence and automated NGO matching to help households, shops, restaurants and NGOs redirect surplus food before it becomes waste.

This is a **hackathon prototype (MVP)** — not a certified food-safety system. See [Important AI Limitation](#-important-ai-limitation) below.

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [The Solution](#the-solution)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [How to Run](#how-to-run)
- [Demo Credentials](#demo-credentials)
- [Main URLs](#main-urls)
- [API Documentation](#api-documentation)
- [The AI Workflow](#the-ai-workflow)
- [The Priority Algorithm](#the-priority-algorithm)
- [The Automation Engine](#the-automation-engine)
- [What Was Implemented](#what-was-implemented)
- [Known Limitations](#known-limitations)
- [Future Improvements](#future-improvements)
- [⚠️ Important AI Limitation](#-important-ai-limitation)

---

## Overview

Roughly a third of all food produced is never eaten. A lot of it doesn't spoil suddenly — it just quietly slides past its "use by" window while nobody's watching closely enough, in a fridge, a stockroom, or a shop's cold case. FreshLink is a demo of what happens if something *is* watching: an AI-assisted screening step, a transparent urgency score, and an automation layer that turns "this is about to go to waste" into "this is already on its way to someone who needs it" — without anyone having to manually hunt down a charity, make a phone call, and hope they pick up.

## The Problem

- Households, shops and restaurants routinely discard food that's still perfectly usable, simply because nobody caught it in time.
- Even when surplus food *is* identified, connecting it to a nearby NGO that can actually use it is manual, slow, and inconsistent.
- Cold-chain issues (a fridge that crept a few degrees too warm overnight) often go unnoticed until the food is visibly bad.

## The Solution

FreshLink combines four pieces into one pipeline:

1. **AI-assisted screening** — scan a food photo (or just type the name) and get an indicative condition read, not a certification.
2. **Expiry intelligence** — OCR reads dates off packaging where possible; a transparent priority engine scores urgency from expiry date, condition, quantity and (optionally) storage temperature.
3. **Automated workflows** — fresh items get a reminder, near-expiry items get a "use soon / discount / donate" nudge, donation-worthy items are automatically listed.
4. **NGO matching** — donation candidates are automatically ranked against nearby NGOs by distance, category fit, capacity and urgency, matched, and tracked from pending to picked-up.

Every step is logged in the **Automation Center**, so the whole pipeline is auditable rather than a black box.

---

## Features

| Area | What it does |
|---|---|
| **Auth** | JWT + bcrypt, role-based (household / shop / NGO / admin), 4 pre-seeded demo accounts |
| **Dashboard** | Role-aware stat cards + 4 charts (status distribution, monthly waste reduction, donation status, expiry timeline) |
| **Scan Food** | Drag-and-drop image upload or manual entry → OCR expiry detection → AI condition screening → priority score → automated workflow, all in one flow |
| **Inventory** | Filterable/sortable table, add/edit/delete, one-click "Donate", cold-chain temperature chart (shop/admin) |
| **Donations** | Full lifecycle tracking: Pending → Matched → Accepted → Pickup Scheduled → Picked Up → Completed / Cancelled |
| **NGOs** | Nearby NGOs ranked by a transparent match score, with distance, capacity, contact info |
| **Automation Center** | A timestamped, human-readable log of every automated decision the system made |
| **AI Insights** | Category-level waste-risk breakdown, expiring-soon count, estimated kg preventable — all clearly labeled as estimates |
| **Notifications** | In-app notification center + a simulated email hook (logs to console, easy to wire to a real provider) |
| **Temperature monitoring** | Simulated IoT sensor readings with automatic excursion detection |

---

## Architecture

```
┌─────────────┐      REST/JSON       ┌──────────────┐      Mongoose       ┌───────────┐
│   React /   │ ───────────────────► │   Express    │ ──────────────────► │  MongoDB  │
│   Vite SPA  │ ◄─────────────────── │   API        │ ◄────────────────── │ (or in-   │
└─────────────┘                      └──────┬───────┘                     │  memory)  │
                                             │                             └───────────┘
                                             ▼
                      ┌──────────────────────────────────────────┐
                      │           Automation Engine               │
                      │  AI/OCR service → Priority engine →       │
                      │  Workflow decision → Donation +           │
                      │  NGO matching → Notifications → Logs      │
                      └──────────────────────────────────────────┘
```

The automation engine (`server/services/automationEngine.js`) is the core of the "not just CRUD" story: every food item that's created or scanned flows through AI analysis → priority scoring → a workflow decision (keep / near-expiry / donate / inspect) → (if applicable) donation creation → NGO ranking → notification → an automation log entry. The **seed script reuses this exact same engine code** to generate demo data, so what you see in a fresh demo is generated the same way a live scan would generate it — not hand-faked.

---

## Tech Stack

**Frontend:** React 18, Vite, Tailwind CSS, Recharts, Lucide icons, React Router, Axios
**Backend:** Node.js, Express, Mongoose
**Database:** MongoDB (local, Atlas, or an auto-launched in-memory instance — see below)
**AI/OCR:** Modular service layer with a deterministic Demo AI Mode (works with zero API keys) and an extension point for a real vision API; Tesseract.js for OCR
**Auth:** JWT + bcrypt, role-based middleware

---

## Folder Structure

```
freshlink/
  client/                    # React + Vite frontend
    src/
      components/
        layout/               Sidebar, Topbar, DashboardLayout, ProtectedRoute
        ui/                   Card, Button, Badge, StatCard, Modal, FreshnessRing...
        food/                 ScanUploader, AIResultPanel, FoodTable, AddFoodModal...
        donations/            DonationCard
        ngo/                  NGOCard
        charts/               StatusPieChart, WasteTrendChart, TemperatureChart...
        notifications/        NotificationBell
      pages/                  Landing, Login, Register, Dashboard, ScanFood,
                               Inventory, Donations, NGOs, AutomationCenter,
                               AIInsights, Notifications, Settings
      context/                AuthContext, ToastContext
      hooks/                  useAuth
      services/               api.js (axios client)
      utils/                  constants, formatDate
  server/                    # Express backend
    config/                   db.js (MongoDB connection strategy)
    models/                   User, FoodItem, Donation, NGO, Notification,
                               AutomationLog, TemperatureReading
    controllers/               one per resource
    routes/                    one per resource
    middleware/                auth.js, errorHandler.js, upload.js
    services/                  aiService, ocrService, priorityEngine,
                               ngoMatchingService, automationEngine,
                               notificationService, emailService
    seed.js                    populates realistic demo data
    server.js                  entry point
  package.json                root orchestration (npm run dev)
  .env.example
  README.md
```

---

## Installation

From the project root:

```bash
npm install
```

This installs root dependencies and then automatically installs both `server` and `client` dependencies (via a `postinstall` hook). If you'd rather do it manually:

```bash
npm install --prefix server
npm install --prefix client
```

---

## Environment Variables

Copy the example file and adjust as needed — **every value has a safe default, so the app runs fully in demo mode with zero configuration.**

```bash
cp .env.example server/.env
```

| Variable | Purpose | Default behavior if unset |
|---|---|---|
| `PORT` | API port | `5000` |
| `MONGO_URI` | MongoDB connection string | Auto-launches a local, in-memory MongoDB instance (via `mongodb-memory-server`) — zero setup, resets on restart |
| `JWT_SECRET` | Signs auth tokens | Falls back to a dev secret (fine for local hackathon use, **not for production**) |
| `AI_API_KEY` | Key for a real vision-model API | If empty, the AI service runs in `AI_MODE=demo` automatically |
| `AI_MODE` | `demo` or `api` | Defaults to `demo`; if set to `api` without a key, silently falls back to `demo` |

---

## Database Setup

You have three options, in order of convenience:

1. **Do nothing.** Leave `MONGO_URI` empty. On first run, the server automatically downloads and launches a local, in-memory MongoDB via `mongodb-memory-server` — no install required. Data resets whenever the server restarts, which is usually exactly what you want for a demo.
2. **Local MongoDB.** Install MongoDB Community Server, run `mongod`, and set `MONGO_URI=mongodb://localhost:27017/freshlink`.
3. **MongoDB Atlas (free tier).** Create a free cluster, grab the connection string, and set `MONGO_URI=mongodb+srv://...`.

The server **never crashes** if the database is unreachable — it logs a clear warning and keeps the API alive; database-backed routes respond with a friendly `503` until a connection is available (see `server/middleware/errorHandler.js` → `requireDb`).

Once connected, seed realistic demo data:

```bash
npm run seed
```

This populates 4 demo accounts, ~20 food items (including the exact bread/milk/tomato scenario below), 5 NGOs, 12+ donations across every status, a simulated temperature-excursion event, and starter notifications.

---

## How to Run

```bash
npm install       # installs everything
npm run seed      # populate demo data (requires a database — see above)
npm run dev       # starts backend (5000) and frontend (5173) together
```

Then open **http://localhost:5173**.

Individual services: `npm run dev:server` or `npm run dev:client`.

> With no `MONGO_URI`, the server seeds its in-memory database automatically on startup, so the demo credentials below work immediately (a separate `npm run seed` process can't reach the server's in-memory DB). Any empty database is auto-seeded; set `AUTO_SEED=false` to disable.

---

## Deployment (Render, single service)

In production, Express serves the built React client from `client/dist` alongside the API, so the whole app deploys as one web service.

1. Create a free MongoDB Atlas cluster, add a database user, and allow network access from `0.0.0.0/0`. Copy the `mongodb+srv://...` connection string.
2. In Render: **New → Blueprint**, pick this GitHub repo. Render reads [`render.yaml`](render.yaml).
3. When prompted, paste the Atlas string as `MONGO_URI`. `JWT_SECRET` is generated automatically.
4. Deploy. On first boot the empty database is seeded with the demo accounts.

Any Node host works the same way: build with `npm install --include=dev && npm run build`, start with `npm start`.

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@freshlink.demo` | `admin123` |
| Shop | `shop@freshlink.demo` | `shop123` |
| NGO | `ngo@freshlink.demo` | `ngo123` |
| Household | `user@freshlink.demo` | `user123` |

The login page has one-click buttons for all four. The landing page's **"Try Demo"** button logs you straight in as the Shop account, which has the fullest dataset (the bread/milk/tomato scenario below lives there).

---

## Main URLs

| What | URL |
|---|---|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:5000/api |
| Health check | http://localhost:5000/api/health |
| Uploaded scan images | http://localhost:5000/uploads |

---

## API Documentation

All routes except `/auth/register`, `/auth/login` and `/health` require `Authorization: Bearer <token>`.

**Auth**
```
POST   /api/auth/register        { name, email, password, role, location }
POST   /api/auth/login           { email, password }
GET    /api/auth/me
```

**Food**
```
GET    /api/food                 ?status=&category=&sort=
POST   /api/food                 create manually — runs AI + priority + automation
GET    /api/food/:id
PUT    /api/food/:id
DELETE /api/food/:id
POST   /api/food/scan            multipart: image (optional) + foodName — returns AI/OCR preview, does NOT save
POST   /api/food/:id/donate      manually trigger donation + NGO matching for an existing item
```

**Donations**
```
GET    /api/donations            ?status=
POST   /api/donations
GET    /api/donations/:id
PUT    /api/donations/:id        update status, pickup time, etc.
```

**NGOs**
```
GET    /api/ngos
GET    /api/ngos/nearby          ?lat=&lng=&category=  — ranked by match score
```

**Automation**
```
GET    /api/automation/logs
```

**Notifications**
```
GET    /api/notifications
PUT    /api/notifications/:id/read
```

**Analytics**
```
GET    /api/analytics/dashboard  cards + status distribution + trends + timeline
```

**Temperature**
```
GET    /api/temperature          ?foodItem=<id>
POST   /api/temperature          { foodItem, temperatureC }
```

---

## The AI Workflow

`server/services/aiService.js` exposes a single function, `analyzeFoodImage({ declaredFoodName, imagePath })`, that returns:

```json
{
  "foodType": "Tomato",
  "condition": "Possible Deterioration",
  "confidence": 0.81,
  "possibleIssues": ["Visible discoloration", "Possible surface damage"],
  "inspectionRequired": true,
  "aiMode": "demo",
  "disclaimer": "AI screening is indicative only. Inspect food before consumption or donation."
}
```

**Demo AI Mode** (default, zero config) uses a small deterministic "knowledge base" keyed off the food name, so the same input always produces the same, explainable output — realistic for a live demo without needing a paid API key. **API Mode** is a wired extension point: if `AI_API_KEY` and `AI_MODE=api` are set, the service attempts a real call; if that call fails for any reason (or isn't configured), it **automatically falls back to Demo Mode** rather than breaking the request.

OCR (`server/services/ocrService.js`) uses Tesseract.js to read expiry-style dates off packaging (`18/08/2026`, `18-08-2026`, `18 Aug 2026`, `EXP 18/08/26`, `Best Before 18/08/26`). If no date is confidently found, the API returns `{ success: false }` and the UI falls back to manual date entry — the whole app works fine even if OCR never successfully reads a single label.

---

## The Priority Algorithm

`server/services/priorityEngine.js` → `calculateFoodPriority(foodItem)` is a fully transparent, explainable scoring function — every score comes with a plain-English list of reasons.

| Factor | Points |
|---|---|
| Expires in 0–1 days | +50 |
| Expires in 2–3 days | +35 |
| Expires in 4–7 days | +20 |
| Expires in 8+ days | +5 |
| Condition: Near Expiry | +20 |
| Condition: Possible Deterioration | +35 |
| Condition: Inspection Required | +40 |
| Large quantity (≥10) | +10 |
| Temperature excursion (cold-chain category, >8°C) | +15 |

Score → level: **CRITICAL** (≥80), **HIGH** (≥55), **MEDIUM** (≥30), **LOW** (below).

Example output:
```json
{
  "priorityScore": 82,
  "priorityLevel": "CRITICAL",
  "recommendedAction": "Use soon / Donate today",
  "reasons": ["Expires within 1 day", "Near-expiry status", "Large quantity"]
}
```

---

## The Automation Engine

`server/services/automationEngine.js` → `runFoodWorkflow({ foodItem, user })` picks one of four workflows and executes it:

- **Fresh** → kept in inventory with an expiry reminder.
- **Near Expiry** → status updated; shop accounts get an automatic discount suggestion (20–30% based on urgency); a notification is sent.
- **Donation Candidate** → a `Donation` is created, nearby NGOs are ranked (`ngoMatchingService.js`, weighted on distance/category/capacity/urgency/pickup availability), the top match is attached, and a notification fires.
- **Inspection Required** → items with AI-detected possible deterioration are flagged for human review and are **deliberately excluded from automatic donation creation** — FreshLink will suggest, never auto-certify.

Every step writes a human-readable entry to `AutomationLog`, visible on the **Automation Center** page — this is the evidence that the system automates real decisions rather than just storing records.

---

## What Was Implemented

- Full JWT + bcrypt auth with 4 roles and role-based route protection
- All 7 data models, all documented API routes
- A working Scan Food flow: upload/drag-drop → OCR → AI demo analysis → editable expiry fallback → priority scoring → one-click save that triggers the full automation pipeline
- Inventory with filtering, sorting, add/edit/delete, and a manual "Donate" action
- Donation lifecycle management across all 7 statuses
- NGO ranking with a transparent, weighted match score and a donation-request flow
- Automation Center with a real, generated (not scripted) decision log
- AI Insights computed from live inventory data, clearly labeled as estimates
- In-app notifications + a pluggable simulated-email service
- Simulated cold-chain temperature monitoring with automatic excursion detection
- A seed script that generates ~20 food items, 5 NGOs, 12+ donations across every status, and the exact bread/milk/tomato demo scenario, **by running the real engine code** rather than hand-faking results
- Graceful degradation everywhere: missing AI key → demo mode; OCR failure → manual entry; MongoDB unreachable → API stays up and returns friendly 503s instead of crashing

## Known Limitations

- **This is a hackathon MVP, not a production system.** Password reset, email verification, rate limiting, and production-grade secret management are out of scope.
- **AI screening is a deterministic demo, not a live vision model.** The architecture (`aiService.js`) is built so a real model can be dropped in later; wiring one up is intentionally left as an extension point rather than faked as "real."
- **No interactive map.** Per the brief's own fallback guidance, NGOs and distances are shown as a polished, distance-sorted list instead of a Leaflet map, to keep the build focused and dependency-light. Swapping in Leaflet + OpenStreetMap later is straightforward since every NGO already has lat/lng.
- **Profile editing (Settings page) is a UI stub** — every other feature is fully functional, but account-detail editing isn't wired to a backend endpoint yet.
- **Email is simulated** (logged, not sent) — `emailService.js` is a thin abstraction specifically so a real provider (SendGrid, SES, Resend...) can be dropped in without touching call sites.
- **NGO donor visibility is simplified**: in this build, all NGO accounts see the same shared donation pool rather than being tied to one specific seeded NGO record, to keep the demo data model simple.

## Future Improvements

- Swap the demo AI service for a real vision-model integration (the extension point is already there)
- Real push/email notifications
- Leaflet/OpenStreetMap visualization of donation routes
- Per-NGO account linkage and inbox
- Barcode/receipt scanning to speed up manual entry
- Historical analytics beyond the current 6-month rolling window
- Automated tests (unit tests for the priority engine and NGO matcher would be natural first additions given how deterministic they are)

---

## ⚠️ Important AI Limitation

FreshLink's food-condition screening is an **AI-assisted visual estimate**, not a food-safety certification. The system is intentionally designed to **never claim** that scanned food is "safe to eat" or "100% safe" — you'll only ever see hedged, indicative language:

- "Possible deterioration detected"
- "Inspection recommended"
- "Near expiry"
- "Donation candidate"
- "High priority"

Every AI result carries an explicit disclaimer (*"AI screening is indicative only. Inspect food before consumption or donation."*), and every donation created by the automation engine carries its own disclaimer (*"Potential donation candidate — NGO/recipient should inspect before acceptance."*) Items the AI flags as showing possible deterioration are routed to a human-review workflow rather than being automatically donated. **A human should always physically inspect food before eating or donating it — FreshLink surfaces and prioritizes, it does not certify.**
