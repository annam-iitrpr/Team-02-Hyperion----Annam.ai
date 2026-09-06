"""
AASRA Vertex AI Dual-Mode Inference Client
Implements Vertex AI Endpoint Online Predictions with local fallback for zero-cloud bills.
"""

import os
import sys
import json
import logging
from typing import Dict, Any, List, Optional
import joblib
import numpy as np
import pandas as pd
import xgboost as xgb

from .engine import BiologicalReadinessEngine, MODEL2_FEATURES

logger = logging.getLogger(__name__)

# Base path to vertex_ai packages
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(CURRENT_DIR, "..", "..", "..", ".."))

# Search candidates for standalone deployment (Docker / Render / Hugging Face)
_candidates = [
    os.path.join(PROJECT_ROOT, "backend", "vertex_ai"),
    os.path.join(PROJECT_ROOT, "vertex_ai"),
    os.path.join(CURRENT_DIR, "..", "..", "..", "vertex_ai"),
    os.path.join(os.getcwd(), "vertex_ai"),
    os.path.join(os.getcwd(), "backend", "vertex_ai"),
]
VERTEX_DIR = next((p for p in _candidates if os.path.isdir(p)), os.path.join(PROJECT_ROOT, "vertex_ai"))

MODEL1_CLASSES = {
    0: "Optimal / No Severe Stress",
    1: "Heat Stress",
    2: "Drought Stress",
    3: "Compound Heat-Drought Stress",
    4: "Flooding / Waterlogging",
    5: "Frost / Cold Shock",
    6: "Salinity / Osmotic Shock"
}

MODEL1_FEATURE_NAMES = [
    "temp_max_forecast_7d",
    "temp_night_min_7d",
    "rh_avg_forecast_7d",
    "vpd_kpa",
    "soil_moisture_vol_pct",
    "consecutive_hot_days",
    "crop_gdd_accumulated",
    "rainfall_3d_sum_mm",
    "soil_clay_pct",
    "soil_ec_ds_m",
    "soil_ph"
]

MODEL3_FEATURE_NAMES = [
    "m1_stress_class",
    "m1_stress_intensity",
    "temp_max_c",
    "temp_min_c",
    "soil_moisture_pct",
    "rain_3d_mm",
    "soil_ec_dsm",
    "vpd_kpa",
    "canopy_temp_depression_c",
    "stage_sensitivity_weight",
    "mandi_price_inr_q",
    "product_cost_inr",
    "efficacy_heat",
    "efficacy_drought",
    "efficacy_fungal",
    "efficacy_insect",
    "stage_suitability",
    "is_crop_approved",
    "stress_match_index",
    "stage_match_synergy",
    "crop_legal_affinity",
    "economic_roi_factor"
]

MODEL5_FEATURE_NAMES = [
    "district_historical_mean_yield",
    "gdd_seasonal_total",
    "rainfall_total_mm",
    "dry_spell_max_consecutive_days",
    "extreme_heat_days_count",
    "soil_clay_pct",
    "hydrothermal_stress",
    "effective_water_retention",
    "heat_shock_penalty",
    "drought_resilience",
    "gdd_rain_interaction",
    "crop_groundnut",
    "crop_maize",
    "crop_potato",
    "crop_rice",
    "crop_soybean",
    "crop_sugarcane",
    "crop_wheat"
]

class VertexMLInferenceClient:
    """
    Manages predictions across AASRA Models 1, 2, 3, and 5.
    If Google Cloud Vertex AI Endpoint IDs are supplied in environment variables,
    it queries the remote Vertex AI endpoint. Otherwise, it serves high-speed local inference.
    """
    def __init__(self):
        self.project_id = os.getenv("VERTEX_AI_PROJECT_ID", "annam-ai-hackathon-2026")
        self.region = os.getenv("VERTEX_AI_REGION", "asia-south1")
        self.endpoint_m1 = os.getenv("VERTEX_AI_MODEL1_ENDPOINT_ID")
        self.endpoint_m2 = os.getenv("VERTEX_AI_MODEL2_ENDPOINT_ID")
        self.endpoint_m3 = os.getenv("VERTEX_AI_MODEL3_ENDPOINT_ID")
        self.endpoint_m5 = os.getenv("VERTEX_AI_MODEL5_ENDPOINT_ID")

        self.use_remote_vertex = bool(self.endpoint_m1 and os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
        
        # Local model cache
        self.m1_model = None
        self.m2_engine = None
        self.m3_ranker = None
        self.m5_model = None
        self.syngenta_catalog = []
        
        self._initialize_models()

    def _initialize_models(self):
        """Loads and prepares local model artifacts for zero-latency inference."""
        try:
            # Model 1
            m1_path = os.path.join(VERTEX_DIR, "model1_climate_stress", "model.joblib")
            if os.path.exists(m1_path):
                self.m1_model = joblib.load(m1_path)
                logger.info("✓ Loaded Model 1 (Climate Stress Classifier)")

            # Model 2
            m2_path = os.path.join(VERTEX_DIR, "model2_biological_readiness", "model.joblib")
            if os.path.exists(m2_path):
                # Ensure class binding is present
                if "__main__" in sys.modules and not hasattr(sys.modules["__main__"], "BiologicalReadinessEngine"):
                    setattr(sys.modules["__main__"], "BiologicalReadinessEngine", BiologicalReadinessEngine)
                m2_raw = joblib.load(m2_path)
                if isinstance(m2_raw, BiologicalReadinessEngine):
                    self.m2_engine = m2_raw
                else:
                    self.m2_engine = BiologicalReadinessEngine(m2_raw)
                logger.info("✓ Loaded Model 2 (Biological Readiness Engine)")

            # Model 3
            m3_path = os.path.join(VERTEX_DIR, "model3_product_ranker", "model3_product_ranker.joblib")
            if os.path.exists(m3_path):
                self.m3_ranker = joblib.load(m3_path)
                logger.info("✓ Loaded Model 3 (Product Ranker)")

            catalog_path = os.path.join(VERTEX_DIR, "model3_product_ranker", "syngenta_50_products.json")
            if os.path.exists(catalog_path):
                with open(catalog_path, "r", encoding="utf-8") as f:
                    self.syngenta_catalog = json.load(f)
                logger.info(f"✓ Loaded {len(self.syngenta_catalog)} Syngenta biological products catalog")

            # Model 5
            m5_path = os.path.join(VERTEX_DIR, "model5_yield_regressor", "model.joblib")
            if os.path.exists(m5_path):
                self.m5_model = joblib.load(m5_path)
                logger.info("✓ Loaded Model 5 (Yield Regressor)")

        except Exception as e:
            logger.error(f"Error initializing local models: {e}", exc_info=True)

    def predict_model1(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs Model 1: Climate Stress Early Warning Classifier.
        Returns:
            {
                "stress_class": int,
                "stress_name": str,
                "confidence": float,
                "class_probabilities": Dict[str, float]
            }
        """
        if self.use_remote_vertex and self.endpoint_m1:
            return self._predict_vertex_remote(self.endpoint_m1, [features_dict])

        # Local inference
        row = [float(features_dict.get(k, 0.0)) for k in MODEL1_FEATURE_NAMES]
        X = pd.DataFrame([row], columns=MODEL1_FEATURE_NAMES)
        
        probs = self.m1_model.predict_proba(X)[0]
        pred_class = int(np.argmax(probs))
        confidence = float(probs[pred_class])

        prob_dist = {
            MODEL1_CLASSES.get(i, f"Class {i}"): round(float(probs[i]), 4)
            for i in range(len(probs))
        }

        return {
            "stress_class": pred_class,
            "stress_type": MODEL1_CLASSES.get(pred_class, "Unknown"),
            "confidence": round(confidence, 4),
            "probabilities": prob_dist,
            "serving_mode": "local_optimized_runtime"
        }

    def predict_model2(self, features_dict: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs Model 2: Biological Intervention Readiness Engine.
        Returns:
            {
                "readiness_score": float,
                "spray_window_safe": bool,
                "delta_t": float,
                "reasons": List[str]
            }
        """
        if self.use_remote_vertex and self.endpoint_m2:
            return self._predict_vertex_remote(self.endpoint_m2, [features_dict])

        row = {k: float(features_dict.get(k, 0.0)) for k in MODEL2_FEATURES}
        X = pd.DataFrame([row])
        
        res = self.m2_engine.predict_readiness(X)[0]
        res["serving_mode"] = "local_optimized_runtime"
        return res

    def predict_model3(self, farm_context: Dict[str, Any], m1_result: Dict[str, Any], m2_result: Dict[str, Any], top_k: int = 3) -> List[Dict[str, Any]]:
        """
        Runs Model 3: LambdaMART Syngenta Product Ranking.
        Constructs candidate feature vectors for the 50 Syngenta products and ranks them.
        """
        if not self.syngenta_catalog or self.m3_ranker is None:
            return []

        stress_class = m1_result.get("stress_class", 0)
        stress_conf = m1_result.get("confidence", 0.8)
        readiness = m2_result.get("readiness_score", 0.5)
        crop = str(farm_context.get("crop", "soybean")).lower().strip()
        stage = str(farm_context.get("growth_stage", "Vegetative")).lower().strip()

        candidate_rows = []
        for p in self.syngenta_catalog:
            # Agronomic matching factors
            heat_eff = float(p.get("efficacy_heat", 0.5))
            drought_eff = float(p.get("efficacy_drought", 0.5))
            fungal_eff = float(p.get("efficacy_fungal", 0.5))
            insect_eff = float(p.get("efficacy_insect", 0.5))
            
            # Approved crop check
            approved_crops = [c.lower() for c in p.get("crops_approved", [])]
            is_approved = 1.0 if (crop in approved_crops or "all" in approved_crops or not approved_crops) else 0.0

            # Stress match score
            if stress_class == 1:
                stress_match = heat_eff
            elif stress_class == 2:
                stress_match = drought_eff
            elif stress_class == 3:
                stress_match = max(heat_eff, drought_eff) * 0.95
            elif stress_class == 4:
                stress_match = fungal_eff
            elif stress_class == 5:
                stress_match = heat_eff * 0.8
            else:
                stress_match = 0.5

            cost = float(p.get("retail_price_inr", 600))
            mandi_price = float(farm_context.get("mandi_price_inr_q", 2800))
            roi_factor = (mandi_price * 1.5) / max(cost, 100.0)

            feat_row = {
                "m1_stress_class": stress_class,
                "m1_stress_intensity": stress_conf,
                "temp_max_c": float(farm_context.get("temp_max_c", 32.0)),
                "temp_min_c": float(farm_context.get("temp_min_c", 22.0)),
                "soil_moisture_pct": float(farm_context.get("soil_moisture_pct", 45.0)),
                "rain_3d_mm": float(farm_context.get("rain_3d_mm", 0.0)),
                "soil_ec_dsm": float(farm_context.get("soil_ec_dsm", 0.8)),
                "vpd_kpa": float(farm_context.get("vpd_kpa", 1.5)),
                "canopy_temp_depression_c": float(farm_context.get("canopy_temp_depression_c", 2.5)),
                "stage_sensitivity_weight": 0.9 if any(s in stage for s in ["flower", "pod", "grain"]) else 0.5,
                "mandi_price_inr_q": mandi_price,
                "product_cost_inr": cost,
                "efficacy_heat": heat_eff,
                "efficacy_drought": drought_eff,
                "efficacy_fungal": fungal_eff,
                "efficacy_insect": insect_eff,
                "stage_suitability": float(p.get("stage_suitability", 0.8)),
                "is_crop_approved": is_approved,
                "stress_match_index": stress_match,
                "stage_match_synergy": float(p.get("stage_suitability", 0.8)) * readiness,
                "crop_legal_affinity": is_approved * 1.0,
                "economic_roi_factor": min(roi_factor, 15.0)
            }
            candidate_rows.append(feat_row)

        X_cand = pd.DataFrame(candidate_rows)[MODEL3_FEATURE_NAMES]
        scores = self.m3_ranker.predict(X_cand)

        # Pair scores with product details
        ranked_products = []
        for idx, score in enumerate(scores):
            prod = self.syngenta_catalog[idx]
            ranked_products.append({
                "product_key": prod.get("product_key", f"prod_{idx}"),
                "name": prod.get("name", "Syngenta Biological"),
                "category": prod.get("category", "Biostimulant"),
                "subcategory": prod.get("subcategory", "Agronomic Enhancer"),
                "active_ingredient": prod.get("active_ingredient", "Natural Peptides & Amino Acids"),
                "rank_score": float(score),
                "efficacy_score_pct": round(min(max((score + 2.0) / 4.0 * 100, 40.0), 98.5), 1),
                "recommended_dosage": prod.get("recommended_dosage", "2.0 ml/L or 400 ml/acre"),
                "application_timing": prod.get("application_timing", "Foliar spray early morning or late evening"),
                "registration": prod.get("registration", "CIB&RC Registered"),
                "tank_mix_safe": prod.get("tank_mix_safe", ["Standard micronutrients", "Urea 1%"]),
                "description": prod.get("description", "")
            })

        # Sort descending by rank score
        ranked_products.sort(key=lambda x: x["rank_score"], reverse=True)

        top_results = []
        for r_idx, item in enumerate(ranked_products[:top_k], 1):
            item["rank"] = r_idx
            top_results.append(item)

        return top_results

    def predict_model5(self, farm_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs Model 5: Field Baseline Yield Regressor.
        Predicts expected yield (Q/ha) under natural conditions without intervention.
        """
        if self.m5_model is None:
            return {"expected_baseline_yield_q_ha": 20.0, "expected_baseline_yield_q_acre": 8.1}

        crop = str(farm_context.get("crop", "soybean")).lower().strip()
        hist_mean = float(farm_context.get("district_historical_mean_yield", 22.0))
        gdd = float(farm_context.get("gdd_seasonal_total", 1850.0))
        rain = float(farm_context.get("rainfall_total_mm", 650.0))
        dry_days = float(farm_context.get("dry_spell_max_consecutive_days", 8.0))
        heat_days = float(farm_context.get("extreme_heat_days_count", 4.0))
        clay = float(farm_context.get("soil_clay_pct", 35.0))

        # Agronomic feature formulas (identical to predictor.py in Vertex bundle)
        hydrothermal = (dry_days * heat_days) / max(1.0, rain / 100.0)
        water_ret = (clay / 100.0) * np.sqrt(max(0.0, rain))
        heat_shock = np.exp(0.045 * heat_days) - 1.0
        drought_res = clay / max(1.0, dry_days)
        gdd_rain = (gdd * rain) / 1e6

        row_dict = {
            "district_historical_mean_yield": hist_mean,
            "gdd_seasonal_total": gdd,
            "rainfall_total_mm": rain,
            "dry_spell_max_consecutive_days": dry_days,
            "extreme_heat_days_count": heat_days,
            "soil_clay_pct": clay,
            "hydrothermal_stress": hydrothermal,
            "effective_water_retention": water_ret,
            "heat_shock_penalty": heat_shock,
            "drought_resilience": drought_res,
            "gdd_rain_interaction": gdd_rain,
            "crop_groundnut": 1.0 if crop == "groundnut" else 0.0,
            "crop_maize": 1.0 if crop == "maize" else 0.0,
            "crop_potato": 1.0 if crop == "potato" else 0.0,
            "crop_rice": 1.0 if crop == "rice" else 0.0,
            "crop_soybean": 1.0 if crop == "soybean" else 0.0,
            "crop_sugarcane": 1.0 if crop == "sugarcane" else 0.0,
            "crop_wheat": 1.0 if crop == "wheat" else 0.0,
        }

        X_df = pd.DataFrame([row_dict])[MODEL5_FEATURE_NAMES]
        predicted_q_ha = float(self.m5_model.predict(X_df)[0])
        predicted_q_ha = max(predicted_q_ha, 1.0)
        predicted_q_acre = predicted_q_ha * 0.404686

        return {
            "expected_baseline_yield_q_ha": round(predicted_q_ha, 2),
            "expected_baseline_yield_q_acre": round(predicted_q_acre, 2),
            "historical_district_average_q_ha": round(hist_mean, 2),
            "yield_impact_pct": round(((predicted_q_ha - hist_mean) / max(hist_mean, 1.0)) * 100, 1),
            "serving_mode": "local_optimized_runtime"
        }

    def _predict_vertex_remote(self, endpoint_id: str, instances: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Calls Google Cloud Vertex AI REST Prediction Endpoint."""
        try:
            import google.auth
            from google.auth.transport.requests import Request
            import httpx

            credentials, project = google.auth.default()
            credentials.refresh(Request())

            url = f"https://{self.region}-aiplatform.googleapis.com/v1/projects/{self.project_id}/locations/{self.region}/endpoints/{endpoint_id}:predict"
            headers = {
                "Authorization": f"Bearer {credentials.token}",
                "Content-Type": "application/json"
            }
            payload = {"instances": instances}
            
            with httpx.Client(timeout=10.0) as client:
                resp = client.post(url, headers=headers, json=payload)
                resp.raise_for_status()
                data = resp.json()
                return {"predictions": data.get("predictions", []), "serving_mode": "vertex_ai_endpoint"}
        except Exception as e:
            logger.warning(f"Vertex remote prediction failed, fallback to local: {e}")
            raise
