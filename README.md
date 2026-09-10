# 🌾 KrishYantra (कृषियंत्र) — Master Architectural Guide
### *Autonomous Agri-Intelligence, Biophysical Weather Gating & Causal ROBI Platform*
> **"Saath Har Kisan Ke Liye"** — Transforming Smallholder Agriculture from Reactive Crisis Management to Verifiable, Science-Backed Harvest Wealth.

[![Live Production](https://img.shields.io/badge/Live%20Platform-krishyantra.vercel.app-emerald?style=for-the-badge&logo=vercel)](https://krishyantra.vercel.app)
[![Repository](https://img.shields.io/badge/GitHub-IshaanYK%2FKrishYantra-blue?style=for-the-badge&logo=github)](https://github.com/IshaanYK/KrishYantra)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3%20(Turbopack)-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-teal?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Google Cloud Vertex AI](https://img.shields.io/badge/Google%20Cloud-Vertex%20AI%20Serving-4285F4?style=for-the-badge&logo=googlecloud)](https://cloud.google.com/vertex-ai)
[![Meta WhatsApp API](https://img.shields.io/badge/Meta-WhatsApp%20Cloud%20API-25D366?style=for-the-badge&logo=whatsapp)](https://developers.facebook.com/docs/whatsapp/cloud-api)
[![Design System](https://img.shields.io/badge/Design%20System-Stripe%20Clean%20Aesthetic-533afd?style=for-the-badge)](https://stripe.com)

---

## 🌐 Live Production Links
- **Primary Live Web Application:** [https://krishyantra.vercel.app](https://krishyantra.vercel.app)
- **Executive Cascade & Plant Intelligence:** [https://krishyantra.vercel.app/plant-intelligence](https://krishyantra.vercel.app/plant-intelligence)
- **Precision Prescription & Dosage Engine:** [https://krishyantra.vercel.app/plant-intelligence/prescription](https://krishyantra.vercel.app/plant-intelligence/prescription)
- **Biophysical Weather Gating & Diagnostics:** [https://krishyantra.vercel.app/diagnostics](https://krishyantra.vercel.app/diagnostics)
- **Farmer Field Intelligence Dashboard:** [https://krishyantra.vercel.app/dashboard](https://krishyantra.vercel.app/dashboard)
- **Economic ROBI Causal Impact Calculator:** [https://krishyantra.vercel.app/impact](https://krishyantra.vercel.app/impact)
- **Closed-Loop 48h Remission Audit Engine:** [https://krishyantra.vercel.app/closed-loop](https://krishyantra.vercel.app/closed-loop)
- **APMC Mandi Real-time Price Intelligence:** [https://krishyantra.vercel.app/mandi](https://krishyantra.vercel.app/mandi)
- **Digital Field Journal & Spray Audit Ledger:** [https://krishyantra.vercel.app/journal](https://krishyantra.vercel.app/journal)
- **AI Multilingual Voice Agro-Assistant:** [https://krishyantra.vercel.app/assistant](https://krishyantra.vercel.app/assistant)
- **Interactive Timing What-If Simulator:** [https://krishyantra.vercel.app/what-if](https://krishyantra.vercel.app/what-if)

---

## 🏛️ Repository Architecture & File Organization

The repository is cleanly structured into focused subsystems, separating frontend web applications, backend APIs, machine learning pipelines, research documentation, and WhatsApp automation:

```
KrishYantra/
├── frontend/                   # Next.js 16 (Turbopack) Farmer PWA & Decision Platform (60 routes)
├── backend/                    # Python FastAPI service & Vertex AI Cloud ML bridge
├── docs/                       # Centralized Documentation & Research Archive
│   ├── architecture/           # System specifications, technical blueprints & algorithm papers
│   ├── ml-models/              # Training manuals, evaluation checklists & Google Colab notebooks
│   └── research/               # Concept notes, ICAR trial reports & Syngenta product databases
├── ps02-engine/                # Python PS-02 Biological Readiness & Microclimate Stress Engine
├── vertex_ai/                  # Vertex AI production model definitions (Models 1 through 6)
├── admin/                      # Operations & Extension Officer administrative monitoring portal
├── whatsapp-bot/               # Meta WhatsApp Cloud API clinical triage bot & photo diagnostic engine
├── bot/                        # Standalone terminal bot client scripts (Node.js & Python)
├── DEPLOYED_URL.txt            # Live production deployment URL reference
├── AGENTS.md                   # Workspace guidelines, theme preservation & deployment rules
├── vercel.json                 # Vercel deployment routing configuration
└── package.json                # Master monorepo orchestration scripts
```

---

## 📂 Subsystem Directory Catalog

### 1. Frontend (`/frontend`)
The core farmer-facing web application. Built with Next.js 16 App Router and styled with the established `design-md-stripe` aesthetic (deep forest `#1b4332`, emerald `#2d6a4f`, ivory/sage neutrals `#fbfcf8`/`#f8faf7`).
- [`frontend/src/app/plant-intelligence/prescription/page.tsx`](frontend/src/app/plant-intelligence/prescription/page.tsx): The heart of the recommendation engine. Features:
  - **The "Why" Box**: 3–4 lines of natural, accessible Hindi/English explaining why this product protects their harvest during the current stage and weather threat.
  - **The "How" Box**: 4 practical, step-by-step instructions on dilution, knapsack pump counts, and morning/evening spray windows.
  - **Personalized Dosage**: Dynamic calculations based on **Field Size (Acres)** and **Soil Type** (Black Vertisol, Alluvial Loam, Sandy Loam, Red Soil).
  - **Zero-Cost Cultural Advisory**: A dedicated square card providing free cultural farming practices (evening furrow cooling irrigation, surface hoeing, organic mulching, W-pattern scouting).
- [`frontend/src/app/impact/page.tsx`](frontend/src/app/impact/page.tsx): 3-Step Investment Story and Causal ROBI Calculator grounded in actual APMC Mandi benchmark rates (Sugarcane SAP @ ₹385/q, Cotton @ ₹7,450/q).
- [`frontend/src/app/closed-loop/page.tsx`](frontend/src/app/closed-loop/page.tsx): Closed-loop remission engine with 48h follow-up and rotational rescue chemistry.
- [`frontend/src/lib/farmerAdvisoryEngine.ts`](frontend/src/lib/farmerAdvisoryEngine.ts): Humanized advisory engine translating chemical formulations into plain language.
- [`frontend/src/lib/usePipelinePrediction.ts`](frontend/src/lib/usePipelinePrediction.ts): Unified hook coordinating weather telemetry and ML inference with smart cache invalidation.

### 2. Backend (`/backend`)
Python FastAPI service orchestrating microclimate computation and Vertex AI cloud models:
- `backend/app/main.py`: FastAPI application entrypoint with CORS, rate-limiting, and error handling.
- `backend/app/routers/pipeline.py`: End-to-end orchestration endpoint executing Models 1 through 6.
- `backend/tunnel_bridge.py`: Local development bridge to securely proxy Vertex AI endpoint requests.
- `backend/check_vertex_status.py`: Health verification script for Google Cloud endpoints.

### 3. Documentation & Research (`/docs`)
Centralized library containing all scientific publications, manuals, and datasets:
- **`docs/architecture/`**: System architecture (`ARCHITECTURE.txt`), algorithm formulations, and feature specifications.
- **`docs/ml-models/`**: Training manuals for Models 1–6, Colab notebook (`AASRA_Model_3_Training_Google_Colab.ipynb`), and Vertex AI deployment guides.
- **`docs/research/`**: 25-page master report, ICAR field trial guides, concept notes, and the 50-product Syngenta database (`syngenta_50_products.csv`).

### 4. Machine Learning & Vertex AI (`/vertex_ai`)
Production joblibs and deployment code for all 6 models:
- `model1_climate_stress/`: XGBoost classifier for multi-stress climate forecasting.
- `model2_biological_readiness/`: Delta-T and VPD biophysical spray safety gate.
- `model3_product_ranker/`: LambdaMART portfolio ranker matching Syngenta solutions.
- `model4_crop_remission/`: Trajectory predictor for crop recovery and yield salvage.
- `model5_yield_regressor/`: Historical district baseline and genetic potential regressor.
- `model6_causal_robi/`: Double ML causal forest for unconfounded economic uplift calculation.
- `deploy_all_models.py`: Automated GCP deployment script.

### 5. PS-02 Engine (`/ps02-engine`)
Specialized Python engine for Problem Statement PS-02 (Pre-emptive Biological Intervention via multi-modal sensor fusion):
- Live Meteoblue & CE Hub API integration, historical anomaly detection, and 6 stress indices (HSI, DSI, CSI, Waterlog, Vegetation, Compound).

### 6. WhatsApp Bot (`/whatsapp-bot`)
Meta WhatsApp Cloud API integration providing an omnichannel conversational experience:
- Multimodal photo diagnosis with Gemini 2.5 Flash Vision, 6-point clinical questionnaire, 15L/16L knapsack dilution calculator, and 48-hour automated spray audit.

---

## 🧠 The 6-Stage Agri-Intelligence Pipeline

```
                                  ┌────────────────────────────────────────────────────────┐
                                  │                KRISHYANTRA CORE PLATFORM                │
                                  │       Autonomous Agro-Climatology & Decision Engine     │
                                  └───────────────────────────┬────────────────────────────┘
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                                                                 ▼
    ┌─────────────────────────────────┐                                               ┌─────────────────────────────────┐
    │     HYPERLOCAL TELEMETRY &      │                                               │       MULTIMODAL SENSING        │
    │       SATELLITE REANALYSIS      │                                               │         & FARM DATA             │
    │  • Open-Meteo & Meteoblue APIs  │                                               │  • 48MP Smartphone Camera Macro │
    │  • Agmarknet APMC Mandi Rates   │                                               │  • 12 Vernacular Voice Streams  │
    │  • ICAR Soil Series / Clay %    │                                               │  • GPS Polygon Acreage & Crop   │
    └────────────────┬────────────────┘                                               └────────────────┬────────────────┘
                     │                                                                                 │
                     └────────────────────────────────────────┬────────────────────────────────────────┘
                                                              │
                                                              ▼
  ╔═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
  ║                                         6-STAGE MULTI-MODEL AGRI-INTELLIGENCE PIPELINE                                    ║
  ╠═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╣
  ║  1. MODEL 1 (PS-02 Risk Classifier)      : 14-Day Microclimate Stress Early Warning (XGBoost + RF Ensemble)               ║
  ║  2. MODEL 2 (PS-02 Biophysical Gating)   : Atmospheric Physics Engine (Delta-T = Tdry - Twet, Wind, Rain Wash-off Gate)    ║
  ║  3. MODEL 3 (PS-03 Biological Ranker)    : LambdaMART XGBRanker scoring 50+ Syngenta Biologicals with Stage Calibration    ║
  ║  4. MODEL 4 (PS-03 Precision Chemistry)  : Rotational Resistance Countermeasures & Exact Pump Water Carrier Dilution      ║
  ║  5. MODEL 5 (PS-07 Baseline Regressor)   : Double ML Unconfounded Potential Yield Prediction (Quintals/Acre)              ║
  ║  6. MODEL 6 (PS-07 Causal Uplift & ROBI) : Microsoft EconML Causal Forest (Treatment Effect τ, Mandi Cash & ROBI Multiplier) ║
  ╚═══════════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝
                                                              │
                     ┌────────────────────────────────────────┴────────────────────────────────────────┐
                     ▼                                                                                 ▼
    ┌─────────────────────────────────┐                                               ┌─────────────────────────────────┐
    │    OMNICHANNEL FARMER UX        │                                               │   AUTOMATED 48H CLOSED-LOOP     │
    │  • Next.js 16 PWA (Turbopack)   │                                               │  • Meta WhatsApp Cloud Webhook  │
    │  • Stripe Design System Clean UI│                                               │  • 5-Failure Diagnostic Triage  │
    │  • Instant Hindi/English Voice  │                                               │  • Rotational Rescue Protocols  │
    └─────────────────────────────────┘                                               └─────────────────────────────────┘
```

---

## 🚀 Quick Start & Local Execution

### Option A: Start All Services Concurrently (Root)
From the root directory, you can run all services using npm:

```bash
# Install root dependencies
npm install

# Start Frontend, Backend, and PS-02 Engine in parallel
npm run dev
```

### Option B: Start Individual Services

#### 1. Frontend Web Application
```bash
cd frontend
npm install
npm run dev
# Running at http://localhost:3000
```

#### 2. Backend FastAPI Service
```bash
cd backend
python -m venv venv
.\venv\Scripts\activate      # Windows
source venv/bin/activate    # macOS/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
# Running at http://localhost:8000 (Swagger docs: http://localhost:8000/docs)
```

#### 3. PS-02 Climate Stress Engine
```bash
cd ps02-engine
python app.py
# Running at http://localhost:7000
```

#### 4. Admin Dashboard
```bash
cd admin
npm install
npm run dev -- -p 3001
# Running at http://localhost:3001
```

---

## 🧪 Production Verification & Build Integrity

To verify that all 60 static and dynamic routes compile without errors:

```bash
cd frontend
npm run build
```

Deployment to Vercel is fully automated via GitHub CI/CD integration and verified live on production at:
👉 **[https://krishyantra.vercel.app](https://krishyantra.vercel.app)**
