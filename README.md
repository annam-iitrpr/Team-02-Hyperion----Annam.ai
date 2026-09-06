# 🌾 AASRA (आसरा) v2 — 4-Model ML Intelligence Pipeline

[![Repository](https://img.shields.io/badge/GitHub-nibooz--whatup--blue?style=for-the-badge&logo=github)](https://github.com/IshaanYK/nibooz-whatup-)
[![AASRA Master Guide](https://img.shields.io/badge/ML%20Playbook-Models%201%2C%202%2C%203%2C%205-purple?style=for-the-badge)](https://github.com/IshaanYK/nibooz-whatup-)
[![Hackathon](https://img.shields.io/badge/Hack%20Core%202026-PS--02%20%7C%20PS--03%20%7C%20PS--07-emerald?style=for-the-badge)](/pipeline)

> **AASRA v2** integrates the 4 official machine learning champion models into a unified real-time pipeline:
> - **Model 1 (PS-02 Risk)**: Climate Stress Early Warning XGBoost Classifier (7 Stress Classes)
> - **Model 2 (PS-02 Action)**: Biological Intervention Readiness Engine (Calibrated LogReg + Biophysical Delta-T/Wind/Rain Gates)
> - **Model 3 (PS-03 Portfolio)**: LambdaMART XGBRanker ranking 50 Syngenta Biologicals with customized dosage and ROI
> - **Model 5 (PS-07 Baseline)**: Field Yield Baseline Prediction XGBoost Regressor (Quintals/Hectare)
>
> *Models 1 & 2 directly feed into Model 3 & 5 to yield instant, science-backed agronomic prescriptions.*

---

## ⚡ Quick Start: Zero-Cost Live Pipeline Deployment
This project operates in **Dual-Serving Mode**:
1. **Local High-Performance Serving**: Run FastAPI on your PC/laptop with zero Google Cloud billing costs.
2. **Cloudflare Quick Tunnel**: Creates a free public HTTPS bridge (`https://xxxxx.trycloudflare.com`) in seconds.
3. **Vercel Frontend**: Connects seamlessly to the tunnel endpoint to execute live ML inference on the website.

```powershell
# 1. Start FastAPI Backend (Port 8000)
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

# 2. Expose via Cloudflare Quick Tunnel (Free, no account needed)
cloudflared tunnel --url http://localhost:8000

# 3. Deploy Frontend on Vercel:
# Import this repo on Vercel and add Environment Variable:
# FASTAPI_URL = https://<your-cloudflare-subdomain>.trycloudflare.com
```

---

## 🚀 Key Architectural Innovations

### 1. ⏱️ 7–14 Day Climate Stress "Time Machine" (PS-02)
* Shifts farming from **reactive damage control** to **pre-emptive biochemical execution**.
* Fuses meteorological drought indices (**SPEI / RDI**) with high-resolution reanalysis weather telemetry (Open-Meteo).
* Uses a **Hybrid RF-SVM Ensemble** to isolate multi-variate non-linear stress signals (nocturnal heat spikes >24°C, soil moisture deficits, vapor pressure deficit) and predict acute crop shock up to 14 days before visible symptoms occur.

### 2. 🧪 Spray Physics & Delta-T Climatology (PS-03)
* Enforces atmospheric physics constraints:  
  $$\Delta T = T_{\text{dry}} - T_{\text{wet}}$$
* **Delta-T < 2°C**: Air saturated — chemical wash-off risk.
* **Delta-T > 8°C**: Air too dry — droplet aerosol drift and rapid evaporation before stomatal absorption.
* **AASRA Goldilocks Window (2°C–8°C, Wind < 15 km/h)**: Identifies optimal hourly spray windows for biostimulants like Syngenta Quantis & Isabion.

### 3. 💰 Return on Bio-Investment (ROBI) Engine
* Validates chemical treatments through economic transparency:  
  $$\text{ROBI Multiplier} = \frac{\text{Saved Harvest Value (₹)} - \text{Input Cost (₹)}}{\text{Input Cost (₹)}}$$
* Live grounding with **APMC Mandi rates** (via Agmarknet).
* Issues verifiable, cryptographically hashed certificates proving net cash yield gains (e.g., **4.46x ROBI** on Soybean, +₹22,120 net cash gain).

### 4. 🎙️ Multimodal Vernacular Voice AI
* **Conversational Engine:** Google Gemini 2.0 Flash with automatic Groq failover pool.
* **Speech-to-Text:** Google Cloud Speech-to-Text v2 (Chirp 3 HD) for 12 Indian regional languages with live audio streaming transcription.
* **Text-to-Speech:** Google Cloud Text-to-Speech (Journey/Neural2) for native dialect speech generation.
* **Computer Vision:** Multimodal crop leaf and pest inspection with Gemini Vision.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────────────────────┐
                               │             AASRA ECOSYSTEM                    │
                               └──────────────────────┬─────────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
         🌾 FARMER-FACING WEB APP                                       🛡️ ADMIN OVERWATCH CONSOLE
   https://frontend-phi-flame-21.vercel.app                       https://admin-self-mu-33.vercel.app
   (Clean, vernacular, high-contrast)                             (Linear-style dark telemetry UI)
   ├─ /dashboard: Kisan Action Verdict                            ├─ /: Password gate (aasra-admin-2026)
   ├─ /assistant: Multimodal Voice AI                             ├─ /dashboard: Live production telemetry
   ├─ /fields: GPS acreage & polygon mapping                      ├─ /users: Search, register, or delete farmers
   ├─ /what-if: Interactive 100-day sim                           ├─ /diagnostics: Health of 8 microservices
   ├─ /impact: ROBI cryptographic audits                          ├─ /database: Live collection explorer
   └─ /journal: Farm activities & spray logs                      └─ /website: Feature flags & broadcast alerts
                       ▲                                                             ▲
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │
                                                      ▼
                                       🚀 PRODUCTION SERVERLESS API
                                   https://frontend-phi-flame-21.vercel.app/api
                                   ├─ /api/chat: Gemini 2.0 Multimodal
                                   ├─ /api/farmers: CRUD for user accounts
                                   ├─ /api/settings: Feature flags & alerts
                                   ├─ /api/database: Zero-latency store
                                   ├─ /api/mandi/rates: APMC live prices
                                   └─ /api/weather/current: Open-Meteo
```

---

## 📂 Repository Structure

```
├── frontend/                     # Main Farmer-Facing Next.js 16 Web Application
│   ├── src/
│   │   ├── app/                 # App Router (dashboard, assistant, fields, what-if, impact, journal)
│   │   │   └── api/             # Production Serverless API (chat, farmers, settings, weather, mandi)
│   │   ├── components/          # Reusable UI (AppShell, KisanActionVerdict, WeatherWidget, etc.)
│   │   ├── context/             # Multi-lingual vernacular LanguageContext (12 Indian dialects)
│   │   └── lib/                 # Agronomic engines (sprayRules, weatherRules, roiEngine, aasraDb)
│   └── public/                  # Static assets, PWA manifest, service worker (v2)
│
├── admin/                        # Dedicated Administrative Overwatch Next.js 16 Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── dashboard/       # Real-time production database stats & service latencies
│   │   │   ├── users/           # Live farmer management (register, search, delete)
│   │   │   ├── diagnostics/     # Health monitors for all 8 microservices & APIs
│   │   │   ├── database/        # Collection browser (Farmers, Fields, Journal, ROBI, Raw JSON)
│   │   │   └── website/         # Real-time feature flags, maintenance mode & farmer broadcast alerts
│   │   ├── components/          # AdminShell (Linear dark-mode UI)
│   │   └── lib/                 # api.ts (bound directly to production API), adminAuth.ts
│   └── vercel.json              # Vercel deployment configuration
│
├── data_ingestion.py             # 14-day climate forecast ingestion & anomaly detection
├── plant_categorization.py       # Crop Vulnerability Matrix (phenology & stress sensitivity)
├── ensemble_model.py             # Hybrid RF-SVM Machine Learning pipeline
├── alert_engine.py               # Plain-language SMS & voice alert translation
└── main.py                       # CLI demo runner comparing resilient vs. vulnerable crops
```

---

## 💻 Local Development Setup

### Prerequisites
* **Node.js**: v18+ (v20+ recommended)
* **Python**: 3.10+
* **npm** or **pnpm**

### 1. Clone Repository
```bash
git clone https://github.com/IshaanYK/nimbooz.git
cd nimbooz
```

### 2. Run Main Farmer App
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:3000
```

### 3. Run Admin Overwatch Console
```bash
cd ../admin
npm install
npm run dev
# Running on http://localhost:3001
```

### 4. Run Python ML Pipeline
```bash
cd ..
python -m venv venv
source venv/bin/activate  # Or `venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```

---

## 🛡️ License & Acknowledgements
* Developed for **Hack Core 2026**.
* Built with Next.js, Google Gemini, Google Cloud Speech, Open-Meteo, and Agmarknet APMC datasets.
