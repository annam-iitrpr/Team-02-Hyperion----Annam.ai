"use client";

import React from "react";
import { Tag, CheckCircle2, MapPin, Sparkles } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

interface SyngentaMandiOffersProps {
  district: string;
  crop?: string;
  acres?: number;
}

export function SyngentaMandiOffers({ district, crop = "Soybean", acres = 5 }: SyngentaMandiOffersProps) {
  const { language } = useLanguage();
  const isHindi = ["hi", "mr", "gu", "pa"].includes(language);
  const activeDistrict = district || "Bhopal";

  const offers = [
    {
      id: "heat-shield",
      badge: isHindi ? "🔥 भीषण गर्मी व धूप सुरक्षा" : "🔥 HOT WEATHER CARE",
      badgeClass: "text-amber-900 bg-amber-50 border-amber-200/80",
      subBadge: isHindi ? "इस सीजन का विशेष ऑफर" : "This Season's Special",
      title: isHindi ? "फसल ताप व धूप सुरक्षा (क्वांटिस®)" : "Crop Heat Shield (Quantis®)",
      discount: isHindi ? "2 लीटर या अधिक पर ₹150 प्रति एकड़ बचत" : "Save ₹150 per Acre on 2L+ Packs",
      discountClass: "text-emerald-600",
      desc: isHindi
        ? "तेज धूप और गर्मी में फूलों को झड़ने से रोकता है और फसल को हरा-भरा रखता है।"
        : "Helps crops survive severe heat waves, prevents flower dropping, and protects green canopy.",
      storeLocation: isHindi ? "अधिकृत कृषि केंद्र पर उपलब्ध" : "Authorized Store Pickup",
    },
    {
      id: "flowering-boost",
      badge: isHindi ? "🌿 फूल और फल वृद्धि" : "🌿 MORE FLOWERS & PODS",
      badgeClass: "text-[#1b4332] bg-[#e8f5e9] border-[#cbe5cb]",
      subBadge: isHindi ? "फसल की वर्तमान अवस्था हेतु" : "Recommended for Current Stage",
      title: isHindi ? "पौधा वृद्धि व अधिक फूल पैक (इसाबियन®)" : "Growth & Flowering Booster (Isabion®)",
      discount: isHindi ? "10% तत्काल बचत + मुफ्त माप कप" : "10% Off + Free Measuring Cup",
      discountClass: "text-[#2d6a4f]",
      desc: isHindi
        ? "फूलों की संख्या बढ़ाता है, शाखाओं को मजबूत करता है और दानों का वजन बढ़ाता है।"
        : "Naturally stimulates plant energy, increases flower setting, and improves pod weight.",
      storeLocation: isHindi ? "कृषि सेवा केंद्र पर उपलब्ध" : "Available at Krishi Seva Kendra",
    },
    {
      id: "root-moisture",
      badge: isHindi ? "💧 जड़ मजबूती व नमी सुरक्षा" : "💧 MOISTURE SAVER",
      badgeClass: "text-sky-900 bg-sky-50 border-sky-200/80",
      subBadge: isHindi ? "कम पानी में भी मददगार" : "Dry Spell Protection",
      title: isHindi ? "गहरी जड़ व मिट्टी नमी सुरक्षा पैक" : "Deep Root & Soil Moisture Kit",
      discount: isHindi ? "2 कैन पैक के साथ मुफ्त मिट्टी जांच सलाह" : "Free Soil Guidance with 2-Can Pack",
      discountClass: "text-sky-700",
      desc: isHindi
        ? "फसल की जड़ों को गहराई तक फैलाकर सूखे दिनों में भी नमी सोखने में मदद करता है।"
        : "Encourages deeper root penetration to draw moisture from deeper soil during dry spells.",
      storeLocation: isHindi ? "कृषि सेवा केंद्र पर उपलब्ध" : "Available at Krishi Seva Kendra",
    },
    {
      id: "spray-kit",
      badge: isHindi ? "🛡️ स्प्रे सुरक्षा व उपकरण" : "🛡️ SPRAY SAFETY",
      badgeClass: "text-[#1b4332] bg-[#e8f5e9] border-[#cbe5cb]",
      subBadge: isHindi ? "सुरक्षित छिड़काव किट" : "Farmer Safety Special",
      title: isHindi ? "स्प्रे नोजल व अंशांकन केयर किट" : "Spray Nozzle & Calibration Care Kit",
      discount: isHindi ? "जैविक दवा खरीद पर मुफ्त स्प्रे कैलिब्रेशन किट" : "Free Calibration Kit with Any Biological Purchase",
      discountClass: "text-[#1b4332]",
      desc: isHindi
        ? "दवा को बर्बाद होने से बचाता है और पत्तियों पर एक समान सही छिड़काव सुनिश्चित करता है।"
        : "Ensures uniform spray droplets across foliage without wasting medicine or spray drift.",
      storeLocation: isHindi ? "खेत तक डिलीवरी सुविधा" : "Doorstep Delivery Available",
    },
  ];

  return (
    <div className="bg-white/95 backdrop-blur-md rounded-3xl border border-[#e8ede4] p-5 sm:p-6 shadow-[0_4px_24px_rgba(27,67,50,0.04)] space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-[#e8f5e9] border border-[#cbe5cb] text-[#2d6a4f] flex items-center justify-center shrink-0 shadow-2xs">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-[#11261f] font-display">
              {isHindi
                ? `सक्रिय सिंजेंटा मंडी ऑफर (${activeDistrict})`
                : `Active Syngenta Mandi Offers (${activeDistrict})`}
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              {isHindi
                ? `${activeDistrict} के नजदीकी कृषि सेवा केंद्र व अधिकृत दुकानों पर किसानों के लिए विशेष बचत पैक।`
                : `Special farmer discounts and packages available at your nearest Krishi Seva Kendra in ${activeDistrict}.`}
            </p>
          </div>
        </div>

        <span className="self-start sm:self-auto px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#1b4332] bg-[#e8f5e9] border border-[#cbe5cb] uppercase tracking-wider">
          {isHindi ? "सत्यापित स्थानीय ऑफर" : "VERIFIED LOCAL OFFERS"}
        </span>
      </div>

      {/* 4 Distinct Problem-Solving Offers in a Balanced 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {offers.map((offer) => (
          <div
            key={offer.id}
            className="p-4 sm:p-5 rounded-2xl border border-[#e8ede4] bg-white hover:border-[#2d6a4f]/50 hover:shadow-md transition-all space-y-3.5 flex flex-col justify-between"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono border ${offer.badgeClass}`}>
                  {offer.badge}
                </span>
                <span className="text-[11px] text-slate-400 font-medium">
                  {offer.subBadge}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm sm:text-base text-[#11261f] font-display">
                  {offer.title}
                </h4>
                <p className={`text-sm font-extrabold ${offer.discountClass} mt-0.5`}>
                  {offer.discount}
                </p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {offer.desc}
                </p>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
              <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                <MapPin className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                <span className="text-[11px]">{offer.storeLocation}</span>
              </div>

              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 shrink-0">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                <span>{isHindi ? `${activeDistrict} मंडी में मान्य` : `Valid at ${activeDistrict} Mandi`}</span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
