"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Sparkles, Sprout, Sun, Flower2, Wheat, CheckCircle2 } from "lucide-react";

interface PlantPhase {
  id: number;
  phaseNumber: string;
  days: string;
  daysHi: string;
  nameEn: string;
  nameHi: string;
  titleEn: string;
  titleHi: string;
  descEn: string;
  descHi: string;
  fieldImpactEn: string;
  fieldImpactHi: string;
  tagBg: string;
  tagText: string;
  tagBorder: string;
  stemHeight: number;
  stemColor: string;
  leafScale: number;
  leafColor: string;
  flowerCount: number;
  podCount: number;
  isHarvest: boolean;
}

const PHASES: PlantPhase[] = [
  {
    id: 1,
    phaseNumber: "01",
    days: "Days 1 – 10",
    daysHi: "दिन 1 – 10",
    nameEn: "Germination & Emergence",
    nameHi: "अंकुरण व शुरुआती बढ़वार",
    titleEn: "Roots Anchor Deep into the Soil",
    titleHi: "जड़ों का फैलाव और पहला अंकुर",
    descEn: "The seed absorbs soil moisture and sends down primary roots. The first green sprout breaks through the ground.",
    descHi: "मिट्टी की नमी पाकर बीज अंकुरित होता है। प्राथमिक जड़ें नीचे फैलती हैं और पहला हरा अंकुर बाहर निकलता है।",
    fieldImpactEn: "Early root vigor establishes strong drought resistance.",
    fieldImpactHi: "मजबूत शुरुआती जड़ें फसल को आगे सूखे से बचाती हैं।",
    tagBg: "bg-emerald-50",
    tagText: "text-emerald-700",
    tagBorder: "border-emerald-200",
    stemHeight: 35,
    stemColor: "#4caf50",
    leafScale: 0.4,
    leafColor: "#66bb6a",
    flowerCount: 0,
    podCount: 0,
    isHarvest: false,
  },
  {
    id: 2,
    phaseNumber: "02",
    days: "Days 15 – 40",
    daysHi: "दिन 15 – 40",
    nameEn: "Vegetative Growth & Canopy",
    nameHi: "शाखा विस्तार व हरी पत्तियां",
    titleEn: "Lush Green Canopy Captures Sunlight",
    titleHi: "मजबूत तना और चौड़ी हरी पत्तियां",
    descEn: "Stems strengthen and broad leaves spread out. The crop absorbs sunlight and nutrients for rapid biomass creation.",
    descHi: "पौधे का तना मजबूत होता है और चौड़ी हरी पत्तियां फैलती हैं। धूप और पोषक तत्वों से पौधा तेजी से बढ़ता है।",
    fieldImpactEn: "Healthy canopy suppresses weeds and cools root soil.",
    fieldImpactHi: "घना तना खरपतवार रोकता है और मिट्टी में नमी बनाए रखता है।",
    tagBg: "bg-teal-50",
    tagText: "text-teal-700",
    tagBorder: "border-teal-200",
    stemHeight: 70,
    stemColor: "#2e7d32",
    leafScale: 0.8,
    leafColor: "#43a047",
    flowerCount: 0,
    podCount: 0,
    isHarvest: false,
  },
  {
    id: 3,
    phaseNumber: "03",
    days: "Days 45 – 65",
    daysHi: "दिन 45 – 65",
    nameEn: "Flowering & Pollination",
    nameHi: "फूल आना व परागण",
    titleEn: "Delicate Blossoms Open for Pollination",
    titleHi: "फूल खिलने की सबसे नाजुक अवस्था",
    descEn: "Bright flowers emerge at the crown. Weather monitoring ensures heat or strong winds do not cause flower shedding.",
    descHi: "पौधे पर पीले फूल खिलते हैं। इस समय अत्यधिक गर्मी या तेज हवा से फूल झड़ने से बचाना सबसे जरूरी होता है।",
    fieldImpactEn: "Guarding flowers directly protects 100% of final grain count.",
    fieldImpactHi: "फूलों की सुरक्षा ही फसल की अंतिम पैदावार तय करती है।",
    tagBg: "bg-amber-50",
    tagText: "text-amber-700",
    tagBorder: "border-amber-200",
    stemHeight: 100,
    stemColor: "#2e7d32",
    leafScale: 1.0,
    leafColor: "#388e3c",
    flowerCount: 3,
    podCount: 0,
    isHarvest: false,
  },
  {
    id: 4,
    phaseNumber: "04",
    days: "Days 70 – 95",
    daysHi: "दिन 70 – 95",
    nameEn: "Pod Setting & Grain Fill",
    nameHi: "फली व दाना भराव",
    titleEn: "Nutrients Flow into Heavy Grains",
    titleHi: "ठोस, चमकदार और भारी दाने का भराव",
    descEn: "Flowers convert into plump pods and grain ears. Sugars and minerals accumulate, creating heavy, dense produce.",
    descHi: "फूल फलियों और बालियों में बदल जाते हैं। पत्तियों का रस दानों में उतरता है, जिससे दाना मोटा और वजनदार बनता है।",
    fieldImpactEn: "Biostimulant protection increases test grain weight by +18%.",
    fieldImpactHi: "सही पोषण से दाने का वजन व चमक 18% तक बढ़ जाती है।",
    tagBg: "bg-indigo-50",
    tagText: "text-indigo-700",
    tagBorder: "border-indigo-200",
    stemHeight: 110,
    stemColor: "#388e3c",
    leafScale: 1.0,
    leafColor: "#4caf50",
    flowerCount: 0,
    podCount: 4,
    isHarvest: false,
  },
  {
    id: 5,
    phaseNumber: "05",
    days: "Days 100 – 120",
    daysHi: "दिन 100 – 120",
    nameEn: "Golden Ripening & Harvest",
    nameHi: "सुनहरी फसल व कटाई",
    titleEn: "Bumper Harvest Ready for Top Mandi Rate",
    titleHi: "पकी हुई सुनहरी फसल और अधिकतम मुनाफा",
    descEn: "The field turns to golden amber. Crop reaches peak quality and moisture, ready for market realization across 140+ mandis.",
    descHi: "फसल पककर सुनहरी हो जाती है। उच्च गुणवत्ता की उपज तैयार है, जिसे 140+ मंडियों में सबसे ज्यादा भाव पर बेचा जा सकता है।",
    fieldImpactEn: "Full harvest potential realized with verified zero loss.",
    fieldImpactHi: "सुरक्षित फसल से किसान को मिलता है पूरा और अधिकतम लाभ।",
    tagBg: "bg-amber-100/80",
    tagText: "text-amber-800",
    tagBorder: "border-amber-300",
    stemHeight: 110,
    stemColor: "#b58117",
    leafScale: 0.9,
    leafColor: "#c89d28",
    flowerCount: 0,
    podCount: 5,
    isHarvest: true,
  },
];

export const LiveFarmSimulator: React.FC = () => {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);

  const [phaseIndex, setPhaseIndex] = useState(0);

  // Auto simulation loop: transitions every 3.5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setPhaseIndex((prev) => (prev + 1) % PHASES.length);
    }, 3600);
    return () => clearInterval(timer);
  }, []);

  const currentPhase = PHASES[phaseIndex];

  return (
    <div className="w-full bg-white border border-[#e3e8ee] rounded-3xl shadow-xl overflow-hidden text-left transition-all duration-300">
      {/* ── Auto Simulation Header (Clean & Minimal) ────────────────────────── */}
      <div className="bg-[#f6f9fc] border-b border-[#e3e8ee] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#533afd]">
            {isHindi ? "स्वचालित फसल जीवन-चक्र सिमुलेटर" : "Autonomous Crop Growth Simulation"}
          </span>
          <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-200">
            Auto-Timelapse
          </span>
        </div>

        {/* Phase Indicator Pills */}
        <div className="flex items-center gap-1.5">
          {PHASES.map((p, idx) => (
            <div
              key={p.id}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === phaseIndex
                  ? "w-7 bg-[#533afd]"
                  : "w-2 bg-slate-200"
              }`}
            />
          ))}
        </div>
      </div>

      {/* ── Pure Visual Simulation Area (No Buttons, No Sliders) ───────────── */}
      <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center min-h-[420px]">
        
        {/* Left Column: Living Growing Plant Canvas (Span 5) */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-gradient-to-b from-[#f8fafc] via-[#f1f5f9] to-[#e2e8f0] border border-[#e3e8ee] relative overflow-hidden min-h-[340px]">
          
          {/* Ambient Glow for Harvest / Blossoms */}
          <div
            className="absolute inset-0 transition-opacity duration-700 pointer-events-none"
            style={{
              background: currentPhase.isHarvest
                ? "radial-gradient(circle at 50% 40%, rgba(245, 158, 11, 0.25), transparent 70%)"
                : currentPhase.flowerCount > 0
                ? "radial-gradient(circle at 50% 40%, rgba(234, 179, 8, 0.2), transparent 70%)"
                : "radial-gradient(circle at 50% 40%, rgba(16, 185, 129, 0.15), transparent 70%)",
            }}
          />

          {/* Sun / Weather Aura */}
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/80 border border-slate-200 rounded-full px-3 py-1 text-[11px] font-mono font-bold text-slate-700 backdrop-blur-xs shadow-2xs">
            <Sun className={`w-3.5 h-3.5 ${currentPhase.isHarvest ? "text-amber-500 animate-spin" : "text-amber-400"}`} />
            <span>{isHindi ? currentPhase.daysHi : currentPhase.days}</span>
          </div>

          {/* Plant SVG Canvas */}
          <div className="relative w-52 h-56 flex items-end justify-center">
            <svg viewBox="0 0 200 220" className="w-full h-full drop-shadow-md overflow-visible">
              {/* Soil Base Mound */}
              <ellipse cx="100" cy="195" rx="80" ry="16" fill="#8d6e63" />
              <ellipse cx="100" cy="192" rx="70" ry="12" fill="#6d4c41" />

              {/* Underground Roots (Grows deeper with each phase) */}
              <motion.g
                initial={false}
                animate={{
                  opacity: 1,
                  scale: 0.5 + phaseIndex * 0.15,
                }}
                transition={{ duration: 0.8 }}
                style={{ transformOrigin: "100px 195px" }}
              >
                <path
                  d="M 100 195 Q 85 208 75 218 M 100 195 Q 100 210 100 222 M 100 195 Q 115 208 125 218"
                  stroke="#5d4037"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </motion.g>

              {/* Sprouting Seed underground in Phase 1 */}
              {phaseIndex === 0 && (
                <ellipse cx="100" cy="192" rx="8" ry="6" fill="#5d4037" stroke="#4e342e" strokeWidth="2" />
              )}

              {/* Main Stem (Smoothly grows taller with each phase) */}
              <motion.path
                initial={false}
                animate={{
                  d: `M 100 192 Q 100 ${192 - currentPhase.stemHeight * 0.5} 100 ${192 - currentPhase.stemHeight}`,
                  stroke: currentPhase.stemColor,
                }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
                strokeWidth={currentPhase.isHarvest ? 7 : 5.5}
                strokeLinecap="round"
              />

              {/* Leaves (Emerge in Phase 2 and grow lush) */}
              {phaseIndex >= 1 && (
                <motion.g
                  initial={{ opacity: 0, scale: 0.3 }}
                  animate={{ opacity: 1, scale: currentPhase.leafScale }}
                  transition={{ duration: 0.7 }}
                  style={{ transformOrigin: "100px 150px" }}
                >
                  {/* Left Lower Leaf */}
                  <path
                    d="M 100 160 C 65 145 50 120 58 98 C 75 110 88 135 100 160 Z"
                    fill={currentPhase.leafColor}
                    stroke={currentPhase.isHarvest ? "#996515" : "#1b5e20"}
                    strokeWidth="1.5"
                  />
                  {/* Right Lower Leaf */}
                  <path
                    d="M 100 145 C 135 130 150 105 142 85 C 125 98 112 120 100 145 Z"
                    fill={currentPhase.leafColor}
                    stroke={currentPhase.isHarvest ? "#996515" : "#1b5e20"}
                    strokeWidth="1.5"
                  />
                  {/* Left Upper Leaf */}
                  <path
                    d="M 100 125 C 70 110 60 85 68 70 C 82 80 92 105 100 125 Z"
                    fill={currentPhase.leafColor}
                    stroke={currentPhase.isHarvest ? "#996515" : "#1b5e20"}
                    strokeWidth="1.5"
                  />
                  {/* Right Upper Leaf */}
                  <path
                    d="M 100 110 C 130 95 140 70 132 55 C 118 68 108 90 100 110 Z"
                    fill={currentPhase.leafColor}
                    stroke={currentPhase.isHarvest ? "#996515" : "#1b5e20"}
                    strokeWidth="1.5"
                  />
                </motion.g>
              )}

              {/* Flowers (Open in Phase 3) */}
              {currentPhase.flowerCount > 0 && (
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformOrigin: "100px 85px" }}
                >
                  <circle cx="100" cy="85" r="11" fill="#facc15" stroke="#eab308" strokeWidth="2" />
                  <circle cx="88" cy="85" r="7" fill="#fef08a" opacity="0.9" />
                  <circle cx="112" cy="85" r="7" fill="#fef08a" opacity="0.9" />
                  <circle cx="100" cy="73" r="7" fill="#fef08a" opacity="0.9" />
                  <circle cx="100" cy="97" r="7" fill="#fef08a" opacity="0.9" />
                  <circle cx="100" cy="85" r="5" fill="#ca8a04" />
                </motion.g>
              )}

              {/* Grain Pods / Ears (Form in Phase 4 and ripen golden in Phase 5) */}
              {currentPhase.podCount > 0 && (
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  style={{ transformOrigin: "100px 75px" }}
                >
                  {/* Central Grain Head */}
                  <ellipse
                    cx="100"
                    cy="72"
                    rx={currentPhase.isHarvest ? 14 : 11}
                    ry={currentPhase.isHarvest ? 24 : 20}
                    fill={currentPhase.isHarvest ? "#eab308" : "#84cc16"}
                    stroke={currentPhase.isHarvest ? "#ca8a04" : "#4d7c0f"}
                    strokeWidth="2"
                  />
                  {/* Side Pods */}
                  <ellipse
                    cx="84"
                    cy="92"
                    rx="8"
                    ry="14"
                    fill={currentPhase.isHarvest ? "#f59e0b" : "#a3e635"}
                    stroke={currentPhase.isHarvest ? "#b45309" : "#4d7c0f"}
                    strokeWidth="1.5"
                    transform="rotate(-20 84 92)"
                  />
                  <ellipse
                    cx="116"
                    cy="92"
                    rx="8"
                    ry="14"
                    fill={currentPhase.isHarvest ? "#f59e0b" : "#a3e635"}
                    stroke={currentPhase.isHarvest ? "#b45309" : "#4d7c0f"}
                    strokeWidth="1.5"
                    transform="rotate(20 116 92)"
                  />
                  {/* Golden Whisker Awns in Harvest */}
                  {currentPhase.isHarvest && (
                    <g stroke="#ca8a04" strokeWidth="1.5" strokeLinecap="round">
                      <line x1="100" y1="50" x2="100" y2="35" />
                      <line x1="94" y1="54" x2="86" y2="40" />
                      <line x1="106" y1="54" x2="114" y2="40" />
                    </g>
                  )}
                </motion.g>
              )}
            </svg>
          </div>

          {/* Plant Health Status Line */}
          <div className="mt-4 px-4 py-1.5 rounded-full bg-white/90 border border-slate-200 text-xs font-mono font-bold text-slate-800 shadow-2xs backdrop-blur-xs flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{isHindi ? currentPhase.nameHi : currentPhase.nameEn}</span>
          </div>
        </div>

        {/* Right Column: Explanatory Text for this specific phase (Span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-center">
          <motion.div
            key={currentPhase.id}
            initial={{ opacity: 0.4, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            {/* Phase Badge & Step Counter */}
            <div className="flex items-center gap-2.5">
              <span
                className={`text-xs font-mono font-bold px-3 py-1 rounded-full border ${currentPhase.tagBg} ${currentPhase.tagText} ${currentPhase.tagBorder}`}
              >
                {isHindi ? `चरण ${currentPhase.phaseNumber}` : `Phase ${currentPhase.phaseNumber}`}
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                {isHindi ? currentPhase.daysHi : currentPhase.days}
              </span>
            </div>

            {/* Main Phase Headline */}
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-[#0d253d] font-display tracking-tight leading-tight">
                {isHindi ? currentPhase.titleHi : currentPhase.titleEn}
              </h3>
              <h4 className="text-sm font-bold text-[#533afd] mt-1">
                {isHindi ? currentPhase.nameHi : currentPhase.nameEn}
              </h4>
            </div>

            {/* Phase Description (Simple, Minimal Text for Farmers) */}
            <p className="text-sm sm:text-base text-[#1e293b] leading-relaxed font-normal">
              {isHindi ? currentPhase.descHi : currentPhase.descEn}
            </p>

            {/* Key Field Impact Card */}
            <div className="p-4 rounded-2xl bg-[#f8fafc] border border-[#e3e8ee] flex items-start gap-3 shadow-2xs">
              <div className="mt-0.5 p-1 rounded-full bg-emerald-100 text-emerald-800 shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-[#0d253d] block">
                  {isHindi ? "खेत में सीधा असर व फायदा:" : "Field Impact & Farmer Benefit:"}
                </span>
                <span className="text-xs sm:text-sm text-[#334155] font-medium">
                  {isHindi ? currentPhase.fieldImpactHi : currentPhase.fieldImpactEn}
                </span>
              </div>
            </div>
          </motion.div>
        </div>

      </div>

      {/* ── Minimal Auto-Cycle Progress Footer ──────────────────────────────── */}
      <div className="px-6 py-3 bg-[#f8fafc] border-t border-[#e3e8ee] flex items-center justify-between text-[11px] text-slate-500 font-mono">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#533afd]" />
          <span>
            {isHindi
              ? `चरण ${phaseIndex + 1} / 5 (स्वचालित चक्र)`
              : `Phase ${phaseIndex + 1} of 5 (Auto-Cycling)`}
          </span>
        </div>
        <span className="text-slate-400">
          {isHindi ? "प्रत्येक चरण में फसल का विकास" : "Continuous Lifecycle Progression"}
        </span>
      </div>
    </div>
  );
};
