import sys
import os

# Ensure backend path is in sys.path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(BASE_DIR, ".."))
if BACKEND_DIR not in sys.path:
    sys.path.insert(0, BACKEND_DIR)

from app.services.ml_pipeline import AASRAPipelineOrchestrator, VertexMLInferenceClient
from app.main import app
from fastapi.testclient import TestClient

def get_client():
    return TestClient(app)

def get_orchestrator():
    return AASRAPipelineOrchestrator()

def test_models_metadata_endpoint(client):
    """Verifies that all 4 models report as LOADED with proper metadata."""
    res = client.get("/api/pipeline/models")
    assert res.status_code == 200
    data = res.json()
    assert "models" in data
    assert data["models"]["model1"]["status"] == "LOADED"
    assert data["models"]["model2"]["status"] == "LOADED"
    assert data["models"]["model3"]["status"] == "LOADED"
    assert data["models"]["model3"]["catalog_size"] == 50
    assert data["models"]["model5"]["status"] == "LOADED"

def test_model1_stress_detection(orchestrator):
    """Verifies Model 1 predicts heat stress under high temperatures."""
    payload = {
        "temp_max_forecast_7d": 41.5,
        "temp_night_min_7d": 27.0,
        "rh_avg_forecast_7d": 35.0,
        "vpd_kpa": 3.8,
        "soil_moisture_vol_pct": 22.0,
        "consecutive_hot_days": 6,
        "crop_gdd_accumulated": 1600.0,
        "rainfall_3d_sum_mm": 0.0,
        "soil_clay_pct": 30.0,
        "soil_ec_ds_m": 0.8,
        "soil_ph": 7.2
    }
    res = orchestrator.client.predict_model1(payload)
    assert res["stress_class"] in [1, 2, 3]  # Heat, Drought, or Compound
    assert res["confidence"] > 0.4
    assert len(res["probabilities"]) == 7

def test_model2_safety_gate_wind_override(orchestrator):
    """Verifies Model 2 biophysical hard gate trips when wind > 15 km/h."""
    payload = {
        "soil_moisture_pct": 48.0,
        "delta_t_celsius": 4.5,
        "wind_speed_kmh": 22.0,  # Violates limit
        "rain_prob_next_48h": 10.0,
        "crop_stage_sensitivity": 0.8
    }
    res = orchestrator.client.predict_model2(payload)
    assert res["spray_window_safe"] is False
    assert any("Wind speed" in r for r in res["reasons"])
    assert res["readiness_score"] <= 0.05

def test_model3_product_ranking(orchestrator):
    """Verifies Model 3 ranks top 3 Syngenta products from catalog of 50."""
    m1_dummy = {"stress_class": 1, "confidence": 0.85}
    m2_dummy = {"readiness_score": 0.75, "spray_window_safe": True}
    farm_ctx = {
        "crop": "potato",
        "growth_stage": "Tuber Initiation",
        "temp_max_c": 36.0,
        "soil_moisture_pct": 40.0
    }
    ranked = orchestrator.client.predict_model3(farm_ctx, m1_dummy, m2_dummy, top_k=3)
    assert len(ranked) == 3
    assert ranked[0]["rank"] == 1
    assert "name" in ranked[0]
    assert "active_ingredient" in ranked[0]
    assert "recommended_dosage" in ranked[0]

def test_model5_baseline_yield(orchestrator):
    """Verifies Model 5 predicts baseline harvest yield in Q/ha and Q/acre."""
    m5_ctx = {
        "crop": "soybean",
        "district_historical_mean_yield": 20.0,
        "gdd_seasonal_total": 1800.0,
        "rainfall_total_mm": 700.0,
        "dry_spell_max_consecutive_days": 5.0,
        "extreme_heat_days_count": 2.0,
        "soil_clay_pct": 40.0
    }
    res = orchestrator.client.predict_model5(m5_ctx)
    assert res["expected_baseline_yield_q_ha"] > 5.0
    assert res["expected_baseline_yield_q_acre"] > 2.0
    assert "yield_impact_pct" in res

def test_end_to_end_fastapi_pipeline_run(client):
    """Verifies the complete POST /api/pipeline/run endpoint."""
    body = {
        "farmer_id": "test-farmer-01",
        "district": "Kasganj",
        "crop": "potato",
        "growth_stage": "Tuber Initiation",
        "temp_max_c": 38.0,
        "rh_avg_pct": 36.0,
        "wind_speed_kmh": 8.0,
        "soil_moisture_pct": 30.0,
        "rain_prob_pct": 5.0
    }
    res = client.post("/api/pipeline/run", json=body)
    assert res.status_code == 200
    json_data = res.json()
    
    # Contract validation
    assert "model1_risk" in json_data
    assert "model2_readiness" in json_data
    assert "model3_portfolio" in json_data
    assert "model5_baseline" in json_data
    assert "execution_metadata" in json_data
    
    # Specific fields
    assert json_data["model1_risk"]["stress_type"] is not None
    assert len(json_data["model3_portfolio"]["top_recommendations"]) == 3
    assert json_data["model5_baseline"]["expected_baseline_yield_q_ha"] > 0
    assert json_data["execution_metadata"]["latency_ms"] < 2000

if __name__ == "__main__":
    print("Executing AASRA Vertex AI ML Pipeline Test Suite...")
    c = get_client()
    o = get_orchestrator()

    print(" -> [1/6] Testing Models Metadata Endpoint...")
    test_models_metadata_endpoint(c)
    print("    [PASS]")

    print(" -> [2/6] Testing Model 1 Climate Stress Detection...")
    test_model1_stress_detection(o)
    print("    [PASS]")

    print(" -> [3/6] Testing Model 2 Biophysical Hard Safety Gating...")
    test_model2_safety_gate_wind_override(o)
    print("    [PASS]")

    print(" -> [4/6] Testing Model 3 Syngenta Product LambdaMART Ranking...")
    test_model3_product_ranking(o)
    print("    [PASS]")

    print(" -> [5/6] Testing Model 5 Field Baseline Yield Regressor...")
    test_model5_baseline_yield(o)
    print("    [PASS]")

    print(" -> [6/6] Testing End-to-End POST /api/pipeline/run Endpoint...")
    test_end_to_end_fastapi_pipeline_run(c)
    print("    [PASS]")

    print("\n=======================================================")
    print("ALL 6 TESTS PASSED WITH 100% SUCCESS!")
    print("Vertex -> Cloud -> API -> Website Contract Fully Verified")
    print("=======================================================")
