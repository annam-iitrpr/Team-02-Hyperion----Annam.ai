"use client";

import React, { useState, useEffect } from "react";
import { Cpu, Wifi, WifiOff, X, Terminal, ExternalLink, CheckCircle2 } from "lucide-react";

interface TunnelStatus {
  online: boolean;
  mode: "local_tunnel" | "serverless_edge";
  tunnel_url?: string;
  latency_ms?: number;
  models?: string[];
}

export function ModelServerStatusPill() {
  const [status, setStatus] = useState<TunnelStatus>({
    online: false,
    mode: "serverless_edge",
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
    const interval = setInterval(fetchStatus, 15000);
    return () => clearInterval(interval);
  }, []);

  // Only render when the local model server is actively connected
  if (!status.online) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all cursor-pointer bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40 shadow-[0_0_12px_rgba(16,185,129,0.2)]"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <Cpu className="h-3 w-3 text-emerald-400" />
        <span className="hidden sm:inline">Local Models: Connected</span>
        <span className="sm:hidden">Local ML</span>
      </button>

      {/* Popover Detail Modal */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 p-4 rounded-2xl bg-[#0f1011] border border-[#23252a] shadow-2xl text-left z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
          <div className="flex items-center justify-between border-b border-[#23252a] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-[#f7f8f8]">
                Local Model Server Bridge Active
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
                <span className="text-[#62666d]">Execution Mode:</span>
                <span className="text-[#d0d6e0] font-semibold">
                  ⚡ Local Machine (Tunnel Bridge)
                </span>
              </div>
              {status.tunnel_url && (
                <div className="flex justify-between truncate">
                  <span className="text-[#62666d]">Tunnel:</span>
                  <span className="text-emerald-400 truncate max-w-[200px]">{status.tunnel_url}</span>
                </div>
              )}
              {status.latency_ms !== undefined && status.latency_ms > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#62666d]">Latency:</span>
                  <span className="text-emerald-300">{status.latency_ms} ms</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-wider text-[#62666d] uppercase">
                Active Agronomic AI Pipelines
              </span>
              <ul className="space-y-1 text-[11px] text-[#d0d6e0]">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>Model 1: Climate Stress Classifier (XGBoost)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>Model 2: Biological Spray Readiness (Biophysical Gates)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>Model 3: Syngenta Portfolio Ranker (LambdaMART)</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-400 shrink-0" />
                  <span>Model 6: Causal Double ML ROBI (EconML LinearDML)</span>
                </li>
              </ul>
            </div>

            <div className="p-3 rounded-xl bg-[#5e6ad2]/10 border border-[#5e6ad2]/20 text-[#d0d6e0] text-[11px] space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#5e6ad2] font-semibold">
                <Terminal className="h-3.5 w-3.5" />
                <span>One-Click Desktop Connection</span>
              </div>
              <p className="text-[10px] text-[#8a8f98] leading-relaxed">
                To connect your local GPU / CPU model server to this website, double-click <code className="text-[#f7f8f8] bg-[#0f1011] px-1 py-0.5 rounded border border-[#23252a]">start_model_server_and_connect.bat</code> in the project folder.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
