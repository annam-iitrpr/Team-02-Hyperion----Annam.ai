"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Droplets,
  Thermometer,
  Wind,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Layers,
  RefreshCw,
  Sliders,
  ChevronRight,
  Database,
  Leaf,
  Activity,
  ArrowUpRight,
  Gauge,
  Flame,
  Clock,
  TrendingUp,
  Volume2,
  VolumeX,
  Languages,
  User,
  MapPin,
  Check
} from "lucide-react";
import { runAASRAPipeline, UnifiedPipelineResponse, fetchPipelineModels } from "@/lib/mlPipelineApi";
import { useFarm } from "@/context/FarmContext";
import { getStoredProfile } from "@/lib/userStore";

const CROPS = ["potato", "soybean", "wheat", "rice", "maize", "groundnut", "cotton_bt"];
const DISTRICTS = [
  { id: "Kasganj", name: "Kasganj (Uttar Pradesh - Indo-Gangetic)", defaultCrop: "potato" },
  { id: "Bhopal", name: "Bhopal (Madhya Pradesh - Malwa Plateau)", defaultCrop: "soybean" },
  { id: "Indore", name: "Indore (Madhya Pradesh - Central)", defaultCrop: "soybean" },
  { id: "Punjab", name: "Ludhiana (Punjab - Alluvial Belt)", defaultCrop: "wheat" },
  { id: "Vidarbha", name: "Amravati (Maharashtra - Vidarbha Vertisol)", defaultCrop: "cotton_bt" },
  { id: "Saurashtra", name: "Junagadh (Gujarat - Coastal Semi-Arid)", defaultCrop: "groundnut" }
];

const STAGES = ["Vegetative", "Flowering / Bloom", "Tuber / Pod Initiation", "Grain Filling", "Maturity"];

export function VertexAIPipelineView() {
  const { activeFarm } = useFarm();
  const profile = getStoredProfile();

  const [district, setDistrict] = useState(activeFarm?.district || "Kasganj");
  const [crop, setCrop] = useState((activeFarm?.primaryCrop || "potato").toLowerCase());
  const [growthStage, setGrowthStage] = useState(activeFarm?.growthStage || "Tuber / Pod Initiation");
  
  // Microclimate Sliders
  const [tempMax, setTempMax] = useState<number>(38.5);
  const [humidity, setHumidity] = useState<number>(40);
  const [windSpeed, setWindSpeed] = useState<number>(10.5);
  const [soilMoisture, setSoilMoisture] = useState<number>(28);
  const [rainProb, setRainProb] = useState<number>(10);

  const [selectedLang, setSelectedLang] = useState<"hi" | "en">("hi");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<UnifiedPipelineResponse | null>(null);
  const [modelsMeta, setModelsMeta] = useState<any>(null);

  useEffect(() => {
    fetchPipelineModels().then(setModelsMeta);
    executePipeline();
  }, []);

  const executePipeline = async (customOverrides?: { district?: string; crop?: string; growth_stage?: string }) => {
    setLoading(true);
    try {
      const res = await runAASRAPipeline({
        farmer_name: profile?.fullName || activeFarm.name || "Ramkishan Yadav",
        farmer_id: profile?.mobileNumber || activeFarm.id || "farmer-001",
        district: customOverrides?.district || district,
        crop: customOverrides?.crop || crop,
        growth_stage: customOverrides?.growth_stage || growthStage,
        area_acres: activeFarm?.areaAcres || 5.0,
        temp_max_c: tempMax,
        rh_avg_pct: humidity,
        wind_speed_kmh: windSpeed,
        soil_moisture_pct: soilMoisture,
        rain_prob_pct: rainProb,
        consecutive_hot_days: tempMax > 35 ? 4 : 1
      });
      if (res) {
        setData(res);
      }
    } finally {
      setLoading(false);
    }
  };

  const syncActiveFarm = () => {
    const d = activeFarm.district || "Kasganj";
    const c = (activeFarm.primaryCrop || "potato").toLowerCase();
    const g = activeFarm.growthStage || "Tuber / Pod Initiation";
    setDistrict(d);
    setCrop(c);
    setGrowthStage(g);
    executePipeline({ district: d, crop: c, growth_stage: g });
  };

  const toggleSpeech = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const cleanText = text.replace(/[*#]/g, "");
      const utter = new SpeechSynthesisUtterance(cleanText);
      utter.lang = selectedLang === "hi" ? "hi-IN" : "en-IN";
      utter.rate = 0.92;
      utter.onend = () => setIsSpeaking(false);
      utter.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utter);
    }
  };

  const applyPreset = (preset: "heatwave" | "drought" | "spray_safe" | "windy") => {
    if (preset === "heatwave") {
      setTempMax(41.0);
      setHumidity(32);
      setWindSpeed(8.0);
      setSoilMoisture(32);
      setRainProb(5);
    } else if (preset === "drought") {
      setTempMax(37.5);
      setHumidity(24);
      setWindSpeed(12.0);
      setSoilMoisture(18);
      setRainProb(0);
    } else if (preset === "spray_safe") {
      setTempMax(27.0);
      setHumidity(62);
      setWindSpeed(6.5);
      setSoilMoisture(52);
      setRainProb(12);
    } else if (preset === "windy") {
      setTempMax(33.0);
      setHumidity(55);
      setWindSpeed(21.0);
      setSoilMoisture(45);
      setRainProb(15);
    }
  };

  return (
    <div className="w-full bg-[#010102] text-[#f7f8f8] p-4 sm:p-6 lg:p-8 rounded-2xl border border-[#23252a] font-sans shadow-2xl">
      {/* Top Title & Vertex Badge Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-[#23252a]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#5e6ad2]/20 text-[#828fff] border border-[#5e6ad2]/40">
              <Cpu className="w-3 h-3 text-[#828fff]" />
              Vertex AI Model Registry
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#141516] text-[#8a8f98] border border-[#23252a]">
              4-Model Sequential Pipeline
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#f7f8f8] flex items-center gap-2">
            AASRA Core ML Intelligence Engine
          </h2>
          <p className="text-xs sm:text-sm text-[#8a8f98] mt-0.5">
            Decoupled biological intelligence: Models 1 (Risk), 2 (Readiness), 3 (Product Ranker), and 5 (Yield Baseline).
          </p>
        </div>

        {/* Quick Scenario Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0f1011] p-1.5 rounded-xl border border-[#23252a]">
          <span className="text-xs text-[#8a8f98] px-2 font-medium">Scenarios:</span>
          <button
            onClick={() => { applyPreset("heatwave"); executePipeline(); }}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#18191a] hover:bg-[#23252a] text-[#f7f8f8] border border-[#23252a] transition-all flex items-center gap-1"
          >
            <Flame className="w-3 h-3 text-amber-500" /> Heatwave
          </button>
          <button
            onClick={() => { applyPreset("drought"); executePipeline(); }}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#18191a] hover:bg-[#23252a] text-[#f7f8f8] border border-[#23252a] transition-all flex items-center gap-1"
          >
            <Droplets className="w-3 h-3 text-rose-400" /> Drought
          </button>
          <button
            onClick={() => { applyPreset("spray_safe"); executePipeline(); }}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#18191a] hover:bg-[#23252a] text-[#f7f8f8] border border-[#23252a] transition-all flex items-center gap-1"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Optimal Window
          </button>
          <button
            onClick={() => { applyPreset("windy"); executePipeline(); }}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#18191a] hover:bg-[#23252a] text-[#f7f8f8] border border-[#23252a] transition-all flex items-center gap-1"
          >
            <Wind className="w-3 h-3 text-cyan-400" /> High Drift
          </button>
          <div className="h-4 w-px bg-[#23252a] hidden sm:block" />
          <button
            onClick={syncActiveFarm}
            className="px-2.5 py-1 text-xs rounded-lg bg-[#5e6ad2]/20 hover:bg-[#5e6ad2]/30 text-[#828fff] border border-[#5e6ad2]/40 transition-all flex items-center gap-1.5 font-medium"
            title="Load your registered farm from the AASRA database"
          >
            <Database className="w-3 h-3 text-[#828fff]" />
            <span>Sync Farm Database ({activeFarm.primaryCrop || "Potato"})</span>
          </button>
        </div>
      </div>

      {/* Control Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 my-6">
        {/* District */}
        <div className="bg-[#0f1011] p-3 rounded-xl border border-[#23252a]">
          <label className="text-[11px] uppercase tracking-wider text-[#8a8f98] font-semibold block mb-1">
            District / Zone
          </label>
          <select
            value={district}
            onChange={(e) => {
              setDistrict(e.target.value);
              const found = DISTRICTS.find((d) => d.id === e.target.value);
              if (found) setCrop(found.defaultCrop);
            }}
            className="w-full bg-[#18191a] border border-[#23252a] text-sm text-[#f7f8f8] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#5e6ad2]"
          >
            {DISTRICTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Crop */}
        <div className="bg-[#0f1011] p-3 rounded-xl border border-[#23252a]">
          <label className="text-[11px] uppercase tracking-wider text-[#8a8f98] font-semibold block mb-1">
            Crop
          </label>
          <select
            value={crop}
            onChange={(e) => setCrop(e.target.value)}
            className="w-full bg-[#18191a] border border-[#23252a] text-sm text-[#f7f8f8] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#5e6ad2]"
          >
            {CROPS.map((c) => (
              <option key={c} value={c}>
                {c.toUpperCase()}
              </option>
            ))}
          </select>
        </div>

        {/* Growth Stage */}
        <div className="bg-[#0f1011] p-3 rounded-xl border border-[#23252a]">
          <label className="text-[11px] uppercase tracking-wider text-[#8a8f98] font-semibold block mb-1">
            Crop Stage
          </label>
          <select
            value={growthStage}
            onChange={(e) => setGrowthStage(e.target.value)}
            className="w-full bg-[#18191a] border border-[#23252a] text-sm text-[#f7f8f8] rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-[#5e6ad2]"
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Run CTA */}
        <div className="bg-[#0f1011] p-3 rounded-xl border border-[#23252a] flex items-end">
          <button
            onClick={executePipeline}
            disabled={loading}
            className="w-full bg-[#5e6ad2] hover:bg-[#828fff] text-white font-semibold py-2 px-4 rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5e6ad2]/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            {loading ? "Evaluating Models..." : "Run ML Pipeline"}
          </button>
        </div>
      </div>

      {/* Sliders Accordion */}
      <div className="bg-[#0f1011] p-4 rounded-xl border border-[#23252a] mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-[#8a8f98] flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-[#5e6ad2]" /> Live Farm Telemetry Sliders
          </span>
          <span className="text-[11px] text-[#8a8f98]">Auto-computes VPD & Stull's Delta-T</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#8a8f98]">TMax</span>
              <span className="font-mono font-medium text-amber-400">{tempMax}°C</span>
            </div>
            <input
              type="range"
              min="20"
              max="48"
              step="0.5"
              value={tempMax}
              onChange={(e) => setTempMax(parseFloat(e.target.value))}
              className="w-full accent-[#5e6ad2] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#8a8f98]">Humidity (RH)</span>
              <span className="font-mono font-medium text-sky-400">{humidity}%</span>
            </div>
            <input
              type="range"
              min="15"
              max="95"
              value={humidity}
              onChange={(e) => setHumidity(parseFloat(e.target.value))}
              className="w-full accent-[#5e6ad2] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#8a8f98]">Wind Speed</span>
              <span className="font-mono font-medium text-cyan-400">{windSpeed} km/h</span>
            </div>
            <input
              type="range"
              min="1"
              max="35"
              step="0.5"
              value={windSpeed}
              onChange={(e) => setWindSpeed(parseFloat(e.target.value))}
              className="w-full accent-[#5e6ad2] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#8a8f98]">Soil Moisture</span>
              <span className="font-mono font-medium text-emerald-400">{soilMoisture}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="65"
              value={soilMoisture}
              onChange={(e) => setSoilMoisture(parseFloat(e.target.value))}
              className="w-full accent-[#5e6ad2] cursor-pointer"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-[#8a8f98]">Rain Prob (48h)</span>
              <span className="font-mono font-medium text-indigo-400">{rainProb}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={rainProb}
              onChange={(e) => setRainProb(parseFloat(e.target.value))}
              className="w-full accent-[#5e6ad2] cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Main 4-Layer Dashboard Grid */}
      {data && (
        <div className="space-y-6">
          {/* Gemini 2.5 Flash Advisory Statement Card */}
          {data.gemini_statement && (
            <div className="bg-gradient-to-br from-[#12132b]/90 via-[#0f1013] to-[#0a0a10] rounded-2xl border border-[#5e6ad2]/40 p-6 relative overflow-hidden shadow-2xl shadow-[#5e6ad2]/10">
              <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#5e6ad2]/15 rounded-full blur-3xl pointer-events-none" />

              {/* Header with Title, AI Engine Tag & Language Switcher */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-[#23252a]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#5e6ad2]/20 text-[#828fff] flex items-center justify-center border border-[#5e6ad2]/40">
                    <Sparkles className="w-4 h-4 text-[#828fff]" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-[#f7f8f8]">
                        Gemini 2.5 Agro-Intelligence Advisory Statement
                      </span>
                      <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#5e6ad2]/20 text-[#828fff] border border-[#5e6ad2]/40 font-semibold">
                        Grounded on Models 1, 2, 3, 5
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-[#8a8f98] mt-0.5">
                      <User className="w-3 h-3 text-[#5e6ad2]" />
                      <span>Farmer: <strong className="text-[#f7f8f8]">{data.farmer_name || "Ramkishan Yadav"}</strong></span>
                      <span>•</span>
                      <MapPin className="w-3 h-3 text-[#5e6ad2]" />
                      <span>{data.district}</span>
                      <span>•</span>
                      <span>{data.crop} ({data.growth_stage})</span>
                      <span>•</span>
                      <span>{data.area_acres || 5.0} Acres</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Language Selector */}
                  <div className="flex items-center bg-[#141518] p-1 rounded-lg border border-[#23252a] text-xs">
                    <button
                      onClick={() => setSelectedLang("hi")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedLang === "hi"
                          ? "bg-[#5e6ad2] text-white font-medium shadow"
                          : "text-[#8a8f98] hover:text-[#f7f8f8]"
                      }`}
                    >
                      हिन्दी
                    </button>
                    <button
                      onClick={() => setSelectedLang("en")}
                      className={`px-2.5 py-1 rounded-md transition-all ${
                        selectedLang === "en"
                          ? "bg-[#5e6ad2] text-white font-medium shadow"
                          : "text-[#8a8f98] hover:text-[#f7f8f8]"
                      }`}
                    >
                      English
                    </button>
                  </div>

                  {/* Text-to-Speech Audio Button */}
                  <button
                    onClick={() =>
                      toggleSpeech(
                        selectedLang === "hi"
                          ? data.gemini_statement?.statement_hi || ""
                          : data.gemini_statement?.statement_en || ""
                      )
                    }
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                      isSpeaking
                        ? "bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse"
                        : "bg-[#18191c] hover:bg-[#23252a] text-[#f7f8f8] border-[#23252a]"
                    }`}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Stop Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-[#5e6ad2]" />
                        <span>Listen Voice</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Headline & Statement Body */}
              <div className="mt-4">
                <div className="flex flex-wrap items-center gap-2.5 mb-2">
                  <span
                    className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${
                      data.gemini_statement.spray_verdict_badge === "SAFE TO SPRAY"
                        ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                        : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                    }`}
                  >
                    {data.gemini_statement.spray_verdict_badge}
                  </span>
                  <h3 className="text-base sm:text-lg font-bold text-[#f7f8f8]">
                    {data.gemini_statement.headline}
                  </h3>
                </div>

                <div className="text-xs sm:text-sm text-[#d0d3d8] leading-relaxed bg-[#111216]/60 p-4 rounded-xl border border-[#23252a] font-normal">
                  {selectedLang === "hi"
                    ? data.gemini_statement.statement_hi
                    : data.gemini_statement.statement_en}
                </div>
              </div>

              {/* 4 Multi-Model Key Takeaway Pills */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#23252a]/80 text-xs">
                <div className="bg-[#141518]/90 p-3 rounded-lg border border-[#23252a]">
                  <div className="text-[#8a8f98] text-[11px] mb-0.5">Application Window (Model 2)</div>
                  <div className="text-[#f7f8f8] font-medium flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span className="truncate">{data.gemini_statement.timing_guidance}</span>
                  </div>
                </div>

                <div className="bg-[#141518]/90 p-3 rounded-lg border border-[#23252a]">
                  <div className="text-[#8a8f98] text-[11px] mb-0.5">Syngenta Prescription (Model 3)</div>
                  <div className="text-[#f7f8f8] font-medium flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                    <span className="truncate">{data.gemini_statement.product_summary}</span>
                  </div>
                </div>

                <div className="bg-[#141518]/90 p-3 rounded-lg border border-[#23252a]">
                  <div className="text-[#8a8f98] text-[11px] mb-0.5">Harvest Outlook (Model 5)</div>
                  <div className="text-[#f7f8f8] font-medium flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span className="truncate">{data.gemini_statement.yield_outlook}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Row: Layer 1 (Model 1 Risk) & Layer 2 (Model 2 Readiness) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Model 1 Card */}
            <div className="bg-[#0f1011] rounded-xl border border-[#23252a] p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold border border-amber-500/30">
                      M1
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#8a8f98]">
                      PS-02 Climate Stress Classifier
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8a8f98] bg-[#18191a] px-2 py-0.5 rounded border border-[#23252a]">
                    XGBoost (11 features)
                  </span>
                </div>

                <div className="mt-2 flex items-baseline gap-3">
                  <span className="text-2xl font-bold text-[#f7f8f8]">
                    {data.model1_risk.stress_type}
                  </span>
                  <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {Math.round(data.model1_risk.confidence * 100)}% Confidence
                  </span>
                </div>

                <p className="text-xs text-[#8a8f98] mt-1">
                  Early warning detected {data.model1_risk.days_to_impact > 0 ? `${data.model1_risk.days_to_impact} days in advance` : "optimal conditions"}.
                </p>

                {/* Probabilities Bars */}
                <div className="mt-4 space-y-1.5">
                  <div className="text-[11px] text-[#8a8f98] font-medium mb-1">Stress Class Probabilities:</div>
                  {Object.entries(data.model1_risk.probabilities).slice(0, 4).map(([name, prob]) => (
                    <div key={name} className="flex items-center gap-2 text-xs">
                      <span className="w-36 truncate text-[#8a8f98] text-[11px]">{name}</span>
                      <div className="flex-1 bg-[#18191a] h-2 rounded-full overflow-hidden border border-[#23252a]">
                        <div
                          className="bg-[#5e6ad2] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.round(prob * 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right font-mono text-[11px] text-[#f7f8f8]">
                        {Math.round(prob * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#23252a] flex items-center justify-between text-[11px] text-[#8a8f98]">
                <span>VPD: {data.telemetry_summary.vpd_kpa} kPa</span>
                <span>TMax 7d: {data.telemetry_summary.temp_max_c}°C</span>
              </div>
            </div>

            {/* Model 2 Card */}
            <div className="bg-[#0f1011] rounded-xl border border-[#23252a] p-5 relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#5e6ad2]/5 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-[#5e6ad2]/20 text-[#828fff] flex items-center justify-center text-xs font-bold border border-[#5e6ad2]/30">
                      M2
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#8a8f98]">
                      PS-02 Biological Action Gate
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8a8f98] bg-[#18191a] px-2 py-0.5 rounded border border-[#23252a]">
                    Platt Calibrated LogReg
                  </span>
                </div>

                <div className="mt-2 flex items-center gap-3">
                  {data.model2_readiness.spray_window_safe ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="text-xl font-bold">48h Spray Window Open</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-400">
                      <AlertTriangle className="w-6 h-6" />
                      <span className="text-xl font-bold">Spray Prohibited (Gate Active)</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-[#18191a] p-2.5 rounded-lg border border-[#23252a]">
                    <div className="text-[11px] text-[#8a8f98]">Stomatal Readiness</div>
                    <div className="text-lg font-bold font-mono text-[#f7f8f8]">
                      {(data.model2_readiness.readiness_score * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="bg-[#18191a] p-2.5 rounded-lg border border-[#23252a]">
                    <div className="text-[11px] text-[#8a8f98]">Stull's Delta-T</div>
                    <div className={`text-lg font-bold font-mono ${data.model2_readiness.delta_t > 8 ? "text-rose-400" : "text-emerald-400"}`}>
                      {data.model2_readiness.delta_t}°C
                    </div>
                  </div>
                </div>

                {/* Safety checklist */}
                <div className="mt-3 space-y-1">
                  {data.model2_readiness.safety_reasons.map((r, i) => (
                    <div key={i} className="text-xs flex items-center gap-2 text-[#8a8f98]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#5e6ad2]" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#23252a] flex items-center justify-between text-[11px] text-[#8a8f98]">
                <span>Wind Limit: &lt; 15 km/h</span>
                <span>Delta-T Safe Window: 2.0°C - 8.0°C</span>
              </div>
            </div>
          </div>

          {/* Bottom Row: Layer 3 (Model 3 Top Products) & Layer 4 (Model 5 Baseline Yield) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Model 3 Card (2 cols) */}
            <div className="lg:col-span-2 bg-[#0f1011] rounded-xl border border-[#23252a] p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                    M3
                  </span>
                  <div>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#8a8f98] block">
                      PS-03 Product Portfolio Recommendation
                    </span>
                    <span className="text-sm font-bold text-[#f7f8f8]">
                      Top 3 Syngenta Biological Solutions (Ranked from 50 Products)
                    </span>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#8a8f98] bg-[#18191a] px-2 py-0.5 rounded border border-[#23252a]">
                  LambdaMART Ranker
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {data.model3_portfolio.top_recommendations.map((prod) => (
                  <div
                    key={prod.product_key}
                    className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                      prod.rank === 1
                        ? "bg-[#18191a] border-[#5e6ad2]/50 shadow-lg shadow-[#5e6ad2]/5"
                        : "bg-[#141516] border-[#23252a]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          prod.rank === 1
                            ? "bg-[#5e6ad2] text-white"
                            : "bg-[#23252a] text-[#8a8f98]"
                        }`}>
                          #{prod.rank} RANK
                        </span>
                        <span className="text-xs font-mono font-semibold text-emerald-400">
                          {prod.efficacy_score_pct}% Fit
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#f7f8f8]">{prod.name}</h4>
                      <p className="text-[11px] text-[#8a8f98] mt-0.5 line-clamp-2">
                        {prod.active_ingredient}
                      </p>

                      <div className="mt-2.5 space-y-1 text-[11px]">
                        <div className="text-[#8a8f98]">
                          <span className="text-[#62666d]">Dosage:</span> {prod.recommended_dosage}
                        </div>
                        <div className="text-[#8a8f98]">
                          <span className="text-[#62666d]">CIB&RC:</span> {prod.registration}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-[#23252a] text-[10px] text-[#8a8f98]">
                      {prod.application_timing}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Model 5 Card (1 col) */}
            <div className="bg-[#0f1011] rounded-xl border border-[#23252a] p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold border border-teal-500/30">
                      M5
                    </span>
                    <span className="text-xs uppercase tracking-wider font-semibold text-[#8a8f98]">
                      PS-07 Yield Baseline
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-[#8a8f98] bg-[#18191a] px-2 py-0.5 rounded border border-[#23252a]">
                    XGBoost Regressor
                  </span>
                </div>

                <div className="mt-2">
                  <span className="text-xs text-[#8a8f98]">Predicted Baseline Harvest:</span>
                  <div className="text-2xl font-bold font-mono text-[#f7f8f8] mt-0.5">
                    {data.model5_baseline.expected_baseline_yield_q_ha} <span className="text-sm font-normal text-[#8a8f98]">Q/ha</span>
                  </div>
                  <div className="text-xs text-[#8a8f98] mt-0.5">
                    ({data.model5_baseline.expected_baseline_yield_q_acre} Q/acre)
                  </div>
                </div>

                <div className="mt-4 p-3 rounded-lg bg-[#18191a] border border-[#23252a] space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8a8f98]">District 10y Average:</span>
                    <span className="font-mono text-[#f7f8f8]">
                      {data.model5_baseline.historical_district_average_q_ha} Q/ha
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[#8a8f98]">Climate Weather Impact:</span>
                    <span className={`font-mono font-semibold ${
                      data.model5_baseline.yield_impact_pct >= 0 ? "text-emerald-400" : "text-rose-400"
                    }`}>
                      {data.model5_baseline.yield_impact_pct >= 0 ? "+" : ""}{data.model5_baseline.yield_impact_pct}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#23252a] text-[11px] text-[#8a8f98]">
                Benchmarking baseline yield without intervention under current season conditions.
              </div>
            </div>
          </div>

          {/* Footer Metadata */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[11px] text-[#62666d] pt-2 border-t border-[#23252a]">
            <div>
              Execution Mode: <span className="text-[#8a8f98] font-mono">{data.execution_metadata.serving_mode}</span> | Models: {data.execution_metadata.models_executed.join(", ")}
            </div>
            <div>
              Pipeline Latency: <span className="text-emerald-400 font-mono font-semibold">{data.execution_metadata.latency_ms} ms</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
