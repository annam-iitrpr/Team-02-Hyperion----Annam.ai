/**
 * AASRA Machine Learning Pipeline API Client
 * Connects Frontend Website directly to the Vertex AI / Cloud Backend Pipeline.
 * Models: 1 (Stress Risk), 2 (Biological Readiness), 3 (Portfolio Ranker), 5 (Yield Baseline).
 */

export interface UnifiedPipelineResponse {
  farmer_name?: string;
  farmer_id: string;
  district: string;
  crop: string;
  growth_stage: string;
  area_acres?: number;
  telemetry_summary: {
    temp_max_c: number;
    temp_min_c: number;
    rh_avg_pct: number;
    vpd_kpa: number;
    delta_t_c: number;
    wind_speed_kmh: number;
    rain_prob_next_48h: number;
    soil_moisture_pct: number;
  };
  model1_risk: {
    stress_type: string;
    stress_class: number;
    confidence: number;
    days_to_impact: number;
    probabilities: Record<string, number>;
  };
  model2_readiness: {
    spray_window_safe: boolean;
    readiness_score: number;
    delta_t: number;
    safety_reasons: string[];
  };
  model3_portfolio: {
    top_recommendations: Array<{
      rank: number;
      product_key: string;
      name: string;
      category: string;
      subcategory: string;
      active_ingredient: string;
      rank_score: number;
      efficacy_score_pct: number;
      recommended_dosage: string;
      application_timing: string;
      registration: string;
      tank_mix_safe: string[];
      description: string;
    }>;
    primary_recommendation: any;
  };
  model5_baseline: {
    expected_baseline_yield_q_ha: number;
    expected_baseline_yield_q_acre: number;
    historical_district_average_q_ha: number;
    yield_impact_pct: number;
  };
  gemini_statement?: {
    headline: string;
    statement: string;
    statement_hi: string;
    statement_en: string;
    spray_verdict_badge: string;
    timing_guidance: string;
    product_summary: string;
    yield_outlook: string;
    generated_by?: string;
    language_used?: string;
  };
  execution_metadata: {
    models_executed: string[];
    serving_mode: string;
    ai_synthesis_engine?: string;
    latency_ms: number;
    timestamp: string;
  };
}

export async function fetchPipelineModels() {
  try {
    const res = await fetch("/api/pipeline/models", { cache: "no-store" });
    if (res.ok) return await res.json();
  } catch (err) {
    console.warn("Could not fetch models metadata:", err);
  }
  return null;
}

export async function runAASRAPipeline(payload: {
  farmer_name?: string;
  farmer_id?: string;
  district?: string;
  crop?: string;
  growth_stage?: string;
  area_acres?: number;
  language?: string;
  temp_max_c?: number;
  temp_min_c?: number;
  rh_avg_pct?: number;
  wind_speed_kmh?: number;
  rain_prob_pct?: number;
  soil_moisture_pct?: number;
  consecutive_hot_days?: number;
}): Promise<UnifiedPipelineResponse | null> {
  try {
    const res = await fetch("/api/pipeline/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn("Direct /api/pipeline/run failed, attempting direct backend call:", err);
  }

  // Fallback direct call to localhost:8000 if running locally
  try {
    const res = await fetch("http://localhost:8000/api/pipeline/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    if (res.ok) {
      return await res.json();
    }
  } catch {}

  return null;
}
