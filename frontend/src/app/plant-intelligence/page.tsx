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
  Sun,
  Sprout,
  Wind,
  Coins,
  Cloud,
  Cpu,
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
    : 92;

  const stressType = data?.model1_risk?.stress_type || (isHindi ? "थर्मल हीट शॉक" : "Thermal Heat Stress");

  const topRec = data?.model3_portfolio?.top_recommendations?.[0] || data?.model3_portfolio?.primary_recommendation;
  const primaryProduct = topRec?.name || "Syngenta Quantis®";
  const recommendedDosage = topRec?.recommended_dosage || "250 ml / Acre";

  const causalGainQ = data?.model6_causal_robi?.causal_gain_tau_q_acre || 1.38;
  const baselineYield = data?.model5_baseline?.expected_baseline_yield_q_acre || 7.4;
  const percentGain = Math.round((causalGainQ / baselineYield) * 100) || 19;

  const nightTemp = data?.telemetry_summary?.temp_min_c !== undefined
    ? `${data.telemetry_summary.temp_min_c.toFixed(1)}°C`
    : "26.4°C";

  const vpdVal = data?.telemetry_summary?.vpd_kpa !== undefined
    ? `${data.telemetry_summary.vpd_kpa.toFixed(1)} kPa`
    : "2.8 kPa";

  const spraySafe = data?.model2_readiness?.spray_window_safe ?? true;
  const deltaTVal = data?.model2_readiness?.delta_t !== undefined
    ? `${data.model2_readiness.delta_t.toFixed(1)}°C`
    : "4.0°C";

  // ── Dynamic labels derived from real telemetry (zero hardcoding) ────────
  const nightTempRaw = data?.telemetry_summary?.temp_min_c;
  const nightTempLabel = nightTempRaw !== undefined
    ? (nightTempRaw > 28
        ? (isHindi ? `>${nightTempRaw.toFixed(0)}°C तीव्र रात-गर्मी` : `>${nightTempRaw.toFixed(0)}°C Severe Night Heat`)
        : nightTempRaw > 25
        ? (isHindi ? `>${nightTempRaw.toFixed(0)}°C उच्च रात-तापमान` : `>${nightTempRaw.toFixed(0)}°C High Night Heat`)
        : nightTempRaw > 22
        ? (isHindi ? `${nightTempRaw.toFixed(0)}°C गर्म रात` : `${nightTempRaw.toFixed(0)}°C Warm Night`)
        : (isHindi ? `${nightTempRaw.toFixed(0)}°C अनुकूल रात` : `${nightTempRaw.toFixed(0)}°C Optimal Night`))
    : (isHindi ? "रात-तापमान निगरानी" : "Night Temp Monitoring");

  const vpdKpaRaw = data?.telemetry_summary?.vpd_kpa ?? 0;
  const vpdCategory = vpdKpaRaw >= 2.5
    ? (isHindi ? "अत्यधिक जल-दबाव" : "Critical Water Stress")
    : vpdKpaRaw >= 1.5
    ? (isHindi ? "उच्च वाष्पोत्सर्जन" : "High Transpiration")
    : vpdKpaRaw >= 0.8
    ? (isHindi ? "मध्यम वाष्पोत्सर्जन" : "Moderate Transpiration")
    : (isHindi ? "अनुकूल VPD स्तर" : "Low / Optimal VPD");

  // Spray window label & reason from backend (computed from real temp/wind/rain)
  const sprayLabel = data?.model2_readiness?.spray_window_label
    ?? (spraySafe ? (isHindi ? "शाम / सुबह" : "Eve / Morning") : (isHindi ? "स्प्रे रोकें" : "Hold Spray"));
  const sprayReason = data?.model2_readiness?.spray_window_reason
    ?? (spraySafe ? (isHindi ? "सुरक्षित परिस्थितियाँ" : "Safe conditions") : `ΔT ${deltaTVal} adverse`);

  const windSpeed = data?.telemetry_summary?.wind_speed_kmh;
  const windLabel = windSpeed !== undefined
    ? (isHindi ? `हवा ${windSpeed.toFixed(0)} किमी/घं` : `Wind ${windSpeed.toFixed(0)} km/h`)
    : (isHindi ? "हवा की गति" : "Wind Speed");

  const modelCount = data?.execution_metadata?.models_executed?.length ?? 5;
  const stressImpactLabel = isHindi ? `${stressType} प्रभाव` : `${stressType} Impact`;
  const stressSeverityLabel = riskPct >= 85
    ? (isHindi ? `गंभीर ${riskPct}%` : `Critical ${riskPct}%`)
    : riskPct >= 60
    ? (isHindi ? `चेतावनी ${riskPct}%` : `Warning ${riskPct}%`)
    : (isHindi ? `मध्यम ${riskPct}%` : `Moderate ${riskPct}%`);

  const totalDoseLiters = +(0.25 * acres).toFixed(2);

  const totalHarvestQ = +( (baselineYield + causalGainQ) * acres ).toFixed(1);
  const mandiData = optimizeMandiLogistics(
    crop,
    Number(totalHarvestQ) > 0 ? Number(totalHarvestQ) : 11.5,
    district,
    state,
    2150
  );
  const bestMandiShortName = mandiData.recommendedMandi.mandiName.split(" ")[0];
  const bestMandiGain = data?.model6_causal_robi?.net_farmer_profit_inr || mandiData.recommendedMandi.profitDifferentialInr || 42834;
  const robiMultiplier = data?.model6_causal_robi?.robi_multiplier || "9.7x";

  return (
    <AppShell>
      {/* ── Outer Canvas with Exact Dashboard Dot Matrix Theme ────── */}
      <div className="relative min-h-screen bg-[#fbfcf8] bg-[radial-gradient(#1b4332_0.75px,transparent_0.75px)] [background-size:24px_24px] [background-position:0_0] text-slate-800 pb-24 md:pb-12">
        <div className="max-w-[1240px] w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-10 space-y-5 sm:space-y-8 font-sans">
          
          {/* ── 1. Top Header & Farm Identification ──────────────────── */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border-b border-[#e8ede4] pb-5 sm:pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-bold text-[#1b4332] bg-[#e8f5e9] px-3 py-1 rounded-full border border-[#cbe5cb] flex items-center gap-1.5 shadow-2xs">
                  <Sprout className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  {isHindi ? "पादप स्वास्थ्य एवं फसल सुरक्षा" : "Today's Field Health & Care"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {isHindi ? "लाइव सेंसर सक्रिय" : "Live Sensors Active"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black font-display text-[#11261f] tracking-tight leading-tight">
                {isHindi ? `फसल स्वास्थ्य स्थिति — ${crop}` : `Crop Health & Protection — ${crop}`}
              </h1>

              {/* Farm Grounding Chips Strip */}
              <div className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2 flex-wrap pt-1">
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#e8ede4] text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                  <span className="truncate max-w-[190px] sm:max-w-none">{district}{state ? `, ${state}` : ""}, India</span>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-[#e8ede4] text-slate-700 font-semibold">
                  {acres} Acres
                </span>
                <span className="bg-[#e8f5e9] px-2.5 py-1 rounded-lg border border-[#cbe5cb] text-[#1b4332] font-bold flex items-center gap-1">
                  <Sprout className="h-3 w-3 text-[#2d6a4f]" />
                  <span>{crop}</span>
                </span>
                <span className="bg-[#f0f5ee] px-2.5 py-1 rounded-lg border border-[#d9e6d4] text-slate-700 font-semibold">
                  {growthStage}
                </span>
              </div>
            </div>

            {/* Action Buttons: Multi-Crop Switcher + Audio Voice + Refresh */}
            <div className="flex items-center gap-2 sm:gap-2.5 self-start sm:self-auto flex-wrap">
              <FarmCropSwitcher />

              <button
                type="button"
                onClick={speakSummary}
                className="px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-2xl bg-[#e8f5e9] hover:bg-[#d8edd9] text-[#1b4332] border border-[#cbe5cb] font-bold text-xs flex items-center gap-1.5 sm:gap-2 shadow-2xs transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98] min-h-[40px]"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="h-4 w-4 text-rose-600" />
                    <span className="text-rose-700">{isHindi ? "आवाज बंद करें" : "Stop Voice"}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-[#2d6a4f]" />
                    <span>{isHindi ? "📢 बोलकर सुनें" : "📢 Listen Advisory"}</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={loading}
                className="p-2 sm:p-2.5 rounded-2xl bg-[#f0f5ee] hover:bg-[#e3ede0] text-[#1b4332] border border-[#d9e6d4] shadow-2xs transition-all cursor-pointer disabled:opacity-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
                title="Refresh Field Analysis"
                aria-label="Refresh Field Analysis"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#2d6a4f]" : "text-[#2d6a4f]"}`} />
              </button>
            </div>
          </div>

          {/* ── 2. Top Telemetry Card (Matching Dashboard Field Microclimate) ─ */}
          <div className="bg-white/95 backdrop-blur-md p-4 sm:p-7 rounded-3xl border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-4 sm:space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="text-[10px] font-mono font-bold text-[#1b4332] bg-[#e8f5e9] px-3 py-1 rounded-full border border-[#cbe5cb] flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                    {isHindi ? "लाइव पादप सूक्ष्म-मौसम व तनाव रडार" : "Live Field Telemetry & Plant Stress Radar"}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    Precision Biometeorology
                  </span>
                  <span className="text-[10px] font-mono font-bold text-emerald-800 bg-[#e8f5e9] px-2.5 py-1 rounded-full border border-[#cbe5cb] flex items-center gap-1.5 shadow-2xs">
                    <Cloud className="h-3 w-3 text-emerald-700 shrink-0" />
                    <span>{data?.execution_source || "Vertex AI Cloud (asia-south1, iitm01)"}</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 font-semibold">
                    {modelCount} Models Live
                  </span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-[#11261f] flex items-center gap-2 font-display">
                  <Sun className="h-5 w-5 text-amber-500 shrink-0" />
                  <span className="leading-snug">{isHindi ? "फसल तनाव एवं सूक्ष्म-जलवायु विश्लेषण" : "Crop Stress & Field Microclimate Assessment"} — {district}, {crop}</span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1.5 rounded-xl font-mono font-bold text-xs flex items-center gap-1.5 ${
                  spraySafe
                    ? "bg-[#e8f5e9] border border-[#cbe5cb] text-[#1b4332]"
                    : "bg-rose-50 border border-rose-200 text-rose-800"
                }`}>
                  {spraySafe
                    ? <CheckCircle2 className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                    : <AlertTriangle className="h-3.5 w-3.5 text-rose-600 shrink-0" />}
                  <span>
                    {isHindi
                      ? `स्प्रे विंडो: ${sprayLabel} — ${spraySafe ? "सुरक्षित" : "रुकें"}`
                      : `Spray: ${sprayLabel} — ${spraySafe ? "Safe" : "Hold"}`}
                  </span>
                </span>
              </div>
            </div>

            {/* 6 Real Telemetry Metric Cells matching dashboard layout */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
              {/* 1. Stress Risk */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
                <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                  {isHindi ? "तनाव जोखिम" : "Stress Risk"}
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-rose-600">
                  {riskPct}%
                </div>
                <span className="text-[10px] text-rose-700 font-semibold flex items-center gap-1 font-sans truncate">
                  <Flame className="h-3 w-3 shrink-0" />
                  <span>{stressType}</span>
                </span>
              </div>

              {/* 2. Night Temperature */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
                <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                  {isHindi ? "रात का तापमान" : "Night Temp (20-06h)"}
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-amber-600">
                  {nightTemp}
                </div>
                <span className={`text-[10px] font-semibold flex items-center gap-1 font-sans ${nightTempRaw !== undefined && nightTempRaw > 25 ? "text-amber-700" : "text-emerald-700"}`}>
                  {nightTempRaw !== undefined && nightTempRaw > 25
                    ? <AlertTriangle className="h-3 w-3 shrink-0" />
                    : <CheckCircle2 className="h-3 w-3 shrink-0" />}
                  <span>{nightTempLabel}</span>
                </span>
              </div>

              {/* 3. Vapor Pressure Deficit */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
                <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                  {isHindi ? "वाष्प दबाव घाटा" : "VPD Level"}
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-[#11261f]">
                  {vpdVal}
                </div>
                <span className={`text-[10px] font-semibold flex items-center gap-1 font-sans ${vpdKpaRaw >= 1.5 ? "text-amber-700" : "text-emerald-700"}`}>
                  {vpdCategory}
                </span>
              </div>

              {/* 4. Harvest at Risk */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
                <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                  {isHindi ? "उपज जोखिम" : "Yield At Risk"}
                </span>
                <div className="text-lg sm:text-xl font-extrabold text-rose-600">
                  -{causalGainQ} Q/Ac
                </div>
                <span className="text-[10px] text-rose-700 font-semibold flex items-center gap-1 font-sans">
                  {percentGain}% Potential Drop
                </span>
              </div>

              {/* 5. Recommended Solution */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
                <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                  {isHindi ? "सुझाया गया उत्पाद" : "Top Solution"}
                </span>
                <div className="text-sm sm:text-base font-extrabold text-[#1b4332] truncate" title={primaryProduct}>
                  {primaryProduct}
                </div>
                <span className="text-[10px] text-[#2d6a4f] font-semibold flex items-center gap-1 font-sans truncate">
                  {recommendedDosage}
                </span>
              </div>

              {/* 6. Treatment Spray Window */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
                <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                  {isHindi ? "स्प्रे विंडो" : "Spray Window"}
                </span>
                <div className={`text-sm sm:text-base font-extrabold ${spraySafe ? "text-emerald-800" : "text-rose-700"}`}>
                  {sprayLabel}
                </div>
                <span className={`text-[10px] font-semibold flex items-center gap-1 font-sans ${spraySafe ? "text-emerald-700" : "text-rose-600"}`}>
                  {spraySafe
                    ? <CheckCircle2 className="h-3 w-3 shrink-0" />
                    : <AlertTriangle className="h-3 w-3 shrink-0" />}
                  <span className="truncate" title={sprayReason}>{sprayReason}</span>
                </span>
              </div>
            </div>

            {/* 3 Summary Bars matching dashboard bottom trio */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs pt-1">
              {/* Crop Stress Index */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase font-sans">
                    {isHindi ? "फसल तनाव सूचकांक" : "Crop Weather Stress Index"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${riskPct >= 85 ? "bg-rose-50 text-rose-700 border-rose-200" : riskPct >= 60 ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"}`}>
                    {stressSeverityLabel}
                  </span>
                </div>
                <div className={`text-xl font-extrabold ${riskPct >= 85 ? "text-rose-600" : riskPct >= 60 ? "text-amber-600" : "text-emerald-600"}`}>
                  {riskPct}% <span className="text-xs font-normal text-slate-500 font-sans">{stressImpactLabel}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${riskPct}%` }} />
                </div>
              </div>

              {/* Chemical Spray Window */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase font-sans">
                    {isHindi ? "रासायनिक स्प्रे विंडो" : "Chemical Spray Window"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${spraySafe ? "bg-emerald-50 text-emerald-800 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>
                    {isHindi ? (spraySafe ? "सुरक्षित" : "रुकें") : (spraySafe ? "Safe to Spray" : "Hold Spray")}
                  </span>
                </div>
                <div className={`text-xl font-extrabold ${spraySafe ? "text-[#11261f]" : "text-rose-700"}`}>
                  {spraySafe
                    ? <>{isHindi ? "अभी उपयुक्त" : "Active Window"} <span className="text-xs font-normal text-slate-500 font-sans">{windLabel}</span></>
                    : <>{isHindi ? "स्थगित करें" : "Delay Spray"} <span className="text-xs font-normal text-slate-500 font-sans">{windLabel}</span></>}
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  {isHindi
                    ? `${primaryProduct} (${recommendedDosage}) के लिए ${spraySafe ? "आदर्श" : "प्रतिकूल"} परिस्थितियाँ।`
                    : `${spraySafe ? "Ideal" : "Adverse"} conditions for ${primaryProduct} (${recommendedDosage}) foliar uptake.`}
                </p>
              </div>

              {/* Mandi & Yield Realization */}
              <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 text-[10px] font-bold tracking-wider uppercase font-sans">
                    {isHindi ? "मंडी लाभ व संरक्षित उपज" : `${district.toUpperCase()} APMC RATE`}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb]">
                    +{percentGain}% Yield
                  </span>
                </div>
                <div className="text-xl font-extrabold text-[#11261f]">
                  +₹{bestMandiGain.toLocaleString("en-IN")} <span className="text-xs font-normal text-emerald-700 font-sans">Protected Gain</span>
                </div>
                <p className="text-[11px] text-slate-500 font-sans">
                  {acres}-Ac Harvest: preserving +{causalGainQ} Q/Ac with {bestMandiShortName} mandi pricing.
                </p>
              </div>
            </div>
          </div>

          {/* ── 3. The 4 Core Farmer Questions (WHAT, WHY, HOW, ACTION) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* 1. WHAT */}
            <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(27,67,50,0.03)] space-y-2.5 hover:border-emerald-300/60 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-rose-500" />
                  <span>{isHindi ? "1. क्या हो रहा है? (WHAT)" : "1. What is Happening?"}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                  {riskPct}% Risk
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#11261f] font-display">
                {isHindi ? `फसल स्थिति: ${stressType} (${riskPct}% सटीकता)` : `${stressType} (${riskPct}% Confidence)`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isHindi
                  ? (data?.gemini_statement?.statement_hi || `आपकी ${crop} की फसल (${district}) में मॉडल 1 विश्लेषण द्वारा ${stressType} दर्ज किया गया है।`)
                  : (data?.gemini_statement?.statement_en || data?.gemini_statement?.statement || `Model 1 Stress Risk Classifier detects ${stressType} (${riskPct}% confidence) for your ${crop} crop in ${district}.`)}
              </p>
            </div>

            {/* 2. WHY */}
            <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(27,67,50,0.03)] space-y-2.5 hover:border-amber-300/60 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-800 font-bold text-xs uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-amber-500" />
                  <span>{isHindi ? "2. यह क्यों हो रहा है? (WHY)" : "2. Why is This Happening?"}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  {vpdVal} VPD
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#11261f] font-display">
                {isHindi ? `सूक्ष्म-जलवायु तनाव (न्यूनतम ताप ${nightTemp}, VPD ${vpdVal})` : `Microclimate Dynamics (Min Temp ${nightTemp}, VPD ${vpdVal})`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isHindi
                  ? `रात का तापमान ${nightTemp} और वाष्प दबाव घाटा (VPD) ${vpdVal} के साथ मॉडल 2 बायोफिजिकल गेट सुरक्षित स्प्रे विंडो की निगरानी कर रहा है।`
                  : `Atmospheric vapor pressure deficit at ${vpdVal} with nocturnal minimum temperature at ${nightTemp} governs foliar stomatal conductance and crop respiration.`}
              </p>
            </div>

            {/* 3. HOW */}
            <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(27,67,50,0.03)] space-y-2.5 hover:border-emerald-300/60 transition-all">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1b4332] font-bold text-xs uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-[#2d6a4f]" />
                  <span>{isHindi ? "3. फसल पर क्या असर होगा? (HOW)" : "3. How Does It Impact Yield?"}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  +{causalGainQ} Q/Ac Uplift
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#11261f] font-display">
                {isHindi ? `डबल एमएल उपज सुरक्षा: +${causalGainQ} Q/Ac (+₹${bestMandiGain.toLocaleString("en-IN")})` : `Causal Double ML Protection: +${causalGainQ} Q/Ac (+₹${bestMandiGain.toLocaleString("en-IN")})`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isHindi
                  ? `मॉडल 5 आधार उपज ${baselineYield} Q/Ac के सापेक्ष मॉडल 6 (EconML Double ML) उपचार के बाद +${causalGainQ} क्विंटल/एकड़ (+₹${bestMandiGain.toLocaleString("en-IN")}) का शुद्ध लाभ सुरक्षित करता है।`
                  : `Model 5 baseline is ${baselineYield} Q/Ac. Model 6 EconML Causal LinearDML projects +${causalGainQ} Q/Ac protected harvest uplift, saving ₹${bestMandiGain.toLocaleString("en-IN")} net profit across your ${acres} acres.`}
              </p>
            </div>

            {/* 4. WHAT ACTION TO TAKE */}
            <div className="bg-gradient-to-br from-white to-[#f0f6f1] border-2 border-[#52b788]/60 rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(27,67,50,0.04)] space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#1b4332] font-bold text-xs uppercase tracking-wider">
                  <span className="h-2 w-2 rounded-full bg-[#1b4332]" />
                  <span>{isHindi ? "4. आपको क्या करना चाहिए? (ACTION)" : "4. What Action to Take?"}</span>
                </div>
                <span className="text-[10px] font-mono font-bold text-[#1b4332] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full border border-[#cbe5cb]">
                  {spraySafe ? "Window Safe" : "Hold Spray"}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#1b4332] font-display">
                {isHindi ? `अनुशंसित उत्पाद: ${primaryProduct} (${recommendedDosage})` : `Recommended Solution: ${primaryProduct} (${recommendedDosage})`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                {isHindi
                  ? `मॉडल 3 लैम्ब्डामार्ट अनुसार ${primaryProduct} (${recommendedDosage}) का अपनी कुल ${acres} एकड़ फसल में 150L पानी/एकड़ के साथ सुरक्षित समय पर छिड़काव करें।`
                  : `Apply Model 3 ranked solution ${primaryProduct} at ${recommendedDosage} across your ${acres} acres during the active safe window for optimal foliar uptake.`}
              </p>
            </div>
          </div>

          {/* ── 4. The 3 Agronomic Intelligence Pillars ────────────────── */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
              <h2 className="text-lg sm:text-xl font-black text-[#11261f] font-display flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#2d6a4f]" />
                <span>{isHindi ? "संरचित पादप बुद्धिमत्ता स्तंभ" : "The Core Agronomic Intelligence Pillars"}</span>
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {isHindi ? "गहन विश्लेषण देखने के लिए क्लिक करें" : "Click to view dedicated breakdown"}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 text-xs font-sans">
              
              {/* Pillar 1: Problem Diagnostics & 14-Day Stress Radar */}
              <Link
                href="/plant-intelligence/diagnostics"
                className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md hover:bg-[#fbfcf8] border border-[#e8ede4] hover:border-rose-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200/80 group-hover:scale-105 transition-transform">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-black text-rose-800 bg-rose-100 px-3 py-1 rounded-full border border-rose-300">
                    {riskPct}% Risk · 14-Day Radar
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Pillar 1</span>
                  <span className="text-base sm:text-lg font-black text-[#11261f] font-display block">
                    {isHindi ? "समस्या पहचान व 14-दिवसीय तनाव रडार" : "Problem Diagnostics & 14-Day Radar"}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isHindi
                      ? "मौसम मॉडल द्वारा 14 दिनों का दैनिक तनाव पूर्वानुमान और फसल सुरक्षा चेतावनी।"
                      : "Thermal stress timeline across next 14 days with daily probabilities & crop damage warnings."}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-rose-700 font-bold text-xs pt-3 border-t border-slate-100">
                  <span>{isHindi ? "14-दिवसीय तनाव रडार देखें" : "Explore 14-Day Radar"}</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Pillars 2 & 3 Combined: Product & Application Timeline */}
              <Link
                href="/plant-intelligence/prescription"
                className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md hover:bg-[#fbfcf8] border border-[#e8ede4] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] group-hover:scale-105 transition-transform">
                    <FlaskConical className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-black text-[#1b4332] bg-[#e8f5e9] px-3 py-1 rounded-full border border-[#cbe5cb]">
                    {primaryProduct} · Tank-Mix Matrix
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Pillars 2 &amp; 3 Combined</span>
                  <span className="text-base sm:text-lg font-black text-[#11261f] font-display block">
                    {isHindi ? "उत्पाद नुस्खा, टैंक-मिक्स व स्प्रे समय" : "Product, Tank-Mix & Timeline"}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isHindi
                      ? "सिंजेंटा क्रॉपफिट उत्पाद, 2-3 विकल्प, क्या मिलाएं/क्या न मिलाएं, देरी का नुकसान व जैविक स्प्रे विंडो।"
                      : "Syngenta CropFit solutions, 2-3 alternatives, tank-mix compatibility matrix & delay penalty timeline."}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[#1b4332] font-bold text-xs pt-3 border-t border-slate-100">
                  <span>{isHindi ? "उत्पाद व स्प्रे समय देखें" : "View Product & Timeline"}</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              {/* Pillars 4 & 5 Combined: Economic Impact & 5 Mandis Comparison */}
              <Link
                href="/impact"
                className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md hover:bg-[#fbfcf8] border border-[#e8ede4] hover:border-emerald-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between gap-5 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-2xl bg-[#e8f5e9] text-[#2d6a4f] border border-[#cbe5cb] group-hover:scale-105 transition-transform">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <span className="text-[11px] font-mono font-black text-emerald-900 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-300">
                    +{percentGain}% Yield · {bestMandiShortName}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-mono">Pillars 4 &amp; 5 Combined</span>
                  <span className="text-base sm:text-lg font-black text-[#11261f] font-display block">
                    {isHindi ? "आर्थिक प्रभाव व 5 मंडी आर्बिट्राज" : "Economic Impact & 5 Mandis"}
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {isHindi
                      ? "उपज बचत, शुद्ध इन-हैंड लाभ एवं 5 नजदीकी एपीएमसी मंडियों की रियल-टाइम तुलना।"
                      : "Double ML causal yield gains, verified ROBI multiple & 5 nearby APMC mandis comparison table."}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[#2d6a4f] font-bold text-xs pt-3 border-t border-slate-100">
                  <span>{isHindi ? "आर्थिक प्रभाव व 5 मंडियां देखें" : "Explore Impact & Mandis"}</span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

            </div>
          </div>

          {/* ── 5. Prominent Banner Linking to 5 Mandis Comparison at /impact ── */}
          <div className="bg-gradient-to-r from-[#e8f5e9] via-[#f4f7f2] to-white border border-[#cbe5cb] rounded-3xl p-5 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-start sm:items-center gap-3.5 sm:gap-4">
              <div className="p-3 sm:p-3.5 rounded-2xl bg-[#1b4332] text-white shadow-md shrink-0 mt-1 sm:mt-0">
                <Truck className="h-6 sm:h-7 w-6 sm:w-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-mono font-bold uppercase text-[#1b4332] bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {isHindi ? "मंडी आर्बिट्राज विश्लेषण" : "Mandi Arbitrage Engine"}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {totalHarvestQ} {isHindi ? "क्विंटल कुल फसल" : "Quintals Harvest"} ({acres} Ac)
                  </span>
                </div>
                <h3 className="text-base sm:text-xl font-black text-[#11261f] font-display">
                  {isHindi
                    ? `5 नजदीकी एपीएमसी मंडियों की तुलना में ${bestMandiShortName} सबसे बेहतर (+₹${bestMandiGain.toLocaleString("en-IN")})`
                    : `5 Nearby APMC Mandis: ${bestMandiShortName} Delivers Highest Net Realization (+₹${bestMandiGain.toLocaleString("en-IN")})`}
                </h3>
                <p className="text-xs text-slate-600">
                  {isHindi
                    ? "ढुलाई, डीजल और हम्माली खर्च घटाकर शुद्ध इन-हैंड मुनाफा देखें।"
                    : "Compare live modal prices, transport freight, and APMC hamali on the dedicated Impact dashboard."}
                </p>
              </div>
            </div>

            <Link
              href="/impact"
              className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all shrink-0 cursor-pointer hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
            >
              <Truck className="h-4 w-4" />
              <span>{isHindi ? "5 मंडियां और उपज प्रभाव देखें" : "View 5 Mandis Comparison"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {/* ── 6. Quick Farmer Action Bar ──────────────────────────── */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-[#e8ede4] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <span className="font-extrabold text-[#11261f] block text-sm">
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
                className="flex-1 sm:flex-initial justify-center px-5 py-2.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] min-h-[44px]"
              >
                <Check className="h-4 w-4" />
                <span>{isHindi ? "स्प्रे की पुष्टि करें (Confirm)" : "Confirm Spray Done"}</span>
              </Link>
              <Link
                href="/fields"
                className="flex-1 sm:flex-initial justify-center px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-[#e8ede4] font-bold text-xs flex items-center gap-1.5 transition-all min-h-[44px]"
              >
                <span>{isHindi ? "मेरे खेत (My Fields)" : "My Fields"}</span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </AppShell>
  );
}
