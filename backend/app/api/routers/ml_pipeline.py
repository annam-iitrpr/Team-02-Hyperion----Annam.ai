"""
AASRA FastAPI Router: Master Machine Learning Pipeline (Models 1, 2, 3, 5)
Exposes the end-to-end Vertex AI and local serving pipeline.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import logging

from app.services.ml_pipeline import AASRAPipelineOrchestrator, VertexMLInferenceClient

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/pipeline", tags=["ML Pipeline"])

# Global singleton orchestrator
orchestrator = AASRAPipelineOrchestrator()

class PipelineRunRequest(BaseModel):
    farmer_id: Optional[str] = Field("farmer-001", description="Unique farmer identifier")
    district: Optional[str] = Field("Kasganj", description="District or agro-ecological zone")
    region: Optional[str] = Field(None, description="Alternative alias for district")
    crop: Optional[str] = Field("potato", description="Crop name (e.g. potato, soybean, wheat, rice, maize, groundnut)")
    crop_type: Optional[str] = Field(None, description="Alternative alias for crop")
    growth_stage: Optional[str] = Field("Vegetative", description="Crop growth stage")
    
    # Coordinates (optional)
    lat: Optional[float] = None
    lon: Optional[float] = None
    
    # Microclimate overrides (optional)
    temp_max_c: Optional[float] = None
    temp_min_c: Optional[float] = None
    rh_avg_pct: Optional[float] = None
    wind_speed_kmh: Optional[float] = None
    rain_prob_pct: Optional[float] = None
    soil_moisture_pct: Optional[float] = None
    consecutive_hot_days: Optional[int] = None
    gdd_accumulated: Optional[float] = None
    rainfall_3d_sum_mm: Optional[float] = None
    
    # Soil & Economic overrides (optional)
    soil_clay_pct: Optional[float] = None
    soil_ec_ds_m: Optional[float] = None
    soil_ph: Optional[float] = None
    mandi_price_inr_q: Optional[float] = 2800.0
    product_cost_inr_acre: Optional[float] = 400.0
    treatment_applied: Optional[int] = Field(1, description="1=Syngenta Biological applied, 0=Untreated control")
    area_acres: Optional[float] = Field(5.0, description="Farm field size in acres")

@router.post("/run")
async def run_pipeline(request: PipelineRunRequest):
    """
    Executes the unified 5-model machine learning pipeline:
    - Model 1 (PS-02): Climate Stress Early Warning Classifier
    - Model 2 (PS-02): Biological Intervention Readiness Engine & Safety Gating
    - Model 3 (PS-03): Syngenta 50 Biological Products LambdaMART Ranker
    - Model 5 (PS-07): Field Yield Baseline Regressor
    - Model 6 (PS-07): Causal Double ML & ROBI Attribution (Microsoft EconML)
    """
    try:
        payload = request.model_dump()
        result = orchestrator.run_pipeline(payload)
        return result
    except Exception as e:
        logger.error(f"Error executing pipeline: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/models")
async def get_models_status():
    """Returns registration metadata, serving mode, and feature specs for the models."""
    client = orchestrator.client
    return {
        "models": {
            "model1": {
                "name": "Model 1: Climate Stress Early Warning Classifier",
                "track": "PS-02 (Risk)",
                "framework": "XGBoost Classifier",
                "status": "LOADED" if client.m1_model is not None else "ERROR",
                "serving_mode": "vertex_ai_endpoint" if client.use_remote_vertex and client.endpoint_m1 else "local_optimized_runtime"
            },
            "model2": {
                "name": "Model 2: Biological Intervention Readiness Engine",
                "track": "PS-02 (Action Gate)",
                "framework": "CalibratedClassifierCV + Biophysical Gates",
                "status": "LOADED" if client.m2_engine is not None else "ERROR",
                "serving_mode": "vertex_ai_endpoint" if client.use_remote_vertex and client.endpoint_m2 else "local_optimized_runtime"
            },
            "model3": {
                "name": "Model 3: Syngenta Product Portfolio Ranker",
                "track": "PS-03 (Portfolio)",
                "framework": "XGBRanker (LambdaMART)",
                "catalog_size": len(client.syngenta_catalog),
                "status": "LOADED" if client.m3_ranker is not None else "ERROR",
                "serving_mode": "vertex_ai_endpoint" if client.use_remote_vertex and client.endpoint_m3 else "local_optimized_runtime"
            },
            "model5": {
                "name": "Model 5: Field Yield Baseline Prediction Regressor",
                "track": "PS-07 (Baseline)",
                "framework": "XGBoost Regressor",
                "status": "LOADED" if client.m5_model is not None else "ERROR",
                "serving_mode": "vertex_ai_endpoint" if client.use_remote_vertex and client.endpoint_m5 else "local_optimized_runtime"
            },
            "model6": {
                "name": "Model 6: Causal Biological Impact & ROBI Attribution",
                "track": "PS-07 (Causal ROBI)",
                "framework": "Microsoft EconML (LinearDML) + Scikit-Learn",
                "status": "LOADED" if client.m6_dml is not None else "ERROR",
                "serving_mode": "vertex_ai_endpoint" if client.use_remote_vertex and client.endpoint_m6 else "local_optimized_runtime"
            }
        },
        "vertex_ai_config": {
            "project_id": client.project_id,
            "region": client.region,
            "remote_enabled": client.use_remote_vertex
        }
    }

@router.get("/simulate-scenario")
async def simulate_scenario(scenario: str = Query("heatwave", pattern="^(heatwave|drought|optimal|excess_wind|heavy_rain)$")):
    """Simulates realistic agronomic stress scenarios across India."""
    scenarios = {
        "heatwave": {
            "district": "Kasganj", "crop": "potato", "growth_stage": "Tuber Initiation",
            "temp_max_c": 39.5, "temp_min_c": 26.2, "rh_avg_pct": 38.0,
            "wind_speed_kmh": 8.5, "rain_prob_pct": 5.0, "soil_moisture_pct": 28.0,
            "consecutive_hot_days": 6
        },
        "drought": {
            "district": "Vidarbha", "crop": "soybean", "growth_stage": "Flowering",
            "temp_max_c": 36.0, "temp_min_c": 24.0, "rh_avg_pct": 28.0,
            "wind_speed_kmh": 12.0, "rain_prob_pct": 0.0, "soil_moisture_pct": 18.0,
            "consecutive_hot_days": 4
        },
        "optimal": {
            "district": "Punjab", "crop": "wheat", "growth_stage": "Tillering",
            "temp_max_c": 24.0, "temp_min_c": 14.0, "rh_avg_pct": 65.0,
            "wind_speed_kmh": 7.0, "rain_prob_pct": 10.0, "soil_moisture_pct": 55.0,
            "consecutive_hot_days": 0
        },
        "excess_wind": {
            "district": "Saurashtra", "crop": "groundnut", "growth_stage": "Pegging",
            "temp_max_c": 34.0, "temp_min_c": 23.0, "rh_avg_pct": 50.0,
            "wind_speed_kmh": 22.5, "rain_prob_pct": 10.0, "soil_moisture_pct": 45.0,
            "consecutive_hot_days": 1
        },
        "heavy_rain": {
            "district": "Bhopal", "crop": "soybean", "growth_stage": "Pod Formation",
            "temp_max_c": 28.0, "temp_min_c": 22.0, "rh_avg_pct": 92.0,
            "wind_speed_kmh": 14.0, "rain_prob_pct": 85.0, "soil_moisture_pct": 68.0,
            "consecutive_hot_days": 0
        }
    }
    payload = scenarios.get(scenario, scenarios["heatwave"])
    return orchestrator.run_pipeline(payload)

class CausalROBIRequest(BaseModel):
    crop: str = "potato"
    growth_stage: str = "podFormation"
    stress_intensity: Optional[float] = 0.75
    temp_max_c: Optional[float] = 38.5
    extreme_heat_days_count: Optional[float] = 4.0
    soil_clay_pct: Optional[float] = 35.0
    treatment_applied: Optional[int] = 1
    mandi_price_inr_q: Optional[float] = 2800.0
    product_cost_inr_acre: Optional[float] = 400.0
    baseline_yield_q_acre: Optional[float] = 21.0
    area_acres: Optional[float] = 5.0
    product_name: Optional[str] = "Quantis"

@router.post("/causal-robi")
async def calculate_causal_robi(req: CausalROBIRequest):
    """
    Direct endpoint for Model 6: PS-07 Double Machine Learning Causal ROBI Attribution.
    Partial out irrigation and weather confounders to return true counterfactual yield gain and ROBI multiplier.
    """
    try:
        client = orchestrator.client
        farm_context = {
            "crop": req.crop,
            "growth_stage": req.growth_stage,
            "temp_max_c": req.temp_max_c,
            "extreme_heat_days_count": req.extreme_heat_days_count,
            "soil_clay_pct": req.soil_clay_pct
        }
        m1_result = {
            "stress_class": 1 if (req.stress_intensity or 0) > 0.3 else 0,
            "confidence": req.stress_intensity or 0.75
        }
        m5_result = {
            "expected_baseline_yield_q_acre": req.baseline_yield_q_acre or 21.0
        }
        return client.predict_model6(
            farm_context=farm_context,
            m1_result=m1_result,
            m5_result=m5_result,
            treatment_applied=req.treatment_applied or 1,
            mandi_price_inr_q=req.mandi_price_inr_q or 2800.0,
            product_cost_inr_acre=req.product_cost_inr_acre or 400.0,
            area_acres=req.area_acres or 5.0,
            product_name=req.product_name or "Quantis"
        )
    except Exception as e:
        logger.error(f"Error in causal ROBI endpoint: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))
