"""
AASRA Master Pipeline Orchestrator (Models 1, 2, 3, 5)
Follows AASRA Master ML Playbook (Sections 1, 2, 3, 4).
"""

import time
import math
import logging
from typing import Dict, Any, List, Optional
import httpx
import numpy as np

from .inference_client import VertexMLInferenceClient

logger = logging.getLogger(__name__)

# Regional Defaults for Indian Agro-Climatic Zones
REGIONAL_DEFAULTS = {
    "kasganj": {"lat": 27.81, "lon": 78.65, "soil_clay_pct": 32.0, "soil_ec_ds_m": 0.8, "soil_ph": 7.4, "hist_yield_q_ha": 24.5, "crop": "potato"},
    "bhopal": {"lat": 23.2599, "lon": 77.4126, "soil_clay_pct": 42.0, "soil_ec_ds_m": 0.6, "soil_ph": 7.2, "hist_yield_q_ha": 18.2, "crop": "soybean"},
    "indore": {"lat": 22.7196, "lon": 75.8577, "soil_clay_pct": 45.0, "soil_ec_ds_m": 0.5, "soil_ph": 7.5, "hist_yield_q_ha": 19.5, "crop": "soybean"},
    "punjab": {"lat": 30.9, "lon": 75.86, "soil_clay_pct": 22.0, "soil_ec_ds_m": 1.1, "soil_ph": 7.8, "hist_yield_q_ha": 48.0, "crop": "wheat"},
    "ludhiana": {"lat": 30.9, "lon": 75.86, "soil_clay_pct": 22.0, "soil_ec_ds_m": 1.1, "soil_ph": 7.8, "hist_yield_q_ha": 48.0, "crop": "wheat"},
    "vidarbha": {"lat": 20.93, "lon": 77.75, "soil_clay_pct": 52.0, "soil_ec_ds_m": 0.7, "soil_ph": 7.6, "hist_yield_q_ha": 14.0, "crop": "cotton_bt"},
    "saurashtra": {"lat": 21.52, "lon": 70.45, "soil_clay_pct": 28.0, "soil_ec_ds_m": 1.4, "soil_ph": 8.0, "hist_yield_q_ha": 16.5, "crop": "groundnut"},
    "kurnool": {"lat": 15.8281, "lon": 78.0373, "soil_clay_pct": 25.0, "soil_ec_ds_m": 1.2, "soil_ph": 7.9, "hist_yield_q_ha": 26.0, "crop": "rice"}
}

def calculate_vpd(temp_c: float, rh_pct: float) -> float:
    """Calculates Vapor Pressure Deficit in kPa."""
    es = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
    ea = es * (rh_pct / 100.0)
    return max(0.1, es - ea)

def calculate_delta_t(t_dry: float, rh_pct: float) -> float:
    """
    Calculates Delta-T (°C) = Dry bulb temp - Wet bulb temp (Stull's equation).
    Governs droplet evaporation rate.
    """
    rh = max(1.0, min(rh_pct, 100.0))
    t = t_dry
    t_wet = (
        t * math.atan(0.151977 * math.sqrt(rh + 8.313659))
        + math.atan(t + rh)
        - math.atan(rh - 1.676331)
        + 0.00391838 * (rh ** 1.5) * math.atan(0.023101 * rh)
        - 4.686035
    )
    return max(0.0, t - t_wet)

def sanitize_for_json(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {str(k): sanitize_for_json(v) for k, v in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [sanitize_for_json(v) for v in obj]
    elif isinstance(obj, (np.floating, np.float32, np.float64)):
        return float(obj)
    elif isinstance(obj, (np.integer, np.int32, np.int64)):
        return int(obj)
    elif isinstance(obj, np.bool_):
        return bool(obj)
    elif isinstance(obj, np.ndarray):
        return [sanitize_for_json(v) for v in obj.tolist()]
    return obj

def safe_float(val: Any, default: float) -> float:
    if val is None:
        return float(default)
    try:
        return float(val)
    except (ValueError, TypeError):
        return float(default)

def safe_int(val: Any, default: int) -> int:
    if val is None:
        return int(default)
    try:
        return int(val)
    except (ValueError, TypeError):
        return int(default)

class AASRAPipelineOrchestrator:
    def __init__(self, client: Optional[VertexMLInferenceClient] = None):
        self.client = client or VertexMLInferenceClient()

    def run_pipeline(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the full 4-model pipeline:
        Model 1 (Stress Risk) + Model 2 (Biological Readiness) -> Model 3 (Product Portfolio) + Model 5 (Yield Baseline).
        """
        start_time = time.time()

        farmer_id = request_payload.get("farmer_id") or "farmer-001"
        district = request_payload.get("district") or request_payload.get("region") or "Kasganj"
        crop = request_payload.get("crop") or request_payload.get("crop_type") or "potato"
        growth_stage = request_payload.get("growth_stage") or "Vegetative"

        # Resolve location coordinates and soil properties
        dist_key = str(district).lower().strip()
        reg_info = REGIONAL_DEFAULTS.get(dist_key, REGIONAL_DEFAULTS["kasganj"])
        
        lat = safe_float(request_payload.get("lat"), reg_info["lat"])
        lon = safe_float(request_payload.get("lon"), reg_info["lon"])

        # Microclimate and Soil features
        temp_max = safe_float(request_payload.get("temp_max_c"), 35.5)
        temp_min = safe_float(request_payload.get("temp_min_c"), 24.8)
        rh_avg = safe_float(request_payload.get("rh_avg_pct"), 52.0)
        wind_speed = safe_float(request_payload.get("wind_speed_kmh"), 11.2)
        rain_prob = safe_float(request_payload.get("rain_prob_pct"), 15.0)
        soil_moisture = safe_float(request_payload.get("soil_moisture_pct"), 38.0)
        consecutive_hot = safe_int(request_payload.get("consecutive_hot_days"), 3)
        gdd = safe_float(request_payload.get("gdd_accumulated"), 1420.0)
        rain_3d = safe_float(request_payload.get("rainfall_3d_sum_mm"), 0.0)

        soil_clay = safe_float(request_payload.get("soil_clay_pct"), reg_info["soil_clay_pct"])
        soil_ec = safe_float(request_payload.get("soil_ec_ds_m"), reg_info["soil_ec_ds_m"])
        soil_ph = safe_float(request_payload.get("soil_ph"), reg_info["soil_ph"])
        hist_yield = safe_float(request_payload.get("district_historical_mean_yield"), reg_info["hist_yield_q_ha"])

        # Compute thermodynamic variables
        vpd = calculate_vpd(temp_max, rh_avg)
        delta_t = calculate_delta_t(temp_max, rh_avg)

        # Stage sensitivity (Flowering and pod/grain stages have higher biological impact)
        stage_lower = growth_stage.lower()
        if any(s in stage_lower for s in ["flower", "bloom", "anthesis"]):
            stage_sensitivity = 1.0
        elif any(s in stage_lower for s in ["pod", "tuber", "fruit", "grain"]):
            stage_sensitivity = 0.85
        elif any(s in stage_lower for s in ["tillering", "vegetative"]):
            stage_sensitivity = 0.45
        else:
            stage_sensitivity = 0.30

        # ----------------------------------------------------
        # Layer 2: Model 1 (Stress Risk) & Model 2 (Readiness)
        # ----------------------------------------------------
        m1_features = {
            "temp_max_forecast_7d": temp_max,
            "temp_night_min_7d": temp_min,
            "rh_avg_forecast_7d": rh_avg,
            "vpd_kpa": vpd,
            "soil_moisture_vol_pct": soil_moisture,
            "consecutive_hot_days": consecutive_hot,
            "crop_gdd_accumulated": gdd,
            "rainfall_3d_sum_mm": rain_3d,
            "soil_clay_pct": soil_clay,
            "soil_ec_ds_m": soil_ec,
            "soil_ph": soil_ph
        }
        m1_result = self.client.predict_model1(m1_features)

        m2_features = {
            "soil_moisture_pct": soil_moisture,
            "delta_t_celsius": delta_t,
            "wind_speed_kmh": wind_speed,
            "rain_prob_next_48h": rain_prob,
            "crop_stage_sensitivity": stage_sensitivity
        }
        m2_result = self.client.predict_model2(m2_features)

        # ----------------------------------------------------
        # Layer 3: Model 3 (Syngenta Product Portfolio Ranker)
        # ----------------------------------------------------
        farm_context = {
            "crop": crop,
            "growth_stage": growth_stage,
            "temp_max_c": temp_max,
            "temp_min_c": temp_min,
            "soil_moisture_pct": soil_moisture,
            "rain_3d_mm": rain_3d,
            "soil_ec_dsm": soil_ec,
            "vpd_kpa": vpd,
            "canopy_temp_depression_c": max(0.5, 33.0 - temp_max),
            "mandi_price_inr_q": request_payload.get("mandi_price_inr_q", 2800.0)
        }
        m3_ranked = self.client.predict_model3(farm_context, m1_result, m2_result, top_k=3)

        # ----------------------------------------------------
        # Layer 4: Model 5 (Field Yield Baseline Regressor)
        # ----------------------------------------------------
        m5_context = {
            "crop": crop,
            "district_historical_mean_yield": hist_yield,
            "gdd_seasonal_total": gdd,
            "rainfall_total_mm": float(request_payload.get("seasonal_rainfall_mm", 620.0)),
            "dry_spell_max_consecutive_days": int(request_payload.get("dry_spell_max_days", 7)),
            "extreme_heat_days_count": int(request_payload.get("extreme_heat_days", consecutive_hot)),
            "soil_clay_pct": soil_clay
        }
        m5_result = self.client.predict_model5(m5_context)

        latency_ms = round((time.time() - start_time) * 1000, 2)

        # Build Standardized Unified JSON Payload Contract (Page 11 AASRA Master Guide)
        unified_payload = {
            "farmer_id": farmer_id,
            "district": district,
            "crop": crop,
            "growth_stage": growth_stage,
            "telemetry_summary": {
                "temp_max_c": temp_max,
                "temp_min_c": temp_min,
                "rh_avg_pct": rh_avg,
                "vpd_kpa": round(vpd, 2),
                "delta_t_c": round(delta_t, 2),
                "wind_speed_kmh": wind_speed,
                "rain_prob_next_48h": rain_prob,
                "soil_moisture_pct": soil_moisture
            },
            "model1_risk": {
                "stress_type": m1_result["stress_type"],
                "stress_class": m1_result["stress_class"],
                "confidence": m1_result["confidence"],
                "days_to_impact": 4 if m1_result["stress_class"] != 0 else 0,
                "probabilities": m1_result["probabilities"]
            },
            "model2_readiness": {
                "spray_window_safe": m2_result["spray_window_safe"],
                "readiness_score": m2_result["readiness_score"],
                "delta_t": m2_result["delta_t"],
                "safety_reasons": m2_result["reasons"]
            },
            "model3_portfolio": {
                "top_recommendations": m3_ranked,
                "primary_recommendation": m3_ranked[0] if m3_ranked else None
            },
            "model5_baseline": {
                "expected_baseline_yield_q_ha": m5_result["expected_baseline_yield_q_ha"],
                "expected_baseline_yield_q_acre": m5_result["expected_baseline_yield_q_acre"],
                "historical_district_average_q_ha": m5_result["historical_district_average_q_ha"],
                "yield_impact_pct": m5_result["yield_impact_pct"]
            },
            "execution_metadata": {
                "models_executed": ["Model 1 (PS-02)", "Model 2 (PS-02)", "Model 3 (PS-03)", "Model 5 (PS-07)"],
                "serving_mode": m1_result.get("serving_mode", "local_optimized_runtime"),
                "latency_ms": latency_ms,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            }
        }

        return sanitize_for_json(unified_payload)
