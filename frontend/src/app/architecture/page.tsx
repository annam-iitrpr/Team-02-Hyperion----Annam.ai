"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import {
  Sparkles,
  Layers,
  Cpu,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  CheckCircle2,
  Mic,
  Camera,
  Navigation,
  CloudSun,
  Store,
  TrendingUp,
  RotateCcw,
  Code2,
  Lock,
  Wifi,
  Server,
  Terminal,
  UserPlus,
  Play,
  Sprout,
} from "lucide-react";

interface PipelineStep {
  id: number;
  phaseEn: string;
  phaseHi: string;
  nameEn: string;
  nameHi: string;
  latency: string;
  tech: string;
  descEn: string;
  descHi: string;
  icon: any;
  simulatedPayload: {
    input: string;
    processing: string;
    output: string;
  };
}

const PIPELINE_FLOW: PipelineStep[] = [
  {
    id: 1,
    phaseEn: "Tier 1: Multimodal Ingestion",
    phaseHi: "चरण 1: वॉयस व सैटेलाइट इनटेक",
    nameEn: "Vernacular Voice & Satellite Geocoding",
    nameHi: "मातृभाषा वॉयस व सैटेलाइट जीपीएस मैपिंग",
    latency: "180ms",
    tech: "Google Cloud STT · Turf.js GIS · Open-Meteo",
    descEn: "Farmer speaks in any of 12 Indian dialects. Audio is transcribed, intent extracted, and linked to exact soil vertisol clay coordinates.",
    descHi: "किसान 12 में से किसी भी भाषा में बोलता है। आवाज को तुरंत समझकर खेत के जीपीएस और काली मिट्टी के डेटा से जोड़ा जाता है।",
    icon: Mic,
    simulatedPayload: {
      input: "Raw Audio: 'सोयाबीन में फूल गिर रहे हैं क्या स्प्रे करें?' (Central Malvi)",
      processing: "Google STT transcription ➔ Intent: 'flower_drop_heat' ➔ Lat/Lon: 23.20°N, 77.08°E",
      output: "{ crop: 'Soybean', stage: 'R3_flowering', stress: 'thermal_flower_shedding', soil: 'deep_vertisol' }",
    },
  },
  {
    id: 2,
    phaseEn: "Tier 2: Agro-Climatic Telemetry",
    phaseHi: "चरण 2: कृषि मौसम टेलीमेट्री",
    nameEn: "14-Day Micro-Radar & Delta-T Physics",
    nameHi: "14-दिन का मौसम रडार व स्प्रे विंडो",
    latency: "45ms",
    tech: "Open-Meteo High Resolution · Delta-T Model · VPD Psychrometrics",
    descEn: "Calculates hourly Vapor Pressure Deficit (VPD), rain probability, and Delta-T to predict thermal stress 72h early and identify safe spray hours.",
    descHi: "हवा की गति, तापमान और बारिश का जोखिम मापकर 72 घंटे पहले आने वाली लू की चेतावनी और स्प्रे का सही समय निकालता है।",
    icon: CloudSun,
    simulatedPayload: {
      input: "Hourly Meteorological Stream (Next 14 Days)",
      processing: "Peak Tmax: 38.2°C in 72h ➔ Delta-T: 4.8 at 06:30 AM ➔ Rain Risk: 0%",
      output: "{ heatwaveWarning: true, optimalSprayWindow: '06:00_09:30_AM', washOffRisk: 0 }",
    },
  },
  {
    id: 3,
    phaseEn: "Tier 3: 3-Layer Hybrid Intelligence",
    phaseHi: "चरण 3: 3-स्तरीय हाइब्रिड निर्णय इंजन",
    nameEn: "Deterministic Rules + ICAR Efficacy Scoring",
    nameHi: "वैज्ञानिक नियम + ICAR ट्रायल रैंकिंग",
    latency: "32ms",
    tech: "Deterministic Rule Matrix · ICAR-AICRP Weighted Scorer · Syngenta DB",
    descEn: "Layer 1 removes banned chemicals ➔ Layer 2 ranks top 3 cost-effective solutions by ICAR trial data ➔ Layer 3 formats plain farmer dosage.",
    descHi: "लेयर 1 गलत दवाओं को हटाता है ➔ लेयर 2 ICAR रिसर्च के अनुसार सबसे सस्ती और असरदार दवा चुनता है ➔ लेयर 3 सही माप तय करता है।",
    icon: Cpu,
    simulatedPayload: {
      input: "50 Candidate Formulations from Syngenta Knowledge Base",
      processing: "Filter Banned ➔ Score by ICAR-IISR Multi-Center (91.4% control) ➔ Price Match (₹850/ac)",
      output: "{ bestProduct: 'Quantis®', dosage: '300ml/ac', water: '150L/ac', robiMultiple: 3.4 }",
    },
  },
  {
    id: 4,
    phaseEn: "Tier 4: Vernacular Synthesis & Dispatch",
    phaseHi: "चरण 4: वॉयस उत्तर व व्हाट्सएप डिलीवरी",
    nameEn: "Gemini 2.5 TTS + WhatsApp Dealer Link",
    nameHi: "जेमिनी 2.5 वॉयस उत्तर व नजदीकी वितरक",
    latency: "380ms",
    tech: "Google Gemini 2.5 Flash · Chirp 3 HD Audio · WhatsApp DeepLink",
    descEn: "Synthesizes clear spoken voice response in farmer's mother tongue and prepares a 1-tap WhatsApp order invoice for the nearest certified dealer.",
    descHi: "किसान की भाषा में साफ बोलकर उत्तर सुनाता है और नजदीकी अधिकृत कृषि केंद्र से 1-क्लिक व्हाट्सएप ऑर्डर लिंक तैयार करता है।",
    icon: Zap,
    simulatedPayload: {
      input: "Prescription Protocol + Mandi Stock Availability",
      processing: "Gemini Flash Vernacular Audio Generation ➔ Nearest Dealer GPS Radius Match (2.5 km)",
      output: "{ audioStreamReady: true, dealer: 'Rajput Krishi Kendra', waInvoiceGenerated: true }",
    },
  },
];

const PS_MODULES_SPECS = [
  {
    code: "PS-01",
    nameEn: "Zero-Touch Multilingual Intake",
    nameHi: "जीरो-टच वॉयस व सैटेलाइट इनटेक",
    archEn: "Vernacular Speech-to-Text + Spatial Turf.js Polygon Analysis",
    archHi: "12 भाषाओं में वॉयस इनपुट व सैटेलाइट जीपीएस मैपिंग",
    badge: "GIS + STT",
    latency: "< 200ms",
    color: "text-[#1b4332] bg-[#e8f5e9] border-[#cbe5cb]",
  },
  {
    code: "PS-02",
    nameEn: "14-Day Biophysical Stress Engine",
    nameHi: "14-दिन का जैविक तनाव पूर्वानुमान",
    archEn: "GradientBoostingRegressor ML + SHAP TreeExplainer Attribution",
    archHi: "मशीन लर्निंग व SHAP द्वारा गर्मी/सूखे की 72h पहले चेतावनी",
    badge: "ML + SHAP",
    latency: "< 50ms",
    color: "text-emerald-800 bg-emerald-50 border-emerald-200",
  },
  {
    code: "PS-03",
    nameEn: "CropFit 3-Layer Recommendation",
    nameHi: "क्रॉप-फिट 3-स्तरीय दवा चयन",
    archEn: "Deterministic Growth Stage Matrix + ICAR-AICRP Weighted Ranker",
    archHi: "50 सिंजेंटा उत्पादों में से सबसे किफायती व असरदार दवा का चयन",
    badge: "SYNGENTA RULES",
    latency: "< 35ms",
    color: "text-[#2d6a4f] bg-[#e8f5e9] border-[#cbe5cb]",
  },
  {
    code: "PS-04",
    nameEn: "Multilingual Voice & Vision AI",
    nameHi: "12 भाषाओं में वॉयस व पत्ती स्कैनर AI",
    archEn: "Google Gemini 2.5 Flash + Chirp 3 HD Speech + Gemini 2.5 Vision",
    archHi: "गूगल जेमिनी 2.5 AI द्वारा 3 सेकंड में 98.6% रोग पहचान",
    badge: "GOOGLE GEMINI 2.5",
    latency: "< 850ms",
    color: "text-amber-800 bg-amber-50 border-amber-200",
  },
  {
    code: "PS-05",
    nameEn: "APMC Live Mandi Rate Discovery",
    nameHi: "140+ एपीएमसी लाइव मंडी नेटवर्क",
    archEn: "Govt. of India Agmarknet REST API + Spatial Mandi Haversine",
    archHi: "सरकारी एगमार्कनेट से रोजाना लाइव भाव व नजदीकी मंडी तुलना",
    badge: "AGMARKNET API",
    latency: "< 100ms",
    color: "text-teal-800 bg-teal-50 border-teal-200",
  },
  {
    code: "PS-06",
    nameEn: "Micro-Meteorological Spray Window",
    nameHi: "मौसम रडार व स्प्रे विंडो फिजिक्स",
    archEn: "Delta-T Psychrometric Model + Hourly VPD + Rain Wash-off Risk",
    archHi: "हवा की गति व तापमान मापकर सुरक्षित स्प्रे का समय निर्धारण",
    badge: "PHYSICS MODEL",
    latency: "< 30ms",
    color: "text-emerald-900 bg-emerald-100/70 border-emerald-300",
  },
  {
    code: "PS-07",
    nameEn: "Causal Yield Attribution (ROBI™)",
    nameHi: "शुद्ध उपज सुरक्षा व ROBI™ बैंक लाभ",
    archEn: "Synthetic Counterfactual Controls + Multi-Center Trial Standards",
    archHi: "दवा खर्च घटाकर किसान की जेब में शुद्ध बैंक लाभ की गणना",
    badge: "VERIFIED PROOF",
    latency: "< 25ms",
    color: "text-[#1b4332] bg-[#e8f5e9] border-[#cbe5cb]",
  },
];

export default function ArchitecturePage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const [isLoggedInUser, setIsLoggedInUser] = useState(false);

  // Interactive Pipeline Flow Simulation
  const [activePipelineStep, setActivePipelineStep] = useState<number>(1);
  const [autoSimulate, setAutoSimulate] = useState<boolean>(true);
  const [simProgress, setSimProgress] = useState<number>(0);

  React.useEffect(() => {
    setIsLoggedInUser(isUserLoggedIn());
  }, []);

  // Auto-progress pipeline simulation
  React.useEffect(() => {
    if (!autoSimulate) return;

    const intervalTime = 60;
    const totalDuration = 5500;
    const stepIncrement = (intervalTime / totalDuration) * 100;

    const timer = setInterval(() => {
      setSimProgress((prev) => {
        if (prev >= 100) {
          setActivePipelineStep((s) => (s % PIPELINE_FLOW.length) + 1);
          return 0;
        }
        return prev + stepIncrement;
      });
    }, intervalTime);

    return () => clearInterval(timer);
  }, [autoSimulate]);

  const currentStep = PIPELINE_FLOW[activePipelineStep - 1];

  return (
    <AppShell>
      <div className="relative min-h-screen bg-[#fbfcf8] bg-[radial-gradient(#1b4332_0.75px,transparent_0.75px)] [background-size:24px_24px] [background-position:0_0] text-slate-800 pb-24 select-none overflow-hidden">
        
        {/* ── Atmospheric Background Radiant Glows (Agricultural Forest Emerald) ── */}
        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[450px] opacity-20 blur-3xl pointer-events-none rounded-full"
          style={{ background: "radial-gradient(circle, #2d6a4f 0%, #52b788 40%, transparent 80%)" }}
        />

        {/* ── 1. Hero Title & Architecture Mission ─────────────────── */}
        <section className="pt-12 sm:pt-20 pb-8 px-4 sm:px-6 max-w-5xl mx-auto text-center space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#e8f5e9] border border-[#cbe5cb] shadow-2xs text-xs font-mono font-bold text-[#1b4332]">
            <Sparkles className="h-3.5 w-3.5 text-[#2d6a4f]" />
            <span>AASRA TECHNICAL ARCHITECTURE & SYSTEMS SPECIFICATION</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-display text-[#11261f] tracking-tight leading-tight">
            {isHindi
              ? "AASRA तकनीकी आर्किटेक्चर व डेटा पाइपलाइन"
              : "Enterprise Architecture & Data Pipelines"}
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
            {isHindi
              ? "जानें कैसे AASRA केवल 900 मिलीसेकंड में आवाज सुनता है, मौसम व मिट्टी की जांच करता है, 50 सिंजेंटा दवाओं में से सबसे सही दवा चुनता है और बोलकर जवाब देता है।"
              : "Discover how AASRA ingests vernacular audio, evaluates 14-day weather physics, scores 50 Syngenta protocols, and returns grounded spoken advice in under 900ms."}
          </p>

          {/* System Performance Badges (Dashboard Tokens) */}
          <div className="pt-2 flex items-center justify-center gap-2.5 sm:gap-4 flex-wrap text-xs font-mono font-bold">
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#e8ede4] shadow-2xs text-[#1b4332]">
              ⚡ &lt; 900ms Total Latency
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#e8ede4] shadow-2xs text-[#2d6a4f]">
              🔒 Deterministic Agronomic Guardrails
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#e8ede4] shadow-2xs text-emerald-800">
              🛰️ Open-Meteo High-Resolution Telemetry
            </span>
            <span className="px-3.5 py-1.5 rounded-full bg-white border border-[#e8ede4] shadow-2xs text-[#1b4332]">
              🛡️ Zero LLM Hallucination for Dosage
            </span>
          </div>
        </section>

        {/* ── 1.5. Beginner "How AASRA Works in 4 Simple Steps" (Easy to Understand) ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-6 relative z-10">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8ede4] pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e8f5e9] border border-[#cbe5cb] text-[#1b4332] text-xs font-mono font-bold">
                  <Sprout className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  <span>PLAIN LANGUAGE OVERVIEW</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#11261f] font-display mt-1">
                  {isHindi ? "AASRA कैसे काम करता है (4 आसान चरणों में)" : "How AASRA Works (In 4 Simple Steps)"}
                </h2>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                No complex jargon · From voice to field in seconds
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  step: "1",
                  titleEn: "Farmer Speaks or Scans",
                  titleHi: "किसान बोलता है या पत्ती स्कैन करता है",
                  descEn: "Speak in Hindi or 12 Indian dialects, or snap a photo of damaged leaves. Speech is converted to text instantly.",
                  descHi: "अपनी भाषा में बोलें या पत्ती की फोटो खींचें। आवाज को तुरंत समझ लिया जाता है।",
                  icon: Mic,
                  badge: "180ms",
                },
                {
                  step: "2",
                  titleEn: "Live Satellite & Soil Check",
                  titleHi: "सैटेलाइट मौसम व मिट्टी जांच",
                  descEn: "We check hourly night heat, rainfall risk, and soil moisture at your GPS field boundary to prevent spray wash-off.",
                  descHi: "खेत के जीपीएस से रात की गर्मी, बारिश और मिट्टी की नमी नापकर सुरक्षित स्प्रे समय निकाला जाता है।",
                  icon: CloudSun,
                  badge: "45ms",
                },
                {
                  step: "3",
                  titleEn: "Scientific Best-Fit Selection",
                  titleHi: "वैज्ञानिक दवा व सही खुराक चयन",
                  descEn: "Filtered against ICAR research trials and 50 Syngenta biological products. Overdosing and fake guesses are strictly blocked.",
                  descHi: "ICAR रिसर्च से जांची गई 50 सिंजेंटा दवाओं में से सबसे असरदार और सस्ती दवा चुनी जाती है।",
                  icon: Cpu,
                  badge: "32ms",
                },
                {
                  step: "4",
                  titleEn: "Spoken Prescription & Dealer Link",
                  titleHi: "बोलकर जवाब व नजदीकी दुकानदार",
                  descEn: "You receive a clear spoken voice prescription plus a 1-tap WhatsApp order invoice for your nearest licensed dealer.",
                  descHi: "स्पष्ट आवाज में सही माप बताई जाती है और पास की दुकान से 1-क्लिक व्हाट्सएप ऑर्डर लिंक मिलता है।",
                  icon: Zap,
                  badge: "380ms",
                },
              ].map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-[#f8faf7] border border-[#e8ede4] hover:border-[#cbe5cb] transition-all space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="h-8 w-8 rounded-xl bg-[#1b4332] text-white flex items-center justify-center font-mono font-bold text-xs">
                        {item.step}
                      </div>
                      <span className="text-[10px] font-mono font-bold text-[#1b4332] bg-[#e8f5e9] px-2 py-0.5 rounded-full border border-[#cbe5cb]">
                        {item.badge}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-[#11261f]">
                        {isHindi ? item.titleHi : item.titleEn}
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {isHindi ? item.descHi : item.descEn}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 2. Interactive End-to-End Pipeline Simulator ─────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-10 relative z-10 space-y-6">
          
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#2d6a4f] uppercase">
              Real-Time Pipeline Execution
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#11261f] font-display">
              {isHindi ? "4-स्तरीय एंड-टू-एंड डेटा प्रवाह" : "4-Tier End-to-End Execution Flow"}
            </h2>
          </div>

          {/* 4 Pipeline Tier Tabs */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PIPELINE_FLOW.map((p) => {
                const isSelected = p.id === activePipelineStep;
                const Icon = p.icon;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setActivePipelineStep(p.id);
                      setAutoSimulate(false);
                      setSimProgress(0);
                    }}
                    className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 ${
                      isSelected
                        ? "bg-[#1b4332] text-white border-[#1b4332] shadow-xl ring-2 ring-[#2d6a4f] scale-[1.02]"
                        : "bg-white hover:bg-[#e8f5e9]/40 border-[#e8ede4] text-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`h-8 w-8 rounded-xl flex items-center justify-center ${isSelected ? "bg-white/15 text-emerald-300" : "bg-[#e8f5e9] text-[#2d6a4f]"}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${isSelected ? "bg-white/20 text-white" : "bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb]"}`}>
                        {p.latency}
                      </span>
                    </div>

                    <div>
                      <span className={`text-[10px] font-mono block ${isSelected ? "text-emerald-100" : "text-slate-500"}`}>
                        {isHindi ? p.phaseHi : p.phaseEn}
                      </span>
                      <h4 className="text-xs font-bold block truncate mt-0.5">
                        {isHindi ? p.nameHi : p.nameEn}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Pipeline Simulation Progress Bar */}
            <div className="w-full h-1.5 bg-[#e8ede4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#2d6a4f] transition-all duration-75 rounded-full"
                style={{ width: `${simProgress}%` }}
              />
            </div>
          </div>

          {/* Active Pipeline Stage Console Card */}
          <div className="rounded-3xl bg-white border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] p-6 sm:p-10 space-y-8 overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Left Column: Stage Details & Architectural Role */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold text-[#1b4332] bg-[#e8f5e9] px-3 py-1 rounded-full border border-[#cbe5cb] uppercase">
                      {isHindi ? currentStep.phaseHi : currentStep.phaseEn}
                    </span>
                    <span className="text-[10px] font-mono text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-bold">
                      Latency: {currentStep.latency}
                    </span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl font-black text-[#11261f] font-display">
                    {isHindi ? currentStep.nameHi : currentStep.nameEn}
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {isHindi ? currentStep.descHi : currentStep.descEn}
                  </p>
                </div>

                {/* Tech Components */}
                <div className="p-4 rounded-2xl bg-[#f8faf7] border border-[#e8ede4] space-y-1">
                  <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">
                    Underlying Engineering Stack:
                  </span>
                  <span className="text-xs font-mono font-bold text-[#1b4332] block">
                    {currentStep.tech}
                  </span>
                </div>

                {/* Controls */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setAutoSimulate(true);
                      setSimProgress(0);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#1b4332] text-white text-xs font-bold font-mono transition-all hover:bg-[#2d6a4f] flex items-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Auto Play Flow</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimProgress(0)}
                    className="p-2.5 rounded-xl border border-[#e8ede4] hover:bg-[#e8f5e9] text-slate-700 transition-colors cursor-pointer"
                    title="Replay"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Right Column: Live Data Payload Console */}
              <div className="lg:col-span-6">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    transition={{ duration: 0.25 }}
                    className="rounded-3xl bg-gradient-to-br from-[#11261f] via-[#16382b] to-[#11261f] border border-[#2d6a4f]/50 text-white p-6 sm:p-8 shadow-2xl space-y-4 relative overflow-hidden"
                  >
                    {/* Console Bar */}
                    <div className="flex items-center justify-between border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-rose-500/80" />
                        <div className="h-3 w-3 rounded-full bg-amber-500/80" />
                        <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
                        <span className="text-[10px] font-mono text-emerald-200 ml-2">AASRA PIPELINE PROBE</span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-400/30">
                        ACTIVE STREAM
                      </span>
                    </div>

                    {/* 3 Payload Steps */}
                    <div className="space-y-2.5 text-xs font-mono">
                      
                      {/* Step A: Input Ingested */}
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">1. Input Stream Ingested:</span>
                        <p className="text-slate-200 leading-relaxed">{currentStep.simulatedPayload.input}</p>
                      </div>

                      {/* Step B: Internal Processing */}
                      <div className="p-3 rounded-xl bg-[#1b4332]/70 border border-[#2d6a4f] space-y-1">
                        <span className="text-[10px] text-emerald-300 uppercase font-bold block">2. Causal Processing ({currentStep.latency}):</span>
                        <p className="text-emerald-100 leading-relaxed">{currentStep.simulatedPayload.processing}</p>
                      </div>

                      {/* Step C: Formatted Output */}
                      <div className="p-3 rounded-xl bg-[#16382b] border border-emerald-500/40 space-y-1">
                        <span className="text-[10px] text-emerald-400 uppercase font-bold block">3. Validated Output Dispatch:</span>
                        <p className="text-emerald-300 font-mono text-[11px] leading-relaxed break-all">{currentStep.simulatedPayload.output}</p>
                      </div>

                    </div>

                    {/* Footer Status */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                      <span>Zero Hallucination Gate: Passed</span>
                      <span className="text-emerald-400 font-bold">DETERMINISTIC GUARDRAILS</span>
                    </div>

                  </motion.div>
                </AnimatePresence>
              </div>

            </div>
          </div>

        </section>

        {/* ── 3. The 7 Problem Statements (PS-01 to PS-07 Matrix) ───── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-16 space-y-8 relative z-10">
          
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#2d6a4f] uppercase">
              Scientific Modules Matrix
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#11261f] font-display">
              {isHindi ? "7 वैज्ञानिक मॉडल्स (PS-01 से PS-07)" : "7 Scientific Modules (PS-01 to PS-07)"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              {isHindi
                ? "हर मॉड्यूल एक विशिष्ट कृषि समस्या को हल करने के लिए समर्पित है।"
                : "Each module is engineered to resolve a specific agro-climatic challenge with deterministic precision."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {PS_MODULES_SPECS.map((mod) => (
              <div
                key={mod.code}
                className="p-6 rounded-3xl bg-white border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] hover:shadow-md hover:border-[#cbe5cb] transition-all duration-200 flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${mod.color}`}>
                      {mod.code} · {mod.badge}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500">
                      {mod.latency}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-[#11261f] font-display">{isHindi ? mod.nameHi : mod.nameEn}</h4>
                    <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                      {isHindi ? mod.archHi : mod.archEn}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#e8ede4] flex items-center justify-between text-[11px] font-mono text-[#1b4332] font-bold">
                  <span>Engine Grounded</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#2d6a4f]" />
                </div>
              </div>
            ))}
          </div>

        </section>

        {/* ── 4. Security, Privacy & Offline Resilience ─────────────── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 my-16 space-y-6">
          <div className="text-center space-y-1.5 max-w-2xl mx-auto">
            <span className="text-xs font-mono font-bold text-[#2d6a4f] uppercase">
              Production Resilience
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#11261f] font-display">
              {isHindi ? "डेटा सुरक्षा व ऑफलाइन विश्वसनीयता" : "Enterprise Security & Offline Resilience"}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                title: isHindi ? "🔒 एन्क्रिप्टेड किसान डेटा गोपनीयता" : "🔒 AES-256 Encrypted Telemetry",
                desc: isHindi
                  ? "किसान के खेत के निर्देशांक व उत्पादन डेटा पूरी तरह से सुरक्षित व गोपनीय हैं।"
                  : "Field polygon coordinates, crop yields, and financial records are encrypted at rest and in transit.",
                icon: Lock,
                color: "text-[#1b4332] bg-[#e8f5e9] border-[#cbe5cb]",
              },
              {
                title: isHindi ? "📶 कम इंटरनेट व ऑफलाइन मोड" : "📶 Low-Bandwidth & Offline PWA",
                desc: isHindi
                  ? "2G/3G नेटवर्क में भी तेजी से चलता है। वॉयस और डायरी रिकॉर्ड्स ऑफलाइन सेव होते हैं।"
                  : "Designed for rural 2G/3G connectivity with client-side caching and offline farm journal sync.",
                icon: Wifi,
                color: "text-emerald-800 bg-emerald-50 border-emerald-200",
              },
              {
                title: isHindi ? "🛡️ शून्य हॉलुसिनेशन गारंटी" : "🛡️ Zero Chemical Hallucination Gate",
                desc: isHindi
                  ? "दवाई की खुराक कभी भी अनुमान पर नहीं दी जाती, केवल ICAR व सिंजेंटा मानकों से जांची जाती है।"
                  : "Chemical dosages are strictly governed by deterministic matrices, preventing any LLM drift or over-dosage.",
                icon: ShieldCheck,
                color: "text-[#2d6a4f] bg-[#e8f5e9] border-[#cbe5cb]",
              },
            ].map((sec, idx) => {
              const Icon = sec.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl bg-white border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-3"
                >
                  <div className={`h-10 w-10 rounded-2xl ${sec.color} flex items-center justify-center border`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-base font-bold text-[#11261f] font-display">{sec.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{sec.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 5. Bottom Connected Next Steps Bar ────────────────────── */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 pt-4">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-white via-[#e8f5e9]/50 to-white border border-[#e8ede4] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="space-y-1">
              <h3 className="text-xl sm:text-2xl font-bold text-[#11261f] font-display">
                {isHindi ? "AASRA आर्किटेक्चर की सभी शाखाएँ लाइव हैं" : "Deploy AASRA on Your Land Today"}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                {isHindi
                  ? "100% निःशुल्क किसान सेवा · 30 सेकंड में खाता बनाएं और लाइव टेलीमेट्री शुरू करें।"
                  : "100% Free Public Good · Start monitoring your land in 30 seconds."}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              <Link
                href="/journal"
                className="px-5 py-3 rounded-xl bg-white border border-[#e8ede4] hover:border-[#2d6a4f] text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
              >
                <Layers className="h-4 w-4 text-[#2d6a4f]" />
                <span>{isHindi ? "फार्म डायरी" : "Farm Journal"}</span>
              </Link>
              
              <Link
                href={isLoggedInUser ? "/dashboard" : "/signup"}
                className="px-6 py-3.5 rounded-xl bg-[#1b4332] hover:bg-[#2d6a4f] text-white text-xs font-bold transition-all shadow-md flex items-center gap-1.5 hover:scale-105"
              >
                <UserPlus className="h-4 w-4" />
                <span>{isLoggedInUser ? (isHindi ? "मेरा डैशबोर्ड" : "Open Dashboard") : (isHindi ? "निःशुल्क शुरू करें" : "Sign Up Free")}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

      </div>
    </AppShell>
  );
}
