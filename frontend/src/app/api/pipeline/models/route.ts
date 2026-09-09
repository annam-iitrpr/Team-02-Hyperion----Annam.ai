import { NextResponse } from "next/server";

const CLOUD_RUN_URL = "https://aasra-backend-wognmk3jfq-el.a.run.app";

const CLOUD_MODELS_METADATA = {
  models: {
    model1: {
      name: "Model 1: Climate Stress Early Warning Classifier",
      track: "PS-02 (Risk)",
      framework: "XGBoost Multiclass Classifier (7 Classes)",
      status: "ACTIVE",
      serving_mode: "google_vertex_ai",
      vertex_model_id: "projects/715707328541/locations/asia-south1/models/5749957630105747456",
      features_count: 11,
      target: "Abiotic Stress Early Warning (Heat, Drought, Compound, Waterlogging, Frost, Salinity)",
      classes: [
        "Optimal / No Severe Stress",
        "Heat Stress",
        "Drought Stress",
        "Compound Heat-Drought Stress",
        "Flooding / Waterlogging",
        "Frost / Cold Shock",
        "Salinity / Osmotic Shock",
      ],
    },
    model2: {
      name: "Model 2: Biological Intervention Readiness Engine",
      track: "PS-02 (Action Gate)",
      framework: "CalibratedClassifierCV + Biophysical Stomatal Gates",
      status: "ACTIVE",
      serving_mode: "google_vertex_ai",
      vertex_model_id: "projects/715707328541/locations/asia-south1/models/5444838755351396352",
      features_count: 5,
      target: "Stomatal Conductance & 48h Safe Spray Window",
      gating_rules: [
        "Wind Speed <= 15.0 km/h (drift hazard limit)",
        "Delta-T within 2.0°C - 8.0°C (droplet evaporation & runoff boundary)",
        "48h Rain Probability <= 40% (washoff hazard limit)",
        "Soil Moisture >= 25% (hydraulic stress boundary)",
      ],
    },
    model3: {
      name: "Model 3: Syngenta Product Portfolio Ranker",
      track: "PS-03 (Portfolio)",
      framework: "XGBRanker (LambdaMART 50 Products)",
      catalog_size: 50,
      status: "ACTIVE",
      serving_mode: "google_vertex_ai",
      vertex_model_id: "projects/715707328541/locations/asia-south1/models/575321658257047552",
      target: "Crop-Specific CIB&RC Approved Treatment Matching & ROI Optimization",
    },
    model5: {
      name: "Model 5: Field Yield Baseline Prediction Regressor",
      track: "PS-07 (Baseline)",
      framework: "XGBoost Regressor (Calibrated Regional Baseline)",
      status: "ACTIVE",
      serving_mode: "google_vertex_ai",
      vertex_model_id: "projects/715707328541/locations/asia-south1/models/2454448602777387008",
      target: "Counterfactual Benchmark Yield (q/ha & q/acre)",
    },
    model6: {
      name: "Model 6: Causal Biological Impact & ROBI Attribution",
      track: "PS-07 (Causal ROBI)",
      framework: "Microsoft EconML (LinearDML) + Scikit-Learn",
      status: "ACTIVE",
      serving_mode: "google_vertex_ai",
      vertex_model_id: "projects/715707328541/locations/asia-south1/models/7294692302293827584",
      target: "True Causal Treatment Effect (tau) & Unbiased ROBI Multiplier",
      confounders_controlled: ["Rainfall", "Soil Moisture", "Irrigation Type", "Farm Wealth"],
    },
  },
  vertex_ai_config: {
    project_id: "iitm01",
    region: "asia-south1",
    cloud_run_service: CLOUD_RUN_URL,
    remote_enabled: true,
    execution_pipeline: "Sequential Causal DAG (Model 1 -> Model 2 -> Model 3 -> Model 5 -> Model 6)",
  },
};

export async function GET() {
  return NextResponse.json(CLOUD_MODELS_METADATA);
}
