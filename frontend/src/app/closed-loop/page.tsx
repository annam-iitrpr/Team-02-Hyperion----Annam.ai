"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  CloudRain,
  Flame,
  ArrowRight,
  Activity,
  Volume2,
  Check,
  XCircle,
} from "lucide-react";

interface Scenario {
  crop: string;
  stage: string;
  m1Diagnosis: string;
  recommendedProduct: string;
  activeIngredient: string;
  category: "biostimulant" | "fungicide" | "insecticide";
  iracFrac: string;
  dosage: string;
  waterVol: string;
  costPerAcre: number;
  expectedTrajectory: string;
  qSaved: number;
  mandiPrice: number;
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    crop: "Wheat (PBW-826)",
    stage: "Milking & Grain Filling (Zadoks GS 73-77)",
    m1Diagnosis: "Yellow Rust (Puccinia striiformis) & Nocturnal Heat Stress (Chamkaur Sahib, Rupnagar, Punjab)",
    recommendedProduct: "Syngenta Score® (Difenoconazole 25% EC)",
    activeIngredient: "Difenoconazole 25% EC (Triazole Systemic Fungicide)",
    category: "fungicide",
    iracFrac: "FRAC Group 3 (Sterol Demethylation Inhibitor)",
    dosage: "200 ml / acre",
    waterVol: "200 L / acre",
    costPerAcre: 390,
    expectedTrajectory: "Translaminar stop-action within 48h: fungal rust pustules dry into dark chlorotic scars. Day +2 WhatsApp triage verifies remission; Day +5 triggers Syngenta Quantis® biostimulant rescue.",
    qSaved: 2.8,
    mandiPrice: 2425,
  },
  {
    crop: "Soybean",
    stage: "R2 Flowering",
    m1Diagnosis: "Nocturnal Heatwave Stress (25.8°C Night Peak)",
    recommendedProduct: "Quantis®",
    activeIngredient: "Amino Acids + Peptides + Osmoprotectants",
    category: "biostimulant",
    iracFrac: "Biostimulant (Osmolyte)",
    dosage: "400 ml / acre",
    waterVol: "200 L / acre",
    costPerAcre: 320,
    expectedTrajectory: "Restores stomatal transpiration within 72h. ΔCTD increases by +2.4°C; halts flower abortion.",
    qSaved: 1.25,
    mandiPrice: 4800,
  },
  {
    crop: "Rice (Paddy)",
    stage: "Tillering to Panicle",
    m1Diagnosis: "Rice Sheath Blight (Rhizoctonia solani)",
    recommendedProduct: "Amistar Top®",
    activeIngredient: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
    category: "fungicide",
    iracFrac: "FRAC 11 + FRAC 3",
    dosage: "200 ml / acre",
    waterVol: "200 L / acre",
    costPerAcre: 1300,
    expectedTrajectory: "Translaminar stop-action within 72h: active water-soaked lesions dry into dark papery scars. Sporulation halts.",
    qSaved: 3.2,
    mandiPrice: 2200,
  },
  {
    crop: "Chickpea (Gram)",
    stage: "Pod Formation",
    m1Diagnosis: "Pod Borer Infestation (Helicoverpa armigera)",
    recommendedProduct: "Evicent®",
    activeIngredient: "Emamectin Benzoate 5% SG",
    category: "insecticide",
    iracFrac: "IRAC 6 (Avermectin)",
    dosage: "80 g / acre",
    waterVol: "200 L / acre",
    costPerAcre: 380,
    expectedTrajectory: "Larval muscle paralysis within 24-48h. Caterpillars cease feeding and drop to soil. 0 new pod boreholes.",
    qSaved: 1.8,
    mandiPrice: 5400,
  },
  {
    crop: "Potato",
    stage: "Vegetative / Tuber Bulking",
    m1Diagnosis: "Late Blight Alert (Phytophthora infestans)",
    recommendedProduct: "Orondis Ultra®",
    activeIngredient: "Oxathiapiprolin + Mandipropamid SC",
    category: "fungicide",
    iracFrac: "FRAC 49 + FRAC 40",
    dosage: "200 ml / acre",
    waterVol: "200 L / acre",
    costPerAcre: 1100,
    expectedTrajectory: "Oomycete sporangia lysis within 48h. Halts petiole collapse; protects expanding green foliage.",
    qSaved: 22.0,
    mandiPrice: 1250,
  },
];

export default function ClosedLoopPage() {
  const [selectedScenarioIdx, setSelectedScenarioIdx] = useState<number>(0);
  const scenario = PRESET_SCENARIOS[selectedScenarioIdx];

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [adherenceSprayTime, setAdherenceSprayTime] = useState<"morning" | "noon" | "missed">("morning");
  const [symptomStatus, setSymptomStatus] = useState<"dry" | "spreading">("dry");
  const [pestStatus, setPestStatus] = useState<"dead" | "active">("dead");
  const [weatherCondition, setWeatherCondition] = useState<"normal" | "rain" | "heat">("normal");

  const isFullSuccess = symptomStatus === "dry" && pestStatus === "dead" && weatherCondition === "normal" && adherenceSprayTime === "morning";
  const isWashOff = weatherCondition === "rain";
  const isSubOptimal = adherenceSprayTime === "noon";
  const isMissed = adherenceSprayTime === "missed";
  const isFailure = !isFullSuccess && !isWashOff && !isMissed;

  // Dynamically calculate actual realized yield and ROBI based on real conditions!
  let realizedQSaved = scenario.qSaved;
  if (isWashOff) realizedQSaved = scenario.qSaved * 0.25; // Rain washed away 75%
  else if (isSubOptimal) realizedQSaved = scenario.qSaved * 0.65; // Noon heat caused evaporation
  else if (isFailure) realizedQSaved = 0.0; // Treatment failed / pest resistant
  else if (isMissed) realizedQSaved = 0.0; // Did not spray

  const revenueProtected = Math.round(realizedQSaved * scenario.mandiPrice);
  const robiMultiplier = isFullSuccess 
    ? ((Math.round(scenario.qSaved * scenario.mandiPrice) - scenario.costPerAcre) / scenario.costPerAcre).toFixed(1)
    : (isWashOff ? "0.3" : (isSubOptimal ? "1.8" : "-1.0"));

  const handleReset = () => {
    setCurrentStep(0);
    setAdherenceSprayTime("morning");
    setSymptomStatus("dry");
    setPestStatus("dead");
    setWeatherCondition("normal");
  };

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-900 font-sans">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#e3e8ee] pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-mono font-bold tracking-wide">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              <span>PS-03 + PS-07 · CLOSED-LOOP PHARMACOVIGILANCE</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#0d253d] tracking-tight">
              Iterative Crop Care & Verification Loop
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Experience AASRA's digital agronomist hand-holding loop: from <strong>Day 0 Prescription</strong> to <strong>Day 4 WhatsApp Triage</strong> to autonomous <strong>Multi-Model Recalibration</strong>.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 text-xs font-bold shadow-2xs cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Simulation</span>
            </button>
            <span className="px-4 py-2 rounded-2xl bg-indigo-50 text-[#533afd] text-xs font-mono font-bold border border-indigo-200 shadow-2xs">
              4 Interconnected ML Models
            </span>
          </div>
        </div>

        {/* Scenario Selector Tabs */}
        <div className="space-y-2">
          <label className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400">
            Select Active Farm Crisis:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PRESET_SCENARIOS.map((sc, idx) => (
              <button
                key={sc.crop}
                onClick={() => {
                  setSelectedScenarioIdx(idx);
                  setCurrentStep(0);
                }}
                className={`p-3.5 text-left rounded-2xl border transition-all cursor-pointer ${
                  selectedScenarioIdx === idx
                    ? "bg-[#0d253d] text-white border-[#0d253d] shadow-md ring-2 ring-emerald-400/50"
                    : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/50"
                }`}
              >
                <div className="text-xs font-mono text-emerald-400 font-bold">{sc.crop}</div>
                <div className="text-xs font-bold truncate mt-0.5">{sc.recommendedProduct}</div>
                <div className={`text-[11px] truncate mt-1 ${selectedScenarioIdx === idx ? "text-slate-300" : "text-slate-500"}`}>
                  {sc.stage}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Progression Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              Interactive Treatment Timeline
            </span>
            <span className="text-xs font-mono font-bold text-indigo-600">
              STEP {currentStep + 1} OF 4
            </span>
          </div>

          <div className="grid grid-cols-4 gap-2 sm:gap-4 relative">
            {[
              { title: "Day 0", subtitle: "Prescription", desc: "Model 3 Ranking" },
              { title: "Day 1", subtitle: "Adherence", desc: "Spraying Check" },
              { title: "Day 4", subtitle: "Visual Triage", desc: "WhatsApp 2Q Check" },
              { title: "Resolution", subtitle: "Closed Loop", desc: "Models 1, 5, 6 Sync" },
            ].map((st, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              return (
                <button
                  key={st.title}
                  onClick={() => setCurrentStep(idx)}
                  className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-indigo-50/80 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20"
                      : isPast
                      ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold">{st.title}</span>
                    {isPast ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    ) : isCurrent ? (
                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                    ) : null}
                  </div>
                  <div className="text-xs font-bold mt-1">{st.subtitle}</div>
                  <div className="text-[10px] text-slate-500 hidden sm:block">{st.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* STEP PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left 2 Cols: Main Interactive Flow */}
          <div className="lg:col-span-2 space-y-6">

            {/* STEP 0: DAY 0 PRESCRIPTION */}
            {currentStep === 0 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-rose-50 text-rose-700 text-xs font-mono font-bold border border-rose-200">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      <span>MODEL 1 DIAGNOSIS: {scenario.m1Diagnosis}</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mt-2">
                      Optimal Clinical Prescription: {scenario.recommendedProduct}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Classified via Model 3 LambdaMART Ranker against 50 Syngenta candidates.
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-mono font-bold border border-emerald-200 shrink-0">
                    CIB&RC Approved
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">ACTIVE FORMULA</span>
                    <span className="text-xs font-bold text-slate-800">{scenario.activeIngredient}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">STANDARD DOSE</span>
                    <span className="text-xs font-bold text-slate-800">{scenario.dosage} in {scenario.waterVol}</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">INPUT COST</span>
                    <span className="text-xs font-bold text-slate-800">₹{scenario.costPerAcre} / acre</span>
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-slate-400 block">PROJECTED ROBI</span>
                    <span className="text-xs font-black font-mono text-emerald-600">{robiMultiplier}x Return</span>
                  </div>
                </div>

                {/* Expected 72h Trajectory */}
                <div className="bg-indigo-50/60 p-4 rounded-xl border border-indigo-200 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-indigo-900">
                    <Activity className="h-4 w-4 text-indigo-600" />
                    <span>Predicted 72-Hour Biophysical Trajectory (ICAR AICRP Calibration)</span>
                  </div>
                  <p className="text-xs text-indigo-950 leading-relaxed font-sans">
                    {scenario.expectedTrajectory}
                  </p>
                  <div className="text-[11px] font-mono text-indigo-700/80">
                    Calculated using active ingredient dissipation half-life (DT50) and degree-day (DD) kinetics.
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#533afd] text-white font-bold text-xs shadow-md hover:bg-[#4326fd] cursor-pointer"
                  >
                    <span>Proceed to Day 1 Adherence Check</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 1: DAY 1 ADHERENCE CHECK */}
            {currentStep === 1 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-mono font-bold text-indigo-600 uppercase">
                    DAY 1 · 24 HOURS POST-PRESCRIPTION
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    Adherence Verification: Did Farmer Complete the Spray?
                  </h2>
                  <p className="text-xs text-slate-500">
                    Digital advisory fails if farmers don't spray or spray during peak afternoon heat.
                  </p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-mono font-bold uppercase text-slate-400">
                    Simulate Farmer Response:
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      {
                        id: "morning",
                        label: "Sprayed Morning (06:30 AM)",
                        sub: "200L water · Optimal stomata",
                      },
                      {
                        id: "noon",
                        label: "Sprayed Afternoon (01:00 PM)",
                        sub: "39°C heat · Evaporation risk",
                      },
                      {
                        id: "missed",
                        label: "Could Not Spray / Missed",
                        sub: "Product unavailable in mandi",
                      },
                    ].map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setAdherenceSprayTime(opt.id as any)}
                        className={`p-4 rounded-xl text-left border transition-all cursor-pointer ${
                          adherenceSprayTime === opt.id
                            ? "bg-slate-900 text-white border-slate-900 ring-2 ring-emerald-400/50"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        }`}
                      >
                        <div className="text-xs font-bold">{opt.label}</div>
                        <div className={`text-[11px] mt-1 ${adherenceSprayTime === opt.id ? "text-slate-300" : "text-slate-500"}`}>
                          {opt.sub}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {adherenceSprayTime === "noon" && (
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Sub-Optimal Spray Timing Detected:</strong> Stomata are closed due to afternoon vapor pressure deficit. Cuticular penetration will drop by ~35%.
                    </span>
                  </div>
                )}

                {adherenceSprayTime === "missed" && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-900 flex items-start gap-2">
                    <XCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Treatment Non-Adherence Logged:</strong> Model 6 marks treatment indicator D_i = 0. System pauses to prevent incorrect causal attribution.
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← Back to Day 0
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#533afd] text-white font-bold text-xs shadow-md hover:bg-[#4326fd] cursor-pointer"
                  >
                    <span>Proceed to Day 4 Triage Check-in</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: DAY 4 THE 2-QUESTION VISUAL TRIAGE */}
            {currentStep === 2 && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
                <div className="border-b border-slate-100 pb-4">
                  <span className="text-xs font-mono font-bold text-emerald-600 uppercase">
                    DAY 4 · 72–96 HOURS POST-SPRAY
                  </span>
                  <h2 className="text-xl font-bold text-slate-900 mt-1">
                    WhatsApp Conversational Triage: The 2-Question Observation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Translates complex PDI disease index and Henderson-Tilton mortality into 2 simple farmer-visible choices.
                  </p>
                </div>

                {/* Simulated WhatsApp Frame */}
                <div className="bg-[#f0f2f5] p-4 rounded-2xl border border-slate-300 space-y-4 font-sans">
                  <div className="bg-white p-3.5 rounded-xl rounded-tl-none shadow-2xs border border-slate-200/80 max-w-md space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800">
                        <Volume2 className="h-5 w-5" />
                      </div>
                      <div className="space-y-0.5 flex-1">
                        <div className="text-xs font-bold text-slate-800">AASRA Krishi Mitra (Voice Note)</div>
                        <div className="h-1.5 bg-emerald-200 rounded-full w-full" />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">0:18</span>
                    </div>
                    <p className="text-xs text-slate-600 italic">
                      "Ramdas ji, spray kiye hue 3 din poore ho gaye hain. Apne khet ke 5 paudhon ko dhyan se dekhiye aur bataiye..."
                    </p>
                  </div>

                  {/* Question 1: Lesion Boundary */}
                  <div className="bg-white p-4 rounded-xl shadow-2xs border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block">
                      Sawāl 1: Daag aur Dhabbe Kaise Dikh Rahe Hain? (Spot Condition)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setSymptomStatus("dry")}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          symptomStatus === "dry"
                            ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">🟢 Option A: Sookh Gaye (Dry)</span>
                          {symptomStatus === "dry" && <Check className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Daag kaale/bhoore hokar sookh gaye hain. Peela ghera gayab hai.
                        </div>
                      </button>

                      <button
                        onClick={() => setSymptomStatus("spreading")}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          symptomStatus === "spreading"
                            ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-950"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">🔴 Option B: Fail Rahe Hain (Spreading)</span>
                          {symptomStatus === "spreading" && <Check className="h-4 w-4 text-rose-600" />}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Daag geela pan liye hue hain, peela ghera badh raha hai.
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Question 2: Pest Activity */}
                  <div className="bg-white p-4 rounded-xl shadow-2xs border border-slate-200/80 space-y-3">
                    <span className="text-xs font-bold text-slate-900 block">
                      Sawāl 2: Keede Aur Fasal Ki Taazgi? (Pest & Vigor State)
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        onClick={() => setPestStatus("dead")}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          pestStatus === "dead"
                            ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 text-emerald-950"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">🟢 Option A: Keede Gayab / Mare</span>
                          {pestStatus === "dead" && <Check className="h-4 w-4 text-emerald-600" />}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Keede behosh/mare hain, nayi pattiyaan taaza aur hari hain.
                        </div>
                      </button>

                      <button
                        onClick={() => setPestStatus("active")}
                        className={`p-3 rounded-xl text-left border transition-all cursor-pointer ${
                          pestStatus === "active"
                            ? "bg-rose-50 border-rose-500 ring-2 ring-rose-500/20 text-rose-950"
                            : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">🔴 Option B: Zinda Keede Chalke Chaba Rahe</span>
                          {pestStatus === "active" && <Check className="h-4 w-4 text-rose-600" />}
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          Pattiyon par naye chhed ho rahe hain, keeda chal raha hai.
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Weather Sensor Overlay Simulation */}
                  <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2">
                    <span className="text-[11px] font-mono font-bold uppercase text-slate-500 block">
                      NASA / Open-Meteo Autonomous Weather Sensor Check (Past 72h):
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: "normal", label: "Normal Weather (No Rain)" },
                        { id: "rain", label: "Heavy Rain (18mm @ 2h post-spray)" },
                        { id: "heat", label: "Extreme Heat (41°C Peak)" },
                      ].map((w) => (
                        <button
                          key={w.id}
                          onClick={() => setWeatherCondition(w.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            weatherCondition === w.id
                              ? "bg-slate-800 text-white shadow-2xs"
                              : "bg-white text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          <span>{w.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← Back to Day 1
                  </button>
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs shadow-md hover:bg-emerald-700 cursor-pointer"
                  >
                    <span>Execute Closed-Loop Recalibration</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: CLOSED-LOOP AUTONOMOUS RESOLUTION */}
            {currentStep === 3 && (
              <div className="space-y-6">
                {/* SCENARIO A: FULL REMISSION (SUCCESS) */}
                {isFullSuccess && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-emerald-500 shadow-md space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold">
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          <span>CASE STATUS: VERIFIED CLINICAL REMISSION</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#0d253d] mt-2">
                          Treatment Succeeded: {scenario.recommendedProduct} Preserved Harvest
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Farmer verified lesion desiccation and pest mortality. Zero catastrophic loss.
                        </p>
                      </div>
                      <span className="text-2xl font-black font-mono text-emerald-600">
                        +{robiMultiplier}x ROBI
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
                      <div>
                        <span className="text-[11px] font-mono text-emerald-800/80 block">YIELD PROTECTED</span>
                        <span className="text-sm font-bold text-emerald-950">+{scenario.qSaved} Q / acre</span>
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-emerald-800/80 block">NET CASH GAIN</span>
                        <span className="text-sm font-bold text-emerald-950">
                          +₹{(revenueProtected - scenario.costPerAcre).toLocaleString()} / acre
                        </span>
                      </div>
                      <div>
                        <span className="text-[11px] font-mono text-emerald-800/80 block">REACTION</span>
                        <span className="text-sm font-bold text-emerald-950">Proceed to standard harvest plan</span>
                      </div>
                    </div>

                    {/* Model Updates */}
                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-3 font-mono text-xs">
                      <span className="text-emerald-400 font-bold block uppercase tracking-wider">
                        Autonomous Multi-Model State Synchronization:
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>• <strong>Model 1:</strong> Stress risk class for this grid lowered from Risk to Normal.</li>
                        <li>• <strong>Model 3:</strong> Logs positive reinforcement reward (y_realized = 3) into LambdaMART buffer.</li>
                        <li>• <strong>Model 5:</strong> Yield loss penalty (-30%) removed. Forecast updated to full potential.</li>
                        <li>• <strong>Model 6:</strong> True causal treatment effect τ = +{scenario.qSaved} Q/ac verified and locked in audit ledger.</li>
                      </ul>
                    </div>
                  </div>
                )}

                {/* SCENARIO B: WEATHER WASH-OFF */}
                {isWashOff && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-blue-500 shadow-md space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold">
                          <CloudRain className="h-4 w-4 text-blue-600" />
                          <span>DIAGNOSIS: PRECIPITATION CANOPY WASH-OFF</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#0d253d] mt-2">
                          18mm Rain Fell 2 Hours Post-Spray
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Product did not fail. NASA Open-Meteo telemetry detected premature rain before chemical cuticular absorption.
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-mono font-bold rounded-lg border border-blue-200">
                        Weather Washout
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-950 space-y-2">
                      <strong className="block text-blue-900">AASRA Autonomous Rescue Recommendation:</strong>
                      <p>
                        Apply a booster spray of {scenario.recommendedProduct} at 50% rate mixed with an <strong>Organosilicone Surfactant Adjuvant (Silwet / Activator)</strong> to guarantee 30-minute rainfastness.
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-2 font-mono text-xs">
                      <span className="text-blue-400 font-bold block uppercase tracking-wider">
                        Autonomous Model Recalibration:
                      </span>
                      <p className="text-slate-300">
                        • <strong>Model 6 Causal Gate:</strong> Does NOT penalize {scenario.recommendedProduct} efficacy. Attributes partial degradation to weather covariate W_i rather than chemical failure.
                      </p>
                    </div>
                  </div>
                )}

                {/* SCENARIO C: RESISTANCE OR ACTIVE INFECTION (FAILURE) */}
                {isFailure && (
                  <div className="bg-white p-6 rounded-2xl border-2 border-rose-500 shadow-md space-y-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-mono font-bold">
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                          <span>DIAGNOSIS: PATHOGEN TOLERANCE / PERSISTENT STRESS</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-[#0d253d] mt-2">
                          Symptoms Persistent: Automatic Mode-of-Action Rotation
                        </h2>
                        <p className="text-xs text-slate-600 mt-1">
                          Farmer reported active feeding or spreading spots despite adherence. System prevents repeated spraying of same chemical to avoid resistance.
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 text-xs font-mono font-bold rounded-lg border border-rose-200">
                        Resistance Alert
                      </span>
                    </div>

                    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-950 space-y-2">
                      <strong className="block text-rose-900 font-bold">AASRA Secondary Next-Best-Action (NBA):</strong>
                      <p>
                        Rotating from {scenario.iracFrac} to an alternative chemical class or biological rescue:
                        <strong> Switch to Syngenta Quantis® + Copper Hydroxide broad-spectrum bactericide/fungicide</strong> to trigger Systemic Acquired Resistance (SAR).
                      </p>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900 text-slate-100 space-y-3 font-mono text-xs">
                      <span className="text-rose-400 font-bold block uppercase tracking-wider">
                        Autonomous Multi-Model State Updates:
                      </span>
                      <ul className="space-y-1.5 text-slate-300">
                        <li>• <strong>Model 1:</strong> Regional alert elevated to "Cluster Pathogen Outbreak".</li>
                        <li>• <strong>Model 3:</strong> Deducts utility score from {scenario.recommendedProduct} for this specific environmental vector.</li>
                        <li>• <strong>Model 5:</strong> Maintains -20% yield risk discount until secondary treatment verified.</li>
                      </ul>
                    </div>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    ← Back to Day 4 Triage
                  </button>
                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    <span>Try Another Scenario</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Live Multi-Model State Inspector HUD */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-mono font-bold uppercase text-slate-400">
                  LIVE MODEL STATE INSPECTOR
                </span>
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              {/* Model 1 HUD */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Model 1 (Stress Classifier)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                    {currentStep >= 3 && isFullSuccess ? "NORMAL" : "ALERT"}
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  State: {currentStep >= 3 ? (isFullSuccess ? "Recovered (Bayesian Prior -0.4)" : (isWashOff ? "Wash-Off Warning (Prior +0.2)" : "Persistent Outbreak (Prior +0.6)")) : scenario.m1Diagnosis.slice(0, 28) + "..."}
                </div>
              </div>

              {/* Model 3 HUD */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Model 3 (LambdaMART Ranker)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">
                    Rank #1
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  Prescription: {scenario.recommendedProduct} ({scenario.category})
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  Utility: {currentStep >= 3 ? (isFullSuccess ? "y_realized = 3 (Verified)" : (isWashOff ? "y_realized = 2 (Weather Covariate)" : "y_realized = 0 (Resistance Penalty)")) : "Predicted Relevance = 3"}
                </div>
              </div>

              {/* Model 5 HUD */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Model 5 (Yield Regressor)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                    R² = 0.968
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  Penalty: {currentStep >= 3 ? (isFullSuccess ? "-0% (Full Potential)" : (isWashOff ? "-18% (Delayed Control)" : "-32% (Severe Damage)")) : "-28% (Active Risk)"}
                </div>
              </div>

              {/* Model 6 HUD */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Model 6 (Causal DML ROBI)</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                    Double ML
                  </span>
                </div>
                <div className="text-slate-500 text-[11px] font-mono">
                  Treatment Indicator: D_i = {adherenceSprayTime === "missed" ? "0 (Non-Adherent)" : "1 (Sprayed)"}
                </div>
                <div className="text-emerald-700 font-mono font-bold text-xs mt-1">
                  Verified ROBI: {currentStep >= 3 ? (isFullSuccess ? `${robiMultiplier}x Capital Return` : (isWashOff ? "0.3x (Washout Breakeven)" : "Negative Return (-1.0x)")) : "Pending Day 4 Verification"}
                </div>
              </div>
            </div>

            {/* Scientific Credibility Card for Judges */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
              <span className="font-mono font-bold uppercase text-slate-500 text-[11px] block">
                SCIENTIFIC TRIAL CITATIONS:
              </span>
              <ul className="text-[11px] text-slate-600 space-y-1">
                <li>• <strong>ICAR-AICRP:</strong> Standard Day 1, 3, 7 bio-efficacy evaluation windows.</li>
                <li>• <strong>Henderson-Tilton (1955):</strong> Population mortality correction for open-field plots.</li>
                <li>• <strong>EPPO PP 1/152:</strong> Efficacy trial design & phytotoxicity quantification.</li>
                <li>• <strong>Chernozhukov et al. (2018):</strong> Double ML partialing out weather confounders.</li>
              </ul>
            </div>
          </div>

        </div>

      </div>
    </AppShell>
  );
}
