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

def synthesize_gemini_statement(
    farmer_name: str,
    district: str,
    crop: str,
    growth_stage: str,
    area_acres: float,
    telemetry: Dict[str, Any],
    m1_risk: Dict[str, Any],
    m2_readiness: Dict[str, Any],
    m3_portfolio: Dict[str, Any],
    m5_baseline: Dict[str, Any],
) -> Dict[str, Any]:
    import json
    from app.config import settings

    top_prod = m3_portfolio.get("primary_recommendation") or {}
    prod_name = top_prod.get("name", "Syngenta Biological")
    dosage = top_prod.get("recommended_dosage", "2.0 ml/L")
    stress_type = m1_risk.get("stress_type", "Optimal")
    stress_conf = m1_risk.get("confidence", 0.8)
    is_safe = m2_readiness.get("spray_window_safe", False)
    readiness_score = m2_readiness.get("readiness_score", 0.5)
    delta_t = m2_readiness.get("delta_t", 4.5)
    reasons = m2_readiness.get("safety_reasons", [])
    exp_yield = m5_baseline.get("expected_baseline_yield_q_ha", 25.0)
    exp_yield_acre = m5_baseline.get("expected_baseline_yield_q_acre", 10.0)

    safe_text_hi = "सुरक्षित स्प्रे विंडो सक्रिय है" if is_safe else "वर्तमान में स्प्रे स्थगित करें (शर्तें प्रतिकूल)"
    safe_text_en = "Safe Spray Window Active" if is_safe else "Delay Spraying — Adverse Atmospheric Window"

    fallback_hi = (
        f"किसान साथी {farmer_name}, मॉडल 1 के अनुसार आपके {district} क्षेत्र में {crop} की फसल पर "
        f"{stress_type} (सटीकता {round(stress_conf*100)}%) का जोखिम है। "
        f"मॉडल 2 बायोफिजिकल गेट के अनुसार {safe_text_hi} (डेल्टा-टी: {delta_t}°C)। "
        f"मॉडल 3 द्वारा अनुशंसित जैविक उत्पाद {prod_name} की मात्रा {dosage} है। "
        f"मॉडल 5 के अनुसार आपकी अनुमानित आधार उपज {exp_yield_acre} क्विंटल प्रति एकड़ है।"
    )
    fallback_en = (
        f"Farmer {farmer_name}, Model 1 detects imminent {stress_type} ({round(stress_conf*100)}% confidence) "
        f"for {crop} in {district}. Model 2 Action Gate reports: {safe_text_en} (Delta-T: {delta_t}°C). "
        f"Model 3's Top-Ranked Syngenta prescription is {prod_name} ({dosage}). "
        f"Model 5 projects a baseline harvest yield of {exp_yield_acre} Q/acre ({exp_yield} Q/ha)."
    )

    fallback_payload = {
        "headline": f"{stress_type} Alert: {prod_name} Recommended" if is_safe else f"Spray Hold: High Delta-T ({delta_t}°C)",
        "statement_hi": fallback_hi,
        "statement_en": fallback_en,
        "spray_verdict_badge": "SAFE TO SPRAY" if is_safe else "DELAY SPRAY",
        "timing_guidance": "Early morning (5:30 AM - 8:30 AM) or Late evening after 6:00 PM" if not is_safe else "Optimal spray window open for next 4-6 hours.",
        "product_summary": f"{prod_name} at {dosage} per acre.",
        "yield_outlook": f"{exp_yield_acre} Q/acre baseline under current climate.",
        "generated_by": "Rule-Based Biophysical Synthesis"
    }

    google_keys = settings.get_google_keys()
    if not google_keys:
        return fallback_payload

    prompt = f"""You are AASRA, an elite agricultural AI decision engine deployed across Indian farms.
Synthesize the official findings of 4 Machine Learning models into a concise, authoritative farmer advisory:
- Farmer Name: {farmer_name}
- District: {district}
- Crop: {crop} ({growth_stage}, {area_acres} acres)
- Model 1 (PS-02 Stress Risk): Stress = {stress_type}, Confidence = {stress_conf:.2f}
- Model 2 (PS-02 Biological Action Gate): Safe Window = {is_safe}, Readiness Score = {readiness_score:.4f}, Delta-T = {delta_t}°C, Reasons = {reasons}
- Model 3 (PS-03 Syngenta Product Ranker): Champion = {prod_name}, Dosage = {dosage}, Active Ingredient = {top_prod.get('active_ingredient', '')}, Timing = {top_prod.get('application_timing', '')}
- Model 5 (PS-07 Yield Baseline): Expected Baseline Yield = {exp_yield} Q/ha ({exp_yield_acre} Q/acre)

Return strictly valid JSON with these keys:
{{
  "headline": "Short punchy bilingual header",
  "statement_hi": "Professional, respectful Hindi statement for the farmer clearly explaining Model 1 stress, Model 2 spray safety, Model 3 dosage, and Model 5 yield",
  "statement_en": "Clear, professional English statement explaining all 4 model outputs and actionable next steps",
  "spray_verdict_badge": "SAFE TO SPRAY" or "DELAY SPRAY",
  "timing_guidance": "Precise recommended time window (e.g., Early morning 6:00 - 8:30 AM)",
  "product_summary": "Dosage and mixing instructions for knapsack sprayers",
  "yield_outlook": "Summary of baseline yield preservation"
}}
"""

    for key in google_keys:
        try:
            import google.generativeai as genai
            genai.configure(api_key=key)
            m = genai.GenerativeModel("gemini-2.5-flash")
            response = m.generate_content(prompt)
            raw = response.text.strip()
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
            parsed = json.loads(raw)
            parsed["generated_by"] = "Google Gemini 2.5 Flash"
            return parsed
        except Exception as e:
            logger.warning(f"Gemini statement synthesis attempt failed with key: {e}")
            continue

    return fallback_payload


class AASRAPipelineOrchestrator:
    def __init__(self, client: Optional[VertexMLInferenceClient] = None):
        self.client = client or VertexMLInferenceClient()

    def run_pipeline(self, request_payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Executes the full 4-model pipeline:
        Model 1 (Stress Risk) + Model 2 (Biological Readiness) -> Model 3 (Product Portfolio) + Model 5 (Yield Baseline)
        + Gemini 2.5 Flash Statement Synthesis.
        """
        start_time = time.time()

        farmer_name = request_payload.get("farmer_name") or "Ramkishan Yadav"
        farmer_id = request_payload.get("farmer_id") or "farmer-001"
        district = request_payload.get("district") or request_payload.get("region") or "Kasganj"
        crop = request_payload.get("crop") or request_payload.get("crop_type") or "potato"
        growth_stage = request_payload.get("growth_stage") or "Vegetative"
        area_acres = safe_float(request_payload.get("area_acres"), 4.5)

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

        # Layer 2: Model 1 & Model 2
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

        # Layer 3: Model 3 Product Portfolio Ranker
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

        # Layer 4: Model 5 Field Yield Baseline Regressor
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

        telemetry_summary = {
            "temp_max_c": temp_max,
            "temp_min_c": temp_min,
            "rh_avg_pct": rh_avg,
            "vpd_kpa": round(vpd, 2),
            "delta_t_c": round(delta_t, 2),
            "wind_speed_kmh": wind_speed,
            "rain_prob_next_48h": rain_prob,
            "soil_moisture_pct": soil_moisture
        }

        m1_risk_obj = {
            "stress_type": m1_result["stress_type"],
            "stress_class": m1_result["stress_class"],
            "confidence": m1_result["confidence"],
            "days_to_impact": 4 if m1_result["stress_class"] != 0 else 0,
            "probabilities": m1_result["probabilities"]
        }

        m2_readiness_obj = {
            "spray_window_safe": m2_result["spray_window_safe"],
            "readiness_score": m2_result["readiness_score"],
            "delta_t": m2_result["delta_t"],
            "safety_reasons": m2_result["reasons"]
        }

        m3_portfolio_obj = {
            "top_recommendations": m3_ranked,
            "primary_recommendation": m3_ranked[0] if m3_ranked else None
        }

        m5_baseline_obj = {
            "expected_baseline_yield_q_ha": m5_result["expected_baseline_yield_q_ha"],
            "expected_baseline_yield_q_acre": m5_result["expected_baseline_yield_q_acre"],
            "historical_district_average_q_ha": m5_result["historical_district_average_q_ha"],
            "yield_impact_pct": m5_result["yield_impact_pct"]
        }

        # Synthesize Gemini statement
        gemini_statement = synthesize_gemini_statement(
            farmer_name=farmer_name,
            district=district,
            crop=crop,
            growth_stage=growth_stage,
            area_acres=area_acres,
            telemetry=telemetry_summary,
            m1_risk=m1_risk_obj,
            m2_readiness=m2_readiness_obj,
            m3_portfolio=m3_portfolio_obj,
            m5_baseline=m5_baseline_obj
        )

        latency_ms = round((time.time() - start_time) * 1000, 2)

        unified_payload = {
            "farmer_name": farmer_name,
            "farmer_id": farmer_id,
            "district": district,
            "crop": crop,
            "growth_stage": growth_stage,
            "area_acres": area_acres,
            "telemetry_summary": telemetry_summary,
            "model1_risk": m1_risk_obj,
            "model2_readiness": m2_readiness_obj,
            "model3_portfolio": m3_portfolio_obj,
            "model5_baseline": m5_baseline_obj,
            "gemini_statement": gemini_statement,
            "execution_metadata": {
                "models_executed": ["Model 1 (PS-02)", "Model 2 (PS-02)", "Model 3 (PS-03)", "Model 5 (PS-07)"],
                "serving_mode": m1_result.get("serving_mode", "local_optimized_runtime"),
                "ai_synthesis_engine": gemini_statement.get("generated_by", "Google Gemini"),
                "latency_ms": latency_ms,
                "timestamp": time.strftime("%Y-%m-%d %H:%M:%S UTC", time.gmtime())
            }
        }

        return sanitize_for_json(unified_payload)

