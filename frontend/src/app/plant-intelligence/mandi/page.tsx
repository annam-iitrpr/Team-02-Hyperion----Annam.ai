"use client";

import React from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { usePipelinePrediction } from "@/lib/usePipelinePrediction";
import { optimizeMandiLogistics } from "@/lib/mandiLogisticsEngine";
import {
  Truck,
  MapPin,
  Coins,
  TrendingUp,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  Sparkles,
  CheckCircle2,
  ExternalLink,
  Navigation,
  Clock,
  Award,
} from "lucide-react";

export default function MandiCategoryPage() {
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
    speakSummary,
    isSpeaking,
  } = usePipelinePrediction();

  // Harvest volume calculated from Model 5 + Model 6
  const baselineYieldAcre = data?.model5_baseline?.expected_baseline_yield_q_acre || 7.4;
  const causalGainQ = data?.model6_causal_robi?.causal_gain_tau_q_acre || 1.38;
  const protectedYieldAcre = +(baselineYieldAcre + causalGainQ).toFixed(2);
  const totalHarvestQ = +(protectedYieldAcre * acres).toFixed(1);

  // Run dynamic 5-Mandi optimizer using farmer's real crop, district & harvest volume
  const mandiData = optimizeMandiLogistics(
    crop,
    Number(totalHarvestQ) > 0 ? Number(totalHarvestQ) : 11.5,
    district,
    state,
    2150
  );

  const recommended = mandiData.recommendedMandi;

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
                {isHindi ? "5. मंडी मुनाफा व ढुलाई (आर्बिट्राज)" : "5. Mandi Arbitrage"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0d253d] tracking-tight flex items-center gap-2.5">
              <Truck className="h-7 w-7 text-indigo-600 shrink-0" />
              <span>
                {isHindi
                  ? `मंडी आर्बिट्राज — 5 नजदीकी मंडियां व सर्वोत्तम लाभ`
                  : `Mandi Arbitrage — 5 Nearby APMC Mandis & Best Realization`}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isHindi
                ? "राष्ट्रीय कृषि बाजार (e-NAM) व मध्य प्रदेश एपीएमसी लाइव दरों पर आधारित"
                : "Real-time APMC price spread & transport economics across 5 regional mandis"}
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

        {/* ── Recommended Highest Net Realization Banner ───── */}
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-300 shrink-0" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-100">
                {isHindi ? "अनुशंसित: सर्वाधिक शुद्ध मुनाफा (BEST NET REALIZATION)" : "RECOMMENDED: HIGHEST NET REALIZATION"}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display">
              {recommended.mandiName}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed">
              {recommended.recommendationReason}
            </p>
          </div>

          <div className="text-left sm:text-right shrink-0 bg-white/10 px-5 py-3 rounded-2xl border border-white/20">
            <span className="text-[10px] uppercase font-bold text-emerald-200 block">
              {isHindi ? "किसान के हाथ में शुद्ध आय" : "Net Realized In Hand"}
            </span>
            <span className="text-2xl sm:text-3xl font-mono font-black text-white">
              ₹{recommended.netRealizedProfitInr.toLocaleString("en-IN")}
            </span>
            <span className="text-xs text-emerald-100 font-mono block">
              (₹{recommended.netRatePerQtlInr}/qtl net)
            </span>
          </div>
        </div>

        {/* ── 5 Nearby APMC Mandis Comparison Table (From Screenshot) ── */}
        <div className="bg-white border border-[#e3e8ee] rounded-3xl overflow-hidden shadow-xs">
          <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-extrabold text-[#0d253d] font-display flex items-center gap-2">
                <Truck className="h-4 w-4 text-indigo-600" />
                <span>{isHindi ? "5 नजदीकी एपीएमसी मंडियों की तुलना" : "5 Nearby APMC Mandis Real-Time Comparison"}</span>
              </h3>
              <span className="text-xs text-slate-500">
                {isHindi
                  ? `${district} के आसपास की मंडियां · ढुलाई, डीजल व हम्माली खर्च काटकर शुद्ध मुनाफा`
                  : `Live rates around ${district} · Factoring in freight, fuel & APMC labor (hamali)`}
              </span>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 self-start sm:self-auto">
              {totalHarvestQ} {isHindi ? "क्विंटल कुल फसल" : "Quintals Harvest"} ({acres} Ac)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="bg-[#f8fafc] border-b border-slate-200 text-slate-700 font-bold uppercase text-[11px] tracking-wider font-sans">
                <tr>
                  <th className="p-4 pl-6 text-[#475569]">APMC MANDI</th>
                  <th className="p-4 text-[#475569]">DISTANCE &amp; TIME</th>
                  <th className="p-4 text-[#475569]">MODAL PRICE</th>
                  <th className="p-4 text-[#475569]">TRANSPORT COST</th>
                  <th className="p-4 text-[#475569]">LABOR (HAMALI)</th>
                  <th className="p-4 text-[#475569]">NET REALIZED (₹)</th>
                  <th className="p-4 pr-6 text-[#475569]">EXTRA VS LOCAL</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {mandiData.options.slice(0, 5).map((m) => {
                  const isRec = m.isRecommended;
                  return (
                    <tr
                      key={m.mandiId}
                      className={`transition-colors ${
                        isRec
                          ? "bg-[#f4fbf7] hover:bg-[#ebf8f0]"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      <td className="p-4 pl-6">
                        <div className="flex items-center gap-2">
                          {isRec && (
                            <span className="w-1.5 h-3.5 rounded-full bg-[#10b981] shrink-0" />
                          )}
                          <span className={`text-[13px] ${isRec ? "font-black text-[#1e293b]" : "font-bold text-[#1e293b]"}`}>
                            {isHindi ? m.mandiNameHi : m.mandiName}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#64748b] block mt-0.5 font-normal pl-0">
                          {m.district}, {m.state}
                        </span>
                      </td>

                      <td className="p-4 font-sans text-slate-700 whitespace-nowrap text-xs">
                        {m.distanceKm} km · {m.travelTimeHours}
                      </td>

                      <td className="p-4 font-mono font-bold text-[#1e293b] whitespace-nowrap">
                        <div>₹{m.modalPricePerQtl} /</div>
                        <div className="text-[11px] font-normal text-slate-500">qtl</div>
                      </td>

                      <td className="p-4 font-mono font-semibold text-[#e11d48] whitespace-nowrap text-xs">
                        -₹{m.transportationCostTotalInr.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 font-mono font-semibold text-[#e11d48] whitespace-nowrap text-xs">
                        -₹{m.laborHamaliCostTotalInr.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 font-mono font-bold text-[#059669] text-[13px] whitespace-nowrap">
                        ₹{m.netRealizedProfitInr.toLocaleString("en-IN")}
                      </td>

                      <td className="p-4 pr-6 font-mono whitespace-nowrap">
                        {m.profitDifferentialInr > 0 ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-[#dcfce7] text-[#15803d] text-xs font-bold font-mono">
                            +₹{m.profitDifferentialInr.toLocaleString("en-IN")}
                          </span>
                        ) : m.profitDifferentialInr === 0 ? (
                          <span className="text-[#64748b] text-xs font-normal">Local Baseline</span>
                        ) : (
                          <span className="text-[#e11d48] font-bold font-mono text-xs">
                            -₹{Math.abs(m.profitDifferentialInr).toLocaleString("en-IN")}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── 4 Essential Questions (WHAT, WHY, HOW, DISPATCH ADVICE) ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* WHAT */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>{isHindi ? "1. मंडी आर्बिट्राज क्या है? (WHAT)" : "1. What is Mandi Arbitrage?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "पास की दूसरी मंडी में अधिक दाम पर बेचना" : "Capturing Geographical Price Differentials"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "अक्सर 30 से 70 किलोमीटर की दूरी पर स्थित मंडियों में भाव का अंतर ₹150 से ₹400 तक होता है। आर्बिट्राज से किसान बिना किसी अतिरिक्त जोखिम के अधिक मुनाफा कमाता है।"
                : "Prices vary significantly across adjacent district mandis due to processing hubs. Arbitrage unlocks an additional ₹150-₹400/quintal by transporting to the optimal yard."}
            </p>
          </div>

          {/* WHY */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{isHindi ? "2. सर्वोत्तम मंडी में भाव अधिक क्यों है? (WHY)" : "2. Why Do Some Mandis Pay More?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "ऑयल सॉल्वेंट प्लांट व बड़ी प्रतिस्पर्धा" : "Industrial Demand & Trader Bidding"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "प्रमुख व्यापारिक केंद्रों और बड़ी प्रोसेसिंग मिलों के पास स्थित मंडियों में दैनिक पेराई के लिए भारी मांग होती है, जिससे ट्रेडर्स ऊंची बोली लगाते हैं।"
                : "Mandis close to crushing plants and industrial solvent clusters face high daily procurement targets, creating fierce buyer competition."}
            </p>
          </div>

          {/* HOW */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{isHindi ? "3. परिवहन व हम्माली कैसे जुड़ता है? (HOW)" : "3. Logistics & Hamali Arithmetic"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "ट्रैक्टर ट्रॉली या पिकअप से ढुलाई" : "Fixed Base + Per-Km Diesel Freight"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "तालिका में ढुलाई का वास्तविक किराया (डीजल + दूरी) और मंडी हम्माली (तोल व उतराई) पहले ही घटा दी गई है। जो संख्या दिख रही है वह किसान की जेब में आने वाला शुद्ध पैसा है।"
                : "Our algorithm deducts actual tractor diesel freight, highway tolls, and official APMC hamali labor charges. The net column reflects clean profit in your pocket."}
            </p>
          </div>

          {/* DISPATCH ADVICE */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>{isHindi ? "4. बिक्री के लिए क्या करें? (DISPATCH ADVICE)" : "4. Dispatch & Gate Entry Advice"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "नमी 12% से कम रखें व सुबह 8:30 बजे पहुंचें" : "Moisture <12% & Arrive Before 8:30 AM"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "सर्वोच्च भाव पाने के लिए माल को अच्छी तरह सुखाएं। सुबह 8:30 बजे से पहले मंडी गेट पर प्रवेश करें जब मुख्य ट्रेडर्स खुली नीलामी शुरू करते हैं।"
                : "Dry your crop to under 12% moisture to avoid dockage deductions. Arrive before 8:30 AM when opening auction rings command the highest bidding."}
            </p>
          </div>
        </div>

        {/* ── Navigation Ribbon ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <Link
            href="/plant-intelligence/yield"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isHindi ? "पिछला: 4. उपज पूर्वानुमान देखें" : "Previous: 4. Yield Prediction"}</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/plant-intelligence"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isHindi ? "कृषि बुद्धिमत्ता हब पर लौटें ➔" : "Return to Intelligence Hub ➔"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
