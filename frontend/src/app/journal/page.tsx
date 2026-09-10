"use client";

import React, { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { InterventionJournal } from "@/components/InterventionJournal";
import { BookOpen, Sparkles, Activity, AlertTriangle, Mic, Sprout, Calendar, TrendingUp } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredProfile } from "@/lib/userStore";

export default function JournalPage() {
  const [filter, setFilter] = useState("all");
  const { t } = useLanguage();
  const profile = getStoredProfile();

  const FILTERS = [
    { id: "all",      label: "All Chronicles",    count: 8, icon: BookOpen },
    { id: "spray",   label: "Biological Sprays", count: 2, icon: Activity },
    { id: "heat",    label: "Climate Warnings",  count: 2, icon: AlertTriangle },
    { id: "ai",      label: "AI Advisories",     count: 2, icon: Mic },
    { id: "planting",label: "Crop Phenology",    count: 2, icon: Sprout },
  ];

  return (
    <AppShell>
      <div className="relative min-h-screen bg-[#fbfcf8] bg-[radial-gradient(#1b4332_0.75px,transparent_0.75px)] [background-size:24px_24px] [background-position:0_0] text-slate-800 pb-24 md:pb-12">
        <div className="max-w-[1240px] w-full mx-auto px-4 sm:px-6 py-8 space-y-8 text-slate-900 font-sans">
          
          {/* Header (Unified Krishyantra Theme) */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-[#e8ede4] pb-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e8f5e9] border border-[#cbe5cb] text-[#1b4332] text-xs font-mono font-bold tracking-wide shadow-2xs">
                <Sprout className="h-3.5 w-3.5 text-[#2d6a4f]" />
                <span>PS-07 · PERMANENT SEASON JOURNAL</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold font-display text-[#11261f] tracking-tight">
                Chronicles of the Season
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                A chronological audit trail documenting sowing milestones, nocturnal heatwave alerts, Syngenta biological interventions, and verified harvest gains for <strong>{profile.fullName || "Ishaan Sen"}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="px-4 py-2 rounded-2xl bg-[#e8f5e9] text-[#1b4332] text-xs font-mono font-bold border border-[#cbe5cb] shadow-2xs flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-[#2d6a4f]" />
                <span>8 Verified Milestones</span>
              </span>
            </div>
          </div>

          {/* Farmer Understanding Guide Banner */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] flex flex-col sm:flex-row items-start sm:items-center gap-3.5 sm:gap-4">
            <div className="h-10 w-10 rounded-xl bg-[#e8f5e9] text-[#1b4332] flex items-center justify-center shrink-0 border border-[#cbe5cb]">
              <BookOpen className="h-5 w-5 text-[#2d6a4f]" />
            </div>
            <div className="space-y-0.5 text-xs">
              <h4 className="font-bold text-[#11261f] text-sm">
                🌾 How the Season Journal Protects Your Farm Profits
              </h4>
              <p className="text-slate-600 leading-relaxed">
                Every action you record here—sprays, heat warnings, and AI advice—is verified against satellite weather. This creates an unalterable proof of crop care that unlocks crop insurance claims, bank credit, and guaranteed yields.
              </p>
            </div>
          </div>

          {/* 3 Quick Summary KPI Cards (Dashboard Match) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-1">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block font-semibold">
                SEASON TIMELINE
              </span>
              <div className="text-2xl font-black font-mono text-[#11261f]">
                Kharif 2026
              </div>
              <p className="text-xs text-slate-600">
                Sowing to R2 Flowering ({profile.fieldAreaAcres || 5.0} Acres {profile.primaryCrop || "Soybean"})
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-1">
              <span className="text-[11px] font-mono text-[#2d6a4f] uppercase tracking-wider block font-semibold">
                BIOLOGICAL PROTECTION VALUE
              </span>
              <div className="text-2xl font-black font-mono text-[#1b4332]">
                +₹22,120 Saved
              </div>
              <p className="text-xs text-slate-600">
                4.46x Verified ROBI (Syngenta Quantis Treatment)
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-1">
              <span className="text-[11px] font-mono text-[#2d6a4f] uppercase tracking-wider block font-semibold">
                CAUSAL AUDIT STATUS
              </span>
              <div className="text-2xl font-black font-display text-[#1b4332]">
                Verified 100%
              </div>
              <p className="text-xs text-slate-600">
                Cross-checked against Open-Meteo satellite reanalysis
              </p>
            </div>
          </div>

          {/* Filter Tab Strip */}
          <div className="flex flex-wrap gap-2.5">
            {FILTERS.map(({ id, label, count, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setFilter(id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  filter === id
                    ? "bg-[#1b4332] text-white shadow-sm border border-[#1b4332]"
                    : "bg-white text-slate-700 hover:text-[#11261f] hover:bg-[#e8f5e9]/60 border border-[#e8ede4]"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-black ${
                    filter === id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>

          {/* Main Timeline Container */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8ede4] shadow-[0_4px_24px_rgba(27,67,50,0.04)]">
            <InterventionJournal filter={filter} />
          </div>

        </div>
      </div>
    </AppShell>
  );
}
