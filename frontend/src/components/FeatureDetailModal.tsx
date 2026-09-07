"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import {
  X,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Cpu,
  Layers,
  Activity,
  Zap,
} from "lucide-react";

export interface FeatureDetailData {
  id: string;
  label: string;
  sublabel: string;
  labelEn: string;
  sublabelEn: string;
  bg: string;
  border: string;
  text: string;
  subtext: string;
  delay?: string;
  badge: string;
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  simpleExplanation: string;
  simpleExplanationHi: string;
  benefits: Array<{
    title: string;
    titleHi: string;
    desc: string;
    descHi: string;
  }>;
  techSpecs: Array<{ label: string; value: string }>;
  actionLabel: string;
  actionLabelHi: string;
  actionHref: string;
  iconBg: string;
  badgeBg: string;
  badgeText: string;
  accentColor: string;
  icon: React.ReactNode;
}

interface FeatureDetailModalProps {
  feature: FeatureDetailData | null;
  isOpen: boolean;
  onClose: () => void;
  isHindi: boolean;
}

export const FeatureDetailModal: React.FC<FeatureDetailModalProps> = ({
  feature,
  isOpen,
  onClose,
  isHindi,
}) => {
  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !feature) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop with elegant blur (Stripe aesthetic) */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        className="relative bg-white border border-[#e3e8ee] rounded-2xl sm:rounded-3xl shadow-2xl max-w-xl w-full p-5 sm:p-7 z-10 my-4 max-h-[88vh] overflow-y-auto transform transition-all duration-300 scale-100 text-left"
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header Row */}
        <div className="flex items-start gap-4 pr-8">
          <div
            className={`w-12 h-12 rounded-2xl ${feature.iconBg} flex items-center justify-center shrink-0 shadow-sm border border-[#e3e8ee]`}
          >
            {feature.icon}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span
                className={`text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${feature.badgeBg} ${feature.badgeText}`}
              >
                {feature.badge}
              </span>
              <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                • Verified Architecture
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0d253d] font-display leading-tight">
              {isHindi ? feature.titleHi : feature.title}
            </h3>
            <p className="text-xs sm:text-sm text-[#64748d] mt-1 font-medium">
              {isHindi ? feature.subtitleHi : feature.subtitle}
            </p>
          </div>
        </div>

        {/* In Simple Terms / सरल शब्दों में */}
        <div className="mt-5 p-4 rounded-xl bg-[#f6f9fc] border border-[#e3e8ee]">
          <div className="text-[11px] font-bold uppercase tracking-wider text-[#533afd] mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#533afd]" />
            <span>{isHindi ? "सरल शब्दों में यह क्या है?" : "In Simple Terms:"}</span>
          </div>
          <p className="text-xs sm:text-sm text-[#273951] leading-relaxed">
            {isHindi ? feature.simpleExplanationHi : feature.simpleExplanation}
          </p>
        </div>

        {/* How It Helps The Farmer / मुख्य लाभ */}
        <div className="mt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#64748d] mb-3">
            {isHindi ? "किसानों के लिए मुख्य लाभ (Key Benefits)" : "Key Field Benefits:"}
          </h4>
          <div className="space-y-2.5">
            {feature.benefits.map((b, i) => (
              <div
                key={i}
                className="flex items-start gap-2.5 p-2.5 rounded-xl bg-white border border-[#e3e8ee] hover:border-[#533afd]/30 transition-colors"
              >
                <div className="mt-0.5 shrink-0 text-emerald-600 bg-emerald-50 rounded-full p-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-bold text-[#0d253d] block">
                    {isHindi ? b.titleHi : b.title}
                  </span>
                  <span className="text-[11px] sm:text-xs text-[#64748d] leading-normal">
                    {isHindi ? b.descHi : b.desc}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Technical / Scientific Grounding Pills */}
        <div className="mt-5 pt-4 border-t border-[#e3e8ee]">
          <div className="text-[10px] uppercase font-bold tracking-wider text-[#64748d] mb-2 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-[#533afd]" />
            <span>{isHindi ? "वैज्ञानिक आधार व लाइव डेटा स्रोत:" : "Scientific & Data Grounding:"}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {feature.techSpecs.map((spec, i) => (
              <div
                key={i}
                className="p-2 rounded-lg bg-[#f8fafc] border border-[#e3e8ee] text-[11px]"
              >
                <div className="text-slate-400 text-[10px] truncate">{spec.label}</div>
                <div className="font-mono font-bold text-[#0d253d] truncate">{spec.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="mt-6 pt-4 border-t border-[#e3e8ee] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-[#e3e8ee] text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors cursor-pointer text-center"
          >
            {isHindi ? "बंद करें" : "Close"}
          </button>

          <Link
            href={feature.actionHref}
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#533afd] hover:bg-[#4434d4] text-white text-xs font-bold transition-all shadow-md shadow-[#533afd]/20 flex items-center justify-center gap-2 cursor-pointer text-center"
          >
            <span>{isHindi ? feature.actionLabelHi : feature.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
