# KrishYantra / AASRA — Backend API Service

The **KrishYantra (AASRA)** backend is a high-performance Python FastAPI service providing real-time telemetry processing, weather microclimate computation, crop biophysical stress modeling, and a secure bridge to Google Cloud Vertex AI machine learning endpoints.

---

## Architecture Overview

```
backend/
├── app/
│   ├── main.py                     # FastAPI application entrypoint & middleware
│   ├── config.py                   # Environment configuration & secret manager
│   ├── routers/                    # Endpoint route controllers
│   │   ├── health.py               # Health checks & system status
│   │   ├── pipeline.py             # 6-Model Vertex AI ML orchestration
│   │   ├── weather.py              # Microclimate, VPD & Delta-T computation
│   │   ├── mandi.py                # APMC Mandi rates & logistics optimization
│   │   └── farmers.py              # Farmer farm data persistence
│   ├── services/                   # Business logic & external service connectors
│   │   ├── vertex_ai_client.py     # Google Cloud Vertex AI client
│   │   ├── weather_service.py      # IMD / Open-Meteo weather telemetry fetcher
│   │   └── mandi_service.py        # Agmarknet live price feed parser
│   └── models/                     # Pydantic schemas & response validation
├── tests/                          # Pytest suite for unit and integration testing
├── check_vertex_status.py          # CLI diagnostic tool to verify Vertex AI endpoints
├── tunnel_bridge.py                # Ngrok / Cloudflare tunnel bridge for local development
├── Dockerfile                      # Production container image definition
├── requirements.txt                # Python package dependencies
└── .env.example                    # Template for environment variables
```

---

## Key Features

1. **6-Model Machine Learning Orchestration**:
   - **Model 1**: Extreme Climate Stress Classifier (Heat, Frost, Drought, Moisture).
   - **Model 2**: Biological Readiness & Spray Safety Gate (Delta-T & VPD computation).
   - **Model 3**: Syngenta Portfolio Ranker (Matches products to crop, stage & stress).
   - **Model 4**: Crop Remission & Yield Salvage Predictor (Trajectory tracking).
   - **Model 5**: Field Genetic Potential & Historical Yield Regressor.
   - **Model 6**: Causal Return on Biological Investment (ROBI) Estimator ($\tau \times \text{Mandi Rate} / \text{Cost}$).

2. **Biophysical Weather Telemetry**:
   - Computes Vapor Pressure Deficit (VPD in kPa), Delta-T (°C), dew point, and foliar spray drift risk based on ambient temperature, relative humidity, and wind speed.

3. **Tunnel Bridge**:
   - `tunnel_bridge.py` allows seamless local development by creating a secure tunnel to forward Vertex AI requests when developing behind NAT or firewalls.

---

## Local Setup & Development

### Prerequisites
- Python 3.10+
- virtualenv or conda

### Installation

```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create and activate a virtual environment
python -m venv venv
# On Windows:
.\venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Configure environment variables
cp .env.example .env
```

### Running the API Server

```bash
# Start FastAPI server with live reloading
uvicorn app.main:app --reload --port 8000
```

- Interactive OpenAPI Swagger documentation: `http://localhost:8000/docs`
- Redoc documentation: `http://localhost:8000/redoc`

### Diagnostic Tools

```bash
# Check status of deployed Vertex AI endpoints
python check_vertex_status.py
```
