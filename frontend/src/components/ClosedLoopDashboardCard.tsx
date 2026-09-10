"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  CheckCircle2,
  MessageSquare,
  ArrowRight,
  TrendingUp,
  Activity,
  Droplets,
  Copy,
  Check,
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface ClosedLoopDashboardCardProps {
  district?: string;
  crop?: string;
  acres?: number;
  farmerName?: string;
}

export function ClosedLoopDashboardCard({
  district = "Rupnagar",
  crop = "Wheat",
  acres = 5.0,
  farmerName = "Sameer Mishra",
}: ClosedLoopDashboardCardProps) {
  const { language } = useLanguage();
  const isHi = language === "hi";
  const [copied, setCopied] = useState(false);

  const handleCopyTrigger = () => {
    navigator.clipboard.writeText("follow up");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative bg-white/95 backdrop-blur-md rounded-3xl border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] overflow-hidden transition-all hover:border-[#2d6a4f]/30 font-sans">
      {/* Top Emerald Gradient Accent Line */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#1b4332] via-[#2d6a4f] to-emerald-400" />

      <div className="p-4 sm:p-7 space-y-5">
        {/* Header Ribbon */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold bg-[#e8f5e9] text-[#1b4332] border border-[#cbe5cb] shadow-2xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>MODEL 4 · CLOSED-LOOP PHARMACOVIGILANCE</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Meta WhatsApp Cloud API
              </span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black text-[#11261f] tracking-tight font-display flex items-center gap-2">
              <Activity className="h-5 w-5 text-[#2d6a4f] shrink-0" />
              <span>
                {isHi
                  ? "48 घंटे क्लोज्ड-लूप फसल स्वास्थ्य फॉलो-अप व क्लिनिकल जांच"
                  : "48-Hour Closed-Loop Crop Care & WhatsApp Verification"}
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
              {isHi
                ? "अधिकांश कृषि ऐप्स केवल दवा बताकर छोड़ देते हैं। KrishYantra दवा छिड़काव के 48 घंटे बाद WhatsApp पर 6-मापदंड क्लिनिकल जांच करता है और जरूरत के अनुसार दूसरा उत्पाद तय करता है।"
                : "Standard ag-apps prescribe and abandon. KrishYantra closes the loop by checking 6 clinical measures at 48 hours via WhatsApp and adapting your Step 2 biostimulant/rescue treatment in real time."}
            </p>
          </div>

          <Link
            href="/closed-loop"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#1b4332] hover:bg-[#143326] rounded-xl shadow-2xs transition-all shrink-0 cursor-pointer min-h-[38px]"
          >
            <span>{isHi ? "पूरा लूप सिमुलेटर देखें" : "Open Verification Loop"}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3-Step Interactive Lifecycle Flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Step 1: Day 0 Spray */}
          <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                DAY 0 · INTERVENTION
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                Verified
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-[#11261f]">
              Initial Pathogen Spray
            </h3>
            <p className="text-xs text-slate-600 leading-snug">
              Syngenta Ridomil Gold® / Score® applied with calibrated 200L/acre water volume.
            </p>
            <div className="pt-1 text-[11px] font-mono text-emerald-800 font-semibold flex items-center gap-1">
              <Droplets className="h-3.5 w-3.5 text-emerald-600" />
              <span>Delta-T 4.8°C Safe Window</span>
            </div>
          </div>

          {/* Step 2: Day +2 / 48h WhatsApp Triage */}
          <div className="bg-[#f0f7f2] p-4 rounded-2xl border border-[#2d6a4f]/30 space-y-2 relative overflow-hidden shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-[#1b4332]">
                DAY +2 (48 HOURS) · ACTIVE
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-600 text-white flex items-center gap-1 animate-pulse">
                <MessageSquare className="h-3 w-3" />
                WhatsApp Live
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-[#11261f]">
              6-Point Clinical Field Triage
            </h3>
            <p className="text-xs text-slate-700 leading-snug">
              Autonomous checks: Lesion Desiccation, Apical Foliage, Rainfastness, Canopy Wash, Water Volume & Chlorosis.
            </p>
            <div className="pt-1 text-[11px] font-mono text-[#1b4332] font-bold flex items-center justify-between">
              <span>94.2% Remission Benchmark</span>
              <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-md border border-[#cbe5cb]">
                Interactive Quick-Replies
              </span>
            </div>
          </div>

          {/* Step 3: Day +5 Second Product */}
          <div className="bg-[#fbfcf8] p-4 rounded-2xl border border-[#e8ede4] space-y-2 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                DAY +5 · ADAPTIVE RX
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-purple-600" />
                Synthesized
              </span>
            </div>
            <h3 className="font-extrabold text-sm text-[#11261f]">
              Second-Product Prescription
            </h3>
            <p className="text-xs text-slate-600 leading-snug">
              Pathogen arrested: <strong>Syngenta Isabion®</strong> amino acid tonic prescribed (35 ml / 16L pump) to restore photosynthetic ATP.
            </p>
            <div className="pt-1 text-[11px] font-mono text-purple-800 font-bold flex items-center gap-1">
              <TrendingUp className="h-3.5 w-3.5 text-purple-600" />
              <span>+₹17,500 Field Salvage ({acres} Ac)</span>
            </div>
          </div>
        </div>

        {/* Live Presentation Demo Callout Banner */}
        <div className="bg-gradient-to-r from-[#1b4332] via-[#245942] to-[#2d6a4f] rounded-2xl p-4 sm:p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider">
                LIVE DEMO SHORTCUT
              </span>
              <span className="text-xs text-emerald-100 font-mono">
                No 48h delay needed for judges
              </span>
            </div>
            <h4 className="text-base sm:text-lg font-extrabold font-display leading-snug">
              {isHi
                ? "व्हाट्सएप पर अभी लाइव 6-मापदंड क्लिनिकल जांच का अनुभव लें"
                : "Test the 6-Point WhatsApp Triage Live Right Now"}
            </h4>
            <p className="text-xs text-emerald-100/90 leading-relaxed max-w-2xl">
              {isHi
                ? "हमारे बॉट नंबर पर बस 'follow up' लिखकर भेजें। सिस्टम तुरंत 6 वैज्ञानिक सवाल पूछेगा और अंत में सटीक दूसरा उत्पाद देगा।"
                : "Send 'follow up' to our registered WhatsApp bot. The engine will guide you through all 6 scientific questions and prescribe your calibrated follow-up tonic."}
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
            <button
              onClick={handleCopyTrigger}
              className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 border border-white/20 text-white text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-300" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? "Copied 'follow up'!" : "Copy 'follow up'"}</span>
            </button>

            <Link
              href="/journal"
              className="px-3.5 py-2 rounded-xl bg-white text-[#1b4332] hover:bg-emerald-50 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <span>View Farm Journal</span>
              <ArrowRight className="h-3.5 w-3.5 text-[#2d6a4f]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
