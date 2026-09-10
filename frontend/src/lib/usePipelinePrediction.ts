"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useFarm } from "@/context/FarmContext";
import { useWeather } from "@/context/WeatherContext";
import { useLanguage } from "@/context/LanguageContext";
import { getStoredProfile } from "@/lib/userStore";
import { runAASRAPipeline, UnifiedPipelineResponse } from "@/lib/mlPipelineApi";
import { findCropMandiRate } from "@/lib/mandiEngine";

export interface DailyStressPrediction {
  dayIndex: number;
  dateStr: string;
  dayName: string;
  tempMax: number;
  tempMin: number;
  vpdKpa: number;
  rainProbPct: number;
  stressType: string;
  stressTypeHi: string;
  riskPct: number;
  severity: "critical" | "warning" | "moderate" | "safe";
  whatWillBeLostEn: string;
  whatWillBeLostHi: string;
  lossQtlAcre: number;
  lossInrAcre: number;
  category: "heat" | "frost" | "drought" | "rain" | "compound" | "optimal";
  isCompound?: boolean;
}

export interface SpellAlert {
  type: "dry" | "heat" | "frost" | "rain";
  titleEn: string;
  titleHi: string;
  durationDays: number;
  severity: "critical" | "warning";
  descriptionEn: string;
  descriptionHi: string;
  actionEn: string;
  actionHi: string;
}

export interface SoilNutrientFacts {
  soilType: string;
  soilTypeHi: string;
  texture: string;
  textureHi: string;
  nitrogenStatus: string;
  nitrogenStatusHi: string;
  nitrogenStress: boolean;
  phosphorusStatus: string;
  phosphorusStatusHi: string;
  phosphorusStress: boolean;
  organicCarbon: string;
}

const CACHE_PREFIX = "aasra_model_pipeline_cache_";

export function usePipelinePrediction() {
  const { activeFarm, farms, selectFarm } = useFarm();
  const { weather } = useWeather();
  const { language } = useLanguage();

  const [data, setData] = useState<UnifiedPipelineResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  // Track the last farm+crop key to detect real changes and force-fresh fetches
  const prevFarmCropKeyRef = useRef<string>("");

  // Keep profile in reactive state so user login immediately recalculates
  const [profile, setProfile] = useState<any>(() => typeof window !== "undefined" ? getStoredProfile() : null);

  useEffect(() => {
    const handleProfileUpdate = () => {
      const p = getStoredProfile();
      setProfile(p);
    };
    window.addEventListener("aasra-profile-updated", handleProfileUpdate);
    window.addEventListener("storage", handleProfileUpdate);
    return () => {
      window.removeEventListener("aasra-profile-updated", handleProfileUpdate);
      window.removeEventListener("storage", handleProfileUpdate);
    };
  }, []);

  // Compute active farm grounding parameters (prioritizing activeFarm for multi-crop switching)
  const farmId = activeFarm?.id || "default_farm";
  const farmName = activeFarm?.name || profile?.fieldName || "Primary Field";
  const crop = (activeFarm?.primaryCrop || profile?.primaryCrop || "Soybean").toLowerCase();
  const district = activeFarm?.district || profile?.district || weather?.district || "Bhopal";
  const state = activeFarm?.state || profile?.state || weather?.state || "Madhya Pradesh";
  const acres = Number(activeFarm?.areaAcres || profile?.fieldAreaAcres || 5.0);
  const growthStage = activeFarm?.growthStage || profile?.growthStage || "Flowering / Bloom";
  const farmerName = profile?.fullName || "Farmer Friend";

  // Stable key representing the current farm+crop+language combination
  const farmCropKey = `${farmId}::${crop}::${district}::${acres}::${language}`;

  const fetchPrediction = useCallback(async (forceFresh = false) => {
    setLoading(true);
    setError(null);

    const cacheKey = `${CACHE_PREFIX}${farmId}_${crop}_${district}_${acres}_${language}`;

    // Determine if this is a new farm/crop — if so, always skip cache
    const isNewFarmOrCrop = prevFarmCropKeyRef.current !== "" && prevFarmCropKeyRef.current !== farmCropKey;
    const shouldSkipCache = forceFresh || isNewFarmOrCrop;

    // Update the ref BEFORE the fetch so concurrent calls don't double-fetch
    prevFarmCropKeyRef.current = farmCropKey;

    if (!shouldSkipCache && typeof window !== "undefined") {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          // Check if cached result has the legacy 19.6x ROBI or mismatched crop mandi rates
          const isStaleOldRobi = parsed?.payload?.model6_causal_robi?.robi_multiplier === "19.6x";
          const isStaleSugarcane = (crop.includes("sugar") || crop.includes("ganna")) && (parsed?.payload?.model6_causal_robi?.mandi_price_inr_q > 800 || parsed?.payload?.model6_causal_robi?.causal_gain_tau_q_acre < 10);
          const isStaleCotton = (crop.includes("cotton") || crop.includes("kapas")) && (parsed?.payload?.model6_causal_robi?.mandi_price_inr_q < 5000 || parsed?.payload?.model6_causal_robi?.causal_gain_tau_q_acre > 2.0);
          
          if (!isStaleOldRobi && !isStaleSugarcane && !isStaleCotton && Date.now() - parsed.timestamp < 30 * 60 * 1000 && parsed.payload) {
            setData(parsed.payload);
            setLoading(false);
            return;
          } else {
            localStorage.removeItem(cacheKey);
          }
        }
      } catch {}
    }

    try {
      const mandiItem = findCropMandiRate(crop, district, state);
      const dynamicMandiPrice = mandiItem.modalPrice || 4850;

      const payload = {
        farmer_name: farmerName,
        farmer_id: profile?.id || farmId,
        district: district,
        state: state,
        crop: crop,
        growth_stage: growthStage,
        area_acres: acres,
        mandi_price_inr_q: dynamicMandiPrice,
        language: language,
        temp_max_c: weather?.temperature || 35.0,
        temp_min_c: weather?.nightTemperature || 25.2,
        rh_avg_pct: weather?.humidity || 52,
        wind_speed_kmh: weather?.windSpeed || 8.5,
        rain_prob_pct: weather?.precipitationProbability || 10,
        soil_moisture_pct: weather?.soilMoistureEst || 28,
        treatment_applied: 1,
      };

      const result = await runAASRAPipeline(payload);

      if (result) {
        setData(result);
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(
              cacheKey,
              JSON.stringify({ timestamp: Date.now(), payload: result })
            );
          } catch {}
        }
      } else {
        throw new Error("Unable to obtain model prediction from inference server.");
      }
    } catch (err: any) {
      console.error("Pipeline prediction error:", err);
      setError(err?.message || "Inference pipeline error");
    } finally {
      setLoading(false);
    }
  }, [farmId, crop, district, acres, growthStage, farmerName, language, weather, farmCropKey]);

  // Initial load and whenever active farm/crop/district changes
  useEffect(() => {
    fetchPrediction(false);
  }, [fetchPrediction]);

  // Also refetch when the farm switcher fires the global update event
  useEffect(() => {
    const handleFieldsUpdated = () => {
      // Small delay to let FarmContext state settle first
      setTimeout(() => fetchPrediction(true), 100);
    };
    window.addEventListener("aasra_fields_updated", handleFieldsUpdated);
    window.addEventListener("aasra-profile-updated", handleFieldsUpdated);
    return () => {
      window.removeEventListener("aasra_fields_updated", handleFieldsUpdated);
      window.removeEventListener("aasra-profile-updated", handleFieldsUpdated);
    };
  }, [fetchPrediction]);

  const [forecastDays, setForecastDays] = useState<number>(14);

  // Dynamic Soil & Nutrient Facts resolved from District/State and Growth Stage
  const soilFacts: SoilNutrientFacts = useMemo(() => {
    const s = (state || "").toLowerCase();
    const d = (district || "").toLowerCase();
    const g = (growthStage || "").toLowerCase();

    let soilType = "Deep Black Cotton Soil (Vertisol)";
    let soilTypeHi = "काली कपास मिट्टी (रेगुर / वर्टिसोल)";
    let texture = "Clayey to Clay Loam (High Water Holding)";
    let textureHi = "चिकनी दोमट (उच्च जल प्रतिधारण)";
    let nitrogenStatus = "Medium (N-Stress Risk in Vegetative Stage)";
    let nitrogenStatusHi = "मध्यम (वानस्पतिक अवस्था में नाइट्रोजन कमी का जोखिम)";
    let nitrogenStress = g.includes("vegetative") || g.includes("tillering");
    let phosphorusStatus = "Moderate to Low (Alkaline Fixation Risk)";
    let phosphorusStatusHi = "मध्यम से कम (क्षारीय मिट्टी में फास्फोरस स्थिरीकरण)";
    let phosphorusStress = g.includes("flower") || g.includes("bloom") || g.includes("pod") || g.includes("heading");
    let organicCarbon = "0.54% (Moderate Organic Reserves)";

    if (s.includes("punjab") || s.includes("haryana") || s.includes("uttar") || s.includes("bihar") || s.includes("bengal")) {
      soilType = "Alluvial Indo-Gangetic Soil (Inceptisol)";
      soilTypeHi = "जलोढ़ उपजाऊ दोमट मिट्टी";
      texture = "Sandy Loam to Silty Clay";
      textureHi = "बलुई दोमट से गाद युक्त";
      nitrogenStatus = "Deficient to Medium (Leaching Risk)";
      nitrogenStatusHi = "न्यूनतम से मध्यम (वर्षा में निक्षालन जोखिम)";
      phosphorusStatus = "Adequate to High (Phosphatic Responsive)";
      phosphorusStatusHi = "पर्याप्त से उच्च (फास्फेट अवशोषण अनुकूल)";
      phosphorusStress = false;
      organicCarbon = "0.62% (Good)";
    } else if (s.includes("rajasthan") || d.includes("ajmer") || d.includes("jaipur") || d.includes("jodhpur") || d.includes("bikaner")) {
      soilType = "Arid Desert Sandy Soil (Aridisol)";
      soilTypeHi = "रेतीली / मरुस्थलीय मिट्टी (एरिडिसोल)";
      texture = "Coarse Sand to Sandy Loam (Low Water Retention)";
      textureHi = "रेतीली भुरभुरी (कम जल प्रतिधारण)";
      nitrogenStatus = "Deficient (Nitrogen Hunger Common)";
      nitrogenStatusHi = "अत्यधिक कम (नाइट्रोजन की कमी आम)";
      nitrogenStress = true;
      phosphorusStatus = "Low (Restricted Root Transport)";
      phosphorusStatusHi = "कम (जड़ों में पोषक परिवहन अवरोध)";
      phosphorusStress = true;
      organicCarbon = "0.28% (Low)";
    } else if (s.includes("karnataka") || s.includes("tamil") || s.includes("andhra") || s.includes("telangana") || s.includes("odisha")) {
      soilType = "Red Sandy Loam (Alfisol)";
      soilTypeHi = "लाल बलुई दोमट मिट्टी";
      texture = "Loamy Sand with Iron Oxides";
      textureHi = "लौह युक्त बलुई दोमट";
      nitrogenStatus = "Low to Medium";
      nitrogenStatusHi = "कम से मध्यम";
      phosphorusStatus = "Deficient (Acidic Soil Fixation)";
      phosphorusStatusHi = "अल्प (अम्लीय मिट्टी में P-अवरोध)";
      phosphorusStress = true;
      organicCarbon = "0.45% (Moderate)";
    }

    return {
      soilType,
      soilTypeHi,
      texture,
      textureHi,
      nitrogenStatus,
      nitrogenStatusHi,
      nitrogenStress,
      phosphorusStatus,
      phosphorusStatusHi,
      phosphorusStress,
      organicCarbon,
    };
  }, [state, district, growthStage]);

  // Dynamic 14 to 21-Day Multi-Stress Horizon calculated on user location & crop
  const fourteenDayStress: DailyStressPrediction[] = React.useMemo(() => {
    const dailyList: DailyStressPrediction[] = [];
    const baseTemp = weather?.temperature || 35.0;
    const baseNight = weather?.nightTemperature || 25.4;
    const mandiRate = data?.model6_causal_robi?.mandi_price_inr_q || 2410;

    const today = new Date();
    const daysToGenerate = Math.max(14, Math.min(21, forecastDays));

    const primaryStress = data?.model1_risk?.stress_type || "";
    const primaryConfidence = data?.model1_risk?.confidence || 0.89;
    const primaryRiskPct = Math.round(primaryConfidence * 100);
    const primaryLossQ = Number((data?.model6_causal_robi?.causal_gain_tau_q_acre || 0.85).toFixed(2));
    const soilMoistureVal = data?.telemetry_summary?.soil_moisture_pct ?? weather?.soilMoistureEst ?? 18;
    const isDroughtScenario = primaryStress.toLowerCase().includes("drought") || soilMoistureVal < 20;
    const isCane = (crop || "").toLowerCase().includes("sugarcane") || (crop || "").toLowerCase().includes("ganna");

    // Generate rolling horizon using weather telemetry progression
    for (let i = 0; i < daysToGenerate; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const dayName = d.toLocaleDateString("en-IN", { weekday: "short" });
      const dateStr = d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

      // Meteorological progression around base telemetry
      const tempVariation = Math.sin((i / 14) * Math.PI * 2) * 2.8;
      const tMax = Math.round((baseTemp + tempVariation) * 10) / 10;
      const tMin = Math.round((baseNight + tempVariation * 0.7) * 10) / 10;
      const vpd = Math.round((0.6108 * Math.exp((17.27 * tMax) / (tMax + 237.3)) * 0.48) * 10) / 10;
      const rainProb = Math.max(5, Math.min(85, Math.round(15 + Math.cos(i * 0.8) * 22)));

      let stressType = "Optimal Weather Window";
      let stressTypeHi = "अनुकूल मौसम अवधि (फसल सुरक्षित)";
      let riskPct = 12;
      let severity: "critical" | "warning" | "moderate" | "safe" = "safe";
      let category: DailyStressPrediction["category"] = "optimal";
      let isCompound = false;
      let whatWillBeLostEn = "Weather parameters are within safe biophysical thresholds. Canopy cellular respiration is active with zero yield loss expected.";
      let whatWillBeLostHi = "मौसम पूरी तरह अनुकूल और सुरक्षित सीमाओं में है। फसल की वृद्धि सामान्य रहेगी और शून्य उपज हानि का अनुमान है।";
      let lossQtlAcre = 0.0;

      // ── Abiotic Multi-Stress Priority Evaluation ──────────────────
      // 1. Frost Stress (Sub-5°C nocturnal minimum)
      if (tMin <= 5.0) {
        category = "frost";
        if (tMin <= 2.0) {
          stressType = "Severe Frost / Freezing Injury";
          stressTypeHi = "गंभीर पाला व कोशिका जमने का खतरा";
          riskPct = 95;
          severity = "critical";
          lossQtlAcre = 1.45;
          whatWillBeLostEn = `Freezing nocturnal minimums below 2°C rupture plant cell walls, causing acute tissue blackened necrosis (~${lossQtlAcre} Q/acre loss).`;
          whatWillBeLostHi = `2°C से नीचे पाला पड़ने पर पौधों की कोशिका झिल्ली फटने व पत्तियां काली पड़ने से ~${lossQtlAcre} क्विंटल/एकड़ नुकसान का जोखिम है।`;
        } else {
          stressType = "Chilling Shock / Frost Risk";
          stressTypeHi = "शीत लहर व पाला जोखिम";
          riskPct = 78;
          severity = "warning";
          lossQtlAcre = 0.85;
          whatWillBeLostEn = `Nocturnal cold shock suppresses enzyme activity and sugar translocation, retarding grain fill (~${lossQtlAcre} Q/acre loss).`;
          whatWillBeLostHi = `अत्यधिक ठंड से पौधों में एंजाइम सक्रियता मंद होने और दाना भराव रुकने से ~${lossQtlAcre} क्विंटल/एकड़ नुकसान का जोखिम है।`;
        }
      }
      // 2. Compound Heat & Drought Stress
      else if ((tMax >= 35.0 || tMin >= 25.0) && (vpd >= 2.2 || rainProb <= 12 || isDroughtScenario)) {
        category = "compound";
        isCompound = true;
        stressType = "Compound Heat-Drought Stress";
        stressTypeHi = "संयुक्त ताप व सूखा तनाव (दोहरी मार)";
        riskPct = Math.min(98, Math.round(88 + (tMax - 34) * 4));
        severity = "critical";
        lossQtlAcre = +(1.35 + (tMax - 34) * 0.15).toFixed(2);
        whatWillBeLostEn = `Simultaneous atmospheric heat scorch and soil moisture depletion induce complete stomatal lockdown, flower drop, and early senescence (~${lossQtlAcre} Q/acre loss).`;
        whatWillBeLostHi = `भीषण गर्मी और सूखे के दोहरे प्रभाव से पौधों के रंध्र पूरी तरह बंद हो जाते हैं, जिससे फूल झड़ना व समय पूर्व पकना शुरू हो जाता है (~${lossQtlAcre} क्विंटल/एकड़)।`;
      }
      // 3. Drought Priority Scenario
      else if (isDroughtScenario) {
        category = "drought";
        stressType = "Drought Stress";
        stressTypeHi = "सूखा तनाव";
        riskPct = Math.max(65, Math.min(95, primaryRiskPct - i * 2));
        severity = riskPct >= 75 ? "critical" : "warning";
        lossQtlAcre = Math.max(0.65, Number((primaryLossQ * (riskPct / 100)).toFixed(2)));
        if (isCane) {
          whatWillBeLostEn = `Soil moisture is severely depleted (<20%). High root zone water deficit arrests cane internode elongation and stalks dry out (~${lossQtlAcre} Q/acre risk).`;
          whatWillBeLostHi = `जड़ क्षेत्र में मिट्टी की नमी की भारी कमी है (<20%)। सूखे के कारण गन्ने की पोरियों की वृद्धि रुकने और तना सूखने से लगभग ${lossQtlAcre} क्विंटल/एकड़ के नुकसान की आशंका है।`;
        } else {
          whatWillBeLostEn = `Soil moisture is depleted (<20% wilting buffer). Severe transpirational water deficit induces wilting and ~${lossQtlAcre} Q/acre loss if untreated.`;
          whatWillBeLostHi = `मिट्टी में नमी की अत्यधिक कमी है (<20% सीमा)। पानी के भारी अभाव से पौधे मुरझाने और लगभग ${lossQtlAcre} क्विंटल/एकड़ के नुकसान का जोखिम है।`;
        }
      }
      // 4. Nocturnal Heat Stress
      else if (tMin >= 25.0 && tMax >= 34.0) {
        category = "heat";
        stressType = "Nocturnal Heat Shock";
        stressTypeHi = "रात का अत्यधिक तापमान तनाव";
        riskPct = Math.min(96, Math.round(84 + (tMin - 25) * 6));
        severity = "critical";
        lossQtlAcre = +(1.2 + (tMin - 24.5) * 0.3).toFixed(2);
        whatWillBeLostEn = `Night temperatures exceed 25°C during flowering. Pollen sterility and dark respiration burn causes estimated ~${lossQtlAcre} Q/acre loss if untreated.`;
        whatWillBeLostHi = `फूल आने के समय रात का तापमान 25°C से अधिक होने पर पराग बांझपन व श्वसन जलने से लगभग ${lossQtlAcre} क्विंटल/एकड़ के नुकसान का जोखिम है।`;
      }
      // 5. Daytime Heat Scorch
      else if (tMax >= 36.0) {
        category = "heat";
        stressType = "Peak Day Heat Scorch";
        stressTypeHi = "दोपहर की भीषण गर्मी व लू";
        riskPct = Math.min(90, Math.round(78 + (tMax - 35) * 5));
        severity = "warning";
        lossQtlAcre = 0.95;
        whatWillBeLostEn = `Canopy temperature surpasses 36°C, inducing stomatal closure and leaf scorching (~0.95 Q/acre estimated risk).`;
        whatWillBeLostHi = `दोपहर का तापमान 36°C पार करने से पौधों के रंध्र बंद होने और झुलसने से लगभग 0.95 क्विंटल प्रति एकड़ नुकसान का जोखिम है।`;
      }
      // 6. Drought & Vapor Pressure Deficit
      else if (vpd >= 2.2) {
        category = "drought";
        stressType = "Drought & Vapor Deficit Stress";
        stressTypeHi = "हवा में सूखापन व वाष्प दबाव कमी (VPD)";
        riskPct = 68;
        severity = "moderate";
        lossQtlAcre = 0.65;
        whatWillBeLostEn = `High VPD creates extreme transpirational demand, causing foliage moisture stress (~0.65 Q/acre estimated risk).`;
        whatWillBeLostHi = `हवा में अत्यधिक सूखापन पौधों से नमी खींचकर तनाव पैदा करता है (~0.65 क्विंटल/एकड़)।`;
      }
      // 7. Rain / Waterlogging Threat
      else if (rainProb >= 70) {
        category = "rain";
        stressType = "Excess Rain & Waterlogging Threat";
        stressTypeHi = "अत्यधिक वर्षा व जलजमाव का खतरा";
        riskPct = 72;
        severity = "warning";
        lossQtlAcre = 0.8;
        whatWillBeLostEn = `Prolonged rain and standing water create root anoxia and trigger foliar fungal spore germination (~0.8 Q/acre risk).`;
        whatWillBeLostHi = `लगातार वर्षा से जड़ों में ऑक्सीजन की कमी और फफूंद संक्रमण का खतरा उत्पन्न होता है (~0.8 क्विंटल/एकड़)।`;
      }

      const lossInrAcre = Math.round(lossQtlAcre * mandiRate);

      dailyList.push({
        dayIndex: i + 1,
        dateStr,
        dayName,
        tempMax: tMax,
        tempMin: tMin,
        vpdKpa: vpd,
        rainProbPct: rainProb,
        stressType,
        stressTypeHi,
        riskPct,
        severity,
        category,
        isCompound,
        whatWillBeLostEn,
        whatWillBeLostHi,
        lossQtlAcre,
        lossInrAcre,
      });
    }

    return dailyList;
  }, [weather, data, crop, forecastDays]);

  // Atmospheric Spell Detection across the active forecast window
  const activeSpell: SpellAlert | null = React.useMemo(() => {
    if (!fourteenDayStress || fourteenDayStress.length === 0) return null;

    // 1. Heat Wave Spell: >= 3 consecutive days with tMax >= 35.5 or tMin >= 25
    let heatStreak = 0;
    for (const d of fourteenDayStress) {
      if (d.tempMax >= 35.5 || d.tempMin >= 25.0) {
        heatStreak++;
        if (heatStreak >= 3) {
          return {
            type: "heat",
            titleEn: "Active Heatwave Spell Detected",
            titleHi: "सक्रिय ताप लहर (Heat Wave Spell) चेतावनी",
            durationDays: 4,
            severity: "critical",
            descriptionEn: "Extended heatwave spell predicted with daytime heat scorch and high nocturnal minimums. High risk of dark respiration carbon loss and blossom abortion.",
            descriptionHi: "आगामी दिनों में लगातार तेज धूप व गर्म रातों की ताप लहर का अनुमान है। इससे पौधों में संचित ऊर्जा की हानि व फूलों के झड़ने का गंभीर खतरा है।",
            actionEn: "Apply Syngenta Quantis® in late evening to activate heat shock proteins (HSP) and maintain flower retention.",
            actionHi: "शाम को सिंजेंटा क्वांटिस® (250 मिली/एकड़) का छिड़काव कर ताप-रक्षा सक्रिय करें।"
          };
        }
      } else {
        heatStreak = 0;
      }
    }

    // 2. Dry Spell: >= 4 consecutive days with rainProb <= 20% and vpd >= 1.8
    let dryStreak = 0;
    for (const d of fourteenDayStress) {
      if (d.rainProbPct <= 20 && d.vpdKpa >= 1.8) {
        dryStreak++;
        if (dryStreak >= 4) {
          return {
            type: "dry",
            titleEn: "Prolonged Dry Spell Detected",
            titleHi: "दीर्घकालिक शुष्क अवधि (Dry Spell) चेतावनी",
            durationDays: 5,
            severity: "warning",
            descriptionEn: "Multi-day rainless dry spell active across your district. High atmospheric vapor deficit is rapidly depleting surface soil moisture.",
            descriptionHi: "आपके क्षेत्र में लगातार वर्षा न होने से शुष्क मौसम बना हुआ है। मिट्टी की ऊपरी परत में नमी तेजी से घट रही है।",
            actionEn: "Schedule light evening irrigation and apply biostimulant shielding to preserve cell turgor.",
            actionHi: "शाम को हल्की सिंचाई करें व पौधों की नमी प्रतिधारण क्षमता बनाए रखने हेतु बायोस्टिमुलेंट का प्रयोग करें।"
          };
        }
      } else {
        dryStreak = 0;
      }
    }

    // 3. Frost Spell: >= 2 consecutive days with tMin <= 5°C
    let frostStreak = 0;
    for (const d of fourteenDayStress) {
      if (d.tempMin <= 5.0) {
        frostStreak++;
        if (frostStreak >= 2) {
          return {
            type: "frost",
            titleEn: "Frost & Cold Wave Spell Alert",
            titleHi: "पाला व शीत लहर (Frost Spell) चेतावनी",
            durationDays: 3,
            severity: "critical",
            descriptionEn: "Sub-5°C nocturnal minimums predicted. Severe chilling injury and cell membrane freezing shock likely on tender shoots.",
            descriptionHi: "रात का तापमान 5°C से नीचे जाने से पाले व पादप कोशिकाओं के जमने का खतरा है। कोमल शाखाओं व फूलों को बचाएं।",
            actionEn: "Provide light furrow irrigation or smoke smudging before dawn to elevate canopy microclimate temperature by 1–2°C.",
            actionHi: "सूर्योदय से पूर्व खेत में हल्की सिंचाई देकर पादप सूक्ष्म-जलवायु का तापमान बढ़ाएं।"
          };
        }
      } else {
        frostStreak = 0;
      }
    }

    // 4. Rain / Wet Spell: >= 3 consecutive days with rainProb >= 65%
    let rainStreak = 0;
    for (const d of fourteenDayStress) {
      if (d.rainProbPct >= 65) {
        rainStreak++;
        if (rainStreak >= 3) {
          return {
            type: "rain",
            titleEn: "Active Rain / Moisture Spell Alert",
            titleHi: "लगातार वर्षा व सीलन (Rain Spell) चेतावनी",
            durationDays: 4,
            severity: "warning",
            descriptionEn: "Consecutive wet days with heavy cloud cover and high humidity. Leaf wetness duration elevates fungal spore propagation.",
            descriptionHi: "लगातार बारिश व 80% से अधिक नमी से पत्तों पर सीलन बनी रहेगी, जिससे फफूंद व पत्ती धब्बा रोगों का प्रसार बढ़ सकता है।",
            actionEn: "Ensure field drainage is unobstructed and hold chemical sprays until leaves dry completely.",
            actionHi: "खेत से जल निकासी सुनिश्चित करें और पत्ते सूखने तक किसी भी दवा का स्प्रे रोकें।"
          };
        }
      } else {
        rainStreak = 0;
      }
    }

    return null;
  }, [fourteenDayStress]);

  // Voice narration helper using browser SpeechSynthesis
  const speakSummary = useCallback(() => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const langCode = (language || "en").toLowerCase();
    const primaryStress = (data as any)?.primary_stress || data?.model1_risk?.stress_type || "Thermal Heat Stress";
    const isDrought = primaryStress.toLowerCase().includes("drought");
    const isCane = (crop || "").toLowerCase().includes("sugarcane") || (crop || "").toLowerCase().includes("गन्ना");

    // Dynamic localized statement from backend pipeline supporting all 12 Indian languages
    const stmtKey = `statement_${langCode}`;
    const dynamicStatement = (data?.gemini_statement as any)?.[stmtKey] || data?.gemini_statement?.statement;

    const fallbackHi = isDrought
      ? `आपके ${acres} एकड़ ${crop} के खेत में सूखा तनाव का खतरा है। ${isCane ? "हल्की सिंचाई और सिंजेंटा इसाबियन" : "मृदा नमी संरक्षण और तनाव निवारक"} का प्रयोग करें।`
      : isCane
      ? `आपके ${acres} एकड़ गन्ना फसल में तनाव का जोखिम है। सिंजेंटा इसाबियन 400 मिली प्रति एकड़ शाम के समय छिड़काव करें।`
      : `आपके ${acres} एकड़ ${crop} के खेत में ${primaryStress} का जोखिम है। अनुशंसित बायोस्टिमुलेंट शाम 5 बजे के बाद छिड़काव करें।`;

    const fallbackEn = isDrought
      ? `Drought stress detected on your ${acres} acre ${crop} crop. ${isCane ? "Apply light irrigation and Syngenta Isabion" : "Conserve soil moisture and apply recommended anti-stress shield"}.`
      : isCane
      ? `Stress detected on your ${acres} acre sugarcane crop. Foliar spray of Syngenta Isabion at 400 ml per acre recommended in late evening.`
      : `${primaryStress} risk detected on your ${acres} acre ${crop} crop. Apply recommended foliar protectant in the late evening.`;

    const textToSpeak = dynamicStatement || (langCode === "hi" ? fallbackHi : fallbackEn);

    const speechLangMap: Record<string, string> = {
      hi: "hi-IN",
      mr: "mr-IN",
      pa: "pa-IN",
      gu: "gu-IN",
      te: "te-IN",
      ta: "ta-IN",
      kn: "kn-IN",
      ml: "ml-IN",
      bn: "bn-IN",
      or: "or-IN",
      as: "as-IN",
      en: "en-IN",
    };

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = speechLangMap[langCode] || "en-IN";
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  }, [data, isSpeaking, language, acres, crop]);

  const stopSpeaking = useCallback(() => {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => fetchPrediction(true),
    farmerName,
    farmName,
    crop,
    district,
    state,
    acres,
    growthStage,
    farms,
    activeFarm,
    selectFarm,
    fourteenDayStress,
    multiDayStress: fourteenDayStress,
    forecastDays,
    setForecastDays,
    activeSpell,
    soilFacts,
    speakSummary,
    stopSpeaking,
    isSpeaking,
  };
}

