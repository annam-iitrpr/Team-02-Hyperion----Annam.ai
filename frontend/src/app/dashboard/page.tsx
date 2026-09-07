"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { FarmerProfile, getStoredProfile } from "@/lib/userStore";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import { SyngentaDealerLocator } from "@/components/SyngentaDealerLocator";
import { RealtimePermissionsHub } from "@/components/RealtimePermissionsHub";
import { SyngentaMandiOffers } from "@/components/SyngentaMandiOffers";
import { FieldAgroTelemetryGrid } from "@/components/FieldAgroTelemetryGrid";
import { useFarm } from "@/context/FarmContext";
import { calculateDeterministicROI } from "@/lib/calculations/roiEngine";
import { findCropMandiRate } from "@/lib/mandiEngine";
import {
  Sparkles, ArrowRight, Sun, RefreshCw, Edit3, Sprout, CheckCircle2, Mic, TrendingUp
} from "lucide-react";

export default function DashboardPage() {
  const { language } = useLanguage();
  const { weather, refetch } = useWeather();
  const { activeFarm, updateActiveFarm } = useFarm();
  const t = getTranslation(language);

  const [profile, setProfile] = useState<FarmerProfile>(() => getStoredProfile());

  useEffect(() => {
    const p = getStoredProfile();
    if (p) {
      setProfile(p);
      if (p.primaryCrop) updateActiveFarm({ primaryCrop: p.primaryCrop });
      if (p.fieldAreaAcres) updateActiveFarm({ areaAcres: p.fieldAreaAcres });
      if (p.district) updateActiveFarm({ district: p.district });
      if (p.state) updateActiveFarm({ state: p.state });
    }
  }, []);

  const currentAcres = profile.fieldAreaAcres || activeFarm.areaAcres || 5.0;
  const currentCrop = profile.primaryCrop || activeFarm.primaryCrop || "Soybean";
  const currentDistrict = profile.district || activeFarm.district || weather.district || "Ajmer";
  const currentState = profile.state || activeFarm.state || weather.state || "Rajasthan";

  const mandiRateObj = findCropMandiRate(currentCrop, currentDistrict, currentState);
  const currentMandiPrice = mandiRateObj?.modalPrice || 2150;

  const roi = calculateDeterministicROI({
    acres: currentAcres,
    mandiPricePerQtl: currentMandiPrice,
    preservedYieldQtlPerAcre: 0.52,
    productCostPerAcre: 420,
    labourCostPerAcre: 150,
    cropName: currentCrop,
  });

  const netProfitEst = roi.totalFieldNetProfit;

  // Format dynamic location display from stored profile and live GPS
  const locationDisplay = profile.village
    ? `${profile.village}, ${profile.district || currentDistrict}, ${profile.state || currentState}, India`
    : (weather.locationName || `${currentDistrict}, ${currentState}, India`);

  return (
    <AppShell>
      <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        
        {/* Header Greeting - Cleaned of Voice Briefing, Help Modal, and AI Assistant Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-xs font-mono font-bold text-indigo-700 uppercase bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200/80">
                {language === "hi" ? "किसान कमांड सेंटर" : "Field Command Center"}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                {language === "hi" ? "लाइव सेंसर ऑनलाइन" : "LIVE SENSORS ONLINE"}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-[#0d253d] tracking-tight">
              {language === "hi" ? "नमस्ते" : "Welcome"}, {profile.fullName || (language === "hi" ? "किसान साथी" : "Farmer Friend")}
            </h1>
            <p className="text-sm text-slate-500 font-medium flex items-center gap-2 flex-wrap mt-1.5">
              <span>{profile.village ? `${profile.village}, ` : ""}{currentDistrict}{currentState ? `, ${currentState}` : ""}</span>
              <span className="text-slate-300">·</span>
              <strong className="text-slate-900 font-mono">{currentAcres} Acres</strong>
              <span className="text-slate-300">·</span>
              <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs px-2.5 py-0.5 rounded-lg shadow-2xs">
                <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                <span>{currentCrop}</span>
              </span>
            </p>
          </div>

          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 bg-white hover:bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs transition-all shrink-0 self-start sm:self-auto"
          >
            <Edit3 className="h-3.5 w-3.5 text-slate-500" />
            <span>{language === "hi" ? "खेत विवरण बदलें" : "Edit Farm Details"}</span>
          </Link>
        </div>

        {/* Real-Time Telemetry & Sensors Permission Hub - Compact and Auto-Hides when Granted */}
        <RealtimePermissionsHub
          onLocationUpdated={(lat, lon, dist) => {
            if (dist) {
              updateActiveFarm({ district: dist });
            }
          }}
        />

        {/* 🌟 1. Top Telemetry Card (Screenshot 1 top) - Showcase Temperature First */}
        <div className="bg-white p-5 sm:p-6 rounded-3xl border border-[#e3e8ee] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  Open-Meteo High-Resolution Telemetry
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {weather.lastUpdated}
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#0d253d] flex items-center gap-2 font-display">
                <Sun className="h-5 w-5 text-amber-500 shrink-0" />
                <span>Live Open-Meteo Telemetry — {locationDisplay}</span>
              </h3>
            </div>

            <button
              onClick={() => refetch(true)}
              className="px-3 py-1.5 text-xs font-mono font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Sync GPS</span>
            </button>
          </div>

          {/* 6 Real Telemetry Metric Cells */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            {/* 1. Day / Ambient Temp */}
            <div className="bg-[#f6f9fc] p-3.5 rounded-2xl border border-slate-200/80 space-y-0.5">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase">
                {language === "hi" ? "वातावरण तापमान" : "AMBIENT TEMP"}
              </span>
              <span className="text-2xl font-black text-slate-900 font-display">{weather.temperature}°C</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {language === "hi" ? `महसूस ${weather.apparentTemperature}°C` : `Feels like ${weather.apparentTemperature}°C`}
              </span>
            </div>

            {/* 2. Real Night Mean Temp */}
            <div className={`p-3.5 rounded-2xl border space-y-0.5 ${
              weather.isNightHeatStress
                ? "bg-rose-50/80 border-rose-200 text-rose-950"
                : "bg-emerald-50/80 border-emerald-200 text-emerald-950"
            }`}>
              <span className="text-[10px] font-bold block opacity-75 tracking-wider uppercase">
                {language === "hi" ? "रात का तापमान" : "NIGHT TEMP (20-06h)"}
              </span>
              <span className="text-2xl font-black font-display">{weather.nightTemperature || weather.temperature}°C</span>
              <span className="text-[10px] block font-sans font-medium">
                {weather.isNightHeatStress
                  ? (language === "hi" ? "⚠️ गर्मी तनाव (>25°C)" : "⚠️ Thermal Stress (>25°C)")
                  : (language === "hi" ? "✅ इष्टतम (Optimal)" : "✅ Optimal")}
              </span>
            </div>

            {/* 3. Real Measured Volumetric Soil Moisture (0-10cm) */}
            <div className="bg-[#f6f9fc] p-3.5 rounded-2xl border border-slate-200/80 space-y-0.5">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase">
                {language === "hi" ? "मिट्टी नमी (0-10cm)" : "SOIL MOISTURE (0-10cm)"}
              </span>
              <span className="text-2xl font-black text-emerald-600 font-display">{weather.soilMoistureEst}%</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {language === "hi" ? "आयतनिक जल" : "Volumetric Water"}
              </span>
            </div>

            {/* 4. Real Measured Soil Temp */}
            <div className="bg-[#f6f9fc] p-3.5 rounded-2xl border border-slate-200/80 space-y-0.5">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase">
                {language === "hi" ? "मिट्टी तापमान" : "SOIL TEMP"}
              </span>
              <span className="text-2xl font-black text-amber-600 font-display">{weather.soilTemperatureReal || 24.1}°C</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {language === "hi" ? "सतह परत" : "Surface Layer"}
              </span>
            </div>

            {/* 5. Real Precipitation & Rain Status */}
            <div className="bg-[#f6f9fc] p-3.5 rounded-2xl border border-slate-200/80 space-y-0.5">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase">
                {language === "hi" ? "वर्षा / वर्षण" : "RAIN / PRECIP"}
              </span>
              <span className="text-2xl font-black text-blue-600 font-display">{weather.precipitation} mm</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {weather.isRaining
                  ? (language === "hi" ? "🌧️ सक्रिय वर्षा" : "🌧️ Active Rain")
                  : `Prob: ${weather.precipitationProbability}%`}
              </span>
            </div>

            {/* 6. Wind Speed & Spray Suitability */}
            <div className="bg-[#f6f9fc] p-3.5 rounded-2xl border border-slate-200/80 space-y-0.5">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase">
                {language === "hi" ? "हवा की गति" : "WIND SPEED"}
              </span>
              <span className="text-2xl font-black text-slate-800 font-display">{weather.windSpeed} km/h</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {weather.windSpeed <= 15
                  ? (language === "hi" ? "✅ स्प्रे हेतु सुरक्षित" : "✅ Safe for Spray")
                  : (language === "hi" ? "⚠️ बहाव चेतावनी" : "⚠️ Drift Warning")}
              </span>
            </div>
          </div>

          {/* 3 Wide Status / Action Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 font-mono text-xs">
            {/* 1. Agro-Climatic Risk Index */}
            <div className="bg-[#f6f9fc] p-4 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans font-bold text-[10px] uppercase">
                  {language === "hi" ? "कृषि-जलवायु जोखिम सूचकांक" : "Agro-Climatic Risk Index"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  weather.isNightHeatStress ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {weather.isNightHeatStress ? (language === "hi" ? "उच्च जोखिम" : "High Risk") : (language === "hi" ? "सामान्य" : "Normal")}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-display ${
                  weather.isNightHeatStress ? "text-rose-600" : "text-emerald-600"
                }`}>
                  {weather.heatStressPercent}%
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  {weather.isNightHeatStress
                    ? (language === "hi" ? "रात्रि श्वसन हानि" : "Nocturnal Respiration Loss")
                    : (language === "hi" ? "इष्टतम वानस्पतिक स्थिति" : "Optimal Vegetative State")}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    weather.isNightHeatStress ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, weather.heatStressPercent))}%` }}
                />
              </div>
            </div>

            {/* 2. Chemical Spray Window */}
            <div className={`p-4 rounded-2xl border space-y-2 shadow-2xs ${
              weather.windSpeed < 15 && weather.temperature < 33
                ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                : "bg-amber-50/70 border-amber-200 text-amber-950"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-[10px] uppercase opacity-75">
                  {language === "hi" ? "दवा छिड़काव अनुकूलता" : "Chemical Spray Window"}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  weather.windSpeed < 15 && weather.temperature < 33
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-amber-100 text-amber-800"
                }`}>
                  {weather.windSpeed < 15 && weather.temperature < 33
                    ? (language === "hi" ? "स्प्रे सुरक्षित" : "Safe to Spray")
                    : (language === "hi" ? "स्प्रे रोकें" : "Hold Spray")}
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black font-display">
                  {weather.windSpeed < 15 && weather.temperature < 33
                    ? (language === "hi" ? "सक्रिय है (Active Now)" : "Active Now")
                    : (language === "hi" ? "शाम 5 बजे तक टालें" : "Delay to 5 PM")}
                </span>
                <span className="text-[10px] opacity-75 font-sans">
                  Wind {weather.windSpeed} km/h (Limit: 15 km/h)
                </span>
              </div>
              <p className="text-[11px] font-sans opacity-80 leading-tight">
                {weather.windSpeed < 15 && weather.temperature < 33
                  ? (language === "hi" ? "सिंजेंटा क्वांटिस व इसाबियन के अवशोषण के लिए अनुकूल स्थिति।" : "Ideal conditions for Quantis / Isabion foliar uptake.")
                  : (language === "hi" ? "तेज हवा या अधिक तापमान। देर शाम छिड़काव करें।" : "High wind drift or heat risk. Apply in late evening.")}
              </p>
            </div>

            {/* 3. APMC Mandi Harvest Valuation */}
            <div className="bg-[#f6f9fc] p-4 rounded-2xl border border-slate-200/80 space-y-2 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-sans font-bold text-[10px] uppercase">
                  {currentDistrict} APMC Rate
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  Live Agmarknet
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-slate-900 font-display">
                  ₹{currentMandiPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">/quintal</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-sans">
                <span>{currentAcres}-Ac Harvest: ~₹{(currentMandiPrice * currentAcres * 9).toLocaleString("en-IN")}</span>
                <span className="font-bold text-emerald-700">+₹{netProfitEst.toLocaleString("en-IN")} ROI</span>
              </div>
            </div>
          </div>
        </div>

        {/* 🌟 2. Detailed 4-Card 2x2 Agro-Science Telemetry Grid (Screenshot 1 bottom) */}
        <FieldAgroTelemetryGrid weather={weather} district={currentDistrict} />

        {/* 🌟 3. Active Syngenta Mandi Offers (Screenshot 2) */}
        <SyngentaMandiOffers
          district={currentDistrict}
          crop={currentCrop}
          acres={currentAcres}
        />

        {/* 🌟 4. Clean Connected Farm Workflows Ribbon (Simple words, no PS jargon) */}
        <div className="p-6 rounded-3xl bg-white border border-[#e3e8ee] shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#533afd]" />
              <h3 className="text-base font-bold text-[#0d253d] font-display">
                {language === "hi" ? "विशिष्ट कृषि उपकरण (Connected Tools)" : "Specialized Farm Tools & Workflows"}
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-medium">
              {language === "hi" ? "समर्पित पृष्ठ" : "Category Workflows"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-bold">
            <Link
              href="/plant-intelligence"
              className="p-4 rounded-2xl bg-indigo-50/60 hover:bg-indigo-50 border border-indigo-100 text-indigo-950 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <Sprout className="h-5 w-5 text-[#533afd] group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-3.5 w-3.5 text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="block font-extrabold text-sm">{language === "hi" ? "पौधा स्वास्थ्य AI" : "Plant Health Radar"}</span>
                <span className="text-[11px] text-indigo-700 font-medium">{language === "hi" ? "14-दिन तनाव रडार" : "14-Day Stress Early Warning"}</span>
              </div>
            </Link>

            <Link
              href="/assistant"
              className="p-4 rounded-2xl bg-amber-50/60 hover:bg-amber-50 border border-amber-100 text-amber-950 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <Mic className="h-5 w-5 text-amber-600 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-3.5 w-3.5 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="block font-extrabold text-sm">{language === "hi" ? "AI कृषि सलाह" : "Voice AI Assistant"}</span>
                <span className="text-[11px] text-amber-700 font-medium">{language === "hi" ? "बोलकर या फोटो भेजकर" : "Multilingual Voice & Leaf Scan"}</span>
              </div>
            </Link>

            <Link
              href="/impact"
              className="p-4 rounded-2xl bg-sky-50/60 hover:bg-sky-50 border border-sky-100 text-sky-950 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <TrendingUp className="h-5 w-5 text-sky-600 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-3.5 w-3.5 text-sky-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="block font-extrabold text-sm">{language === "hi" ? "ROBI प्रभाव" : "ROBI Causal Impact"}</span>
                <span className="text-[11px] text-sky-700 font-medium">{language === "hi" ? "खर्च बनाम मुनाफा व उपज" : "Economic ROI & Net Profit Matrix"}</span>
              </div>
            </Link>

            <Link
              href="/journal"
              className="p-4 rounded-2xl bg-emerald-50/60 hover:bg-emerald-50 border border-emerald-100 text-emerald-950 transition-all flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                <ArrowRight className="h-3.5 w-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="block font-extrabold text-sm">{language === "hi" ? "फार्म स्प्रे डायरी" : "Farm Journal"}</span>
                <span className="text-[11px] text-emerald-700 font-medium">{language === "hi" ? "स्प्रे रिकॉर्ड व इतिहास" : "Intervention Logs & Timeline"}</span>
              </div>
            </Link>
          </div>
        </div>

        {/* 🌟 6. Verified Syngenta Authorized Dealer Locator */}
        <SyngentaDealerLocator
          district={currentDistrict}
          farmerName={profile.fullName || (language === "hi" ? "किसान भाई" : "Farm Owner")}
          crop={currentCrop}
          fieldAcres={currentAcres}
          productName="Syngenta Quantis & Stress Buster"
        />

      </div>
    </AppShell>
  );
}
