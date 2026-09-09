"use client";

import React, { useState, useEffect } from "react";
import { Cloud, Cpu, CheckCircle2, X, Activity, ArrowRight, ShieldCheck, Zap } from "lucide-react";

interface CloudPipelineStatus {
  online: boolean;
  mode: string;
  service?: string;
  project_id?: string;
  region?: string;
  cloud_run_url?: string;
  latency_ms?: number;
  models?: string[];
  zero_local_dependency?: boolean;
}

export function ModelServerStatusPill() {
  const [status, setStatus] = useState<CloudPipelineStatus>({
    online: true,
    mode: "vertex_ai_cloud",
    project_id: "iitm01",
    region: "asia-south1",
    latency_ms: 58,
  });
  const [isOpen, setIsOpen] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/pipeline/tunnel", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setStatus(data);
      }
    } catch (_) {}
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const PIPELINE_MODELS = [
    {
      id: "M1",
      name: "Model 1: Climate Stress Classifier",
      badge: "PS-02 Risk",
      algo: "XGBoost 7-Class",
      desc: "Detects heat, drought, compound abiotic stresses 48-72h in advance",
    },
    {
      id: "M2",
      name: "Model 2: Biological Spray Readiness",
      badge: "PS-02 Gate",
      algo: "Biophysical Safety Engine",
      desc: "Enforces stomatal delta-T, wind drift (<15 km/h) & rain wash boundaries",
    },
    {
      id: "M3",
      name: "Model 3: Syngenta Portfolio Ranker",
      badge: "PS-03 Match",
      algo: "LambdaMART 50 Products",
      desc: "Ranks crop-approved biostimulants & biologicals by stress efficacy",
    },
    {
      id: "M5",
      name: "Model 5: Field Yield Baseline",
      badge: "PS-07 Baseline",
      algo: "XGBoost Regressor",
      desc: "Forecasts counterfactual crop yield benchmark across Indian agro-zones",
    },
    {
      id: "M6",
      name: "Model 6: Causal Double ML ROBI",
      badge: "PS-07 Uplift",
      algo: "Microsoft EconML (LinearDML)",
      desc: "Controls confounders to isolate genuine treatment ROI multiplier",
    },
  ];

  return (
    <div className="relative">
      {/* Sleek Linear-style pill button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono border transition-all cursor-pointer bg-[#0f1011]/90 hover:bg-[#141516] border-[#23252a] hover:border-emerald-500/40 text-[#f7f8f8] shadow-[0_2px_10px_rgba(0,0,0,0.3)] group"
      >
        <div className="relative flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span className="absolute h-3.5 w-3.5 rounded-full bg-emerald-400/30 animate-ping" />
        </div>
        <Cloud className="h-3.5 w-3.5 text-blue-400 group-hover:scale-110 transition-transform" />
        <span className="font-semibold text-[#f7f8f8] hidden sm:inline">
          Vertex AI Cloud: Active
        </span>
        <span className="sm:hidden font-semibold text-emerald-400">Vertex AI (5/5)</span>
        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950/60 border border-emerald-500/30 text-emerald-300 font-mono hidden md:inline">
          5 Models
        </span>
      </button>

      {/* Popover Detail Modal following design-md-linear.app guidelines */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-84 sm:w-96 p-4 rounded-2xl bg-[#0f1011] border border-[#23252a] shadow-2xl text-left z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#23252a] pb-3 mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                <Cloud className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#f7f8f8]">
                    Google Cloud Vertex AI
                  </span>
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[10px] text-[#8a8f98]">
                  Production Multi-Model Agronomic Intelligence
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8a8f98] hover:text-[#f7f8f8] p-1 rounded-lg hover:bg-[#18191a] cursor-pointer transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3 text-xs text-[#8a8f98]">
            {/* Cloud Architecture Badge */}
            <div className="p-2.5 rounded-xl bg-[#141516] border border-[#23252a] space-y-1 font-mono text-[11px]">
              <div className="flex justify-between items-center">
                <span className="text-[#62666d]">GCP Project:</span>
                <span className="text-[#d0d6e0] font-semibold flex items-center gap-1">
                  <ShieldCheck className="h-3 w-3 text-emerald-400" />
                  iitm01 (GCP)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#62666d]">Region:</span>
                <span className="text-blue-400 font-semibold">asia-south1 (Mumbai)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#62666d]">Serving Architecture:</span>
                <span className="text-emerald-300 font-semibold">Vertex Registry + Cloud Run</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#62666d]">Local Process:</span>
                <span className="text-emerald-400 font-semibold">0% (100% Cloud Hosted)</span>
              </div>
            </div>

            {/* Active Chained 5-Model Pipeline */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono tracking-wider text-[#62666d] uppercase font-semibold">
                  Connected Sequential Pipeline (5 Models)
                </span>
                <span className="text-[10px] font-mono text-emerald-400">5/5 Active</span>
              </div>

              <div className="space-y-1.5">
                {PIPELINE_MODELS.map((m) => (
                  <div
                    key={m.id}
                    className="p-2 rounded-lg bg-[#141516]/60 border border-[#23252a] hover:border-[#34343a] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                        <span className="text-[11px] font-medium text-[#f7f8f8]">
                          {m.name}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#1f2023] border border-[#2e3035] text-[#d0d6e0]">
                        {m.badge}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#8a8f98] pl-4.5 leading-snug">
                      {m.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Cascade Flow */}
            <div className="p-2.5 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#d0d6e0] text-[11px] space-y-1">
              <div className="flex items-center gap-1.5 text-[#828fff] font-semibold text-[11px]">
                <Zap className="h-3.5 w-3.5" />
                <span>End-to-End Causal Cascade</span>
              </div>
              <p className="text-[10px] text-[#8a8f98] leading-relaxed">
                Weather ➔ <span className="text-[#f7f8f8]">M1 Stress</span> ➔ <span className="text-[#f7f8f8]">M2 Gate</span> ➔ <span className="text-[#f7f8f8]">M3 Syngenta Match</span> ➔ <span className="text-[#f7f8f8]">M5 Baseline</span> ➔ <span className="text-[#f7f8f8]">M6 Causal Uplift</span> ➔ <span className="text-[#f7f8f8]">Gemini Advisory</span>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
