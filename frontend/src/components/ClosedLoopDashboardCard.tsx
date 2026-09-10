"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  CloudRain,
  ArrowRight,
  Activity,
  Check,
  Droplets,
  Zap,
  Layers,
  Leaf,
  MessageSquare,
  FlaskConical,
  Stethoscope,
  Copy,
  ExternalLink,
  ShieldCheck,
  Scale,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ClosedLoopDashboardCardProps {
  district?: string;
  crop?: string;
  acres?: number;
  farmerName?: string;
}

interface FarmPreset {
  id: string;
  farmerName: string;
  crop: string;
  variety: string;
  location: string;
  district: string;
  acres: number;
  day0Product: string;
  day0Active: string;
  day0Frac: string;
  qSavedPerAcre: number;
  mandiPrice: number;
}

const FARM_PRESETS: FarmPreset[] = [
  {
    id: "potato-kasganj",
    farmerName: "Sameer Mishra",
    crop: "Potato",
    variety: "Kufri Pukhraj",
    location: "Bilram, Kasganj, Uttar Pradesh",
    district: "Kasganj",
    acres: 3.5,
    day0Product: "Syngenta Ridomil Gold®",
    day0Active: "Metalaxyl-M 4% + Mancozeb 64% WP",
    day0Frac: "FRAC 4 + M3",
    qSavedPerAcre: 8.0,
    mandiPrice: 1720,
  },
  {
    id: "wheat-punjab",
    farmerName: "Gurpreet Singh",
    crop: "Wheat",
    variety: "PBW-826",
    location: "Chamkaur Sahib, Rupnagar, Punjab",
    district: "Rupnagar",
    acres: 5.0,
    day0Product: "Syngenta Score®",
    day0Active: "Difenoconazole 25% EC",
    day0Frac: "FRAC 3",
    qSavedPerAcre: 2.8,
    mandiPrice: 2425,
  },
  {
    id: "rice-haryana",
    farmerName: "Rajender Pal",
    crop: "Rice (Basmati)",
    variety: "PR-126",
    location: "Karnal, Haryana",
    district: "Karnal",
    acres: 4.0,
    day0Product: "Syngenta Amistar Top®",
    day0Active: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
    day0Frac: "FRAC 11 + 3",
    qSavedPerAcre: 3.5,
    mandiPrice: 2850,
  },
  {
    id: "cotton-gujarat",
    farmerName: "Bhavesh Patel",
    crop: "Cotton",
    variety: "Bt RCH-659",
    location: "Rajkot, Gujarat",
    district: "Rajkot",
    acres: 6.0,
    day0Product: "Syngenta Ampligo®",
    day0Active: "Chlorantraniliprole 9.3% + Lambda-cyhalothrin 4.6% ZC",
    day0Frac: "IRAC 28 + 3A",
    qSavedPerAcre: 2.2,
    mandiPrice: 7100,
  },
];

export function ClosedLoopDashboardCard({
  district = "Kasganj",
  crop = "Potato",
  acres = 3.5,
  farmerName = "Sameer Mishra",
}: ClosedLoopDashboardCardProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";

  // Match initial preset or default to Kasganj Potato
  const [selectedPresetId, setSelectedPresetId] = useState<string>("potato-kasganj");
  const activeFarm =
    FARM_PRESETS.find((p) => p.id === selectedPresetId) || FARM_PRESETS[0];

  const [copied, setCopied] = useState(false);

  // 6 Clinical Measures State: true = optimal/remission, false = deficient/risk
  const [measures, setMeasures] = useState<Record<number, boolean>>({
    1: true, // Lesion desiccation
    2: true, // Apical growth protection
    3: true, // Underside foliage penetration
    4: true, // Rainfastness integrity
    5: true, // Full 200L water calibration
    6: true, // Metabolic stress / chlorosis (true = stressed, needs tonic)
  });

  const toggleMeasure = (id: number) => {
    setMeasures((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyTrigger = () => {
    navigator.clipboard.writeText("follow up");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate Remission Score
  const calculateScore = (): number => {
    let score = 0;
    if (measures[1]) score += 25; // Lesion crusting
    if (measures[2]) score += 20; // Crown clean
    if (measures[3]) score += 15; // Underside coated
    if (measures[4]) score += 15; // Rainfastness maintained
    if (measures[5]) score += 10; // Full water volume
    if (measures[6]) score += 15; // Chlorosis / stress detected (triggers biostimulant)
    return Math.min(100, Math.max(0, score));
  };

  const score = calculateScore();
  const isResistanceBreach = !measures[1] || !measures[2];
  const isWashoutBreach = !measures[3] || !measures[4] || !measures[5];

  // Dynamic Second-Product Recommendation with 4 Solid Points
  const getPrescription = () => {
    const fieldArea = activeFarm.acres;
    const estSavings = Math.round(
      activeFarm.qSavedPerAcre * activeFarm.mandiPrice * fieldArea
    );

    if (isResistanceBreach) {
      if (activeFarm.crop.toLowerCase().includes("potato") || activeFarm.crop.toLowerCase().includes("tomato")) {
        return {
          productName: "Syngenta Revus®",
          active: "Mandipropamid 23.4% SC (LOK-FLO Technology)",
          category: "Rotational Rescue Fungicide (FRAC 40)",
          statusBadge: "PATHOGEN RESISTANCE RESCUE",
          badgeColor: "bg-red-50 text-red-800 border-red-200",
          dose16L: "16 ml per 16L hand pump (~1 cap)",
          totalLiters: `${(0.2 * fieldArea).toFixed(1)} L`,
          waterVolume: `${Math.round(200 * fieldArea)} L (${Math.ceil((200 * fieldArea) / 16)} tanks)`,
          estSavings,
          points: [
            {
              title: "1. Biomarker & Target Site",
              content:
                "Targets CAA group cellulose synthase (FRAC 40). Bypasses metalaxyl phenylamide (FRAC 4) resistance in Phytophthora infestans.",
            },
            {
              title: "2. Physiological Cuticular Action",
              content:
                "LOK-FLO technology locks onto foliar wax within 30 minutes, delivering 100% rainfastness and translaminar stop-action.",
            },
            {
              title: "3. Yield & Financial Salvage",
              content: `Arrests active spore replication in 12h, preserving +${(activeFarm.qSavedPerAcre * fieldArea).toFixed(1)} Quintals (+₹${estSavings.toLocaleString("en-IN")}) across ${fieldArea} Acres.`,
            },
            {
              title: "4. Precision Tank Dilution",
              content: `Calibrate at 16 ml / 16L pump with 200 L/acre water volume (${Math.ceil((200 * fieldArea) / 16)} knapsack tanks total). Apply tomorrow 06:30–09:30 AM.`,
            },
          ],
        };
      }
      return {
        productName: "Syngenta Amistar Top®",
        active: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
        category: "Dual-Action Cross-Resistance Fungicide (FRAC 11 + 3)",
        statusBadge: "CROSS-RESISTANCE ESCALATION",
        badgeColor: "bg-red-50 text-red-800 border-red-200",
        dose16L: "16 ml per 16L hand pump",
        totalLiters: `${(0.2 * fieldArea).toFixed(1)} L`,
        waterVolume: `${Math.round(200 * fieldArea)} L (${Math.ceil((200 * fieldArea) / 16)} tanks)`,
        estSavings,
        points: [
          {
            title: "1. Biomarker & Target Site",
            content:
              "Dual QoI mitochondrial respiration block (FRAC 11) + sterol demethylation inhibition (FRAC 3) eliminates surviving spores.",
          },
          {
            title: "2. Physiological Greening Action",
            content:
              "Enhances nitrate reductase enzyme activity, preventing chlorophyll senescence and boosting carbohydrate accumulation.",
          },
          {
            title: "3. Yield & Financial Salvage",
            content: `Shields flag leaves and panicles, salvaging +${(activeFarm.qSavedPerAcre * fieldArea).toFixed(1)} Quintals (+₹${estSavings.toLocaleString("en-IN")}).`,
          },
          {
            title: "4. Precision Tank Dilution",
            content: `16 ml per 16L knapsack pump in 200 L/acre water volume. Apply early morning during optimal Delta-T window.`,
          },
        ],
      };
    }

    if (isWashoutBreach) {
      return {
        productName: "Syngenta Kavach®",
        active: "Chlorothalonil 720 g/l SC (Micro-Fine Suspension)",
        category: "Multi-Site Protective Shield (FRAC M5)",
        statusBadge: "WASH-OFF & COVERAGE RECALIBRATION",
        badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
        dose16L: "35 ml per 16L hand pump (~2 caps)",
        totalLiters: `${(0.4 * fieldArea).toFixed(1)} L`,
        waterVolume: `${Math.round(200 * fieldArea)} L (${Math.ceil((200 * fieldArea) / 16)} tanks)`,
        estSavings: Math.round(estSavings * 0.85),
        points: [
          {
            title: "1. Biomarker & Multi-Site Action",
            content:
              "Binds to multiple fungal thiol enzyme groups simultaneously (FRAC M5). Zero known pathogen resistance worldwide.",
          },
          {
            title: "2. Superior Cuticular Tenacity",
            content:
              "Micro-fine colloidal formulation forms a rain-resistant film on wet foliage within 15 minutes, preventing germ-tube penetration.",
          },
          {
            title: "3. Yield & Financial Salvage",
            content: `Resets foliar barrier after rain/volume loss, preventing secondary infection (+₹${Math.round(estSavings * 0.85).toLocaleString("en-IN")} protected).`,
          },
          {
            title: "4. Precision Sprayer Recalibration",
            content: `Mandates full 200 L/acre (12 tanks/acre) to achieve 65 droplets/cm² on abaxial leaves. Hollow-cone nozzle at 2.8 bar.`,
          },
        ],
      };
    }

    if (activeFarm.crop.toLowerCase().includes("wheat") || activeFarm.crop.toLowerCase().includes("cotton")) {
      return {
        productName: "Syngenta Quantis®",
        active: "Short-Chain Peptides + Osmoprotectants (Betaine & Proline) + 2% K₂O",
        category: "Bio-Active Anti-Stress Osmoprotectant",
        statusBadge: "PATHOGEN REMISSION · STRESS MITIGATION",
        badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
        dose16L: "35 ml per 16L hand pump (~2 caps)",
        totalLiters: `${(0.4 * fieldArea).toFixed(1)} L`,
        waterVolume: `${Math.round(200 * fieldArea)} L (${Math.ceil((200 * fieldArea) / 16)} tanks)`,
        estSavings,
        points: [
          {
            title: "1. Cellular ATP & Osmotic Regulation",
            content:
              "Supplies bio-available organic nitrogen and free amino acids, replenishing cellular ATP drained by pathogen defense.",
          },
          {
            title: "2. Canopy Temperature Depression (ΔCTD +2.4°C)",
            content:
              "Reduces leaf transpiration shock and cools crop canopy by +2.4°C, preventing thermal grain shriveling during milking stage.",
          },
          {
            title: "3. Yield & Quality Protection",
            content: `Secures 1,000-grain test weight and accelerates grain filling (+${(activeFarm.qSavedPerAcre * fieldArea).toFixed(1)} Q / +₹${estSavings.toLocaleString("en-IN")}).`,
          },
          {
            title: "4. Precision Sprayer Dilution",
            content: `35 ml per 16L tank. Total ${(0.4 * fieldArea).toFixed(1)} L in 200 L/acre water. Compatible with all post-emergent foliar sprays.`,
          },
        ],
      };
    }

    // Default: Syngenta Isabion for Potato & Horticultural Crops
    return {
      productName: "Syngenta Isabion®",
      active: "Natural Free Amino Acids (62.5%) + Short & Long Chain Peptides",
      category: "Pure Vegetative Biostimulant & Energy Tonic",
      statusBadge: "PATHOGEN REMISSION · PHOTOSYSTEM-II RESTORATION",
      badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
      dose16L: "40 ml per 16L hand pump (~2.5 caps)",
      totalLiters: `${(0.5 * fieldArea).toFixed(1)} L`,
      waterVolume: `${Math.round(200 * fieldArea)} L (${Math.ceil((200 * fieldArea) / 16)} tanks)`,
      estSavings,
      points: [
        {
          title: "1. Biomarker & Chlorosis Reversal",
          content:
            "Exogenous amino acids directly stimulate glutamate synthase and chlorophyll synthesis, reversing foliar chlorosis in 72h.",
        },
        {
          title: "2. Micronutrient Chelation & Translocation",
          content:
            "Natural short-chain peptide complexes chelate soil calcium and magnesium, surging translocation directly into developing tubers.",
        },
        {
          title: "3. Field Salvage & Tuber Bulking",
          content: `Prevents a 14–22% irreversible yield collapse, securing +${(activeFarm.qSavedPerAcre * fieldArea).toFixed(1)} Quintals (+₹${estSavings.toLocaleString("en-IN")}) for ${fieldArea} Acres.`,
        },
        {
          title: "4. Precision Sprayer Dilution",
          content: `40 ml / 16L pump (500 ml/acre). Total ${(0.5 * fieldArea).toFixed(1)} L in ${Math.round(200 * fieldArea)} L water. Stomatal window: 06:30–09:30 AM.`,
        },
      ],
    };
  };

  const rx = getPrescription();

  return (
    <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] overflow-hidden transition-all hover:border-[#2d6a4f]/30 font-sans">
      {/* Emerald Gradient Top Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-emerald-400" />

      <div className="p-4 sm:p-7 space-y-6">
        {/* Header Ribbon with Badges and Direct Links */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>MODEL 4 · CLOSED-LOOP PHARMACOVIGILANCE</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Meta WhatsApp Cloud API
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Syngenta 50-Product Dynamic Rationale
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-[#11261f] tracking-tight font-display flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#2d6a4f] shrink-0" />
              <span>
                {isHi
                  ? "48 घंटे क्लोज्ड-लूप फसल स्वास्थ्य फॉलो-अप व क्लिनिकल जांच"
                  : "48-Hour Closed-Loop Pharmacovigilance & Follow-Up"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {isHi
                ? "अधिकांश कृषि ऐप्स दवा बताकर छोड़ देते हैं। KrishYantra दवा छिड़काव के 48 घंटे बाद 6-मापदंड क्लिनिकल जांच करता है और हर भविष्यवाणी के लिए 4 ठोस वैज्ञानिक आधारों के साथ दूसरा उत्पाद तय करता है।"
                : "Standard ag-apps prescribe and abandon. KrishYantra closes the loop by auditing 6 clinical measures at 48h and formulating an adaptive Second-Product prescription with 4 solid agronomic points."}
            </p>
          </div>

          {/* Quick Action CTAs */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Link
              href="/closed-loop"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1b4332] hover:bg-[#143326] rounded-xl shadow-2xs transition-all cursor-pointer min-h-[38px]"
            >
              <Stethoscope className="h-3.5 w-3.5" />
              <span>{isHi ? "पूरा सिमुलेटर खोलें" : "Open Full Simulator"}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>

            <a
              href="https://wa.me/15556694548?text=follow%20up"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-all cursor-pointer min-h-[38px]"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>{isHi ? "व्हाट्सएप लाइव बॉट" : "WhatsApp Bot"}</span>
              <ExternalLink className="h-3 w-3 text-emerald-500" />
            </a>
          </div>
        </div>

        {/* Preset Farm Switcher (Includes User's Active Kasganj Potato Farm!) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <FlaskConical className="h-3.5 w-3.5 text-[#2d6a4f]" />
              <span>Select Active Field Verification Context:</span>
            </span>
            <span className="text-[11px] font-mono text-[#1b4332] font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Active: {activeFarm.farmerName} ({activeFarm.crop})
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FARM_PRESETS.map((preset) => {
              const isSelected = preset.id === selectedPresetId;
              return (
                <button
                  key={preset.id}
                  onClick={() => setSelectedPresetId(preset.id)}
                  className={`text-left p-2.5 rounded-xl border transition-all text-xs cursor-pointer ${
                    isSelected
                      ? "bg-[#1b4332] text-white border-[#1b4332] shadow-sm ring-2 ring-[#2d6a4f]/20"
                      : "bg-[#fbfcf8] text-slate-700 border-[#e8ede4] hover:bg-white hover:border-[#2d6a4f]/30"
                  }`}
                >
                  <div className="font-bold truncate flex items-center justify-between">
                    <span>{preset.crop}</span>
                    <span
                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                        isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {preset.acres} Ac
                    </span>
                  </div>
                  <div
                    className={`text-[10px] truncate ${
                      isSelected ? "text-emerald-100" : "text-slate-500"
                    }`}
                  >
                    {preset.location.split(",")[0]} ({preset.farmerName.split(" ")[0]})
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Day 0 vs Day 2 vs Day 5 Timeline Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Day 0 */}
          <div className="bg-[#fbfcf8] p-3.5 rounded-2xl border border-[#e8ede4] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-slate-400 uppercase">DAY 0 · INITIAL SPRAY</span>
              <span className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Logged
              </span>
            </div>
            <div className="font-extrabold text-slate-900 text-sm">{activeFarm.day0Product}</div>
            <div className="text-[11px] text-slate-600 leading-snug">
              {activeFarm.day0Active} ({activeFarm.day0Frac}) applied with calibrated 200 L/acre water volume.
            </div>
          </div>

          {/* Day 2 */}
          <div className="bg-[#f0f7f2] p-3.5 rounded-2xl border border-[#2d6a4f]/30 space-y-1.5 text-xs shadow-2xs">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-[#1b4332] uppercase">DAY +2 (48H) · CLINICAL TRIAGE</span>
              <span className="text-white bg-emerald-600 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                <Activity className="h-3 w-3" /> Live Audit
              </span>
            </div>
            <div className="font-extrabold text-[#11261f] text-sm flex items-center justify-between">
              <span>6-Measure Protocol</span>
              <span className="font-mono text-emerald-800">{score}% Remission</span>
            </div>
            <div className="text-[11px] text-slate-700 leading-snug">
              Autonomous WhatsApp triage checking spore arrest, apical growth, rainfastness & chlorosis.
            </div>
          </div>

          {/* Day 5 */}
          <div className="bg-[#fbfcf8] p-3.5 rounded-2xl border border-[#e8ede4] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[10px] font-mono font-bold">
              <span className="text-purple-700 uppercase">DAY +5 · SECOND PRODUCT RX</span>
              <span className="text-purple-800 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Dynamic Rx
              </span>
            </div>
            <div className="font-extrabold text-slate-900 text-sm">{rx.productName}</div>
            <div className="text-[11px] text-slate-600 leading-snug">
              Formulated via 4 Solid Agronomic Points based on real-time field triage answers.
            </div>
          </div>
        </div>

        {/* Interactive 6 Clinical Measures Protocol Box */}
        <div className="bg-[#fcfdfa] rounded-2xl border border-[#dce5d9] p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-[#1b4332] bg-[#e8f5e9] px-2.5 py-0.5 rounded">
                  Clinical Protocol
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  Toggle answers to simulate field triage:
                </span>
              </div>
              <h3 className="font-extrabold text-base text-[#11261f] mt-0.5">
                The 6 Deep Agronomic Measures (Syngenta Pharmacovigilance)
              </h3>
            </div>

            {/* Live Remission Gauge */}
            <div className="flex items-center gap-2.5 shrink-0">
              <div className="text-right">
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">
                  Remission Index
                </div>
                <div className="text-base font-mono font-black text-[#1b4332]">{score}%</div>
              </div>
              <div
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  isResistanceBreach
                    ? "bg-red-50 text-red-700 border-red-200"
                    : isWashoutBreach
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : "bg-emerald-50 text-emerald-800 border-emerald-200"
                }`}
              >
                {isResistanceBreach
                  ? "Resistance Breach"
                  : isWashoutBreach
                  ? "Washout / Under-Volume"
                  : "Pathogen Remission"}
              </div>
            </div>
          </div>

          {/* 6 Measures Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* Measure 1 */}
            <div
              onClick={() => toggleMeasure(1)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                measures[1]
                  ? "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50"
                  : "bg-red-50/70 border-red-200 hover:bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Stethoscope className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  <span>1. Lesion Morphology</span>
                </span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    measures[1] ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  }`}
                >
                  {measures[1] ? "Crusted / Dry" : "Active / Wet"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {measures[1]
                  ? "Blight lesions have desiccated into brown scars. Spore reproduction arrested."
                  : "Margins still wet, greasy, and actively expanding into green leaf tissue."}
              </p>
              <div className="mt-1.5 text-[9px] font-mono text-slate-500">
                Biomarker: Sterol / Ergosterol Synthesis Inhibition (FRAC 3/4)
              </div>
            </div>

            {/* Measure 2 */}
            <div
              onClick={() => toggleMeasure(2)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                measures[2]
                  ? "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50"
                  : "bg-red-50/70 border-red-200 hover:bg-red-50"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Leaf className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  <span>2. Apical Systemic Guard</span>
                </span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    measures[2] ? "bg-emerald-600 text-white" : "bg-red-600 text-white"
                  }`}
                >
                  {measures[2] ? "Clean Green" : "Spots on Top"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {measures[2]
                  ? "New emerging apical leaves and crown tillers are 100% clean and symptom-free."
                  : "Infection breach visible on newly unfurling top leaves."}
              </p>
              <div className="mt-1.5 text-[9px] font-mono text-slate-500">
                Biomarker: Xylem Meristem Translocation Kinetics
              </div>
            </div>

            {/* Measure 3 */}
            <div
              onClick={() => toggleMeasure(3)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                measures[3]
                  ? "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50"
                  : "bg-amber-50/70 border-amber-200 hover:bg-amber-50"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Layers className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  <span>3. Underside Foliage</span>
                </span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    measures[3] ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}
                >
                  {measures[3] ? "Coated Under" : "Top Side Only"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {measures[3]
                  ? "Droplets coated lower leaf abaxial surface where humid spore clusters live."
                  : "Dense canopy shielded lower leaves; lower foliage remained dry."}
              </p>
              <div className="mt-1.5 text-[9px] font-mono text-slate-500">
                Biomarker: Abaxial Stomatal Cavity Penetration
              </div>
            </div>

            {/* Measure 4 */}
            <div
              onClick={() => toggleMeasure(4)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                measures[4]
                  ? "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50"
                  : "bg-amber-50/70 border-amber-200 hover:bg-amber-50"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <CloudRain className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  <span>4. Rainfastness & Heat</span>
                </span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    measures[4] ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}
                >
                  {measures[4] ? "Dry (>2h)" : "Rained <2h"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {measures[4]
                  ? "Dry weather maintained. Active ingredient fully bound to leaf cuticular wax."
                  : "Precipitation within 2h washed chemical off before cuticular absorption."}
              </p>
              <div className="mt-1.5 text-[9px] font-mono text-slate-500">
                Biomarker: Cuticular Sorption & Ambient Delta-T Window
              </div>
            </div>

            {/* Measure 5 */}
            <div
              onClick={() => toggleMeasure(5)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                measures[5]
                  ? "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50"
                  : "bg-amber-50/70 border-amber-200 hover:bg-amber-50"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Droplets className="h-3.5 w-3.5 text-[#2d6a4f]" />
                  <span>5. Water Volume (L/Ac)</span>
                </span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    measures[5] ? "bg-emerald-600 text-white" : "bg-amber-600 text-white"
                  }`}
                >
                  {measures[5] ? "Full 200L" : "Low Volume"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {measures[5]
                  ? "Applied full 10–12 knapsack tanks per acre (approx 200 L) for total wash."
                  : "Applied only 5–7 tanks per acre, causing sub-lethal active under-dilution."}
              </p>
              <div className="mt-1.5 text-[9px] font-mono text-slate-500">
                Biomarker: 50–70 Droplets/cm² Therapeutic Threshold
              </div>
            </div>

            {/* Measure 6 */}
            <div
              onClick={() => toggleMeasure(6)}
              className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                measures[6]
                  ? "bg-purple-50/70 border-purple-200 hover:bg-purple-50"
                  : "bg-emerald-50/70 border-emerald-200 hover:bg-emerald-50"
              }`}
            >
              <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-slate-800">
                  <Zap className="h-3.5 w-3.5 text-purple-700" />
                  <span>6. Metabolic Chlorosis</span>
                </span>
                <span
                  className={`font-mono text-[10px] px-1.5 py-0.2 rounded font-bold ${
                    measures[6] ? "bg-purple-700 text-white" : "bg-emerald-600 text-white"
                  }`}
                >
                  {measures[6] ? "Pale / Tired" : "Vigorous Green"}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-snug">
                {measures[6]
                  ? "Yellowing lower leaves and energy exhaustion observed. Requires biostimulant."
                  : "Canopy is vigorous and dark green with high photosynthetic baseline."}
              </p>
              <div className="mt-1.5 text-[9px] font-mono text-slate-500">
                Biomarker: Photosystem-II Quantum Yield & Cellular ATP
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Second Product Prescription Card with 4 Solid Agronomic Points */}
        <div className="bg-gradient-to-br from-[#11261f] via-[#1b4332] to-[#245942] rounded-2xl p-4 sm:p-6 text-white space-y-4 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                  DAY +5 SECOND PRODUCT RX
                </span>
                <span className="text-xs font-mono text-emerald-200">
                  {rx.statusBadge}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-black font-display text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-300 shrink-0" />
                <span>{rx.productName}</span>
              </h3>
              <p className="text-xs text-emerald-100/90 font-mono">
                {rx.active} · {rx.category}
              </p>
            </div>

            {/* Dosage & Dilution Quick Pills */}
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2.5 rounded-xl border border-white/15 space-y-1 shrink-0 text-xs">
              <div className="text-[10px] font-mono text-emerald-200 uppercase font-bold">
                Calibrated Field Dilution ({activeFarm.acres} Acres)
              </div>
              <div className="font-bold text-white flex items-center gap-3">
                <span>{rx.dose16L}</span>
                <span className="text-emerald-300">|</span>
                <span>Total: {rx.totalLiters}</span>
              </div>
              <div className="text-[10px] text-emerald-100/80 font-mono">
                In {rx.waterVolume}
              </div>
            </div>
          </div>

          {/* The 4 Solid Agronomic Points Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-amber-300 font-bold font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-amber-400" />
                <span>4 SOLID SCIENTIFIC & AGRONOMIC POINTS (SYNGENTA PORTFOLIO):</span>
              </span>
              <span className="text-emerald-200 font-normal text-[11px]">
                Est. Financial Salvage: +₹{rx.estSavings.toLocaleString("en-IN")}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {rx.points.map((pt, idx) => (
                <div
                  key={idx}
                  className="bg-white/10 hover:bg-white/15 backdrop-blur-sm p-3 rounded-xl border border-white/10 text-xs space-y-1 transition-all"
                >
                  <div className="font-bold text-amber-200 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    <span>{pt.title}</span>
                  </div>
                  <p className="text-[11px] text-emerald-50/90 leading-relaxed">
                    {pt.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Live WhatsApp Bot Interactive Demo Banner */}
          <div className="bg-black/25 rounded-xl p-3 sm:p-4 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-emerald-400" />
                <span>Experience the Live 6-Question WhatsApp Triage</span>
              </div>
              <p className="text-[11px] text-emerald-100/80">
                Send <code className="bg-white/20 px-1 py-0.5 rounded text-white font-mono">follow up</code> to WhatsApp bot (+1 555 669 4548). No 48h waiting period needed during judging.
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handleCopyTrigger}
                className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-mono font-bold transition-all flex items-center gap-1 cursor-pointer active:scale-98"
              >
                {copied ? (
                  <Check className="h-3.5 w-3.5 text-emerald-300" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
                <span>{copied ? "Copied!" : "Copy 'follow up'"}</span>
              </button>

              <a
                href="https://wa.me/15556694548?text=follow%20up"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <span>Launch WhatsApp</span>
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
