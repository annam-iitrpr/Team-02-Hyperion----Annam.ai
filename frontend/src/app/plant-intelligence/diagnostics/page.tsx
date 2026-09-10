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
  MapPin,
  Sprout,
  Cloud,
  X,
  Check,
  ExternalLink,
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
  const [isDayModalOpen, setIsDayModalOpen] = useState<boolean>(false);
  const [isDaySpeaking, setIsDaySpeaking] = useState<boolean>(false);

  const riskPct = data?.model1_risk?.confidence
    ? Math.round(data.model1_risk.confidence * 100)
    : 73;
  const stressType = data?.model1_risk?.stress_type || "Optimal / No Severe Stress";
  const tele = data?.telemetry_summary;

  const activeDayData =
    fourteenDayStress.find((d) => d.dayIndex === selectedDayIdx) || fourteenDayStress[0];

  const lossInr = Math.round((activeDayData?.lossInrAcre || 0) * acres);

  const speakDayAdvisory = (day: typeof activeDayData) => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    if (isDaySpeaking) {
      window.speechSynthesis.cancel();
      setIsDaySpeaking(false);
      return;
    }

    const isSafe = day.lossQtlAcre === 0;
    const msg = isHindi
      ? `दिन ${day.dayIndex}, ${day.dateStr} का मौसम विश्लेषण। ${day.stressTypeHi}। अधिकतम तापमान ${day.tempMax} डिग्री, रात का न्यूनतम तापमान ${day.tempMin} डिग्री। ${
          isSafe
            ? "मौसम पूरी तरह अनुकूल और सुरक्षित है। फसल को कोई नुकसान नहीं होगा।"
            : `फूल झड़ने व श्वसन जलने से लगभग ${day.lossQtlAcre} क्विंटल प्रति एकड़ के नुकसान का जोखिम है, जिससे आपके खेत में लगभग ₹${lossInr.toLocaleString("en-IN")} का नुकसान हो सकता है। शाम 5 बजे के बाद सिंजेंटा क्वांटिस का छिड़काव करें।`
        }`
      : `Day ${day.dayIndex}, ${day.dateStr} weather and stress report. ${day.stressType}. Peak day temperature is ${day.tempMax} degrees, night minimum is ${day.tempMin} degrees. ${
          isSafe
            ? "Weather is safe with zero yield loss expected."
            : `Risk of ${day.lossQtlAcre} quintals per acre loss due to nocturnal heat. Total field loss is estimated at ₹${lossInr.toLocaleString("en-IN")}. Apply Syngenta Quantis in the late evening.`
        }`;

    const utt = new SpeechSynthesisUtterance(msg);
    utt.lang = isHindi ? "hi-IN" : "en-IN";
    utt.rate = 0.95;
    utt.onend = () => setIsDaySpeaking(false);
    utt.onerror = () => setIsDaySpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utt);
    setIsDaySpeaking(true);
  };

  const handleDayCardClick = (dayIndex: number) => {
    setSelectedDayIdx(dayIndex);
    setIsDayModalOpen(true);
  };

  return (
    <AppShell>
      {/* ── Outer Canvas with Exact Dashboard Dot Matrix Theme ────── */}
      <div className="relative min-h-screen bg-[#fbfcf8] bg-[radial-gradient(#1b4332_0.75px,transparent_0.75px)] [background-size:24px_24px] [background-position:0_0] text-slate-800 pb-24 md:pb-12">
        <div className="max-w-[1240px] w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-10 space-y-5 sm:space-y-8 font-sans">
          
          {/* Navigation Breadcrumbs & Crop/Field Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border-b border-[#e8ede4] pb-5 sm:pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 font-medium flex-wrap">
                <Link
                  href="/plant-intelligence"
                  className="hover:text-[#1b4332] flex items-center gap-1 transition-colors text-slate-600 font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{isHindi ? "पादप स्वास्थ्य हब" : "Plant Intelligence"}</span>
                </Link>
                <span>/</span>
                <span className="text-[#11261f] font-bold">
                  {isHindi ? "1. समस्या पहचान व 14-दिवसीय रडार" : "1. Problem Diagnostics & 14-Day Radar"}
                </span>
              </div>
              
              <h1 className="text-2xl sm:text-4xl font-black font-display text-[#11261f] tracking-tight flex items-center gap-2.5">
                <ShieldAlert className="h-7 w-7 text-rose-600 shrink-0" />
                <span>
                  {isHindi
                    ? `फसल समस्या निदान — ${crop}`
                    : `Crop Problem Diagnostics — ${crop}`}
                </span>
              </h1>

              {/* Grounding Chips Strip */}
              <div className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2 flex-wrap pt-1">
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#e8ede4] text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                  <span>{district}{state ? `, ${state}` : ""}, India</span>
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
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-[#e8f5e9] px-2.5 py-1 rounded-full border border-[#cbe5cb] flex items-center gap-1">
                  <Cloud className="h-3 w-3 text-emerald-700 shrink-0" />
                  <span>{data?.execution_source || "Vertex AI Cloud (asia-south1, iitm01) · Model 1 Active"}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap self-start sm:self-auto">
              <FarmCropSwitcher allowRegister={false} />

              <button
                type="button"
                onClick={speakSummary}
                className="px-3.5 py-2.5 text-xs font-bold rounded-2xl border border-[#cbe5cb] bg-[#e8f5e9] hover:bg-[#d8edd9] text-[#1b4332] transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs min-h-[40px]"
              >
                {isSpeaking ? <VolumeX className="h-4 w-4 text-rose-600" /> : <Volume2 className="h-4 w-4 text-[#2d6a4f]" />}
                <span>{isSpeaking ? (isHindi ? "रोकें" : "Stop") : (isHindi ? "बोलकर सुनें" : "Listen")}</span>
              </button>

              <button
                type="button"
                onClick={() => refetch()}
                disabled={loading}
                className="p-2.5 text-xs font-bold rounded-2xl border border-[#e8ede4] bg-white hover:bg-[#f0f5ee] text-slate-700 transition-all flex items-center justify-center cursor-pointer shadow-2xs disabled:opacity-50 min-h-[40px] min-w-[40px]"
                title="Refresh Pipeline Inference"
                aria-label="Refresh Pipeline Inference"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin text-[#2d6a4f]" : "text-[#2d6a4f]"}`} />
              </button>
            </div>
          </div>

          {/* ── REAL-TIME MODEL 1 RISK BANNER ── */}
          <div className="bg-gradient-to-r from-rose-50/80 via-white to-amber-50/60 border border-rose-200/80 rounded-3xl p-5 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="p-3 rounded-2xl bg-rose-600 text-white shrink-0 shadow-sm mt-0.5">
                  <Flame className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
                      MODEL 1 HORIZON FORECAST (XGBOOST)
                    </span>
                    <span className="text-xs text-slate-500 font-mono font-medium">
                      {district}, {crop} &middot; {acres} Acres
                    </span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-[#11261f] font-display">
                    {stressType} &mdash; {riskPct}% Confidence
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
                    {isHindi
                      ? data?.gemini_statement?.statement_hi ||
                        `आपके ${acres} एकड़ ${crop} के खेत में मॉडल 1 के अनुसार थर्मल तनाव का अनुमान लगाया गया है। रात के तापमान व आर्द्रता के आधार पर फसल की सुरक्षा हेतु समय पर कदम उठाएं।`
                      : data?.gemini_statement?.statement_en ||
                        `Model 1 predicts ${stressType} on your ${acres} acre ${crop} field in ${district}. Nocturnal degrees and biophysical gates are being monitored in real time.`}
                  </p>
                </div>
              </div>

              <div className="bg-white/90 border border-slate-200 rounded-2xl p-4 sm:px-6 sm:py-4 text-center shrink-0 min-w-[150px] shadow-2xs">
                <div className="text-3xl sm:text-4xl font-mono font-black text-rose-600">
                  {riskPct}%
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">
                  {isHindi ? "मॉडल 1 जोखिम स्तर" : "Peak Model 1 Probability"}
                </div>
              </div>
            </div>
          </div>

          {/* ── 14-DAY DYNAMIC STRESS HORIZON TIMELINE ── */}
          <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-7 shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8ede4] pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-[#2d6a4f]" />
                  <h3 className="text-lg sm:text-xl font-extrabold text-[#11261f] font-display">
                    {isHindi ? "14-दिवसीय तनाव रडार व दैनिक फसल स्थिति" : "14-Day Stress Radar & Daily Crop Condition"}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-1 font-medium">
                  {isHindi
                    ? `${district} के मौसम और फसल की अवस्था पर आधारित 14 दिनों की स्थिति। किसी भी दिन पर क्लिक करके विस्तृत पॉप-अप रिपोर्ट देखें।`
                    : `Model 1 daily inference for ${crop} across your coordinates in ${district}. Click any day card to open full pop-up inspection.`}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-600 bg-[#f4f7f2] px-3 py-1.5 rounded-xl border border-[#e8ede4] flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  <span>Day {activeDayData.dayIndex} Active &middot; {activeDayData.dateStr}</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsDayModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  <span>{isHindi ? "पॉप-अप देखें" : "Pop-up Report"}</span>
                </button>
              </div>
            </div>

            {/* 14 Day Horizontal Scrollable Cards */}
            <div className="overflow-x-auto pb-3 pt-1">
              <div className="flex items-stretch gap-3 min-w-[1280px]">
                {fourteenDayStress.map((d) => {
                  const isSelected = d.dayIndex === selectedDayIdx;
                  const isSafe = d.severity === "safe" || d.lossQtlAcre === 0;
                  const isCrit = d.severity === "critical";
                  const isWarn = d.severity === "warning";

                  return (
                    <button
                      key={d.dayIndex}
                      type="button"
                      onClick={() => handleDayCardClick(d.dayIndex)}
                      className={`w-[124px] min-w-[124px] p-3 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-2.5 hover:-translate-y-1 hover:shadow-md ${
                        isSelected
                          ? "bg-[#e8f5e9] border-[#2d6a4f] ring-2 ring-[#2d6a4f]/30 shadow-md scale-[1.02]"
                          : "bg-white hover:bg-[#fbfcf8] border-[#e8ede4]"
                      }`}
                      title={isHindi ? "विस्तृत पॉप-अप रिपोर्ट के लिए क्लिक करें" : "Click to open full day inspection pop-up"}
                    >
                      {/* Top Row: Day Pill & Risk % */}
                      <div>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-slate-500 uppercase">
                            D{d.dayIndex} &middot; {d.dayName}
                          </span>
                          <span
                            className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded-md ${
                              isSafe
                                ? "bg-emerald-100 text-emerald-800"
                                : isCrit
                                ? "bg-rose-100 text-rose-700"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {d.riskPct}%
                          </span>
                        </div>
                        <span className="text-xs font-bold text-[#11261f] block mt-1 font-display">
                          {d.dateStr}
                        </span>
                      </div>

                      {/* Clean 2-Column Temperature Box (Never wraps) */}
                      <div className="grid grid-cols-2 gap-1 text-[10px] font-mono bg-slate-50 rounded-xl p-1.5 border border-slate-100">
                        <div>
                          <span className="text-[8px] text-slate-400 font-semibold block uppercase">Day</span>
                          <span className="font-bold text-slate-800">{d.tempMax}&deg;</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] text-slate-400 font-semibold block uppercase">Night</span>
                          <span className={`font-bold ${d.tempMin >= 25 ? "text-rose-600 font-black" : "text-slate-800"}`}>
                            {d.tempMin}&deg;
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isSafe ? "bg-emerald-500" : isCrit ? "bg-rose-600" : isWarn ? "bg-amber-500" : "bg-amber-400"
                          }`}
                          style={{ width: `${Math.max(12, d.riskPct)}%` }}
                        />
                      </div>

                      {/* Easy Farmer Language Loss Status */}
                      <div className="pt-0.5 space-y-0.5">
                        {isSafe ? (
                          <div className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-1.5 py-0.5 rounded-md flex items-center justify-center gap-1">
                            <Check className="h-3 w-3 text-emerald-600 shrink-0" />
                            <span>{isHindi ? "सुरक्षित (0 हानि)" : "Safe (0 Loss)"}</span>
                          </div>
                        ) : (
                          <div className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center justify-center gap-1 ${
                            isCrit
                              ? "text-rose-700 bg-rose-50 border border-rose-200"
                              : "text-amber-800 bg-amber-50 border border-amber-200"
                          }`}>
                            <AlertTriangle className="h-3 w-3 shrink-0" />
                            <span>{isHindi ? `-${d.lossQtlAcre} क्विंटल` : `Risk: ${d.lossQtlAcre} Q`}</span>
                          </div>
                        )}
                        <div className="text-[9px] text-center text-slate-400 font-medium">
                          {isSafe ? (isHindi ? "सामान्य फसल" : "Normal Crop") : `₹${d.lossInrAcre.toLocaleString("en-IN")}/ac`}
                        </div>
                      </div>

                      <div className="text-[9px] text-center text-[#2d6a4f] font-semibold border-t border-slate-100 pt-1">
                        {isHindi ? "पॉप-अप ↗" : "Pop-up ↗"}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Selected Day Detailed Inline Card */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#fbfcf8] border border-[#e8ede4] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e8ede4] pb-4">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-mono font-black px-2.5 py-0.5 rounded-md uppercase ${
                        activeDayData.severity === "safe" || activeDayData.lossQtlAcre === 0
                          ? "bg-emerald-600 text-white"
                          : activeDayData.severity === "critical"
                          ? "bg-rose-600 text-white"
                          : "bg-amber-500 text-white"
                      }`}
                    >
                      Day {activeDayData.dayIndex} &middot; {activeDayData.severity.toUpperCase()}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#11261f]">
                      {isHindi ? activeDayData.stressTypeHi : activeDayData.stressType}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 block mt-1">
                    {activeDayData.dateStr} ({activeDayData.dayName}) &middot; {district}, {state}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      {isHindi ? "संभावित उपज स्थिति" : "Yield Impact"}
                    </span>
                    {activeDayData.lossQtlAcre === 0 ? (
                      <span className="text-base font-black font-mono text-emerald-700">
                        {isHindi ? "0 नुकसान (सुरक्षित फसल)" : "0 Loss (Safe Crop)"}
                      </span>
                    ) : (
                      <>
                        <span className="text-base font-black font-mono text-rose-600">
                          -{activeDayData.lossQtlAcre} Q/acre
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono block">
                          (-₹{lossInr.toLocaleString("en-IN")} total on {acres} ac)
                        </span>
                      </>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsDayModalOpen(true)}
                    className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] font-bold text-xs flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                  >
                    <ExternalLink className="h-3.5 w-3.5 text-[#2d6a4f]" />
                    <span>{isHindi ? "पॉप-अप खोलें" : "Open Pop-up"}</span>
                  </button>
                </div>
              </div>

              {/* Granular Telemetry for this day */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
                <div className="p-3.5 rounded-xl bg-white border border-[#e8ede4]">
                  <span className="text-[10px] text-slate-400 block uppercase">Peak Day Temp</span>
                  <span className="text-lg font-bold text-slate-900">{activeDayData.tempMax}&deg;C</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#e8ede4]">
                  <span className="text-[10px] text-slate-400 block uppercase">Night Min Temp</span>
                  <span className={`text-lg font-bold ${activeDayData.tempMin >= 25 ? "text-rose-600 font-black" : "text-slate-900"}`}>
                    {activeDayData.tempMin}&deg;C
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#e8ede4]">
                  <span className="text-[10px] text-slate-400 block uppercase">Vapor Deficit (VPD)</span>
                  <span className="text-lg font-bold text-[#1b4332]">{activeDayData.vpdKpa} kPa</span>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#e8ede4]">
                  <span className="text-[10px] text-slate-400 block uppercase">Rain Probability</span>
                  <span className="text-lg font-bold text-sky-600">{activeDayData.rainProbPct}%</span>
                </div>
              </div>

              {/* Short Statement: What Will Be Lost in Easy Language */}
              <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                activeDayData.lossQtlAcre === 0
                  ? "bg-[#e8f5e9]/70 border-[#cbe5cb]"
                  : "bg-rose-50/70 border-rose-200/80"
              }`}>
                {activeDayData.lossQtlAcre === 0 ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <TrendingDown className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <span className={`text-xs font-bold block ${
                    activeDayData.lossQtlAcre === 0 ? "text-emerald-900" : "text-rose-900"
                  }`}>
                    {isHindi
                      ? "फसल पर प्रभाव (आसान भाषा में)"
                      : "Crop Impact & Biological Status (Easy Farmer Language)"}
                  </span>
                  <p className={`text-xs leading-relaxed mt-0.5 ${
                    activeDayData.lossQtlAcre === 0 ? "text-emerald-800" : "text-rose-800"
                  }`}>
                    {isHindi ? activeDayData.whatWillBeLostHi : activeDayData.whatWillBeLostEn}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── 4 Essential Questions (WHAT, WHY, HOW, WHAT TO DO) ──── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {/* WHAT */}
            <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-2.5">
              <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                <span>{isHindi ? "1. क्या हो रहा है? (WHAT IS HAPPENING?)" : "1. What is Happening?"}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#11261f] font-display">
                {isHindi
                  ? `आपकी ${crop} की फसल पर स्थिति: ${stressType}`
                  : `Model 1 Detection: ${stressType} (${riskPct}%)`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isHindi
                  ? `आपके ${district} क्षेत्र में फसल ${growthStage} अवस्था में है। मॉडल 1 के अनुसार बायोफिजिकल पैरामीटर्स का सतत परीक्षण जारी है।`
                  : `Real-time biometeorological sensors across ${district} monitor cellular respiration balance for your ${crop} crop currently in ${growthStage} stage.`}
              </p>
            </div>

            {/* WHY */}
            <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-2.5">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
                <span>{isHindi ? "2. यह क्यों हो रहा है? (WHY IS THIS HAPPENING?)" : "2. Why is This Happening?"}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#11261f] font-display">
                {isHindi
                  ? `सूक्ष्म-जलवायु व वाष्प दबाव असंतुलन (${activeDayData.vpdKpa} kPa)`
                  : `Microclimate & Atmospheric VPD Imbalance (${activeDayData.vpdKpa} kPa)`}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isHindi
                  ? `दिन का तापमान ${activeDayData.tempMax}°C और रात का तापमान ${activeDayData.tempMin}°C रहने से पौधों के रंध्र बंद हो जाते हैं और परागकण सूखने का खतरा होता है।`
                  : `Elevated daytime heat (${activeDayData.tempMax}°C) coupled with high nocturnal minimums (${activeDayData.tempMin}°C) accelerate dark respiration burn.`}
              </p>
            </div>

            {/* HOW MUCH IMPACT */}
            <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-2.5">
              <div className="flex items-center gap-2 text-[#2d6a4f] font-bold text-xs uppercase tracking-wider">
                <span className="h-2.5 w-2.5 rounded-full bg-[#2d6a4f]" />
                <span>{isHindi ? "3. उपज पर कितना असर पड़ेगा? (HOW DOES IT IMPACT?)" : "3. How Does It Impact Yield?"}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#11261f] font-display">
                {activeDayData.lossQtlAcre === 0 ? (
                  <span className="text-emerald-700">
                    {isHindi ? "0 नुकसान — फसल सुरक्षित" : "0 Yield Loss — Safe Window"}
                  </span>
                ) : (
                  <span className="text-rose-600">
                    {isHindi ? `-${activeDayData.lossQtlAcre} क्विंटल प्रति एकड़ संभावित हानि` : `-${activeDayData.lossQtlAcre} Q/acre Potential Yield Loss`}
                  </span>
                )}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {activeDayData.lossQtlAcre === 0
                  ? isHindi
                    ? `इस दिन मौसम पूरी तरह सुरक्षित है। आपके ${acres} एकड़ खेत में किसी उपज हानि का अनुमान नहीं है।`
                    : `Weather parameters are within safe agronomic limits on this day. 0 yield loss predicted across your ${acres} acres.`
                  : isHindi
                  ? `यदि समय पर सुरक्षित स्प्रे नहीं किया गया तो आपके ${acres} एकड़ के कुल रकबे पर लगभग ₹${lossInr.toLocaleString("en-IN")} की उपज का नुकसान हो सकता है।`
                  : `Without osmoprotective shielding, total financial damage across your ${acres} acre field could reach ₹${lossInr.toLocaleString("en-IN")}.`}
              </p>
            </div>

            {/* ACTION TO TAKE */}
            <div className="bg-white/95 backdrop-blur-md border border-[#e8ede4] rounded-3xl p-5 sm:p-6 shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-2.5">
              <div className="flex items-center gap-2 text-[#1b4332] font-bold text-xs uppercase tracking-wider">
                <span className="h-2.5 w-2.5 rounded-full bg-[#1b4332]" />
                <span>{isHindi ? "4. आपको क्या कदम उठाना चाहिए? (WHAT ACTION TO TAKE?)" : "4. What Action to Take?"}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-[#11261f] font-display">
                {isHindi ? "शाम 5:30 बजे के बाद बायोस्टिमुलेंट छिड़काव" : "Evening Foliar Osmoprotectant Spray"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {isHindi
                  ? `सिंजेंटा क्वांटिस (Quantis®) 250 मिली/एकड़ की दर से 150 लीटर पानी में मिलाकर शाम के समय स्प्रे करें। अगले 48 घंटे में सुरक्षा सुनिश्चित करें।`
                  : `Foliar spray of Syngenta Quantis® at 250 ml/acre in 150 L water late evening (after 5:30 PM). Protects pollen fertility and stops flower abortion.`}
              </p>
              <div className="pt-2">
                <Link
                  href="/plant-intelligence/prescription"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#1b4332] hover:underline"
                >
                  <span>{isHindi ? "अनुशंसित उत्पाद व छिड़काव सारणी देखें →" : "View Recommended Products & Timeline →"}</span>
                </Link>
              </div>
            </div>
          </div>

          {/* ── Navigation Ribbon: To Products & Prescription (/prescription) ──── */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 sm:p-6 rounded-3xl bg-white/95 backdrop-blur-md border border-[#e8ede4] shadow-xs">
            <Link
              href="/plant-intelligence"
              className="text-xs font-bold text-slate-700 hover:text-[#1b4332] flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{isHindi ? "हब पर वापस जाएं" : "Return to Hub"}</span>
            </Link>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Link
                href="/plant-intelligence/prescription"
                className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] min-h-[44px]"
              >
                <span>
                  {isHindi
                    ? "अगला: 2 & 3. उत्पाद सिफारिश व छिड़काव सारणी (/prescription)"
                    : "Next: 2 & 3. Products & Spray Schedule (/prescription)"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* ── 14-DAY STRESS RADAR POP-UP MODAL (User Requested Feature) ────── */}
      {isDayModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3.5 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
          onClick={() => {
            if (isDaySpeaking && typeof window !== "undefined" && window.speechSynthesis) {
              window.speechSynthesis.cancel();
              setIsDaySpeaking(false);
            }
            setIsDayModalOpen(false);
          }}
        >
          <div
            className="relative w-full max-w-lg bg-white rounded-3xl p-5 sm:p-7 shadow-2xl border border-[#e8ede4] space-y-5 my-auto max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-[#e8ede4] pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase text-[#1b4332] bg-[#e8f5e9] px-2.5 py-0.5 rounded-md border border-[#cbe5cb]">
                    DAY {activeDayData.dayIndex} FORECAST &middot; 14-DAY RADAR
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                      activeDayData.lossQtlAcre === 0
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : activeDayData.severity === "critical"
                        ? "bg-rose-100 text-rose-800 border border-rose-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {activeDayData.riskPct}% Risk &middot; {activeDayData.severity.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#11261f] font-display mt-1">
                  {isHindi ? activeDayData.stressTypeHi : activeDayData.stressType}
                </h3>
                <span className="text-xs text-slate-500 font-medium block">
                  {activeDayData.dateStr} ({activeDayData.dayName}) &middot; {district}, {crop} ({acres} Acres)
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (isDaySpeaking && typeof window !== "undefined" && window.speechSynthesis) {
                    window.speechSynthesis.cancel();
                    setIsDaySpeaking(false);
                  }
                  setIsDayModalOpen(false);
                }}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                aria-label="Close Pop-up"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 4-Box Telemetry Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
              <div className="p-3 rounded-2xl bg-[#f8faf7] border border-[#e8ede4]">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Day Max</span>
                <span className="text-base sm:text-lg font-bold text-slate-900">{activeDayData.tempMax}&deg;C</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f8faf7] border border-[#e8ede4]">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Night Min</span>
                <span className={`text-base sm:text-lg font-bold ${activeDayData.tempMin >= 25 ? "text-rose-600 font-black" : "text-slate-900"}`}>
                  {activeDayData.tempMin}&deg;C
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f8faf7] border border-[#e8ede4]">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Vapor (VPD)</span>
                <span className="text-base sm:text-lg font-bold text-[#1b4332]">{activeDayData.vpdKpa} kPa</span>
              </div>
              <div className="p-3 rounded-2xl bg-[#f8faf7] border border-[#e8ede4]">
                <span className="text-[10px] text-slate-400 uppercase block font-sans">Rain Prob</span>
                <span className="text-base sm:text-lg font-bold text-sky-600">{activeDayData.rainProbPct}%</span>
              </div>
            </div>

            {/* Easy Language Crop Biological Explanation */}
            <div className="p-4 rounded-2xl bg-[#fbfcf8] border border-[#e8ede4] space-y-2">
              <span className="text-xs font-bold text-[#11261f] flex items-center gap-1.5">
                <Sprout className="h-4 w-4 text-[#2d6a4f]" />
                <span>{isHindi ? "फसल पर प्रभाव (आसान भाषा में)" : "Biological Impact on Your Crop"}</span>
              </span>
              <p className="text-xs text-slate-700 leading-relaxed font-sans">
                {isHindi ? activeDayData.whatWillBeLostHi : activeDayData.whatWillBeLostEn}
              </p>
            </div>

            {/* Loss Assessment Card in Easy Language */}
            <div className={`p-4 rounded-2xl border space-y-1.5 ${
              activeDayData.lossQtlAcre === 0
                ? "bg-[#e8f5e9]/70 border-[#cbe5cb]"
                : "bg-rose-50/70 border-rose-200"
            }`}>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${
                  activeDayData.lossQtlAcre === 0 ? "text-emerald-900" : "text-rose-900"
                }`}>
                  {isHindi ? "अनुमानित उपज स्थिति" : "Yield Loss Outlook"}
                </span>
                <span className={`text-sm font-black font-mono ${
                  activeDayData.lossQtlAcre === 0 ? "text-emerald-700" : "text-rose-600"
                }`}>
                  {activeDayData.lossQtlAcre === 0
                    ? isHindi ? "0 नुकसान (सुरक्षित)" : "0 Loss (Safe)"
                    : `-${activeDayData.lossQtlAcre} Q/acre`}
                </span>
              </div>

              <p className={`text-xs leading-snug ${
                activeDayData.lossQtlAcre === 0 ? "text-emerald-800" : "text-rose-800"
              }`}>
                {activeDayData.lossQtlAcre === 0
                  ? isHindi
                    ? "मौसम फसल के पूरी तरह अनुकूल है। पौधे स्वस्थ हैं और कोई उपज हानि नहीं होगी।"
                    : "Conditions are safe. Plant respiration and cell turgor are normal with 0 yield loss predicted."
                  : isHindi
                  ? `आपके ${acres} एकड़ के खेत में बिना उपचार लगभग ₹${lossInr.toLocaleString("en-IN")} का कुल नुकसान हो सकता है (-${activeDayData.lossQtlAcre} क्विंटल प्रति एकड़)।`
                  : `Without foliar shielding, estimated risk is ~${activeDayData.lossQtlAcre} Q/acre (-₹${activeDayData.lossInrAcre.toLocaleString("en-IN")}/acre), totaling ₹${lossInr.toLocaleString("en-IN")} across ${acres} acres.`}
              </p>
            </div>

            {/* Recommended Action Box */}
            <div className="p-4 rounded-2xl bg-white border border-[#e8ede4] space-y-1.5">
              <span className="text-xs font-bold text-[#11261f] flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#2d6a4f]" />
                <span>{isHindi ? "किसान के लिए सलाह (अनुशंसित कार्रवाई)" : "Farmer Recommended Action"}</span>
              </span>
              <p className="text-xs text-slate-600 leading-relaxed font-sans">
                {activeDayData.lossQtlAcre === 0
                  ? isHindi
                    ? "मौसम अनुकूल है। नियमित सिंचाई व फसल की सामान्य निगरानी जारी रखें।"
                    : "Favorable conditions. Continue standard irrigation cycle and crop scouting."
                  : isHindi
                  ? "शाम 5:30 बजे के बाद सिंजेंटा क्वांटिस (Quantis®) 250 मिली/एकड़ का छिड़काव करें ताकि रात की गर्मी में फूल न गिरें।"
                  : "Spray Syngenta Quantis® @ 250 ml/acre in the evening (after 5:30 PM) to protect flower retention."}
              </p>
            </div>

            {/* Modal Bottom Buttons */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-[#e8ede4]">
              {/* Voice Button */}
              <button
                type="button"
                onClick={() => speakDayAdvisory(activeDayData)}
                className="px-4 py-2.5 rounded-2xl bg-[#e8f5e9] hover:bg-[#d8edd9] text-[#1b4332] border border-[#cbe5cb] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[42px]"
              >
                {isDaySpeaking ? (
                  <>
                    <VolumeX className="h-4 w-4 text-rose-600" />
                    <span className="text-rose-700">{isHindi ? "रोकें" : "Stop Voice"}</span>
                  </>
                ) : (
                  <>
                    <Volume2 className="h-4 w-4 text-[#2d6a4f]" />
                    <span>{isHindi ? "📢 यह रिपोर्ट सुनें" : "📢 Listen to Day Report"}</span>
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (isDaySpeaking && typeof window !== "undefined" && window.speechSynthesis) {
                      window.speechSynthesis.cancel();
                      setIsDaySpeaking(false);
                    }
                    setIsDayModalOpen(false);
                  }}
                  className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer min-h-[42px]"
                >
                  {isHindi ? "बंद करें" : "Close"}
                </button>

                <Link
                  href="/plant-intelligence/prescription"
                  className="px-4 py-2.5 rounded-2xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm min-h-[42px]"
                >
                  <span>{isHindi ? "उपाय देखें →" : "View Solutions →"}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
