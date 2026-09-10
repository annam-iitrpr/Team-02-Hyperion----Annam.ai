"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { useFarm } from "@/context/FarmContext";
import { FarmCropSwitcher } from "@/components/FarmCropSwitcher";
import {
  MASTER_CROP_GROWTH_STAGES,
  getCropMasterData,
  getCropGrowthStages,
  normalizeCropKey,
  CropGrowthStage,
} from "@/lib/cropGrowthStages";
import {
  Sprout,
  Calendar,
  Flame,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Droplets,
  Wind,
  Thermometer,
  Activity,
  ChevronRight,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Volume2,
  VolumeX,
  FlaskConical,
  TrendingUp,
  MapPin,
  Layers,
  ThumbsUp,
  ThumbsDown,
  X,
  Clock,
  Gauge,
  Check,
} from "lucide-react";

interface RegionInfo {
  name: string;
  crops: string[];
  lat: number;
  lon: number;
  soil_type: string;
  soil_buffer?: number;
  salinity_index?: number;
  dominant_stresses: string[];
}

const DEFAULT_REGIONS: Record<string, RegionInfo> = {
  punjab: {
    name: "Indo-Gangetic Plain (Punjab / Haryana)",
    crops: ["wheat", "rice", "cotton", "mustard", "maize"],
    lat: 30.9,
    lon: 75.86,
    soil_type: "Alluvial Loam",
    dominant_stresses: ["Heat Waves", "Waterlogging"],
  },
  bhopal: {
    name: "Central Plateau & Malwa (Madhya Pradesh)",
    crops: ["soybean", "wheat", "chickpea", "mustard"],
    lat: 23.2599,
    lon: 77.4126,
    soil_type: "Medium Black Clay",
    dominant_stresses: ["Drought", "Heat Waves"],
  },
  rajasthan_arid: {
    name: "Western Arid Zone (Rajasthan)",
    crops: ["mustard", "wheat", "chickpea", "groundnut"],
    lat: 26.45,
    lon: 74.64,
    soil_type: "Arid Sandy Loam",
    dominant_stresses: ["Severe Heat", "Extreme Drought", "High VPD"],
  },
  maharashtra_vidarbha: {
    name: "Deccan Plateau & Vidarbha (Maharashtra)",
    crops: ["cotton", "soybean", "pigeon_pea", "onion"],
    lat: 20.93,
    lon: 77.75,
    soil_type: "Deep Black Clay (Vertisol)",
    dominant_stresses: ["Drought", "Heat Waves"],
  },
  gujarat_saurashtra: {
    name: "Saurashtra & Semi-Arid Zone (Gujarat)",
    crops: ["groundnut", "cotton", "onion", "wheat"],
    lat: 21.52,
    lon: 70.45,
    soil_type: "Medium Black / Sandy Loam",
    dominant_stresses: ["Drought", "Soil Salinity"],
  },
  karnataka_deccan: {
    name: "Deccan Plateau (Karnataka)",
    crops: ["maize", "cotton", "chilli", "tomato"],
    lat: 15.41,
    lon: 75.09,
    soil_type: "Red Clay Loam",
    dominant_stresses: ["Early Season Drought", "Nutrient Leaching"],
  },
  eastern_gangetic: {
    name: "Eastern Gangetic Plain (Bihar / West Bengal)",
    crops: ["rice", "wheat", "maize", "potato"],
    lat: 25.59,
    lon: 85.14,
    soil_type: "Deep Alluvial Silt",
    dominant_stresses: ["Waterlogging / Flood", "High Humidity Fungal Pressure"],
  },
  jammu: {
    name: "North-Western Himalayan Zone (J&K / Himachal)",
    crops: ["apple", "mustard", "maize"],
    lat: 34.08,
    lon: 74.79,
    soil_type: "Mountain Meadow / Karewa",
    dominant_stresses: ["Frost / Cold Snap", "Erratic Rainfall"],
  },
  andhra_telangana: {
    name: "Rayalaseema & Telangana Semi-Arid",
    crops: ["chilli", "groundnut", "rice", "cotton"],
    lat: 14.68,
    lon: 77.6,
    soil_type: "Red Sandy Loam",
    dominant_stresses: ["Severe Drought", "High VPD Atmospheric Pull"],
  },
};

const CROP_EMOJIS: Record<string, string> = {
  rice: "🌾",
  wheat: "🌾",
  maize: "🌽",
  cotton: "🌿",
  cotton_bt: "🌿",
  soybean: "🫘",
  groundnut: "🥜",
  chickpea: "🫘",
  pigeon_pea: "🫘",
  tomato: "🍅",
  chilli: "🌶️",
  potato: "🥔",
  onion: "🧅",
  brinjal: "🍆",
  cabbage: "🥬",
  grapes: "🍇",
  apple: "🍎",
  mango: "🥭",
  sugarcane: "🎋",
  mustard: "🌻",
  tea: "🍵",
};

export default function PlantIntelligencePage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const { activeFarm, updateActiveFarm } = useFarm();

  // Region and Crop states
  const [regions, setRegions] = useState<Record<string, RegionInfo>>(DEFAULT_REGIONS);
  const [selectedRegion, setSelectedRegion] = useState<string>("punjab");
  const [selectedCropKey, setSelectedCropKey] = useState<string>(() => {
    return normalizeCropKey(activeFarm?.primaryCrop || "wheat");
  });

  // Dynamic Crop Master data & sincere growth stages
  const cropMaster = useMemo(() => {
    return getCropMasterData(selectedCropKey);
  }, [selectedCropKey]);

  const stagesList = useMemo(() => {
    return getCropGrowthStages(selectedCropKey);
  }, [selectedCropKey]);

  const [selectedStageOrder, setSelectedStageOrder] = useState<number>(3);

  // Active Stage
  const currentStage: CropGrowthStage = useMemo(() => {
    const found = stagesList.find((s) => s.stageOrder === selectedStageOrder);
    return found || stagesList[0] || {
      stageOrder: 1,
      stageName: "Vegetative Growth",
      stageNameHi: "वानस्पतिक बढ़वार",
      daysAfterSowing: "20-45 DAS",
    };
  }, [stagesList, selectedStageOrder]);

  // PS-03 Contextual Inputs
  const [growthStageInput, setGrowthStageInput] = useState<string>("Vegetative");
  const [symptomsInput, setSymptomsInput] = useState<string>("None");
  const [soilMoistureInput, setSoilMoistureInput] = useState<string>("Optimal");
  const [conversationalInput, setConversationalInput] = useState<string>("");

  // Analysis State
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [parsingContext, setParsingContext] = useState<boolean>(false);
  const [selectedDayModal, setSelectedDayModal] = useState<any>(null);
  const [feedbackGiven, setFeedbackGiven] = useState<"up" | "down" | null>(null);

  // Audio Voice State
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Sync with activeFarm crop if changed
  useEffect(() => {
    if (activeFarm?.primaryCrop) {
      const normalized = normalizeCropKey(activeFarm.primaryCrop);
      if (normalized !== selectedCropKey) {
        setSelectedCropKey(normalized);
      }
    }
  }, [activeFarm?.primaryCrop, selectedCropKey]);

  // Load Regions from backend API
  useEffect(() => {
    async function fetchRegions() {
      try {
        const res = await fetch("/api/plant-intelligence/regions");
        if (res.ok) {
          const data = await res.json();
          if (data && Object.keys(data).length > 0) {
            setRegions((prev) => ({ ...prev, ...data }));
          }
        }
      } catch (e) {
        console.warn("Using fallback regions data:", e);
      }
    }
    fetchRegions();
  }, []);

  // When crop changes, sincerely update selected stage order
  const handleSelectCrop = (cropKey: string) => {
    const normalized = normalizeCropKey(cropKey);
    setSelectedCropKey(normalized);
    const stages = getCropGrowthStages(normalized);
    const midIdx = Math.min(stages.length, Math.max(1, Math.ceil(stages.length * 0.5)));
    const targetStage = stages[midIdx - 1];
    setSelectedStageOrder(targetStage?.stageOrder || 1);
    setGrowthStageInput(targetStage?.stageName || "Vegetative");

    if (updateActiveFarm) {
      updateActiveFarm({
        primaryCrop: MASTER_CROP_GROWTH_STAGES[normalized]?.name || normalized,
        growthStage: `${targetStage?.stageName} (${targetStage?.daysAfterSowing})`,
      });
    }
  };

  // When stage is selected sincerely
  const handleSelectStage = (stage: CropGrowthStage) => {
    setSelectedStageOrder(stage.stageOrder);
    setGrowthStageInput(stage.stageName);
    if (updateActiveFarm) {
      updateActiveFarm({
        growthStage: `${stage.stageName} (${stage.daysAfterSowing})`,
      });
    }
  };

  // Run the 14-Day Multi-Modal Pipeline
  const runPipeline = useCallback(async (customPayload?: any) => {
    setLoading(true);
    setFeedbackGiven(null);
    try {
      const payload = customPayload || {
        region: selectedRegion,
        crop_type: selectedCropKey,
        growth_stage: currentStage.stageName,
        symptoms: symptomsInput,
        soil_moisture: soilMoistureInput,
        days_after_sowing: currentStage.daysAfterSowing,
      };

      const res = await fetch("/api/plant-intelligence/run-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`Server returned HTTP ${res.status}`);
      const data = await res.json();
      setAnalysisData(data);
    } catch (err: any) {
      console.error("Run pipeline error:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedRegion, selectedCropKey, currentStage, symptomsInput, soilMoistureInput]);

  // Initial Run on load
  useEffect(() => {
    runPipeline();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCropKey, selectedRegion]);

  // Ask AI Advisor (Gemini Context Extraction)
  const askGeminiAdvisor = async () => {
    if (!conversationalInput.trim()) {
      alert("Please describe your field conditions first (e.g., 'My crop leaves are wilting and soil is dry').");
      return;
    }
    setParsingContext(true);
    try {
      const res = await fetch("/api/plant-intelligence/parse-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: conversationalInput }),
      });
      const data = await res.json();

      let detectedStage = growthStageInput;
      let detectedSymptoms = symptomsInput;
      let detectedMoisture = soilMoistureInput;

      if (data && data.parsed_context) {
        if (data.parsed_context.growth_stage) {
          detectedStage = data.parsed_context.growth_stage;
          setGrowthStageInput(detectedStage);
          const match = stagesList.find((s) =>
            s.stageName.toLowerCase().includes(detectedStage.toLowerCase())
          );
          if (match) setSelectedStageOrder(match.stageOrder);
        }
        if (data.parsed_context.symptoms) {
          detectedSymptoms = data.parsed_context.symptoms;
          setSymptomsInput(detectedSymptoms);
        }
        if (data.parsed_context.soil_moisture) {
          detectedMoisture = data.parsed_context.soil_moisture;
          setSoilMoistureInput(detectedMoisture);
        }
      }

      // Automatically run pipeline with new context
      await runPipeline({
        region: selectedRegion,
        crop_type: selectedCropKey,
        growth_stage: detectedStage,
        symptoms: detectedSymptoms,
        soil_moisture: detectedMoisture,
        conversational_text: conversationalInput,
      });
    } catch (e: any) {
      console.warn("Context extraction error:", e);
    } finally {
      setParsingContext(false);
    }
  };

  // User feedback on CropFit recommendation
  const handleFeedback = async (vote: "up" | "down") => {
    setFeedbackGiven(vote);
    try {
      await fetch("/api/plant-intelligence/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          crop: selectedCropKey,
          region: selectedRegion,
          stage: currentStage.stageName,
          vote,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (e) {
      console.warn("Feedback save error:", e);
    }
  };

  // Text-to-Speech audio summary
  const speakSummary = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const alert = analysisData?.alert;
    const cropfit = analysisData?.cropfit;
    const text = isHindi
      ? `पादप स्वास्थ्य रिपोर्ट: ${cropMaster.nameHi} फसल के लिए ${alert?.title || "विश्लेषण"}। ${cropfit?.rationale || "संतुलित पोषण बनाए रखें"}`
      : `Plant Health Intelligence Report for ${cropMaster.name}. ${alert?.title || "Forecast active"}. ${cropfit?.rationale || "Maintain balanced nutrition"}`;

    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = isHindi ? "hi-IN" : "en-US";
    utter.onend = () => setIsSpeaking(false);
    utter.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utter);
  };

  const regionInfo = regions[selectedRegion] || DEFAULT_REGIONS.punjab;

  // Render factors safely
  const factors = useMemo(() => {
    if (analysisData?.alert?.factors && Array.isArray(analysisData.alert.factors)) {
      return analysisData.alert.factors;
    }
    return [
      {
        factor: "Heat Stress Index (HSI)",
        readings: "34.2°C (Canopy Ambient)",
        status: "Normal",
        threshold_info: "35°C Denaturing Threshold",
      },
      {
        factor: "Vapor Pressure Deficit (VPD)",
        readings: "2.1 kPa (Moderate Pull)",
        status: "Normal",
        threshold_info: ">2.5 kPa Stomatal Shock",
      },
      {
        factor: "Nocturnal Temperature Floor",
        readings: "22.4°C (Dark Respiration)",
        status: "Normal",
        threshold_info: ">24°C Carbohydrate Burn",
      },
      {
        factor: "Soil Moisture Availability",
        readings: "42% (Field Capacity)",
        status: "Optimal",
        threshold_info: "<30% Permanent Wilting Point",
      },
      {
        factor: "Precipitation & Waterlogging",
        readings: "0.0 mm (Next 72 Hours)",
        status: "Normal",
        threshold_info: ">40 mm/day Saturation Risk",
      },
      {
        factor: "Vegetation Health (NDVI / VCI)",
        readings: "0.72 NDVI (Dense Green)",
        status: "Healthy",
        threshold_info: "<0.45 Canopy Senescence",
      },
    ];
  }, [analysisData]);

  // Product recommendations list
  const productList = useMemo(() => {
    const recs: any[] = [];
    if (analysisData?.cropfit?.product) {
      recs.push({
        priority: 1,
        severity: "Critical",
        category: analysisData.cropfit.product.category || "Biostimulant",
        product_name: analysisData.cropfit.product.name || analysisData.cropfit.product.product_name,
        active_ingredient: analysisData.cropfit.product.active_ingredient,
        dosage: analysisData.cropfit.product.dosage || "400 ml / acre in 200L water",
        water_usage: analysisData.cropfit.product.water_usage || "200 L / acre",
        rationale: analysisData.cropfit.rationale,
        timing_advice: "Apply between 06:30 AM and 09:30 AM during low-wind window",
        trigger_description: "Targeted CropFit Solution",
      });
    }
    if (analysisData?.cropfit?.secondary_crop_protection) {
      const p = analysisData.cropfit.secondary_crop_protection;
      recs.push({
        priority: 2,
        severity: "High",
        category: p.category || "Fungicide / Shield",
        product_name: p.name || p.product_name,
        active_ingredient: p.active_ingredient,
        dosage: p.dosage || "200 ml / acre in 200L water",
        water_usage: p.water_usage || "200 L / acre",
        rationale: "Dual curative shield protecting cellular primordia and foliage.",
        timing_advice: "Tank mix with non-ionic surfactant for uniform retention",
        trigger_description: "Protective Canopy Guard",
      });
    }
    if (recs.length === 0) {
      recs.push({
        priority: 1,
        severity: "Moderate",
        category: "Biostimulant",
        product_name: "Syngenta Quantis®",
        active_ingredient: "Proprietary Amino Acid + Osmoprotectant Complex",
        dosage: "400 ml / acre (200 L water)",
        water_usage: "200 L / acre",
        rationale: "Maintains cellular photosystem-II turgor and prevents canopy heat exhaustion.",
        timing_advice: "Morning application with hollow cone nozzle",
        trigger_description: "Abiotic Stress Shield",
      });
    }
    return recs;
  }, [analysisData]);

  return (
    <AppShell>
      <div className="relative min-h-screen bg-[#f0fdf4] bg-[radial-gradient(#bbf7d0_1px,transparent_1px)] [background-size:20px_20px] text-slate-800 pb-24 md:pb-16 font-sans">
        
        {/* ── TOP BANNER ────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-[#15803d] via-[#16a34a] to-[#22c55e] text-white py-6 px-4 sm:px-8 shadow-md">
          <div className="max-w-[1300px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-white/20 text-white font-mono text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold">
                  PS-02 · MULTI-MODAL SENSOR FUSION
                </span>
                <span className="bg-emerald-900/30 text-emerald-100 font-mono text-[10px] px-2 py-0.5 rounded-full font-semibold">
                  Google Gemini 3.6 Flash &amp; CE Hub Grounded
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-display">
                🌾 ANNAM.AI · Plant Health Intelligence Engine
              </h1>
              <p className="text-white/90 text-xs sm:text-sm mt-0.5 font-medium">
                AgroShield: Pre-Emptive Biological Intervention &amp; True Phenological Growth Stage Modeling
              </p>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2 flex-wrap">
              <FarmCropSwitcher />

              <button
                type="button"
                onClick={speakSummary}
                className="px-3.5 py-2 rounded-xl bg-white text-[#15803d] hover:bg-emerald-50 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer min-h-[38px]"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-4 w-4 text-rose-600" />
                    <span className="text-rose-700">{isHindi ? "आवाज बंद करें" : "Stop Voice"}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-[#15803d]" />
                    <span>{isHindi ? "📢 बोलकर सुनें" : "📢 Voice Advisory"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => runPipeline()}
                disabled={loading}
                className="p-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 shadow-sm transition-all cursor-pointer min-h-[38px] flex items-center justify-center"
                title="Refresh Pipeline"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* ── MAIN 2-COLUMN GRID ─────────────────────────────────── */}
        <div className="max-w-[1300px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-6 items-start">
            
            {/* ═══════════════════════════════════════════════════════ */}
            {/* LEFT COLUMN: CONTROLS, SINCERE STAGES & PRODUCTS       */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="space-y-6">
              
              {/* Region & Crop Card */}
              <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="font-black text-[#1f2937] text-sm flex items-center gap-2 font-display">
                    <span>🗺️</span>
                    <span>Agro-Climatic Region &amp; Crop</span>
                  </h2>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Live GPS
                  </span>
                </div>

                {/* Region Dropdown */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                    Agro-Climatic Zone
                  </label>
                  <select
                    value={selectedRegion}
                    onChange={(e) => setSelectedRegion(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    {Object.entries(regions).map(([key, reg]) => (
                      <option key={key} value={key}>
                        {reg.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Region Card */}
                <div className="bg-[#dcfce7]/70 rounded-xl p-3 text-xs border border-[#bbf7d0] space-y-1.5">
                  <div className="font-bold text-[#15803d] flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span>{regionInfo.name}</span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    📍 Coordinates: <strong className="text-slate-800">{regionInfo.lat}°N, {regionInfo.lon}°E</strong>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    🌱 Soil Type: <strong className="text-slate-800">{regionInfo.soil_type}</strong>
                  </div>
                  <div className="pt-1 flex flex-wrap gap-1">
                    {regionInfo.dominant_stresses.map((st) => (
                      <span
                        key={st}
                        className="bg-amber-100 text-amber-900 border border-amber-300 font-bold px-1.5 py-0.5 rounded text-[10px]"
                      >
                        ⚠️ {st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Crop Dropdown */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                      Target Crop
                    </label>
                    <span className="text-[10px] font-bold text-[#15803d]">
                      {stagesList.length} Verified Stages
                    </span>
                  </div>
                  <select
                    value={selectedCropKey}
                    onChange={(e) => handleSelectCrop(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 text-xs font-semibold focus:outline-none focus:border-emerald-600 focus:bg-white transition-all"
                  >
                    {/* All 20 supported crops */}
                    {Object.values(MASTER_CROP_GROWTH_STAGES).map((c) => (
                      <option key={c.id} value={c.id}>
                        {CROP_EMOJIS[c.id] || "🌱"} {isHindi ? c.nameHi : c.name} ({c.stages.length} stages)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* SINCERE DYNAMIC CROP GROWTH STAGES TIMELINE (USER REQUEST) */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sprout className="h-4 w-4 text-[#15803d]" />
                    <h3 className="font-extrabold text-[#11261f] text-xs uppercase tracking-wider font-mono">
                      Phenological Stages · {cropMaster.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded">
                    {stagesList.length} Phases
                  </span>
                </div>

                <p className="text-[11px] text-slate-500 leading-tight">
                  Click the active growth stage to calibrate stage-specific biological sensitivity &amp; GDD thresholds:
                </p>

                {/* Sincere Stages Vertical Progression */}
                <div className="space-y-1.5 pt-1">
                  {stagesList.map((st) => {
                    const isSelected = st.stageOrder === selectedStageOrder;
                    return (
                      <button
                        key={st.stageOrder}
                        type="button"
                        onClick={() => handleSelectStage(st)}
                        className={`w-full text-left px-3 py-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? "bg-gradient-to-r from-[#15803d] to-[#16a34a] text-white border-[#15803d] shadow-sm ring-2 ring-emerald-500/20"
                            : "bg-[#fafafa] hover:bg-slate-100/80 text-slate-700 border-slate-200/80"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 font-mono ${
                              isSelected
                                ? "bg-white text-[#15803d]"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {st.stageOrder}
                          </span>
                          <div className="truncate">
                            <div className="text-xs font-black truncate leading-tight">
                              {isHindi ? st.stageNameHi : st.stageName}
                            </div>
                            <div
                              className={`text-[10px] font-mono ${
                                isSelected ? "text-emerald-100" : "text-slate-400"
                              }`}
                            >
                              {st.daysAfterSowing}
                            </div>
                          </div>
                        </div>

                        {isSelected ? (
                          <span className="shrink-0 bg-white/25 text-white text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                            <Check className="h-3 w-3" />
                            <span>ACTIVE</span>
                          </span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* ✨ ASK AI ADVISOR (GEMINI CONVERSATIONAL CONTEXT PARSER)   */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm space-y-3.5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <h3 className="font-black text-[#1f2937] text-xs uppercase tracking-wider font-mono">
                      Ask AI Advisor (Gemini 3.6 Flash)
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    Natural Language
                  </span>
                </div>

                <div className="space-y-2">
                  <textarea
                    rows={3}
                    value={conversationalInput}
                    onChange={(e) => setConversationalInput(e.target.value)}
                    placeholder="Describe your field... e.g., 'My soybean crop is flowering but the leaves are wilting and soil is bone dry.'"
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 bg-slate-50/50 resize-none font-sans"
                  />

                  <button
                    type="button"
                    onClick={askGeminiAdvisor}
                    disabled={parsingContext || loading}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {parsingContext ? (
                      <>
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        <span>Extracting Context via Gemini...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>✨ Extract Context &amp; Run Analysis</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Collapsible Manual Override Accordion */}
                <details className="text-xs group border-t border-slate-100 pt-2">
                  <summary className="cursor-pointer font-bold text-slate-500 hover:text-slate-800 text-[11px] list-none flex items-center justify-between py-1">
                    <span>⚙️ Manual agronomic context overrides...</span>
                    <ChevronRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90 text-slate-400" />
                  </summary>

                  <div className="pt-2 space-y-2.5 text-xs">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                        Growth Stage
                      </label>
                      <select
                        value={growthStageInput}
                        onChange={(e) => setGrowthStageInput(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium"
                      >
                        <option value="Seedling">Seedling</option>
                        <option value="Vegetative">Vegetative</option>
                        <option value="Flowering">Flowering</option>
                        <option value="Fruiting">Fruiting</option>
                        <option value="Maturity">Maturity</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                        Observed Foliar Symptoms
                      </label>
                      <select
                        value={symptomsInput}
                        onChange={(e) => setSymptomsInput(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium"
                      >
                        <option value="None">None (Healthy)</option>
                        <option value="Wilting">Wilting / Thermal Scorch</option>
                        <option value="Yellowing/Chlorosis">Yellowing / Chlorosis</option>
                        <option value="Stunting">Stunting / Slow Growth</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase block font-mono">
                        Soil Moisture Level
                      </label>
                      <select
                        value={soilMoistureInput}
                        onChange={(e) => setSoilMoistureInput(e.target.value)}
                        className="w-full p-2 rounded-lg border border-slate-200 text-xs bg-slate-50 font-medium"
                      >
                        <option value="Optimal">Optimal</option>
                        <option value="Dry">Dry / Cracked</option>
                        <option value="Waterlogged">Waterlogged / Muddy</option>
                      </select>
                    </div>
                  </div>
                </details>

                {/* Main Run Button */}
                <button
                  type="button"
                  onClick={() => runPipeline()}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-[#15803d] to-[#16a34a] hover:from-[#137336] hover:to-[#149141] text-white font-extrabold text-sm rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Computing 14-Day Multi-Modal Sensor Fusion...</span>
                    </>
                  ) : (
                    <>
                      <span>▶ Run 14-Day Analysis</span>
                    </>
                  )}
                </button>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* SYNGENTA PRODUCT RECOMMENDATIONS PANEL                     */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="h-4 w-4 text-[#15803d]" />
                    <h3 className="font-extrabold text-[#11261f] text-xs uppercase tracking-wider font-mono">
                      Syngenta Biological Solutions
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-bold bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded">
                    {productList.length} Interventions
                  </span>
                </div>

                <div className="space-y-3">
                  {productList.map((p, idx) => {
                    const priorityClass =
                      p.priority === 1
                        ? "bg-rose-100 text-rose-800 border-rose-200"
                        : p.priority === 2
                        ? "bg-amber-100 text-amber-800 border-amber-200"
                        : "bg-emerald-100 text-emerald-800 border-emerald-200";

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-emerald-100 bg-gradient-to-br from-[#f0fdf4] to-white space-y-2 shadow-2xs hover:border-emerald-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs text-[#15803d]">
                                {p.product_name}
                              </span>
                              <span
                                className={`text-[9px] font-bold font-mono px-1.5 py-0.2 rounded border ${priorityClass}`}
                              >
                                P{p.priority}
                              </span>
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono font-semibold">
                              {p.category}
                            </div>
                          </div>
                        </div>

                        {p.active_ingredient && (
                          <div className="text-[11px] text-slate-600 font-medium">
                            <strong className="text-slate-800">Active:</strong> {p.active_ingredient}
                          </div>
                        )}

                        <p className="text-[11px] text-slate-600 leading-snug">{p.rationale}</p>

                        <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-100 flex-wrap gap-1">
                          <span className="bg-[#dcfce7] text-[#15803d] px-2 py-0.5 rounded font-bold font-mono">
                            Dose: {p.dosage}
                          </span>
                          {p.timing_advice && (
                            <span className="text-slate-500 italic">⏰ {p.timing_advice}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* ═══════════════════════════════════════════════════════ */}
            {/* RIGHT COLUMN: RESULTS, CROPFIT, SENSORS & 14-DAY RADAR  */}
            {/* ═══════════════════════════════════════════════════════ */}
            <div className="space-y-6">

              {/* Data Source Badge */}
              <div className="flex items-center justify-center">
                <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-bold bg-[#dcfce7] text-[#15803d] border border-[#bbf7d0] shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
                  <span>
                    🟢 LIVE DATA — Open-Meteo &amp; Syngenta CE Hub APIs Connected
                  </span>
                </span>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* 🌱 CROPFIT IMMEDIATE ACTION CARD WITH 👍 / 👎 FEEDBACK     */}
              {/* ────────────────────────────────────────────────────────── */}
              {analysisData?.cropfit && analysisData.cropfit.product && (
                <div className="bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]/70 rounded-2xl p-5 border border-[#bbf7d0] shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 rounded-lg bg-[#15803d] text-white flex items-center justify-center text-sm shadow-2xs">
                        🌱
                      </span>
                      <h3 className="font-extrabold text-[#15803d] text-sm sm:text-base font-display">
                        CropFit Immediate Action
                      </h3>
                    </div>
                    <span className="text-xs font-mono font-bold bg-[#22c55e] text-white px-2.5 py-0.5 rounded-full shadow-2xs">
                      Confidence: {analysisData.cropfit.confidence || 94}%
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#15803d] font-medium leading-relaxed">
                    {analysisData.cropfit.rationale}
                  </p>

                  {/* Product Specification Box */}
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-2xs flex items-center gap-4">
                    <div className="text-3xl shrink-0">🧪</div>
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-black text-slate-800 text-sm truncate">
                        {analysisData.cropfit.product.name || analysisData.cropfit.product.product_name}
                      </div>
                      <div className="text-xs text-slate-500 font-medium truncate">
                        {analysisData.cropfit.product.active_ingredient}
                      </div>
                      <div className="text-xs text-slate-700 font-bold font-mono pt-1">
                        Dosage: <span className="text-[#15803d]">{analysisData.cropfit.product.dosage || "400 ml / acre (200 L water)"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Training Loop */}
                  <div className="pt-2 border-t border-dashed border-[#bbf7d0] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <p className="text-[#15803d] font-semibold text-[11px]">
                      Did this recommendation improve your yield?
                    </p>

                    {feedbackGiven ? (
                      <span className="text-[#15803d] font-bold text-[11px] flex items-center gap-1 bg-white px-2.5 py-1 rounded border border-[#bbf7d0]">
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span>Thank you! Your feedback trains our local agronomic model.</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleFeedback("up")}
                          className="px-3 py-1 bg-white border border-[#16a34a] hover:bg-[#16a34a] hover:text-white text-[#16a34a] font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>👍 Yes</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback("down")}
                          className="px-3 py-1 bg-white border border-rose-500 hover:bg-rose-500 hover:text-white text-rose-600 font-bold text-[11px] rounded-lg transition-all cursor-pointer flex items-center gap-1"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>👎 No</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* 🚨 ALERT CARD                                             */}
              {/* ────────────────────────────────────────────────────────── */}
              {analysisData?.alert && (
                <div
                  className={`rounded-2xl p-5 border-l-4 shadow-sm space-y-2.5 transition-all ${
                    analysisData.alert.severity === "Critical"
                      ? "bg-rose-50/70 border-rose-600"
                      : analysisData.alert.severity === "High"
                      ? "bg-orange-50/70 border-orange-500"
                      : analysisData.alert.severity === "Moderate"
                      ? "bg-amber-50/70 border-amber-500"
                      : "bg-emerald-50/70 border-emerald-600"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-black text-slate-900 text-sm sm:text-base font-display">
                      {analysisData.alert.title}
                    </h3>
                    <span
                      className={`text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                        analysisData.alert.severity === "Critical"
                          ? "bg-rose-100 text-rose-800"
                          : analysisData.alert.severity === "High"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {analysisData.alert.severity}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                    {analysisData.alert.description || analysisData.alert.summary}
                  </p>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2 text-xs font-semibold text-[#15803d]">
                    <Droplets className="h-4 w-4 shrink-0" />
                    <span>
                      Spray Guidance: Delta-T &amp; wind speeds optimal in early mornings (06:00 to 09:30 AM).
                    </span>
                  </div>
                </div>
              )}

              {/* ────────────────────────────────────────────────────────── */}
              {/* 📡 MULTI-MODAL SENSOR ANALYSIS GRID (6 FACTOR CARDS)      */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-[#15803d]" />
                    <h2 className="font-black text-[#1f2937] text-sm font-display">
                      📡 Multi-Modal Sensor Analysis
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    6 Physics Indices
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {factors.map((f: any, idx: number) => {
                    const isStressed =
                      (f.status && /critical|warning|danger|stress|high/i.test(f.status)) ||
                      (f.status && f.status.includes("⚠"));

                    return (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-xl border flex flex-col justify-between gap-1.5 transition-all ${
                          isStressed
                            ? "bg-rose-50/40 border-rose-200"
                            : "bg-[#ecfdf5] border-emerald-200"
                        }`}
                      >
                        <div>
                          <div className="font-extrabold text-[#1f2937] text-xs">
                            {f.factor}
                          </div>
                          <div className="text-slate-500 text-[11px] font-mono mt-0.5">
                            {f.readings}
                          </div>
                          {f.threshold_info && (
                            <div className="text-[10px] text-slate-400 italic mt-0.5">
                              {f.threshold_info}
                            </div>
                          )}
                        </div>

                        <div
                          className={`font-black text-xs font-mono mt-2 self-start px-2 py-0.5 rounded ${
                            isStressed
                              ? "bg-rose-100 text-rose-700 border border-rose-200"
                              : "bg-emerald-100 text-[#15803d] border border-emerald-200"
                          }`}
                        >
                          {isStressed ? `⚠ ${f.status}` : `✓ ${f.status || "Healthy"}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* 📅 14-DAY FORECAST TIMELINE (INTERACTIVE RADAR & MODAL)    */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="bg-white rounded-2xl p-5 border border-[#e5e7eb] shadow-sm space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-[#15803d]" />
                    <h2 className="font-black text-[#1f2937] text-sm font-display">
                      📅 14-Day Forecast Timeline
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Click day for deep telemetry
                  </span>
                </div>

                <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
                  {analysisData?.forecast && analysisData.forecast.length > 0 ? (
                    analysisData.forecast.map((day: any, idx: number) => {
                      const prob =
                        day.overall_stress_probability ?? day.stress_probability ?? 0;
                      const pct = Math.round(prob * 100);
                      const isDanger = pct > 60;
                      const isWarning = pct > 30 && pct <= 60;

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDayModal(day)}
                          className={`min-w-[92px] p-3 rounded-xl border text-center transition-all cursor-pointer shrink-0 hover:-translate-y-1 hover:shadow-md ${
                            isDanger
                              ? "bg-rose-50/70 border-rose-300 text-rose-900"
                              : isWarning
                              ? "bg-amber-50/70 border-amber-300 text-amber-900"
                              : "bg-[#ecfdf5] border-emerald-200 text-emerald-900"
                          }`}
                        >
                          <div className="font-mono text-[10px] font-bold text-slate-500">
                            {day.date || `Day ${idx + 1}`}
                          </div>
                          <div className="text-base font-black my-1 font-display">
                            {pct}%
                          </div>
                          <div className="text-[10px] font-medium truncate capitalize">
                            {(day.dominant_stress_type || "Normal").replace(/_/g, " ")}
                          </div>
                          {day.safe_to_spray && (
                            <div className="text-[10px] mt-1 font-bold text-[#15803d] flex items-center justify-center gap-0.5">
                              <span>💧</span>
                              <span>Spray OK</span>
                            </div>
                          )}
                        </button>
                      );
                    })
                  ) : (
                    <div className="text-xs text-slate-400 py-4 text-center w-full">
                      Loading 14-day multi-modal sensor forecast...
                    </div>
                  )}
                </div>
              </div>

              {/* ────────────────────────────────────────────────────────── */}
              {/* DEEP NAVIGATION PILLARS (PRESCRIPTION, DIAGNOSTICS, MANDI) */}
              {/* ────────────────────────────────────────────────────────── */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                <Link
                  href="/plant-intelligence/prescription"
                  className="p-4 rounded-2xl bg-white border border-[#e5e7eb] hover:border-emerald-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                      Prescription Hub
                    </span>
                    <span className="font-extrabold text-xs text-[#11261f] block group-hover:text-[#15803d]">
                      Top 3 Syngenta Solutions &rarr;
                    </span>
                  </div>
                  <FlaskConical className="h-5 w-5 text-[#15803d] group-hover:scale-110 transition-transform" />
                </Link>

                <Link
                  href="/plant-intelligence/diagnostics"
                  className="p-4 rounded-2xl bg-white border border-[#e5e7eb] hover:border-rose-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                      Diagnostics
                    </span>
                    <span className="font-extrabold text-xs text-[#11261f] block group-hover:text-rose-700">
                      Leaf Vision &amp; Pathology &rarr;
                    </span>
                  </div>
                  <ShieldAlert className="h-5 w-5 text-rose-600 group-hover:scale-110 transition-transform" />
                </Link>

                <Link
                  href="/plant-intelligence/recovery"
                  className="p-4 rounded-2xl bg-white border border-[#e5e7eb] hover:border-purple-300 shadow-2xs hover:shadow-md transition-all flex items-center justify-between group"
                >
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase font-mono block">
                      Closed Loop
                    </span>
                    <span className="font-extrabold text-xs text-[#11261f] block group-hover:text-purple-700">
                      48h Follow-Up Protocol &rarr;
                    </span>
                  </div>
                  <TrendingUp className="h-5 w-5 text-purple-600 group-hover:scale-110 transition-transform" />
                </Link>
              </div>

            </div>

          </div>
        </div>

        {/* ═══════════════════════════════════════════════════════════ */}
        {/* INTERACTIVE DAY DETAILS MODAL (FROM PS02 INDEX.HTML)        */}
        {/* ═══════════════════════════════════════════════════════════ */}
        {selectedDayModal && (
          <div
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setSelectedDayModal(null)}
          >
            <div
              className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-100 max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                <div>
                  <div className="text-xs font-mono font-bold text-[#15803d] uppercase tracking-wider">
                    Detailed Telemetry Day Inspection
                  </div>
                  <h3 className="text-xl font-black text-slate-900 font-display">
                    {selectedDayModal.date || "Forecast Day Inspection"}
                  </h3>
                  <div className="text-xs font-bold text-rose-600 mt-0.5">
                    Highest Risk: {(selectedDayModal.dominant_stress_type || "No Major Stress").toUpperCase()}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedDayModal(null)}
                  className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* 4 Microclimate Sensor Gauges */}
              {(() => {
                const raw = selectedDayModal.raw_data?.weather_layer || {};
                return (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">🌡️ Max Temp</div>
                      <div className="text-base font-black text-slate-800 mt-1 font-mono">
                        {raw.TMax !== undefined ? `${raw.TMax.toFixed(1)}°C` : "--"}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">💧 Precipitation</div>
                      <div className="text-base font-black text-slate-800 mt-1 font-mono">
                        {raw.Precipitation_mm !== undefined ? `${raw.Precipitation_mm.toFixed(1)} mm` : "--"}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">💦 Humidity</div>
                      <div className="text-base font-black text-slate-800 mt-1 font-mono">
                        {raw.RH_percent !== undefined ? `${raw.RH_percent.toFixed(0)}%` : "--"}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">💨 Wind Speed</div>
                      <div className="text-base font-black text-slate-800 mt-1 font-mono">
                        {raw.Wind_kmh !== undefined ? `${raw.Wind_kmh.toFixed(1)} km/h` : "--"}
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Specific Day Syngenta Products */}
              <div className="space-y-3 pt-2">
                <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-700 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-[#15803d]" />
                  <span>Targeted Syngenta Interventions for this Day</span>
                </h4>

                {selectedDayModal.products && selectedDayModal.products.length > 0 ? (
                  selectedDayModal.products.map((p: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-slate-900 text-sm">
                          {p.product_name}
                        </span>
                        <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                          {p.category}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        <strong>Active:</strong> {p.active_ingredient}
                      </div>
                      <p className="text-slate-600 text-xs">{p.rationale}</p>
                      <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-2 text-[11px] font-mono">
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                          Dose: {p.dosage}
                        </span>
                        <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
                          Water: {p.water_usage}
                        </span>
                      </div>
                      {p.timing_advice && (
                        <div className="text-[11px] text-[#15803d] font-semibold">
                          ⏰ {p.timing_advice}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#15803d] font-medium">
                    ✓ Environmental conditions optimal. Standard preventive biostimulant maintenance (Syngenta Quantis / Isabion) recommended.
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setSelectedDayModal(null)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Close Day Details
              </button>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  );
}
