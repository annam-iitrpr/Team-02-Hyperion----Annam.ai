"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { usePipelinePrediction } from "@/lib/usePipelinePrediction";
import {
  TrendingUp,
  Scale,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  Layers,
  Coins,
  BadgePercent,
  Cpu,
} from "lucide-react";

export default function YieldCategoryPage() {
  const { language } = useLanguage();
  const isHindi = language === "hi";

  const {
    data,
    loading,
    error,
    refetch,
    crop,
    district,
    acres,
    growthStage,
    speakSummary,
    isSpeaking,
  } = usePipelinePrediction();

  // Model 5 Baseline & Model 6 Causal metrics
  const baselineYieldAcre = data?.model5_baseline?.expected_baseline_yield_q_acre || 7.4;
  const causalGainQ = data?.model6_causal_robi?.causal_gain_tau_q_acre || 1.38;
  const protectedYieldAcre = +(baselineYieldAcre + causalGainQ).toFixed(2);
  const percentGain = Math.round((causalGainQ / baselineYieldAcre) * 100);

  const totalUntreatedHarvest = +(baselineYieldAcre * acres).toFixed(1);
  const totalProtectedHarvest = +(protectedYieldAcre * acres).toFixed(1);
  const totalHarvestGain = +(causalGainQ * acres).toFixed(1);

  const revenueSaved = data?.model6_causal_robi?.revenue_saved_inr || Math.round(totalHarvestGain * 4150);
  const treatmentCost = data?.model6_causal_robi?.total_treatment_cost_inr || Math.round(acres * 560);
  const netProfit = data?.model6_causal_robi?.net_farmer_profit_inr || (revenueSaved - treatmentCost);
  const robiMultiplier = data?.model6_causal_robi?.robi_multiplier || "6.4x";

  return (
    <AppShell>
      <div className="max-w-[1140px] mx-auto px-4 sm:px-6 py-8 space-y-8 font-sans">
        {/* Navigation Breadcrumbs & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link
                href="/plant-intelligence"
                className="hover:text-indigo-600 flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>{isHindi ? "कृषि बुद्धिमत्ता हब" : "Plant Intelligence"}</span>
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-bold">
                {isHindi ? "4. उपज पूर्वानुमान व आर्थिक लाभ" : "4. Yield Prediction"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0d253d] tracking-tight flex items-center gap-2.5">
              <TrendingUp className="h-7 w-7 text-indigo-600 shrink-0" />
              <span>
                {isHindi
                  ? `उपज पूर्वानुमान — +${percentGain}% उपज सुरक्षा (${crop.toUpperCase()})`
                  : `Yield Prediction — +${percentGain}% Yield Protected (${crop.toUpperCase()})`}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isHindi
                ? "मॉडल 5 (XGBoost रिग्रेसर) और मॉडल 6 (माइक्रोसॉफ्ट EconML Causal LinearDML) द्वारा संचालित"
                : "Powered by Model 5 (Yield Baseline) & Model 6 (Microsoft EconML Causal Uplift)"}
            </p>
          </div>

          <div className="flex items-center gap-2">
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

        {/* ── Top Hero Card: Counterfactual Yield Comparison ── */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-indigo-500/10 to-transparent border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-emerald-600 text-white shadow-md shrink-0">
                <BadgePercent className="h-8 w-8" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-3 py-0.5 rounded-full border border-emerald-300 uppercase">
                  {isHindi ? "कारणिक प्रभाव (Causal Uplift)" : "Model 6 Causal Uplift"}
                </span>
                <h2 className="text-xl sm:text-2xl font-black text-[#0d253d] font-display mt-1">
                  +{causalGainQ} {isHindi ? "क्विंटल प्रति एकड़ अतिरिक्त उपज" : "Quintals/Acre Extra Harvest"}
                </h2>
                <p className="text-xs text-slate-500">
                  {isHindi ? `कुल ${acres} एकड़ खेत पर कुल बचत: +${totalHarvestGain} क्विंटल` : `Total gain across ${acres} acres: +${totalHarvestGain} Quintals`}
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right bg-white sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-emerald-100">
              <div className="text-3xl sm:text-4xl font-black text-emerald-600 font-display">
                +₹{netProfit.toLocaleString("en-IN")}
              </div>
              <div className="text-xs font-bold text-slate-500">
                {isHindi ? `खर्च काटकर शुद्ध मुनाफा (${robiMultiplier} ROBI)` : `Net Extra Profit (${robiMultiplier} ROBI)`}
              </div>
            </div>
          </div>

          {/* Side-by-Side Yield Bars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-emerald-200/60 font-mono text-xs">
            {/* Without Treatment */}
            <div className="p-4 rounded-2xl bg-white border border-rose-200 space-y-2">
              <div className="flex items-center justify-between text-rose-800 font-bold">
                <span>{isHindi ? "बिना छिड़काव (गर्मी तनाव से पीड़ित)" : "Without Spray (Heat Damaged)"}</span>
                <span className="text-xs bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">-18.6% Loss</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-display">{baselineYieldAcre}</span>
                <span className="text-slate-500 font-sans text-xs">qtl / acre</span>
                <span className="text-slate-400 font-sans text-xs">({totalUntreatedHarvest} qtl total)</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                {isHindi ? "फूल झड़ने व दाना पिचकने से कम उत्पादन" : "Yield reduced due to high flower drop and shallow pod filling"}
              </p>
            </div>

            {/* With Quantis */}
            <div className="p-4 rounded-2xl bg-white border-2 border-emerald-500 space-y-2 shadow-xs">
              <div className="flex items-center justify-between text-emerald-800 font-bold">
                <span>{isHindi ? "क्वांटिस सुरक्षा के साथ (संरक्षित उपज)" : "With Quantis® Protection"}</span>
                <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300 font-black text-emerald-800">
                  +{percentGain}% Protected
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-600 font-display">{protectedYieldAcre}</span>
                <span className="text-slate-500 font-sans text-xs">qtl / acre</span>
                <span className="text-emerald-700 font-sans text-xs font-bold">({totalProtectedHarvest} qtl total)</span>
              </div>
              <p className="text-[11px] text-slate-500 font-sans">
                {isHindi ? "पूर्ण फली भराव व स्वस्थ दाने का वजन" : "Optimal pod retention and dense test weight preserved"}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4 Essential Questions (WHAT, WHY, HOW, ROI) ────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* WHAT */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>{isHindi ? "1. यह संख्या क्या दर्शाती है? (WHAT)" : "1. What Does This Predict?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "वास्तविक उपज और मंडी मूल्य की गणना" : "Field-Level Yield & Revenue Impact"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `यह अनुमान आपके ${district} जिले के ऐतिहासिक मौसम, मिट्टी के प्रकार और वर्तमान बुवाई तारीख के आधार पर गणना किया गया है। यह बताता है कि क्वांटिस से आपके खेत में कुल ${totalHarvestGain} क्विंटल अधिक माल निकलेगा।`
                : `Using historical IMD weather, soil moisture, and current sowing dates in ${district}, the models predict an additional ${totalHarvestGain} quintals of harvest across your ${acres} acres.`}
            </p>
          </div>

          {/* WHY */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{isHindi ? "2. यह उपज कैसे बढ़ती है? (WHY)" : "2. Why Does Yield Increase?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "फलियों की संख्या और 1000 दानों का वजन" : "Higher Pod Count & 1000-Grain Weight"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "क्वांटिस पत्तियों के छिद्रों (स्टोमेटा) को सुचारू रखता है। इससे प्रति पौधा 4-6 अधिक फलियां पकती हैं और दाना सिकुड़ता नहीं है, जिससे टेस्ट वेट (1000 दानों का वजन) 12% तक बढ़ जाता है।"
                : "Continuous stomatal gas exchange maintains carbohydrate supply during seed filling, yielding 4-6 more mature pods per plant and a 12% higher test grain weight."}
            </p>
          </div>

          {/* HOW */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{isHindi ? "3. मॉडल ने यह कैसे निकाला? (HOW)" : "3. Machine Learning Methodology"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "माइक्रोसॉफ्ट डबल मशीन लर्निंग (EconML)" : "Causal Machine Learning (Chernozhukov 2018)"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "यह केवल अनुमान नहीं है। मॉडल 6 बारिश और जमीन की उर्वरा शक्ति जैसे अन्य कारकों को नियंत्रित करके केवल दवा के छिड़काव का शुद्ध प्रभाव (Causal Effect) निकालता है।"
                : "Model 6 eliminates confounding biases (soil fertility, rainfall anomalies) using Orthogonal Double Machine Learning to isolate the exact causal uplift of treatment."}
            </p>
          </div>

          {/* ROI */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{isHindi ? "4. खर्च बनाम मुनाफा (ROBI)" : "4. Economic Return on Investment"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? `₹1 लगाने पर ₹${robiMultiplier} का सीधा लाभ` : `₹1 Invested Yields ${robiMultiplier} Net Return`}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `आपके ${acres} एकड़ के लिए कुल दवा और मजदूरी खर्च लगभग ₹${treatmentCost} है, जबकि संरक्षित फसल की बाजार कीमत ₹${revenueSaved.toLocaleString("en-IN")} है।`
                : `Total treatment cost for your ${acres} acres is ~₹${treatmentCost}, saving crop revenue worth ₹${revenueSaved.toLocaleString("en-IN")}, generating a net profit of +₹${netProfit.toLocaleString("en-IN")}.`}
            </p>
          </div>
        </div>

        {/* ── Navigation Ribbon ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <Link
            href="/plant-intelligence/recovery"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isHindi ? "पिछला: 3. रिकवरी ट्रैकर देखें" : "Previous: 3. Closed-Loop Recovery"}</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/plant-intelligence/mandi"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isHindi ? "अगला: 5. मंडी आर्बिट्राज (5 मंडियां) ➔" : "Next: 5. Mandi Arbitrage (5 Mandis) ➔"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
