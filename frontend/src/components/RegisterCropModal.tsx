"use client";

import React, { useState } from "react";
import { useFarm } from "@/context/FarmContext";
import { useLanguage } from "@/context/LanguageContext";
import { saveFarmerField } from "@/lib/fieldStore";
import {
  X,
  Sprout,
  Plus,
  CheckCircle2,
  MapPin,
  Calendar,
  Layers,
  Droplets,
  Ruler,
  Sparkles,
} from "lucide-react";

interface RegisterCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDistrict?: string;
  defaultState?: string;
  onSuccess?: (newCrop: string) => void;
}

export const SYNGENTA_CROPFIT_CROPS = [
  { id: "wheat", nameEn: "Wheat", nameHi: "गेहूं", defaultVariety: "Shree Ram 303", msp: 2275 },
  { id: "soybean", nameEn: "Soybean", nameHi: "सोयाबीन", defaultVariety: "JS-2034", msp: 4892 },
  { id: "cotton", nameEn: "Cotton (Bt)", nameHi: "कपास (बीटी)", defaultVariety: "Syngenta Gladiator", msp: 7121 },
  { id: "maize", nameEn: "Maize (Corn)", nameHi: "मक्का", defaultVariety: "Syngenta NK-30", msp: 2090 },
  { id: "rice", nameEn: "Paddy / Rice", nameHi: "धान / चावल", defaultVariety: "Pusa Basmati 1509", msp: 2300 },
  { id: "chilli", nameEn: "Chilli", nameHi: "हरी मिर्च", defaultVariety: "Syngenta Hot Pepper HPH", msp: 4800 },
  { id: "tomato", nameEn: "Tomato", nameHi: "टमाटर", defaultVariety: "Syngenta Abhinav", msp: 2100 },
  { id: "groundnut", nameEn: "Groundnut", nameHi: "मूंगफली", defaultVariety: "TAG-24", msp: 6783 },
  { id: "mustard", nameEn: "Mustard", nameHi: "सरसों", defaultVariety: "Pusa Bold", msp: 5650 },
  { id: "chickpea", nameEn: "Chickpea (Gram)", nameHi: "चना", defaultVariety: "JG-11", msp: 5440 },
];

export function RegisterCropModal({
  isOpen,
  onClose,
  defaultDistrict = "Bhopal",
  defaultState = "Madhya Pradesh",
  onSuccess,
}: RegisterCropModalProps) {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const { createFarm, selectFarm } = useFarm();

  const [cropId, setCropId] = useState<string>("wheat");
  const [fieldName, setFieldName] = useState<string>("");
  const [variety, setVariety] = useState<string>("Shree Ram 303");
  const [areaAcres, setAreaAcres] = useState<number>(5.0);
  const [growthStage, setGrowthStage] = useState<string>("Flowering / Bloom");
  const [sowingDate, setSowingDate] = useState<string>("2026-06-25");
  const [soilType, setSoilType] = useState<string>("Medium Black Clay");
  const [irrigation, setIrrigation] = useState<string>("Borewell + Drip");
  const [district, setDistrict] = useState<string>(defaultDistrict);
  const [state, setState] = useState<string>(defaultState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isOpen) return null;

  const selectedCropObj = SYNGENTA_CROPFIT_CROPS.find((c) => c.id === cropId) || SYNGENTA_CROPFIT_CROPS[0];

  const handleCropChange = (id: string) => {
    setCropId(id);
    const matched = SYNGENTA_CROPFIT_CROPS.find((c) => c.id === id);
    if (matched) {
      setVariety(matched.defaultVariety);
      if (!fieldName || fieldName.includes("Field") || fieldName.includes("खेत")) {
        setFieldName(isHindi ? `${matched.nameHi} दूसरा खेत` : `${matched.nameEn} Second Field`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const effectiveName =
      fieldName.trim() ||
      (isHindi ? `${selectedCropObj.nameHi} खेत` : `${selectedCropObj.nameEn} Field`);

    // 1. Create farm in FarmContext
    const newFarm = createFarm({
      name: effectiveName,
      primaryCrop: selectedCropObj.nameEn,
      areaAcres: Number(areaAcres),
      district: district.trim(),
      state: state.trim(),
      growthStage: growthStage,
      sowingDate: sowingDate,
      soilType: soilType,
      irrigationType: irrigation,
    });

    // 2. Also save to fieldStore for GIS synchronization
    try {
      saveFarmerField({
        id: newFarm.id,
        name: effectiveName,
        crop: selectedCropObj.nameEn,
        cropVariety: variety,
        areaAcres: Number(areaAcres),
        areaHa: +(Number(areaAcres) * 0.4047).toFixed(2),
        center: [23.2599, 77.4126],
        polygon: [],
        sowingDate: sowingDate,
        growthStage: growthStage,
        soilType: soilType,
        irrigationType: irrigation,
        color: "#10B981",
        district: district.trim(),
        state: state.trim(),
      });
    } catch (err) {
      console.warn("Field store sync:", err);
    }

    // 3. Immediately activate this new crop
    selectFarm(newFarm.id);
    setIsSubmitting(false);

    if (onSuccess) {
      onSuccess(selectedCropObj.nameEn);
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden font-sans my-8">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-emerald-200 bg-white/10 px-2.5 py-0.5 rounded-full inline-block">
              {isHindi ? "माई फील्ड्स · 2nd फसल पंजीकरण" : "MY FIELDS · REGISTER 2ND CROP"}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-display flex items-center gap-2">
              <Sprout className="h-6 w-6 text-amber-300" />
              <span>{isHindi ? "नया खेत या दूसरी फसल जोड़ें" : "Register Crop / New Field"}</span>
            </h2>
            <p className="text-xs text-emerald-100">
              {isHindi
                ? "मॉडल 1–6 गणना व सिंजेंटा क्रॉपफिट समाधान हेतु खेत विवरण दर्ज करें"
                : "Inputs required by Vertex AI Models 1–6 & Syngenta CropFit solutions"}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5">
          
          {/* Crop Selection (Syngenta CropFit) */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
              <span>{isHindi ? "1. फसल चुनें (Syngenta CropFit समर्थित)" : "1. Select Crop (Syngenta CropFit Certified)"}</span>
              <span className="text-[11px] font-mono text-emerald-700 font-bold">10 Crops Available</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1 bg-slate-50 rounded-2xl border border-slate-200">
              {SYNGENTA_CROPFIT_CROPS.map((c) => {
                const isSelected = c.id === cropId;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleCropChange(c.id)}
                    className={`p-2 rounded-xl text-center text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-500/20"
                        : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80"
                    }`}
                  >
                    <span className="text-xs leading-tight font-display">{isHindi ? c.nameHi : c.nameEn}</span>
                    <span className={`text-[9px] font-mono ${isSelected ? "text-emerald-100" : "text-slate-400"}`}>
                      MSP ₹{c.msp}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Field Name & Variety */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isHindi ? "खेत का नाम / पहचान (Field Name)" : "Field Name / Nickname"}
              </label>
              <input
                type="text"
                required
                value={fieldName}
                onChange={(e) => setFieldName(e.target.value)}
                placeholder={isHindi ? "उदा. गेहूं मेन खेत / नहर वाला खेत" : "e.g. Wheat North Plot"}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isHindi ? "किस्म / बीज (Variety / Hybrid)" : "Variety / Hybrid"}
              </label>
              <input
                type="text"
                value={variety}
                onChange={(e) => setVariety(e.target.value)}
                placeholder="e.g. Shree Ram 303 / JS-2034"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Acreage & Growth Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center justify-between">
                <span>{isHindi ? "जमीन का आकार (Acres)" : "Field Area (Acres)"}</span>
                <span className="font-mono text-emerald-700 font-bold">{areaAcres} ac</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="100"
                  required
                  value={areaAcres}
                  onChange={(e) => setAreaAcres(parseFloat(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold font-mono text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isHindi ? "वर्तमान अवस्था (Growth Stage)" : "Current Growth Stage"}
              </label>
              <select
                value={growthStage}
                onChange={(e) => setGrowthStage(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Vegetative">Vegetative (शाकीय विकास)</option>
                <option value="Flowering / Bloom">Flowering / Bloom (फूल आना)</option>
                <option value="Pod / Fruit Formation">Pod / Fruit Formation (फली / फल लगना)</option>
                <option value="Grain Filling / Maturity">Grain Filling / Maturity (दाने भरना / परिपक्वता)</option>
              </select>
            </div>
          </div>

          {/* Soil Type & Irrigation Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isHindi ? "मिट्टी का प्रकार (Soil Type)" : "Soil Type"}
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Medium Black Clay">Medium Black Clay (मध्यम काली मिट्टी)</option>
                <option value="Deep Black Soil">Deep Black Soil (गहरी भारी काली मिट्टी)</option>
                <option value="Alluvial Soil">Alluvial Loam (दोमट मिट्टी)</option>
                <option value="Red Sandy Loam">Red Sandy Loam (लाल रेतीली मिट्टी)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isHindi ? "सिंचाई का साधन (Irrigation)" : "Irrigation Method"}
              </label>
              <select
                value={irrigation}
                onChange={(e) => setIrrigation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="Borewell + Drip">Borewell + Drip (बोरवेल + ड्रिप)</option>
                <option value="Canal Irrigation">Canal Irrigation (नहर जल)</option>
                <option value="Sprinkler System">Sprinkler (फव्वारा प्रणाली)</option>
                <option value="Rainfed">Rainfed (वर्षा आधारित)</option>
              </select>
            </div>
          </div>

          {/* Location (District & State) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isHindi ? "जिला (District)" : "District"}
              </label>
              <input
                type="text"
                required
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                {isHindi ? "राज्य (State)" : "State"}
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-[#0d253d] focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs cursor-pointer transition-all"
            >
              {isHindi ? "रद्द करें" : "Cancel"}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md hover:shadow-lg cursor-pointer transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              <span>
                {isHindi
                  ? `सहेजें और ${selectedCropObj.nameHi} सक्रिय करें`
                  : `Save & Activate ${selectedCropObj.nameEn}`}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
