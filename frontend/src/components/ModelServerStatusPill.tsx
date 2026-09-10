"use client";

import React, { useState, useEffect } from "react";
import { Cpu, X, CheckCircle2, Cloud } from "lucide-react";

interface VertexStatus {
  online: boolean;
  mode: string;
  service?: string;
  project_id?: string;
  region?: string;
  vertex_endpoints?: Array<{ id: string; displayName: string; endpoint: string; framework: string }>;
}

export function ModelServerStatusPill() {
  const [status, setStatus] = useState<VertexStatus>({ online: false, mode: "vertex_ai_cloud" });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await fetch("/api/pipeline/tunnel", { cache: "no-store" });
        if (res.ok) setStatus(await res.json());
      } catch (_) {}
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!status.online) return null;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all cursor-pointer bg-blue-950/40 border-blue-500/40 text-blue-300 hover:bg-blue-900/40 shadow-[0_0_12px_rgba(59,130,246,0.2)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
        <Cloud className="h-3 w-3 text-blue-400" />
        <span className="hidden sm:inline">Vertex AI: Online</span>
        <span className="sm:hidden">Vertex AI</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-[#0f1011] border border-[#23252a] shadow-2xl text-left z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
          <div className="flex items-center justify-between border-b border-[#23252a] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#f7f8f8]">
                Google Cloud Vertex AI Active
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[#8a8f98] hover:text-[#f7f8f8] p-1 rounded-lg hover:bg-[#18191a] cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 text-xs text-[#8a8f98]">
            <div className="p-2.5 rounded-xl bg-[#141516] border border-[#23252a] space-y-1 font-mono text-[11px]">
              <div className="flex justify-between">
                <span className="text-[#62666d]">Project:</span>
                <span className="text-blue-300 font-semibold">{status.project_id || "iitm01"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#62666d]">Region:</span>
                <span className="text-[#d0d6e0]">{status.region || "asia-south1"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#62666d]">Mode:</span>
                <span className="text-blue-300 font-semibold">☁ Cloud Inference</span>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-[#62666d] uppercase">
                Deployed Model Endpoints
              </span>
              <ul className="space-y-1 text-[11px] text-[#d0d6e0]">
                {(status.vertex_endpoints || [
                  { displayName: "aasra-model1-climate-stress",       framework: "XGBoost Classifier" },
                  { displayName: "aasra-model2-biological-readiness", framework: "Biophysical Gates" },
                  { displayName: "aasra-model3-product-ranker",       framework: "XGBoost LambdaMART" },
                  { displayName: "aasra-model5-yield-baseline",       framework: "XGBoost Regressor" },
                  { displayName: "aasra-model6-causal-robi",          framework: "EconML LinearDML" },
                ]).map((m: any, i: number) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-3 w-3 text-blue-400 shrink-0" />
                    <span>{m.displayName} ({m.framework})</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
