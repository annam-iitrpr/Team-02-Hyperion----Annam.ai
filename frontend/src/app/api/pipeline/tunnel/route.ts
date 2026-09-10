import { NextResponse } from "next/server";

// Vertex AI endpoint IDs (models deployed to iitm01, asia-south1)
const VERTEX_ENDPOINTS = [
  { id: "model1", displayName: "aasra-model1-climate-stress",         endpoint: "5273488664255528960", framework: "XGBoost Classifier" },
  { id: "model2", displayName: "aasra-model2-biological-readiness",   endpoint: "2967645655041835008", framework: "Scikit-Learn Biophysical Gates" },
  { id: "model3", displayName: "aasra-model3-product-ranker",         endpoint: "5672057231277817856", framework: "XGBoost LambdaMART Ranker" },
  { id: "model5", displayName: "aasra-model5-yield-baseline",         endpoint: "7489681893386878976", framework: "XGBoost Regressor" },
  { id: "model6", displayName: "aasra-model6-causal-robi",            endpoint: "1995290347994873856", framework: "Microsoft EconML LinearDML" },
];

export async function GET() {
  return NextResponse.json({
    online: true,
    mode: "vertex_ai_cloud",
    service: "Google Cloud Vertex AI",
    project_id: "iitm01",
    region: "asia-south1",
    status: "online",
    zero_local_dependency: true,
    architecture: "Sequential Causal Pipeline (Model 1 → 2 → 3 → 5 → 6)",
    vertex_endpoints: VERTEX_ENDPOINTS,
    models: VERTEX_ENDPOINTS.map(m => `${m.id}: ${m.displayName} (${m.framework})`),
  });
}
