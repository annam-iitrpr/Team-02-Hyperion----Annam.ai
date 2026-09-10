import React from "react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[#ffffff] border-t border-[#e3e8ee] pt-16 pb-12 text-[#64748d] text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-[#e3e8ee]">
          
          {/* Col 1: Brand & Manifesto */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-[#0d253d]">
                krishyantra
              </span>
              <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full bg-[#533afd]/10 text-[#533afd]">
                AASRA
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#64748d]">
              Evidence-based precision agriculture intelligence. Replacing speculative advice with deterministic biophysical modeling, satellite indices, and localized climate stress prediction.
            </p>
            <div className="flex items-center gap-2 text-xs text-[#0d253d] font-medium pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>All 6 Machine Learning Services Operational</span>
            </div>
          </div>

          {/* Col 2: Core Intelligence */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0d253d]">
              Intelligence Models
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#models" className="hover:text-[#533afd] transition-colors">
                  PS-02: Climate Stress Classifier
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-[#533afd] transition-colors">
                  PS-03: Biological Readiness Engine
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-[#533afd] transition-colors">
                  PS-04: Syngenta Biological Matcher
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-[#533afd] transition-colors">
                  PS-07: Field Yield Baseline & ROI
                </a>
              </li>
              <li>
                <a href="#models" className="hover:text-[#533afd] transition-colors">
                  Deterministic Verification Bridge
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Technical Foundation */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0d253d]">
              Architecture & Telemetry
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-[#273951]">Google Vertex AI Pipelines</span>
              </li>
              <li>
                <span className="text-[#273951]">Copernicus Sentinel-2 Satellite Feed</span>
              </li>
              <li>
                <span className="text-[#273951]">Open-Meteo Precision Telemetry</span>
              </li>
              <li>
                <span className="text-[#273951]">Deterministic Soil Chemical Kinetics</span>
              </li>
              <li>
                <span className="text-[#273951]">FastAPI High-Throughput Microservices</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#0d253d]">
              Governance & Proof
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="text-[#273951]">Zero Hallucination Agronomic Guardrail</span>
              </li>
              <li>
                <span className="text-[#273951]">Local Agro-Climatic Zone Calibration</span>
              </li>
              <li>
                <span className="text-[#273951]">Real-time Mandi Price Ingestion</span>
              </li>
              <li>
                <span className="text-[#273951]">Peer-reviewed Biophysical Baseline</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom row */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748d]">
          <p>© {new Date().getFullYear()} krishyantra (AASRA System Architecture). All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#0d253d] transition-colors">
              ISO-Calibrated Agronomic Standards
            </span>
            <span className="hover:text-[#0d253d] transition-colors">
              Privacy & Telemetry Safe
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
