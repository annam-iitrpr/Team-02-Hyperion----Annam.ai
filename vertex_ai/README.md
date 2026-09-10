# KrishYantra / AASRA — Vertex AI Machine Learning Models

This directory contains the machine learning pipelines, trained artifact joblibs, deployment scripts, and serving containers for Google Cloud Vertex AI.

---

## 6-Model Agronomic Intelligence Pipeline

```
vertex_ai/
├── deploy_all_models.py             # Automated script to register and deploy models 1–6 to Vertex AI
├── master_cloud_deploy.py          # End-to-end container build and cloud endpoint provisioning
├── model1_climate_stress/          # Model 1: Multi-Stress Climate Risk Classifier (XGBoost)
├── model2_biological_readiness/    # Model 2: Biological Spray Readiness & Delta-T Gate
├── model3_product_ranker/          # Model 3: Syngenta Portfolio Ranker & Compatibility Engine
├── model4_crop_remission/          # Model 4: Crop Remission & Yield Salvage Predictor
├── model5_yield_regressor/         # Model 5: Genetic Baseline Potential & Yield Regressor
└── model6_causal_robi/             # Model 6: Causal Return on Biological Investment (ROBI) Engine
```

---

## Pipeline Flow & Model Roles

```
[Farm Telemetry: Weather + Stage + Soil]
              │
              ▼
    ┌───────────────────┐
    │      Model 1      │ ──> Stress Type (Heat, Frost, Pests) & Days to Impact
    │  (Climate Stress) │
    └───────────────────┘
              │
              ▼
    ┌───────────────────┐
    │      Model 2      │ ──> Delta-T & VPD Spray Safety Gate (Safe / Marginal / Unsafe)
    │  (Bio-Readiness)  │
    └───────────────────┘
              │
              ▼
    ┌───────────────────┐
    │      Model 3      │ ──> Ranked Syngenta Portfolio (Primary #1, Alternatives #2, #3)
    │ (Portfolio Rank)  │
    └───────────────────┘
              │
              ▼
    ┌───────────────────┐
    │      Model 4      │ ──> Remission Trajectory & Yield Salvage % (On-Time vs. Delayed)
    │ (Crop Remission)  │
    └───────────────────┘
              │
              ▼
    ┌───────────────────┐
    │      Model 5      │ ──> Genetic Potential Baseline Yield (Quintals / Acre)
    │  (Yield Baseline) │
    └───────────────────┘
              │
              ▼
    ┌───────────────────┐
    │      Model 6      │ ──> Causal ROBI Multiplier (τ × Mandi Price / Treatment Cost)
    │   (Causal ROBI)   │
    └───────────────────┘
```

---

## Deployment to Google Cloud Vertex AI

### Prerequisites
- Google Cloud SDK (`gcloud` CLI) authenticated
- GCP Project with Vertex AI API enabled
- Service account key with Vertex AI Admin roles placed in `backend/gcp-service-account.json`

### Deployment Commands

```bash
# Set GCP environment variables
export GOOGLE_APPLICATION_CREDENTIALS="../backend/gcp-service-account.json"
export GCP_PROJECT_ID="your-gcp-project-id"
export GCP_REGION="asia-south1"

# Deploy all 6 models sequentially to Vertex AI endpoints
python deploy_all_models.py

# Alternatively, run master cloud orchestration
python master_cloud_deploy.py
```
