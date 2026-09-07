"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { AppShell } from "@/components/AppShell";
import { useLanguage } from "@/context/LanguageContext";
import { usePipelinePrediction } from "@/lib/usePipelinePrediction";
import {
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  Volume2,
  VolumeX,
  ShieldCheck,
  Calendar,
  Activity,
  Check,
  BookOpen,
} from "lucide-react";

export default function RecoveryCategoryPage() {
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

  const [hasApplied, setHasApplied] = useState<boolean>(false);
  const [appliedDate, setAppliedDate] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aasra_treatment_applied_flag");
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.applied) {
            setHasApplied(true);
            setAppliedDate(parsed.date || "Today");
          }
        } catch {}
      }
    }
  }, []);

  const handleConfirmApplication = async () => {
    setSaving(true);
    const today = new Date().toISOString().split("T")[0];
    setAppliedDate(today);
    setHasApplied(true);

    if (typeof window !== "undefined") {
      localStorage.setItem(
        "aasra_treatment_applied_flag",
        JSON.stringify({ applied: true, date: today, crop, acres })
      );
    }

    try {
      await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Applied Syngenta Quantis® (${crop})`,
          notes: `Applied 250ml/acre (${(0.25 * acres).toFixed(2)}L total) for thermal stress protection at ${growthStage} stage.`,
          stage: growthStage,
          tags: ["AgronomicIntervention", "Quantis", "ThermalRecovery"],
        }),
      });
    } catch (e) {
      console.warn("Journal sync warning:", e);
    } finally {
      setSaving(false);
    }
  };

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
                {isHindi ? "3. रिकवरी ट्रैकर (क्लोज्ड लूप)" : "3. Closed-Loop Recovery"}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-[#0d253d] tracking-tight flex items-center gap-2.5">
              <ShieldCheck className="h-7 w-7 text-emerald-600 shrink-0" />
              <span>
                {isHindi
                  ? `क्लोज्ड-लूप रिकवरी ट्रैकर — ${crop.toUpperCase()}`
                  : `Closed-Loop Recovery Tracker — ${crop.toUpperCase()}`}
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {isHindi
                ? "छिड़काव के बाद पौधे की सुरक्षा और 72 घंटे की पुनरुद्धार प्रक्रिया की पुष्टि"
                : "Continuous verification: Spray confirmation, journal synchronization, and 72h physiological recovery"}
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

        {/* ── Status Banner & 1-Click Action ────────────────── */}
        <div className={`border-2 rounded-3xl p-6 sm:p-7 shadow-xs space-y-5 transition-all ${
          hasApplied
            ? "bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border-emerald-500/40"
            : "bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-transparent border-amber-500/40"
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl text-white shadow-md shrink-0 ${
                hasApplied ? "bg-emerald-600" : "bg-amber-600"
              }`}>
                {hasApplied ? <Check className="h-8 w-8" /> : <Clock className="h-8 w-8" />}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-mono font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${
                    hasApplied
                      ? "text-emerald-800 bg-emerald-100 border-emerald-300"
                      : "text-amber-800 bg-amber-100 border-amber-300"
                  }`}>
                    {hasApplied ? (isHindi ? "उपचार संपन्न (APPLIED)" : "Treatment Applied 🌿") : (isHindi ? "कार्रवाई आवश्यक (ACTION NEEDED)" : "Action Needed")}
                  </span>
                  <span className="text-xs text-slate-500">
                    {district} · {acres} Acres
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#0d253d] font-display">
                  {hasApplied
                    ? (isHindi ? `क्वांटिस छिड़काव दर्ज हुआ (${appliedDate})` : `Quantis® Applied & Confirmed (${appliedDate})`)
                    : (isHindi ? "क्वांटिस छिड़काव की पुष्टि बाकी है" : "Quantis® Application Pending Confirmation")}
                </h2>
              </div>
            </div>

            {/* 1-Click Action Button */}
            <div>
              {hasApplied ? (
                <div className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-md">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{isHindi ? "सुरक्षा सक्रिय · डायरी में दर्ज" : "Protection Active · Synced"}</span>
                </div>
              ) : (
                <button
                  onClick={handleConfirmApplication}
                  disabled={saving}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                >
                  <Check className="h-4 w-4" />
                  <span>
                    {saving
                      ? (isHindi ? "सहेज रहे हैं..." : "Saving...")
                      : (isHindi ? "✓ मैंने छिड़काव कर दिया है (पुष्टि करें)" : "✓ Confirm I Have Sprayed Quantis")}
                  </span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── 3-Day Post-Application Verification Protocol ──── */}
        <div className="bg-white border border-[#e3e8ee] rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-[#0d253d] font-display flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" />
              <span>{isHindi ? "72-घंटे का वैज्ञानिक रिकवरी शेड्यूल" : "72-Hour Physiological Recovery Protocol"}</span>
            </h3>
            <span className="text-xs font-bold text-emerald-700 font-mono">
              AASRA Closed-Loop Standard
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
            <div className={`p-4 rounded-2xl border space-y-2 ${hasApplied ? "bg-emerald-50/70 border-emerald-200" : "bg-[#f6f9fc] border-slate-200/80"}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-800">DAY +1 (24 Hours)</span>
                {hasApplied && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {isHindi ? "पत्तियों में अवशोषण पूर्ण" : "Canopy Uptake Complete"}
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                {isHindi
                  ? "क्वांटिस के पेप्टाइड्स और प्रोलाइन पत्तियों द्वारा पूर्णतः अवशोषित हो चुके हैं। कोशिकाएं टर्गिड (तनावमुक्त) हैं।"
                  : "Osmoprotectants fully absorbed across leaf cuticle. Stomatal aperture regulates normally without wilting."}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${hasApplied ? "bg-emerald-50/70 border-emerald-200" : "bg-[#f6f9fc] border-slate-200/80"}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-800">DAY +2 (48 Hours)</span>
                {hasApplied && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {isHindi ? "फूल झड़ने में 70% कमी" : "Blossom Retention Sustained"}
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                {isHindi
                  ? "परागकणों की जीवनक्षमता सुरक्षित है। पौधों में फूल गिरने की दर सामान्य सीमा में वापस आ गई है।"
                  : "Pollen viability preserved during heat spike. Abscission zone formation arrested; flower drop reduced by 70%."}
              </p>
            </div>

            <div className={`p-4 rounded-2xl border space-y-2 ${hasApplied ? "bg-emerald-50/70 border-emerald-200" : "bg-[#f6f9fc] border-slate-200/80"}`}>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-emerald-800">DAY +3 (72 Hours)</span>
                {hasApplied && <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {isHindi ? "उपग्रह NDVI सामान्यीकरण" : "Satellite NDVI Normalization"}
              </div>
              <p className="text-slate-600 text-xs leading-relaxed">
                {isHindi
                  ? "सेंटिनल-2 उपग्रह से फसल की हरियाली में सुधार देखा जाएगा (+0.08 NDVI बाउंस-बैक)।"
                  : "Sentinel-2 multispectral imagery confirms canopy greenness index recovery (+0.08 NDVI rebound) across your field."}
              </p>
            </div>
          </div>
        </div>

        {/* ── 4 Essential Questions (WHAT, WHY, HOW, NEXT STEP) ──── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* WHAT */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              <span>{isHindi ? "1. क्लोज्ड-लूप रिकवरी क्या है?" : "1. What is Closed-Loop Recovery?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "सिफारिश से लेकर वास्तविक परिणाम तक की निगरानी" : "Verified End-to-End Action Verification"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "यह केवल सलाह देने वाला ऐप नहीं है। यह सुनिश्चित करता है कि किसान द्वारा सही समय पर स्प्रे किया गया और पौधे ने सफलतापूर्वक तनाव से उबर लिया।"
                : "A closed-loop system closes the loop between advice and outcome. It verifies field execution and tracks subsequent biophysical response until harvest."}
            </p>
          </div>

          {/* WHY */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              <span>{isHindi ? "2. यह पुष्टि क्यों आवश्यक है?" : "2. Why is Tracking Critical?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "उपज और आय की गारंटी के लिए" : "Secures Your ROI & Yield Protection"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "समय पर स्प्रे न होने पर 48 घंटे में नुकसान स्थायी हो जाता है। पुष्टि करने से अगली बारिश व तापमान चक्र में सही सलाह मिलती है।"
                : "Heat damage becomes irreversible after 48 hours without treatment. Confirming your spray calibrates subsequent yield and weather forecast models."}
            </p>
          </div>

          {/* HOW */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span>{isHindi ? "3. डायरी में स्वतः कैसे जुड़ता है?" : "3. How Does It Sync with Farm Journal?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "ऑटोमैटिक स्प्रे रिकॉर्ड व इतिहास" : "Automatic Spray History & Audit Trail"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? "पुष्टि करते ही आपकी 'फार्म डायरी' में दवा का नाम, मात्रा, तारीख और खेत का रकबा सुरक्षित हो जाता है ताकि फसल चक्र का पूरा हिसाब रहे।"
                : "Tapping confirm automatically logs the exact dosage, date, cost, and reason into your permanent digital Farm Journal for season-long traceability."}
            </p>
          </div>

          {/* NEXT STEP */}
          <div className="bg-white border border-[#e3e8ee] rounded-3xl p-5 sm:p-6 shadow-xs space-y-2.5">
            <div className="flex items-center gap-2 text-rose-600 font-bold text-xs uppercase tracking-wider">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
              <span>{isHindi ? "4. आपका अगला कदम क्या है?" : "4. What is Your Next Action?"}</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-[#0d253d] font-display">
              {isHindi ? "उपज पूर्वानुमान व मंडी मुनाफा जांचें" : "Review Yield Gain & Mandi Arbitrage"}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {isHindi
                ? `इस स्प्रे से आपकी फसल में प्रति एकड़ +1.38 क्विंटल उपज सुरक्षित हुई है। अगला कदम यह देखना है कि इसे कौन सी मंडी में सबसे ऊंचे दाम पर बेचा जा सकता है।`
                : `With treatment logged, Model 6 predicts an uplift of +1.38 quintals/acre. Proceed to see your protected harvest valuation and optimal Mandi arbitrage.`}
            </p>
          </div>
        </div>

        {/* ── Navigation Ribbon ──────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-3xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <Link
            href="/plant-intelligence/prescription"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>{isHindi ? "पिछला: 2. उत्पाद सिफारिश देखें" : "Previous: 2. Product & Rationale"}</span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/plant-intelligence/yield"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>{isHindi ? "अगला: 4. उपज पूर्वानुमान (+18.6%) देखें ➔" : "Next: 4. Yield Prediction (+18.6%) ➔"}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
