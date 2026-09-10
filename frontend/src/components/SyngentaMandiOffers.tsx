"use client";

import React from "react";
import { Tag, CheckCircle2, MapPin, Sparkles, Phone, MessageCircle } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { WeatherData } from "@/context/WeatherContext";
import { getSyngentaDealersForDistrict } from "@/lib/syngentaDealers";

interface SyngentaMandiOffersProps {
  district: string;
  crop?: string;
  acres?: number;
  weather?: WeatherData;
}

export function SyngentaMandiOffers({
  district,
  crop = "Soybean",
  acres = 5,
  weather,
}: SyngentaMandiOffersProps) {
  const { language } = useLanguage();
  const isHindi = language === "hi";
  const activeDistrict = district || "Bhopal";
  const numAcres = Math.max(acres || 1, 0.5);
  const currentTemp = weather?.temperature || 31;
  const currentHeatStress = weather?.heatStressPercent || 50;
  const currentSoilMoisture = weather?.soilMoistureEst || 25;
  const currentWind = weather?.windSpeed || 9;
  const isWetWeather = !!weather?.isRaining || (weather?.humidity || 0) > 75;

  // Real dealers lookup for active district
  const localDealers = getSyngentaDealersForDistrict(activeDistrict);
  const primaryDealer = localDealers[0] || {
    name: `${activeDistrict} Krishi Seva Kendra`,
    address: `Near APMC Krishi Upaj Mandi, ${activeDistrict}`,
    whatsapp: "917552747201",
  };

  const cropLower = (crop || "").toLowerCase();

  // 1. DYNAMIC WEATHER / MICROCLIMATE RESCUE DEAL
  let weatherDeal = {
    id: "weather-deal",
    badge: isHindi ? "🔥 ताप तनाव सुरक्षा" : "🔥 HEAT STRESS PROTECTION",
    badgeClass: "text-amber-900 bg-amber-50 border-amber-200/80",
    subBadge: isHindi ? `वर्तमान तापमान ${currentTemp}°C` : `Active Field Temp ${currentTemp}°C`,
    title: isHindi ? "फसल ताप व धूप सुरक्षा (क्वांटिस®)" : "Crop Heat Shield (Quantis®)",
    discount: isHindi
      ? `${numAcres} एकड़ पर ₹${Math.round(150 * numAcres).toLocaleString("en-IN")} सीधी बचत`
      : `Save ₹${Math.round(150 * numAcres).toLocaleString("en-IN")} on ${numAcres} Acres Pack`,
    discountClass: "text-emerald-600",
    desc: isHindi
      ? `तेज गर्मी (${currentTemp}°C) व रात के ताप तनाव में फूलों को झड़ने से रोकता है और फसल को हरा-भरा रखता है।`
      : `Shields ${crop} crops from nocturnal respiration loss, flower drop, and chlorophyll degradation at current ${currentTemp}°C field heat.`,
    storeLocation: primaryDealer.name,
  };

  if (currentSoilMoisture < 20) {
    weatherDeal = {
      id: "weather-deal",
      badge: isHindi ? "💧 जड़ मजबूती व सूखा सुरक्षा" : "💧 ROOT HYDRATION RESCUE",
      badgeClass: "text-sky-900 bg-sky-50 border-sky-200/80",
      subBadge: isHindi ? `मिट्टी नमी मात्र ${currentSoilMoisture}%` : `Low Soil Moisture (${currentSoilMoisture}%)`,
      title: isHindi ? "गहरी जड़ व नमी सुरक्षा पैक (इसाबियन®)" : "Deep Root & Soil Moisture Kit (Isabion®)",
      discount: isHindi
        ? `${numAcres} एकड़ पर ₹${Math.round(180 * numAcres).toLocaleString("en-IN")} बचत + मुफ्त नमी जांच`
        : `Save ₹${Math.round(180 * numAcres).toLocaleString("en-IN")} on ${numAcres} Acres + Free Soil Test`,
      discountClass: "text-sky-700",
      desc: isHindi
        ? `फसल की जड़ों को गहराई तक फैलाकर सूखे दिनों में भी नमी सोखने में मदद करता है।`
        : `Encourages deeper root penetration to draw moisture from deeper soil layers during dry spells in ${activeDistrict}.`,
      storeLocation: primaryDealer.name,
    };
  } else if (isWetWeather) {
    weatherDeal = {
      id: "weather-deal",
      badge: isHindi ? "🌧️ वर्षा फफूंद व झुलसा सुरक्षा" : "🌧️ RAIN BLIGHT & FUNGUS SHIELD",
      badgeClass: "text-blue-900 bg-blue-50 border-blue-200/80",
      subBadge: isHindi ? "आर्द्र मौसम विशेष" : "High Humidity Advisory",
      title: isHindi ? "रेनफास्ट सुरक्षा कवकनाशी (एमिस्टार टॉप®)" : "Rainfast Systemic Fungicide (Amistar Top®)",
      discount: isHindi
        ? `2 घंटे में रेनफास्ट + 12% तत्काल मंडी छूट`
        : `2h Rainfast + 12% Instant Mandi Rebate`,
      discountClass: "text-blue-700",
      desc: isHindi
        ? `बारिश व नमी में पत्ती धब्बा, झुलसा और फफूंद जनित रोगों से संपूर्ण सुरक्षा प्रदान करता है।`
        : `Fast systemic rainfast protection against sheath blight, leaf spots, and fungal spores for ${crop}.`,
      storeLocation: primaryDealer.name,
    };
  }

  // 2. DYNAMIC CROP-SPECIFIC PROTECTION & YIELD DEAL
  let cropDeal = {
    id: "crop-deal",
    badge: isHindi ? "🌿 फूल और फल वृद्धि" : "🌿 MORE FLOWERS & PODS",
    badgeClass: "text-[#1b4332] bg-[#e8f5e9] border-[#cbe5cb]",
    subBadge: isHindi ? `${crop} फसल अवस्था अनुकूल` : `Calibrated for ${crop}`,
    title: isHindi ? "पौधा वृद्धि व अधिक फल पैक (इसाबियन®)" : "Growth & Flowering Booster (Isabion®)",
    discount: isHindi
      ? `10% तत्काल छूट + ₹${Math.round(120 * numAcres).toLocaleString("en-IN")} बचत`
      : `10% Off + Save ₹${Math.round(120 * numAcres).toLocaleString("en-IN")} on ${numAcres} Acres`,
    discountClass: "text-[#2d6a4f]",
    desc: isHindi
      ? `${crop} में फूलों की संख्या बढ़ाता है, शाखाओं को मजबूत करता है और दानों का वजन बढ़ाता है।`
      : `Naturally stimulates plant amino acids, increases flower retention, and improves test weight in ${crop}.`,
    storeLocation: primaryDealer.address,
  };

  if (cropLower.includes("cane") || cropLower.includes("ganna")) {
    cropDeal = {
      id: "crop-deal",
      badge: isHindi ? "🎋 गन्ना कल्ले व तना छेदक रक्षा" : "🎋 SUGARCANE YIELD PROTECT",
      badgeClass: "text-emerald-900 bg-emerald-50 border-emerald-200/80",
      subBadge: isHindi ? "पोरियों की लंबाई व मिठास" : "Internode & Borer Defense",
      title: isHindi ? "विर्टाको® GR + इसाबियन® गन्ना किट" : "Virtako® GR + Isabion® Sugarcane Kit",
      discount: isHindi
        ? `${numAcres} एकड़ पर ₹${Math.round(240 * numAcres).toLocaleString("en-IN")} बचत`
        : `Save ₹${Math.round(240 * numAcres).toLocaleString("en-IN")} on ${numAcres} Acres Package`,
      discountClass: "text-emerald-700",
      desc: isHindi
        ? `प्रारंभिक तना छेदक से पूर्ण सुरक्षा और पोरियों की मोटाई व लंबाई में 22% तक वृद्धि।`
        : `Controls early shoot borer and enhances internode elongation and sugar recovery for sugarcane plots.`,
      storeLocation: primaryDealer.name,
    };
  } else if (cropLower.includes("cotton") || cropLower.includes("kapas")) {
    cropDeal = {
      id: "crop-deal",
      badge: isHindi ? "🌸 कपास डोडे व रसचूसक सुरक्षा" : "🌸 COTTON BOLL & PEST SHIELD",
      badgeClass: "text-rose-900 bg-rose-50 border-rose-200/80",
      subBadge: isHindi ? "गुलाबी सुंडी व सफेद मक्खी" : "Pink Bollworm & Whitefly Care",
      title: isHindi ? "एम्प्लिगो® + अलिका® कपास सुरक्षा पैक" : "Ampligo® + Alika® Cotton Care Pack",
      discount: isHindi
        ? `12% विशेष छूट + ₹${Math.round(210 * numAcres).toLocaleString("en-IN")} बचत`
        : `12% Off + Save ₹${Math.round(210 * numAcres).toLocaleString("en-IN")} on ${numAcres} Acres`,
      discountClass: "text-rose-700",
      desc: isHindi
        ? `सफेद मक्खी, थ्रिप्स व इल्लियों से तुरंत सुरक्षा जिससे डोडे झड़ने से बचते हैं।`
        : `Dual-action systemic control of sucking pests and bollworms preventing square shedding in cotton.`,
      storeLocation: primaryDealer.name,
    };
  } else if (cropLower.includes("rice") || cropLower.includes("paddy") || cropLower.includes("dhan")) {
    cropDeal = {
      id: "crop-deal",
      badge: isHindi ? "🌾 धान बाली व तना छेदक रक्षक" : "🌾 PADDY PANICLE BOOSTER",
      badgeClass: "text-amber-900 bg-amber-50 border-amber-200/80",
      subBadge: isHindi ? "सफेद बाली व पत्ता लपेट रोकथाम" : "Stem Borer & Leaf Folder Kit",
      title: isHindi ? "विर्टाको® + इसाबियन® धान कवच" : "Virtako® + Isabion® Paddy Shield",
      discount: isHindi
        ? `${numAcres} एकड़ पर ₹${Math.round(190 * numAcres).toLocaleString("en-IN")} बचत`
        : `Save ₹${Math.round(190 * numAcres).toLocaleString("en-IN")} on ${numAcres} Acres`,
      discountClass: "text-amber-800",
      desc: isHindi
        ? `तना छेदक की सफेद बालियों को रोकता है और बालियों में दानों का पूरा भराव सुनिश्चित करता है।`
        : `Prevents dead hearts and white ears, promoting robust tillering and complete grain filling in paddy.`,
      storeLocation: primaryDealer.name,
    };
  } else if (cropLower.includes("wheat") || cropLower.includes("gehu") || cropLower.includes("mustard") || cropLower.includes("sarson")) {
    cropDeal = {
      id: "crop-deal",
      badge: isHindi ? "🌾 गेहूं-सरसों दाना भराव पैक" : "🌾 WHEAT & MUSTARD YIELD KIT",
      badgeClass: "text-amber-900 bg-amber-50 border-amber-200/80",
      subBadge: isHindi ? "पीला रतुआ व माहू सुरक्षा" : "Rust & Aphid Guard",
      title: isHindi ? "स्कोर® + इसाबियन® शील्ड पैक" : "Score® 25 EC + Isabion® Winter Shield",
      discount: isHindi
        ? `10% तत्काल बचत + मुफ्त माप कप`
        : `10% Instant Rebate + Free Measuring Cup`,
      discountClass: "text-amber-800",
      desc: isHindi
        ? `रतुआ और तेला/माहू से सुरक्षा देकर दानों में चमक और वजन बढ़ाता है।`
        : `Prevents yellow rust and aphid outbreaks while promoting heavy grain filling in wheat and mustard.`,
      storeLocation: primaryDealer.name,
    };
  }

  // 3. MANDI DEALER SOIL & DIAGNOSTIC VOUCHER
  const dealerVoucherDeal = {
    id: "dealer-voucher",
    badge: isHindi ? "🏬 अधिकृत स्थानीय मंडी केंद्र" : "🏬 AUTHORIZED LOCAL DEALER",
    badgeClass: "text-indigo-900 bg-indigo-50 border-indigo-200/80",
    subBadge: isHindi ? `${activeDistrict} मंडी विशेष` : "Verified Mandi Depot",
    title: isHindi
      ? `कृषि विकास निःशुल्क मिट्टी जांच कूपन`
      : `Krishi Seva Kendra Soil Health Voucher`,
    discount: isHindi
      ? `₹500 मूल्य की निःशुल्क मिट्टी pH व कार्बन जांच`
      : `Free ₹500 Soil pH & Organic Carbon Diagnostic`,
    discountClass: "text-indigo-700",
    desc: isHindi
      ? `${primaryDealer.name} पर उपलब्ध। सिंजेंटा प्रमाणित कृषि वैज्ञानिक से सीधा मार्गदर्शन।`
      : `Redeemable at ${primaryDealer.name} near ${activeDistrict} APMC Krishi Upaj Mandi with verified agronomist support.`,
    storeLocation: primaryDealer.address,
  };

  // 4. PRECISION APPLICATION & DRIFT SAFETY
  const spraySafetyDeal = {
    id: "spray-safety",
    badge: isHindi ? "🛡️ स्प्रे सुरक्षा व अंशांकन" : "🛡️ DRIFT SAFETY KIT",
    badgeClass: "text-[#1b4332] bg-[#e8f5e9] border-[#cbe5cb]",
    subBadge: isHindi ? `हवा गति ${currentWind} km/h अनुकूल` : `Calibrated for ${currentWind} km/h wind`,
    title: isHindi ? "स्प्रे नोजल व ड्रिफ्ट अंशांकन किट" : "Drift-Guard Nozzle & Calibration Kit",
    discount: isHindi
      ? `जैविक उत्पाद खरीद पर मुफ्त कैलिब्रेशन किट`
      : `Free Calibration Kit with Any Biological Purchase`,
    discountClass: "text-[#1b4332]",
    desc: isHindi
      ? `दवा को उड़ने (ड्रिफ्ट) से बचाता है और पत्तियों पर एक समान सूक्ष्म बूंदों का छिड़काव सुनिश्चित करता है।`
      : `Ensures uniform foliage deposition without droplet drift in current ${currentWind} km/h field breeze.`,
    storeLocation: isHindi ? "खेत तक डिलीवरी व स्टोर पिकअप" : "Doorstep Delivery or Mandi Pickup",
  };

  const dynamicOffers = [weatherDeal, cropDeal, dealerVoucherDeal, spraySafetyDeal];

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
                ? `${activeDistrict} में ${crop} फसल (${numAcres} एकड़) व वर्तमान मौसम के लिए विशेष बचत पैकेज।`
                : `Special packages calibrated for ${crop} (${numAcres} acres) and current weather in ${activeDistrict}.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold text-[#1b4332] bg-[#e8f5e9] border border-[#cbe5cb] uppercase tracking-wider">
            {isHindi ? "सत्यापित स्थानीय ऑफर" : "VERIFIED LOCAL OFFERS"}
          </span>
        </div>
      </div>

      {/* 4 Dynamic Problem-Solving Offers in a Balanced 2x2 Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
        {dynamicOffers.map((offer) => (
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
              <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate max-w-[210px] sm:max-w-none">
                <MapPin className="h-3.5 w-3.5 text-[#2d6a4f] shrink-0" />
                <span className="text-[11px] truncate">{offer.storeLocation}</span>
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
