"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useFarm } from "@/context/FarmContext";
import { useLanguage } from "@/context/LanguageContext";
import {
  Sprout,
  Plus,
  Check,
  ChevronDown,
} from "lucide-react";

interface FarmCropSwitcherProps {
  allowRegister?: boolean;
}

export function FarmCropSwitcher({ allowRegister = true }: FarmCropSwitcherProps) {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const { activeFarm, farms, selectFarm } = useFarm();

  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left font-sans">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl bg-white hover:bg-slate-50 text-[#0d253d] border border-slate-200/90 shadow-2xs transition-all text-xs font-bold cursor-pointer group"
      >
        <div className="p-1 rounded-lg bg-emerald-100/70 text-emerald-800 shrink-0">
          <Sprout className="h-3.5 w-3.5" />
        </div>
        <div className="text-left leading-tight">
          <span className="block text-[11px] font-black text-[#0d253d] group-hover:text-emerald-700 transition-colors truncate max-w-[150px] sm:max-w-[180px]">
            {activeFarm.name}
          </span>
          <span className="block text-[10px] text-slate-500 font-mono">
            {activeFarm.primaryCrop} · {activeFarm.areaAcres} Ac
          </span>
        </div>
        <ChevronDown
          className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 text-xs text-slate-800">
          <div className="px-3.5 py-1.5 border-b border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
              {isHindi ? "पंजीकृत फसलें / खेत" : "REGISTERED CROPS & FIELDS"}
            </span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
              {farms.length} {isHindi ? "खेत" : "Field(s)"}
            </span>
          </div>

          <div className="max-h-60 overflow-y-auto py-1 space-y-0.5">
            {farms.map((f) => {
              const isActive = f.id === activeFarm.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    selectFarm(f.id);
                    setIsOpen(false);
                    // Bust all prediction caches so the new crop gets fresh model results
                    if (typeof window !== "undefined") {
                      try {
                        const keysToDelete: string[] = [];
                        for (let i = 0; i < localStorage.length; i++) {
                          const k = localStorage.key(i);
                          if (
                            k &&
                            (k.startsWith("aasra_model_pipeline_cache_") ||
                              k.startsWith("nimbooz_prediction_cache_"))
                          ) {
                            keysToDelete.push(k);
                          }
                        }
                        keysToDelete.forEach((k) => localStorage.removeItem(k));
                      } catch {}
                      // Notify all hooks/components of the farm change
                      window.dispatchEvent(new Event("aasra_fields_updated"));
                    }
                  }}
                  className={`w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer ${
                    isActive
                      ? "bg-emerald-50/70 text-emerald-950 font-bold border-l-4 border-emerald-600"
                      : "text-slate-700"
                  }`}
                >
                  <div>
                    <div className="font-extrabold text-[#0d253d] flex items-center gap-1.5">
                      <span>{f.name}</span>
                      <span className="text-[9px] font-mono font-bold bg-slate-100 px-1.5 py-0.2 rounded text-slate-600">
                        {f.primaryCrop}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono block mt-0.5">
                      {f.areaAcres} Ac · {f.district || "Bhopal"}
                    </span>
                  </div>
                  {isActive && (
                    <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {allowRegister && (
            <div className="border-t border-slate-100 pt-1.5 px-2 mt-1">
              <Link
                href="/fields?action=register"
                onClick={() => setIsOpen(false)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>
                  {isHindi ? "+ नया खेत / दूसरी फसल जोड़ें" : "+ Register New Field / 2nd Crop"}
                </span>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
