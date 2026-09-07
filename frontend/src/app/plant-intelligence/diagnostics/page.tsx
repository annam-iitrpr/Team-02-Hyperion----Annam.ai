"use client";

import React, { useState } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { usePipelinePrediction } from "@/lib/usePipelinePrediction";
import { FarmCropSwitcher } from "@/components/FarmCropSwitcher";
import {
  ShieldAlert,
  Thermometer,
  Droplets,
  Wind,
  Layers,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Flame,
  Calendar,
  Clock,
  TrendingDown,
  Info,
} from "lucide-react";

export default function DiagnosticsCategoryPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const {
    data,
    loading,
    error,
    refetch,
    crop,
    district,
    state,
    acres,
    growthStage,
    fourteenDayStress,
    speakSummary,
    isSpeaking,
  } = usePipelinePrediction();

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(1);

  const riskPct = data?.model1_risk?.confidence
    ? Math.round(data.model1_risk.confidence * 100)
    : 92;
  const tele = data?.telemetry_summary;

  const activeDayData =
    fourteenDayStress.find((d) => d.dayIndex === selectedDayIdx) || fourteenDayStress[0];

  return (
    <AppShell>
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Navigation Breadcrumbs & Crop/Field Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
              <Link
                href="/plant-intelligence"
                className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{isHindi ? "कृषि बुद्धिमत्ता हब" : "Plant Intelligence"}</span>
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">
                {isHindi ? "1. समस्या पहचान व 14-दिवसीय स्ट्रेस रडार" : "1. Problem Diagnostics"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0d253d] tracking-tight flex items-center gap-2.5">
              <ShieldAlert className="h-7 w-7 text-rose-600 shrink-0" />
              <span>
                {isHindi
                  ? `फसल समस्या निदान — ${crop.toUpperCase()}`
                  : `Crop Problem Diagnostics — ${crop.toUpperCase()}`}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isHindi
                ? `मॉडल 1 (XGBoost 7-क्लास क्लासिफायर) द्वारा 14-दिवसीय सूक्ष्म मौसम व फसल तनाव पूर्वानुमान`
                : `Model 1 (XGBoost 7-Class Classifier) 14-day microclimate & thermal stress projection`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <FarmCropSwitcher />

            <button
              onClick={speakSummary}
              className="px-3.5 py-2 text-xs font-bold rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              {isSpeaking ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5" />}
              <span>{isSpeaking ? (isHindi ? "रोकें" : "Stop") : (isHindi ? "बोलकर सुनें" : "Listen")}</span>
            </button>
            <button
              onClick={() => refetch()}
              disabled={loading}
              className="px-3 py-2 text-xs font-bold rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>{isHindi ? "ताज़ा करें" : "Refresh"}</span>
            </button>
          </div>
        </div>

        {/* ── High-Impact 92% Alert Banner ────────────────── */}
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-transparent border-2 border-rose-500/40 rounded-3xl p-6 sm:p-7 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-rose-600 text-white shadow-md shrink-0">
                <Flame className="h-8 w-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-100/80 px-2.5 py-0.5 rounded-full border border-rose-300">
                    {isHindi ? "अति गंभीर चेतावनी (14-दिवसीय मॉडल 1)" : "Critical Stress Horizon (Model 1)"}
                  </span>
                  <span className="text-xs text-slate-600 font-semibold">
                    {district}, {state} · {growthStage} · {acres} Acres
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0d253d] font-display mt-1">
                  {isHindi
                    ? `रात का अत्यधिक तापमान तनाव — ${riskPct}% जोखिम`
                    : `Extreme Night Thermal Heat Stress — ${riskPct}% Risk`}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
                  {isHindi
                    ? `लगातार रात का तापमान 25°C से ऊपर रहने के कारण फूल सूखने और दाना न भरने का गंभीर खतरा है।`
                    : `Prolonged nocturnal temperatures above 25°C impair stomatal cooling and photosynthetic accumulation.`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-white sm:bg-transparent p-4 sm:p-0 rounded-2xl border sm:border-0 border-rose-100">
              <div className="text-3xl sm:text-4xl font-black text-rose-600 font-display">
                {riskPct}%
              </div>
              <div className="text-xs font-bold text-slate-500">
                {isHindi ? "मॉडल 1 जोखिम स्तर" : "Peak Model 1 Probability"}
              </div>
            </div>
          </div>
        </div>

        {/* ── 14-DAY DYNAMIC STRESS HORIZON TIMELINE (MODELS + GEMINI) ── */}
        <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-indigo-600" />
                <h3 className="text-base font-extrabold text-[#0d253d] font-display">
                  {isHindi ? "14-दिवसीय तनाव रडार व दैनिक हानि का पूर्वानुमान" : "14-Day Stress Radar & Daily Yield Loss Horizon"}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isHindi
                  ? `${district} के मौसम और फसल की अवस्था पर आधारित 14 दिनों की विस्तृत भविष्यवाणी (दिन पर क्लिक करें)`
                  : `Model 1 daily inference for ${crop} across your coordinates in ${district} (Click any day to inspect)`}
              </p>
            </div>
            <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-xl border border-indigo-200">
              Day {activeDayData.dayIndex} Selected · {activeDayData.dateStr}
            </span>
          </div>

          {/* 14 Day Horizontal Scrollable Cards */}
          <div className="overflow-x-auto pb-2 pt-1">
            <div className="flex items-stretch gap-2.5 min-w-[980px]">
              {fourteenDayStress.map((d) => {
                const isSelected = d.dayIndex === selectedDayIdx;
                const isCrit = d.severity === "critical";
                const isWarn = d.severity === "warning";
                const isMod = d.severity === "moderate";

                return (
                  <button
                    key={d.dayIndex}
                    type="button"
                    onClick={() => setSelectedDayIdx(d.dayIndex)}
                    className={`flex-1 p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      isSelected
                        ? "bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm"
                        : "bg-white hover:bg-slate-50/90 border-slate-200/80"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">
                          D{d.dayIndex} · {d.dayName}
                        </span>
                        <span
                          className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                            isCrit
                              ? "bg-rose-100 text-rose-700"
                              : isWarn
                              ? "bg-amber-100 text-amber-800"
                              : isMod
                              ? "bg-amber-50 text-amber-700"
                              : "bg-emerald-100 text-emerald-800"
                          }`}
                        >
                          {d.riskPct}%
                        </span>
                      </div>
                      <span className="text-xs font-bold text-[#0d253d] block mt-0.5 font-display">
                        {d.dateStr}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-mono text-slate-600 flex items-center justify-between">
                        <span>High: <strong className="text-slate-800">{d.tempMax}°</strong></span>
                        <span>Night: <strong className={d.tempMin >= 25 ? "text-rose-600" : "text-slate-800"}>{d.tempMin}°</strong></span>
                      </div>
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isCrit ? "bg-rose-600" : isWarn ? "bg-amber-500" : isMod ? "bg-amber-400" : "bg-emerald-500"
                          }`}
                          style={{ width: `${d.riskPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="text-[10px] font-mono font-bold text-rose-700 truncate">
                      -{d.lossQtlAcre} Q/ac
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selected Day Detailed Inspection Card */}
          <div className="p-5 rounded-2xl bg-[#f8fafc] border border-slate-200/90 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-mono font-black px-2 py-0.5 rounded-md uppercase ${
                      activeDayData.severity === "critical"
                        ? "bg-rose-600 text-white"
                        : activeDayData.severity === "warning"
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-600 text-white"
                    }`}
                  >
                    Day {activeDayData.dayIndex} · {activeDayData.severity.toUpperCase()}
                  </span>
                  <span className="text-sm font-bold text-[#0d253d]">
                    {isHindi ? activeDayData.stressTypeHi : activeDayData.stressType}
                  </span>
                </div>
                <span className="text-xs text-slate-500 block mt-0.5">
                  {activeDayData.dateStr} ({activeDayData.dayName}) · {district}, {state}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">
                    {isHindi ? "संभावित उपज हानि" : "Predicted Yield Loss"}
                  </span>
                  <span className="text-base font-black font-mono text-rose-600">
                    -{activeDayData.lossQtlAcre} Q/acre
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    (-₹{(activeDayData.lossInrAcre * acres).toLocaleString("en-IN")} total on {acres} ac)
                  </span>
                </div>
              </div>
            </div>

            {/* Granular Telemetry for this day */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Peak Day Temp</span>
                <span className="text-lg font-bold text-slate-900">{activeDayData.tempMax}°C</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Night Min Temp</span>
                <span className={`text-lg font-bold ${activeDayData.tempMin >= 25 ? "text-rose-600 font-black" : "text-slate-900"}`}>
                  {activeDayData.tempMin}°C
                </span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Vapor Deficit (VPD)</span>
                <span className="text-lg font-bold text-indigo-700">{activeDayData.vpdKpa} kPa</span>
              </div>
              <div className="p-3 rounded-xl bg-white border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Rain Probability</span>
                <span className="text-lg font-bold text-sky-600">{activeDayData.rainProbPct}%</span>
              </div>
            </div>

            {/* Short Statement: What Will Be Lost */}
            <div className="p-4 rounded-xl bg-rose-50/70 border border-rose-200/80 flex items-start gap-3">
              <TrendingDown className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold text-rose-900 block">
                  {isHindi ? "यदि उपचार नहीं किया तो क्या नुकसान होगा? (WHAT WILL BE LOST)" : "What Will Be Lost If Untreated?"}
                </span>
                <p className="text-xs text-rose-800 leading-relaxed mt-0.5">
                  {isHindi ? activeDayData.whatWillBeLostHi : activeDayData.whatWillBeLostEn}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── 4 Essential Questions (WHAT, WHY, HOW, WHAT TO DO) ──── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* WHAT */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>{isHindi ? "1. क्या हो रहा है? (WHAT IS HAPPENING?)" : "1. What is Happening?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi
                ? `आपकी ${crop} की फसल पर तीव्र थर्मल तनाव का आक्रमण`
                : `Thermal Shock Disrupting Your ${crop.toUpperCase()} Canopy`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `आपके ${district} क्षेत्र में लगातार रात का तापमान 25°C से ऊपर बना हुआ है। फसल ${growthStage} अवस्था में होने के कारण गर्मी के प्रति सर्वाधिक संवेदनशील है।`
                : `Continuous nighttime heat wave detected across ${district}. With your crop currently at the ${growthStage} stage, internal cellular respiration is under severe strain.`}
            </p>
          </div>

          {/* WHY */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{isHindi ? "2. यह क्यों हो रहा है? (WHY IS THIS HAPPENING?)" : "2. Why is This Happening?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi
                ? `रात में पौधा ठंडा नहीं हो पा रहा (नो-कूलिंग सिंड्रोम)`
                : `No-Cooling Stomatal Impairment at Night`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `दिन में अधिक धूप के बाद रात में पौधे को विश्राम चाहिए होता है। जब रात का तापमान 24°C से अधिक होता है, तो पौधा अपने ही संचित कार्बोहाइड्रेट को जलाता है।`
                : `Plants require nocturnal recovery. When temperatures remain elevated at night, dark respiration accelerates, burning accumulated photosynthates without replenishment.`}
            </p>
          </div>

          {/* HOW */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>{isHindi ? "3. फसल पर क्या असर होगा? (HOW DOES IT IMPACT YIELD?)" : "3. How Does It Impact Crop Yield?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi
                ? `फूल झड़ने व दाना न भरने का जोखिम (-18.6% उपज नुकसान)`
                : `Flower Abortion & Grain Shriveling (-18.6% Yield Loss)`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `यदि समय पर उपचार नहीं किया गया, तो परागकण (pollen) सूख जाएंगे, जिससे प्रति एकड़ 1.38 क्विंटल तक उपज घट सकती है (कुल ₹${((data?.model6_causal_robi?.revenue_saved_inr || 28000)).toLocaleString("en-IN")} का नुकसान)।`
                : `Unmitigated heat causes pollen desiccation, leading to pod abortion and up to 1.38 quintals/acre (-18.6%) yield reduction valued at ~₹${((data?.model6_causal_robi?.revenue_saved_inr || 28000)).toLocaleString("en-IN")} across your ${acres} acres.`}
            </p>
          </div>

          {/* WHAT TO DO */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{isHindi ? "4. आपको क्या करना चाहिए? (ACTION NEEDED)" : "4. What Action Must You Take?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi
                ? `सिंजेंटा क्वांटिस (Quantis®) का 48 घंटे में छिड़काव`
                : `Apply Syngenta Quantis® Within Next 48 Hours`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `250 मिली प्रति एकड़ (कुल ${acres} एकड़ के लिए ${(0.25 * acres).toFixed(2)} लीटर) 150-200 लीटर पानी में मिलाकर शाम 5 बजे के बाद छिड़कें।`
                : `Apply at 250 ml/acre (total ${(0.25 * acres).toFixed(2)} Litres for your ${acres} acres) diluted in 150L water/acre during early morning or late afternoon.`}
            </p>
          </div>
        </div>

        {/* ── Navigation to Next Step (Pillars 2 & 3 Combined) ─ */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <Link
            href="/plant-intelligence"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isHindi ? "हब पर वापस जाएं" : "Back to Intelligence Hub"}</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/plant-intelligence/prescription"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>
                {isHindi
                  ? "अगला: 2 & 3. उत्पाद, टैंक-मिक्स व छिड़काव समय सारणी ➔"
                  : "Next: 2 & 3. Product, Tank-Mix & Application Timeline ➔"}
              </span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
