# KrishYantra / AASRA — Frontend Web Application

The **KrishYantra (AASRA)** frontend is a modern, responsive, progressive web application designed to empower Indian farmers and agricultural extension officers with real-time agronomic intelligence, risk forecasting, precision product prescriptions, causal financial calculations, and market logistics.

---

## Technology Stack

- **Framework**: Next.js 16.3.0 (Turbopack, App Router, React 19)
- **Styling**: Tailwind CSS with custom design system (`design-md-stripe` aesthetic)
- **Theme Tokens**: Deep Forest Green (`#1b4332`), Vibrant Emerald (`#2d6a4f`), Ivory/Sage neutrals (`#fbfcf8`, `#f8faf7`), Crisp Borders (`#e8ede4`)
- **State Management**: React Context (`FarmContext`, `LanguageContext`), Local Storage Synchronization
- **Internationalization**: Bilingual support (English & Hindi) across all interfaces
- **Speech Synthesis**: Native Web Speech API for voice readouts in Hindi and English
- **Mapping & Geo**: Leaflet & MapLibre for farm polygon geofencing and APMC mandi logistics routing
- **Deployment**: Vercel Serverless Edge
- **Live Production URL**: [https://krishyantra.vercel.app](https://krishyantra.vercel.app)

---

## Directory Structure

```
frontend/
├── data/
│   └── aasra_mvp.json              # Local seed database containing verified farmers, fields & settings
├── public/                         # Static assets, SVG icons, logos, and PWA manifest
├── scripts/                        # Automated testing & scenario validation scripts
└── src/
    ├── app/                        # Next.js App Router (60 routes: pages & API handlers)
    │   ├── api/                    # Serverless API endpoints
    │   │   ├── chat/               # Voice & multimodal Gemini chat handlers
    │   │   ├── crops/              # Crop detection & regional databases
    │   │   ├── farmers/            # Farmer profile CRUD operations
    │   │   ├── fields/             # GPS polygon geofencing handlers
    │   │   ├── impact/robi/        # Causal ROBI calculation endpoint
    │   │   ├── mandi/rates/        # Live APMC Agmarknet price synchronization
    │   │   ├── meta-whatsapp/      # Meta WhatsApp Cloud API webhooks
    │   │   ├── pipeline/           # Vertex AI ML pipeline coordination endpoints
    │   │   └── plant-intelligence/ # Diagnostics & prescription inference APIs
    │   ├── assistant/              # Multilingual Voice & Chat Agronomist Assistant
    │   ├── closed-loop/            # Closed-Loop Crop Remission & Recovery Engine
    │   ├── dashboard/              # Primary Farmer Telemetry & Farm Health Dashboard
    │   ├── diagnostics/            # 14-Day Multi-Stress Biophysical Risk Matrix
    │   ├── fields/                 # Interactive Satellite Geofencing & Polygon Mapping
    │   ├── how-it-works/           # Interactive 6-Model Pipeline Explainer
    │   ├── impact/                 # 3-Step Investment Story & Causal ROBI Calculator
    │   ├── journal/                # Voice-enabled Field Log & Crop Event Journal
    │   ├── mandi/                  # 5 Nearby APMC Mandis Real-Time Logistics Comparison
    │   ├── onboarding/             # Multi-step Farmer Onboarding Wizard
    │   ├── plant-intelligence/     # Plant Health Suite (Diagnostics, Prescription, Yield)
    │   │   ├── diagnostics/        # Detailed stress classification & facts grid
    │   │   ├── impact/             # Financial yield salvage dashboard
    │   │   ├── mandi/              # Transport cost & profit optimization
    │   │   ├── prescription/       # Why, How, Soil-Dosage & Zero-Cost Cultural Advisory
    │   │   ├── recovery/           # Day-by-day remission trajectory tracker
    │   │   └── yield/              # Pre- vs. Post-treatment genetic potential comparison
    │   ├── product/                # Syngenta 50-Product Verified Agronomic Catalog
    │   ├── recovery/               # Visual Remission & Yield Salvage Tracker
    │   ├── robi/                   # Direct Return on Biological Investment Deep Dive
    │   ├── settings/               # Feature flags, notification channels & language preferences
    │   ├── weather/                # 14-day agricultural weather forecast with Delta-T alerts
    │   ├── what-if/                # Interactive Spray Timing Scenario Simulator
    │   └── yield/                  # Yield regression & harvest forecast engine
    ├── components/                 # Reusable UI primitives & feature modules
    │   ├── AppShell.tsx            # Main responsive layout shell with navigation
    │   ├── FarmCropSwitcher.tsx    # Dropdown switcher for switching farms and crops
    │   ├── Navigation.tsx          # Top & bottom navigation bars
    │   ├── SyngentaDealerLocator   # Dealer search and contact widget
    │   ├── VertexAIPipelineView    # Live ML pipeline telemetry inspector
    │   └── WhatIfSimulator.tsx     # What-If interactive intervention calculator
    ├── context/                    # React Context providers
    │   ├── FarmContext.tsx         # Active farm, crop, acreage, and soil state
    │   └── LanguageContext.tsx     # English / Hindi localization state
    └── lib/                        # Core algorithmic engines & utilities
        ├── agronomicDiagnosticEngine.ts # Biophysical stress evaluation
        ├── farmerAdvisoryEngine.ts      # Farmer-friendly Why, How, Soil-Dosage & Cultural Tips
        ├── knapsackPumpMatrix.ts        # Dilution ratios & knapsack tank calculators
        ├── mandiEngine.ts               # APMC price benchmarks & logistics routing
        ├── mlPipelineApi.ts             # Vertex AI API client contracts
        ├── recommendationEngine.ts      # Product portfolio ranking algorithm
        ├── syngentaProductsDB.ts        # 50-product Syngenta agronomic database
        ├── usePipelinePrediction.ts     # Unified telemetry & model inference hook
        ├── userStore.ts                 # Local storage user profile manager
        └── yieldPredictionEngine.ts     # Crop potential & treatment gain regressor
```

---

## Key Feature Modules

### 1. Farmer-First Prescription & Advisory (`/plant-intelligence/prescription`)
- **No AI Jargon**: Replaces complex chemical formulations with simple, direct Hindi/English explanations that any farmer can understand.
- **Why This Product (3–4 lines)**: Connects the crop's current stage, weather conditions, and specific pest or thermal risk to why this medicine saves harvest yield.
- **How to Apply (3–4 steps)**: Clear dilution steps, number of 15L knapsack pumps, optimal morning/evening spray hours, and moisture gates.
- **Personalized Dosage**: Tailored dynamically to the farmer's **field size (acres)** and **soil type** (e.g. Black Vertisol, Alluvial Loam, Sandy Loam, Red Soil).
- **Zero-Cost Cultural Advisory**: A dedicated square card providing free farm management practices (furrow cooling irrigation, shallow hoeing, organic mulching, W-pattern scouting) requiring zero chemical purchase.

### 2. 3-Step Investment Story & Causal ROBI (`/impact`)
- **Dynamic Agronomics**: Replaces hardcoded values with realistic crop-specific Mandi prices (e.g., Sugarcane SAP @ ₹385/q, Cotton @ ₹7,450/q) and calibrated causal gains ($\tau$).
- **Transparent Multiplier**: Explains exactly what the Return on Biological Investment means in plain language: *"Every ₹1,000 invested returns ₹{one_thousand_return} directly in cash harvest value."*
- **4-Stat Breakdown**: Transparently details treatment cost, quintals shielded, Mandi rate, and net in-pocket profit.

### 3. Real-Time Mandi Logistics Optimizer (`/mandi`)
- Compares the top 5 nearest APMC Mandis based on live Agmarknet modal rates, distance, transport cost (₹/km/quintal), and net in-hand proceeds after freight.

### 4. Interactive Field Geofencing (`/fields`)
- Satellite map polygon drawing tool that allows farmers to walk or draw their exact farm boundaries, calculating precise acreage down to 0.01 acres.

---

## Local Development

### Prerequisites
- Node.js 18.17+ or 20+
- npm or yarn

### Setup Instructions

```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Install dependencies
npm install

# 3. Configure environment variables (optional for local mock data)
cp .env.example .env.local

# 4. Start development server with Turbopack
npm run dev
```

The web application will be live at `http://localhost:3000`.

### Building for Production

```bash
npm run build
```

Builds all 60 static and dynamic routes with full TypeScript type-checking and Next.js optimization.
