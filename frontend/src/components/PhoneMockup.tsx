"use client";

import React, { useState, useEffect } from "react";
import {
  Sun,
  Wind,
  Droplets,
  TrendingUp,
  Mic,
  LayoutDashboard,
  Leaf,
  BarChart2,
  ShieldCheck,
  Sparkles,
  CloudRain,
  Store,
  ArrowRight,
  CheckCircle2,
  Volume2,
  Camera,
  RefreshCw,
  Activity,
  Zap,
  MapPin,
  ChevronRight,
  ShieldAlert,
  HelpCircle,
  MoreHorizontal,
  Bookmark,
} from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";

interface PhoneMockupProps {
  location?: string;
  temperature?: number;
  crop?: string;
  mandiPrice?: number;
  onActionClick?: (route: string) => void;
}

const TABS: Array<"home" | "crop" | "voice" | "mandi" | "weather"> = [
  "home",
  "crop",
  "voice",
  "mandi",
  "weather",
];

export const PhoneMockup: React.FC<PhoneMockupProps> = ({
  location,
  temperature = 26,
  crop = "Groundnut",
  mandiPrice = 2420,
  onActionClick,
}) => {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const [activeTab, setActiveTab] = useState<"home" | "crop" | "voice" | "mandi" | "weather">("home");
  const [selectedCrop, setSelectedCrop] = useState<string>("wheat");
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [mounted, setMounted] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ── 1. Automatic Working Phone Cycle (5s per scene) ─────────────────
  useEffect(() => {
    const delay = userInteracted ? 10000 : 5000;
    const timer = setTimeout(() => {
      setUserInteracted(false);
      setActiveTab((prev) => {
        const nextIdx = (TABS.indexOf(prev) + 1) % TABS.length;
        return TABS[nextIdx];
      });
    }, delay);

    return () => clearTimeout(timer);
  }, [activeTab, userInteracted]);

  // ── 2. Real-time Clock ───────────────────────────────────────────────
  const [currentTime, setCurrentTime] = useState<string>("11:51");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── 3. Fluctuating Temperature Telemetry (26.0°C to 26.4°C) ──────────
  const [liveTemp, setLiveTemp] = useState<number>(temperature);
  useEffect(() => {
    const tempInterval = setInterval(() => {
      setLiveTemp(+(temperature + (Math.random() * 0.4 - 0.2)).toFixed(1));
    }, 4000);
    return () => clearInterval(tempInterval);
  }, [temperature]);

  // ── 4. Auto Scanner Loop on Crop tab ─────────────────────────────────
  useEffect(() => {
    if (activeTab === "crop") {
      setIsScanning(true);
      const timer = setTimeout(() => setIsScanning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [activeTab]);

  // ── 5. Auto Mandi Crop Cycle ─────────────────────────────────────────
  useEffect(() => {
    if (activeTab === "mandi") {
      const crops = ["wheat", "soybean", "mustard", "cotton"];
      let cropIdx = 0;
      const cInterval = setInterval(() => {
        cropIdx = (cropIdx + 1) % crops.length;
        setSelectedCrop(crops[cropIdx]);
      }, 2500);
      return () => clearInterval(cInterval);
    }
  }, [activeTab]);

  const handleManualTabChange = (tab: "home" | "crop" | "voice" | "mandi" | "weather") => {
    setUserInteracted(true);
    setActiveTab(tab);
  };

  const mandiDataMap: Record<
    string,
    { name: string; nameHi: string; modal: number; min: number; max: number; delta: string }
  > = {
    wheat: { name: "Sharbati Wheat", nameHi: "शरबती गेहूं", modal: 2420, min: 2180, max: 2540, delta: "+₹65" },
    soybean: { name: "Yellow Soybean", nameHi: "पीला सोयाबीन", modal: 4650, min: 4200, max: 4850, delta: "+₹120" },
    mustard: { name: "Black Mustard", nameHi: "काली सरसों", modal: 5620, min: 5100, max: 5800, delta: "+₹85" },
    cotton: { name: "Medium Staple Cotton", nameHi: "कपास", modal: 7150, min: 6700, max: 7400, delta: "+₹150" },
  };

  const currentMandi = mandiDataMap[selectedCrop] || mandiDataMap.wheat;
  const defaultLocation = isHindi ? "सीहोर, मध्य प्रदेश" : "Sehore, Madhya Pradesh";
  const displayLocation = mounted ? (location || defaultLocation) : defaultLocation;

  return (
    <div className="relative mx-auto select-none flex items-center justify-center">
      
      {/* ── Soft Agricultural Glow ──────────────────────────────────── */}
      <div
        className="absolute -top-10 -left-10 w-72 h-72 rounded-full opacity-25 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #2d6a4f 0%, transparent 70%)" }}
      />
      <div
        className="absolute -bottom-10 -right-10 w-72 h-72 rounded-full opacity-30 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, #52b788 0%, transparent 70%)" }}
      />

      {/* ── Realistic Floor Contact Shadow ──────────────────────────── */}
      <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-3/4 h-6 bg-black/25 rounded-full blur-xl pointer-events-none" />

      {/* ── Ultra-Realistic Smartphone Hardware Container ────────────── */}
      <div
        className="relative rounded-[3.2rem] p-[10px] bg-gradient-to-b from-slate-700 via-slate-800 to-slate-950 shadow-[0_25px_60px_-15px_rgba(27,67,50,0.32),0_15px_30px_-10px_rgba(0,0,0,0.22),0_0_0_1px_rgba(255,255,255,0.18)] transition-transform duration-500 hover:scale-[1.01]"
        style={{ width: "320px", maxWidth: "calc(100vw - 32px)" }}
      >
        {/* Realistic Physical Hardware Buttons (Left Side) */}
        {/* Action Button */}
        <div className="absolute -left-[3px] top-24 w-[3.5px] h-6 bg-slate-600 rounded-l-xs ring-1 ring-slate-800 shadow-xs" />
        {/* Volume Up */}
        <div className="absolute -left-[3px] top-36 w-[3.5px] h-11 bg-slate-600 rounded-l-xs ring-1 ring-slate-800 shadow-xs" />
        {/* Volume Down */}
        <div className="absolute -left-[3px] top-52 w-[3.5px] h-11 bg-slate-600 rounded-l-xs ring-1 ring-slate-800 shadow-xs" />

        {/* Realistic Physical Hardware Button (Right Side: Power/Sleep) */}
        <div className="absolute -right-[3px] top-36 w-[3.5px] h-16 bg-slate-600 rounded-r-xs ring-1 ring-slate-800 shadow-xs" />

        {/* Inner Black Bezel Frame */}
        <div className="relative rounded-[2.7rem] overflow-hidden bg-black p-[2.5px] shadow-inner">
          
          {/* Top Speaker Ear-piece Slit */}
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 z-40 w-12 h-1 bg-slate-800/80 rounded-full" />

          {/* Dynamic Island Notch with Camera Lens & Sensor */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 bg-black rounded-full px-3.5 py-1.5 flex items-center justify-between gap-3 shadow-md min-w-[112px]">
            <div className="flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[7.5px] font-mono text-slate-300 font-semibold tracking-wider">
                krishyantra
              </span>
            </div>
            {/* Camera lens & infrared sensor dots */}
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-[#111827] ring-1 ring-white/10 flex items-center justify-center">
                <span className="h-0.5 w-0.5 rounded-full bg-indigo-900" />
              </span>
              <span className="h-1 w-1 rounded-full bg-[#0a192f]" />
            </div>
          </div>

          {/* ── Screen Frame ──────────────────────────────────────────── */}
          <div className="bg-[#fcfdfc] overflow-hidden relative flex flex-col justify-between rounded-[2.5rem]" style={{ height: "585px", width: "100%" }}>
            
            {/* Specular Screen Glass Reflection Highlight */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/[0.04] to-transparent pointer-events-none z-30" />

            {/* iOS Status Bar */}
            <div className="bg-white/95 border-b border-slate-100 pt-3 px-6 pb-1 flex justify-between items-center text-[10px] font-mono font-bold text-slate-700 relative z-20">
              <span>{currentTime}</span>
              <div className="flex gap-1.5 items-center">
                <span className="text-[9px] text-emerald-700 font-bold">5G</span>
                <span className="text-[8px]">●●●</span>
                <span className="text-[9px]">100%</span>
              </div>
            </div>

            {/* Sub-header Brand Strip */}
            <div className="px-4 py-2 bg-white border-b border-slate-100 flex items-center justify-between relative z-20">
              <div className="flex items-center gap-1.5">
                <div className="w-5 h-5 rounded-full bg-[#e8f5e9] flex items-center justify-center text-[#2d6a4f]">
                  <Leaf className="w-3 h-3 text-[#2d6a4f]" />
                </div>
                <div>
                  <span className="text-[11px] font-black text-[#1b4332] block leading-none tracking-tight">
                    krishyantra
                  </span>
                  <span className="text-[7.5px] text-[#40916c] font-medium leading-none">
                    Saath Har Kisan Ke Liye
                  </span>
                </div>
              </div>
              <Bookmark className="w-3.5 h-3.5 text-slate-400" />
            </div>

            {/* ── SCREEN VIEWPORTS (Dynamic on activeTab) ────────────────── */}
            <div className="flex-1 overflow-y-auto px-3.5 py-2.5 space-y-2.5 relative z-10">
              
              {/* ── TAB 1: HOME (Target Screenshot Faithful View) ───────── */}
              {activeTab === "home" && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  
                  {/* Greeting & Location */}
                  <div className="space-y-0.5 pt-0.5">
                    <h3 className="text-sm font-black text-[#1b4332] flex items-center gap-1">
                      {isHindi ? "सुप्रभात रमेश जी! 👋" : "Good Morning Ramesh Ji! 👋"}
                    </h3>
                    <div className="flex items-center gap-1 text-[9.5px] text-slate-500 font-medium">
                      <MapPin className="w-3 h-3 text-[#2d6a4f]" />
                      <span>{displayLocation}</span>
                    </div>
                  </div>

                  {/* Crop Health Card (Soft Green) */}
                  <div className="rounded-2xl bg-[#eef7ee] border border-[#cbe5cb] p-3 flex items-center gap-2.5 shadow-2xs">
                    <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center text-[#2d6a4f] shadow-xs shrink-0">
                      <Leaf className="w-5 h-5 text-[#2d6a4f]" />
                    </div>
                    <div className="min-w-0">
                      <span className="text-[8.5px] text-slate-500 block font-medium">
                        {isHindi ? "आपकी फसल: मूंगफली" : "Your Groundnut"}
                      </span>
                      <span className="text-xs font-black text-[#1b4332] block truncate">
                        {isHindi ? "स्वस्थ अवस्था में है" : "Looking Healthy"}
                      </span>
                      <span className="text-[8px] text-slate-500 block font-mono">
                        {isHindi ? "2 दिन पहले जांच की गई" : "Last checked 2 days ago"}
                      </span>
                    </div>
                  </div>

                  {/* Today's Advice Card */}
                  <div className="rounded-2xl bg-white border border-[#e5e7eb] p-3 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[9.5px] font-bold text-slate-800 uppercase tracking-wider">
                        {isHindi ? "आज की सलाह" : "Today's Advice"}
                      </span>
                      <span className="text-[8.5px] text-[#2d6a4f] font-bold bg-[#e8f5e9] px-2 py-0.2 rounded-full">
                        {isHindi ? "अनुकूल समय" : "Optimal"}
                      </span>
                    </div>

                    <div className="rounded-xl bg-amber-50/70 border border-amber-200/70 p-2.5 flex items-start gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Sun className="w-4 h-4 text-amber-600" />
                      </div>
                      <div className="space-y-0.5">
                        <p className="text-[10px] font-bold text-slate-900 leading-tight">
                          {isHindi ? "स्प्रे का उत्तम समय: 7:00 AM - 9:00 AM" : "Good time to spray: 7:00 AM - 9:00 AM"}
                        </p>
                        <p className="text-[8.5px] text-slate-600 font-mono">
                          Temp {liveTemp}°C · Wind 8 km/h
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4 Action Buttons Grid (Faithful to Target) */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        if (onActionClick) onActionClick("/plant-intelligence");
                        else handleManualTabChange("crop");
                      }}
                      className="p-2.5 rounded-xl bg-white border border-[#e5e7eb] hover:border-[#2d6a4f] shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Camera className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-800">
                        {isHindi ? "पौधा जांचें" : "Check Plant"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onActionClick) onActionClick("/weather");
                        else handleManualTabChange("weather");
                      }}
                      className="p-2.5 rounded-xl bg-white border border-[#e5e7eb] hover:border-[#2d6a4f] shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Sun className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-800">
                        {isHindi ? "मौसम" : "Weather"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onActionClick) onActionClick("/assistant");
                        else handleManualTabChange("voice");
                      }}
                      className="p-2.5 rounded-xl bg-white border border-[#e5e7eb] hover:border-[#2d6a4f] shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-[#e8f5e9] text-[#2d6a4f] flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Mic className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-800">
                        {isHindi ? "कृषियंत्र से पूछें" : "Ask Krishyantra"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (onActionClick) onActionClick("/mandi");
                        else handleManualTabChange("mandi");
                      }}
                      className="p-2.5 rounded-xl bg-white border border-[#e5e7eb] hover:border-[#2d6a4f] shadow-2xs flex flex-col items-center justify-center text-center gap-1.5 transition-all cursor-pointer group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Store className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-800">
                        {isHindi ? "मंडी भाव" : "Mandi Rates"}
                      </span>
                    </button>
                  </div>

                </div>
              )}

              {/* ── TAB 2: CROP (Plant Diagnostics) ────────────────────── */}
              {activeTab === "crop" && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1b4332]">
                      {isHindi ? "पत्ती रोग पहचान" : "Leaf & Disease Diagnostics"}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setIsScanning(true);
                        setTimeout(() => setIsScanning(false), 2000);
                      }}
                      className="px-2 py-0.5 rounded-full bg-[#e8f5e9] text-[#2d6a4f] text-[9px] font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className={`h-2.5 w-2.5 ${isScanning ? "animate-spin" : ""}`} />
                      <span>{isHindi ? "पुनः जांच" : "Scan"}</span>
                    </button>
                  </div>

                  {/* Leaf Scan Viewfinder */}
                  <div className="relative rounded-2xl overflow-hidden bg-slate-950 border-2 border-[#2d6a4f] h-36 flex items-center justify-center shadow-inner">
                    <div className="text-5xl select-none">🍃</div>
                    {isScanning && (
                      <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981] animate-[bounce_1.5s_infinite]" />
                    )}
                    <div className="absolute border-2 border-dashed border-emerald-400 rounded-xl w-24 h-24 pointer-events-none flex items-start justify-end p-1">
                      <span className="text-[7px] font-mono font-bold bg-[#1b4332] text-white px-1 py-0.5 rounded-xs">
                        {isScanning ? "ANALYSING..." : "DIAGNOSIS READY"}
                      </span>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-white border border-[#e5e7eb] p-3 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[8.5px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        Early Stage Spotted
                      </span>
                      <span className="text-[8.5px] font-mono text-[#2d6a4f] font-bold">
                        Leaf Spot Check
                      </span>
                    </div>
                    <h4 className="text-[11px] font-black text-[#1b4332]">
                      Tikka Leaf Spot (Cercospora)
                    </h4>
                    <p className="text-[9.5px] text-slate-600 leading-snug">
                      Small dark lesions detected on lower canopy. Recommended to spray biostimulant or approved protectant.
                    </p>
                    <div className="p-2 rounded-xl bg-[#e8f5e9] border border-[#cbe5cb] text-[9px] text-[#1b4332] font-semibold">
                      Action: Morning foliar spray at safe wind velocity.
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 3: VOICE (Farming Voice Assistant) ──────────────── */}
              {activeTab === "voice" && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  <div className="text-center space-y-0.5">
                    <span className="text-xs font-black text-[#1b4332] block">
                      {isHindi ? "कृषियंत्र वॉइस सहायक" : "Krishyantra Voice Assistant"}
                    </span>
                    <span className="text-[8.5px] text-slate-500 font-medium">
                      Speak naturally in your own language
                    </span>
                  </div>

                  {/* Farmer Query */}
                  <div className="bg-[#1b4332] text-white p-2.5 rounded-2xl rounded-tr-none text-[9.5px] space-y-1 ml-4 shadow-xs">
                    <span className="text-[7.5px] opacity-75 font-mono block">
                      {isHindi ? "किसान (Farmer):" : "Farmer:"}
                    </span>
                    <p className="leading-tight font-medium">
                      "Should I spray fertilizer today given current wind conditions?"
                    </p>
                  </div>

                  {/* Krishyantra Response */}
                  <div className="bg-white border border-[#e5e7eb] text-[#1b4332] p-2.5 rounded-2xl rounded-tl-none text-[9.5px] space-y-1 mr-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold text-[#2d6a4f] font-mono">Krishyantra:</span>
                      <span className="text-[7.5px] text-[#2d6a4f] bg-[#e8f5e9] px-1.5 rounded-full font-mono">
                        Voice Advisory
                      </span>
                    </div>
                    <p className="text-slate-700 leading-snug">
                      "Wind is mild at 8 km/h and no rain is expected. Safe spray window is open from 7:00 AM to 9:00 AM."
                    </p>
                  </div>

                  {/* Audio Equalizer */}
                  <div className="flex items-center justify-center gap-1 py-1">
                    {[30, 65, 90, 50, 80, 45, 75, 40, 85, 30].map((h, i) => (
                      <div
                        key={i}
                        className="w-1 bg-[#2d6a4f] rounded-full animate-pulse"
                        style={{ height: `${h * 0.22}px`, animationDelay: `${i * 120}ms` }}
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-[#2d6a4f] text-white shadow-md cursor-pointer animate-pulse">
                      <Mic className="h-5 w-5" />
                    </div>
                    <p className="text-[8.5px] text-slate-500 font-medium mt-1">
                      Tap to speak in Hindi or English
                    </p>
                  </div>
                </div>
              )}

              {/* ── TAB 4: MANDI (Mandi Rates) ─────────────────────────── */}
              {activeTab === "mandi" && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1b4332]">
                      {isHindi ? "मंडी भाव" : "Mandi Market Rates"}
                    </span>
                    <span className="text-[8.5px] font-mono font-bold text-[#2d6a4f] bg-[#e8f5e9] px-2 py-0.5 rounded-full border border-emerald-200">
                      Modal Rates
                    </span>
                  </div>

                  {/* Crop Switcher */}
                  <div className="grid grid-cols-4 gap-1 text-[8.5px] font-bold">
                    {[
                      { id: "wheat", label: "Wheat" },
                      { id: "soybean", label: "Soybean" },
                      { id: "mustard", label: "Mustard" },
                      { id: "cotton", label: "Cotton" },
                    ].map((cr) => (
                      <button
                        key={cr.id}
                        type="button"
                        onClick={() => setSelectedCrop(cr.id)}
                        className={`py-1 rounded-lg border text-center transition-all cursor-pointer ${
                          selectedCrop === cr.id
                            ? "bg-[#1b4332] text-white border-[#1b4332]"
                            : "bg-white text-slate-700 border-slate-200"
                        }`}
                      >
                        {cr.label}
                      </button>
                    ))}
                  </div>

                  <div className="rounded-2xl bg-white border border-[#e5e7eb] p-3 shadow-2xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#1b4332]">
                        {currentMandi.name}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md">
                        {currentMandi.delta}
                      </span>
                    </div>

                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-[8.5px] text-slate-400 uppercase font-mono block">
                          Modal Rate
                        </span>
                        <span className="text-lg font-black text-[#1b4332] font-mono">
                          ₹{currentMandi.modal.toLocaleString("en-IN")}
                        </span>
                        <span className="text-[8.5px] text-slate-500 font-normal"> / quintal</span>
                      </div>
                      <div className="text-right text-[8.5px] text-slate-500 font-mono">
                        <div>Min: ₹{currentMandi.min}</div>
                        <div>Max: ₹{currentMandi.max}</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── TAB 5: WEATHER (Weather & Spray Window) ─────────────── */}
              {activeTab === "weather" && (
                <div className="space-y-2.5 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-[#1b4332]">
                      {isHindi ? "मौसम व स्प्रे विंडो" : "Weather & Spray Window"}
                    </span>
                    <span className="text-[8.5px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                      Forecast
                    </span>
                  </div>

                  <div className="rounded-2xl bg-gradient-to-br from-[#2d6a4f] to-[#1b4332] text-white p-3 shadow-xs">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-2xl font-black font-mono">{liveTemp}°C</span>
                        <p className="text-[9px] text-emerald-100 font-medium">
                          Clear & Favorable for Spray
                        </p>
                      </div>
                      <div className="text-2xl">☀️</div>
                    </div>
                    <div className="grid grid-cols-3 gap-1 pt-2 mt-2 border-t border-white/20 text-[8.5px] text-emerald-100 font-mono">
                      <div>Wind: <strong>8 km/h</strong></div>
                      <div>Rain: <strong>0 mm</strong></div>
                      <div>Window: <strong>Open</strong></div>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* ── Bottom App Dock (Faithful to Target) ───────────────────── */}
            <div className="bg-white border-t border-slate-100 px-3 py-2 flex justify-between items-center shrink-0">
              <button
                type="button"
                onClick={() => handleManualTabChange("home")}
                className={`flex flex-col items-center gap-0.5 text-[8px] font-bold cursor-pointer ${
                  activeTab === "home" ? "text-[#2d6a4f]" : "text-slate-400"
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                <span>Home</span>
              </button>

              <button
                type="button"
                onClick={() => handleManualTabChange("crop")}
                className={`flex flex-col items-center gap-0.5 text-[8px] font-bold cursor-pointer ${
                  activeTab === "crop" ? "text-[#2d6a4f]" : "text-slate-400"
                }`}
              >
                <Leaf className="h-4 w-4" />
                <span>My Farm</span>
              </button>

              {/* Floating Green Center Mic */}
              <button
                type="button"
                onClick={() => handleManualTabChange("voice")}
                className="w-9 h-9 rounded-full bg-[#2d6a4f] hover:bg-[#1b4332] text-white flex items-center justify-center -mt-4 shadow-md transition-transform active:scale-95 cursor-pointer"
                aria-label="Voice Advisor"
              >
                <Mic className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={() => handleManualTabChange("weather")}
                className={`flex flex-col items-center gap-0.5 text-[8px] font-bold cursor-pointer ${
                  activeTab === "weather" ? "text-[#2d6a4f]" : "text-slate-400"
                }`}
              >
                <Sun className="h-4 w-4" />
                <span>Advice</span>
              </button>

              <button
                type="button"
                onClick={() => handleManualTabChange("mandi")}
                className={`flex flex-col items-center gap-0.5 text-[8px] font-bold cursor-pointer ${
                  activeTab === "mandi" ? "text-[#2d6a4f]" : "text-slate-400"
                }`}
              >
                <MoreHorizontal className="h-4 w-4" />
                <span>More</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
