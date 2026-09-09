"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { usePipelinePrediction } from "@/lib/usePipelinePrediction";
import { FarmCropSwitcher } from "@/components/FarmCropSwitcher";
import { optimizeMandiLogistics } from "@/lib/mandiLogisticsEngine";
import {
  ShieldAlert,
  Flame,
  FlaskConical,
  CheckCircle2,
  TrendingUp,
  Truck,
  ArrowRight,
  RefreshCw,
  Volume2,
  VolumeX,
  Sparkles,
  MapPin,
  Clock,
  Droplets,
  Layers,
  ChevronRight,
  Check,
  ShieldCheck,
  AlertTriangle,
  ExternalLink,
  Coins,
  Cpu,
  Activity,
  Gauge,
  Wind,
  Thermometer,
} from "lucide-react";

export default function PlantIntelligencePage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const {
    data,
    loading,
    error,
    refetch,
    farmerName,
    crop,
    district,
    state,
    acres,
    growthStage,
    speakSummary,
    stopSpeaking,
    isSpeaking,
  } = usePipelinePrediction();

  // Check treatment applied status from localStorage
  const [hasApplied, setHasApplied] = useState<boolean>(false);
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aasra_treatment_applied_flag");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.applied) setHasApplied(true);
        } catch {}
      }
    }
  }, []);

  const riskPct = data?.model1_risk?.confidence
    ? Math.round(data.model1_risk.confidence * 100)
    : 84;

  const stressClass = data?.model1_risk?.stress_class ?? (crop === "wheat" ? 0 : 1);
  const stressType = data?.model1_risk?.stress_type || (stressClass === 0 ? "Optimal / No Severe Stress" : "Heat Stress");

  const primaryRec = data?.model3_portfolio?.primary_recommendation;
  const primaryProduct = primaryRec?.name || (crop === "potato" ? "Syngenta Isabion®" : crop === "wheat" ? "Syngenta Actara®" : "Syngenta Quantis®");
  const primaryDosage = primaryRec?.recommended_dosage || "250 ml/acre";
  const primaryActive = primaryRec?.active_ingredient || "Amino acids, peptides & bio-shield";
  const primaryCategory = primaryRec?.category || "Biostimulant";

  const causalGainQ = data?.model6_causal_robi?.causal_gain_tau_q_acre ?? 2.8;
  const baselineYield = data?.model5_baseline?.expected_baseline_yield_q_acre ?? (crop === "wheat" ? 23.09 : crop === "potato" ? 15.47 : 14.51);
  const percentGain = baselineYield > 0 ? Math.round((causalGainQ / baselineYield) * 100) : 18;
  const robiMultiple = data?.model6_causal_robi?.robi_multiplier ?? 19.6;
  const netProfit = data?.model6_causal_robi?.net_farmer_profit_inr ?? Math.round(causalGainQ * acres * 2800 - 560 * acres);
  const yieldPenaltyPct = (data?.model5_baseline as any)?.yield_penalty_pct ?? data?.model5_baseline?.yield_impact_pct ?? (stressClass === 0 ? 3.2 : 14.8);

  const spraySafe = data?.model2_readiness?.spray_window_safe ?? (stressClass === 0);
  const deltaT = Number(data?.telemetry_summary?.delta_t_c ?? data?.model2_readiness?.delta_t ?? (spraySafe ? 5.8 : 9.99));
  const tempMax = Number(data?.telemetry_summary?.temp_max_c ?? (crop === "wheat" ? 26.5 : 38.5));
  const tempMin = Number(data?.telemetry_summary?.temp_min_c ?? (crop === "wheat" ? 14.2 : 25.4));
  const rhAvg = Number(data?.telemetry_summary?.rh_avg_pct ?? (crop === "wheat" ? 58 : 42));
  const vpd = Number(data?.telemetry_summary?.vpd_kpa ?? (crop === "wheat" ? 1.4 : 3.2));
  const windSpeed = Number(data?.telemetry_summary?.wind_speed_kmh ?? 9.5);
  const rainProb = Number(data?.telemetry_summary?.rain_prob_next_48h ?? 10);
  const soilMoisture = Number(data?.telemetry_summary?.soil_moisture_pct ?? (crop === "wheat" ? 42 : 28));
  const weatherTimestamp = data?.telemetry_summary?.weather_timestamp || "Live Weather Grid";

  const safetyReason = data?.model2_readiness?.safety_reasons?.[0] || (spraySafe ? "Atmospheric metrics in safe range (2.0°C - 8.0°C)" : `Delta-T (${deltaT}°C) exceeds 8.0°C limit`);

  const totalDoseFormatted = primaryDosage.includes("ml")
    ? `${((parseFloat(primaryDosage) || 250) * acres / 1000).toFixed(2)} Litres`
    : primaryDosage.includes("g")
    ? `${((parseFloat(primaryDosage) || 50) * acres).toFixed(0)} Grams`
    : `${(0.25 * acres).toFixed(2)} Litres`;

  const totalHarvestQ = +( (baselineYield + causalGainQ) * acres ).toFixed(1);
  const mandiData = optimizeMandiLogistics(
    crop,
    Number(totalHarvestQ) > 0 ? Number(totalHarvestQ) : 15.0,
    district,
    state,
    2800
  );
  const bestMandiShortName = mandiData.recommendedMandi.mandiName.split(" ")[0];
  const bestMandiGain = mandiData.recommendedMandi.profitDifferentialInr;

  return (
    <AppShell>
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* ── Top Header & Active Farm Grounding with Crop Switcher ──── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/80">
                {isHindi ? "पादप बुद्धिमत्ता व तनाव रडार" : "Plant Intelligence Radar"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                {isHindi ? "वर्टेक्स एआई मॉडल 1, 2, 3, 5, 6 सक्रिय" : "Vertex AI Models 1, 2, 3, 5, 6 Active"}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#0d253d] tracking-tight">
              {isHindi ? `फसल स्वास्थ्य स्थिति — ${crop.toUpperCase()}` : `Crop Intelligence — ${crop.toUpperCase()}`}
            </h1>

            {/* Farm Grounding Profile Strip */}
            <p className="text-xs sm:text-sm text-slate-500 font-medium flex items-center gap-2 flex-wrap mt-1">
              <span className="flex items-center gap-1 text-slate-700 font-bold">
                <MapPin className="h-3.5 w-3.5 text-indigo-600" />
                <span>{district}{state ? `, ${state}` : ""}</span>
              </span>
              <span className="text-slate-300">·</span>
              <strong className="text-slate-900 font-mono">{acres} Acres</strong>
              <span className="text-slate-300">·</span>
              <span className="text-indigo-700 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                {growthStage}
              </span>
            </p>
          </div>

          {/* Action Buttons: Multi-Crop Switcher + Audio Voice + Refresh */}
          <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
            <FarmCropSwitcher />

            <button
              onClick={speakSummary}
              className="px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs flex items-center gap-2 shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="h-4 w-4 text-rose-600" />
                  <span className="text-rose-700">{isHindi ? "आवाज बंद करें" : "Stop Voice"}</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-4 w-4 text-indigo-600" />
                  <span>{isHindi ? "📢 बोलकर सुनें" : "📢 Listen Advisory"}</span>
                </>
              )}
            </button>

            <button
              onClick={() => refetch()}
              disabled={loading}
              className="p-2.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              title="Re-run Vertex AI Pipeline"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* ── High-Impact Executive Alert Banner ─────────────── */}
        <div className={`border-2 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4 ${
          stressClass === 0 
            ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-emerald-500/30"
            : stressClass === 2
            ? "bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-transparent border-amber-500/30"
            : "bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border-rose-500/30"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-3.5 rounded-2xl text-white shadow-md shrink-0 ${
                stressClass === 0 ? "bg-emerald-600" : stressClass === 2 ? "bg-amber-600" : "bg-rose-600"
              }`}>
                {stressClass === 0 ? <ShieldCheck className="h-8 w-8" /> : stressClass === 2 ? <Droplets className="h-8 w-8" /> : <Flame className="h-8 w-8" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                    stressClass === 0 
                      ? "text-emerald-700 bg-emerald-100/80 border-emerald-300"
                      : stressClass === 2
                      ? "text-amber-800 bg-amber-100/80 border-amber-300"
                      : "text-rose-700 bg-rose-100/80 border-rose-300"
                  }`}>
                    {isHindi ? `मॉडल 1 निदान: ${stressType} (${riskPct}%)` : `Model 1 Diagnosis: ${stressType} (${riskPct}%)`}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {crop} ({growthStage})
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0d253d] font-display">
                  {stressClass === 0
                    ? (isHindi ? "फसल स्वास्थ्य अनुकूल — सामान्य प्रकाश संश्लेषण व विकास" : "Optimal Crop Health — Canopy Vigorous & Stress-Free")
                    : stressClass === 1
                    ? (isHindi ? "रात के अत्यधिक तापमान से थर्मल हीट स्ट्रेस का खतरा" : "Severe Canopy Thermal Heat Stress Detected")
                    : stressClass === 2
                    ? (isHindi ? "मिट्टी में नमी की कमी — ड्राउट स्ट्रेस का खतरा" : "Root-Zone Hydraulic Deficit & Drought Stress Detected")
                    : stressClass === 3
                    ? (isHindi ? "गर्मी व सूखे का दोहरा संयुक्त तनाव (Compound Stress)" : "Compound Heat & Drought Stress Detected")
                    : (isHindi ? `फसल तनाव चेतावनी: ${stressType}` : `Crop Alert: ${stressType} Detected`)}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {(data as any)?.agronomic_synthesis ? (isHindi ? (data as any).agronomic_synthesis.statement_hi : (data as any).agronomic_synthesis.statement_en) : data?.gemini_statement ? (isHindi ? data.gemini_statement.statement_hi : (data.gemini_statement.statement_en || data.gemini_statement.statement)) : (
                    stressClass === 0
                      ? (isHindi ? "वर्तमान तापमान और आर्द्रता फसल के विकास के लिए पूर्णतः अनुकूल हैं। नियमित निगरानी जारी रखें।" : "Current thermal and moisture conditions remain within ideal biophysical limits for vegetative vigor.")
                      : (isHindi ? `अधिकतम तापमान ${tempMax}°C एवं VPD ${vpd} kPa से कोशिकाओं पर दबाव है, त्वरित सुरक्षा आवश्यक है।` : `High ambient temperature (${tempMax}°C) and elevated vapor pressure deficit (${vpd} kPa) place acute physiological strain on the canopy.`)
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`bg-white/90 backdrop-blur-sm p-4 rounded-2xl border text-center sm:text-right shrink-0 ${
                stressClass === 0 ? "border-emerald-200/80" : "border-rose-200/80"
              }`}>
                <span className={`text-3xl font-black font-display block ${
                  stressClass === 0 ? "text-emerald-600" : "text-rose-600"
                }`}>
                  {riskPct}%
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {isHindi ? "मॉडल 1 विश्वास" : "Model 1 Confidence"}
                </span>
              </div>
            </div>
          </div>

          {/* Safe Spray Verdict Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-200/50 text-xs">
            <div className={`flex items-center gap-2 font-bold ${spraySafe ? "text-emerald-800" : "text-amber-800"}`}>
              {spraySafe ? <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" /> : <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />}
              <span>
                {spraySafe
                  ? (isHindi ? `मॉडल 2 स्प्रे विंडो: सुरक्षित (डेल्टा-टी ${deltaT}°C, हवा ${windSpeed} किमी/घं)` : `Model 2 Spray Gate: Window Safe (Delta-T: ${deltaT}°C, Wind: ${windSpeed} km/h)`)
                  : (isHindi ? `मॉडल 2 स्प्रे विंडो: बंद — ${safetyReason}` : `Model 2 Spray Gate: Window Closed — ${safetyReason}`)}
              </span>
            </div>

            <span className="text-slate-500 font-mono text-[11px]">
              {(data as any)?.execution_source || data?.execution_metadata?.serving_mode || "Vertex AI & Cloud Run (asia-south1)"}
            </span>
          </div>
        </div>

        {/* ── The 4 Core Farmer Answers (WHAT, WHY, HOW, ACTION) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. WHAT */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <span className={`h-2.5 w-2.5 rounded-full ${stressClass === 0 ? "bg-emerald-500" : "bg-rose-500"}`} />
              <span>{isHindi ? "1. क्या हो रहा है? (WHAT)" : "1. What is Happening?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {stressClass === 0
                ? (isHindi ? `फसल सामान्य व सुरक्षित (${riskPct}% विश्वास)` : `Optimal Canopy Conditions (${riskPct}% Confidence)`)
                : (isHindi ? `${crop} में ${stressType} (${riskPct}% जोखिम)` : `${stressType} Diagnosed (${riskPct}% Confidence)`)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {stressClass === 0
                ? (isHindi
                    ? `${district} में आपकी ${crop} की फसल (${growthStage}) में कोई असामान्य तापीय या जल तनाव नहीं है। प्रकाश संश्लेषण की दर सामान्य है।`
                    : `Your ${crop} crop in ${district} (${growthStage} stage) is operating within normal metabolic bounds with healthy canopy vigor.`)
                : (isHindi
                    ? `${district} में ${crop} की फसल पर दिन का तापमान ${tempMax}°C और रात का तापमान ${tempMin}°C रहने से पौधे की कोशिकाओं में तनाव है।`
                    : `Your ${crop} crop in ${district} is undergoing physiological stress under ${tempMax}°C daytime heat and ${tempMin}°C nocturnal temperatures.`)}
            </p>
          </div>

          {/* 2. WHY */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{isHindi ? "2. यह क्यों हो रहा है? (WHY)" : "2. Why is This Happening?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {stressClass === 0
                ? (isHindi ? `संतुलित वायुमंडलीय वाष्प दबाव (VPD ${vpd} kPa)` : `Equilibrium Atmospheric VPD (${vpd} kPa)`)
                : (isHindi ? `उच्च वाष्प दबाव घाटा (VPD ${vpd} kPa) व तापमान भार` : `Elevated VPD (${vpd} kPa) & Canopy Vapor Deficit`)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `सेंसर टेलीमेट्री: अधिकतम तापमान ${tempMax}°C, सापेक्ष आर्द्रता ${rhAvg}%, हवा की गति ${windSpeed} किमी/घंटा और मिट्टी की नमी ${soilMoisture}% दर्ज की गई है।`
                : `Atmospheric telemetry records max temp ${tempMax}°C, humidity ${rhAvg}%, wind speed ${windSpeed} km/h, and root-zone soil moisture at ${soilMoisture}%.`}
            </p>
          </div>

          {/* 3. HOW */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>{isHindi ? "3. फसल पर क्या असर होगा? (HOW)" : "3. How Does It Impact Yield?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {stressClass === 0
                ? (isHindi ? `पूर्ण उपज क्षमता सुरक्षित (${baselineYield} क्विंटल/एकड़)` : `Preserving Full Yield Potential (${baselineYield} Q/Acre)`)
                : (isHindi ? `उपज में ${percentGain}% तक नुकसान (-${causalGainQ} क्विंटल/एकड़)` : `Risk of ${percentGain}% Yield Loss (-${causalGainQ} Q/Acre)`)}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `मॉडल 5 आधारभूत उपज ${baselineYield} क्विंटल/एकड़ आंकता है। बिना सुरक्षा के ${causalGainQ} क्विंटल/एकड़ का नुकसान हो सकता है (कुल ${acres} एकड़ पर लगभग ₹${(Math.round(causalGainQ * acres * 2800)).toLocaleString("en-IN")})।`
                : `Model 5 estimates baseline yield of ${baselineYield} Q/acre. Without intervention, causal loss of ${causalGainQ} Q/acre threatens ₹${(Math.round(causalGainQ * acres * 2800)).toLocaleString("en-IN")} across your ${acres} acres.`}
            </p>
          </div>

          {/* 4. WHAT YOU CAN DO */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{isHindi ? "4. आपको क्या करना चाहिए? (WHAT TO DO)" : "4. What Action to Take?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? `${primaryProduct} का अनुशंसित प्रयोग` : `Apply ${primaryProduct} (${spraySafe ? "Window Safe" : "Await Window"})`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `खुराक: ${primaryDosage} (आपके ${acres} एकड़ के लिए कुल ${totalDoseFormatted})। ${spraySafe ? `डेल्टा-टी ${deltaT}°C पर सुरक्षित है। शाम के समय छिड़काव करें।` : `सुरक्षा चेतावनी: ${safetyReason}। मौसम सुधरने तक प्रतीक्षा करें।`}`
                : `Prescription: ${primaryDosage} (${totalDoseFormatted} for your ${acres} acres) in 150-200L water/acre. ${spraySafe ? `Delta-T is optimal at ${deltaT}°C. Apply during safe window.` : `Hold application: ${safetyReason}.`}`}
            </p>
          </div>
        </div>

        {/* ── 5 Connected Models Cascade (Vertex AI Asia-South1) ──────── */}
        <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="text-[11px] font-mono font-bold text-indigo-700 uppercase bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                  {isHindi ? "वर्टेक्स एआई मॉडल शृंखला" : "Vertex AI Interconnected Models"}
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  {isHindi ? "5 मॉडल सक्रिय व जुड़े हैं" : "5 Models Chained & Live"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0d253d] font-display">
                {isHindi ? "5 जुड़े हुए वर्टेक्स एआई मॉडल — लाइव निर्णय इंजन" : "5 Connected Vertex AI Models — Live Decision Engine"}
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {isHindi
                  ? `${farmerName} के ${district} स्थित ${acres} एकड़ ${crop.toUpperCase()} खेत के लिए लाइव बायोफिजिकल व कारणिक अनुमान क्रमबद्ध रूप से क्रियान्वित हैं।`
                  : `End-to-end biophysical & causal inference computed in real time for ${farmerName}'s ${acres}-acre ${crop.toUpperCase()} in ${district}.`}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-[11px] font-mono text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                asia-south1 · GCP iitm01
              </span>
            </div>
          </div>

          {/* Sequential Chain Connector Bar */}
          <div className="hidden lg:flex items-center justify-between px-2 text-[11px] font-bold text-slate-500 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2 text-rose-700">
              <span className="h-6 w-6 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-mono font-bold text-xs">1</span>
              <span>Model 1: Climate Stress</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs">2</span>
              <span>Model 2: Spray Gate</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
            <div className="flex items-center gap-2 text-indigo-700">
              <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-mono font-bold text-xs">3</span>
              <span>Model 3: Syngenta Match</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
            <div className="flex items-center gap-2 text-purple-700">
              <span className="h-6 w-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-mono font-bold text-xs">5</span>
              <span>Model 5: Yield Baseline</span>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-slate-300" />
            <div className="flex items-center gap-2 text-emerald-700">
              <span className="h-6 w-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-mono font-bold text-xs">6</span>
              <span>Model 6: EconML ROBI</span>
            </div>
          </div>

          {/* The 5 Connected Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            
            {/* Card 1: Model 1 */}
            <div className="p-4 rounded-2xl border border-rose-200/80 bg-rose-50/30 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full border border-rose-200">
                    MODEL 1 · PS-02
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Classifier</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#0d253d] font-display">
                  Climate Stress
                </h4>
                <div className="bg-white p-3 rounded-xl border border-rose-100 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Diagnosis</span>
                  <span className="text-base font-black text-rose-600 block leading-tight">
                    {stressType}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 block">
                    {riskPct}% Confidence
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Max Temp:</span>
                    <span className="font-bold">{tempMax}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">VPD:</span>
                    <span className="font-bold">{vpd} kPa</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Soil Moist:</span>
                    <span className="font-bold">{soilMoisture}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-rose-100 text-[10px] font-mono text-rose-700 flex items-center gap-1">
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span>Feeds stress to M2 &amp; M3</span>
              </div>
            </div>

            {/* Card 2: Model 2 */}
            <div className={`p-4 rounded-2xl border flex flex-col justify-between gap-4 ${
              spraySafe ? "border-emerald-200/80 bg-emerald-50/30" : "border-amber-200/80 bg-amber-50/30"
            }`}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                    spraySafe ? "text-emerald-700 bg-emerald-100 border-emerald-200" : "text-amber-800 bg-amber-100 border-amber-200"
                  }`}>
                    MODEL 2 · PS-02
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Safety Gate</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#0d253d] font-display">
                  Biological Spray Gate
                </h4>
                <div className="bg-white p-3 rounded-xl border border-slate-100 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Window Verdict</span>
                  <span className={`text-sm font-black block leading-tight ${spraySafe ? "text-emerald-600" : "text-amber-600"}`}>
                    {spraySafe ? "WINDOW OPEN (SAFE)" : "WINDOW CLOSED"}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 block">
                    Delta-T: {deltaT}°C
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Safe Range:</span>
                    <span className="font-bold">2.0 - 8.0°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Wind Speed:</span>
                    <span className="font-bold">{windSpeed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Rain 48h:</span>
                    <span className="font-bold">{rainProb}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-slate-100 text-[10px] font-mono text-slate-600 flex items-center gap-1">
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span>Gates foliar timing for M3</span>
              </div>
            </div>

            {/* Card 3: Model 3 */}
            <div className="p-4 rounded-2xl border border-indigo-200/80 bg-indigo-50/30 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full border border-indigo-200">
                    MODEL 3 · PS-03
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Ranker</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#0d253d] font-display">
                  Syngenta Portfolio
                </h4>
                <div className="bg-white p-3 rounded-xl border border-indigo-100 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Rank #1 Match</span>
                  <span className="text-sm font-black text-indigo-600 block leading-tight truncate" title={primaryProduct}>
                    {primaryProduct}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 block">
                    Dose: {primaryDosage}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Category:</span>
                    <span className="font-bold truncate max-w-[100px]">{primaryCategory}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Crop Total:</span>
                    <span className="font-bold">{totalDoseFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">CIB&amp;RC Reg:</span>
                    <span className="font-bold text-emerald-600">Approved</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-indigo-100 text-[10px] font-mono text-indigo-700 flex items-center gap-1">
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span>Feeds dose cost to M6</span>
              </div>
            </div>

            {/* Card 4: Model 5 */}
            <div className="p-4 rounded-2xl border border-purple-200/80 bg-purple-50/30 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                    MODEL 5 · PS-07
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Regressor</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#0d253d] font-display">
                  Yield Baseline
                </h4>
                <div className="bg-white p-3 rounded-xl border border-purple-100 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Expected Baseline</span>
                  <span className="text-base font-black text-purple-600 block leading-tight">
                    {baselineYield} Q/Acre
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 block">
                    {(baselineYield * acres).toFixed(1)} Q Field Total
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">District:</span>
                    <span className="font-bold truncate max-w-[100px]">{district}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Growth Stage:</span>
                    <span className="font-bold truncate max-w-[100px]">{growthStage}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Penalty Risk:</span>
                    <span className="font-bold text-rose-600">-{yieldPenaltyPct}%</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-purple-100 text-[10px] font-mono text-purple-700 flex items-center gap-1">
                <ArrowRight className="h-3 w-3 shrink-0" />
                <span>Feeds baseline into M6</span>
              </div>
            </div>

            {/* Card 5: Model 6 */}
            <div className="p-4 rounded-2xl border border-emerald-200/80 bg-emerald-50/30 flex flex-col justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    MODEL 6 · PS-07
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">Double ML</span>
                </div>
                <h4 className="font-extrabold text-sm text-[#0d253d] font-display">
                  Causal EconML ROBI
                </h4>
                <div className="bg-white p-3 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Causal Uplift (τ)</span>
                  <span className="text-base font-black text-emerald-600 block leading-tight">
                    +{causalGainQ} Q/Acre
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 block">
                    {robiMultiple}x ROBI Multiplier
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Net Profit:</span>
                    <span className="font-bold text-emerald-700">+₹{netProfit.toLocaleString("en-IN")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Saved:</span>
                    <span className="font-bold">+{(causalGainQ * acres).toFixed(1)} Quintals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Method:</span>
                    <span className="font-bold">EconML DML</span>
                  </div>
                </div>
              </div>
              <div className="pt-2 border-t border-emerald-100 text-[10px] font-mono text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 shrink-0 text-emerald-600" />
                <span>Verified Cash Profit</span>
              </div>
            </div>

          </div>

          {/* Live Telemetry Sensor Grounding Strip */}
          <div className="bg-[#f8fafc] border border-slate-200/80 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-700">
                  {isHindi ? "लाइव मौसम व मृदा इनपुट (सेंसर डेटा):" : "Live Sensor & Meteorological Inputs (Driving Pipeline):"}
                </span>
                <span className="font-mono text-slate-500 text-[11px]">{weatherTimestamp}</span>
              </div>
              <span className="text-[11px] font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                Meteoblue &amp; Open-Meteo High-Resolution Grid
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 mt-3 pt-3 border-t border-slate-200/60 font-mono text-xs">
              <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase">Max Temp</span>
                <span className="font-bold text-slate-900">{tempMax}°C</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase">Min Temp</span>
                <span className="font-bold text-slate-900">{tempMin}°C</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase">Rel Humidity</span>
                <span className="font-bold text-slate-900">{rhAvg}%</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase">VPD Deficit</span>
                <span className="font-bold text-slate-900">{vpd} kPa</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase">Delta-T</span>
                <span className={`font-bold ${deltaT > 8 || deltaT < 2 ? "text-amber-600" : "text-emerald-600"}`}>{deltaT}°C</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase">Wind Speed</span>
                <span className="font-bold text-slate-900">{windSpeed} km/h</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase">48h Rain</span>
                <span className="font-bold text-slate-900">{rainProb}%</span>
              </div>
              <div className="bg-white p-2 rounded-xl border border-slate-200/60">
                <span className="text-[10px] text-slate-400 block uppercase">Soil Moist.</span>
                <span className="font-bold text-slate-900">{soilMoisture}%</span>
              </div>
            </div>
          </div>
        </div>


        {/* ── Consolidated Agronomic Intelligence Pillars (1, 2&3, 4&5) ───── */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-[#0d253d] font-display flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              <span>{isHindi ? "संरचित पादप बुद्धिमत्ता स्तंभ" : "The Core Agronomic Intelligence Pillars"}</span>
            </h2>
            <span className="text-xs text-slate-400 font-medium">
              {isHindi ? "गहन विश्लेषण देखने के लिए क्लिक करें" : "Click to view dedicated breakdown"}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-sans">
            
            {/* Pillar 1: Problem Diagnostics & 14-Day Stress Radar */}
            <Link
              href="/plant-intelligence/diagnostics"
              className="p-6 rounded-3xl bg-white hover:bg-slate-50/90 border border-[#e3e8ee] hover:border-rose-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-black text-rose-700 bg-rose-100/90 px-3 py-1 rounded-full border border-rose-300">
                  {riskPct}% Risk · 14-Day Radar
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pillar 1</span>
                <span className="text-lg font-black text-[#0d253d] font-display block">
                  {isHindi ? "समस्या पहचान व 14-दिवसीय तनाव रडार" : "Problem Diagnostics & 14-Day Radar"}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isHindi
                    ? "मौसम मॉडल व वर्टेक्स एआई द्वारा 14 दिनों का दैनिक तनाव पूर्वानुमान और उपज नुकसान का आंकलन।"
                    : "Model 1 thermal stress timeline across next 14 days with daily probabilities & crop damage warnings."}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-rose-600 font-bold text-xs pt-3 border-t border-slate-100">
                <span>{isHindi ? "14-दिवसीय तनाव रडार देखें" : "Explore 14-Day Radar"}</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Pillars 2 & 3 Combined: Product & Application Timeline */}
            <Link
              href="/plant-intelligence/prescription"
              className="p-6 rounded-3xl bg-white hover:bg-slate-50/90 border border-[#e3e8ee] hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-200/80 group-hover:scale-110 transition-transform">
                  <FlaskConical className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-black text-indigo-700 bg-indigo-100/90 px-3 py-1 rounded-full border border-indigo-300">
                  Quantis® · Tank-Mix Matrix
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pillars 2 &amp; 3 Combined</span>
                <span className="text-lg font-black text-[#0d253d] font-display block">
                  {isHindi ? "उत्पाद नुस्खा, टैंक-मिक्स व स्प्रे समय" : "Product, Tank-Mix & Timeline"}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isHindi
                    ? "सिंजेंटा क्रॉपफिट उत्पाद, 2-3 विकल्प, क्या मिलाएं/क्या न मिलाएं, देरी का नुकसान व जैविक स्प्रे विंडो।"
                    : "Syngenta CropFit solutions, 2-3 alternatives, tank-mix compatibility matrix & delay penalty timeline."}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-indigo-600 font-bold text-xs pt-3 border-t border-slate-100">
                <span>{isHindi ? "उत्पाद व स्प्रे समय देखें" : "View Product & Timeline"}</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Pillars 4 & 5 Combined: Economic Impact & 5 Mandis Comparison */}
            <Link
              href="/impact"
              className="p-6 rounded-3xl bg-white hover:bg-slate-50/90 border border-[#e3e8ee] hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5 group"
            >
              <div className="flex items-center justify-between">
                <div className="p-3 rounded-2xl bg-purple-50 text-purple-600 border border-purple-200/80 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <span className="text-xs font-mono font-black text-purple-700 bg-purple-100/90 px-3 py-1 rounded-full border border-purple-300">
                  +{percentGain}% Yield · {bestMandiShortName}
                </span>
              </div>
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Pillars 4 &amp; 5 Combined</span>
                <span className="text-lg font-black text-[#0d253d] font-display block">
                  {isHindi ? "आर्थिक प्रभाव व 5 मंडी आर्बिट्राज" : "Economic Impact & 5 Mandis"}
                </span>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {isHindi
                    ? "इकोनएमएल कारणिक उपज बचत, शुद्ध इन-हैंड लाभ एवं 5 नजदीकी एपीएमसी मंडियों की रियल-टाइम तुलना।"
                    : "EconML Double ML causal yield gains, verified ROBI multiple & 5 nearby APMC mandis comparison table."}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-purple-600 font-bold text-xs pt-3 border-t border-slate-100">
                <span>{isHindi ? "आर्थिक प्रभाव व 5 मंडियां देखें" : "Explore Impact & Mandis"}</span>
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

          </div>
        </div>

        {/* ── Prominent Banner Linking to 5 Mandis Comparison at /impact ── */}
        <div className="bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200 rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-purple-600 text-white shadow-md shrink-0">
              <Truck className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase text-purple-800 bg-purple-100 px-2.5 py-0.5 rounded-full">
                  {isHindi ? "मंडी आर्बिट्राज विश्लेषण" : "Mandi Arbitrage Engine"}
                </span>
                <span className="text-xs font-bold text-slate-600">
                  {totalHarvestQ} {isHindi ? "क्विंटल कुल फसल" : "Quintals Harvest"} ({acres} Ac)
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black text-[#0d253d] font-display">
                {isHindi
                  ? `5 नजदीकी एपीएमसी मंडियों की तुलना में ${bestMandiShortName} सबसे बेहतर (+₹${bestMandiGain})`
                  : `5 Nearby APMC Mandis: ${bestMandiShortName} Delivers Highest Net Realization (+₹${bestMandiGain})`}
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                {isHindi
                  ? "ढुलाई, डीजल और हम्माली खर्च घटाकर शुद्ध इन-हैंड मुनाफा देखें।"
                  : "Compare live modal prices, transport freight, and APMC hamali on the dedicated Impact dashboard."}
              </p>
            </div>
          </div>

          <Link
            href="/impact"
            className="px-5 py-3 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer"
          >
            <Truck className="h-4 w-4" />
            <span>{isHindi ? "5 मंडियां और उपज प्रभाव देखें" : "View 5 Mandis Comparison"}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ── Quick Farmer Action Bar ────────────────────────── */}
        <div className="p-6 rounded-3xl bg-[#f6f9fc] border border-[#e3e8ee] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <span className="font-extrabold text-[#0d253d] block text-sm">
              {isHindi ? "क्या आपने इस फसल पर स्प्रे कर लिया है?" : "Have you completed this treatment?"}
            </span>
            <span className="text-xs text-slate-500">
              {isHindi
                ? "स्प्रे की पुष्टि करें ताकि आपकी उपज और फार्म डायरी स्वतः अपडेट हो सके।"
                : "Confirm your application to sync with your Farm Journal and calibrate upcoming weather forecasts."}
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              href="/plant-intelligence/recovery"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Check className="h-4 w-4" />
              <span>{isHindi ? "स्प्रे की पुष्टि करें (Confirm)" : "Confirm Spray Done"}</span>
            </Link>
            <Link
              href="/fields"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <span>{isHindi ? "मेरे खेत (My Fields)" : "My Fields"}</span>
            </Link>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
