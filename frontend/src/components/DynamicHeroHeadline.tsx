"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  CloudRain,
  Store,
  Leaf,
  ShieldAlert,
  Play,
  ArrowRight,
  MapPin,
  Sprout,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Lock,
  Activity,
  UserPlus,
  ShieldCheck,
  ChevronRight,
  Cpu,
  Layers,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { isUserLoggedIn } from "@/lib/userStore";
import { useFarm } from "@/context/FarmContext";
import { PhoneMockup } from "@/components/PhoneMockup";
import { FeatureDetailModal, FeatureDetailData } from "@/components/FeatureDetailModal";

const featureChips: FeatureDetailData[] = [
  {
    id: "weather",
    badge: "Open-Meteo & Meteoblue Live",
    badgeBg: "bg-indigo-100/90",
    badgeText: "text-indigo-800",
    accentColor: "#533afd",
    icon: <CloudRain className="h-4 w-4 text-[#533afd]" />,
    iconBg: "bg-indigo-100/80",
    bg: "bg-indigo-50/70 hover:bg-indigo-50",
    border: "border-indigo-100 hover:border-indigo-300",
    text: "text-indigo-950",
    subtext: "text-indigo-700/80",
    delay: "300ms",
    label: "सूक्ष्म-मौसम रडार",
    sublabel: "14-दिन का सटीक खेत पूर्वानुमान",
    labelEn: "Micro-Weather Radar",
    sublabelEn: "14-Day Hyperlocal Forecast",
    title: "Micro-Weather Radar & Safe Spray Window",
    titleHi: "खेत स्तरीय मौसम रडार व सुरक्षित स्प्रे समय",
    subtitle: "14-day agrometeorological forecast, wind drift alerts, and root-zone moisture tracking directly over your farm.",
    subtitleHi: "ठीक आपके खेत के ऊपर 14-दिन का मौसम, हवा की गति और सुरक्षित छिड़काव का समय।",
    simpleExplanation: "General weather apps only predict conditions for an entire district. AASRA tracks rain, temperature, and wind directly over your field coordinates—telling you the exact hour it is safe to spray fertilizer or pesticide so your money is never blown away or washed off.",
    simpleExplanationHi: "पूरे जिले का मौसम देखकर खेत के सही फैसले नहीं लिए जा सकते। AASRA ठीक आपके खेत के ऊपर 14-दिन की बारिश, धूप और हवा की गति मापता है ताकि आपकी महंगी दवा या खाद हवा में न उड़े और सही समय पर पूरा फायदा दे।",
    benefits: [
      {
        title: "Prevents Spray Waste & Drift",
        titleHi: "दवा के व्यर्थ बहने व उड़ने से बचाव",
        desc: "Warns if wind speed or Delta-T drying rate is too high, keeping your chemical budget completely protected.",
        descHi: "तेज हवा या अधिक गर्मी होने पर रोकता है ताकि स्प्रे हवा में उड़कर बर्बाद न हो।",
      },
      {
        title: "14-Day Rain & Soil Moisture Tracking",
        titleHi: "14-दिन की बारिश व मिट्टी की नमी",
        desc: "Tracks 0-10cm root-zone soil moisture to alert you days before plants enter severe drought stress.",
        descHi: "जड़ों में नमी की निगरानी करता है ताकि फसल सूखने से पहले ही समय पर सिंचाई की जा सके।",
      },
      {
        title: "Night Heat Wave Alarms",
        titleHi: "रात के तापमान (नाइट हीट) का अलर्ट",
        desc: "Flags hot nights during flowering so you can take protective measures against flower shedding.",
        descHi: "फूल आने के समय रात का तापमान बढ़ने पर तुरंत चेतावनी देता है ताकि फूल झड़ने से बचाए जा सकें।",
      },
    ],
    techSpecs: [
      { label: "Data Providers", value: "Open-Meteo & Meteoblue" },
      { label: "Biophysical Gate", value: "Delta-T & Stull Wet-Bulb" },
      { label: "Forecast Range", value: "14-Day Hourly GPS" },
    ],
    actionLabel: "Explore Live Farm Weather",
    actionLabelHi: "खेत का लाइव मौसम देखें",
    actionHref: "/weather",
  },
  {
    id: "mandi",
    badge: "140+ Govt APMC Mandis",
    badgeBg: "bg-emerald-100/90",
    badgeText: "text-emerald-800",
    accentColor: "#10b981",
    icon: <Store className="h-4 w-4 text-emerald-600" />,
    iconBg: "bg-emerald-100/80",
    bg: "bg-emerald-50/70 hover:bg-emerald-50",
    border: "border-emerald-100 hover:border-emerald-300",
    text: "text-emerald-950",
    subtext: "text-emerald-700/80",
    delay: "400ms",
    label: "APMC मंडी भाव नेटवर्क",
    sublabel: "140+ सत्यापित लाइव मंडियां",
    labelEn: "APMC Mandi Network",
    sublabelEn: "140+ Verified Live Markets",
    title: "140+ Certified APMC Mandi Price Network",
    titleHi: "140+ सत्यापित APMC सरकारी मंडी नेटवर्क",
    subtitle: "Daily real-time modal prices, Minimum Support Price (MSP) benchmarks, and top nearby selling options.",
    subtitleHi: "लाइव सरकारी मंडी भाव, न्यूनतम समर्थन मूल्य (MSP) तुलना और सबसे ज्यादा मुनाफा देने वाली मंडी का सुझाव।",
    simpleExplanation: "Local middlemen often misquote crop prices to buy cheap. AASRA connects directly to 140+ government-regulated mandis every morning, showing daily auction rates, price trends, and which nearby market will fetch you the highest rate per quintal.",
    simpleExplanationHi: "बिचौलिए अक्सर किसानों को मंडी के सही भाव नहीं बताते। AASRA मध्य प्रदेश, यूपी, पंजाब, गुजरात और महाराष्ट्र की 140+ सरकारी मंडियों से सीधे जुड़ा है। यह आपको आज का सही भाव और सबसे ज्यादा मुनाफा देने वाली मंडी का सुझाव देता है।",
    benefits: [
      {
        title: "Official MSP Comparison",
        titleHi: "सरकारी एमएसपी (MSP) से तुलना",
        desc: "Compares current bids against Government Minimum Support Price (e.g. Soybean MSP ₹4,892/Q) to prevent distress selling.",
        descHi: "सरकारी एमएसपी के साथ लाइव भाव की तुलना करता है ताकि आपको अपनी उपज का पूरा और उचित मूल्य मिले।",
      },
      {
        title: "Nearby Mandi Profit Discovery",
        titleHi: "आस-पास की सबसे फायदेमंद मंडी",
        desc: "Finds neighboring mandis paying ₹150–₹350/Q higher within easy transport distance.",
        descHi: "आस-पास की उन मंडियों की पहचान करता है जहां ₹150 से ₹350 प्रति क्विंटल तक ज्यादा दाम मिल रहे हों।",
      },
      {
        title: "Real Cash Profit Calculation",
        titleHi: "संरक्षित उपज का नकद मूल्य",
        desc: "Multiplies your yield saved by biological protection by today's live rate to show net cash profit in rupees.",
        descHi: "जैविक उपचार से बची फसल को लाइव मंडी भाव से जोड़कर आपके खेत का शुद्ध मुनाफा (रुपयों में) दिखाता है।",
      },
    ],
    techSpecs: [
      { label: "Live Mandis", value: "140+ APMC Centers" },
      { label: "Official Source", value: "Agmarknet & e-NAM" },
      { label: "Updates", value: "Daily Real-time Feed" },
    ],
    actionLabel: "View Verified Mandi Prices",
    actionLabelHi: "सत्यापित मंडी भाव देखें",
    actionHref: "/dashboard",
  },
  {
    id: "models",
    badge: "Vertex AI & EconML Engine",
    badgeBg: "bg-amber-100/90",
    badgeText: "text-amber-800",
    accentColor: "#f59e0b",
    icon: <Cpu className="h-4 w-4 text-amber-600" />,
    iconBg: "bg-amber-100/80",
    bg: "bg-amber-50/70 hover:bg-amber-50",
    border: "border-amber-100 hover:border-amber-300",
    text: "text-amber-950",
    subtext: "text-amber-700/80",
    delay: "500ms",
    label: "मल्टी-क्रॉप AI सलाहकार",
    sublabel: "6-मॉडल वर्टेक्स AI • 60+ फसलें",
    labelEn: "Multi-Crop AI Advisory",
    sublabelEn: "6-Model Engine • 60+ Crops",
    title: "Multi-Crop 6-Model AI Decision Engine",
    titleHi: "6 विशेषीकृत AI मॉडल व फसल सलाहकार प्रणाली",
    subtitle: "Specialized machine learning models for early stress warning, spray safety gating, certified biological ranking, and net ROI proof.",
    subtitleHi: "मौसम तनाव पूर्वानुमान, सुरक्षित स्प्रे समय, प्रमाणित सिंजेंटा उत्पाद रैंकिंग और शुद्ध लाभ का पक्का गणित।",
    simpleExplanation: "A generic chatbot makes guesses about chemical doses that can scorch plants. AASRA decouples agricultural intelligence into 6 dedicated models: Model 1 detects heat/drought stress 7 days early, Model 2 confirms leaf spray safety, Model 3 ranks top biologicals, and Model 6 proves your net profit in rupees.",
    simpleExplanationHi: "साधारण चैटबॉट गलत दवाएं बताकर फसल को नुकसान पहुंचा सकते हैं। AASRA ने 6 अलग-अलग विशेषीकृत मॉडल बनाए हैं: मॉडल 1 मौसम का तनाव भांपता है, मॉडल 2 स्प्रे का सुरक्षित समय बताता है, मॉडल 3 सही दवा चुनता है, और मॉडल 6 साबित करता है कि आपको कितना शुद्ध मुनाफा हुआ।",
    benefits: [
      {
        title: "3 to 7 Days Early Stress Forecast",
        titleHi: "3 से 7 दिन पहले तनाव की चेतावनी",
        desc: "Alerts you before heat or moisture deficit causes irreversible damage to flowering and pod formation.",
        descHi: "ताप और सूखे का 3 से 7 दिन पहले पूर्वानुमान लगाकर फसल को नुकसान से बचाता है।",
      },
      {
        title: "Syngenta Biologicals Ranking",
        titleHi: "शीर्ष प्रमाणित दवाओं का चयन",
        desc: "Ranks top crop-safe biological solutions (Quantis, Isabion) with exact dose recommendations per acre.",
        descHi: "आपकी फसल के लिए सबसे उपयुक्त शीर्ष जैविक दवा और उसकी प्रति एकड़ सटीक मात्रा बताता है।",
      },
      {
        title: "Net Farmer Profit Guarantee",
        titleHi: "शुद्ध अतिरिक्त मुनाफे का पक्का हिसाब",
        desc: "Calculates the true additional quintals harvested and net cash profit in farmer pockets.",
        descHi: "प्रमाणित करता है कि दवा डालने के बाद सभी खर्चे काटकर किसान को कितना अतिरिक्त शुद्ध नकद फायदा हुआ।",
      },
    ],
    techSpecs: [
      { label: "AI Engine", value: "Vertex AI & EconML" },
      { label: "Crops Supported", value: "60+ Certified Crops" },
      { label: "Languages", value: "12 Indian Dialects" },
    ],
    actionLabel: "Explore Plant Intelligence",
    actionLabelHi: "पादप बुद्धिमत्ता देखें",
    actionHref: "/plant-intelligence",
  },
  {
    id: "vision",
    badge: "Gemini 2.5 Multimodal Vision",
    badgeBg: "bg-violet-100/90",
    badgeText: "text-violet-800",
    accentColor: "#7c3aed",
    icon: <ShieldAlert className="h-4 w-4 text-violet-600" />,
    iconBg: "bg-violet-100/80",
    bg: "bg-violet-50/70 hover:bg-violet-50",
    border: "border-violet-100 hover:border-violet-300",
    text: "text-violet-950",
    subtext: "text-violet-700/80",
    delay: "600ms",
    label: "AI दृष्टि रोग व कीट पहचान",
    sublabel: "पत्ती स्कैन से तुरंत सटीक समाधान",
    labelEn: "Vision Diagnostics",
    sublabelEn: "Instant Leaf Necrosis Analysis",
    title: "Instant Multimodal Vision & Disease Diagnostics",
    titleHi: "AI कैमरा द्वारा पत्ती रोग व कीट निदान",
    subtitle: "Snap a photo of any crop leaf with your phone camera for instant diagnosis and certified treatment.",
    subtitleHi: "फोन कैमरे से पत्ती का फोटो खींचें, रोग की तुरंत पहचान करें और सुरक्षित छिड़काव का नुस्खा पाएं।",
    simpleExplanation: "When leaves turn yellow, curl, or develop dark spots, guessing the medicine wastes money and can kill the plant. Snap a photo with your smartphone camera. AASRA's vision AI identifies fungal rusts, blights, or heat stress in 2 seconds and prescribes certified safe treatments.",
    simpleExplanationHi: "जब फसल की पत्तियां पीली पड़ने लगें या धब्बे आ जाएं, तो गलत दवा डालने से नुकसान हो सकता है। बीमार पत्ती का फोटो खींचिए—AASRA का AI कैमरा तुरंत फंगस, कीट या गर्मी के तनाव की पहचान करता है और सुरक्षित समाधान बताता है।",
    benefits: [
      {
        title: "2-Second Camera Photo Diagnosis",
        titleHi: "2 सेकंड में कैमरे से रोग पहचान",
        desc: "Instantly detects blights, powdery mildew, caterpillar bites, and nutrient deficiencies from a single leaf photo.",
        descHi: "स्मार्टफोन कैमरे से रोगग्रस्त पत्ती की फोटो लें और तुरंत बीमारी का नाम व गंभीरता जानें।",
      },
      {
        title: "Separates Heat Scorch from Fungus",
        titleHi: "धूप के झुलसाव बनाम फंगस में अंतर",
        desc: "Differentiates abiotic sun scorch from fungal blight so you do not buy costly, unnecessary fungicides.",
        descHi: "पहचानता है कि पत्ती गर्मी से झुलसी है या फंगस से, ताकि गलत दवा का बेवजह खर्च न हो।",
      },
      {
        title: "Certified Tank-Mix Prescriptions",
        titleHi: "प्रमाणित सुरक्षित दवा व सही मात्रा",
        desc: "Provides certified compatibility ratios and safe water mixing steps for fast plant recovery.",
        descHi: "दवा और पानी का सही अनुपात बताता है ताकि फसल तुरंत ठीक होकर बढ़वार शुरू कर दे।",
      },
    ],
    techSpecs: [
      { label: "Vision AI", value: "Gemini 2.5 Flash Multimodal" },
      { label: "Speed", value: "Instant (< 2s)" },
      { label: "Accuracy", value: "Field Tested & Grounded" },
    ],
    actionLabel: "Open Leaf Disease Scanner",
    actionLabelHi: "रोग स्कैनर खोलें",
    actionHref: "/plant-intelligence",
  },
];

export const DynamicHeroHeadline: React.FC = () => {
  const { language } = useLanguage();
  const { activeFarm } = useFarm();
  const [mounted, setMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureDetailData | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(isUserLoggedIn());
  }, []);

  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const headline1 = isHindi ? "डेटा से समझदारी," : "Data-Driven Decisions,";
  const headline2 = isHindi ? "समझदारी से" : "Engineered for";
  const highlight = isHindi ? "समृद्धि।" : "Agricultural Growth.";
  const subtext = isHindi
    ? "AASRA का अत्याधुनिक AI प्लेटफॉर्म भारत के किसानों को लाइव मौसम टेलीमेट्री, सत्यापित APMC मंडी भाव, 60+ फसलों की व्यक्तिगत सलाह और AI रोग पहचान प्रदान करता है।"
    : "AASRA delivers hyper-local satellite telemetry, certified APMC mandi prices, multi-crop agronomic advisory, and computer-vision disease diagnosis tailored for Indian agriculture.";
  const ctaPrimary = isLoggedIn
    ? (isHindi ? "मेरा खेत खोलें" : "Go to Dashboard")
    : (isHindi ? "अपनी खेती शुरू करें (निःशुल्क)" : "Start Free Farm Account");
  const ctaSecondary = isHindi ? "प्लेटफॉर्म कैसे काम करता है" : "How It Works";
  const ctaNote = isHindi ? "30 सेकंड में साइन अप करें · 100% निःशुल्क किसान सेवा" : "Sign up in 30 seconds · 100% Free for Farmers";

  return (
    <section
      className="relative overflow-hidden border-b border-[#e3e8ee]"
      style={{
        background: "radial-gradient(120% 120% at 50% 0%, #FFFFFF 0%, #F8FAFC 45%, #EEF2FF 100%)",
        minHeight: "calc(100vh - 68px)",
      }}
    >
      {/* Atmospheric Stripe-style gradient mesh */}
      <div
        className="absolute top-[-140px] left-[5%] w-[640px] h-[640px] rounded-full opacity-25 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, #533afd 0%, #665efd 35%, #b9b9f9 70%, transparent 85%)" }}
      />
      <div
        className="absolute top-[-60px] right-[10%] w-[520px] h-[520px] rounded-full opacity-20 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, #f5e9d4 0%, #f96bee 40%, #533afd 75%, transparent 90%)" }}
      />
      <div
        className="absolute top-[28%] left-[30%] w-[480px] h-[480px] rounded-full opacity-10 pointer-events-none blur-3xl"
        style={{ background: "radial-gradient(circle, #0ea5e9 0%, #10b981 50%, transparent 80%)" }}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center min-h-[calc(100vh-68px)] py-10 lg:py-16">

          {/* ── LEFT COLUMN: Headline, Chips, CTAs (Span 7) ─────────────────── */}
          <div className="lg:col-span-7 space-y-6 lg:pr-4">
            
            {/* 1. Trust badge */}
            <div
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(12px)",
                transition: "opacity 400ms ease 100ms, transform 400ms ease 100ms",
              }}
            >
              <div className="inline-flex items-center gap-2 bg-white border border-[#e3e8ee] rounded-full px-3.5 py-1.5 text-xs font-bold text-[#0d253d] shadow-xs hover:border-[#533afd]/40 transition-colors">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#533afd] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#533afd]"></span>
                </span>
                <span className="text-[#0d253d] font-semibold">Google Gemini 2.5 Flash</span>
                <span className="text-slate-300">·</span>
                <span className="text-[#533afd] font-mono font-semibold">Open-Meteo Telemetry</span>
                <span className="text-slate-300">·</span>
                <span className="text-emerald-700 font-mono font-semibold">140+ APMC Mandis</span>
              </div>
            </div>

            {/* 2. Headline */}
            <div
              className="space-y-1"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(16px)",
                transition: "opacity 500ms ease 200ms, transform 500ms ease 200ms",
              }}
            >
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-[#0d253d] leading-[1.08] tracking-tight font-display">
                {headline1}
              </h1>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.6rem] font-bold text-[#0d253d] leading-[1.08] tracking-tight font-display">
                <span>{headline2} </span>
                <span
                  className="bg-gradient-to-r from-[#533afd] via-[#4434d4] to-[#0ea5e9] bg-clip-text text-transparent font-black"
                >
                  {highlight}
                </span>
              </h1>
            </div>

            {/* 3. Description */}
            <p
              className="text-sm sm:text-base text-[#64748d] leading-relaxed max-w-xl font-normal"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 500ms ease 350ms, transform 500ms ease 350ms",
              }}
            >
              {subtext}
            </p>

            {/* 4. Feature chips */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg pt-1">
              {featureChips.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  onClick={() => setSelectedFeature(chip)}
                  className={`group flex items-center justify-between gap-3 ${chip.bg} border ${chip.border} rounded-xl px-3.5 py-3 shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer text-left w-full`}
                  style={{
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? "translateY(0)" : "translateY(14px)",
                    transition: `opacity 450ms ease ${chip.delay || "300ms"}, transform 450ms cubic-bezier(0.16, 1, 0.3, 1) ${chip.delay || "300ms"}`,
                  }}
                  title={isHindi ? "विस्तृत जानकारी के लिए क्लिक करें" : "Click to view detailed explanation"}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`${chip.iconBg} rounded-lg p-2 shrink-0 transition-transform duration-200 group-hover:scale-110 shadow-2xs`}>
                      {chip.icon}
                    </div>
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <p className={`text-xs font-bold ${chip.text} leading-tight truncate`}>
                        {isHindi ? chip.label : chip.labelEn}
                      </p>
                      <p className={`text-[11px] ${chip.subtext} leading-tight truncate`}>
                        {isHindi ? chip.sublabel : chip.sublabelEn}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-500 shrink-0" />
                </button>
              ))}
            </div>

            {/* 5. CTA buttons & Trust Note */}
            <div
              className="space-y-3 pt-2"
              style={{
                opacity: mounted ? 1 : 0,
                transform: mounted ? "translateY(0)" : "translateY(14px)",
                transition: "opacity 500ms ease 650ms, transform 500ms ease 650ms",
              }}
            >
              <div className="flex flex-wrap items-center gap-3.5">
                <Link
                  href={isLoggedIn ? "/dashboard" : "/signup"}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-xl transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  style={{
                    background: "linear-gradient(135deg, #533afd 0%, #4434d4 100%)",
                    boxShadow: "0 6px 20px rgba(83, 58, 253, 0.28)",
                  }}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{ctaPrimary}</span>
                  <ArrowRight className="h-4 w-4 ml-0.5" />
                </Link>

                <Link
                  href="/how-it-works"
                  className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-[#0d253d] bg-white border border-[#e3e8ee] hover:border-[#533afd]/40 hover:text-[#533afd] shadow-xs hover:shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                >
                  <Sparkles className="h-4 w-4 text-[#533afd]" />
                  <span>{ctaSecondary}</span>
                </Link>
              </div>

              {/* Dynamic location pill + trust note */}
              <div className="flex items-center gap-2.5 text-xs text-slate-500 pt-1">
                {mounted && activeFarm?.district ? (
                  <span className="inline-flex items-center gap-1 bg-white border border-[#e3e8ee] rounded-full px-2.5 py-1 text-[11px] font-medium text-slate-700 shadow-2xs">
                    <MapPin className="h-3 w-3 text-[#533afd]" />
                    <span>{activeFarm.district}{activeFarm.state ? `, ${activeFarm.state}` : ""}</span>
                  </span>
                ) : null}
                <span className="text-[11px] text-slate-500 font-medium">✓ {ctaNote}</span>
              </div>
            </div>

          </div>

          {/* ── RIGHT COLUMN: Interactive Smartphone Web App Mockup (Span 5) ───────────── */}
          <div
            className="lg:col-span-5 relative flex items-center justify-center py-4"
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? "translateY(0)" : "translateY(24px)",
              transition: "opacity 600ms ease 300ms, transform 600ms ease 300ms",
            }}
          >
            <PhoneMockup
              location={mounted && activeFarm?.district ? `${activeFarm.district}, ${activeFarm.state || "Madhya Pradesh"}` : undefined}
              temperature={28}
              crop="गेहूं (Wheat)"
              mandiPrice={2420}
            />
          </div>

        </div>
      </div>

      {/* Interactive Feature Detail Modal */}
      <FeatureDetailModal
        isOpen={!!selectedFeature}
        feature={selectedFeature}
        onClose={() => setSelectedFeature(null)}
        isHindi={isHindi}
      />
    </section>
  );
};
