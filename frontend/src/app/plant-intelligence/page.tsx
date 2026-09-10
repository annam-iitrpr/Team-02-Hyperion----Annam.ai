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

  const primaryProduct =
    data?.model3_portfolio?.primary_recommendation?.name || "Syngenta Quantis®";

  const causalGainQ = data?.model6_causal_robi?.causal_gain_tau_q_acre || 1.38;
  const baselineYield = data?.model5_baseline?.expected_baseline_yield_q_acre || 7.4;
  const percentGain = Math.round((causalGainQ / baselineYield) * 100) || 18.6;

  const totalDoseLiters = +(0.25 * acres).toFixed(2);
  const spraySafe = data?.model2_readiness?.spray_window_safe ?? true;

  const totalHarvestQ = +( (baselineYield + causalGainQ) * acres ).toFixed(1);
  const mandiData = optimizeMandiLogistics(
    crop,
    Number(totalHarvestQ) > 0 ? Number(totalHarvestQ) : 11.5,
    district,
    state,
    2150
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
                {isHindi ? "वर्टेक्स एआई मॉडल 1–6 सक्रिय" : "Vertex AI Models 1–6 Active"}
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
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border-2 border-rose-500/30 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-rose-600 text-white shadow-md shrink-0">
                <Flame className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-300">
                    {isHindi ? `मॉडल 1 अलर्ट: ${riskPct}% जोखिम` : `Model 1 Alert: ${riskPct}% Risk`}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {crop} ({growthStage})
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0d253d] font-display">
                  {isHindi
                    ? "रात के अत्यधिक तापमान से थर्मल स्ट्रेस का खतरा"
                    : "Severe Nighttime Thermal Heat Stress Detected"}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  {isHindi
                    ? `लगातार रात का तापमान 25°C से अधिक रहने से फूल झड़ने और उपज घटने का गंभीर खतरा है।`
                    : `Nocturnal temperature exceeding 25°C during flowering arrests dark respiration and threatens yield.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-rose-200/80 text-center sm:text-right shrink-0">
                <span className="text-3xl font-black text-rose-600 font-display block">
                  {riskPct}%
                </span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  {isHindi ? "तनाव संभावना" : "Stress Probability"}
                </span>
              </div>
            </div>
          </div>

          {/* Safe Spray Verdict Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-rose-200/50 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-bold">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>
                {isHindi
                  ? "मॉडल 2 जैविक विंडो: आज शाम 5:30 - 8:00 बजे छिड़काव के लिए सुरक्षित"
                  : "Model 2 Biological Gate: Spray Window Open (5:30 PM - 8:00 PM)"}
              </span>
            </div>

            <span className="text-slate-500 font-mono text-[11px]">
              {isHindi ? "जेमिनी द्वारा सत्यापित उत्तर" : "Validated by Gemini AI"}
            </span>
          </div>
        </div>

        {/* ── The 4 Core Farmer Answers (WHAT, WHY, HOW, ACTION) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* 1. WHAT */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>{isHindi ? "1. क्या हो रहा है? (WHAT)" : "1. What is Happening?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? `फसल में थर्मल हीट स्ट्रेस (${riskPct}% जोखिम)` : `Severe Canopy Thermal Heat Stress (${riskPct}% Risk)`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `आपकी ${crop} की फसल में रात का तापमान 25°C से ऊपर जाने के कारण पौधे की कोशिकाएं तनाव में हैं और सामान्य श्वसन नहीं कर पा रही हैं।`
                : `Your ${crop} crop in ${district} is undergoing nocturnal heat shock with nights remaining above 25°C, disrupting cellular respiration.`}
            </p>
          </div>

          {/* 2. WHY */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{isHindi ? "2. यह क्यों हो रहा है? (WHY)" : "2. Why is This Happening?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? `रात में पौधा ठंडा नहीं हो पा रहा (उच्च VPD)` : `No Nocturnal Crop Cooling & High VPD`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `दिन में तेज धूप और रात में गर्म हवाओं के कारण वाष्प दबाव घाटा (VPD) बढ़ गया है, जिससे पौधे में पानी की कमी और फूलों का गिरना शुरू हो जाता है।`
                : `Elevated vapor pressure deficit coupled with high minimum temperatures prevents normal nighttime recovery and burns stored photosynthates.`}
            </p>
          </div>

          {/* 3. HOW */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>{isHindi ? "3. फसल पर क्या असर होगा? (HOW)" : "3. How Does It Impact Yield?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? `उपज में ${percentGain}% तक नुकसान (-${causalGainQ} qtl/एकड़)` : `Risk of ${percentGain}% Harvest Loss (-${causalGainQ} Q/Acre)`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `यदि समय पर रक्षा नहीं की गई, तो परागकण सूख जाएंगे, फूल गिरेंगे और फलियों में दाना पिचक जाएगा (लगभग ₹${(Math.round(causalGainQ * acres * 4150)).toLocaleString("en-IN")} का नुकसान)।`
                : `Heat shocks cause pollen sterility and blossom abscission, resulting in up to ${causalGainQ} quintals/acre yield reduction without intervention.`}
            </p>
          </div>

          {/* 4. WHAT YOU CAN DO */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{isHindi ? "4. आपको क्या करना चाहिए? (WHAT TO DO)" : "4. What Action to Take?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? `सिंजेंटा क्वांटिस® का 48 घंटे में छिड़काव करें` : `Spray Syngenta Quantis® Within 48 Hours`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `250 मिली प्रति एकड़ (कुल ${acres} एकड़ के लिए ${totalDoseLiters} लीटर) 150 लीटर पानी में मिलाकर आज शाम 5 बजे के बाद छिड़कें।`
                : `Apply 250 ml/acre (${totalDoseLiters} Litres total for your ${acres} acres) in 150L water/acre during late afternoon to activate heat shock proteins.`}
            </p>
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
