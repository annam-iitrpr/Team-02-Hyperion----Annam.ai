"use client";

import React, { useState, useEffect } from "react";
import { AdminShell } from "@/components/AdminShell";
import { pingCloudRunBackend, testVertexModelsPipeline, CLOUD_RUN_URL, MAIN_SITE_URL } from "@/lib/api";
import {
  Cpu,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Droplets,
  Wind,
  Thermometer,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ShieldAlert,
  Clock,
  FlaskConical,
  TrendingUp,
  Activity,
  Code,
  Sliders,
} from "lucide-react";

interface ModelSpec {
  id: string;
  name: string;
  psCode: string;
  type: string;
  vertexId: string;
  description: string;
  targetMetrics: string[];
}

const REGISTERED_MODELS: ModelSpec[] = [
  {
    id: "m1",
    name: "Model 1: Climate Stress Early Warning",
    psCode: "PS-02",
    type: "Classification (GBDT / LightGBM)",
    vertexId: "projects/715707328541/locations/asia-south1/models/5749957630105747456",
    description: "48-72h predictive early warning for heat, drought, waterlogging, frost, and compound abiotic canopy stresses.",
    targetMetrics: ["Stress Class (0-5)", "Confidence %", "Normalized Probabilities", "Days to Impact"],
  },
  {
    id: "m2",
    name: "Model 2: Biological Spray Readiness Gate",
    psCode: "PS-02",
    type: "Biophysical Decision Gate (Delta-T & Inversion)",
    vertexId: "projects/715707328541/locations/asia-south1/models/5444838755351396352",
    description: "Enforces stomatal Delta-T (2-8°C), wind drift (<15 km/h), rain-wash risk, and hydraulic threshold gates before foliar spray.",
    targetMetrics: ["Spray Window Safe (bool)", "Delta-T (°C)", "Readiness Score", "Biophysical Reason"],
  },
  {
    id: "m3",
    name: "Model 3: Syngenta Portfolio Matcher",
    psCode: "PS-03",
    type: "Multi-Objective Ranking & CIB&RC Gate",
    vertexId: "projects/715707328541/locations/asia-south1/models/575321658257047552",
    description: "Filters and ranks crop-approved biostimulants, fungicides, and nutrients based on diagnosed stress class and stage.",
    targetMetrics: ["Product Name", "Dose per Acre", "Trial Efficacy %", "Total Farm Volume", "Tank-Mix Compatibility"],
  },
  {
    id: "m5",
    name: "Model 5: Agro-Ecological Yield Baseline",
    psCode: "PS-07",
    type: "Spatial Regressor (Gradient Boosting)",
    vertexId: "projects/715707328541/locations/asia-south1/models/2454448602777387008",
    description: "Predicts counterfactual district and stage yield benchmarks across Indian agro-climatic zones.",
    targetMetrics: ["Baseline Yield Q/Acre", "Historical Average Q/Ha", "Yield Penalty Risk %"],
  },
  {
    id: "m6",
    name: "Model 6: Causal EconML ROBI Estimator",
    psCode: "PS-07",
    type: "Causal Inference (Orthogonal Random Forest DML)",
    vertexId: "projects/715707328541/locations/asia-south1/models/7294692302293827584",
    description: "Controls confounders to isolate genuine treatment uplift (τ), net farmer profit in INR, and verified ROBI multiplier.",
    targetMetrics: ["Causal Uplift τ (Q/Acre)", "Net Profit (₹)", "ROBI Multiplier", "95% Confidence Interval"],
  },
];

export default function VertexModelsPage() {
  const [cloudRunHealth, setCloudRunHealth] = useState<any>(null);
  const [pinging, setPinging] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "test-bench" | "raw-json">("overview");

  // Test Bench Parameters
  const [crop, setCrop] = useState("potato");
  const [district, setDistrict] = useState("Kasganj");
  const [growthStage, setGrowthStage] = useState("Vegetative");
  const [acres, setAcres] = useState(10.0);
  const [tempMax, setTempMax] = useState(38.5);
  const [tempMin, setTempMin] = useState(26.2);
  const [humidity, setHumidity] = useState(42);
  const [windSpeed, setWindSpeed] = useState(11.5);
  const [rainProb, setRainProb] = useState(10);
  const [soilMoisture, setSoilMoisture] = useState(30);

  // Test Result
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [testLatency, setTestLatency] = useState<number | null>(null);

  const checkHealth = async () => {
    setPinging(true);
    const res = await pingCloudRunBackend();
    setCloudRunHealth(res);
    setPinging(false);
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleRunTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    const res = await testVertexModelsPipeline({
      farmer_name: "Admin Diagnostic Runner",
      district,
      crop,
      growth_stage: growthStage,
      area_acres: acres,
      temp_max_c: tempMax,
      temp_min_c: tempMin,
      rh_avg_pct: humidity,
      wind_speed_kmh: windSpeed,
      rain_prob_pct: rainProb,
      soil_moisture_pct: soilMoisture,
      treatment_applied: 1,
    });
    setTestLoading(false);
    if (res.success) {
      setTestResult(res.data);
      setTestLatency(res.latency);
    }
  };

  return (
    <AdminShell>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexDirection: "column", gap: 24 }}>
        
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
              <span className="badge badge-primary" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>
                VERTEX AI REGISTRY · ASIA-SOUTH1
              </span>
              <span className="badge badge-success" style={{ fontSize: 11 }}>
                5/5 Models Active
              </span>
            </div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--ink)", letterSpacing: "-0.5px" }}>
              Vertex AI Model Observatory &amp; Diagnostic Bench
            </h1>
            <p style={{ fontSize: 13, color: "var(--ink-subtle)", marginTop: 4 }}>
              Monitor production serving status, health latencies, and execute interactive multi-model inferences across Indian agro-zones.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <button
              onClick={checkHealth}
              disabled={pinging}
              className="btn btn-secondary btn-sm"
              style={{ display: "flex", alignItems: "center", gap: 6 }}
            >
              <RefreshCw size={13} className={pinging ? "spin" : ""} />
              <span>{pinging ? "Pinging Cloud Run..." : "Ping Vertex AI"}</span>
            </button>
          </div>
        </div>

        {/* Live Cloud Infrastructure Telemetry Bar */}
        <div className="card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, color: "var(--ink-tertiary)", textTransform: "uppercase", display: "block" }}>
              Cloud Run Service
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
              <span className={`status-dot ${cloudRunHealth?.online ? "online" : "offline"}`} />
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                {cloudRunHealth?.online ? "200 OK — Healthy" : "Checking / Connecting..."}
              </span>
            </div>
            <span style={{ fontSize: 11, color: "var(--ink-subtle)", fontFamily: "var(--font-mono)", display: "block", marginTop: 2 }}>
              Latency: {cloudRunHealth?.latency ?? "—"} ms
            </span>
          </div>

          <div>
            <span style={{ fontSize: 11, color: "var(--ink-tertiary)", textTransform: "uppercase", display: "block" }}>
              GCP Project &amp; Region
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", display: "block", marginTop: 4 }}>
              iitm01 · asia-south1
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>
              Mumbai, India (Low Latency)
            </span>
          </div>

          <div>
            <span style={{ fontSize: 11, color: "var(--ink-tertiary)", textTransform: "uppercase", display: "block" }}>
              Serving Protocol
            </span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", display: "block", marginTop: 4 }}>
              FastAPI + Vertex Container
            </span>
            <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>
              5 Chained Microservices
            </span>
          </div>

          <div>
            <span style={{ fontSize: 11, color: "var(--ink-tertiary)", textTransform: "uppercase", display: "block" }}>
              Main Client URL
            </span>
            <a
              href={`${MAIN_SITE_URL}/plant-intelligence`}
              target="_blank"
              rel="noreferrer"
              style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}
            >
              <span>/plant-intelligence</span>
              <ExternalLink size={12} />
            </a>
            <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>
              Production Vercel Frontend
            </span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div style={{ display: "flex", gap: 4, borderBottom: "1px solid var(--hairline)", paddingBottom: 8 }}>
          <button
            onClick={() => setActiveTab("overview")}
            className={`btn btn-sm ${activeTab === "overview" ? "btn-primary" : "btn-secondary"}`}
          >
            5 Connected Models Architecture
          </button>
          <button
            onClick={() => setActiveTab("test-bench")}
            className={`btn btn-sm ${activeTab === "test-bench" ? "btn-primary" : "btn-secondary"}`}
          >
            Live Model Test Bench &amp; Inference Runner
          </button>
          {testResult && (
            <button
              onClick={() => setActiveTab("raw-json")}
              className={`btn btn-sm ${activeTab === "raw-json" ? "btn-primary" : "btn-secondary"}`}
            >
              Raw Inference JSON ({testLatency} ms)
            </button>
          )}
        </div>

        {/* TAB 1: 5 Connected Models Specification */}
        {activeTab === "overview" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Sequential flow connector */}
            <div
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 20px",
                background: "var(--surface-2)",
                overflowX: "auto",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-primary" style={{ fontFamily: "var(--font-mono)" }}>1</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>M1: Climate Stress</span>
              </div>
              <ArrowRight size={14} color="var(--ink-tertiary)" />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-success" style={{ fontFamily: "var(--font-mono)" }}>2</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>M2: Spray Readiness</span>
              </div>
              <ArrowRight size={14} color="var(--ink-tertiary)" />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-primary" style={{ fontFamily: "var(--font-mono)" }}>3</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>M3: Syngenta Portfolio</span>
              </div>
              <ArrowRight size={14} color="var(--ink-tertiary)" />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-secondary" style={{ fontFamily: "var(--font-mono)" }}>5</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>M5: Yield Baseline</span>
              </div>
              <ArrowRight size={14} color="var(--ink-tertiary)" />
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="badge badge-success" style={{ fontFamily: "var(--font-mono)" }}>6</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>M6: EconML ROBI</span>
              </div>
            </div>

            {/* Model Spec Cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 16 }}>
              {REGISTERED_MODELS.map((m) => (
                <div key={m.id} className="card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <span className="badge badge-primary" style={{ fontSize: 11, fontFamily: "var(--font-mono)" }}>
                        {m.psCode} · {m.type}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "var(--semantic-success)" }}>
                        <CheckCircle2 size={12} />
                        <span>Ready</span>
                      </span>
                    </div>

                    <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)", marginBottom: 6 }}>
                      {m.name}
                    </h3>
                    <p style={{ fontSize: 13, color: "var(--ink-subtle)", lineHeight: 1.5, marginBottom: 12 }}>
                      {m.description}
                    </p>

                    <div style={{ background: "var(--surface-2)", padding: "8px 10px", borderRadius: 6, marginBottom: 10 }}>
                      <span style={{ fontSize: 10, color: "var(--ink-tertiary)", textTransform: "uppercase", display: "block" }}>
                        Vertex Resource Path
                      </span>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: "var(--ink-muted)", wordBreak: "break-all" }}>
                        {m.vertexId}
                      </span>
                    </div>

                    <div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--ink-muted)", display: "block", marginBottom: 4 }}>
                        Key Calculated Metrics:
                      </span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                        {m.targetMetrics.map((met) => (
                          <span key={met} className="badge badge-secondary" style={{ fontSize: 10 }}>
                            {met}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ borderTop: "1px solid var(--hairline)", paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 11, color: "var(--ink-tertiary)" }}>Region: asia-south1</span>
                    <button
                      onClick={() => {
                        setActiveTab("test-bench");
                      }}
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: 11 }}
                    >
                      Test in Bench
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: Live Model Test Bench */}
        {activeTab === "test-bench" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: 24 }}>
            
            {/* Input Parameters Controls */}
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "var(--ink)" }}>
                  Inference Test Controls
                </h3>
                <span className="badge badge-secondary" style={{ fontSize: 11 }}>
                  Real Telemetry Inputs
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--ink-subtle)", display: "block", marginBottom: 4 }}>
                    Crop
                  </label>
                  <select
                    className="input"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                  >
                    <option value="potato">Potato (Indo-Gangetic)</option>
                    <option value="soybean">Soybean (Malwa Plateau)</option>
                    <option value="wheat">Wheat (Alluvial Belt)</option>
                    <option value="cotton_bt">Cotton BT (Vidarbha Vertisol)</option>
                    <option value="rice">Rice (Kharif Basin)</option>
                    <option value="groundnut">Groundnut (Saurashtra)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "var(--ink-subtle)", display: "block", marginBottom: 4 }}>
                    District
                  </label>
                  <input
                    className="input"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Kasganj"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: 11, color: "var(--ink-subtle)", display: "block", marginBottom: 4 }}>
                    Growth Stage
                  </label>
                  <select
                    className="input"
                    value={growthStage}
                    onChange={(e) => setGrowthStage(e.target.value)}
                  >
                    <option value="Vegetative">Vegetative</option>
                    <option value="Flowering / Bloom">Flowering / Bloom</option>
                    <option value="Tuber / Pod Initiation">Tuber / Pod Initiation</option>
                    <option value="Grain Filling">Grain Filling</option>
                    <option value="Maturity">Maturity</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 11, color: "var(--ink-subtle)", display: "block", marginBottom: 4 }}>
                    Farm Acreage
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={acres}
                    onChange={(e) => setAcres(Number(e.target.value))}
                    step="0.5"
                  />
                </div>
              </div>

              {/* Sliders */}
              <div style={{ display: "flex", flexDirection: "column", gap: 12, borderTop: "1px solid var(--hairline)", paddingTop: 12 }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--ink-subtle)" }}>Max Temperature (°C)</span>
                    <strong style={{ color: "var(--ink)" }}>{tempMax}°C</strong>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="48"
                    step="0.5"
                    value={tempMax}
                    onChange={(e) => setTempMax(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--ink-subtle)" }}>Night Min Temperature (°C)</span>
                    <strong style={{ color: "var(--ink)" }}>{tempMin}°C</strong>
                  </div>
                  <input
                    type="range"
                    min="4"
                    max="32"
                    step="0.5"
                    value={tempMin}
                    onChange={(e) => setTempMin(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--ink-subtle)" }}>Relative Humidity (%)</span>
                    <strong style={{ color: "var(--ink)" }}>{humidity}%</strong>
                  </div>
                  <input
                    type="range"
                    min="15"
                    max="95"
                    value={humidity}
                    onChange={(e) => setHumidity(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--ink-subtle)" }}>Wind Speed (km/h)</span>
                    <strong style={{ color: "var(--ink)" }}>{windSpeed} km/h</strong>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="35"
                    step="0.5"
                    value={windSpeed}
                    onChange={(e) => setWindSpeed(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>

                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: "var(--ink-subtle)" }}>Soil Moisture (%)</span>
                    <strong style={{ color: "var(--ink)" }}>{soilMoisture}%</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="85"
                    value={soilMoisture}
                    onChange={(e) => setSoilMoisture(Number(e.target.value))}
                    style={{ width: "100%" }}
                  />
                </div>
              </div>

              <button
                onClick={handleRunTest}
                disabled={testLoading}
                className="btn btn-primary"
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 12 }}
              >
                <Cpu size={16} className={testLoading ? "spin" : ""} />
                <span>{testLoading ? "Executing 5-Model Pipeline..." : "Execute 5-Model Pipeline Test"}</span>
              </button>
            </div>

            {/* Test Results Output */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {!testResult && !testLoading && (
                <div
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 48,
                    textAlign: "center",
                    gap: 12,
                  }}
                >
                  <Cpu size={36} color="var(--ink-tertiary)" />
                  <h4 style={{ fontSize: 16, color: "var(--ink)" }}>Ready for Model Test</h4>
                  <p style={{ fontSize: 13, color: "var(--ink-subtle)", maxWidth: 360 }}>
                    Configure the biophysical parameters on the left and click &quot;Execute 5-Model Pipeline Test&quot; to inspect sequential live model outputs.
                  </p>
                </div>
              )}

              {testLoading && (
                <div className="card" style={{ padding: 48, textAlign: "center" }}>
                  <RefreshCw size={28} className="spin" color="var(--primary)" style={{ margin: "0 auto 16px" }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                    Calling Vertex AI asia-south1 Pipeline...
                  </p>
                  <p style={{ fontSize: 12, color: "var(--ink-subtle)", marginTop: 4 }}>
                    Evaluating Model 1 ➔ Model 2 ➔ Model 3 ➔ Model 5 ➔ Model 6
                  </p>
                </div>
              )}

              {testResult && !testLoading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span className="badge badge-success">Execution Complete</span>
                      <span style={{ fontSize: 12, color: "var(--ink-subtle)", fontFamily: "var(--font-mono)" }}>
                        {testLatency} ms round-trip
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab("raw-json")}
                      className="btn btn-secondary btn-sm"
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Code size={13} />
                      <span>View Raw JSON</span>
                    </button>
                  </div>

                  {/* Model 1 Result */}
                  <div className="card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="badge badge-primary" style={{ fontSize: 10 }}>MODEL 1 (PS-02)</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>
                        {Math.round((testResult.model1_risk?.confidence || 0) * 100)}% Confidence
                      </span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                      {testResult.model1_risk?.stress_type}
                    </h4>
                    <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>
                      VPD: {testResult.telemetry_summary?.vpd_kpa} kPa · Soil Moisture: {testResult.telemetry_summary?.soil_moisture_pct}%
                    </span>
                  </div>

                  {/* Model 2 Result */}
                  <div className="card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="badge badge-success" style={{ fontSize: 10 }}>MODEL 2 (PS-02)</span>
                      <span className={`badge ${testResult.model2_readiness?.spray_window_safe ? "badge-success" : "badge-danger"}`} style={{ fontSize: 11 }}>
                        {testResult.model2_readiness?.spray_window_safe ? "WINDOW OPEN (SAFE)" : "WINDOW CLOSED"}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                      Delta-T: {testResult.model2_readiness?.delta_t}°C (Wind: {testResult.telemetry_summary?.wind_speed_kmh} km/h)
                    </h4>
                    <p style={{ fontSize: 11, color: "var(--ink-subtle)", marginTop: 2 }}>
                      {testResult.model2_readiness?.safety_reasons?.[0]}
                    </p>
                  </div>

                  {/* Model 3 Result */}
                  <div className="card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="badge badge-primary" style={{ fontSize: 10 }}>MODEL 3 (PS-03)</span>
                      <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                        Match Rank #1
                      </span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                      {testResult.model3_portfolio?.primary_recommendation?.name}
                    </h4>
                    <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>
                      Recommended Dose: {testResult.model3_portfolio?.primary_recommendation?.recommended_dosage} (Trial Efficacy: {testResult.model3_portfolio?.primary_recommendation?.efficacy_score_pct}%)
                    </span>
                  </div>

                  {/* Model 5 Result */}
                  <div className="card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="badge badge-secondary" style={{ fontSize: 10 }}>MODEL 5 (PS-07)</span>
                      <span style={{ fontSize: 11, color: "var(--ink-muted)" }}>
                        Baseline Regressor
                      </span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                      {testResult.model5_baseline?.expected_baseline_yield_q_acre} Q/Acre Benchmark
                    </h4>
                    <span style={{ fontSize: 11, color: "var(--ink-subtle)" }}>
                      Total field potential: {(testResult.model5_baseline?.expected_baseline_yield_q_acre * acres).toFixed(1)} Q
                    </span>
                  </div>

                  {/* Model 6 Result */}
                  <div className="card" style={{ padding: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span className="badge badge-success" style={{ fontSize: 10 }}>MODEL 6 (PS-07)</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "var(--semantic-success)" }}>
                        {testResult.model6_causal_robi?.robi_multiplier}x ROBI
                      </span>
                    </div>
                    <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>
                      +{testResult.model6_causal_robi?.causal_gain_tau_q_acre} Q/Acre Causal Uplift (τ)
                    </h4>
                    <span style={{ fontSize: 11, color: "var(--semantic-success)", fontWeight: 600 }}>
                      Net Farmer Profit: ₹{(testResult.model6_causal_robi?.net_farmer_profit_inr || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: Raw JSON */}
        {activeTab === "raw-json" && testResult && (
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                Raw JSON Response Telemetry
              </span>
              <span style={{ fontSize: 11, fontFamily: "var(--font-mono)", color: "var(--ink-subtle)" }}>
                Latency: {testLatency} ms
              </span>
            </div>
            <pre
              style={{
                background: "var(--surface-2)",
                padding: 16,
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "var(--font-mono)",
                color: "var(--ink-muted)",
                overflowX: "auto",
                maxHeight: 520,
              }}
            >
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </AdminShell>
  );
}
