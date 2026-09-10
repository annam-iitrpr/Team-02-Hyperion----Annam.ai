"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { FarmerProfile, getStoredProfile, saveProfile } from "@/lib/userStore";
import { useLanguage } from "@/context/LanguageContext";
import { useWeather, reverseGeocode } from "@/context/WeatherContext";
import { getTranslation } from "@/lib/translations";
import { SyngentaDealerLocator } from "@/components/SyngentaDealerLocator";
import { RealtimePermissionsHub } from "@/components/RealtimePermissionsHub";
import { SyngentaMandiOffers } from "@/components/SyngentaMandiOffers";
import { FieldAgroTelemetryGrid } from "@/components/FieldAgroTelemetryGrid";
import { useFarm } from "@/context/FarmContext";
import { calculateDeterministicROI } from "@/lib/calculations/roiEngine";
import { findCropMandiRate } from "@/lib/mandiEngine";
import { resolveDistrictCoordinatesAsync } from "@/lib/districtCoords";
import {
  Sparkles, ArrowRight, Sun, RefreshCw, Edit3, Sprout, CheckCircle2, Mic, TrendingUp, MapPin
} from "lucide-react";

export default function DashboardPage() {
  const { language } = useLanguage();
  const { weather, refetch, setCustomCoordinates } = useWeather();
  const { activeFarm, updateActiveFarm } = useFarm();
  const t = getTranslation(language);

  const [profile, setProfile] = useState<FarmerProfile>(() => getStoredProfile());
  const [isSyncingGps, setIsSyncingGps] = useState<boolean>(false);

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

  // Format dynamic location display from stored profile and live GPS
  const locationDisplay = profile.village
    ? `${profile.village}, ${profile.district || currentDistrict}, ${profile.state || currentState}, India`
    : (weather.locationName || `${currentDistrict}, ${currentState}, India`);

  // Auto-sync real Open-Meteo telemetry whenever the farm's district or state changes
  useEffect(() => {
    let isCancelled = false;
    async function syncWeatherToCurrentDistrict() {
      if (!currentDistrict) return;
      const coords = await resolveDistrictCoordinatesAsync(currentDistrict, currentState);
      if (!coords || !coords.lat || !coords.lon) return;

      const cleanCurrent = currentDistrict.trim().toLowerCase();
      const cleanWeather = (weather.district || "").trim().toLowerCase();
      const isCoordMismatched =
        Math.abs(weather.lat - coords.lat) > 0.4 ||
        Math.abs(weather.lon - coords.lon) > 0.4;

      if (cleanCurrent !== cleanWeather || isCoordMismatched || weather.lat === 20.5937) {
        if (!isCancelled) {
          await setCustomCoordinates(
            coords.lat,
            coords.lon,
            locationDisplay,
            currentDistrict,
            currentState
          );
        }
      }
    }
    syncWeatherToCurrentDistrict();
    return () => {
      isCancelled = true;
    };
  }, [currentDistrict, currentState, locationDisplay, setCustomCoordinates, weather.district, weather.lat, weather.lon]);

  const handleSyncGps = () => {
    setIsSyncingGps(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const geo = await reverseGeocode(lat, lon);
          const updated: FarmerProfile = {
            ...profile,
            gpsLocation: { lat, lon },
            district: geo.district || profile.district,
            state: geo.state || profile.state,
            village: geo.village || profile.village,
          };
          saveProfile(updated);
          setProfile(updated);
          updateActiveFarm({
            district: geo.district || profile.district,
            state: geo.state || profile.state,
            center: [lat, lon],
          });
          await setCustomCoordinates(lat, lon, geo.locationName, geo.district, geo.state);
          setIsSyncingGps(false);
        },
        () => {
          refetch(true);
          setIsSyncingGps(false);
        },
        { timeout: 8000 }
      );
    } else {
      refetch(true);
      setIsSyncingGps(false);
    }
  };

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

  return (
    <AppShell>
      <div className="relative min-h-screen bg-[#fbfcf8] bg-[radial-gradient(#1b4332_0.75px,transparent_0.75px)] [background-size:24px_24px] [background-position:0_0] text-slate-800 pb-24 md:pb-12">
        <div className="max-w-[1240px] w-full mx-auto px-3.5 sm:px-6 py-5 sm:py-10 space-y-5 sm:space-y-8 font-sans">
          
          {/* Header Greeting - Humanized & Farmer-Centric */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 sm:gap-4 border-b border-[#e8ede4] pb-5 sm:pb-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] sm:text-xs font-bold text-[#1b4332] bg-[#e8f5e9] px-3 py-1 rounded-full border border-[#cbe5cb] flex items-center gap-1.5 shadow-2xs">
                  <Sprout className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  {language === "hi" ? "खेत का दैनिक ब्योरा" : "Today's Field Health & Care"}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  {language === "hi" ? "लाइव सेंसर सक्रिय" : "Live Sensors Active"}
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black font-display text-[#11261f] tracking-tight leading-tight">
                {language === "hi" ? "नमस्ते" : "Welcome"}, {profile.fullName || (language === "hi" ? "किसान साथी" : "Farmer Friend")}
              </h1>
              <div className="text-xs sm:text-sm text-slate-600 font-medium flex items-center gap-2 flex-wrap pt-1">
                <span className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-[#e8ede4] text-slate-700">
                  <MapPin className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                  <span className="truncate max-w-[190px] sm:max-w-none">{profile.village ? `${profile.village}, ` : ""}{currentDistrict}{currentState ? `, ${currentState}` : ""}</span>
                </span>
                <span className="bg-white px-2.5 py-1 rounded-lg border border-[#e8ede4] text-slate-700 font-semibold">
                  {currentAcres} Acres
                </span>
                <span className="bg-[#e8f5e9] px-2.5 py-1 rounded-lg border border-[#cbe5cb] text-[#1b4332] font-bold flex items-center gap-1">
                  <Sprout className="h-3 w-3 text-[#2d6a4f]" />
                  <span>{currentCrop}</span>
                </span>
              </div>
            </div>

            <Link
              href="/settings"
              className="inline-flex items-center justify-center gap-2 text-xs font-bold text-[#1b4332] hover:text-[#0d2319] bg-white hover:bg-[#e8f5e9]/50 px-4 py-2.5 rounded-2xl border border-[#e8ede4] hover:border-[#2d6a4f]/40 shadow-2xs transition-all shrink-0 w-full sm:w-auto min-h-[44px] cursor-pointer"
            >
              <Edit3 className="h-3.5 w-3.5 text-[#2d6a4f]" />
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

        {/* 🌟 1. Top Telemetry Card - Humanized & Precision Telemetry */}
        <div className="bg-white/95 backdrop-blur-md p-4 sm:p-7 rounded-3xl border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-4 sm:space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className="text-[10px] font-mono font-bold text-[#1b4332] bg-[#e8f5e9] px-3 py-1 rounded-full border border-[#cbe5cb] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-ping" />
                  {language === "hi" ? "उपग्रह व सूक्ष्म-मौसम डेटा" : "Live Satellite & Field Microclimate"}
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {weather.lastUpdated}
                </span>
              </div>
              <h3 className="font-extrabold text-base sm:text-lg text-[#11261f] flex items-center gap-2 font-display">
                <Sun className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="leading-snug">{language === "hi" ? "खेत का वास्तविक मौसम ब्योरा" : "Today's Field Microclimate"} — {locationDisplay}</span>
              </h3>
            </div>

            <button
              onClick={handleSyncGps}
              disabled={isSyncingGps}
              className="w-full sm:w-auto min-h-[40px] px-3.5 py-2 text-xs font-mono font-bold text-[#1b4332] bg-[#f0f5ee] hover:bg-[#e3ede0] border border-[#d9e6d4] rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-98 disabled:opacity-60"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-[#2d6a4f] ${isSyncingGps ? "animate-spin" : ""}`} />
              <span>{isSyncingGps ? (language === "hi" ? "जीपीएस सिंक हो रहा है..." : "Syncing GPS...") : "Sync GPS"}</span>
            </button>
          </div>

          {/* 6 Real Telemetry Metric Cells */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 font-mono text-xs">
            {/* 1. Day / Ambient Temp */}
            <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                {language === "hi" ? "दिन का तापमान" : "DAYTIME TEMP"}
              </span>
              <span className="text-2xl font-black text-[#11261f] font-display block">{weather.temperature}°C</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {language === "hi" ? `महसूस ${weather.apparentTemperature}°C` : `Feels like ${weather.apparentTemperature}°C`}
              </span>
            </div>

            {/* 2. Real Night Mean Temp */}
            <div className={`p-4 rounded-2xl border space-y-1 transition-all shadow-2xs ${
              weather.isNightHeatStress
                ? "bg-rose-50/70 border-rose-200 text-rose-950"
                : "bg-[#e8f5e9]/70 border-[#cbe5cb] text-emerald-950"
            }`}>
              <span className="text-[10px] font-bold block opacity-75 tracking-wider uppercase font-sans">
                {language === "hi" ? "रात का तापमान" : "NIGHT TEMP (20-06h)"}
              </span>
              <span className="text-2xl font-black font-display block">{weather.nightTemperature || weather.temperature}°C</span>
              <span className="text-[10px] block font-sans font-semibold">
                {weather.isNightHeatStress
                  ? (language === "hi" ? "⚠️ गर्मी तनाव (>25°C)" : "⚠️ Night Stress (>25°C)")
                  : (language === "hi" ? "✅ रात्रि आराम अनुकूल" : "✅ Optimal Cooling")}
              </span>
            </div>

            {/* 3. Real Measured Volumetric Soil Moisture (0-10cm) */}
            <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                {language === "hi" ? "मिट्टी नमी (0-10cm)" : "SOIL MOISTURE"}
              </span>
              <span className="text-2xl font-black text-[#2d6a4f] font-display block">{weather.soilMoistureEst}%</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {language === "hi" ? "सक्रिय जल स्तर" : "Volumetric Water"}
              </span>
            </div>

            {/* 4. Real Measured Soil Temp */}
            <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                {language === "hi" ? "मिट्टी तापमान" : "SOIL TEMP"}
              </span>
              <span className="text-2xl font-black text-amber-700 font-display block">{weather.soilTemperatureReal || 24.1}°C</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {language === "hi" ? "जड़ सतह परत" : "Root Surface Layer"}
              </span>
            </div>

            {/* 5. Real Precipitation & Rain Status */}
            <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                {language === "hi" ? "वर्षा / वर्षण" : "RAIN STATUS"}
              </span>
              <span className="text-2xl font-black text-blue-600 font-display block">{weather.precipitation} mm</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {weather.isRaining
                  ? (language === "hi" ? "🌧️ सक्रिय वर्षा" : "🌧️ Active Rain")
                  : `Prob: ${weather.precipitationProbability}%`}
              </span>
            </div>

            {/* 6. Wind Speed & Spray Suitability */}
            <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-1 hover:border-[#2d6a4f]/40 transition-all shadow-2xs">
              <span className="text-slate-500 block text-[10px] font-bold tracking-wider uppercase font-sans">
                {language === "hi" ? "हवा की गति" : "WIND SPEED"}
              </span>
              <span className="text-2xl font-black text-[#11261f] font-display block">{weather.windSpeed} km/h</span>
              <span className="text-[10px] text-slate-500 block font-sans">
                {weather.windSpeed <= 15
                  ? (language === "hi" ? "✅ स्प्रे हेतु सुरक्षित" : "✅ Safe for Spray")
                  : (language === "hi" ? "⚠️ तेज हवा चेतावनी" : "⚠️ Drift Warning")}
              </span>
            </div>
          </div>

          {/* 3 Wide Status / Action Tiles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3 border-t border-slate-100 font-mono text-xs">
            {/* 1. Agro-Climatic Risk Index */}
            <div className="bg-[#fbfcf8] p-4 sm:p-5 rounded-2xl border border-[#e8ede4] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-sans font-bold text-[10px] uppercase">
                  {language === "hi" ? "फसल मौसम तनाव सूचकांक" : "Crop Weather Stress Index"}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-sans ${
                  weather.isNightHeatStress ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                }`}>
                  {weather.isNightHeatStress ? (language === "hi" ? "उच्च तनाव" : "Thermal Stress") : (language === "hi" ? "सामान्य / सुरक्षित" : "Normal")}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className={`text-2xl font-black font-display ${
                  weather.isNightHeatStress ? "text-rose-600" : "text-[#2d6a4f]"
                }`}>
                  {weather.heatStressPercent}%
                </span>
                <span className="text-[10px] text-slate-500 font-sans">
                  {weather.isNightHeatStress
                    ? (language === "hi" ? "रात्रि श्वसन हानि का खतरा" : "Nocturnal Respiration Stress")
                    : (language === "hi" ? "इष्टतम वानस्पतिक स्थिति" : "Optimal Vegetative State")}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    weather.isNightHeatStress ? "bg-rose-500" : "bg-[#2d6a4f]"
                  }`}
                  style={{ width: `${Math.min(100, Math.max(10, weather.heatStressPercent))}%` }}
                />
              </div>
            </div>

            {/* 2. Chemical Spray Window */}
            <div className={`p-4 sm:p-5 rounded-2xl border space-y-2.5 shadow-2xs transition-all ${
              weather.windSpeed < 15 && weather.temperature < 33
                ? "bg-[#e8f5e9]/70 border-[#cbe5cb] text-emerald-950"
                : "bg-amber-50/70 border-amber-200 text-amber-950"
            }`}>
              <div className="flex items-center justify-between">
                <span className="font-sans font-bold text-[10px] uppercase opacity-80">
                  {language === "hi" ? "दवा छिड़काव अनुकूलता" : "Chemical Spray Window"}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full font-sans ${
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
                  Wind {weather.windSpeed} km/h (&lt; 15 km/h limit)
                </span>
              </div>
              <p className="text-[11px] font-sans opacity-85 leading-tight">
                {weather.windSpeed < 15 && weather.temperature < 33
                  ? (language === "hi" ? "सिंजेंटा क्वांटिस व इसाबियन के अवशोषण के लिए अनुकूल स्थिति।" : "Ideal conditions for Quantis / Isabion foliar uptake.")
                  : (language === "hi" ? "तेज हवा या अधिक तापमान। देर शाम छिड़काव करें।" : "High wind drift or heat risk. Apply in late evening.")}
              </p>
            </div>

            {/* 3. APMC Mandi Harvest Valuation */}
            <div className="bg-[#fbfcf8] p-4 sm:p-5 rounded-2xl border border-[#e8ede4] space-y-2.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-sans font-bold text-[10px] uppercase">
                  {currentDistrict} APMC Rate
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] font-sans">
                  Live Agmarknet
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-xl font-black text-[#11261f] font-display">
                  ₹{currentMandiPrice.toLocaleString("en-IN")}
                </span>
                <span className="text-[10px] text-slate-500 font-sans">/quintal</span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-sans">
                <span>{currentAcres}-Ac Harvest: ~₹{(currentMandiPrice * currentAcres * 9).toLocaleString("en-IN")}</span>
                <span className="font-bold text-[#2d6a4f]">+₹{netProfitEst.toLocaleString("en-IN")} Protected Gain</span>
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

        {/* 🌟 4. Clean Connected Farm Workflows Ribbon (Simple words, Krishyantra Theme) */}
        <div className="p-6 sm:p-7 rounded-3xl bg-white border border-[#e8ede4] shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-[#e8f5e9] flex items-center justify-center border border-[#cbe5cb]">
                <Sparkles className="h-4 w-4 text-[#2d6a4f]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#11261f] font-display">
                  {language === "hi" ? "विशिष्ट कृषि उपकरण (Connected Tools)" : "Specialized Farm Tools & Workflows"}
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  {language === "hi" ? "फसल सुरक्षा, AI सलाह, आर्थिक लाभ एवं इतिहास" : "Crop protection, intelligent voice assistance, ROI and field logs"}
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-flex text-xs font-semibold text-[#2d6a4f] bg-[#e8f5e9] px-2.5 py-0.5 rounded-full border border-[#cbe5cb]">
              {language === "hi" ? "4 सक्रिय मॉड्यूल" : "4 Active Modules"}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs font-bold">
            <Link
              href="/plant-intelligence"
              className="p-4 rounded-2xl bg-[#f4fbf7] hover:bg-[#eaf7ef] border border-[#cbe5cb] text-[#11261f] transition-all flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center border border-[#cbe5cb]/60 shadow-2xs">
                  <Sprout className="h-4 w-4 text-[#2d6a4f] group-hover:scale-110 transition-transform" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#2d6a4f]/70 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="block font-black text-sm text-[#11261f]">{language === "hi" ? "पौधा स्वास्थ्य AI" : "Plant Health Radar"}</span>
                <span className="text-[11px] text-[#2d6a4f] font-semibold">{language === "hi" ? "14-दिन तनाव रडार" : "14-Day Stress Warning"}</span>
              </div>
            </Link>

            <Link
              href="/assistant"
              className="p-4 rounded-2xl bg-[#fefaf0] hover:bg-[#fdf3da] border border-[#f4e4b5] text-[#11261f] transition-all flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center border border-[#f4e4b5]/80 shadow-2xs">
                  <Mic className="h-4 w-4 text-[#b45309] group-hover:scale-110 transition-transform" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#b45309]/70 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="block font-black text-sm text-[#11261f]">{language === "hi" ? "AI कृषि सलाह" : "Voice AI Assistant"}</span>
                <span className="text-[11px] text-[#b45309] font-semibold">{language === "hi" ? "बोलकर या फोटो भेजकर" : "Multilingual Voice & Leaf"}</span>
              </div>
            </Link>

            <Link
              href="/impact"
              className="p-4 rounded-2xl bg-[#f0f9ff] hover:bg-[#e0f2fe] border border-[#bae6fd] text-[#11261f] transition-all flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center border border-[#bae6fd]/80 shadow-2xs">
                  <TrendingUp className="h-4 w-4 text-[#0284c7] group-hover:scale-110 transition-transform" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-[#0284c7]/70 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="block font-black text-sm text-[#11261f]">{language === "hi" ? "ROBI प्रभाव" : "ROBI Causal Impact"}</span>
                <span className="text-[11px] text-[#0284c7] font-semibold">{language === "hi" ? "खर्च बनाम मुनाफा व उपज" : "Economic ROI Matrix"}</span>
              </div>
            </Link>

            <Link
              href="/journal"
              className="p-4 rounded-2xl bg-[#fafaf7] hover:bg-[#f1f3ed] border border-[#e8ede4] text-[#11261f] transition-all flex flex-col justify-between gap-3 group shadow-2xs hover:shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="h-8 w-8 rounded-xl bg-white flex items-center justify-center border border-[#e8ede4] shadow-2xs">
                  <CheckCircle2 className="h-4 w-4 text-[#2d6a4f] group-hover:scale-110 transition-transform" />
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
              <div>
                <span className="block font-black text-sm text-[#11261f]">{language === "hi" ? "फार्म स्प्रे डायरी" : "Farm Journal"}</span>
                <span className="text-[11px] text-slate-600 font-semibold">{language === "hi" ? "स्प्रे रिकॉर्ड व इतिहास" : "Intervention Timeline"}</span>
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
      </div>
    </AppShell>
  );
}
